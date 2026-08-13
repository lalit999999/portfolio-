"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { certColorMap } from "@/lib/icons";
import type { AdminActionState } from "@/types/admin";

import { EntityForm } from "@/components/admin/entity-form";
import {
  TextField,
  DateField,
  TagsField,
  SwitchField,
} from "@/components/admin/form-fields";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { certificationClientSchema, CERT_COLORS_CLIENT } from "./client-schema";
import type { certificationFormSchema } from "./schema";

type CertificationFormValues = z.input<typeof certificationFormSchema>;
type CertificationFormOutput = z.output<typeof certificationFormSchema>;

export interface CertificationFormProps {
  mode: "create" | "edit";
  defaultValues: CertificationFormValues;
  action: (values: CertificationFormOutput) => Promise<AdminActionState>;
}

export function CertificationForm({
  mode,
  defaultValues,
  action,
}: CertificationFormProps) {
  const router = useRouter();

  function handleSuccess(state: AdminActionState) {
    if (state.status === "success") {
      toast.success(state.message ?? "Saved.");
      router.push("/lalit/certifications" as Route);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }

  return (
    <EntityForm
      schema={certificationClientSchema}
      defaultValues={defaultValues}
      action={action}
      onSuccess={handleSuccess}
    >
      {(form) => (
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField control={form.control} name="title" label="Title" required />
            <TextField control={form.control} name="issuer" label="Issuer" required />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <DateField control={form.control} name="issueDate" label="Issue date" />
            <DateField control={form.control} name="expiryDate" label="Expiry date" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              control={form.control}
              name="credentialId"
              label="Credential ID"
            />
            <TextField
              control={form.control}
              name="credentialUrl"
              label="Credential URL"
              placeholder="https://…"
            />
          </div>

          <Controller
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="imageUrl">Badge image</FieldLabel>
                <ImageUploader
                  value={typeof field.value === "string" ? field.value : undefined}
                  onChange={field.onChange}
                  folder="portfolio/certifications"
                  aspect="square"
                />
              </Field>
            )}
          />

          <TagsField
            control={form.control}
            name="skills"
            label="Related skills"
            placeholder="Add a skill and press Enter"
          />

          <Controller
            control={form.control}
            name="color"
            render={({ field, fieldState }) => (
              <Field data-invalid={!!fieldState.error}>
                <FieldLabel htmlFor="color">Color</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="color" className="w-full">
                    <SelectValue placeholder="Choose a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {CERT_COLORS_CLIENT.map((color) => {
                      const swatch = certColorMap[color];
                      return (
                        <SelectItem key={color} value={color}>
                          <span className="flex items-center gap-2">
                            <span
                              className={`size-3 rounded-full border ${swatch.bg} ${swatch.border}`}
                              aria-hidden
                            />
                            {color}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FieldError errors={fieldState.error ? [fieldState.error] : []} />
              </Field>
            )}
          />

          <SwitchField control={form.control} name="isVisible" label="Visible" />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href={"/lalit/certifications" as Route}>Cancel</Link>
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create certification" : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </EntityForm>
  );
}
