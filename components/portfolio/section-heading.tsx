export interface SectionHeadingProps { eyebrow?: string; title: string; description?: string; align?: "left" | "center"; className?: string; }
export function SectionHeading({ title, className }: SectionHeadingProps) { return <h2 className={className}>{title}</h2>; }
