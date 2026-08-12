// Shared motion constants. Session A owns this file.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_BACK_OUT = [0.34, 1.56, 0.64, 1] as const;
export const SPRING_SOFT = { type: "spring", stiffness: 120, damping: 20 } as const;
export const SPRING_SNAPPY = { type: "spring", stiffness: 300, damping: 25 } as const;
export const SPRING_MAGNETIC = { type: "spring", stiffness: 200, damping: 15, mass: 0.5 } as const;
export const VIEWPORT_ONCE = { once: true, margin: "-80px" } as const;
export const DUR = { fast: 0.3, base: 0.5, slow: 0.8 } as const;
