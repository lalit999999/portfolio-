"use server";

import { Types } from "mongoose";

import { requireAdmin } from "@/lib/admin/guard";
import { ok, fail, fromZodError } from "@/lib/admin/action";
import { updateTag } from "next/cache";
import {
  blogSourceCreateSchema,
  blogSourceUpdateSchema,
} from "@/lib/validators/blogSource";
import { getNextBlogSourceOrder } from "@/lib/admin/blogSources";
import dbConnect from "@/lib/db";
import { BlogPost, BlogSource } from "@/models";
import type { AdminActionState } from "@/types/admin";
import type { SerializedBlogSource } from "@/types/models";

// lib/admin/revalidate.ts (Session A, frozen) still calls the deprecated
// single-argument revalidateTag(tag), which no longer compiles against
// Next 16's revalidateTag(tag, profile) signature. Calling updateTag directly
// here matches the old single-arg semantics (immediate expiration,
// read-your-own-writes) without touching that frozen file.

function serialize<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}

// Mirrors the endpoint and query shape in lib/data/blogPosts.ts. That file's
// fetch helper isn't exported (lib/data is read-only for this session), so
// the admin "test connection" / "sync now" actions keep their own copy here
// rather than importing a private function or editing a Phase 1/2/3 file.
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

async function fetchHashnodePosts(host: string): Promise<HashnodePostNode[]> {
  const res = await fetch(HASHNODE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: HASHNODE_QUERY, variables: { host, first: 20 } }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Hashnode fetch for ${host} failed: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Hashnode fetch for ${host} returned non-JSON`);
  }

  const json = (await res.json()) as HashnodeResponse;
  const edges = json.data?.publication?.posts?.edges;
  if (!edges) {
    throw new Error(`Hashnode publication "${host}" not found or has no posts`);
  }

  return edges.map((edge) => edge.node);
}

// Return type is the base AdminActionState, not AdminActionState<X>: fail()/
// fromZodError() in lib/admin/action.ts (frozen, Session A) aren't generic, so their
// AdminActionState<unknown> result isn't assignable into a narrower AdminActionState<X>
// annotation. No caller reads `.data` for these three actions — only
// testBlogSourceConnection's result is consumed client-side, so that one keeps its
// generic and casts around the same issue at its two fail() call sites instead.
export async function createBlogSource(values: unknown): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = blogSourceCreateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();
  const order = parsed.data.order ?? (await getNextBlogSourceOrder());
  const doc = await BlogSource.create({ ...parsed.data, order });

  updateTag("blogsources");
  updateTag("blogposts");
  return ok(serialize<SerializedBlogSource>(doc.toObject()), "Blog source created.");
}

export async function updateBlogSource(
  id: string,
  values: unknown
): Promise<AdminActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(id)) {
    return fail("VALIDATION_ERROR", "Invalid blog source id.");
  }

  const parsed = blogSourceUpdateSchema.safeParse(values);
  if (!parsed.success) return fromZodError(parsed.error);

  await dbConnect();

  const doc = await BlogSource.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!doc) return fail("NOT_FOUND", "Blog source not found.");

  updateTag("blogsources");
  updateTag("blogposts");
  return ok(serialize<SerializedBlogSource>(doc.toObject()), "Blog source updated.");
}

export async function deleteBlogSource(id: string): Promise<AdminActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(id)) {
    return fail("VALIDATION_ERROR", "Invalid blog source id.");
  }

  await dbConnect();
  const doc = await BlogSource.findByIdAndDelete(id);
  if (!doc) return fail("NOT_FOUND", "Blog source not found.");
  await BlogPost.deleteMany({ source: id });

  updateTag("blogsources");
  updateTag("blogposts");
  return ok(undefined, "Blog source deleted.");
}

export interface TestConnectionResult {
  postCount: number;
  latestTitle?: string;
}

export async function testBlogSourceConnection(
  platform: string,
  host: string | undefined
): Promise<AdminActionState<TestConnectionResult>> {
  await requireAdmin();

  // fail() returns the base AdminActionState (unknown), cast to this function's
  // AdminActionState<TestConnectionResult> return type — see the comment above
  // createBlogSource for why the cast is needed instead of a plain return.
  if (platform !== "hashnode") {
    return fail(
      "VALIDATION_ERROR",
      `Test connection isn't implemented for "${platform}" yet — only Hashnode sync exists so far.`
    ) as AdminActionState<TestConnectionResult>;
  }

  if (!host) {
    return fail(
      "VALIDATION_ERROR",
      "Host is required to test a Hashnode source."
    ) as AdminActionState<TestConnectionResult>;
  }

  try {
    const posts = await fetchHashnodePosts(host);
    return ok(
      { postCount: posts.length, latestTitle: posts[0]?.title },
      `Connected — found ${posts.length} post(s).`
    );
  } catch (err) {
    return fail(
      "SERVER_ERROR",
      err instanceof Error ? err.message : "Could not reach Hashnode."
    ) as AdminActionState<TestConnectionResult>;
  }
}

export async function syncBlogSourceNow(id: string): Promise<AdminActionState> {
  await requireAdmin();

  if (!Types.ObjectId.isValid(id)) {
    return fail("VALIDATION_ERROR", "Invalid blog source id.");
  }

  await dbConnect();
  const source = await BlogSource.findById(id);
  if (!source) return fail("NOT_FOUND", "Blog source not found.");

  if (source.platform !== "hashnode") {
    return fail(
      "VALIDATION_ERROR",
      `Sync isn't implemented for "${source.platform}" yet — only Hashnode sync exists so far.`
    );
  }

  if (!source.host) {
    return fail("VALIDATION_ERROR", "This source has no host configured.");
  }

  let posts;
  try {
    posts = await fetchHashnodePosts(source.host);
  } catch (err) {
    return fail(
      "SERVER_ERROR",
      err instanceof Error ? err.message : "Could not reach Hashnode."
    );
  }

  await Promise.all(
    posts.map((node, index) =>
      BlogPost.findOneAndUpdate(
        { externalId: node.id },
        {
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
          $setOnInsert: { order: index, isVisible: true },
        },
        { upsert: true, new: true }
      )
    )
  );

  source.lastSyncedAt = new Date();
  await source.save();

  updateTag("blogsources");
  updateTag("blogposts");
  return ok({ synced: posts.length }, `Synced ${posts.length} post(s).`);
}
