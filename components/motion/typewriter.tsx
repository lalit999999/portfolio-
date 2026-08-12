"use client";
export interface TypewriterProps { text: string | string[]; prefix?: string; speed?: number; startDelay?: number; loop?: boolean; className?: string; cursorClassName?: string; }
export function Typewriter({ text, className }: TypewriterProps) { return <span className={className}>{Array.isArray(text) ? text[0] : text}</span>; }
