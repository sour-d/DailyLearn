"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AiEntryPreview } from "./ai-entry-preview";
import { createEntry } from "@/app/entries/_actions";
import { FileUp, Loader2, Wand2 } from "lucide-react";
import type { GeneratedEntry } from "@/lib/openrouter";
import { toast } from "sonner";

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
}: BulkImportDialogProps) {
  const [rawContent, setRawContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<GeneratedEntry[]>([]);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  async function handleClean() {
    if (!rawContent.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawContent, categoryName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEntries(data.entries);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cleanup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEntry(index: number, entry: GeneratedEntry) {
    setSavingIndex(index);
    try {
      await createEntry({
        category_id: categoryId,
        type: "qa",
        source: "ai",
        title: entry.title,
        content: entry.content,
        answer: entry.answer,
      });
      toast.success(`Saved: ${entry.title}`);
      setEntries((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSavingIndex(null);
    }
  }

  function handleDiscard(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            Bulk Import
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rawContent">
              Paste your raw content below
            </Label>
            <Textarea
              id="rawContent"
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              rows={8}
              placeholder="Paste questions, notes, Q&A, vocabulary, or any learning content here. AI will clean and structure it for you..."
              className="font-mono text-sm"
            />
          </div>

          <Button
            onClick={handleClean}
            disabled={loading || !rawContent.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Clean & Import
              </>
            )}
          </Button>
        </div>

        {entries.length > 0 && (
          <div className="flex-1 min-h-0 mt-4">
            <p className="mb-2 text-sm text-muted-foreground">
              {entries.length} entries parsed — save or discard each one
            </p>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-2">
                {entries.map((entry, i) => (
                  <AiEntryPreview
                    key={`${entry.title}-${i}`}
                    entry={entry}
                    onSave={(e) => handleSaveEntry(i, e)}
                    onDiscard={() => handleDiscard(i)}
                    saving={savingIndex === i}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
