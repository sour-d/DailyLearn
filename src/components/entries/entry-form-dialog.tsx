"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createEntry, updateEntry } from "@/app/entries/_actions";
import type { Entry, EntryType } from "@/lib/supabase/types";
import { toast } from "sonner";
import { X, Sparkles, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: "qa", label: "Q&A" },
  { value: "note", label: "Note" },
  { value: "snippet", label: "Code Snippet" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "link", label: "Link" },
];

interface EntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  entry?: Entry | null;
}

export function EntryFormDialog({
  open,
  onOpenChange,
  categoryId,
  entry,
}: EntryFormDialogProps) {
  const isEditing = !!entry;
  const [type, setType] = useState<EntryType>(entry?.type ?? "qa");
  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [answer, setAnswer] = useState(entry?.answer ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  function getContentLabel(): string {
    switch (type) {
      case "qa": return "Question";
      case "vocabulary": return "Word / Term";
      case "snippet": return "Code";
      case "link": return "URL";
      default: return "Content";
    }
  }

  function getAnswerLabel(): string {
    switch (type) {
      case "qa": return "Answer";
      case "vocabulary": return "Definition";
      default: return "Notes / Explanation";
    }
  }

  async function handleEnhance() {
    if (!title.trim() && !content.trim()) {
      toast.error("Add a title or content first");
      return;
    }
    setEnhancing(true);
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, answer, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnswer(data.answer);
      toast.success("Answer enhanced with AI");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Enhancement failed");
    } finally {
      setEnhancing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (isEditing && entry) {
        await updateEntry(entry.id, {
          title: title.trim(),
          content: content.trim() || undefined,
          answer: answer.trim() || undefined,
          type,
          tags,
        });
        toast.success("Entry updated");
      } else {
        await createEntry({
          category_id: categoryId,
          type,
          title: title.trim(),
          content: content.trim() || undefined,
          answer: answer.trim() || undefined,
          tags,
        });
        toast.success("Entry added");
      }
      onOpenChange(false);
      if (!isEditing) {
        setTitle("");
        setContent("");
        setAnswer("");
        setTags([]);
        setTagInput("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Entry" : "New Entry"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as EntryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTRY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Brief summary or title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{getContentLabel()}</Label>
            <Textarea
              id="content"
              placeholder={
                type === "snippet"
                  ? "Paste your code here..."
                  : type === "link"
                    ? "https://..."
                    : "Markdown supported..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={type === "snippet" ? 8 : 4}
              className={type === "snippet" ? "font-mono text-sm" : ""}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="answer">{getAnswerLabel()}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary"
                    onClick={handleEnhance}
                    disabled={enhancing || (!title.trim() && !content.trim())}
                  >
                    {enhancing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    {enhancing ? "Enhancing..." : "Enhance with AI"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  AI will generate or improve the answer based on the title and content
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              id="answer"
              placeholder="Markdown supported..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
