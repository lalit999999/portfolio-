"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Send } from "lucide-react";

import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitContactForm, type ContactActionState } from "./actions";

const initialState: ContactActionState = { success: false };

function toFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }));
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-fit">
      {pending ? "Sending..." : "Send message"}
      <Send aria-hidden className="size-4" />
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const fields = state.error?.fields;

  useEffect(() => {
    if (state.success) {
      toast.success("Message sent — I'll get back to you soon.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-6">
      {/* Honeypot: hidden from sighted and screen-reader users, bots fill every field. */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <FieldGroup>
        <Field data-invalid={fields?.name ? "true" : undefined}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <FieldContent>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              aria-invalid={Boolean(fields?.name)}
            />
            <FieldError errors={toFieldErrors(fields?.name)} />
          </FieldContent>
        </Field>

        <Field data-invalid={fields?.email ? "true" : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
              aria-invalid={Boolean(fields?.email)}
            />
            <FieldError errors={toFieldErrors(fields?.email)} />
          </FieldContent>
        </Field>

        <Field data-invalid={fields?.subject ? "true" : undefined}>
          <FieldLabel htmlFor="subject">Subject</FieldLabel>
          <FieldContent>
            <Input
              id="subject"
              name="subject"
              maxLength={200}
              aria-invalid={Boolean(fields?.subject)}
            />
            <FieldError errors={toFieldErrors(fields?.subject)} />
          </FieldContent>
        </Field>

        <Field data-invalid={fields?.message ? "true" : undefined}>
          <FieldLabel htmlFor="message">Message</FieldLabel>
          <FieldContent>
            <Textarea
              id="message"
              name="message"
              required
              maxLength={5000}
              rows={5}
              aria-invalid={Boolean(fields?.message)}
            />
            <FieldError errors={toFieldErrors(fields?.message)} />
          </FieldContent>
        </Field>
      </FieldGroup>

      <SubmitButton />
    </form>
  );
}
