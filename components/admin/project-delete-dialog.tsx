"use client";

import { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export interface ProjectDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  onConfirm: () => void | Promise<void>;
}

export function ProjectDeleteDialog({
  open,
  onOpenChange,
  projectTitle,
  onConfirm,
}: ProjectDeleteDialogProps) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const matches = value.length > 0 && value === projectTitle;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setValue("");
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{projectTitle}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the project and cannot be undone. Type
            the project title to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={projectTitle}
          autoComplete="off"
        />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!matches || isPending}
            onClick={() => startTransition(async () => onConfirm())}
          >
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
