"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MarkdownContent } from "@/components/entries/markdown-content";
import type { GeneratedEntry } from "@/lib/openrouter";

interface AiQuickViewProps {
  entry: GeneratedEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AiQuickView({ entry, open, onOpenChange }: AiQuickViewProps) {
  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex !flex-col max-h-[85vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-semibold leading-snug pr-8">
            {entry.title}
          </DialogTitle>
        </DialogHeader>

        <Separator className="mt-4" />

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
          {entry.content && (
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Question
              </h4>
              <MarkdownContent
                content={entry.content}
                className="prose-sm text-sm leading-relaxed space-y-2"
              />
            </div>
          )}

          {entry.answer && (
            <div>
              <Separator className="mb-4" />
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Answer
              </h4>
              <MarkdownContent
                content={entry.answer}
                className="prose-sm text-sm leading-relaxed space-y-2"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
