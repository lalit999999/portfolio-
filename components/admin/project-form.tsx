"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Controller, type Control, type FieldPath } from "react-hook-form";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { cn } from "@/lib/utils";
import { slugify } from "@/lib/utils/slug";
import { projectCreateSchema } from "@/lib/validators/project";
import type { AdminActionState } from "@/types/admin";

import { EntityForm } from "@/components/admin/entity-form";
import {
  TextField,
  TextareaField,
  SwitchField,
  DateField,
  TagsField,
  SlugField,
} from "@/components/admin/form-fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { checkSlugAvailable } from "@/app/(admin)/lalit/(dashboard)/projects/actions";

type ProjectFormValues = z.input<typeof projectCreateSchema>;
type ProjectFormOutput = z.output<typeof projectCreateSchema>;

function DescriptionField({
  control,
  name,
}: {
  control: Control<ProjectFormValues>;
  name: FieldPath<ProjectFormValues>;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>Description</FieldLabel>
          <Textarea
            id={name}
            className="min-h-56 font-mono text-sm"
            placeholder="Full write-up rendered on the project detail page…"
            {...field}
            value={typeof field.value === "string" ? field.value : ""}
          />
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

function CategoryField({
  control,
  name,
  options,
}: {
  control: Control<ProjectFormValues>;
  name: FieldPath<ProjectFormValues>;
  options: string[];
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>Category</FieldLabel>
          <Input
            id={name}
            list="project-category-options"
            placeholder="e.g. Web App"
            {...field}
            value={typeof field.value === "string" ? field.value : ""}
          />
          <datalist id="project-category-options">
            {options.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

export interface ProjectFormProps {
  mode: "create" | "edit";
  projectId?: string;
  defaultValues: ProjectFormValues;
  categoryOptions: string[];
  viewCount?: number;
  action: (values: ProjectFormOutput) => Promise<AdminActionState>;
}

export function ProjectForm({
  mode,
  projectId,
  defaultValues,
  categoryOptions,
  viewCount,
  action,
}: ProjectFormProps) {
  const router = useRouter();
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [isCheckingSlug, startSlugCheck] = useTransition();

  function handleSuccess(state: AdminActionState) {
    if (state.status === "success") {
      toast.success(state.message ?? "Saved.");
      router.push("/lalit/projects" as Route);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }

  return (
    <EntityForm
      schema={projectCreateSchema}
      defaultValues={defaultValues}
      action={action}
      onSuccess={handleSuccess}
      submitLabel={mode === "create" ? "Create project" : "Save changes"}
    >
      {(form) => {
        const slugValue = form.watch("slug");
        const titleValue = form.watch("title");
        const isVisible = form.watch("isVisible");

        function checkSlug() {
          const slug = form.getValues("slug");
          if (!slug) return;
          setSlugStatus("checking");
          startSlugCheck(async () => {
            const state = await checkSlugAvailable(slug, projectId);
            if (state.status === "success") {
              setSlugStatus(state.data?.available ? "available" : "taken");
            } else {
              setSlugStatus("idle");
            }
          });
        }

        return (
          <div className="flex flex-col gap-6">
            {mode === "edit" && slugValue && (
              <div className="flex items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Live preview
                </span>
                {isVisible ? (
                  <Link
                    href={`/projects/${slugValue}` as Route}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    /projects/{slugValue}
                    <ExternalLink className="size-3.5" aria-hidden />
                  </Link>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    /projects/{slugValue} (hidden — not visible on the site)
                  </span>
                )}
              </div>
            )}

            <TextField control={form.control} name="title" label="Title" required />

            <div className="flex flex-col gap-2">
              <div onBlur={checkSlug}>
                <SlugField
                  control={form.control}
                  name="slug"
                  label="Slug"
                  sourceValue={titleValue}
                  placeholder={titleValue ? slugify(titleValue) : "project-slug"}
                />
              </div>
              {slugStatus !== "idle" && (
                <p
                  className={cn(
                    "text-xs",
                    slugStatus === "taken" && "text-destructive",
                    slugStatus === "available" && "text-chart-5",
                    slugStatus === "checking" && "text-muted-foreground"
                  )}
                >
                  {slugStatus === "checking" && "Checking availability…"}
                  {slugStatus === "available" && "Slug is available."}
                  {slugStatus === "taken" && "That slug is already in use."}
                </p>
              )}
            </div>

            <TextareaField
              control={form.control}
              name="summary"
              label="Summary"
              placeholder="One or two sentences for the project card."
              maxLength={200}
            />

            <DescriptionField control={form.control} name="description" />

            <TagsField
              control={form.control}
              name="tech"
              label="Tech stack"
              placeholder="Add a technology and press Enter"
            />

            <CategoryField
              control={form.control}
              name="category"
              options={categoryOptions}
            />

            <Controller
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="imageUrl">Cover image</FieldLabel>
                  <ImageUploader
                    value={typeof field.value === "string" ? field.value : undefined}
                    onChange={field.onChange}
                    folder="portfolio/projects"
                    aspect="video"
                  />
                </Field>
              )}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                control={form.control}
                name="githubUrl"
                label="GitHub URL"
                placeholder="https://github.com/…"
              />
              <TextField
                control={form.control}
                name="liveUrl"
                label="Live URL"
                placeholder="https://…"
              />
            </div>

            <DateField control={form.control} name="startDate" label="Start date" />

            {mode === "edit" && typeof viewCount === "number" && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Views</span>
                <Badge variant="secondary">{viewCount.toLocaleString()}</Badge>
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <SwitchField
                control={form.control}
                name="featured"
                label="Featured"
                description="Highlighted on the homepage."
              />
              <SwitchField
                control={form.control}
                name="isVisible"
                label="Visible"
                description="Shown on the public site."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" asChild>
                <Link href={"/lalit/projects" as Route}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isCheckingSlug}>
                {mode === "create" ? "Create project" : "Save changes"}
              </Button>
            </div>
          </div>
        );
      }}
    </EntityForm>
  );
}
