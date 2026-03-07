"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Archive,
  ArrowRightLeft,
  Star,
  StarOff,
  MoreHorizontal,
  Pencil,
  ArrowUpDown,
  Search,
} from "lucide-react";
import {
  deleteEntry,
  deleteEntries,
  archiveEntries,
  toggleFavorite,
} from "@/app/entries/_actions";
import type { Entry, Category, MasteryLevel, EntryType } from "@/lib/supabase/types";
import { getMasteryLevel, MASTERY_CONFIG } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { MoveEntriesDialog } from "./move-entries-dialog";
import { EntryQuickView } from "./entry-quick-view";

type SortField = "title" | "created_at" | "next_review_date" | "type";
type SortDirection = "asc" | "desc";

interface EntryTableProps {
  entries: Entry[];
  categoryId: string;
  categories: Category[];
  onEditEntry: (entry: Entry) => void;
}

export function EntryTable({
  entries,
  categoryId,
  categories,
  onEditEntry,
}: EntryTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMastery, setFilterMastery] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<Entry | null>(null);

  const filtered = useMemo(() => {
    let result = [...entries];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.content?.toLowerCase().includes(q) ||
          e.answer?.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filterType !== "all") {
      result = result.filter((e) => e.type === filterType);
    }

    if (filterMastery !== "all") {
      result = result.filter((e) => getMasteryLevel(e) === filterMastery);
    }

    if (filterSource !== "all") {
      result = result.filter((e) => e.source === filterSource);
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "created_at":
          cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "next_review_date":
          cmp = new Date(a.next_review_date).getTime() - new Date(b.next_review_date).getTime();
          break;
        case "type":
          cmp = a.type.localeCompare(b.type);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [entries, searchQuery, sortField, sortDir, filterType, filterMastery, filterSource]);

  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((e) => e.id)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    try {
      await deleteEntries(ids, categoryId);
      toast.success(`${ids.length} entries deleted`, {
        description: "This action cannot be undone.",
      });
      setSelected(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleBulkArchive() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    try {
      await archiveEntries(ids, categoryId);
      toast.success(`${ids.length} entries archived`);
      setSelected(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to archive");
    }
  }

  async function handleDelete(entry: Entry) {
    try {
      await deleteEntry(entry.id, categoryId);
      toast.success(`"${entry.title}" deleted`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleToggleFavorite(entry: Entry) {
    try {
      await toggleFavorite(entry.id, entry.is_favorite);
    } catch {
      toast.error("Failed to update favorite");
    }
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="qa">Q&A</SelectItem>
            <SelectItem value="note">Note</SelectItem>
            <SelectItem value="snippet">Snippet</SelectItem>
            <SelectItem value="vocabulary">Vocabulary</SelectItem>
            <SelectItem value="link">Link</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterMastery} onValueChange={setFilterMastery}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Mastery" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="mastered">Mastered</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="ai">AI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-muted p-2">
          <span className="text-sm font-medium">
            {selected.size} selected
          </span>
          <Button size="sm" variant="outline" onClick={handleBulkDelete}>
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkArchive}>
            <Archive className="mr-1 h-3 w-3" />
            Archive
          </Button>
          {categories.length > 1 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMoveDialogOpen(true)}
            >
              <ArrowRightLeft className="mr-1 h-3 w-3" />
              Move
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("title")}
                >
                  Title
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("type")}
                >
                  Type
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="hidden md:table-cell">Source</TableHead>
              <TableHead className="hidden md:table-cell">Mastery</TableHead>
              <TableHead className="hidden lg:table-cell">Tags</TableHead>
              <TableHead className="hidden lg:table-cell">
                <button
                  className="flex items-center gap-1 hover:text-foreground"
                  onClick={() => toggleSort("next_review_date")}
                >
                  Next Review
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  {entries.length === 0
                    ? "No entries yet. Add your first one!"
                    : "No entries match your filters."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((entry) => {
                const mastery = getMasteryLevel(entry);
                const config = MASTERY_CONFIG[mastery];
                return (
                  <TableRow
                    key={entry.id}
                    className="cursor-pointer"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.closest("button, [role=checkbox], [role=menuitem], a")) return;
                      setPreviewEntry(entry);
                    }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selected.has(entry.id)}
                        onCheckedChange={() => toggleOne(entry.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {entry.is_favorite && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}
                        <span className="font-medium line-clamp-1">
                          {entry.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {entry.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {entry.source}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge className={cn("text-xs", config.color)} variant="outline">
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{entry.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {format(new Date(entry.next_review_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditEntry(entry)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleFavorite(entry)}>
                            {entry.is_favorite ? (
                              <>
                                <StarOff className="mr-2 h-4 w-4" />
                                Unfavorite
                              </>
                            ) : (
                              <>
                                <Star className="mr-2 h-4 w-4" />
                                Favorite
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(entry)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground">
        {filtered.length} of {entries.length} entries
      </div>

      <MoveEntriesDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        entryIds={Array.from(selected)}
        currentCategoryId={categoryId}
        categories={categories}
        onSuccess={() => setSelected(new Set())}
      />

      <EntryQuickView
        entry={previewEntry}
        open={previewEntry !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewEntry(null);
        }}
        onEdit={onEditEntry}
      />
    </div>
  );
}
