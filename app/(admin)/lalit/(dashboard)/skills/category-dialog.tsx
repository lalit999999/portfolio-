"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { skillCategoryCreateSchema } from "@/lib/validators/skillCategory";
import type { AdminActionState } from "@/types/admin";
import { iconMap, getIcon } from "@/lib/icons";

import { EntityForm } from "@/components/admin/entity-form";
import {
  TextField,
  TextareaField,
  SwitchField,
  SlugField,
  SelectField,
} from "@/components/admin/form-fields";
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

import { createSkillCategory, updateSkillCategory } from "./actions";

const iconOptions = Object.keys(iconMap).map((name) => ({
  label: name,
  value: name,
}));

export interface SkillCategoryDialogValues {
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
  order: number;
  isVisible: boolean;
}

export interface SkillCategoryDialogProps {
  trigger: React.ReactNode;
  mode: "create" | "edit";
  categoryId?: string;
  defaultValues: SkillCategoryDialogValues;
}

export function SkillCategoryDialog({
  trigger,
  mode,
  categoryId,
  defaultValues,
}: SkillCategoryDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const action =
    mode === "create"
      ? createSkillCategory
      : (values: SkillCategoryDialogValues) =>
          updateSkillCategory(categoryId as string, values);

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
          <DialogTitle>
            {mode === "create" ? "New category" : "Edit category"}
          </DialogTitle>
          <DialogDescription>
            Groups skills on the public skills page.
          </DialogDescription>
        </DialogHeader>
        <EntityForm
          schema={skillCategoryCreateSchema}
          defaultValues={defaultValues}
          action={action}
          onSuccess={handleSuccess}
        >
          {(form) => {
            const nameValue = form.watch("name");
            const iconValue = form.watch("iconName");
            const Icon = iconValue ? getIcon(iconValue) : null;

            return (
              <div className="flex flex-col gap-5">
                <TextField control={form.control} name="name" label="Name" required />
                <SlugField
                  control={form.control}
                  name="slug"
                  label="Slug"
                  sourceValue={nameValue}
                />
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <SelectField
                      control={form.control}
                      name="iconName"
                      label="Icon"
                      placeholder="Choose an icon"
                      options={iconOptions}
                    />
                  </div>
                  {Icon && (
                    <div className="mb-1 flex size-9 items-center justify-center rounded-full border border-border bg-muted/40">
                      <Icon className="size-4" aria-hidden />
                    </div>
                  )}
                </div>
                <TextareaField
                  control={form.control}
                  name="description"
                  label="Description"
                />
                <SwitchField control={form.control} name="isVisible" label="Visible" />
                <DialogFooter>
                  <Button type="submit">
                    {mode === "create" ? "Create category" : "Save changes"}
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
