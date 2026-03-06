import { getAppConfig, getTodayStats, getCategoriesWithStats } from "./_actions";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export default async function DashboardPage() {
  const [config, todayStats, categories] = await Promise.all([
    getAppConfig(),
    getTodayStats(),
    getCategoriesWithStats(),
  ]);

  return (
    <DashboardView
      config={config}
      todayStats={todayStats}
      categories={categories}
    />
  );
}
