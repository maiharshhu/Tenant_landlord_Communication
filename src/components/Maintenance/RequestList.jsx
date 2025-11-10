import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/config.js";
import { useAuth } from "../../context/AuthContext.jsx";
import Card from "../Shared/Card.jsx";
import Badge from "../Shared/Badge.jsx";
import Progress from "../Shared/Progress.jsx";
import { Link } from "react-router-dom";

const statusColor = (s) =>
  s === "completed"
    ? "green"
    : s === "scheduled"
    ? "violet"
    : s === "assigned"
    ? "amber"
    : s === "submitted"
    ? "blue"
    : "gray";

const statusProgress = (s) =>
  s === "completed"
    ? 100
    : s === "scheduled"
    ? 75
    : s === "assigned"
    ? 50
    : s === "submitted"
    ? 25
    : 10;

export default function RequestList() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "requests"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const list = useMemo(
    () => (status ? rows.filter((r) => r.status === status) : rows),
    [rows, status]
  );

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">My Requests</h3>
        <select
          className="border rounded-xl px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="submitted">Pending</option>
          <option value="assigned">In Progress</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="border rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-gray-500">
                  {r.category} • {r.urgency || "normal"}
                </div>
              </div>
              <Badge color={statusColor(r.status)}>{r.status}</Badge>
            </div>
            <div className="mt-2">
              <Progress value={statusProgress(r.status)} />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Preferred: {r.preferredDate || "-"} {r.preferredTime || ""}
              <span className="mx-2">•</span>
              <Link className="underline" to={`/request/${r.id}`}>
                Timeline
              </Link>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-sm text-gray-500">No requests yet.</div>
        )}
      </div>
    </Card>
  );
}
