export const metadata = {
  title: "Contact | Heptapus",
};
import SplashCursor from "@/components/SplashCursor";

import ContactForm from "./ContactForm";

<SplashCursor />
export default function ContactPage() {
  return (
    <section style={{ maxWidth: 1120, width: "92%", margin: "0 auto", padding: "56px 0" }}>

 

      <ContactForm />

      <div style={{ marginTop: 24, color: "#9fb0c3" }}>
        <div>
          E-posta:{" "}
          <a href="mailto:contact@heptapusgroup.com" style={{ color: "#e6edf3" }}>
            contact@heptapusgroup.com
          </a>
        </div>
        <div>
          GitHub:{" "}
          <a href="https://github.com/heptapusgroup" target="_blank" rel="noreferrer" style={{ color: "#e6edf3" }}>
            github.com/heptapus
          </a>
        </div>
      </div>
    </section>
  );
}
