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
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
            <Label htmlFor="answer">{getAnswerLabel()}</Label>
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
