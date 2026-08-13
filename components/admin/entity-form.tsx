"use client";

// STUB — Phase 4 Session A owns this file. Do not edit it from another session.
import type * as React from "react";
import type { Route } from "next";
import type {
  DefaultValues,
  FieldValues,
  Resolver,
  UseFormReturn,
} from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

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
  onSuccess,
}: EntityFormProps<TSchema>) {
  const form = useForm<z.input<TSchema>>({
    // react-hook-form's zodResolver widens the output to a generic FieldValues
    // when the schema type param is itself generic; narrow it back explicitly
    // rather than losing type safety with `as any`.
    resolver: zodResolver(schema) as unknown as Resolver<z.input<TSchema>>,
    defaultValues,
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const state = await action(values as z.output<TSchema>);
    onSuccess?.(state);
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {children(form)}
      <button type="submit" className="hidden">
        {submitLabel}
      </button>
    </form>
  );
}
