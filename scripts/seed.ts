/**
 * Reads scripts/seed-data/*.json (written by scripts/extract.ts) and upserts
 * them into Atlas via the models/ + lib/validators/ Session B wrote.
 *
 * Usage:
 *   npx tsx scripts/seed.ts             upsert only, never deletes
 *   npx tsx scripts/seed.ts --fresh     deleteMany() every seeded collection first
 */
import dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";
import readline from "node:readline/promises";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import dbConnect from "@/lib/db";
import {
  Profile,
  Education,
  SkillCategory,
  Skill,
  Project,
  Certification,
  Social,
  BlogSource,
} from "@/models";
import {
  profileCreateSchema,
  educationCreateSchema,
  skillCategoryCreateSchema,
  skillCreateSchema,
  projectCreateSchema,
  certificationCreateSchema,
  socialCreateSchema,
  blogSourceCreateSchema,
} from "@/lib/validators";

const SEED_DIR = path.resolve(__dirname, "seed-data");
const FRESH = process.argv.includes("--fresh");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), "utf-8"));
}

async function confirmFreshRun(mongodbUri: string) {
  let host: string;
  try {
    host = new URL(mongodbUri).host;
  } catch {
    throw new Error(`Could not parse host from MONGODB_URI: ${mongodbUri}`);
  }

  console.log(`\n--fresh will DELETE ALL seeded documents on host: ${host}`);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question('Type "yes" to continue: ');
  rl.close();

  if (answer.trim() !== "yes") {
    console.error("Aborted: confirmation not given.");
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// 1. Load JSON
// ---------------------------------------------------------------------------

const profileData = readJson<any>("profile.json");
const educationData = readJson<any[]>("education.json");
const skillCategoryData = readJson<any[]>("skill-categories.json");
const skillData = readJson<any[]>("skills.json");
const projectData = readJson<any[]>("projects.json");
const certificationData = readJson<any[]>("certifications.json");
const socialData = readJson<any[]>("socials.json");
const blogSourceData = readJson<any[]>("blog-sources.json");

// ---------------------------------------------------------------------------
// 2. Validate everything BEFORE any write. Nothing half-seeds.
// ---------------------------------------------------------------------------

type ValidationError = { identifier: string; issues: string };
const errors: ValidationError[] = [];

function validateAll<T>(
  records: T[],
  schema: { safeParse: (v: unknown) => any },
  identify: (record: T) => string
) {
  for (const record of records) {
    const result = schema.safeParse(record);
    if (!result.success) {
      errors.push({
        identifier: identify(record),
        issues: result.error.issues
          .map((i: any) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      });
    }
  }
}

const profileResult = profileCreateSchema.safeParse(profileData);
if (!profileResult.success) {
  errors.push({
    identifier: "profile (singleton)",
    issues: profileResult.error.issues
      .map((i: any) => `${i.path.join(".")}: ${i.message}`)
      .join("; "),
  });
}

validateAll(educationData, educationCreateSchema, (e) => `${e.institution} / ${e.degree}`);
validateAll(skillCategoryData, skillCategoryCreateSchema, (c) => c.slug);
// Skill.category holds a SkillCategory *slug* string at this point, not yet
// resolved to an ObjectId — the schema only requires a non-empty string, so
// this validates cleanly and the slug->id swap happens after validation.
validateAll(skillData, skillCreateSchema, (s) => s.name);
validateAll(projectData, projectCreateSchema, (p) => p.slug);
validateAll(certificationData, certificationCreateSchema, (c) => `${c.title} / ${c.issuer}`);
validateAll(socialData, socialCreateSchema, (s) => s.name);
validateAll(blogSourceData, blogSourceCreateSchema, (b) => b.host ?? b.name);

if (errors.length > 0) {
  console.error(`\n${errors.length} validation failure(s):\n`);
  for (const e of errors) {
    console.error(`  [${e.identifier}] ${e.issues}`);
  }
  console.error("\nAborting — nothing was written.");
  process.exit(1);
}

console.log("All records passed validation.");

// ---------------------------------------------------------------------------
// 3. Write
// ---------------------------------------------------------------------------

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable (.env.local)");
  }

  if (FRESH) {
    await confirmFreshRun(MONGODB_URI);
  }

  await dbConnect();
  console.log("Connected to MongoDB.");

  if (FRESH) {
    console.log("--fresh: deleting existing seeded documents...");
    await Promise.all([
      Profile.deleteMany({}),
      Education.deleteMany({}),
      SkillCategory.deleteMany({}),
      Skill.deleteMany({}),
      Project.deleteMany({}),
      Certification.deleteMany({}),
      Social.deleteMany({}),
      BlogSource.deleteMany({}),
    ]);
  }

  // Profile: single upsert on {}
  await Profile.updateOne({}, { $set: profileData }, { upsert: true });
  console.log("Profile upserted.");

  // Education: natural key institution+degree
  await Education.bulkWrite(
    educationData.map((e) => ({
      updateOne: {
        filter: { institution: e.institution, degree: e.degree },
        update: { $set: e },
        upsert: true,
      },
    }))
  );
  console.log(`Education upserted (${educationData.length}).`);

  // SkillCategory: natural key slug — must land before Skill so slugs can be
  // resolved to ObjectIds.
  await SkillCategory.bulkWrite(
    skillCategoryData.map((c) => ({
      updateOne: {
        filter: { slug: c.slug },
        update: { $set: c },
        upsert: true,
      },
    }))
  );
  console.log(`SkillCategory upserted (${skillCategoryData.length}).`);

  const categories = await SkillCategory.find(
    { slug: { $in: skillCategoryData.map((c) => c.slug) } },
    { slug: 1 }
  ).lean();
  const slugToId = new Map(categories.map((c: any) => [c.slug, c._id]));

  const resolvedSkills = skillData.map((s) => {
    const categoryId = slugToId.get(s.category);
    if (!categoryId) {
      throw new Error(
        `Skill "${s.name}" references unknown SkillCategory slug "${s.category}"`
      );
    }
    return { ...s, category: categoryId };
  });

  // Skill: natural key name
  await Skill.bulkWrite(
    resolvedSkills.map((s) => ({
      updateOne: {
        filter: { name: s.name },
        update: { $set: s },
        upsert: true,
      },
    }))
  );
  console.log(`Skill upserted (${resolvedSkills.length}).`);

  // Project: natural key slug
  await Project.bulkWrite(
    projectData.map((p) => ({
      updateOne: {
        filter: { slug: p.slug },
        update: { $set: p },
        upsert: true,
      },
    }))
  );
  console.log(`Project upserted (${projectData.length}).`);

  // Certification: natural key title+issuer
  await Certification.bulkWrite(
    certificationData.map((c) => ({
      updateOne: {
        filter: { title: c.title, issuer: c.issuer },
        update: { $set: c },
        upsert: true,
      },
    }))
  );
  console.log(`Certification upserted (${certificationData.length}).`);

  // Social: natural key name
  await Social.bulkWrite(
    socialData.map((s) => ({
      updateOne: {
        filter: { name: s.name },
        update: { $set: s },
        upsert: true,
      },
    }))
  );
  console.log(`Social upserted (${socialData.length}).`);

  // BlogSource: natural key host
  await BlogSource.bulkWrite(
    blogSourceData.map((b) => ({
      updateOne: {
        filter: { host: b.host },
        update: { $set: b },
        upsert: true,
      },
    }))
  );
  console.log(`BlogSource upserted (${blogSourceData.length}).`);

  console.log("\nSeed complete.");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
