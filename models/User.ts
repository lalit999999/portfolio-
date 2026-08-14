import { Schema, model, models, type Model } from "mongoose";

export const USER_ROLES = ["admin", "visitor"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export interface IUser {
  githubId: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  profileUrl?: string;
  bio?: string;
  role: UserRole;
  isBanned: boolean;
  messageCount: number;
  lastMessageAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    githubId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    name: { type: String },
    avatarUrl: { type: String },
    profileUrl: { type: String },
    bio: { type: String },
    // role is set only in the NextAuth signIn callback from ADMIN_GITHUB_ID, never from client input.
    role: { type: String, enum: USER_ROLES, default: "visitor", index: true },
    isBanned: { type: Boolean, default: false },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export default (models.User as Model<IUser>) ||
  model<IUser>("User", UserSchema);
