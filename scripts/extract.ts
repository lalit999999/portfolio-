/**
 * Reads the OLD portfolio data files as TEXT (never imported — they pull in
 * `lucide-react`, which drags React into this Node script) and transforms
 * them into the seed JSON consumed by scripts/seed.ts.
 *
 * Reference source: the task brief points at /tmp/old-portfolio, which does
 * not exist on this machine. The actual old data lives in the sibling
 * `portfolio1` project at the same path shape
 * (src/app/data/portfolio-data.ts, src/app/data/blog-config.ts), so that is
 * used instead. Override with OLD_DATA_DIR if needed.
 *
 * Zero imports from models/ — this step is fully independent of Session B.
 */
import fs from "node:fs";
import path from "node:path";

// This whole script evaluates arbitrary object-literal text from the old
// portfolio1 project (see evalExportedLiteral below) — there is no static
// shape to check it against, so give the dynamic parts a single named,
// documented escape hatch instead of sprinkling bare `any` everywhere.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Legacy = any;

// ---------------------------------------------------------------------------
// Old data location
// ---------------------------------------------------------------------------

function resolveOldDataDir(): string {
  const candidates = [
    process.env.OLD_DATA_DIR,
    "/tmp/old-portfolio/src/app/data",
    path.resolve(__dirname, "..", "..", "portfolio1", "src", "app", "data"),
  ].filter((p): p is string => Boolean(p));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  throw new Error(
    `Could not locate old data directory. Tried:\n${candidates.join("\n")}`
  );
}

const OLD_DATA_DIR = resolveOldDataDir();
console.log(`Reading old data from: ${OLD_DATA_DIR}`);

const OUT_DIR = path.resolve(__dirname, "seed-data");
fs.mkdirSync(OUT_DIR, { recursive: true });

// ---------------------------------------------------------------------------
// Small local helpers (deliberately NOT imported from lib/utils — those
// files are owned by another session and may not exist yet).
// ---------------------------------------------------------------------------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base;
  let n = 2;
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  taken.add(slug);
  return slug;
}

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/** Parses loose "month year" strings ("sept 2025", "April 2026") to an ISO date string. */
function parseMonthYearToISO(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) {
    throw new Error(`FAILED TO PARSE DATE: "${raw}"`);
  }
  const monthKey = match[1].toLowerCase();
  const month = MONTHS[monthKey];
  if (month === undefined) {
    throw new Error(`FAILED TO PARSE DATE (unknown month): "${raw}"`);
  }
  const year = Number(match[2]);
  return new Date(Date.UTC(year, month, 1)).toISOString();
}

// ---------------------------------------------------------------------------
// Text -> object-literal evaluation
// ---------------------------------------------------------------------------

/**
 * Strips the `import { A, B, ... } from "lucide-react"` block and rewrites
 * every `icon: X` occurrence to `iconName: "X"` so the icon components never
 * need to be evaluated as identifiers.
 */
function stripLucideImportAndTagIcons(source: string): string {
  const withoutImport = source.replace(
    /^import\s*\{[\s\S]*?\}\s*from\s*["']lucide-react["'];?\s*/m,
    ""
  );
  return withoutImport.replace(/icon:\s*([A-Za-z0-9_]+)/g, 'iconName: "$1"');
}

/** Pulls the object/array literal out of `export const NAME = <literal>;` and evaluates it. */
function evalExportedLiteral(source: string, exportName: string): unknown {
  const marker = `export const ${exportName} =`;
  const idx = source.indexOf(marker);
  if (idx === -1) {
    throw new Error(`Could not find "${marker}" in source`);
  }
  let literal = source.slice(idx + marker.length).trim();
  if (literal.endsWith(";")) literal = literal.slice(0, -1);
   
  return new Function(`"use strict"; return (${literal});`)();
}

// ---------------------------------------------------------------------------
// Load + parse old files
// ---------------------------------------------------------------------------

const portfolioDataRaw = fs.readFileSync(
  path.join(OLD_DATA_DIR, "portfolio-data.ts"),
  "utf-8"
);
const blogConfigRaw = fs.readFileSync(
  path.join(OLD_DATA_DIR, "blog-config.ts"),
  "utf-8"
);

const portfolioData = evalExportedLiteral(
  stripLucideImportAndTagIcons(portfolioDataRaw),
  "portfolioData"
) as Legacy;

const blogConfigurations = evalExportedLiteral(
  stripLucideImportAndTagIcons(blogConfigRaw),
  "blogConfigurations"
) as Legacy[];

// ---------------------------------------------------------------------------
// Content fixes log
// ---------------------------------------------------------------------------

const fixesApplied: string[] = [];

// ---------------------------------------------------------------------------
// profile.json
// ---------------------------------------------------------------------------

let tagline: string = portfolioData.personalInfo.tagline.trim();
if (tagline.includes("which build")) {
  tagline = tagline.replace("which build", "who builds");
  fixesApplied.push(
    `tagline: trimmed trailing space and fixed grammar -> "${tagline}"`
  );
}

let description: string = portfolioData.personalInfo.description;
const beforeSpacingFix = description;
description = description
  .replace(/frontends\.Technical/, "frontends. Technical")
  .replace(/Socket\.IO\.Currently/, "Socket.IO. Currently")
  .replace(/workflows\.Looking/, "workflows. Looking");
if (description !== beforeSpacingFix) {
  fixesApplied.push(
    "profile description: fixed 3 missing spaces after periods (frontends.Technical, Socket.IO.Currently, workflows.Looking)"
  );
}

const descriptionParagraphs = [
  "I build full-stack AI applications that integrate large language models into production systems. Specializing in end-to-end development from LLM API integration (OpenAI, Anthropic) through scalable backend architecture and responsive frontends.",
  "Technical expertise spans frontend (React, NextJS, TypeScript), backend (Node.js, FastAPI, REST APIs), databases (PostgreSQL, MongoDB), and infrastructure (Docker, CI/CD, GitHub Actions, VPS deployment). Experienced with system design, WebSocket implementation, and real-time data handling using Redis and Socket.IO.",
  "Currently pursuing B.Tech in Computer Engineering at National Institute of Technology Patna while contributing to production systems. Certified in AWS Cloud Practitioner and Oracle Cloud Infrastructure AI Foundations. Proficient in Git, Linux, and modern development workflows.",
  "Looking to collaborate on AI-powered applications, backend optimization, and full-stack engineering challenges. Open to opportunities in AI engineering, backend development, and system architecture roles.",
];
// Sanity check: the manually split paragraphs must reconstruct the fixed description.
const reconstructed = descriptionParagraphs.join(" ");
if (reconstructed !== description) {
  throw new Error(
    "Description paragraph split does not reconstruct the fixed description text — aborting."
  );
}
fixesApplied.push(
  `profile description: split into ${descriptionParagraphs.length} paragraphs`
);

const profile = {
  name: portfolioData.personalInfo.name,
  tagline,
  description: descriptionParagraphs,
  avatarUrl: portfolioData.personalInfo.image,
  resumeUrl: portfolioData.personalInfo.resumeLink,
  currentlyLearning: portfolioData.learning.technologies,
};
// portfolioData.learning.note ("Currently deep diving into AI integration and
// system design things.") has no corresponding field on the Profile schema
// (name/tagline/description/avatarUrl/location/email/resumeUrl/
// currentlyLearning/availableForWork) — intentionally dropped. See
// PHASE1-C.md "could not confidently migrate".

fs.writeFileSync(
  path.join(OUT_DIR, "profile.json"),
  JSON.stringify(profile, null, 2)
);

// ---------------------------------------------------------------------------
// education.json
// ---------------------------------------------------------------------------

/** Derives the Education.field (required) from a degree title like "B.Tech in Computer Science". */
function deriveField(degree: string): string {
  const match = degree.match(/ in (.+)$/i);
  return match ? match[1].trim() : degree;
}

/** Parses the old loose "year" strings into { startDate, endDate } Dates. */
function parseEducationYears(raw: string): { startDate: Date; endDate?: Date } {
  const trimmed = raw.trim();

  const rangeToPresent = trimmed.match(/^(\d{4})\s*-\s*present$/i);
  if (rangeToPresent) {
    return { startDate: new Date(Date.UTC(Number(rangeToPresent[1]), 0, 1)) };
  }

  const range = trimmed.match(/^(\d{4})\s*-\s*(\d{4})$/);
  if (range) {
    return {
      startDate: new Date(Date.UTC(Number(range[1]), 0, 1)),
      endDate: new Date(Date.UTC(Number(range[2]), 0, 1)),
    };
  }

  const singleYear = trimmed.match(/^(\d{4})$/);
  if (singleYear) {
    const d = new Date(Date.UTC(Number(singleYear[1]), 0, 1));
    return { startDate: d, endDate: d };
  }

  throw new Error(`FAILED TO PARSE EDUCATION YEAR: "${raw}"`);
}

const education = portfolioData.education.map((e: Legacy, index: number) => {
  const { startDate, endDate } = parseEducationYears(e.year);
  return {
    institution: e.institution,
    degree: e.title,
    field: deriveField(e.title),
    startDate: startDate.toISOString(),
    ...(endDate ? { endDate: endDate.toISOString() } : {}),
    ...(e.board ? { description: `Board: ${e.board}` } : {}),
    order: index,
    isVisible: true,
  };
});
if (portfolioData.education.some((e: Legacy) => e.board)) {
  fixesApplied.push(
    'education: no schema field for "board" — folded into `description` as "Board: <value>"'
  );
}
fixesApplied.push(
  "education: `field` (required by schema) derived from degree title via \" in X\" pattern; `startDate`/`endDate` derived from loose \"YYYY - present\"/\"YYYY\" strings — see PHASE1-C.md assumptions"
);

fs.writeFileSync(
  path.join(OUT_DIR, "education.json"),
  JSON.stringify(education, null, 2)
);

// ---------------------------------------------------------------------------
// skill-categories.json + skills.json
// ---------------------------------------------------------------------------

const skillCategorySlugs = new Set<string>();
const skillCategories = portfolioData.skills.map((group: Legacy, index: number) => {
  const slug = uniqueSlug(slugify(group.category), skillCategorySlugs);
  return {
    name: group.category,
    slug,
    order: index,
    isVisible: true,
  };
});

fs.writeFileSync(
  path.join(OUT_DIR, "skill-categories.json"),
  JSON.stringify(skillCategories, null, 2)
);

const PLACEHOLDER_PROFICIENCY = 75;

const skills: Legacy[] = [];
portfolioData.skills.forEach((group: Legacy, groupIndex: number) => {
  const categorySlug = skillCategories[groupIndex].slug;
  group.items.forEach((item: Legacy, itemIndex: number) => {
    skills.push({
      name: item.name,
      iconName: item.iconName,
      category: categorySlug,
      proficiency: PLACEHOLDER_PROFICIENCY,
      order: itemIndex,
      isVisible: true,
    });
  });
});
fixesApplied.push(
  `skills: schema requires \`proficiency\` (0-100), absent from source — defaulted all ${skills.length} skills to ${PLACEHOLDER_PROFICIENCY} as a placeholder; needs a real content pass`
);

fs.writeFileSync(
  path.join(OUT_DIR, "skills.json"),
  JSON.stringify(skills, null, 2)
);

// ---------------------------------------------------------------------------
// projects.json
// ---------------------------------------------------------------------------

/** Derives the required Project.summary from the full description: first sentence, capped. */
function deriveSummary(description: string): string {
  const firstSentence = description.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? description;
  const capped =
    firstSentence.length > 160
      ? `${firstSentence.slice(0, 157).trimEnd()}...`
      : firstSentence;
  return capped.trim();
}

const projectSlugs = new Set<string>();
const slugTable: Array<{ title: string; slug: string }> = [];

const projects = portfolioData.projects.map((p: Legacy, index: number) => {
  const baseSlug = slugify(p.title);
  const slug = uniqueSlug(baseSlug, projectSlugs);
  slugTable.push({ title: p.title, slug });

  let liveUrl = p.live;
  const githubUrl = p.github;
  if (p.title.includes("MiniYouTube") && p.live === p.github) {
    fixesApplied.push(
      `project "${p.title}": liveUrl pointed at GitHub URL, cleared to ""`
    );
    liveUrl = "";
  }

  return {
    title: p.title,
    slug,
    summary: deriveSummary(p.description),
    description: p.description,
    tech: p.tech,
    githubUrl,
    liveUrl,
    order: index,
    isVisible: true,
  };
});
fixesApplied.push(
  "projects: schema requires `summary` (absent from source) — derived as the first sentence of `description`, capped at 160 chars"
);

fs.writeFileSync(
  path.join(OUT_DIR, "projects.json"),
  JSON.stringify(projects, null, 2)
);

// ---------------------------------------------------------------------------
// certifications.json
// ---------------------------------------------------------------------------

const certifications = portfolioData.certifications.map((c: Legacy, index: number) => {
  const issueDate = parseMonthYearToISO(c.date);
  return {
    title: c.title,
    issuer: c.issuer,
    issueDate,
    credentialUrl: c.credentialUrl,
    imageUrl: c.image,
    skills: c.skills,
    color: c.color,
    order: index,
    isVisible: true,
  };
});

fs.writeFileSync(
  path.join(OUT_DIR, "certifications.json"),
  JSON.stringify(certifications, null, 2)
);

// ---------------------------------------------------------------------------
// socials.json
// ---------------------------------------------------------------------------

const socials = portfolioData.socials.map((s: Legacy, index: number) => ({
  name: s.name,
  url: s.url,
  iconName: s.iconName,
  order: index,
  isVisible: true,
}));

fs.writeFileSync(
  path.join(OUT_DIR, "socials.json"),
  JSON.stringify(socials, null, 2)
);

// ---------------------------------------------------------------------------
// blog-sources.json
// ---------------------------------------------------------------------------

const seenHosts = new Set<string>();
const blogSources: Legacy[] = [];
let order = 0;

for (const entry of blogConfigurations) {
  let name: string = entry.name;
  if (name === "GIt & github") {
    name = "Git & GitHub";
    fixesApplied.push(
      `blog source (${entry.host}): normalised name "GIt & github" -> "Git & GitHub"`
    );
  }

  if (seenHosts.has(entry.host)) {
    fixesApplied.push(
      `blog source: dropped duplicate entry for host "${entry.host}"`
    );
    continue;
  }
  seenHosts.add(entry.host);

  blogSources.push({
    platform: "hashnode",
    name,
    host: entry.host,
    username: entry.username,
    order: order++,
    isVisible: true,
  });
}
fixesApplied.push(
  `blog sources: dropped numeric \`id\` fields (source had ${blogConfigurations.filter((e) => e.id === 5).length} entries sharing id:5, not 4 as the brief stated)`
);

fs.writeFileSync(
  path.join(OUT_DIR, "blog-sources.json"),
  JSON.stringify(blogSources, null, 2)
);

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

console.log("\nContent fixes applied:");
for (const fix of fixesApplied) console.log(`  - ${fix}`);

console.log("\nProject title -> slug:");
for (const row of slugTable) console.log(`  ${row.title}  ->  ${row.slug}`);

console.log("\nSummary:");
console.table({
  profile: { records: 1 },
  education: { records: education.length },
  "skill-categories": { records: skillCategories.length },
  skills: { records: skills.length },
  projects: { records: projects.length },
  certifications: { records: certifications.length },
  socials: { records: socials.length },
  "blog-sources": { records: blogSources.length },
});

console.log(`\nWrote 8 JSON files to ${OUT_DIR}`);
