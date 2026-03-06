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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { moveEntries } from "@/app/entries/_actions";
import type { Category } from "@/lib/supabase/types";
import { toast } from "sonner";
import { CategoryIcon } from "@/components/categories/category-icon";

interface MoveEntriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entryIds: string[];
  currentCategoryId: string;
  categories: Category[];
  onSuccess: () => void;
}

export function MoveEntriesDialog({
  open,
  onOpenChange,
  entryIds,
  currentCategoryId,
  categories,
  onSuccess,
}: MoveEntriesDialogProps) {
  const [targetId, setTargetId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const otherCategories = categories.filter((c) => c.id !== currentCategoryId);

  async function handleMove() {
    if (!targetId || entryIds.length === 0) return;
    setLoading(true);
    try {
      await moveEntries(entryIds, currentCategoryId, targetId);
      const target = categories.find((c) => c.id === targetId);
      toast.success(`Moved ${entryIds.length} entries to "${target?.name}"`);
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to move");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move {entryIds.length} entries</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Label>Destination category</Label>
          <Select value={targetId} onValueChange={setTargetId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category..." />
            </SelectTrigger>
            <SelectContent>
              {otherCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    <CategoryIcon iconName={cat.icon} className="h-4 w-4" />
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleMove} disabled={loading || !targetId}>
            {loading ? "Moving..." : "Move"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
