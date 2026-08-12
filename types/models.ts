import type { CertColor } from "@/models/Certification";
import type { BlogPlatform } from "@/models/BlogSource";
import type { UserRole } from "@/models/User";

export type { CertColor, BlogPlatform, UserRole };

export interface SerializedProfile {
  _id: string;
  name: string;
  tagline: string;
  description: string[];
  avatarUrl?: string;
  location?: string;
  email?: string;
  resumeUrl?: string;
  currentlyLearning?: string[];
  availableForWork?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedEducation {
  _id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  grade?: string;
  description?: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedSkillCategory {
  _id: string;
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedSkill {
  _id: string;
  name: string;
  category: string;
  iconName?: string;
  brandSlug?: string;
  proficiency: number;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedProject {
  _id: string;
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
  startDate?: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedCertification {
  _id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl?: string;
  skills: string[];
  color: CertColor;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedSocial {
  _id: string;
  name: string;
  url: string;
  iconName?: string;
  handle?: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedBlogSource {
  _id: string;
  platform: BlogPlatform;
  username: string;
  host?: string;
  name: string;
  isActive: boolean;
  lastSyncedAt?: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedBlogPost {
  _id: string;
  source: string;
  externalId: string;
  title: string;
  brief?: string;
  slug: string;
  url: string;
  coverImage?: string;
  tags: string[];
  readTimeMinutes?: number;
  publishedAt: string;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedUser {
  _id: string;
  githubId: string;
  username: string;
  name?: string;
  avatarUrl?: string;
  profileUrl?: string;
  bio?: string;
  role: UserRole;
  isBanned: boolean;
  messageCount: number;
  lastMessageAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedPlaygroundMessage {
  _id: string;
  author: string;
  content: string;
  isPinned: boolean;
  isHidden: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiOk<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErr {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
}

export type ApiResponse<T> = ApiOk<T> | ApiErr;
