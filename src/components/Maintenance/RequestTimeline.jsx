import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import Card from "../Shared/Card.jsx";
import Badge from "../Shared/Badge.jsx";

export default function RequestTimeline({ requestId }) {
  const [r, setR] = useState(null);
  useEffect(() => {
    if (!requestId) return;
    const unsub = onSnapshot(doc(db, "requests", requestId), (snap) =>
      setR({ id: snap.id, ...snap.data() })
    );
    return () => unsub();
  }, [requestId]);

  const steps = [
    { key: "submitted", label: "Submitted", at: r?.createdAt?.toDate?.() },
    { key: "assigned", label: "Reviewed", at: r?.reviewedAt?.toDate?.() },
    { key: "scheduled", label: "Scheduled", at: r?.scheduledAt?.toDate?.() },
    { key: "completed", label: "Completed", at: r?.completedAt?.toDate?.() },
  ];

  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === r?.status)
  );

  return (
    <Card>
      <h3 className="font-semibold mb-3">Request Timeline</h3>
      <div className="flex items-center gap-2 mb-3">
        {steps.map((s, i) => (
          <div key={s.key} className="flex-1">
            <div
              className={`h-2 rounded ${
                i <= currentIndex ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
            <div className="text-xs mt-1 text-center">{s.label}</div>
          </div>
        ))}
      </div>
      <ul className="text-sm space-y-2">
        {steps.map((s) => (
          <li
            key={s.key}
            className="flex items-center justify-between border rounded-xl px-3 py-2"
          >
            <span>{s.label}</span>
            <div className="flex items-center gap-2">
              <Badge color={s.at ? "green" : "gray"}>
                {s.at ? "done" : "pending"}
              </Badge>
              <span className="text-xs text-gray-500">
                {s.at ? s.at.toLocaleString() : "-"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
