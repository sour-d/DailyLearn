"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, ArrowLeft, Sparkles, FileUp } from "lucide-react";
import { CategoryIcon } from "./category-icon";
import { EntryTable } from "@/components/entries/entry-table";
import { EntryFormDialog } from "@/components/entries/entry-form-dialog";
import { GenerateDialog } from "@/components/ai/generate-dialog";
import { BulkImportDialog } from "@/components/ai/bulk-import-dialog";
import type { Category, Entry } from "@/lib/supabase/types";
import { getMasteryLevel } from "@/lib/supabase/types";

interface CategoryDetailViewProps {
  category: Category;
  entries: Entry[];
  categories: Category[];
}

export function CategoryDetailView({
  category,
  entries,
  categories,
}: CategoryDetailViewProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<Entry | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  const total = entries.length;
  const dueToday = entries.filter(
    (e) => new Date(e.next_review_date) <= new Date()
  ).length;
  const mastered = entries.filter(
    (e) => getMasteryLevel(e) === "mastered"
  ).length;
  const masteryPercent = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            href="/categories"
            className="mt-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${category.color}20`,
                  color: category.color,
                }}
              >
                <CategoryIcon iconName={category.icon} className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setGenerateOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
          <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-sm text-muted-foreground">entries</span>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-orange-600 dark:text-orange-400">
            {dueToday} due today
          </Badge>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 dark:text-green-400">
            {mastered} mastered
          </Badge>
        </div>
        <div className="ml-auto flex items-center gap-2 min-w-[120px]">
          <Progress value={masteryPercent} className="h-2" />
          <span className="text-xs text-muted-foreground">{masteryPercent}%</span>
        </div>
      </div>

      {/* Entry table */}
      <EntryTable
        entries={entries}
        categoryId={category.id}
        categories={categories}
        onEditEntry={setEditEntry}
      />

      {/* Dialogs */}
      <EntryFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        categoryId={category.id}
      />

      {editEntry && (
        <EntryFormDialog
          open={!!editEntry}
          onOpenChange={(open) => !open && setEditEntry(null)}
          categoryId={category.id}
          entry={editEntry}
        />
      )}

      <GenerateDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        categoryId={category.id}
        categoryName={category.name}
      />

      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        categoryId={category.id}
        categoryName={category.name}
      />
    </div>
  );
}
