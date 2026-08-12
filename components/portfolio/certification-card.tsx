"use client";
import type { SerializedCertification } from "@/types/models";
export interface CertificationCardProps { certification: SerializedCertification; index?: number; className?: string; }
export function CertificationCard({ certification, className }: CertificationCardProps) { return <div className={className}>{certification.title}</div>; }
