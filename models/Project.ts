import { Schema, model, models, type Model } from "mongoose";

export interface IProject {
  title: string;
  slug: string;
  summary: string;
  description: string;
  tech: string[];
  category?: string;
  imageUrl?: string;
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  viewCount: number;
  startDate?: Date;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    tech: { type: [String], default: [] },
    category: { type: String },
    imageUrl: { type: String },
    githubUrl: { type: String },
    liveUrl: { type: String },
    featured: { type: Boolean, default: false, index: true },
    viewCount: { type: Number, default: 0 },
    startDate: { type: Date },
    order: { type: Number, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ title: "text", summary: "text", tech: "text" });

export default (models.Project as Model<IProject>) ||
  model<IProject>("Project", ProjectSchema);
