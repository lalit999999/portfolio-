import { Schema, model, models, Types, type Model } from "mongoose";

export interface IBlogPost {
  source: Types.ObjectId;
  externalId: string;
  title: string;
  brief?: string;
  slug: string;
  url: string;
  coverImage?: string;
  tags: string[];
  readTimeMinutes?: number;
  publishedAt: Date;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    source: {
      type: Schema.Types.ObjectId,
      ref: "BlogSource",
      required: true,
      index: true,
    },
    externalId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    brief: { type: String },
    slug: { type: String, required: true },
    url: { type: String, required: true },
    coverImage: { type: String },
    tags: { type: [String], default: [] },
    readTimeMinutes: { type: Number },
    publishedAt: { type: Date, required: true, index: -1 },
    order: { type: Number, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (models.BlogPost as Model<IBlogPost>) ||
  model<IBlogPost>("BlogPost", BlogPostSchema);
