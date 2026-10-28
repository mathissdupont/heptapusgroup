import { Shield, Zap, Users, Globe } from "lucide-react";

const ICONS = [Shield, Zap, Users, Globe];

interface WhyChooseUsProps {
  t?: {
    title: string;
    items: { title: string; desc: string }[];
  };
}

export default function WhyChooseUs({ t }: WhyChooseUsProps) {
  const title = t?.title ?? "Why Heptapus Group?";
  const items = t?.items ?? [
    { title: "Proven Expertise", desc: "From embedded systems to cloud infrastructure, our team delivers robust engineering solutions across every layer of technology." },
    { title: "Rapid Innovation", desc: "We move from concept to prototype in weeks — not months. Our agile approach accelerates your time to market." },
    { title: "Dedicated Teams", desc: "Each sub-company operates with a focused team of domain specialists, ensuring deep expertise on every project." },
    { title: "Global Vision", desc: "Operating across software, hardware, energy, and AI sectors, we deliver solutions that scale internationally." },
  ];

  return (
    <section className="group-approach py-20 border-t border-border">
      <div>
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((f, i) => {
            const Icon = ICONS[i] || Shield;
            return (
              <div
                key={f.title}
                className="border-t border-border pt-6"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="division-index">0{i + 1}</span><Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.4} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
