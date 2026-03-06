"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Pencil } from "lucide-react";
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
      <Card>
        <CardContent className="space-y-3 pt-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
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
              <Check className="mr-1 h-3 w-3" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium">{entry.title}</h4>
            {entry.content && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {entry.content}
              </p>
            )}
            {entry.answer && (
              <p className="mt-1 text-xs text-muted-foreground/70 line-clamp-1">
                Answer: {entry.answer}
              </p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-green-600"
              onClick={handleSave}
              disabled={saving}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive"
              onClick={onDiscard}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
