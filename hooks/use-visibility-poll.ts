"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_INTERVAL_MS = 60_000;

export interface UseVisibilityPollOptions {
  intervalMs?: number;
  enabled?: boolean;
  initialSince: string;
}

export interface UseVisibilityPollResult<T> {
  items: T[];
  error: Error | null;
  poll: () => void;
}

/**
 * Polls `fetcher(since)` on a setTimeout chain (never setInterval, so a slow
 * response can't stack overlapping requests). Pauses while the tab is
 * hidden, polls immediately on becoming visible, and backs off exponentially
 * on consecutive failures, capped at 60s and reset on the next success.
 */
export function useVisibilityPoll<T extends { createdAt: string }>(
  fetcher: (since: string, signal?: AbortSignal) => Promise<T[]>,
  opts: UseVisibilityPollOptions
): UseVisibilityPollResult<T> {
  const { intervalMs = 8000, enabled = true, initialSince } = opts;

  const [items, setItems] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const sinceRef = useRef(initialSince);
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const backoffRef = useRef(intervalMs);
  const mountedRef = useRef(true);
  const runPollRef = useRef<() => void>(() => {});

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(
    (delay: number) => {
      clearTimer();
      if (!mountedRef.current) return;
      // A poll can resolve just as the tab is hidden; don't arm another
      // timer in that case. visibilitychange picks up the chain again.
      if (document.visibilityState === "hidden") return;
      timeoutRef.current = setTimeout(() => runPollRef.current(), delay);
    },
    [clearTimer]
  );

  const runPoll = useCallback(() => {
    clearTimer();
    // A manual poll() or a visibility-triggered poll can land while a
    // previous request is still in flight — abort it rather than let both
    // resolve and double-append.
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    fetcherRef.current(sinceRef.current, controller.signal)
      .then((next) => {
        if (!mountedRef.current || controller.signal.aborted) return;
        setError(null);
        backoffRef.current = intervalMs;
        if (next.length > 0) {
          setItems((prev) => [...prev, ...next]);
          sinceRef.current = next[next.length - 1].createdAt;
        }
        scheduleNext(backoffRef.current);
      })
      .catch((err: unknown) => {
        if (!mountedRef.current || controller.signal.aborted) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error("Poll failed"));
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_INTERVAL_MS);
        scheduleNext(backoffRef.current);
      });
  }, [clearTimer, intervalMs, scheduleNext]);

  useEffect(() => {
    runPollRef.current = runPoll;
  });

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) return;

    runPollRef.current();

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        runPollRef.current();
      } else {
        clearTimer();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mountedRef.current = false;
      clearTimer();
      controllerRef.current?.abort();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, clearTimer]);

  const poll = useCallback(() => {
    runPollRef.current();
  }, []);

  return { items, error, poll };
}
