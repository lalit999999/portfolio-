import { Schema, model, models, type Model } from "mongoose";

export interface IMessage {
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  ipHash?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true, maxlength: 100 },
    email: { type: String, required: true, maxlength: 200 },
    subject: { type: String, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    isRead: { type: Boolean, default: false, index: true },
    isArchived: { type: Boolean, default: false },
    ipHash: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default (models.Message as Model<IMessage>) ||
  model<IMessage>("Message", MessageSchema);
