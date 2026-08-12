import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { Skill, SkillCategory } from "@/models";
import type { SerializedSkill, SerializedSkillCategory } from "@/types/models";
import { serialize } from "./serialize";

export const getSkillsByCategory = unstable_cache(
  async (): Promise<
    (SerializedSkillCategory & { skills: SerializedSkill[] })[]
  > => {
    await dbConnect();
    const [categories, skills] = await Promise.all([
      SkillCategory.find({ isVisible: true }).sort({ order: 1 }).lean(),
      Skill.find({ isVisible: true }).sort({ order: 1 }).lean(),
    ]);

    return categories.map((category) => {
      const serializedCategory = serialize<SerializedSkillCategory>(category);
      return {
        ...serializedCategory,
        skills: serialize<SerializedSkill[]>(
          skills.filter(
            (skill) => String(skill.category) === String(category._id)
          )
        ),
      };
    });
  },
  ["skills-by-category"],
  { tags: ["skillcategories", "skills"], revalidate: 3600 }
);
