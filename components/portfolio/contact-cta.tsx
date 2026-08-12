import type { Route } from "next";
import Link from "next/link";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Magnetic, Shine } from "@/components/motion";
import { SectionHeading } from "@/components/portfolio/section-heading";

export function ContactCta() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:py-28">
      <SectionHeading
        eyebrow="Contact"
        title="Let's build something"
        description="Open to opportunities in AI engineering, backend development, and full-stack roles."
        align="center"
      />
      <div className="mt-8 flex justify-center">
        <Magnetic strength={10} radius={120}>
          <Button asChild size="lg" className="relative overflow-hidden">
            <Link href={"/contact" as Route}>
              <Send aria-hidden />
              Get in touch
              <Shine />
            </Link>
          </Button>
        </Magnetic>
      </div>
    </section>
  );
}
