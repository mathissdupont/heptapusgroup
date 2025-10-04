

import DecryptedText from "@/components/DecryptedText";
import GradualBlur from "@/components/GradualBlur";

// app/about/page.tsx
export const metadata = { title: "About | Heptapus" };


const t = {
  border: "rgba(255,255,255,.10)",
  muted: "#9fb0c3",
  text: "#e6edf3",
};

export default function AboutPage() {
  return (
    <section
      style={{
        maxWidth: 1120,
        width: "92%",
        margin: "0 auto",
        padding: "72px 0 96px",
        position: "relative", // GradualBlur overlay'leri için gerekli
      }}
    >
      {/* === TOP GRADUAL BLUR (sayfa scroll'unda kalkar) === */}


      {/* === LOGO + BAŞLIK === */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img
          src="/icons/heptapus_logo_white.png" // kendi yolun
          alt="Heptapus Logo"
          style={{
            width: 220,
            height: "auto",
            margin: "0 auto 10px",
            filter: "drop-shadow(0 6px 22px rgba(123,92,255,.28))",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
        <h1
          style={{
            margin: "8px 0 6px",
            color: t.text,
            letterSpacing: 0.3,
            textAlign: "center",
          }}
        >
          <DecryptedText
            text="Hakkımızda"
            animateOn="view"
            revealDirection="center"
            speed={80}
            characters="01#@$%&"
          />
        </h1>
        <p
          style={{
            color: t.muted,
            margin: "4px auto 16px",
            maxWidth: 860,
            lineHeight: 1.6,
            textAlign: "center",
            fontSize: "1.02rem",
          }}
        >
          <DecryptedText
            text="Yazılımdan donanıma, enerjiden yapay zekâya—geleceğin mühendislik ve teknoloji grubunu inşa ediyoruz."
            animateOn="view"
            revealDirection="center"
            speed={52}
          />
        </p>
      </div>

      {/* ince ayraç */}
      <div
        style={{
          width: "min(900px, 92%)",
          height: 1,
          margin: "10px auto 20px",
          background:
            "linear-gradient(90deg, transparent, rgba(124, 96, 255, 0.35), rgba(0, 200, 255, 0.28), transparent)",
          filter: "drop-shadow(0 0 6px rgba(124, 96, 255, .35))",
        }}
      />

      {/* === METİNLER (merkezlenmiş, doğal akış) === */}
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <p style={{ color: t.muted, lineHeight: 1.8, marginTop: 12 }}>
          <DecryptedText
            text="Heptapus; geleceğin mühendislik ve teknoloji grubu olma hedefiyle yola çıkan, farklı alanları tek bir çatı altında birleştiren bir topluluktur. Biz yalnızca bir yazılım ekibi değil, aynı zamanda donanım geliştirme, yapay zekâ, enerji sistemleri, finansal teknolojiler, siber güvenlik ve üretim tasarımı gibi geniş bir yelpazede faaliyet göstermeyi amaçlayan bir vizyon topluluğuyuz."
            animateOn="view"
            revealDirection="center"
            speed={48}
          />
        </p>

        <p style={{ color: t.muted, lineHeight: 1.8, marginTop: 14 }}>
          <DecryptedText
            text="Bugün ürün odaklı bir teknoloji takımı olarak çalışıyoruz; yarın ise farklı sektörlerde faaliyet gösteren şirketlerden oluşan bir Heptapus Grubu’na dönüşmeyi hedefliyoruz. Yazılım stüdyosundan donanım atölyelerine, araştırma merkezlerinden girişim kuluçkalarına kadar geniş bir ekosistem kurarak; inovasyonu, mühendisliği ve girişimciliği tek çatı altında toplamayı planlıyoruz."
            animateOn="view"
            revealDirection="start"
            speed={50}
          />
        </p>

        <p style={{ color: t.muted, lineHeight: 1.8, marginTop: 14 }}>
          <DecryptedText
            text="Heptapus’un uzun vadeli vizyonu; sürdürülebilir enerji, yapay zekâ, biyoteknoloji, dijital kimlik sistemleri ve akıllı altyapılar gibi stratejik alanlarda global ölçekte ürünler ve hizmetler sunmaktır. Amacımız, yerelden çıkan bir fikirle başlayan yolculuğumuzu uluslararası bir teknoloji ve mühendislik grubuna dönüştürmektir."
            animateOn="view"
            revealDirection="center"
            speed={55}
          />
        </p>

        <p style={{ color: t.muted, lineHeight: 1.8, marginTop: 14 }}>
          <DecryptedText
            text="Bugün attığımız her adım, yarının Heptapus Holding vizyonunun temelini atmaktadır. Bizim için mühendislik yalnızca ürün geliştirmek değil; aynı zamanda yeni değer zincirleri oluşturmak, farklı sektörleri bir araya getirmek ve toplumun geleceğini şekillendirmektir."
            animateOn="view"
            revealDirection="end"
            speed={58}
          />
        </p>

        {/* Kart Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
            gap: 18,
            marginTop: 28,
          }}
        >
          {[
            {
              h: "Misyon",
              p: "Disiplinler arası mühendislik yaklaşımıyla, farklı sektörlerde değer üreten ve sürdürülebilir çözümler sunan bir teknoloji grubu oluşturmak.",
            },
            {
              h: "Vizyon",
              p: "Yerelden küresele uzanan yolculukta; yazılım, donanım, yapay zekâ, enerji, finans ve üretim teknolojilerini tek çatı altında birleştiren bir holding olmak.",
            },
            {
              h: "Değerler",
              p: "İnovasyon, güven, açıklık, disiplinler arası işbirliği, sürdürülebilirlik, etik mühendislik ve global etki.",
            },
          ].map((x) => (
            <div
              key={x.h}
              style={{
                border: `1px solid ${t.border}`,
                borderRadius: 16,
                background:
                  "linear-gradient(180deg, rgba(17,24,42,.78) 0%, rgba(17,24,42,.64) 100%)",
                padding: 18,
                boxShadow: "0 8px 40px rgba(0,0,0,.28)",
                backdropFilter: "blur(4px)",
              }}
            >
              <h3 style={{ marginTop: 2, marginBottom: 8, color: t.text, textAlign: "center" }}>
                <DecryptedText text={x.h} animateOn="view" revealDirection="center" />
              </h3>
              <p style={{ color: t.muted, margin: 0, textAlign: "center", lineHeight: 1.7 }}>
                <DecryptedText text={x.p} animateOn="view" revealDirection="end" speed={60} />
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* === BOTTOM GRADUAL BLUR (sayfa scroll'unda kalkar) === */}

    </section>
  );
}
