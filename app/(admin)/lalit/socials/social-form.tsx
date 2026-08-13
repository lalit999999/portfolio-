"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { EntityForm } from "@/components/admin/entity-form";
import { TextField, SwitchField, NumberField } from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { socialCreateSchema, socialUpdateSchema } from "@/lib/validators/social";
import { brandIconMap } from "@/lib/icons";
import type { SerializedSocial } from "@/types/models";
import { createSocial, updateSocial } from "./actions";
import { SocialIconPreview } from "./social-icon-preview";

const ICON_OPTIONS = Object.keys(brandIconMap)
  .sort()
  .map((key) => ({ label: key, value: key }));

export function SocialForm({ social }: { social?: SerializedSocial }) {
  const router = useRouter();
  const schema = social ? socialUpdateSchema : socialCreateSchema;

  return (
    <EntityForm
      schema={schema}
      defaultValues={{
        name: social?.name ?? "",
        url: social?.url ?? "",
        iconName: social?.iconName ?? "",
        handle: social?.handle ?? "",
        order: social?.order ?? 0,
        isVisible: social?.isVisible ?? true,
      }}
      action={async (values) => {
        const state = social
          ? await updateSocial(social._id, values)
          : await createSocial(values);
        if (state.status === "success") {
          toast.success(state.message ?? "Saved.");
          router.push("/lalit/socials");
          router.refresh();
        } else if (state.status === "error") {
          toast.error(state.message);
        }
        return state;
      }}
      cancelHref="/lalit/socials"
    >
      {(form) => (
        <div className="flex flex-col gap-6">
          <TextField control={form.control} name="name" label="Name" required />
          <TextField control={form.control} name="url" label="URL" required placeholder="https://…" />

          <Field>
            <FieldLabel>Icon</FieldLabel>
            <div className="flex items-center gap-3">
              <SocialIconPreview iconName={form.watch("iconName")} />
              <select
                className="h-9 flex-1 rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.watch("iconName") ?? ""}
                onChange={(e) =>
                  form.setValue("iconName", e.target.value, { shouldDirty: true })
                }
              >
                <option value="">— none —</option>
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <FieldDescription>
              Icons come from simple-icons. If the icon you want isn&apos;t listed (e.g.
              LinkedIn), the public site falls back to a neutral glyph.
            </FieldDescription>
          </Field>

          <TextField control={form.control} name="handle" label="Handle" placeholder="@username" />
          <NumberField control={form.control} name="order" label="Order" />
          <SwitchField control={form.control} name="isVisible" label="Visible on site" />

          <div className="flex items-center gap-2">
            <Button type="submit">{social ? "Save changes" : "Create social"}</Button>
            <Button variant="outline" asChild>
              <a href="/lalit/socials">Cancel</a>
            </Button>
          </div>
        </div>
      )}
    </EntityForm>
  );
}
