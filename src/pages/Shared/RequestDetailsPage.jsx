import { useParams } from "react-router-dom";
import RequestTimeline from "../../components/Maintenance/RequestTimeline.jsx";

export default function RequestDetailsPage() {
  const { id } = useParams();
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-3">Request Details</h1>
      <RequestTimeline requestId={id} />
    </div>
  );
}
