import { Schema, model, models, type Model } from "mongoose";

export interface ISocial {
  name: string;
  url: string;
  iconName?: string;
  handle?: string;
  order: number;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SocialSchema = new Schema<ISocial>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    iconName: { type: String },
    handle: { type: String },
    order: { type: Number, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (models.Social as Model<ISocial>) ||
  model<ISocial>("Social", SocialSchema);
