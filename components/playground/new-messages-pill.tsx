"use client";
// STUB — Session C owns this file.
export interface NewMessagesPillProps { count: number; onClick: () => void; className?: string; }
export function NewMessagesPill({ count, onClick, className }: NewMessagesPillProps) { return count > 0 ? <button onClick={onClick} className={className}>{count} new</button> : null; }
