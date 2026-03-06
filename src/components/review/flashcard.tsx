"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownContent } from "@/components/entries/markdown-content";
import { RATING_OPTIONS } from "@/lib/spaced-repetition";
import { submitReview } from "@/app/review/_actions";
import type { Entry } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface FlashcardProps {
  entry: Entry;
  onReviewed: () => void;
  categoryColor: string;
}

export function Flashcard({ entry, onReviewed, categoryColor }: FlashcardProps) {
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRate(rating: number) {
    setLoading(true);
    try {
      await submitReview(entry.id, rating);
      setRevealed(false);
      onReviewed();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Question / Front */}
      <Card className="relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: categoryColor }}
        />
        <CardContent className="pt-6">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {entry.type}
            </Badge>
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <h2 className="text-xl font-semibold">{entry.title}</h2>

          {entry.content && (
            <div className="mt-3 prose-sm">
              <MarkdownContent content={entry.content} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Answer / Back */}
      {!revealed ? (
        <Button
          variant="outline"
          className="w-full py-6"
          onClick={() => setRevealed(true)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Show Answer
        </Button>
      ) : (
        <>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-3">
                <EyeOff className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Answer</span>
              </div>
              {entry.answer ? (
                <MarkdownContent content={entry.answer} />
              ) : (
                <p className="text-muted-foreground italic">No answer provided</p>
              )}
            </CardContent>
          </Card>

          {/* Rating buttons */}
          <div className="space-y-2">
            <p className="text-center text-sm text-muted-foreground">
              How well did you know this?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {RATING_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleRate(opt.value)}
                  className={cn("flex-col gap-0.5 py-4", opt.color)}
                >
                  <span className="font-semibold">{opt.label}</span>
                  <span className="text-xs opacity-70">{opt.description}</span>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
