"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Entry, Category } from "@/lib/supabase/types";
import { getMasteryLevel, MASTERY_CONFIG } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "@/components/entries/markdown-content";
import { CategoryIcon } from "@/components/categories/category-icon";

interface SearchViewProps {
  categories: Category[];
}

export function SearchView({ categories }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Entry[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

  const handleSearch = useCallback(
    async (q: string) => {
      setQuery(q);
      if (q.trim().length < 2) {
        setResults([]);
        setSearched(false);
        return;
      }

      setLoading(true);
      setSearched(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("entries")
          .select("*")
          .or(
            `title.ilike.%${q}%,content.ilike.%${q}%,answer.ilike.%${q}%`
          )
          .eq("is_archived", false)
          .order("created_at", { ascending: false })
          .limit(50);

        setResults(data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="text-muted-foreground">
          Find entries across all categories
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, content, or answer..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 py-5 text-base"
        />
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground">Searching...</p>
      )}

      {searched && !loading && results.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">No results found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search term.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-2">
            {results.map((entry) => {
              const cat = categoryMap[entry.category_id];
              const mastery = getMasteryLevel(entry);
              const config = MASTERY_CONFIG[mastery];
              const expanded = expandedId === entry.id;

              return (
                <Card
                  key={entry.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                  onClick={() =>
                    setExpandedId(expanded ? null : entry.id)
                  }
                >
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      {cat && (
                        <div
                          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded"
                          style={{
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                          }}
                        >
                          <CategoryIcon
                            iconName={cat.icon}
                            className="h-4 w-4"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {entry.type}
                          </Badge>
                          <Badge
                            className={cn("text-xs", config.color)}
                            variant="outline"
                          >
                            {config.label}
                          </Badge>
                        </div>
                        {cat && (
                          <span className="text-xs text-muted-foreground">
                            {cat.name}
                          </span>
                        )}

                        {expanded && (
                          <div className="mt-3 space-y-3 border-t pt-3">
                            {entry.content && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Content
                                </p>
                                <MarkdownContent
                                  content={entry.content}
                                  className="text-sm prose-sm"
                                />
                              </div>
                            )}
                            {entry.answer && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">
                                  Answer
                                </p>
                                <MarkdownContent
                                  content={entry.answer}
                                  className="text-sm prose-sm"
                                />
                              </div>
                            )}
                            {entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {entry.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
