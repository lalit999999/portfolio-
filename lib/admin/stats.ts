import "server-only";
import dbConnect from "@/lib/db";
import {
  BlogPost,
  Certification,
  Education,
  Message,
  PlaygroundMessage,
  Project,
  Skill,
  SkillCategory,
  Social,
  User,
} from "@/models";

export interface WeeklyPoint {
  weekStart: string;
  count: number;
}

export interface DailyPoint {
  date: string;
  count: number;
}

export interface CategoryPoint {
  category: string;
  count: number;
}

export interface AdminStats {
  counts: {
    projectsTotal: number;
    projectsFeatured: number;
    projectsHidden: number;
    skills: number;
    certificationsTotal: number;
    certificationsExpired: number;
    education: number;
    socials: number;
    blogPosts: number;
    unreadMessages: number;
    playgroundMessages: number;
    playgroundMembers: number;
    bannedUsers: number;
  };
  charts: {
    messagesPerWeek: WeeklyPoint[];
    skillsByCategory: CategoryPoint[];
    playgroundActivityDaily: DailyPoint[];
    projectsByCategory: CategoryPoint[];
  };
  recentMessages: { _id: string; name: string; subject?: string; createdAt: string }[];
  recentPlaygroundMessages: {
    _id: string;
    content: string;
    author: string;
    createdAt: string;
  }[];
  topProjects: { _id: string; title: string; viewCount: number }[];
}

function startOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // Monday as week start
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function getMessagesPerWeek(): Promise<WeeklyPoint[]> {
  const now = new Date();
  const since = startOfWeek(now);
  since.setUTCDate(since.getUTCDate() - 11 * 7);

  const docs = await Message.find({ createdAt: { $gte: since } })
    .select("createdAt")
    .lean();

  const buckets = new Map<string, number>();
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(since);
    weekStart.setUTCDate(weekStart.getUTCDate() + i * 7);
    buckets.set(weekStart.toISOString().slice(0, 10), 0);
  }

  for (const doc of docs) {
    const weekStart = startOfWeek(doc.createdAt).toISOString().slice(0, 10);
    if (buckets.has(weekStart)) {
      buckets.set(weekStart, (buckets.get(weekStart) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([weekStart, count]) => ({ weekStart, count }));
}

async function getPlaygroundActivityDaily(): Promise<DailyPoint[]> {
  const now = new Date();
  const since = startOfDay(now);
  since.setUTCDate(since.getUTCDate() - 29);

  const docs = await PlaygroundMessage.find({ createdAt: { $gte: since } })
    .select("createdAt")
    .lean();

  const buckets = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const day = new Date(since);
    day.setUTCDate(day.getUTCDate() + i);
    buckets.set(day.toISOString().slice(0, 10), 0);
  }

  for (const doc of docs) {
    const day = startOfDay(doc.createdAt).toISOString().slice(0, 10);
    if (buckets.has(day)) {
      buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

async function getSkillsByCategory(): Promise<CategoryPoint[]> {
  const [categories, grouped] = await Promise.all([
    SkillCategory.find().select("name").lean(),
    Skill.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const nameById = new Map(categories.map((c) => [String(c._id), c.name]));

  return grouped
    .map((g) => ({
      category: nameById.get(String(g._id)) ?? "Uncategorized",
      count: g.count,
    }))
    .sort((a, b) => b.count - a.count);
}

async function getProjectsByCategory(): Promise<CategoryPoint[]> {
  const grouped = await Project.aggregate<{ _id: string | null; count: number }>([
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  return grouped
    .map((g) => ({ category: g._id ?? "Uncategorized", count: g.count }))
    .sort((a, b) => b.count - a.count);
}

export async function getAdminStats(): Promise<AdminStats> {
  await dbConnect();

  const now = new Date();

  const [
    projectsTotal,
    projectsFeatured,
    projectsHidden,
    skills,
    certificationsTotal,
    certificationsExpired,
    education,
    socials,
    blogPosts,
    unreadMessages,
    playgroundMessages,
    playgroundMembers,
    bannedUsers,
    messagesPerWeek,
    skillsByCategory,
    playgroundActivityDaily,
    projectsByCategory,
    recentMessagesDocs,
    recentPlaygroundDocs,
    topProjectsDocs,
  ] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ featured: true }),
    Project.countDocuments({ isVisible: false }),
    Skill.countDocuments(),
    Certification.countDocuments(),
    Certification.countDocuments({ expiryDate: { $lt: now } }),
    Education.countDocuments(),
    Social.countDocuments(),
    BlogPost.countDocuments(),
    Message.countDocuments({ isRead: false, isArchived: false }),
    PlaygroundMessage.countDocuments(),
    User.countDocuments({ messageCount: { $gt: 0 } }),
    User.countDocuments({ isBanned: true }),
    getMessagesPerWeek(),
    getSkillsByCategory(),
    getPlaygroundActivityDaily(),
    getProjectsByCategory(),
    Message.find().sort({ createdAt: -1 }).limit(5).select("name subject createdAt").lean(),
    PlaygroundMessage.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("author", "username")
      .select("content author createdAt")
      .lean(),
    Project.find().sort({ viewCount: -1 }).limit(5).select("title viewCount").lean(),
  ]);

  return {
    counts: {
      projectsTotal,
      projectsFeatured,
      projectsHidden,
      skills,
      certificationsTotal,
      certificationsExpired,
      education,
      socials,
      blogPosts,
      unreadMessages,
      playgroundMessages,
      playgroundMembers,
      bannedUsers,
    },
    charts: {
      messagesPerWeek,
      skillsByCategory,
      playgroundActivityDaily,
      projectsByCategory,
    },
    recentMessages: recentMessagesDocs.map((doc) => ({
      _id: String(doc._id),
      name: doc.name,
      subject: doc.subject,
      createdAt: doc.createdAt.toISOString(),
    })),
    recentPlaygroundMessages: recentPlaygroundDocs.map((doc) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const author = doc.author as any;
      return {
        _id: String(doc._id),
        content: doc.content,
        author: author?.username ?? "unknown",
        createdAt: doc.createdAt.toISOString(),
      };
    }),
    topProjects: topProjectsDocs.map((doc) => ({
      _id: String(doc._id),
      title: doc.title,
      viewCount: doc.viewCount,
    })),
  };
}
