import { notFound } from "next/navigation";
import { getPracticeQueue } from "../_actions";
import { ReviewSession } from "@/components/review/review-session";

export const dynamic = "force-dynamic";

interface PracticeSessionPageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function PracticeSessionPage({ params }: PracticeSessionPageProps) {
  const { categoryId } = await params;
  const queue = await getPracticeQueue(categoryId);

  if (!queue) notFound();

  return (
    <ReviewSession
      category={queue.category}
      entries={queue.entries}
      totalDue={queue.totalDue}
    />
  );
}
