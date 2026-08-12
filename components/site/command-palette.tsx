"use client";

import * as React from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Award,
  FileText,
  FolderKanban,
  Home,
  Laptop,
  Layers,
  Mail,
  Moon,
  Newspaper,
  Sun,
} from "lucide-react";

import type { SerializedProject, SerializedSocial } from "@/types/models";
import { getBrandIcon } from "@/lib/icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export interface CommandPaletteProps {
  projects: SerializedProject[];
  socials: SerializedSocial[];
  resumeUrl?: string;
  showBlogs?: boolean;
}

export function CommandPalette({
  projects,
  socials,
  resumeUrl,
  showBlogs = true,
}: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (event.key === "k" && (event.metaKey || event.ctrlKey) && !isEditable) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    function onToggle() {
      setOpen((value) => !value);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("toggle-command-palette", onToggle);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("toggle-command-palette", onToggle);
    };
  }, []);

  const runCommand = React.useCallback((action: () => void) => {
    setOpen(false);
    action();
  }, []);

  const github = socials.find((social) =>
    (social.iconName ?? social.name).toLowerCase().includes("github")
  );
  const githubIcon = getBrandIcon("github");

  const pages: { label: string; href: Route; icon: typeof Home }[] = [
    { label: "Home", href: "/" as Route, icon: Home },
    { label: "Projects", href: "/projects" as Route, icon: FolderKanban },
    { label: "Skills", href: "/skills" as Route, icon: Layers },
    { label: "Certifications", href: "/certifications" as Route, icon: Award },
    ...(showBlogs
      ? [{ label: "Blogs", href: "/blogs" as Route, icon: Newspaper }]
      : []),
    { label: "Contact", href: "/contact" as Route, icon: Mail },
  ];

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Jump to a page or project"
    >
      <CommandInput placeholder="Search pages, projects..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((page) => (
            <CommandItem
              key={page.href}
              value={page.label}
              onSelect={() => runCommand(() => router.push(page.href))}
            >
              <page.icon aria-hidden />
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {projects.length > 0 ? (
          <CommandGroup heading="Projects">
            {projects.map((project) => (
              <CommandItem
                key={project._id}
                value={project.title}
                onSelect={() =>
                  runCommand(() =>
                    router.push(`/projects/${project.slug}` as Route)
                  )
                }
              >
                <FolderKanban aria-hidden />
                <span className="flex flex-col">
                  <span>{project.title}</span>
                  {project.tech.length > 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {project.tech.slice(0, 3).join(", ")}
                    </span>
                  ) : null}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        <CommandGroup heading="Theme">
          <CommandItem value="Light" onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun aria-hidden />
            Light
          </CommandItem>
          <CommandItem value="Dark" onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon aria-hidden />
            Dark
          </CommandItem>
          <CommandItem value="System" onSelect={() => runCommand(() => setTheme("system"))}>
            <Laptop aria-hidden />
            System
          </CommandItem>
        </CommandGroup>

        {github || resumeUrl ? (
          <CommandGroup heading="External">
            {github ? (
              <CommandItem
                value="GitHub"
                onSelect={() =>
                  runCommand(() =>
                    window.open(github.url, "_blank", "noopener,noreferrer")
                  )
                }
              >
                {githubIcon ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4">
                    <path d={githubIcon.path} />
                  </svg>
                ) : null}
                GitHub
              </CommandItem>
            ) : null}
            {resumeUrl ? (
              <CommandItem
                value="Resume"
                onSelect={() =>
                  runCommand(() =>
                    window.open(resumeUrl, "_blank", "noopener,noreferrer")
                  )
                }
              >
                <FileText aria-hidden />
                Resume
              </CommandItem>
            ) : null}
          </CommandGroup>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
