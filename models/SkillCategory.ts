import { Schema, model, models, type Model } from "mongoose";

export interface ISkillCategory {
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillCategorySchema = new Schema<ISkillCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    iconName: { type: String },
    description: { type: String },
    order: { type: Number, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (models.SkillCategory as Model<ISkillCategory>) ||
  model<ISkillCategory>("SkillCategory", SkillCategorySchema);
