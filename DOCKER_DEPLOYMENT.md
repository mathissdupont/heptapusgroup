# 🚀 Heptapus Group — Self-Hosted Deployment Guide

Bu rehber, Heptapus Group web sitesini kendi sunucunuza Docker ile deploy etmenizi sağlar.  
Tüm veriler (PostgreSQL + dosya yüklemeleri) kalıcı Docker volume'larında saklanır.

---

## 📋 Gereksinimler

| Gereksinim | Minimum |
|---|---|
| VPS / Sunucu | Ubuntu 22.04+ veya Debian 12+ |
| RAM | 1 GB |
| Disk | 10 GB |
| Docker | 24.0+ |
| Docker Compose | v2.20+ |

---

## 1️⃣ Sunucu Hazırlığı

```bash
# Docker kur
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Oturumu kapat ve tekrar gir (docker grubu aktif olsun)

# Proje dosyalarını sunucuya aktar
git clone <repo-url> /var/www/heptapusgroup
cd /var/www/heptapusgroup
```

---

## 2️⃣ Environment Ayarları

```bash
cp .env.production.example .env
nano .env
```

Aşağıdaki değerleri doldurun:

```env
POSTGRES_USER=heptapus
POSTGRES_PASSWORD=GUCLU_BIR_SIFRE
POSTGRES_DB=heptapus
DATABASE_URL=postgresql://heptapus:GUCLU_BIR_SIFRE@db:5432/heptapus?schema=public
AUTH_SECRET=RASTGELE_BIR_SECRET
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_key
TURNSTILE_SECRET_KEY=your_secret
```

> 💡 `AUTH_SECRET` için: `openssl rand -base64 32`

---

## 3️⃣ Build & Başlat

```bash
# İlk kez — build et ve başlat
docker compose up -d --build

# Logları izle
docker compose logs -f web

# Durumu kontrol et
docker compose ps
```

Uygulama `http://sunucu-ip:3000` adresinde çalışacaktır.

---

## 4️⃣ Mevcut SQLite Verilerini Migrate Et

Eğer mevcut SQLite veritabanınız varsa (`prisma/dev.db`), verileri PostgreSQL'e aktarın:

```bash
# Gerekli npm paketlerini kur (sunucuda veya lokalde)
npm install better-sqlite3 pg

# SQLite dosyasının yolunu ayarla
# (dosya sunucudaysa doğrudan path ver, değilse SCP ile kopyala)
scp prisma/dev.db user@sunucu:/var/www/heptapusgroup/prisma/dev.db

# PostgreSQL'e migrate et (localhost:5432 üzerinden erişim, docker-compose'da port expose edilmiş)
cd /var/www/heptapusgroup
SQLITE_PATH=./prisma/dev.db \
PG_URL="postgresql://heptapus:GUCLU_BIR_SIFRE@localhost:5432/heptapus" \
node scripts/migrate-sqlite-to-pg.js
```

### Upload Dosyalarını Kopyala

Mevcut yüklenen dosyaları Docker volume'una kopyalayın:

```bash
# data/uploads/ dizinindeki dosyaları container'a kopyala
docker cp data/uploads/. heptapusgroup-web-1:/app/data/uploads/

# Veya public/uploads/ dizinindeki dosyaları da
docker cp public/uploads/. heptapusgroup-web-1:/app/data/uploads/
```

---

## 5️⃣ Nginx Reverse Proxy (HTTPS)

Domaini sunucuya yönlendirdikten sonra Nginx ile HTTPS kurun:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Nginx config: `/etc/nginx/sites-available/heptapusgroup`

```nginx
server {
    server_name heptapusgroup.com www.heptapusgroup.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/heptapusgroup /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL sertifikası al (otomatik)
sudo certbot --nginx -d heptapusgroup.com -d www.heptapusgroup.com
```

---

## 6️⃣ Güncelleme (Yeni Deploy)

```bash
cd /var/www/heptapusgroup
git pull origin main
docker compose up -d --build

# Prisma migration'ları otomatik olarak container başlarken çalışır
```

---

## 7️⃣ Faydalı Komutlar

```bash
# Container durumlarını göster
docker compose ps

# Web loglarını izle
docker compose logs -f web

# PostgreSQL'e bağlan
docker compose exec db psql -U heptapus -d heptapus

# Backup al
docker compose exec db pg_dump -U heptapus heptapus > backup_$(date +%Y%m%d).sql

# Backup'tan geri yükle
cat backup_20260201.sql | docker compose exec -T db psql -U heptapus -d heptapus

# Upload volume'unu yedekle
docker run --rm -v heptapusgroup_uploads_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads_backup_$(date +%Y%m%d).tar.gz -C /data .

# Container'ları durdur
docker compose down

# Container'ları VERİLERLE BERABER sil (DİKKAT!)
docker compose down -v
```

---

## 8️⃣ Otomatik Backup (Cron)

```bash
crontab -e
```

Ekleyin:
```cron
# Her gün saat 03:00'da PostgreSQL backup al
0 3 * * * cd /var/www/heptapusgroup && docker compose exec -T db pg_dump -U heptapus heptapus | gzip > /var/backups/heptapus/db_$(date +\%Y\%m\%d).sql.gz

# 30 günden eski backup'ları sil
0 4 * * * find /var/backups/heptapus/ -name "*.sql.gz" -mtime +30 -delete
```

```bash
sudo mkdir -p /var/backups/heptapus
```

---

## 🏗 Mimari

```
┌──────────────────────────────────────────┐
│              Nginx (443/80)              │
│         SSL + Reverse Proxy              │
└──────────────┬───────────────────────────┘
               │
┌──────────────▼───────────────────────────┐
│         Docker Compose                    │
│                                           │
│   ┌───────────────┐  ┌────────────────┐  │
│   │   web:3000    │  │    db:5432     │  │
│   │   Next.js     │──│  PostgreSQL 16 │  │
│   │  (standalone) │  │   (Alpine)     │  │
│   └───────┬───────┘  └───────┬────────┘  │
│           │                  │            │
│   ┌───────▼───────┐  ┌──────▼────────┐  │
│   │ uploads_data  │  │   pg_data     │  │
│   │  (volume)     │  │   (volume)    │  │
│   └───────────────┘  └──────────────-┘  │
└──────────────────────────────────────────┘
```

---

## ⚠️ Önemli Notlar

- **İlk deploy'dan sonra** `.env` dosyasındaki `POSTGRES_PASSWORD` değiştirmek PostgreSQL'i bozar. Şifre değiştirmek için önce `docker compose exec db psql -U heptapus -c "ALTER USER heptapus PASSWORD 'yeni_sifre';"` çalıştırın.
- **Volume'ları silmek** (`docker compose down -v`) tüm verileri siler. Dikkatli olun!
- PostgreSQL portu (5432) sadece `127.0.0.1`'den erişime açıktır. Dışarıdan erişim yoktur.
- Container'lar `unless-stopped` politikasıyla çalışır, sunucu restart'ında otomatik başlar.
