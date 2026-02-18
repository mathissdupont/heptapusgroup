import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CtaBannerProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function CtaBanner({
  title = "Ready to Build the Future?",
  description = "Let's discuss how Heptapus Group can help bring your next project to life.",
  buttonText = "Get in Touch",
  buttonHref = "/contact",
}: CtaBannerProps) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl border border-border bg-card px-8 py-14 text-center shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">{description}</p>
          <Link
            href={buttonHref}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 font-semibold hover:opacity-90 transition-opacity shadow-sm"
          >
            {buttonText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
