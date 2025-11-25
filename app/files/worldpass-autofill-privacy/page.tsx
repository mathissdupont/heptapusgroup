import React from "react";

export default function PrivacyPolicy() {
  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "40px auto",
        fontFamily: "sans-serif",
        lineHeight: 1.6,
      }}
    >
      <h1>WorldPass Autofill – Gizlilik Politikası</h1>

      <p>
        WorldPass Autofill tarayıcı uzantısı, kullanıcılara web formlarını hızlı
        ve güvenli bir şekilde doldurma kolaylığı sağlamak için tasarlanmıştır.
        Uzantı, WorldPass hesabınızda bulunan profil bilgilerini yalnızca sizin
        talebiniz doğrultusunda form alanlarına yazmak için kullanır.
      </p>

      <h2>Toplanan Veriler</h2>
      <p>
        Uzantı kullanıcıdan herhangi bir kişisel veri toplamaz, saklamaz veya
        üçüncü taraflarla paylaşmaz. Kullanıcı verileri analiz, reklam, takip
        veya profil çıkarma amaçlı kullanılmaz.
      </p>

      <h2>Veri İşleme</h2>
      <p>
        Uzantı yalnızca aktif sekmede bulunan form alanlarını tespit eder ve
        doldurulacak alanları sizin seçiminizle işler. Bu işlem tamamen yerel
        (lokal) olarak tarayıcınız içinde gerçekleşir.
      </p>

      <h2>WorldPass Sunucuları ile İletişim</h2>
      <p>
        Uzantı sadece WorldPass hesabına giriş yapmış kullanıcının profil
        bilgilerini çekmek için WorldPass API’sine bağlanabilir. Bu bağlantı
        şifreli (HTTPS) olarak gerçekleşir ve veriler hiçbir zaman üçüncü
        taraflara gönderilmez.
      </p>

      <h2>İzinler</h2>
      <p>
        Uzantı, işlevini yerine getirmek için activeTab, tabs, storage ve host
        permissions gibi bazı izinlere ihtiyaç duyar. Bu izinler yalnızca form
        alanlarını algılamak ve otomatik doldurma işlevini sağlamak için
        kullanılır. Herhangi bir izleme, kayıt tutma veya reklam amacı yoktur.
      </p>

      <h2>Güncellemeler</h2>
      <p>
        Bu gizlilik politikası gerektiğinde güncellenebilir. Kullanıcılar
        değişiklikleri bu sayfadan takip edebilir.
      </p>
    </div>
  );
}
