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
    <section className="group-cta py-20 border-t border-border">
      <div>
        <div className="max-w-3xl py-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">{description}</p>
          <Link
            href={buttonHref}
            className="group-primary-button"
          >
            {buttonText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
