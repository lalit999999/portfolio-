"use client";

import { useCallback, useEffect, useLayoutEffect, useOptimistic, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useVisibilityPoll } from "@/hooks/use-visibility-poll";
import { deleteMessage } from "@/app/playground/actions";
import { MessageCard } from "./message-card";
import { Composer } from "./composer";
import { EmptyFeed } from "./empty-feed";
import { NewMessagesPill } from "./new-messages-pill";
import type { PlaygroundFeedItem, PlaygroundViewer } from "@/types/playground";
import type { ApiResponse } from "@/types/models";

export interface PlaygroundFeedProps {
  initialMessages: PlaygroundFeedItem[];
  viewer: PlaygroundViewer | null;
  pollIntervalMs?: number;
  className?: string;
}

const NEAR_BOTTOM_THRESHOLD_PX = 100;

function mergeById(base: PlaygroundFeedItem[], incoming: PlaygroundFeedItem[]): PlaygroundFeedItem[] {
  if (incoming.length === 0) return base;
  const map = new Map(base.map((item) => [item._id, item]));
  for (const item of incoming) map.set(item._id, item);
  return Array.from(map.values()).sort((a, b) => {
    const diff = a.createdAt.localeCompare(b.createdAt);
    return diff !== 0 ? diff : a._id.localeCompare(b._id);
  });
}

async function fetchNewMessages(since: string, signal?: AbortSignal): Promise<PlaygroundFeedItem[]> {
  const res = await fetch(`/api/playground/messages?since=${encodeURIComponent(since)}`, { signal });
  const json = (await res.json()) as ApiResponse<PlaygroundFeedItem[]>;
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

export function PlaygroundFeed({
  initialMessages,
  viewer,
  pollIntervalMs = 8000,
  className,
}: PlaygroundFeedProps) {
  const reduce = useReducedMotion();
  const [messages, setMessages] = useState(() => mergeById([], initialMessages));
  const [failedMessages, setFailedMessages] = useState<PlaygroundFeedItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const hasToastedPollErrorRef = useRef(false);

  // Holds the provisional item for whichever optimistic post is currently
  // in flight, in submission order, so a failed onSettled(null) — which
  // carries no id of its own — knows which row to re-show as failed.
  const pendingQueueRef = useRef<PlaygroundFeedItem[]>([]);

  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, provisional: PlaygroundFeedItem) => mergeById(state, [provisional])
  );

  const initialSince = initialMessages.at(-1)?.createdAt ?? new Date().toISOString();
  const { items: polledItems, error: pollError, poll } = useVisibilityPoll<PlaygroundFeedItem>(
    fetchNewMessages,
    { intervalMs: pollIntervalMs, initialSince }
  );

  useEffect(() => {
    if (polledItems.length === 0) return;
    setMessages((prev) => mergeById(prev, polledItems));
  }, [polledItems]);

  useEffect(() => {
    if (!pollError) {
      hasToastedPollErrorRef.current = false;
      return;
    }
    if (hasToastedPollErrorRef.current) return;
    hasToastedPollErrorRef.current = true;
    toast.error("Having trouble reaching the playground — retrying in the background.");
  }, [pollError]);

  const failedIds = new Set(failedMessages.map((m) => m._id));
  const rendered = mergeById(optimisticMessages, failedMessages);

  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const prevLengthRef = useRef(rendered.length);
  const seenIdsRef = useRef<Set<string>>(new Set(initialMessages.map((m) => m._id)));

  const scrollToBottom = useCallback(
    (smooth: boolean) => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reduce ? "smooth" : "auto" });
    },
    [reduce]
  );

  useLayoutEffect(() => {
    scrollToBottom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom <= NEAR_BOTTOM_THRESHOLD_PX;
    if (isNearBottomRef.current) setUnreadCount(0);
  }, []);

  useEffect(() => {
    const prevLength = prevLengthRef.current;
    const delta = rendered.length - prevLength;
    prevLengthRef.current = rendered.length;
    if (delta <= 0) return;

    if (isNearBottomRef.current) {
      scrollToBottom(true);
    } else {
      setUnreadCount((count) => count + delta);
    }
  }, [rendered.length, scrollToBottom]);

  const handleJumpToBottom = useCallback(() => {
    scrollToBottom(true);
    setUnreadCount(0);
  }, [scrollToBottom]);

  const handleOptimistic = useCallback(
    (provisional: PlaygroundFeedItem) => {
      pendingQueueRef.current.push(provisional);
      addOptimisticMessage(provisional);
    },
    [addOptimisticMessage]
  );

  const handleSettled = useCallback((real: PlaygroundFeedItem | null) => {
    const provisional = pendingQueueRef.current.shift();
    if (real) {
      // Pre-mark as "seen" so the temp row's fade-in isn't immediately
      // followed by a second fade-in for the real row that replaces it.
      seenIdsRef.current.add(real._id);
      setMessages((prev) => mergeById(prev, [real]));
      poll();
    } else if (provisional) {
      setFailedMessages((prev) => [...prev, provisional]);
    }
  }, [poll]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (id.startsWith("temp-")) {
        setFailedMessages((prev) => prev.filter((m) => m._id !== id));
        return;
      }
      const previous = messages;
      setMessages((prev) => prev.filter((m) => m._id !== id));
      const result = await deleteMessage(id);
      if (!result.ok) {
        setMessages(previous);
        toast.error(result.message);
      }
    },
    [messages]
  );

  const isEmpty = rendered.length === 0;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        aria-live="polite"
        aria-relevant="additions"
        className="flex max-h-[60vh] min-h-[280px] flex-col gap-3 overflow-y-auto scroll-smooth rounded-2xl p-1 focus-visible:outline-none"
      >
        {isEmpty ? (
          <EmptyFeed viewer={viewer} />
        ) : (
          rendered.map((message, index) => {
            const isFailed = failedIds.has(message._id);
            const isPending = message._id.startsWith("temp-") && !isFailed;
            const isNew = !seenIdsRef.current.has(message._id);

            const content = (
              <MessageCard
                message={message}
                viewer={viewer}
                pending={isPending}
                failed={isFailed}
                onDelete={handleDelete}
                index={index}
              />
            );

            if (!isNew || reduce) {
              return <div key={message._id}>{content}</div>;
            }

            return (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onAnimationComplete={() => seenIdsRef.current.add(message._id)}
              >
                {content}
              </motion.div>
            );
          })
        )}
      </div>

      <AnimatePresence>
        {unreadCount > 0 ? (
          <div className="sticky bottom-2 z-10 flex justify-center">
            <NewMessagesPill count={unreadCount} onClick={handleJumpToBottom} />
          </div>
        ) : null}
      </AnimatePresence>

      <Composer viewer={viewer} onOptimistic={handleOptimistic} onSettled={handleSettled} />
    </div>
  );
}
