import { Schema, model, models, type Model } from "mongoose";

export const BLOG_PLATFORMS = ["hashnode", "devto", "medium"] as const;

export type BlogPlatform = (typeof BLOG_PLATFORMS)[number];

export interface IBlogSource {
  platform: BlogPlatform;
  username: string;
  host?: string;
  name: string;
  isActive: boolean;
  lastSyncedAt?: Date;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSourceSchema = new Schema<IBlogSource>(
  {
    platform: { type: String, enum: BLOG_PLATFORMS, default: "hashnode" },
    username: { type: String, required: true },
    host: { type: String },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastSyncedAt: { type: Date },
    order: { type: Number, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (models.BlogSource as Model<IBlogSource>) ||
  model<IBlogSource>("BlogSource", BlogSourceSchema);
