# Gizlilik, çerez tercihleri ve mobil kullanım

29 Ekim 2026. Bu dosya teknik uygulama ve tamamlanması gereken gerçek bilgileri açıklar; hukuki uygunluk görüşü veya sertifikası değildir.

## Bu oturumda doğrulanan bilgiler

- Heptapus Group henüz şirket değil, proje/marka adı.
- Kullanıcı kişisel adının yayımlanmasını istemiyor. Ad veya adres uydurulmadı.
- KVKK iletişim adresi: contact@heptapusgroup.com.
- Uygulama sunucusu Hetzner'de Finlandiya'da.
- Mevcut sözleşme Hetzner DPA/AB standart sözleşmesi. Ayrı KVKK m.9 güvencesi veya Kuruma bildirimi teyit edilmedi.
- Veritabanı/yedek/felaket kurtarma kopyaları, posta hizmeti ve alt işleyen konumları ayrıca doğrulanmalı. Sunucunun ülkesi bütün sağlayıcıların ülkesi gibi gösterilmedi.

Heptapus Group adı tek başına, veri işleme amaç ve araçlarını belirleyen gerçek/tüzel kişinin yasal kimliğini karşılamaz. Bu konuyu şirketleşme ve gerçek işletim yapısıyla birlikte bir hukukçu çözmeli. Alan adının veya markanın kendisi ayrı bir tüzel kişi değildir. Sırf alan doldurmak için kişisel kimlik, şirket unvanı veya adres eklenmemeli.

## Mobil arayüz

- Alt site başlığında marka alanı küçülebilir; uzun slogan mobilde başlıktan kaldırılır.
- Dil sürümleri 44 piksel hedefli bir açılır menüdedir. Seçenekler dar ekranda yan yana sıkıştırılmaz.
- Tam masaüstü menü 1280 pikselden itibaren görünür; tablet/mobil menü kaydırılabilir, Escape ve sayfa değişimiyle kapanır.
- Dil menüsü dışarı tıklama ve Escape ile kapanır. Ana site dil seçicisinin dokunma alanları ve ekran kenarı konumu da iyileştirildi.
- Çerez bandı ve tercih penceresi dar ekran ve güvenli alanlara uyar; pencere kısa ekranda kaydırılabilir.

## Gerçek çerez tercihleri

`lib/cookie-preferences.ts` sürümlü tercih formatını tanımlar. `hepta.cookie-preferences.v1` localStorage anahtarı, gerekli depolama ve harici medya seçimi ile sürüm/kayıt/bitiş zamanını içerir. Süre 180 gündür; süresi geçmiş veya bozuk kayıt harici içeriği açmaz. Eski `cookie-consent=accepted` yeni amaçlar için izin kabul edilmez.

Ana sitede ve tüm alt sitelerde aynı arayüz bulunur; tercih kaydı origin'e özeldir. Bir alt sitenin seçimi diğerine taşınmaz. Oturum çerezi kapsamı ayrıca AUTH_COOKIE_DOMAIN dağıtım ayarına bağlıdır; tercih sistemi bu güvenlik ayarını genişletmez.

Kabul, isteğe bağlıları reddet ve tercihleri düzenle eşit görünürlüktedir. Kategori önceden seçili değildir. Her sayfada tekrar açma düğmesi bulunur. Diyaloğu kapatmak kabul sayılmaz. Depolama engellenirse güvenli varsayılan korunur ve seçim açık sayfada bellekte uygulanır; kullanıcıya kalıcı olmadığı belirtilir.

Kategoriler:

- Gerekli: yönetici oturumu; çerez tercihi; kullanıcının istediği dil/tema; aynı oturumda kapatılan duyuru. İsteğe bağlıları reddetmek admin oturumunu kapatmaz.
- Harici medya: YouTube/harici videolar. İzin öncesi oynatıcı ve üçüncü taraf önizleme yüklenmez. YouTube privacy-enhanced alan adı kullanılır; bu ad hiç veri işlenmediği iddiası değildir. İzin geri alınınca oynatıcı kaldırılır. Önceki veri transferi veya yabancı origin'deki çerezler geriye dönük silinemez.
- Analitik/reklam: kod incelemesinde kurulu izleme aracı bulunmadı. Kullanılmayan kategoriler için sahte aç/kapat düğmesi yoktur. Sonradan eklenecek araçlar kendiliğinden bu izne dayanamaz; ayrı amaç/envanter, ön yükleme engeli ve sürüm değerlendirmesi gerekir.

Bu uygulama anonim çerez tercihlerinin merkezi sunucu kanıt sicilini tutmaz; tarih ve sürüm ziyaretçinin tarayıcısındadır. Bunu değiştirilemez sunucu rıza kanıtı gibi sunmayın.

## Güvenlik doğrulaması ve formlar

Cloudflare Turnstile footer dahil otomatik yüklenmez. İlgili kişi açıklamadan sonra “Güvenlik doğrulamasını başlat” derse ortak script bir kez yüklenir. Dar alana sığan compact boyut kullanılır. Yükleme başarısızsa yeniden deneme/e-posta alternatifi gösterilir. Başlatma, yurt dışı aktarım için genel rıza olarak kullanılmaz. Cloudflare alıcısı ve veri akışı ayrıca değerlendirilmelidir.

İletişim ve kariyer formlarında veri alınırken kısa açıklama ve amaç bağlantısı bulunur. “Aydınlatmayı kabul ediyorum” şartı konmadı. Sözleşme öncesi talep, genel iletişim, güvenlik, iş başvurusu ve bültenin hukuki sebepleri aynı şey gibi yazılmadı.

Bülten ayrı ve varsayılan boş bir seçim ister. API `consent: true` ve güncel `newsletter-2026-10-29` sürümünü zorunlu kılar. Sunucu izin zamanını kendi saatiyle kaydeder; istemcinin tarihini kabul etmez. Yeni migration Subscriber tablosuna nullable consentAt/consentVersion ekler. Geçmiş kayıtlara hayalî izin eklenmez; admin listesinde kanıtı ayrıca incelenecekleri görünür. Mevcut eski aboneler otomatik silinmedi veya kapatılmadı. Gönderim öncesi bunların izin durumu ve uygulanabilir 6563/İYS yükümlülükleri ayrıca doğrulanmalı. Bu projede bülten gönderim servisi veya e-posta sahipliği doğrulama akışı eklenmedi.

## Hukuki sayfalar ve panel

`/privacy`, `/kvkk`, `/cookies`, `/consent`, `/terms` Türkçe/İngilizce/Almanca metin sunar. `?lang=tr|en|de` kalıcı dil seçer; HTML lang aynı dili izler. Alt siteler bu merkezi metinlere seçili dil ile bağlanır. Alt sitede aynı hukuki metinler çoğaltılmaz.

`/admin/legal` yalnızca ADMIN rolüyle düzenlenir. Yasal kimlik/adres, KVKK e-posta adresi, sunucu ve yedek konumu, aktarım değerlendirmesi, saklama/ayıklama düzeni ve her dilde ek açıklama buradan yönetilir. JSON, mevcut Setting tablosunda `legalSettings` anahtarında saklanır. Değişiklikler yeni istekte görünür; build gerekmez. Ek metinler Markdown'dur; ham HTML çalıştırılmaz.

Eksik kimlik/adres, yedek konumu, saklama düzeni veya doğrulanmış ayrı KVKK aktarım güvencesi varsa sayfalarda incelemenin tamamlanmadığı açıklanır; noindex ve sitemap dışı tutulur. Eksik bilgi doldurulduğunda teknik kontrol yalnızca alanların varlığını doğrular; hukuki uygunluk sertifikası üretmez. Kamuya açık her ek açıklamanın doğruluğunu yönetici sağlamalıdır.

Metinlerde kesin saklama süreleri, otomatik silme işi, tüm verinin Finlandiya'da kalması veya bütün alıcılarla KVKK standart sözleşmesi bulunduğu uydurulmadı. Yeni bir otomatik veri silme görevi kurulmadı ve mevcut kayıtlar üzerinde toplu silme çalıştırılmadı. Gerçek süre/ölçüt ve yedeklerden silinme düzeni belirlendikten sonra panelde açıklanmalı ve operasyonel olarak uygulanmalı.

## Yayın ve kontrol

Sunucuda güncel kodla `docker compose up -d --build --no-deps web`. Docker başlangıcı Prisma migration'larını otomatik uygular. Bu sürümdeki bülten API'si yeni kolonları gerektirir; veritabanı migration'ını atlamayın. Sonraki panel metin/tercih değişiklikleri build gerektirmez.

- `node scripts/test-security.mjs`: izole PostgreSQL motoru, gerçek migration ve API kontrolleri; gerçek DATABASE_URL kullanılmaz.
- `node scripts/smoke-production.mjs`: hazırlanmış standalone sunucuda auth, başlıklar ve statik dosyalar; erişilemeyen test DB URL'si kullanılır.
- `python scripts/test-privacy-ui.py`: Python Playwright + Chromium gerektirir. Derlenmiş uygulamayı yalnızca loopback adresinde sahte veri sağlayıcısıyla açar; gerçek veritabanı veya dış sağlayıcıya istek yapmaz. Mobil genişlikleri, dil seçimini, menüyü, izin öncesi yüklememe ve izni geri almayı kontrol eder. Test fixture'ı dağıtım uygulamasına eklenmez; yalnızca test sürecine geçici preload ile verilir.

## Dayanılan birincil kaynaklar

- [KVKK Çerez Rehberi](https://www.kvkk.gov.tr/Icerik/7353/Cerez-Uygulamalari-Hakkinda-Rehber): seçim ve geri alma yaklaşımı.
- [Aydınlatma Tebliği](https://www.kvkk.gov.tr/Icerik/4132/aydinlatma-yukumlulugunun-yerine-getirilmesinde-uyulacak-usul-ve-esaslar-hakkinda-teblig): kimlik, amaç, alıcı, yöntem/hukuki sebep ve haklar.
- [KVKK aydınlatma duyurusu](https://www.kvkk.gov.tr/Icerik/6765/AYDINLATMA-YUKUMLULUGUNUN-YERINE-GETIRILMESI-HAKKINDA-KAMUOYU-DUYURUSU): katmanlı açıklama ve rızayı ayrı tutma.
- [Veri sorumlusu kimdir?](https://www.kvkk.gov.tr/Icerik/2032/Veri-Sorumlusu-Kimdir): gerçek/tüzel kişi ayrımı.
- [Kişisel veri işleme şartları](https://www.kvkk.gov.tr/Icerik/2050/Kisisel-Veriler): KVKK m.5 şartları.
- [Yurt dışına aktarım](https://www.kvkk.gov.tr/Icerik/2053/Yurtdisina-Aktarim): güncel kademeli aktarım rejimi.
- [Standart sözleşme duyurusu](https://www.kvkk.gov.tr/Icerik/8170/Yurt-Disina-Kisisel-Veri-Aktariminda-Kullanilacak-Standart-Sozlesmelerde-Dikkat-Edilmesi-Gereken-Hususlara-Iliskin-Kamuoyu-Duyurusu): KVKK sözleşmeleri ve bildirim.
- [Başvuruların cevaplanması](https://www.kvkk.gov.tr/Icerik/2046/Ilgili-Kisiler-Tarafindan-Yapilan-Basvurularin-Cevaplanmasi-Yukumlulugu): başvuru süreleri.
- [Hetzner veri merkezleri](https://www.hetzner.com/unternehmen/rechenzentrum/): Finlandiya konumunun teyidi; kullanıcı sunucusu paneli görülmedi.
- [Cloudflare widget yapılandırması](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/): compact boyut ve istemci başlatma.
