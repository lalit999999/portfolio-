"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

import { EntityForm } from "@/components/admin/entity-form";
import { TextField, TagsField, SwitchField } from "@/components/admin/form-fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { profileCreateSchema, profileUpdateSchema } from "@/lib/validators/profile";
import type { SerializedProfile } from "@/types/models";
import { createProfile, updateProfile } from "./actions";

export function ProfileForm({ profile }: { profile: SerializedProfile | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const schema = profile ? profileUpdateSchema : profileCreateSchema;

  return (
    <EntityForm
      schema={schema}
      defaultValues={{
        name: profile?.name ?? "",
        tagline: profile?.tagline ?? "",
        description: profile?.description ?? [],
        avatarUrl: profile?.avatarUrl ?? "",
        location: profile?.location ?? "",
        email: profile?.email ?? "",
        resumeUrl: profile?.resumeUrl ?? "",
        currentlyLearning: profile?.currentlyLearning ?? [],
        availableForWork: profile?.availableForWork ?? true,
      }}
      action={async (values) => {
        const state = profile
          ? await updateProfile(values)
          : await createProfile(values);
        if (state.status === "success") {
          toast.success(state.message ?? "Saved.");
          startTransition(() => router.refresh());
        } else if (state.status === "error") {
          toast.error(state.message);
        }
        return state;
      }}
    >
      {(form) => (
        <div className="flex flex-col gap-6">
          <TextField control={form.control} name="name" label="Name" required />
          <TextField control={form.control} name="tagline" label="Tagline" required />
          <DescriptionListField form={form} />
          <Field>
            <FieldLabel>Avatar</FieldLabel>
            <ImageUploader
              value={form.watch("avatarUrl")}
              onChange={(url) => form.setValue("avatarUrl", url, { shouldDirty: true })}
              folder="portfolio/profile"
              aspect="square"
            />
          </Field>
          <TextField control={form.control} name="location" label="Location" />
          <TextField control={form.control} name="email" label="Email" />
          <TagsField
            control={form.control}
            name="currentlyLearning"
            label="Currently learning"
            placeholder="Add a topic and press Enter"
          />
          <SwitchField
            control={form.control}
            name="availableForWork"
            label="Available for work"
          />
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isPending}>
              {profile ? "Save changes" : "Create profile"}
            </Button>
            <Button variant="outline" asChild>
              <a href="/" target="_blank" rel="noreferrer">
                Preview live site
              </a>
            </Button>
          </div>
        </div>
      )}
    </EntityForm>
  );
}

function DescriptionListField({
  form,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}) {
  const paragraphs: string[] = form.watch("description") ?? [];
  const [draft, setDraft] = useState("");

  function set(next: string[]) {
    form.setValue("description", next, { shouldDirty: true });
  }

  return (
    <Field>
      <FieldLabel>Description</FieldLabel>
      <FieldDescription>
        One paragraph per entry, rendered in order on the homepage.
      </FieldDescription>
      <div className="flex flex-col gap-2">
        {paragraphs.map((paragraph, index) => (
          <div key={index} className="flex items-start gap-2">
            <textarea
              className="min-h-16 flex-1 rounded-md border border-input bg-transparent p-2 text-sm outline-none"
              value={paragraph}
              onChange={(e) => {
                const next = [...paragraphs];
                next[index] = e.target.value;
                set(next);
              }}
            />
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={index === 0}
                onClick={() => {
                  const next = [...paragraphs];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  set(next);
                }}
                aria-label="Move up"
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={index === paragraphs.length - 1}
                onClick={() => {
                  const next = [...paragraphs];
                  [next[index + 1], next[index]] = [next[index], next[index + 1]];
                  set(next);
                }}
                aria-label="Move down"
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => set(paragraphs.filter((_, i) => i !== index))}
                aria-label="Remove paragraph"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        <div className="flex items-start gap-2">
          <textarea
            className="min-h-16 flex-1 rounded-md border border-dashed border-input bg-transparent p-2 text-sm outline-none"
            placeholder="Add a new paragraph…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              if (!draft.trim()) return;
              set([...paragraphs, draft.trim()]);
              setDraft("");
            }}
            aria-label="Add paragraph"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
    </Field>
  );
}
