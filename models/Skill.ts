import { Schema, model, models, Types, type Model } from "mongoose";

export interface ISkill {
  name: string;
  category: Types.ObjectId;
  iconName?: string;
  brandSlug?: string;
  proficiency: number;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "SkillCategory",
      required: true,
      index: true,
    },
    iconName: { type: String },
    brandSlug: { type: String },
    proficiency: { type: Number, min: 0, max: 100, required: true },
    order: { type: Number, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (models.Skill as Model<ISkill>) ||
  model<ISkill>("Skill", SkillSchema);
