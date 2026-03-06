"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/categories/category-icon";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Flame, Trophy, Target, BookOpen } from "lucide-react";
import type {
  AppConfig,
  DailyStats,
  ReviewHistory,
  CategoryWithStats,
} from "@/lib/supabase/types";
import { format } from "date-fns";

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e"];

interface StatsViewProps {
  categories: CategoryWithStats[];
  config: AppConfig | null;
  dailyStats: DailyStats[];
  recentReviews: ReviewHistory[];
}

export function StatsView({
  categories,
  config,
  dailyStats,
}: StatsViewProps) {
  const totalEntries = categories.reduce((s, c) => s + c.total_entries, 0);
  const totalMastered = categories.reduce((s, c) => s + c.mastered_count, 0);
  const totalDue = categories.reduce((s, c) => s + c.due_today, 0);

  const chartData = dailyStats
    .slice()
    .reverse()
    .map((d) => ({
      date: format(new Date(d.date), "MMM d"),
      reviewed: d.entries_reviewed,
      added: d.entries_added,
    }));

  const masteryData = [
    {
      name: "Mastered",
      value: totalMastered,
    },
    {
      name: "Due",
      value: totalDue,
    },
    {
      name: "Learning",
      value: Math.max(0, totalEntries - totalMastered - totalDue),
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
        <p className="text-muted-foreground">Track your learning progress</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalEntries}</span>
            <p className="text-xs text-muted-foreground">
              across {categories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mastered</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalMastered}</span>
            <p className="text-xs text-muted-foreground">
              {totalEntries > 0
                ? `${Math.round((totalMastered / totalEntries) * 100)}% of all entries`
                : "No entries yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {config?.current_streak ?? 0}
            </span>
            <span className="text-sm text-muted-foreground"> days</span>
            <p className="text-xs text-muted-foreground">
              Longest: {config?.longest_streak ?? 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{totalDue}</span>
            <p className="text-xs text-muted-foreground">entries to review</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Activity chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Activity (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar
                    dataKey="reviewed"
                    name="Reviewed"
                    fill="#6366f1"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="added"
                    name="Added"
                    fill="#22c55e"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No activity data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Mastery distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mastery Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {masteryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={masteryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {masteryData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No entries yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-category breakdown */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categories.map((cat) => {
                const masteryPercent =
                  cat.total_entries > 0
                    ? Math.round((cat.mastered_count / cat.total_entries) * 100)
                    : 0;
                return (
                  <div key={cat.id} className="flex items-center gap-4">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
                      style={{
                        backgroundColor: `${cat.color}20`,
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon iconName={cat.icon} className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">
                          {cat.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {cat.total_entries} entries
                          </Badge>
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
                      <div className="mt-1 flex items-center gap-2">
                        <Progress value={masteryPercent} className="h-2" />
                        <span className="text-xs text-muted-foreground w-10 text-right">
                          {masteryPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
