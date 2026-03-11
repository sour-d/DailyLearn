import { StatsView } from "@/components/stats/stats-view";
import { getCategoriesWithStats, getAppConfig } from "@/app/_actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const [categories, config] = await Promise.all([
    getCategoriesWithStats(),
    getAppConfig(),
  ]);

  const supabase = await createClient();
  const { data: dailyStats } = await supabase
    .from("daily_stats")
    .select("*")
    .order("date", { ascending: false })
    .limit(30);

  const { data: recentReviews } = await supabase
    .from("review_history")
    .select("*")
    .order("reviewed_at", { ascending: false })
    .limit(100);

  return (
    <StatsView
      categories={categories}
      config={config}
      dailyStats={dailyStats ?? []}
      recentReviews={recentReviews ?? []}
    />
  );
}
