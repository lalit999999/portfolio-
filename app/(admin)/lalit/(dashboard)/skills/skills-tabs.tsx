"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Pencil, Plus, Trash2, Sparkles, Layers } from "lucide-react";
import { toast } from "sonner";

import type { SerializedSkill, SerializedSkillCategory } from "@/types/models";
import { getIcon, getBrandIcon } from "@/lib/icons";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { SortableList } from "@/components/admin/sortable-list";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

import { SkillCategoryDialog } from "./category-dialog";
import { SkillDialog } from "./skill-dialog";
import {
  createSkill,
  deleteSkill,
  deleteSkillCategory,
  toggleSkillCategoryVisibility,
  toggleSkillVisibility,
  updateSkill,
} from "./actions";

async function reorder(collection: "skills" | "skillcategories", ids: string[]) {
  const res = await fetch("/api/admin/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ collection, ids }),
  });
  if (!res.ok) throw new Error("Reorder request failed.");
  return res.json();
}

export function SkillsTabs({
  initialCategories,
  initialSkills,
}: {
  initialCategories: SerializedSkillCategory[];
  initialSkills: SerializedSkill[];
}) {
  const router = useRouter();
  const [nextCategoryOrder] = useState(
    () => (initialCategories.at(-1)?.order ?? -1) + 1
  );

  function refresh() {
    router.refresh();
  }

  const categoryOptions = initialCategories.map((c) => ({ label: c.name, value: c._id }));

  const skillsByCategory = useMemo(() => {
    return initialCategories.map((category) => ({
      category,
      skills: initialSkills
        .filter((s) => s.category === category._id)
        .sort((a, b) => a.order - b.order),
    }));
  }, [initialCategories, initialSkills]);

  async function handleCategoryReorder(ids: string[]) {
    try {
      await reorder("skillcategories", ids);
      refresh();
    } catch {
      toast.error("Couldn't save the new order.");
    }
  }

  async function handleSkillReorder(ids: string[]) {
    try {
      await reorder("skills", ids);
      refresh();
    } catch {
      toast.error("Couldn't save the new order.");
    }
  }

  async function handleDeleteCategory(id: string) {
    const state = await deleteSkillCategory(id);
    if (state.status === "error") toast.error(state.message);
    else {
      toast.success("Category deleted.");
      refresh();
    }
  }

  async function handleDeleteSkill(id: string) {
    const state = await deleteSkill(id);
    if (state.status === "error") toast.error(state.message);
    else {
      toast.success("Skill deleted.");
      refresh();
    }
  }

  return (
    <Tabs defaultValue="categories">
      <TabsList>
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="flex flex-col gap-4 pt-4">
        <div className="flex justify-end">
          <SkillCategoryDialog
            mode="create"
            defaultValues={{
              name: "",
              slug: "",
              iconName: "",
              description: "",
              order: nextCategoryOrder,
              isVisible: true,
            }}
            trigger={
              <Button size="sm">
                <Plus aria-hidden /> New category
              </Button>
            }
          />
        </div>

        {initialCategories.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Layers aria-hidden />
              </EmptyMedia>
              <EmptyTitle>No categories yet</EmptyTitle>
              <EmptyDescription>
                Create a category before adding skills.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <SortableList
            items={initialCategories}
            getId={(row) => row._id}
            collection="skillcategories"
            onReordered={handleCategoryReorder}
            renderItem={(category) => {
              const Icon = category.iconName ? getIcon(category.iconName) : null;
              return (
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                  <GripVertical className="size-4 text-muted-foreground" aria-hidden />
                  {Icon && <Icon className="size-4 text-muted-foreground" aria-hidden />}
                  <div className="flex flex-1 flex-col">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      /{category.slug}
                    </span>
                  </div>
                  <Switch
                    checked={category.isVisible}
                    onCheckedChange={async () => {
                      const state = await toggleSkillCategoryVisibility(category._id);
                      if (state.status === "error") toast.error(state.message);
                      else refresh();
                    }}
                    aria-label={`Toggle visibility for ${category.name}`}
                  />
                  <SkillCategoryDialog
                    mode="edit"
                    categoryId={category._id}
                    defaultValues={{
                      name: category.name,
                      slug: category.slug,
                      iconName: category.iconName ?? "",
                      description: category.description ?? "",
                      order: category.order,
                      isVisible: category.isVisible,
                    }}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Edit category">
                        <Pencil aria-hidden />
                      </Button>
                    }
                  />
                  <ConfirmDialog
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Delete category">
                        <Trash2 aria-hidden />
                      </Button>
                    }
                    title={`Delete "${category.name}"?`}
                    description="Categories with skills can't be deleted — move or delete those skills first."
                    confirmLabel="Delete"
                    variant="destructive"
                    onConfirm={() => handleDeleteCategory(category._id)}
                  />
                </div>
              );
            }}
          />
        )}
      </TabsContent>

      <TabsContent value="skills" className="flex flex-col gap-6 pt-4">
        {initialCategories.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sparkles aria-hidden />
              </EmptyMedia>
              <EmptyTitle>Add a category first</EmptyTitle>
              <EmptyDescription>
                Skills belong to a category — create one on the Categories tab.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          skillsByCategory.map(({ category, skills }) => (
            <div key={category._id} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {category.name}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {skills.length} skill{skills.length === 1 ? "" : "s"}
                  </span>
                </h3>
                <SkillDialog
                  mode="create"
                  categoryOptions={categoryOptions}
                  defaultValues={{
                    name: "",
                    category: category._id,
                    iconName: "",
                    brandSlug: "",
                    proficiency: 50,
                    order: (skills.at(-1)?.order ?? -1) + 1,
                    isVisible: true,
                  }}
                  action={createSkill}
                  trigger={
                    <Button size="sm" variant="outline">
                      <Plus aria-hidden /> Add skill
                    </Button>
                  }
                />
              </div>

              {skills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No skills in this category yet.</p>
              ) : (
                <SortableList
                  items={skills}
                  getId={(row) => row._id}
                  collection="skills"
                  onReordered={handleSkillReorder}
                  renderItem={(skill) => {
                    const Icon = skill.iconName ? getIcon(skill.iconName) : null;
                    const brandIcon = skill.brandSlug ? getBrandIcon(skill.brandSlug) : null;
                    return (
                      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                        <GripVertical className="size-4 text-muted-foreground" aria-hidden />
                        {brandIcon ? (
                          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
                            <path d={brandIcon.path} />
                          </svg>
                        ) : Icon ? (
                          <Icon className="size-4 text-muted-foreground" aria-hidden />
                        ) : null}
                        <span className="flex-1 font-medium">{skill.name}</span>
                        <Badge variant="secondary">{skill.proficiency}%</Badge>
                        <Switch
                          checked={skill.isVisible}
                          onCheckedChange={async () => {
                            const state = await toggleSkillVisibility(skill._id);
                            if (state.status === "error") toast.error(state.message);
                            else refresh();
                          }}
                          aria-label={`Toggle visibility for ${skill.name}`}
                        />
                        <SkillDialog
                          mode="edit"
                          skillId={skill._id}
                          categoryOptions={categoryOptions}
                          defaultValues={{
                            name: skill.name,
                            category: skill.category,
                            iconName: skill.iconName ?? "",
                            brandSlug: skill.brandSlug ?? "",
                            proficiency: skill.proficiency,
                            order: skill.order,
                            isVisible: skill.isVisible,
                          }}
                          action={(values) => updateSkill(skill._id, values)}
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label="Edit skill">
                              <Pencil aria-hidden />
                            </Button>
                          }
                        />
                        <ConfirmDialog
                          trigger={
                            <Button variant="ghost" size="icon-sm" aria-label="Delete skill">
                              <Trash2 aria-hidden />
                            </Button>
                          }
                          title={`Delete "${skill.name}"?`}
                          confirmLabel="Delete"
                          variant="destructive"
                          onConfirm={() => handleDeleteSkill(skill._id)}
                        />
                      </div>
                    );
                  }}
                />
              )}
            </div>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
}
