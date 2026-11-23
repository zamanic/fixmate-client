import { ServiceDetailSkeleton } from "@/components/services/service-detail-skeleton";

/** Route-level loading UI — the details page's own geometry, streamed early. */
export default function ServiceDetailLoading() {
  return (
    <div className="fm-shell fm-section">
      <ServiceDetailSkeleton />
    </div>
  );
}
