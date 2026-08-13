// FROZEN — Phase 4 Step 0. All three sessions read this. Nobody edits it during Phase 4.
import "server-only";
import type { Model } from "mongoose";

import {
  BlogPost,
  BlogSource,
  Certification,
  Education,
  Project,
  Skill,
  SkillCategory,
  Social,
} from "@/models";
import type { AdminCollection } from "@/types/admin";

interface CollectionEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  tags: string[];
  label: string;
}

export const COLLECTION_REGISTRY: Record<AdminCollection, CollectionEntry> = {
  projects: { model: Project, tags: ["projects"], label: "Projects" },
  skills: { model: Skill, tags: ["skills"], label: "Skills" },
  skillcategories: {
    model: SkillCategory,
    tags: ["skillcategories", "skills"],
    label: "Skill categories",
  },
  certifications: {
    model: Certification,
    tags: ["certifications"],
    label: "Certifications",
  },
  educations: { model: Education, tags: ["educations"], label: "Education" },
  socials: { model: Social, tags: ["socials"], label: "Socials" },
  blogsources: {
    model: BlogSource,
    tags: ["blogsources"],
    label: "Blog sources",
  },
  blogposts: { model: BlogPost, tags: ["blogposts"], label: "Blog posts" },
};
