"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flashcard } from "./flashcard";
import { CategoryIcon } from "@/components/categories/category-icon";
import type { ReviewQueue } from "@/app/review/_actions";
import { GraduationCap, RefreshCw, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReviewSessionProps {
  queue: ReviewQueue[];
}

export function ReviewSession({ queue }: ReviewSessionProps) {
  const router = useRouter();

  const allEntries = useMemo(
    () =>
      queue.flatMap((q) =>
        q.entries.map((e) => ({ entry: e, category: q.category }))
      ),
    [queue]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const totalEntries = allEntries.length;

  if (totalEntries === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review</h1>
          <p className="text-muted-foreground">Daily flashcard review session</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">No entries to review</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            All caught up! Add more entries or check back tomorrow.
          </p>
        </div>
      </div>
    );
  }

  if (currentIndex >= totalEntries) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review</h1>
          <p className="text-muted-foreground">Daily flashcard review session</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <PartyPopper className="h-12 w-12 text-primary" />
          <h2 className="mt-4 text-lg font-semibold">Session complete!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You reviewed {totalEntries} entries. Great job!
          </p>
          <Button className="mt-4" onClick={() => router.refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Start New Session
          </Button>
        </div>
      </div>
    );
  }

  const current = allEntries[currentIndex];
  const progress = Math.round((currentIndex / totalEntries) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review</h1>
          <p className="text-muted-foreground">Daily flashcard review session</p>
        </div>
        <Button variant="outline" onClick={() => router.refresh()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded"
              style={{
                backgroundColor: `${current.category.color}20`,
                color: current.category.color,
              }}
            >
              <CategoryIcon iconName={current.category.icon} className="h-3 w-3" />
            </div>
            <span className="font-medium">{current.category.name}</span>
          </div>
          <span className="text-muted-foreground">
            {currentIndex + 1} / {totalEntries}
          </span>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Category summary */}
        <div className="flex flex-wrap gap-2">
          {queue.map((q) => (
            <Badge key={q.category.id} variant="outline" className="text-xs">
              {q.category.name}: {q.entries.length}
            </Badge>
          ))}
        </div>
      </div>

      {/* Flashcard */}
      <Flashcard
        key={current.entry.id}
        entry={current.entry}
        categoryColor={current.category.color}
        onReviewed={() => setCurrentIndex((i) => i + 1)}
      />
    </div>
  );
}
