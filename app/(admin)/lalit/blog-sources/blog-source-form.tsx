"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import {
  blogSourceCreateSchema,
  blogSourceUpdateSchema,
} from "@/lib/validators/blogSource";
import { BLOG_PLATFORMS } from "@/models/BlogSource";
import type { SerializedBlogSource } from "@/types/models";
import {
  createBlogSource,
  updateBlogSource,
  testBlogSourceConnection,
} from "./actions";

const PLATFORM_OPTIONS = BLOG_PLATFORMS.map((p) => ({ label: p, value: p }));

export function BlogSourceForm({
  source,
  isLastActive,
}: {
  source?: SerializedBlogSource;
  isLastActive: boolean;
}) {
  const router = useRouter();
  const schema = source ? blogSourceUpdateSchema : blogSourceCreateSchema;
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
              options={PLATFORM_OPTIONS}
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
                <a href="/lalit/blog-sources">Cancel</a>
              </Button>
            </div>
          </div>
        );
      }}
    </EntityForm>
  );
}
