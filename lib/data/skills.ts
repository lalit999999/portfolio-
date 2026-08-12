import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { Skill, SkillCategory } from "@/models";
import { serialize } from "./serialize";

export const getSkillsByCategory = unstable_cache(
  async () => {
    await dbConnect();
    const [categories, skills] = await Promise.all([
      SkillCategory.find({ isVisible: true }).sort({ order: 1 }).lean(),
      Skill.find({ isVisible: true }).sort({ order: 1 }).lean(),
    ]);

    return categories.map((category) => ({
      ...serialize(category),
      skills: serialize(
        skills.filter(
          (skill) => String(skill.category) === String(category._id)
        )
      ),
    }));
  },
  ["skills-by-category"],
  { tags: ["skillcategories", "skills"], revalidate: 3600 }
);
