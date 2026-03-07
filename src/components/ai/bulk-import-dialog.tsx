"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AiEntryPreview } from "./ai-entry-preview";
import { AiQuickView } from "./ai-quick-view";
import { createEntry } from "@/app/entries/_actions";
import { FileUp, Loader2, Wand2, CheckCircle2 } from "lucide-react";
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
  const [savedCount, setSavedCount] = useState(0);
  const [previewEntry, setPreviewEntry] = useState<GeneratedEntry | null>(null);

  async function handleClean() {
    if (!rawContent.trim()) return;
    setLoading(true);
    setSavedCount(0);
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
      setSavedCount((c) => c + 1);
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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!flex !flex-col max-w-2xl max-h-[85vh] overflow-hidden p-0">
          <div className="shrink-0 p-6 pb-0">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <FileUp className="h-5 w-5 text-primary" />
                Bulk Import
              </DialogTitle>
              <DialogDescription>
                Paste raw content below. AI will clean and structure it into entries for {categoryName}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rawContent">Raw content</Label>
                <Textarea
                  id="rawContent"
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  rows={6}
                  placeholder="Paste questions, notes, Q&A, vocabulary, or any learning content here..."
                  className="font-mono text-sm resize-none"
                />
              </div>

              <Button
                onClick={handleClean}
                disabled={loading || !rawContent.trim()}
                className="px-6"
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
          </div>

          {(entries.length > 0 || savedCount > 0) && (
            <div className="shrink-0 px-6">
              <Separator className="mb-4" />
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">
                  {entries.length} entries remaining
                </p>
                {savedCount > 0 && (
                  <p className="flex items-center gap-1.5 text-sm text-green-500">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {savedCount} saved
                  </p>
                )}
              </div>
            </div>
          )}

          {entries.length > 0 && (
            <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6">
              <div className="space-y-3">
                {entries.map((entry, i) => (
                  <AiEntryPreview
                    key={`${entry.title}-${i}`}
                    entry={entry}
                    onSave={(e) => handleSaveEntry(i, e)}
                    onDiscard={() => handleDiscard(i)}
                    onPreview={setPreviewEntry}
                    saving={savingIndex === i}
                  />
                ))}
              </div>
            </div>
          )}

          {entries.length === 0 && <div className="pb-6" />}
        </DialogContent>
      </Dialog>

      <AiQuickView
        entry={previewEntry}
        open={previewEntry !== null}
        onOpenChange={(open) => { if (!open) setPreviewEntry(null); }}
      />
    </>
  );
}
