"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";
import Link from "next/link";
import { toast } from "sonner";
import type { z } from "zod";

import type { AdminActionState } from "@/types/admin";

import { EntityForm } from "@/components/admin/entity-form";
import {
  TextField,
  TextareaField,
  DateField,
  SwitchField,
} from "@/components/admin/form-fields";
import { Button } from "@/components/ui/button";

import { educationFormSchema } from "./schema";

type EducationFormValues = z.input<typeof educationFormSchema>;
type EducationFormOutput = z.output<typeof educationFormSchema>;

export interface EducationFormProps {
  mode: "create" | "edit";
  defaultValues: EducationFormValues;
  action: (values: EducationFormOutput) => Promise<AdminActionState>;
}

export function EducationForm({ mode, defaultValues, action }: EducationFormProps) {
  const router = useRouter();

  function handleSuccess(state: AdminActionState) {
    if (state.status === "success") {
      toast.success(state.message ?? "Saved.");
      router.push("/lalit/education" as Route);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }

  return (
    <EntityForm
      schema={educationFormSchema}
      defaultValues={defaultValues}
      action={action}
      onSuccess={handleSuccess}
    >
      {(form) => (
        <div className="flex flex-col gap-6">
          <TextField control={form.control} name="institution" label="Institution" required />

          <div className="grid gap-6 sm:grid-cols-2">
            <TextField control={form.control} name="degree" label="Degree" required />
            <TextField control={form.control} name="field" label="Field of study" required />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <DateField control={form.control} name="startDate" label="Start date" />
            <DateField
              control={form.control}
              name="endDate"
              label="End date"
              description="Leave empty for “present”."
            />
          </div>

          <TextField control={form.control} name="grade" label="Grade" />
          <TextareaField control={form.control} name="description" label="Description" />
          <SwitchField control={form.control} name="isVisible" label="Visible" />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" asChild>
              <Link href={"/lalit/education" as Route}>Cancel</Link>
            </Button>
            <Button type="submit">
              {mode === "create" ? "Create entry" : "Save changes"}
            </Button>
          </div>
        </div>
      )}
    </EntityForm>
  );
}
