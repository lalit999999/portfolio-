"use client";

import type * as React from "react";
import { useEffect, useTransition } from "react";
import type { Route } from "next";
import Link from "next/link";
import type {
  DefaultValues,
  FieldValues,
  Resolver,
  UseFormReturn,
} from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { AdminActionState } from "@/types/admin";

export interface EntityFormProps<TSchema extends z.ZodType<unknown, FieldValues>> {
  schema: TSchema;
  defaultValues: DefaultValues<z.input<TSchema>>;
  action: (values: z.output<TSchema>) => Promise<AdminActionState>;
  children: (form: UseFormReturn<z.input<TSchema>>) => React.ReactNode;
  submitLabel?: string;
  cancelHref?: Route;
  onSuccess?: (state: AdminActionState) => void;
  successMessage?: string;
}

export function EntityForm<TSchema extends z.ZodType<unknown, FieldValues>>({
  schema,
  defaultValues,
  action,
  children,
  submitLabel = "Save",
  cancelHref,
  onSuccess,
  successMessage = "Saved.",
}: EntityFormProps<TSchema>) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.input<TSchema>>({
    // react-hook-form's zodResolver widens the output to a generic FieldValues
    // when the schema type param is itself generic; narrow it back explicitly
    // rather than losing type safety with `as any`.
    resolver: zodResolver(schema) as unknown as Resolver<z.input<TSchema>>,
    defaultValues,
    mode: "onBlur",
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    if (!isDirty) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const state = await action(values as z.output<TSchema>);

      if (state.status === "error") {
        if (state.fields) {
          for (const [name, messages] of Object.entries(state.fields)) {
            form.setError(name as never, { message: messages[0] });
          }
        } else {
          toast.error(state.message);
        }
        onSuccess?.(state);
        return;
      }

      if (state.status === "success") {
        toast.success(state.message ?? successMessage);
        form.reset(values);
      }
      onSuccess?.(state);
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {children(form)}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          {submitLabel}
        </Button>
        {cancelHref && (
          <Button type="button" variant="ghost" asChild disabled={isPending}>
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        )}
      </div>
    </form>
  );
}
