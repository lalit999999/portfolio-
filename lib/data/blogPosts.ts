import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import { BlogPost } from "@/models";
import type { SerializedBlogPost, SerializedBlogSource } from "@/types/models";
import { getBlogSources } from "./blogSources";
import { serialize } from "./serialize";

const HASHNODE_ENDPOINT = "https://gql.hashnode.com";

const HASHNODE_QUERY = /* GraphQL */ `
  query PortfolioPublicationPosts($host: String!, $first: Int!) {
    publication(host: $host) {
      posts(first: $first) {
        edges {
          node {
            id
            title
            brief
            slug
            url
            coverImage {
              url
            }
            tags {
              name
            }
            readTimeInMinutes
            publishedAt
          }
        }
      }
    }
  }
`;

interface HashnodePostNode {
  id: string;
  title: string;
  brief?: string | null;
  slug: string;
  url: string;
  coverImage?: { url: string } | null;
  tags?: { name: string }[] | null;
  readTimeInMinutes?: number | null;
  publishedAt: string;
}

interface HashnodeResponse {
  data?: {
    publication?: {
      posts?: {
        edges?: { node: HashnodePostNode }[];
      } | null;
    } | null;
  };
  errors?: unknown;
}

const getVisibleBlogPostsFromDb = unstable_cache(
  async (): Promise<SerializedBlogPost[]> => {
    await dbConnect();
    const docs = await BlogPost.find({ isVisible: true })
      .sort({ publishedAt: -1 })
      .lean();
    return serialize<SerializedBlogPost[]>(docs);
  },
  ["blogposts-db"],
  { tags: ["blogposts"], revalidate: 3600 }
);

async function fetchHashnodePublicationPosts(
  source: SerializedBlogSource
): Promise<SerializedBlogPost[]> {
  if (!source.host) return [];

  const res = await fetch(HASHNODE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: HASHNODE_QUERY,
      variables: { host: source.host, first: 20 },
    }),
    next: { revalidate: 21600, tags: ["blogposts"] },
  });

  if (!res.ok) {
    throw new Error(`Hashnode fetch for ${source.host} failed: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Hashnode fetch for ${source.host} returned non-JSON`);
  }

  const json = (await res.json()) as HashnodeResponse;
  const edges = json.data?.publication?.posts?.edges;
  if (!edges) {
    throw new Error(`Hashnode schema mismatch for ${source.host}`);
  }

  const now = new Date().toISOString();
  return edges.map(({ node }): SerializedBlogPost => ({
    _id: node.id,
    source: source._id,
    externalId: node.id,
    title: node.title,
    brief: node.brief ?? undefined,
    slug: node.slug,
    url: node.url,
    coverImage: node.coverImage?.url,
    tags: node.tags?.map((t) => t.name) ?? [],
    readTimeMinutes: node.readTimeInMinutes ?? undefined,
    publishedAt: node.publishedAt,
    order: 0,
    isVisible: true,
    createdAt: now,
    updatedAt: now,
  }));
}

async function getLiveHashnodeFallback(): Promise<SerializedBlogPost[]> {
  const sources = await getBlogSources();
  const hashnodeSources = sources.filter(
    (s) => s.platform === "hashnode" && s.host
  );
  if (hashnodeSources.length === 0) return [];

  const results = await Promise.allSettled(
    hashnodeSources.map((source) => fetchHashnodePublicationPosts(source))
  );

  return results
    .filter((r): r is PromiseFulfilledResult<SerializedBlogPost[]> => r.status === "fulfilled")
    .flatMap((r) => r.value);
}

/**
 * BlogPost collection is empty until the Hashnode sync (Phase 5) runs.
 * Until then, falls back to a live query against each active Hashnode
 * publication so /blogs isn't empty. Individual publication failures are
 * dropped via Promise.allSettled rather than failing the whole page.
 */
export async function getBlogPosts(
  opts: { limit?: number } = {}
): Promise<SerializedBlogPost[]> {
  const dbPosts = await getVisibleBlogPostsFromDb();
  const posts = dbPosts.length > 0 ? dbPosts : await getLiveHashnodeFallback();

  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return opts.limit ? sorted.slice(0, opts.limit) : sorted;
}
