"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CategoryIcon } from "@/components/categories/category-icon";
import {
  GraduationCap,
  Flame,
  Trophy,
  Target,
  BookOpen,
  ArrowRight,
  PartyPopper,
} from "lucide-react";
import type { AppConfig, DailyStats, CategoryWithStats } from "@/lib/supabase/types";

interface DashboardViewProps {
  config: AppConfig | null;
  todayStats: DailyStats | null;
  categories: CategoryWithStats[];
}

export function DashboardView({
  config,
  todayStats,
  categories,
}: DashboardViewProps) {
  const reviewed = todayStats?.entries_reviewed ?? 0;
  const added = todayStats?.entries_added ?? 0;
  const goal = config?.daily_review_goal ?? 20;
  const goalProgress = Math.min(100, Math.round((reviewed / goal) * 100));
  const goalMet = reviewed >= goal;

  const totalDue = categories.reduce((sum, c) => sum + c.due_today, 0);
  const totalEntries = categories.reduce((sum, c) => sum + c.total_entries, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your daily learning overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{reviewed}</span>
              <span className="text-sm text-muted-foreground">/ {goal}</span>
              {goalMet && <PartyPopper className="h-4 w-4 text-primary" />}
            </div>
            <Progress value={goalProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalDue}</span>
            <p className="text-xs text-muted-foreground">entries across {categories.length} categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{config?.current_streak ?? 0}</span>
            <span className="text-sm text-muted-foreground"> days</span>
            <p className="text-xs text-muted-foreground">
              Best: {config?.longest_streak ?? 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Added Today</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{added}</span>
            <p className="text-xs text-muted-foreground">
              {totalEntries} total entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Review CTA */}
      {totalDue > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">
                  You have {totalDue} entries to review today
                </p>
                <p className="text-sm text-muted-foreground">
                  Start your daily review session
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/review">
                Start Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Categories overview */}
      {categories.length > 0 ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Categories</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const masteryPercent =
                cat.total_entries > 0
                  ? Math.round((cat.mastered_count / cat.total_entries) * 100)
                  : 0;
              return (
                <Link key={cat.id} href={`/categories/${cat.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${cat.color}20`,
                            color: cat.color,
                          }}
                        >
                          <CategoryIcon iconName={cat.icon} className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{cat.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{cat.total_entries} entries</span>
                            {cat.due_today > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs text-orange-600 dark:text-orange-400"
                              >
                                {cat.due_today} due
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">
                            {masteryPercent}%
                          </span>
                          <Progress value={masteryPercent} className="h-1.5 w-16" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold">Welcome to Daily Learn</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Start by creating categories for the topics you want to learn.
          </p>
          <Button asChild className="mt-4">
            <Link href="/categories">Get Started</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
