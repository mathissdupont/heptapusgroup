# Heptapus Group çalışma planı

Kaynak: 3 Ekim 2026 tarihli “Panel hatalarını düzelt” görüşmesinde hazırlanan
altı aşamalı plan. Güncelleme: 4 Ekim 2026.

İşaretli maddeler kodda uygulanmıştır. Canlıya uygulama ve kullanıcı kabulü
ayrıca takip edilir; yerel test geçmesi canlı doğrulaması anlamına gelmez.

## Öncelik: canlıdaki hatalar

- [x] Kullanıcı eklerken P2011: eski `User.password` sütununun NOT NULL
  zorunluluğunu mevcut değerleri silmeden kaldıran koşullu migration.
- [x] Yeni ve eski şemada migration kontrolü; eski hata ve API üzerinden
  başarılı kullanıcı ekleme regresyon testi.
- [x] Docker `/app/.next/cache` dizinini uygulama kullanıcısına yazılabilir yap.
- [x] Bozuk `Next-Action: x` başlığını Next.js işlem çözümlemesinden önce 400 ile reddet.
- [x] Salt okunur migration / kolon teşhisi: `npm run db:check`.
- [ ] Canlı DB'deki sertifika / password migration kayıtlarını teşhis çıktısıyla doğrula.
- [ ] Yedek al, image build et, migration uygula, web servisini yenile.
- [ ] Canlıda kullanıcı ekleme, giriş ve resim yükleme/optimizasyonunu doğrula.

Dağıtım adımları: [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md#4-ekim-2026-kullanıcı-ekleme-ve-cache-düzeltmesi).

## 1. Panel hataları ve kullanılabilirlik

- [x] Subdomain API tür/build hataları için mevcut düzeltmeler.
- [x] Blog/ana sayfa Image importları ve contact/services TypeScript build düzeltmeleri.
- [x] Kullanıcı ekranında hata/başarı mesajları, çift işlem engeli ve mobil satırlar.
- [ ] Bütün CRUD ekranlarına ortak bildirim ve hata işleme uygula.
- [ ] Panelin bütün ekranlarını mobilde kontrol et; dialog klavye/fokus erişimini iyileştir.

## 2. Admin yönetimi

- [x] Dashboard: yayındaki/taslak projeler, medya, aktif aboneler, başvurular ve okunmamış mesajlar.
- [x] Okunamayan veriyi sıfır veya “her şey yolunda” olarak göstermeyi kaldır.
- [ ] Gerçek ziyaretçi ölçümü ve ilgili gizlilik/çerez davranışı.
- [x] Son hesap işlemleri; admin için filtreli ve sayfalı işlem geçmişi.
- [x] Hesap değişikliklerini işlemle aynı transaction'da kaydet; silinen hesapların geçmişini koru.
- [ ] İçerik, medya ve ayar CRUD işlemlerini de audit kapsamına al.
- [x] Rol kontrollü menü ve API; admin olmayanlara hesap geçmişi/sağlık verilerini kapat.
- [x] Yönetici tarafından şifre yenileme ve hesabı devre dışı bırakma/etkinleştirme.
- [x] Kullanıcılarda arama, rol/durum filtresi ve sayfalama.
- [ ] Diğer yönetim listelerinde ortak arama/filtre/sayfalama.

## 3. Güvenlik

- [x] Giriş ve hesap bazlı ortak PostgreSQL rate limit.
- [x] Başarılı/başarısız giriş kayıtları; şifre/token kaydetmeden audit.
- [x] Yeni şifrelerde minimum uzunluk ve bcrypt byte sınırı.
- [x] Çıkış, rol/şifre değişikliği ve hesap kapatma sonrası eski JWT'leri iptal et.
- [ ] 2FA kayıt, doğrulama, kurtarma kodları ve giriş akışı.
- [ ] Cihaz/oturum listesi ve seçili cihazın oturumunu kapatma.
- [x] Upload içerik/boyut kontrolü, güvenli dosya yolları ve erişim yetkisi.
- [x] API rol kontrolü, same-origin mutasyon kontrolü ve bounded body okuma.
- [x] Production bağımlılık düzeltmeleri; public kayıt kapalı; taslaklar public'e kapalı.
- [ ] Geliştirme bağımlılıklarının kalan advisory'lerini yamalı sürümlerle kapat.

## 4. İçerik yönetimi

- [ ] Zengin editör ve güvenli önizleme.
- [x] Blog/proje taslak durumları ve public görünürlük kontrolü.
- [ ] Otomatik taslak kaydetme / kaldığın yerden devam.
- [x] Gelecekteki publishedAt için public erişim filtresi.
- [ ] Panelde zamanlanmış yayın tarihini yönetme.
- [ ] İçerik bazında SEO başlık/açıklama/OG alanları ve metadata kullanımı.
- [ ] Çok dilli içerik akışını ekranlar arasında birleştir.
- [ ] Mevcut MediaPicker bileşenini ilgili bütün editörlere bağla.
- [ ] Çöp kutusu, geri alma ve kalıcı silme ayrımı.

## 5. Loglar, sağlık ve yedek

- [x] Panelden uygulama/error log okuma, metin filtresi ve otomatik yenileme.
- [ ] Tarih/seviye filtreleri ve geçmiş rotasyon dosyalarını seçme.
- [x] Uygulama ve Docker log rotasyonu.
- [x] DB erişimi, gerekli şema/kolonlar, yazılabilir upload dizini, boş disk ve uptime kontrolü.
- [ ] Kritik olaylar için e-posta uyarısı ve tekrar bildirim sınırı.
- [ ] Zamanlanmış DB/upload yedeği, son başarılı yedek bilgisi ve geri yükleme provası.

## 6. Ziyaretçi tarafı

- [ ] Proje ve hizmet sayfalarının içerik ve mobil deneyimini iyileştir.
- [ ] Blog araması ve kategori/etiket gezinme arayüzü.
- [ ] Referans ve başarı hikâyeleri akışı.
- [ ] İletişim formu başarı/hata ve takip deneyimi.
- [ ] Kariyer başvurularına durum/inceleme yönetimi.
- [x] Taslakları sitemap/detail/metadata'dan çıkarma ve temel SEO görünürlük düzeltmeleri.
- [ ] SEO, performans ve erişilebilirlik ölçümü; ölçülen sorunları giderme.

## Sıra ve kabul ölçütleri

1. Canlı kullanıcı ekleme/cache düzeltmesini deploy et; P2011/EACCES olmadan
   kullanıcı oluşturma, giriş ve resim gösterimini doğrula.
2. Ortak CRUD bildirimleri ve içerik audit kapsamını tamamla.
3. İçerik editörü, planlı yayın, SEO alanları ve çöp kutusunu tamamla.
4. Oturum listesi ve 2FA'yı test edilmiş kurtarma akışıyla tamamla.
5. Yedek/geri yükleme, uyarılar ve ziyaretçi geliştirmelerini tamamla.

Son yerel kontrol: 25 güvenlik/migration kontrolü geçti; Prisma şeması geçerli,
production build ve production smoke testi başarılı. Lint: 0 hata, mevcut
102 uyarı (çoğunlukla any türleri ve img kullanımı). Docker motoru bu bilgisayarda çalışmadığı için gerçek
image build ve Linux kullanıcısı ile cache yazma kontrolü sunucuda yapılmalıdır.
