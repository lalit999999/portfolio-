import { Schema, model, models, type Model } from "mongoose";

export interface IProfile {
  name: string;
  tagline: string;
  description: string[];
  avatarUrl?: string;
  location?: string;
  email?: string;
  resumeUrl?: string;
  currentlyLearning?: string[];
  availableForWork?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: [String], default: [] },
    avatarUrl: { type: String },
    location: { type: String },
    email: { type: String },
    resumeUrl: { type: String },
    currentlyLearning: { type: [String], default: [] },
    availableForWork: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (models.Profile as Model<IProfile>) ||
  model<IProfile>("Profile", ProfileSchema);
