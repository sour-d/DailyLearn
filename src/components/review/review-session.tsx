"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flashcard } from "./flashcard";
import { CategoryIcon } from "@/components/categories/category-icon";
import { getExtendedQueue } from "@/app/practice/_actions";
import type { Category, Entry } from "@/lib/supabase/types";
import {
  Dumbbell,
  ArrowLeft,
  PartyPopper,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface ReviewSessionProps {
  category: Category;
  entries: Entry[];
  totalDue: number;
}

export function ReviewSession({ category, entries: initialEntries, totalDue }: ReviewSessionProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExtended, setIsExtended] = useState(false);
  const [isPending, startTransition] = useTransition();

  const totalEntries = entries.length;
  const limitedCount = initialEntries.length;
  const remaining = totalDue - limitedCount;
  const hasMore = remaining > 0 && !isExtended;

  if (totalEntries === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
          <p className="text-muted-foreground">
            {category.name} — nothing due right now
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Dumbbell className="h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">All caught up!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No entries due for this category. Check back later.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/practice">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const reachedLimit = currentIndex >= limitedCount && hasMore;
  const sessionComplete = currentIndex >= totalEntries && !hasMore;

  if (reachedLimit) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
          <p className="text-muted-foreground">{category.name}</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <PartyPopper className="h-12 w-12 text-primary" />
          <h2 className="mt-4 text-lg font-semibold">Daily limit reached!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You reviewed {limitedCount} entries. {remaining} more remaining in this category.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => {
                startTransition(async () => {
                  const allEntries = await getExtendedQueue(category.id);
                  setEntries(allEntries);
                  setIsExtended(true);
                });
              }}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ChevronRight className="mr-2 h-4 w-4" />
              )}
              Continue More ({remaining} remaining)
            </Button>
            <Button asChild variant="outline">
              <Link href="/practice">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Practice
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    const reviewed = isExtended ? totalEntries : limitedCount;
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
          <p className="text-muted-foreground">{category.name}</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <PartyPopper className="h-12 w-12 text-primary" />
          <h2 className="mt-4 text-lg font-semibold">Session complete!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You reviewed all {reviewed} entries. Great job!
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/practice">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Practice
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const current = entries[currentIndex];
  const progress = Math.round((currentIndex / totalEntries) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
          <p className="text-muted-foreground">{category.name}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/practice">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Categories
          </Link>
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{
                backgroundColor: `${category.color}20`,
                color: category.color,
              }}
            >
              <CategoryIcon iconName={category.icon} className="h-3 w-3" />
            </div>
            <span className="font-medium">{category.name}</span>
            {isExtended && (
              <span className="text-xs text-muted-foreground">(extended)</span>
            )}
          </div>
          <span className="text-muted-foreground tabular-nums">
            {currentIndex + 1} / {totalEntries}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <Flashcard
        key={current.id}
        entry={current}
        categoryColor={category.color}
        onReviewed={() => setCurrentIndex((i) => i + 1)}
      />
    </div>
  );
}
