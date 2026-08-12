import { Schema, model, models, type Model } from "mongoose";

export const CERT_COLORS = [
  "emerald",
  "blue",
  "purple",
  "amber",
  "rose",
  "cyan",
] as const;

export type CertColor = (typeof CERT_COLORS)[number];

export interface ICertification {
  title: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl?: string;
  skills: string[];
  color: CertColor;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CertificationSchema = new Schema<ICertification>(
  {
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date },
    credentialId: { type: String },
    credentialUrl: { type: String },
    imageUrl: { type: String },
    skills: { type: [String], default: [] },
    color: { type: String, enum: CERT_COLORS, default: "blue" },
    order: { type: Number, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (models.Certification as Model<ICertification>) ||
  model<ICertification>("Certification", CertificationSchema);
