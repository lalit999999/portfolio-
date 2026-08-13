"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { ScrollProgress } from "@/components/motion";

export interface NavItem {
  label: string;
  href: Route;
}

export interface NavbarClientProps {
  name: string;
  navItems: NavItem[];
}

export function NavbarClient({ name, navItems }: NavbarClientProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const lastY = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 80);
    const delta = y - lastY.current;
    if (y > 200 && delta > 0) setHidden(true);
    else if (delta < 0) setHidden(false);
    lastY.current = y;
  });

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <motion.header
      animate={reduceMotion ? undefined : { y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4"
    >
      <div
        className={cn(
          "relative mx-auto flex max-w-6xl flex-col rounded-xl border border-border/70 bg-background/85 text-foreground backdrop-blur-md transition-colors duration-300 supports-backdrop-filter:bg-background/75",
          scrolled &&
            "bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/90"
        )}
        style={{
          boxShadow:
            "0 10px 40px -20px color-mix(in oklch, var(--color-foreground), transparent 85%)",
        }}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-3 px-3 transition-[height] duration-300 sm:px-4",
            scrolled ? "h-14" : "h-18"
          )}
        >
          <Link
            href={"/" as Route}
            className="flex min-w-0 items-center gap-2 rounded-full px-1 py-1 transition-transform duration-300 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Back to home"
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300",
                scrolled ? "size-8 text-xs" : "size-10 text-sm"
              )}
            >
              LG
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-semibold tracking-[0.2em] text-foreground uppercase">
                {name}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.15em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-primary/10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  ) : null}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:inline-flex"
              aria-label="Open command palette"
              onClick={() =>
                window.dispatchEvent(new Event("toggle-command-palette"))
              }
            >
              <Kbd>⌘K</Kbd>
            </Button>
            <ThemeToggle />
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu aria-hidden className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Navigate</SheetTitle>
                  <SheetDescription className="sr-only">
                    Site navigation
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex flex-col gap-1.5 px-6" aria-label="Mobile">
                  {navItems.map((item, i) => (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href}
                        style={
                          reduceMotion
                            ? undefined
                            : { animationDelay: `${i * 60}ms` }
                        }
                        className="animate-in fade-in slide-in-from-right-4 rounded-lg border border-border/70 px-3 py-2 text-sm font-semibold tracking-[0.15em] text-foreground uppercase transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <ScrollProgress className="absolute inset-x-0 bottom-0" />
      </div>
    </motion.header>
  );
}
