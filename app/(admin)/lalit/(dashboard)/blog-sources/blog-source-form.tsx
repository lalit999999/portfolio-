"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { PlugZap, TriangleAlert } from "lucide-react";

import { EntityForm } from "@/components/admin/entity-form";
import {
  TextField,
  SwitchField,
  NumberField,
  SelectField,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription } from "@/components/ui/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { BlogPlatform, SerializedBlogSource } from "@/types/models";
import {
  createBlogSource,
  updateBlogSource,
  testBlogSourceConnection,
} from "./actions";

/**
 * A local mirror of lib/validators/blogSource.ts's shape, not an import of
 * it: that file pulls BLOG_PLATFORMS from the Mongoose model for its zod
 * enum, and lib/validators is read-only here, so importing it into this
 * client component would drag mongoose into the browser bundle (build fails
 * on "tls"/"net"). The real validator still runs server-side in actions.ts,
 * which is the authoritative check — this one only drives the resolver's
 * client-side field feedback, using the same `platforms` prop everywhere
 * else on this page to keep the enum server-sourced rather than hand-typed.
 */
function buildClientSchema(platforms: readonly BlogPlatform[]) {
  return z.object({
    platform: z.enum(platforms as [BlogPlatform, ...BlogPlatform[]]),
    username: z.string().min(1),
    host: z.string().optional(),
    name: z.string().min(1),
    isActive: z.boolean(),
    order: z.number().int(),
    isVisible: z.boolean(),
  });
}

export function BlogSourceForm({
  source,
  isLastActive,
  platforms,
}: {
  source?: SerializedBlogSource;
  isLastActive: boolean;
  platforms: readonly BlogPlatform[];
}) {
  const platformOptions = platforms.map((p) => ({ label: p, value: p }));
  const router = useRouter();
  const schema = buildClientSchema(platforms);
  const [isTesting, startTest] = useTransition();
  const [testResult, setTestResult] = useState<string | null>(null);

  return (
    <EntityForm
      schema={schema}
      defaultValues={{
        platform: source?.platform ?? "hashnode",
        username: source?.username ?? "",
        host: source?.host ?? "",
        name: source?.name ?? "",
        isActive: source?.isActive ?? true,
        order: source?.order ?? 0,
        isVisible: source?.isVisible ?? true,
      }}
      action={async (values) => {
        const state = source
          ? await updateBlogSource(source._id, values)
          : await createBlogSource(values);
        if (state.status === "success") {
          toast.success(state.message ?? "Saved.");
          router.push("/lalit/blog-sources");
          router.refresh();
        } else if (state.status === "error") {
          toast.error(state.message);
        }
        return state;
      }}
      cancelHref="/lalit/blog-sources"
    >
      {(form) => {
        const wantsToDeactivate =
          isLastActive && source?.isActive && form.watch("isActive") === false;

        return (
          <div className="flex flex-col gap-6">
            <SelectField
              control={form.control}
              name="platform"
              label="Platform"
              options={platformOptions}
            />
            <TextField control={form.control} name="name" label="Display name" required />
            <TextField control={form.control} name="username" label="Username" required />
            <TextField
              control={form.control}
              name="host"
              label="Host"
              placeholder="blog.example.dev"
              description="Hashnode publication host — required for test connection and sync."
            />

            <Field>
              <Button
                type="button"
                variant="outline"
                disabled={isTesting}
                onClick={() =>
                  startTest(async () => {
                    setTestResult(null);
                    const state = await testBlogSourceConnection(
                      form.getValues("platform"),
                      form.getValues("host")
                    );
                    if (state.status === "success") {
                      setTestResult(
                        `${state.message} Latest: "${state.data?.latestTitle ?? "—"}"`
                      );
                      toast.success(state.message ?? "Connected.");
                    } else if (state.status === "error") {
                      setTestResult(state.message);
                      toast.error(state.message);
                    }
                  })
                }
              >
                <PlugZap aria-hidden />
                Test connection
              </Button>
              {testResult && <FieldDescription>{testResult}</FieldDescription>}
            </Field>

            {source?.lastSyncedAt && (
              <FieldDescription>
                Last synced {new Date(source.lastSyncedAt).toLocaleString()}
              </FieldDescription>
            )}

            <NumberField control={form.control} name="order" label="Order" />
            <SwitchField control={form.control} name="isVisible" label="Visible on site" />
            <SwitchField control={form.control} name="isActive" label="Active" />

            {wantsToDeactivate && (
              <Alert variant="destructive">
                <TriangleAlert aria-hidden />
                <AlertTitle>This is the last active source</AlertTitle>
                <AlertDescription>
                  Saving this will hide the entire Blogs section (nav item and command
                  palette entry) from the public site until a source is active again.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2">
              <Button type="submit">{source ? "Save changes" : "Create source"}</Button>
              <Button variant="outline" asChild>
                <Link href="/lalit/blog-sources">Cancel</Link>
              </Button>
            </div>
          </div>
        );
      }}
    </EntityForm>
  );
}
