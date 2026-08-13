"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { toast } from "sonner";

import { skillCreateSchema } from "@/lib/validators/skill";
import type { AdminActionState } from "@/types/admin";
import { iconMap, getIcon, brandIconMap, getBrandIcon } from "@/lib/icons";

import { EntityForm } from "@/components/admin/entity-form";
import { TextField, SwitchField, SelectField } from "@/components/admin/form-fields";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const iconOptions = Object.keys(iconMap).map((name) => ({ label: name, value: name }));
const brandOptions = Object.keys(brandIconMap).map((name) => ({
  label: name,
  value: name,
}));

export interface SkillDialogValues {
  name: string;
  category: string;
  iconName?: string;
  brandSlug?: string;
  proficiency: number;
  order: number;
  isVisible: boolean;
}

export interface SkillDialogProps {
  trigger: React.ReactNode;
  mode: "create" | "edit";
  skillId?: string;
  defaultValues: SkillDialogValues;
  categoryOptions: { label: string; value: string }[];
  action: (values: SkillDialogValues) => Promise<AdminActionState>;
}

export function SkillDialog({
  trigger,
  mode,
  defaultValues,
  categoryOptions,
  action,
}: SkillDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSuccess(state: AdminActionState) {
    if (state.status === "success") {
      toast.success(state.message ?? "Saved.");
      setOpen(false);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New skill" : "Edit skill"}</DialogTitle>
          <DialogDescription>
            Shown on the public skills page, grouped by category.
          </DialogDescription>
        </DialogHeader>
        <EntityForm
          schema={skillCreateSchema}
          defaultValues={defaultValues}
          action={action}
          onSuccess={handleSuccess}
        >
          {(form) => {
            const iconValue = form.watch("iconName");
            const brandValue = form.watch("brandSlug");
            const Icon = iconValue ? getIcon(iconValue) : null;
            const brandIcon = brandValue ? getBrandIcon(brandValue) : null;

            return (
              <div className="flex flex-col gap-5">
                <TextField control={form.control} name="name" label="Name" required />
                <SelectField
                  control={form.control}
                  name="category"
                  label="Category"
                  placeholder="Choose a category"
                  options={categoryOptions}
                  required
                />

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <SelectField
                      control={form.control}
                      name="iconName"
                      label="Icon"
                      placeholder="Optional lucide icon"
                      options={iconOptions}
                    />
                  </div>
                  {Icon && (
                    <div className="mb-1 flex size-9 items-center justify-center rounded-full border border-border bg-muted/40">
                      <Icon className="size-4" aria-hidden />
                    </div>
                  )}
                </div>

                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <SelectField
                      control={form.control}
                      name="brandSlug"
                      label="Brand icon"
                      placeholder="Optional brand icon"
                      options={brandOptions}
                    />
                  </div>
                  <div className="mb-1 flex size-9 items-center justify-center rounded-full border border-border bg-muted/40">
                    {brandIcon ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                        className="size-4"
                      >
                        <path d={brandIcon.path} />
                      </svg>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                <Controller
                  control={form.control}
                  name="proficiency"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={!!fieldState.error}>
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="proficiency">Proficiency</FieldLabel>
                        <span className="text-sm text-muted-foreground">
                          {field.value ?? 0}%
                        </span>
                      </div>
                      <Slider
                        id="proficiency"
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value ?? 0]}
                        onValueChange={([v]) => field.onChange(v)}
                      />
                      <FieldError errors={fieldState.error ? [fieldState.error] : []} />
                    </Field>
                  )}
                />

                <SwitchField control={form.control} name="isVisible" label="Visible" />
                <DialogFooter>
                  <Button type="submit">
                    {mode === "create" ? "Create skill" : "Save changes"}
                  </Button>
                </DialogFooter>
              </div>
            );
          }}
        </EntityForm>
      </DialogContent>
    </Dialog>
  );
}
