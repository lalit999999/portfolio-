import type { ReactNode } from "react";
import {
  CountUp,
  DotGrid,
  Magnetic,
  Orbit,
  Reveal,
  ScrollProgress,
  Shine,
  SpotlightCard,
  Stagger,
  StaggerItem,
  Tilt,
  Typewriter,
} from "@/components/motion";
import { getIcon } from "@/lib/icons";

// Dev-only verification harness for every components/motion/* primitive.
// Not linked from the real nav. Delete this route before the Phase 5 deploy.
export const dynamic = "force-static";

function Label({ children }: { children: string }) {
  return (
    <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">{children}</p>
  );
}

function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={`mx-auto max-w-5xl px-6 py-24 ${className ?? ""}`}>{children}</section>;
}

const ORBIT_ICON_NAMES = ["Code2", "Database", "Globe", "GitBranch", "Cpu", "Cloud"];

export default function MotionLabPage() {
  const orbitItems = ORBIT_ICON_NAMES.map((name) => {
    const Icon = getIcon(name);
    return {
      id: name,
      node: (
        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-md">
          <Icon className="size-5 text-primary" aria-hidden />
        </div>
      ),
    };
  });

  return (
    <main className="min-h-screen bg-background pb-32 text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="relative mx-auto flex h-14 max-w-5xl items-center px-6">
          <p className="font-heading text-sm font-medium">motion-lab</p>
          <ScrollProgress />
        </div>
      </header>

      <Section className="pt-20">
        <Label>Typewriter</Label>
        <h1 className="font-heading text-4xl font-semibold">
          <Typewriter prefix="$ " text="building things that move." speed={45} />
        </h1>
        <p className="mt-6 font-heading text-2xl">
          <Typewriter
            text={["full-stack developer", "motion enthusiast", "accessibility-minded"]}
            loop
            speed={40}
          />
        </p>
      </Section>

      <Section>
        <Label>Reveal — defaults</Label>
        <Reveal>
          <div className="rounded-xl border border-border bg-card p-6">Fades up 20px on scroll into view.</div>
        </Reveal>
      </Section>

      <Section>
        <Label>Reveal — blur + delay + as=&quot;article&quot;</Label>
        <Reveal as="article" blur delay={0.15} y={32}>
          <div className="rounded-xl border border-border bg-card p-6">
            Fades up with a blur(10px)→blur(0) sweep and a 150ms delay.
          </div>
        </Reveal>
      </Section>

      <Section>
        <Label>Stagger + StaggerItem (nested one level deep)</Label>
        <Stagger as="section" gap={0.08} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              {/* StaggerItem sits inside a plain wrapper div, not as a direct child of Stagger */}
              <StaggerItem className="rounded-xl border border-border bg-card p-6 text-center font-mono text-sm">
                item {i + 1}
              </StaggerItem>
            </div>
          ))}
        </Stagger>
      </Section>

      <Section>
        <Label>Magnetic</Label>
        <Magnetic strength={12} radius={120}>
          <button className="rounded-xl border border-border bg-primary px-6 py-3 font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            Hover near me
          </button>
        </Magnetic>
      </Section>

      <Section>
        <Label>Shine (parent needs relative overflow-hidden group)</Label>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-8">
          <p>Hover this card to see the sweep.</p>
          <Shine />
        </div>
      </Section>

      <Section>
        <Label>Tilt</Label>
        <Tilt max={14} className="w-64">
          <div className="rounded-xl border border-border bg-card p-8 shadow-lg">
            Pointer-driven 3D tilt. Bypassed on touch devices.
          </div>
        </Tilt>
      </Section>

      <Section>
        <Label>SpotlightCard — grid (stagger + spotlight + beam + lift together)</Label>
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {["Cursor spotlight", "Border beam", "Hover lift"].map((title, i) => (
            <div key={title}>
              <StaggerItem>
                <SpotlightCard delay={i * 0.08} className="h-40 p-6">
                  <h3 className="font-heading text-lg font-medium">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Move your cursor over this card.</p>
                </SpotlightCard>
              </StaggerItem>
            </div>
          ))}
        </Stagger>
      </Section>

      <Section>
        <Label>SpotlightCard — beam off / lift off</Label>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SpotlightCard beam={false} className="h-32 p-6">
            beam=false
          </SpotlightCard>
          <SpotlightCard lift={false} className="h-32 p-6">
            lift=false
          </SpotlightCard>
        </div>
      </Section>

      <Section>
        <Label>DotGrid</Label>
        <div className="relative h-64 overflow-hidden rounded-xl border border-border bg-card">
          <DotGrid gap={28} radius={140} />
          <div className="relative flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Move your cursor over this box.</p>
          </div>
        </div>
      </Section>

      <Section>
        <Label>Orbit</Label>
        <div className="relative mx-auto h-80 w-80">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              hub
            </div>
          </div>
          <Orbit items={orbitItems} radius={130} duration={20} counterRotate />
        </div>
      </Section>

      <Section>
        <Label>Orbit — reversed, no counter-rotate</Label>
        <div className="relative mx-auto h-64 w-64">
          <Orbit items={orbitItems.slice(0, 4)} radius={100} duration={14} reverse counterRotate={false} />
        </div>
      </Section>

      <Section>
        <Label>CountUp</Label>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-heading text-4xl font-semibold">
              <CountUp to={42} />
            </p>
            <p className="text-sm text-muted-foreground">projects</p>
          </div>
          <div>
            <p className="font-heading text-4xl font-semibold">
              <CountUp to={128} suffix="k" />
            </p>
            <p className="text-sm text-muted-foreground">lines shipped</p>
          </div>
          <div>
            <p className="font-heading text-4xl font-semibold">
              <CountUp to={99} suffix="%" duration={2} />
            </p>
            <p className="text-sm text-muted-foreground">uptime</p>
          </div>
        </div>
      </Section>

      <Section className="h-[60vh]">
        <Label>Scroll space</Label>
        <p className="text-muted-foreground">
          Extra height so ScrollProgress in the header bar and the Reveal sections above have room to be
          tested by scrolling from top to bottom.
        </p>
      </Section>
    </main>
  );
}
