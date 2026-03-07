"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, Pencil, Calendar, Tag } from "lucide-react";
import { MarkdownContent } from "./markdown-content";
import type { Entry } from "@/lib/supabase/types";
import { getMasteryLevel, MASTERY_CONFIG } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface EntryQuickViewProps {
  entry: Entry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (entry: Entry) => void;
}

export function EntryQuickView({
  entry,
  open,
  onOpenChange,
  onEdit,
}: EntryQuickViewProps) {
  if (!entry) return null;

  const mastery = getMasteryLevel(entry);
  const masteryConfig = MASTERY_CONFIG[mastery];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!flex !flex-col max-h-[85vh] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 space-y-3 px-6 pt-6">
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-lg font-semibold leading-snug pr-8">
              <span className="flex items-center gap-2">
                {entry.is_favorite && (
                  <Star className="h-4 w-4 shrink-0 fill-yellow-400 text-yellow-400" />
                )}
                {entry.title}
              </span>
            </DialogTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {entry.type}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-xs", masteryConfig.color)}
            >
              {masteryConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {entry.source === "ai" ? "AI generated" : "Manual"}
            </span>
          </div>

          {entry.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {entry.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        <Separator />

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 space-y-4">
          {entry.content && (
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {entry.type === "qa" ? "Question" : "Content"}
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

        <Separator />

        <div className="shrink-0 flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Created {format(new Date(entry.created_at), "MMM d, yyyy")}
            </span>
            <span>
              Next review:{" "}
              {format(new Date(entry.next_review_date), "MMM d, yyyy")}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onEdit(entry);
            }}
          >
            <Pencil className="mr-1.5 h-3 w-3" />
            Edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
