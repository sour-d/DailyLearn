"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Pencil, Save } from "lucide-react";
import type { GeneratedEntry } from "@/lib/openrouter";

interface AiEntryPreviewProps {
  entry: GeneratedEntry;
  onSave: (entry: GeneratedEntry) => void;
  onDiscard: () => void;
  saving?: boolean;
}

export function AiEntryPreview({
  entry,
  onSave,
  onDiscard,
  saving,
}: AiEntryPreviewProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [answer, setAnswer] = useState(entry.answer);

  function handleSave() {
    onSave({ title, content, answer });
  }

  if (editing) {
    return (
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="font-medium"
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Content / Question"
          rows={3}
        />
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Answer"
          rows={3}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-lg border bg-card p-4 transition-colors hover:border-primary/30">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <h4 className="font-semibold leading-snug">{entry.title}</h4>
          {entry.content && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {entry.content}
            </p>
          )}
          {entry.answer && (
            <div className="rounded-md bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground line-clamp-2">
                <span className="font-medium text-foreground/70">Answer: </span>
                {entry.answer}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 shrink-0">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => setEditing(true)}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-400"
            onClick={handleSave}
            disabled={saving}
            title="Save"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={onDiscard}
            title="Discard"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
