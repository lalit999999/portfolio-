/**
 * One-time migration: renames Certification.color values from the old
 * hardcoded-palette keys to the new semantic set introduced by the
 * dark-first/orange retheme (see models/Certification.ts CERT_COLORS).
 *
 * Old -> new:
 *   emerald -> success
 *   blue    -> info
 *   purple  -> primary
 *   amber   -> warning
 *   rose    -> accent
 *   cyan    -> neutral
 *
 * Uses the raw collection, not the Certification model, because the
 * Mongoose schema's enum has already been updated to the new values —
 * reading/writing old-value documents through the model risks enum
 * validation getting in the way.
 *
 * Usage:
 *   npx tsx scripts/migrate-cert-colors.ts            dry run, no writes
 *   npx tsx scripts/migrate-cert-colors.ts --apply     performs the updates
 *
 * NOT run as part of this change. Review the dry-run output against your
 * Atlas data first, then run with --apply yourself.
 */
import dotenv from "dotenv";
import path from "node:path";
import mongoose from "mongoose";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import dbConnect from "@/lib/db";

const COLOR_MIGRATION: Record<string, string> = {
  emerald: "success",
  blue: "info",
  purple: "primary",
  amber: "warning",
  rose: "accent",
  cyan: "neutral",
};

const NEW_COLORS = new Set(Object.values(COLOR_MIGRATION));
const APPLY = process.argv.includes("--apply");

async function main() {
  await dbConnect();
  const collection = mongoose.connection.collection("certifications");

  const docs = await collection
    .find({}, { projection: { title: 1, color: 1 } })
    .toArray();

  if (docs.length === 0) {
    console.log("No certification documents found.");
    await mongoose.disconnect();
    return;
  }

  const toMigrate: { _id: unknown; title: string; from: string; to: string }[] = [];
  const alreadyNew: string[] = [];
  const unrecognised: { _id: unknown; title: string; color: unknown }[] = [];

  for (const doc of docs) {
    const color = doc.color as string | undefined;
    if (color && COLOR_MIGRATION[color]) {
      toMigrate.push({
        _id: doc._id,
        title: doc.title,
        from: color,
        to: COLOR_MIGRATION[color],
      });
    } else if (color && NEW_COLORS.has(color)) {
      alreadyNew.push(doc.title);
    } else {
      unrecognised.push({ _id: doc._id, title: doc.title, color: doc.color });
    }
  }

  console.log(`${docs.length} certification document(s) found.`);
  console.log(`${toMigrate.length} to migrate:`);
  for (const m of toMigrate) console.log(`  "${m.title}": ${m.from} -> ${m.to}`);

  if (alreadyNew.length) {
    console.log(`${alreadyNew.length} already on new-style colors, left untouched:`);
    for (const title of alreadyNew) console.log(`  "${title}"`);
  }

  if (unrecognised.length) {
    console.log(`${unrecognised.length} with an unrecognised color value (needs manual review):`);
    for (const u of unrecognised) console.log(`  "${u.title}": ${JSON.stringify(u.color)}`);
  }

  if (!APPLY) {
    console.log('\nDry run only - no documents were changed. Re-run with "--apply" to write.');
    await mongoose.disconnect();
    return;
  }

  for (const m of toMigrate) {
    await collection.updateOne({ _id: m._id as never }, { $set: { color: m.to } });
  }
  console.log(`\nUpdated ${toMigrate.length} document(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
