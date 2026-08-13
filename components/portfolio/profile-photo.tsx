"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import type { SerializedProfile } from "@/types/models";
import { getBrandIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  EASE_BACK_OUT,
  Orbit,
  Tilt,
  type OrbitItem,
} from "@/components/motion";

const STACK_SLUGS = ["nodejs", "mongodb", "docker", "react"] as const;

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export interface ProfilePhotoProps {
  profile: SerializedProfile;
  className?: string;
}

export function ProfilePhoto({ profile, className }: ProfilePhotoProps) {
  const reduceMotion = useReducedMotion();

  const ringStyle: CSSProperties = {
    background:
      "conic-gradient(from var(--ring-angle, 0deg), var(--color-primary), transparent 45%, var(--color-primary))",
    ...(reduceMotion ? {} : { animation: "ring-spin 8s linear infinite" }),
  };

  // Saturated orange reads much hotter than a diffuse glow can afford, so
  // the blurred halo gets its own dimmer gradient — the crisp ring border
  // above keeps full strength.
  const glowStyle: CSSProperties = {
    background:
      "conic-gradient(from var(--ring-angle, 0deg), oklch(from var(--color-primary) l c h / 0.55), transparent 45%, oklch(from var(--color-primary) l c h / 0.55))",
    ...(reduceMotion ? {} : { animation: "ring-spin 8s linear infinite" }),
  };

  const orbitItems: OrbitItem[] = STACK_SLUGS.map((slug) => {
    const icon = getBrandIcon(slug);
    return {
      id: slug,
      node: icon ? (
        <span
          className="flex size-8 items-center justify-center rounded-full border border-border/70 bg-background shadow-sm"
          style={{ color: `#${icon.hex}` }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
            className="size-4"
          >
            <path d={icon.path} />
          </svg>
        </span>
      ) : null,
    };
  });

  return (
    <div className={cn("relative mx-auto size-48 sm:size-56", className)}>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 scale-[1.15] rounded-full blur-2xl",
          reduceMotion && "opacity-40",
        )}
        style={
          reduceMotion
            ? glowStyle
            : {
                ...glowStyle,
                animation: `${glowStyle.animation}, glow-breathe 4s ease-in-out infinite`,
              }
        }
      />

      <div
        aria-hidden
        className="absolute inset-0 rounded-full p-[3px]"
        style={ringStyle}
      >
        <div className="size-full rounded-full bg-background" />
      </div>

      <Tilt
        max={12}
        disabled={!!reduceMotion}
        className="absolute inset-[6px] overflow-hidden rounded-full"
      >
        <motion.div
          initial={
            reduceMotion
              ? false
              : { opacity: 0, scale: 0.8, filter: "blur(10px)" }
          }
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: EASE_BACK_OUT }}
          className="relative size-full overflow-hidden rounded-full bg-muted"
        >
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.name}
              fill
              priority
              sizes="(min-width: 640px) 224px, 192px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
              {initialsOf(profile.name)}
            </div>
          )}
        </motion.div>
      </Tilt>

      <Orbit
        items={orbitItems}
        radius={110}
        duration={20}
        counterRotate
        className="absolute inset-0"
      />
    </div>
  );
}
