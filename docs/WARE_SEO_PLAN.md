# HeptaWare: SEO ve AI arama çalışması

28 Ekim 2026. Hedef site: https://ware.heptapusgroup.com.
Bu dosya uygulama ve yayın sonrası takip planıdır; sıralama taahhüdü değildir.

## Canlı incelemenin sonucu

Mevcut içerik İngilizce. Hizmetler gerçekten tanımlanmış; proje portföyü mevcut.
`/services` başlığı `Services | HeptaWare | HeptaWare` olarak tekrarlanıyordu.
İncelenen ana sayfa, hizmetler ve hakkımızda sayfasında canonical ve JSON-LD yoktu.
`/home` aynı Ware alan adında grup ana sayfasını sunuyordu.
robots.txt ve Ware'a özel sitemap.xml zaten erişilebilirdi.

## Kodda yapılanlar

- Sayfaya ve alan adına özel canonical, başlık, açıklama, Open Graph ve Twitter bilgileri.
- Admin → Subdomains → Ware → SEO / Paylaşım: ana sayfa başlığı, açıklama ve paylaşım görseli.
- Sayfa dili, HTML lang ve yapılandırılmış veri dili markanın admin panelindeki site dilinden okunur.
- Ana dil mevcut adreslerde, Türkçe sürüm `/tr` altında yayımlanır. Admin → Dil sürümleri bölümünde ayrı içerik, SEO, hizmet ve projeler yönetilir. Yalnızca yayımlanmış ve gerçekten var olan karşılıklar karşılıklı hreflang ve sitemap alternates alır. Dil seçimi URL'de kalır; çerez veya tarayıcı diline göre aynı URL'nin içeriği değiştirilmez. Taslak diller dışarı sızmaz. Boş hizmet/proje listeleri indekse ve sitemap'e alınmaz.
- Organization + WebSite kimliği, WebPage/AboutPage/ContactPage, Service, proje CreativeWork ve BreadcrumbList verileri. Yalnızca mevcut içerik kullanılır; puan, müşteri sayısı, adres veya başarı iddiası üretilmez.
- Hizmet adresi ve Markdown detay içeriği birlikte girilirse `/services/<slug>` oluşur. Hizmet listesi, ana sayfa ve grup hizmet kataloğu bu sayfaya bağlanır; site haritasına eklenir. İki alanı da doldurmak içeriği yayımlar. Boş detaydan sayfa üretilmez.
- Taslak projeler site haritasına ve kamuya açık içeriğe alınmaz.
- Ware `/home` kalıcı olarak Ware `/` adresine yönlenir. Grup blogu, ekip ve yasal sayfalar grup alan adına yönlenir.
- Yönetim, API ve giriş sayfaları için noindex HTTP başlığı; robots.txt özel alanları taramaya kapatır.

Mevcut JSON ayarları kullanılır; yeni migration gerekmez. Bu özelliklerin sunucuya alınması için bir Docker build gerekir. Sonraki SEO ve hizmet içeriği değişiklikleri kaydetmeyle uygulanır; yeniden build gerekmez. Arama sonuçlarının güncellenmesi yeniden taramaya bağlıdır.

## Arama hedefleri ve içerik önceliği

Hedef hem Türkiye hem uluslararası pazar. Mevcut İngilizce sayfalar korunur; Türkçe içerik kalıcı `/tr` adreslerinde yönetilir. Aşağıdakiler canlıdaki gerçek altı hizmetten türetilen başlangıç hedefleridir; arama hacmi veya rekabet ölçümü yapılmış değildir. Search Console verisine göre daraltılmalıdır.

| Öncelik | Mevcut hizmet | Önerilen sayfa adresi | İlk arama hedefi |
| --- | --- | --- | --- |
| 1 | Custom Software & SaaS Development | custom-software-saas-development | custom software development, SaaS development services |
| 1 | API Development & System Integration | api-development-system-integration | API development services, system integration services |
| 2 | Web Platforms & CMS Solutions | web-platforms-cms | custom web application development, CMS development |
| 2 | Software Architecture & IT Consulting | software-architecture-consulting | software architecture consulting |
| 3 | Cloud Infrastructure & DevOps | cloud-devops | Docker deployment services, DevOps consulting |
| 3 | Software Maintenance & Modernization | software-maintenance-modernization | software modernization services, software maintenance |

`software` tek başına çok geniş ve niyeti belirsizdir. İlk ölçüm hedefi doğru müşterinin aradığı hizmet sorguları, nitelikli iletişim talepleri ve marka aramalarıdır. Türkçe başlangıç hedefleri: özel yazılım geliştirme, SaaS geliştirme, API entegrasyonu, sistem entegrasyonu ve yazılım modernizasyonu. TR/EN sayfaları bu ihtiyaçları kendi dillerinde açıklamalı; aynı İngilizce sayfaya sahte tr/en hreflang eklenmez. Ana dili yayından sonra değiştirmek mevcut adreslerdeki içerik dilini değiştirir; normal kullanımda İngilizce ana dili koruyup Türkçeyi ayrı sürüm olarak yönetin.

### Hazırlanan Türkçe taslak

`docs/ware-tr-draft.json`, canlıdaki hizmet kapsamına dayanan Türkçe ana sayfa/hakkımızda metni, altı hizmet açıklaması ve iki öncelikli hizmetin detay içeriğini içerir. Müşteri, süre, fiyat veya başarı metriği eklenmedi. Projeler çevrilmiş gibi sunulmaz; Türkçe proje listesi başlangıçta boştur.

Panel → Ware → Dil sürümleri → Türkçe → JSON taslağı yükle bölümünden bu dosya seçilebilir. İçe aktarma formu doldurur ve taslak durumuna alır; kaydetmeden sunucuya yazmaz. Metinleri gözden geçirip düzenleyin, ardından dil sürümünü yayına alın ve Kaydet'e basın. Dil yayımlandığında `/tr`, `/tr/about`, `/tr/contact`, `/tr/services` ve içerikli iki hizmet adresi görünür. İngilizce hizmet detaylarına aynı slug girildiğinde karşılıklı hreflang otomatik oluşur. Türkçe projeler eklendikçe kendi URL'leri ayrıca sitemap'e girer.

Ana sayfa SEO alanı için mevcut hizmetlere dayanan öneri:

- Başlık: `HeptaWare | Custom Software & SaaS Development`
- Açıklama: `Custom software, SaaS platforms and API integrations by HeptaWare. Explore our projects and discuss your software requirements with our team.`

Bu öneriler canlı veritabanına yazılmadı. Mevcut açıklamalar otomatik başlangıç sağlar; yukarıdaki metinler panelden düzenlenebilir.

## Hizmet ve vaka içeriğinin hazırlanması

Önce iki öncelikli hizmeti tamamlayın. Her hizmet sayfasında hedef müşteri ve gerçek sorun, teslim edilen işler, kapsam dışında kalan işler, çalışma süreci, bakım yaklaşımı ve ilgili gerçek proje bağlantısı yer alsın. İnsanların teklif öncesi sorduğu soruları somut yanıtlayın. Metinleri ekipten işi yapan kişi gözden geçirsin. Kelime sayısı doldurmak için içerik eklemeyin.

Canlı portföyde görülen HeptaCert, HitTheBlaze, Akdeniz Boğaziçi Koleji, Agencytic ve Agandle için uygun ve paylaşılabilir olanlardan vaka çalışmaları hazırlayın. Her vaka: problem → HeptaWare'ın rolü → uygulanan çözüm → doğrulanabilir sonuç → mevcut durum. İzin gerektiren müşteri bilgilerini doğrulayın. Agandle mevcut metinde geliştirme aşamasında; tamamlanmış ürün veya gerçek para işlem sistemi gibi sunmayın. Sayısal sonuç yoksa uydurmayın. Hizmet ve ilgili vaka birbirine bağlantı versin.

## Yayın sonrası yapılacak işler

1. Güncel kodu sunucuya alıp `docker compose up -d --build --no-deps web` çalıştırın.
2. `node scripts/audit-seo.mjs https://ware.heptapusgroup.com` ile her sitemap sayfasının HTTP durumu, title, description, canonical, H1, index durumu ve JSON-LD'sini kontrol edin. Bu araç teknik kontrol yapar; sıralama veya tam robots uyumluluğu ölçmez.
3. Google Search Console'da alan adı mülkünü DNS ile doğrulayın. Ware URL-prefix mülküyle alt siteyi ayrıca izleyin. `https://ware.heptapusgroup.com/sitemap.xml` gönderin. Ana sayfa ve öncelikli hizmetleri URL Inspection ile kontrol edin. Search generative AI görünürlük kontrolünün etkinliğini hesapta doğrulayın.
4. Bing Webmaster Tools doğrulaması ve aynı sitemap gönderimi. Sunucu/CDN/WAF üzerinde Googlebot, Bingbot ve OAI-SearchBot erişimini günlüklerden kontrol edin; robots izni tek başına firewall engelini kaldırmaz. Kimlik doğrulamasız sahte User-Agent taleplerini güvenilir bot kabul etmeyin.
5. Google Rich Results Test / Schema Markup Validator ile sayfaları kontrol edin. Service veya CreativeWork eklemek özel bir Google zengin sonuç görünümü garantilemez.
6. PageSpeed Insights ile mobil LCP/INP/CLS başlangıç ölçümünü kaydedin. Bu çalışmada canlı Core Web Vitals ölçümü yapılmadı; görsel boyutları ve hosting gecikmesi ölçüme göre iyileştirilmeli.
7. Gerçek şirket profillerindeki Ware bağlantılarını ve grup sitesindeki bağlantıları tutarlı hale getirin. Satın alınmış link, toplu dizin veya sahte AI önerisi çalışması yapmayın.

## İlk 90 gün

- İlk hafta: teknik yayını doğrulama, Search Console/Bing kurulumu ve başlangıç ölçümü.
- 2–4. haftalar: iki öncelikli hizmet sayfası ve paylaşılabilir gerçek bir vaka çalışması.
- 2. ay: kalan hizmetleri gerçek içerikle tamamlama; ekibin deneyiminden bir veya iki teknik rehber. Ware şu anda bağımsız bir bloga sahip değil; grup blogu Ware alan adında çoğaltılmaz. Ware rehberi gerekiyorsa ayrı yayın yapısı tasarlanmalı.
- 3. ay: sorgu ve dönüşüm verisine göre başlıkları, içerikleri ve iç bağlantıları iyileştirme.

Haftalık takip: indekslenen uygun sayfalar, dışlanan sayfa nedenleri, markalı/markasız gösterim ve tıklamalar, sorgu–sayfa eşleşmeleri, nitelikli iletişim talepleri. Dönüşüm analitiği kurulmamışsa önce mevcut izin/çerez yaklaşımıyla uyumlu ölçüm kurulmalı. AI yönlendirmeleri referrer verisinde göründüğü ölçüde ayrıca izlenebilir; görünmeyen alıntılar için tam kapsama iddiasında bulunmayın. Genel `software` sıralaması tek başarı metriği olmasın.

## Kaynak ve yaklaşım

- Google: https://developers.google.com/search/docs/appearance/ai-features
- Google güncel AI arama rehberi: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Bing: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a
- OpenAI arama tarayıcısı: https://developers.openai.com/api/docs/bots

Google, AI arama görünürlüğü için standart SEO, faydalı özgün içerik, erişilebilir metin ve görünür içerikle uyumlu veriyi önerir. Özel AI metin dosyası veya yeni bir schema türü gerekmiyor. OAI-SearchBot arama içindir; GPTBot eğitim kontrolünden ayrıdır. Mevcut wildcard robots kuralı kamuya açık sayfaları zaten taramaya açar; eğitim politikası bu değişiklikte değiştirilmedi. SEO sıralamayı, AI optimizasyonu da alıntılanmayı garanti etmez.
