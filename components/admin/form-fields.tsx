"use client";

// STUB — Phase 4 Session A owns this file. Do not edit it from another session.
import { useState } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { CalendarIcon, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { slugify } from "@/lib/utils/slug";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BaseFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function TextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
}: BaseFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            {...field}
            value={field.value ?? ""}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

export function TextareaField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  maxLength,
}: BaseFieldProps<TFieldValues> & { maxLength?: number }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Textarea
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            {...field}
            value={field.value ?? ""}
          />
          {maxLength && (
            <FieldDescription>
              {(field.value?.length ?? 0)}/{maxLength}
            </FieldDescription>
          )}
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

export function NumberField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
}: BaseFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Input
            id={name}
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            {...field}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.valueAsNumber)}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

export function SwitchField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
}: BaseFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field orientation="horizontal">
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Switch
            id={name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
        </Field>
      )}
    />
  );
}

export function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  options,
}: BaseFieldProps<TFieldValues> & {
  options: { label: string; value: string }[];
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <Select
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger id={name} className="w-full">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}

export function DateField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
}: BaseFieldProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const date: Date | undefined = field.value
          ? new Date(field.value)
          : undefined;
        return (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id={name}
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "w-full justify-start font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon aria-hidden />
                  {date ? date.toLocaleDateString() : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(picked) =>
                    field.onChange(picked ? picked.toISOString() : null)
                  }
                />
              </PopoverContent>
            </Popover>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={fieldState.error ? [fieldState.error] : []} />
          </Field>
        );
      }}
    />
  );
}

export function TagsField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
}: BaseFieldProps<TFieldValues>) {
  const [draft, setDraft] = useState("");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const tags: string[] = field.value ?? [];

        function commit() {
          const value = draft.trim();
          if (value && !tags.includes(value)) {
            field.onChange([...tags, value]);
          }
          setDraft("");
        }

        return (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            <div className="flex flex-wrap gap-2 rounded-md border border-input p-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove ${tag}`}
                    onClick={() =>
                      field.onChange(tags.filter((t) => t !== tag))
                    }
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
              <input
                id={name}
                className="flex-1 min-w-24 bg-transparent text-sm outline-none"
                placeholder={placeholder}
                disabled={disabled}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    commit();
                  }
                }}
                onBlur={commit}
              />
            </div>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={fieldState.error ? [fieldState.error] : []} />
          </Field>
        );
      }}
    />
  );
}

export function SlugField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled,
  sourceValue,
}: BaseFieldProps<TFieldValues> & { sourceValue?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>
          <div className="flex gap-2">
            <Input
              id={name}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              value={field.value ?? ""}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              disabled={disabled || !sourceValue}
              onClick={() =>
                sourceValue && field.onChange(slugify(sourceValue))
              }
            >
              Generate
            </Button>
          </div>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : []} />
        </Field>
      )}
    />
  );
}
