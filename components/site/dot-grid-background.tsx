import { DotGrid } from "@/components/motion";

export function DotGridBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.15]"
    >
      <DotGrid gap={28} radius={120} dotSize={1.5} className="size-full" />
    </div>
  );
}
