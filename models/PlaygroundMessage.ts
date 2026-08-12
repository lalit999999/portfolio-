import { Schema, model, models, Types, type Model } from "mongoose";

export interface IPlaygroundMessage {
  author: Types.ObjectId;
  content: string;
  isPinned: boolean;
  isHidden: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PlaygroundMessageSchema = new Schema<IPlaygroundMessage>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: { type: String, required: true, trim: true, maxlength: 500 },
    isPinned: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false, index: true },
    editedAt: { type: Date },
  },
  { timestamps: true }
);

PlaygroundMessageSchema.index({ isHidden: 1, createdAt: -1 });

export default (models.PlaygroundMessage as Model<IPlaygroundMessage>) ||
  model<IPlaygroundMessage>("PlaygroundMessage", PlaygroundMessageSchema);
