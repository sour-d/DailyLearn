import { getReviewQueue } from "./_actions";
import { ReviewSession } from "@/components/review/review-session";

export default async function ReviewPage() {
  const queue = await getReviewQueue();

  return <ReviewSession queue={queue} />;
}
