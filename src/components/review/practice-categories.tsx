"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CategoryIcon } from "@/components/categories/category-icon";
import { Dumbbell, CheckCircle2 } from "lucide-react";
import type { CategoryWithStats } from "@/lib/supabase/types";

interface PracticeCategoriesProps {
  categories: CategoryWithStats[];
}

export function PracticeCategories({ categories }: PracticeCategoriesProps) {
  const totalDue = categories.reduce((sum, c) => sum + c.due_today, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Practice</h1>
        <p className="text-muted-foreground">
          {totalDue > 0
            ? `${totalDue} entries due across ${categories.filter((c) => c.due_today > 0).length} categories`
            : "All caught up! Check back tomorrow."}
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <Dumbbell className="h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">No categories yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create categories and add entries to start practicing.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => {
            const masteryPercent =
              cat.total_entries > 0
                ? Math.round((cat.mastered_count / cat.total_entries) * 100)
                : 0;
            const hasDue = cat.due_today > 0;

            return (
              <Link key={cat.id} href={`/practice/${cat.id}`}>
                <Card
                  className={`relative transition-all hover:shadow-md ${
                    hasDue
                      ? "hover:border-primary/40"
                      : "opacity-60 hover:opacity-80"
                  }`}
                >
                  <CardContent className="py-5">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${cat.color}20`,
                          color: cat.color,
                        }}
                      >
                        <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold truncate">{cat.name}</h3>
                          {hasDue ? (
                            <Badge
                              variant="default"
                              className="shrink-0 tabular-nums"
                            >
                              {cat.due_today} due
                            </Badge>
                          ) : (
                            <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Done</span>
                            </div>
                          )}
                        </div>
                        {cat.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1">
                            <Progress value={masteryPercent} className="h-1.5" />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {masteryPercent}%
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{cat.total_entries} entries</span>
                          <span>{cat.mastered_count} mastered</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
