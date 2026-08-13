"use client";

// STUB — Phase 4 Session A owns this file. Do not edit it from another session.
import type * as React from "react";
import type { Route } from "next";
import type { DefaultValues, FieldValues, Resolver, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import type { AdminActionState } from "@/types/admin";

// TSchema extends z.ZodType<FieldValues, FieldValues>, not the bare z.ZodType:
// zod v4's ZodType<Output = unknown, Input = unknown, ...> defaults both
// unconstrained, so z.input<TSchema> resolved to `unknown` and failed
// react-hook-form's FieldValues bound on useForm/UseFormReturn below.
export interface EntityFormProps<TSchema extends z.ZodType<FieldValues, FieldValues>> {
  schema: TSchema;
  defaultValues: DefaultValues<z.input<TSchema>>;
  action: (values: z.output<TSchema>) => Promise<AdminActionState>;
  children: (form: UseFormReturn<z.input<TSchema>>) => React.ReactNode;
  submitLabel?: string;
  cancelHref?: Route;
  onSuccess?: (state: AdminActionState) => void;
  successMessage?: string;
}

export function EntityForm<TSchema extends z.ZodType<FieldValues, FieldValues>>({
  schema,
  defaultValues,
  action,
  children,
  submitLabel = "Save",
  onSuccess,
}: EntityFormProps<TSchema>) {
  // zodResolver's overloaded generic signature infers against TSchema's
  // constraint (FieldValues) rather than TSchema itself when the schema's
  // type is a type parameter, not a concrete schema — the cast bridges what
  // TS can't prove but is true by construction: schema is a TSchema, so this
  // resolver really does produce z.input<TSchema>.
  const form = useForm<z.input<TSchema>>({
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
