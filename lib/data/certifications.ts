import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { Certification } from "@/models";
import { serialize } from "./serialize";

export const getCertifications = unstable_cache(
  async () => {
    await dbConnect();
    const docs = await Certification.find({ isVisible: true })
      .sort({ order: 1 })
      .lean();
    return serialize(docs);
  },
  ["certifications"],
  { tags: ["certifications"], revalidate: 3600 }
);
