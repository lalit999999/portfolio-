import { Schema, model, models, type Model } from "mongoose";

export interface IEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  grade?: string;
  description?: string;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    grade: { type: String },
    description: { type: String },
    order: { type: Number, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (models.Education as Model<IEducation>) ||
  model<IEducation>("Education", EducationSchema);
