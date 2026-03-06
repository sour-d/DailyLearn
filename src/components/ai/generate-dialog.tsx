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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AiEntryPreview } from "./ai-entry-preview";
import { createEntry } from "@/app/entries/_actions";
import { Sparkles, Loader2 } from "lucide-react";
import type { GeneratedEntry } from "@/lib/openrouter";
import { toast } from "sonner";

interface GenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName: string;
}

export function GenerateDialog({
  open,
  onOpenChange,
  categoryId,
  categoryName,
}: GenerateDialogProps) {
  const [prompt, setPrompt] = useState(
    `Generate learning questions with detailed answers about ${categoryName}`
  );
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<GeneratedEntry[]>([]);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, count, categoryName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEntries(data.entries);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
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
            <Sparkles className="h-5 w-5 text-primary" />
            Generate with AI
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Describe what kind of questions you want..."
            />
          </div>

          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="count">Count</Label>
              <Input
                id="count"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-20"
              />
            </div>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="flex-1 min-h-0 mt-4">
            <p className="mb-2 text-sm text-muted-foreground">
              {entries.length} entries generated — save or discard each one
            </p>
            <ScrollArea className="h-[400px] pr-4">
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
