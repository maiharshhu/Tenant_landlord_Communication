import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db, rtdb } from "../../firebase/config.js";
import Card from "../Shared/Card.jsx";
import Badge from "../Shared/Badge.jsx";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getOrCreateThreadRTDB } from "../../utils/chatRTDB.js";

export default function IssuesTable() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    propertyId: "",
    category: "",
    urgency: "",
    status: "",
  });
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (!filters.propertyId || r.propertyId === filters.propertyId) &&
          (!filters.category || r.category === filters.category) &&
          (!filters.urgency || (r.urgency || "normal") === filters.urgency) &&
          (!filters.status || r.status === filters.status)
      ),
    [rows, filters]
  );

  const setStatus = async (id, status) => {
    const patch = { status };
    if (status === "assigned") patch.reviewedAt = new Date();
    if (status === "scheduled") patch.scheduledAt = new Date();
    if (status === "completed") patch.completedAt = new Date();
    await updateDoc(doc(db, "requests", id), patch);
  };

  const approveSlot = async (r) => {
    if (!r.preferredDate || !r.preferredTime) return;
    await updateDoc(doc(db, "requests", r.id), {
      status: "scheduled",
      scheduledAt: new Date(),
    });
  };

  const openChat = async (tenantUid) => {
    const threadId = await getOrCreateThreadRTDB(rtdb, user.uid, tenantUid);
    nav(`/chat?thread=${threadId}`);
  };

  const uniq = (key) =>
    Array.from(new Set(rows.map((r) => r[key]).filter(Boolean)));
  const statusColor = (s) =>
    s === "completed"
      ? "green"
      : s === "scheduled"
      ? "violet"
      : s === "assigned"
      ? "amber"
      : "blue";

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">All Issues</h2>
        <div className="flex gap-2">
          <select
            className="border rounded-xl px-3 py-2"
            value={filters.propertyId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, propertyId: e.target.value }))
            }
          >
            <option value="">Property</option>
            {uniq("propertyId").map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <select
            className="border rounded-xl px-3 py-2"
            value={filters.category}
            onChange={(e) =>
              setFilters((f) => ({ ...f, category: e.target.value }))
            }
          >
            <option value="">Type</option>
            {uniq("category").map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            className="border rounded-xl px-3 py-2"
            value={filters.urgency}
            onChange={(e) =>
              setFilters((f) => ({ ...f, urgency: e.target.value }))
            }
          >
            <option value="">Urgency</option>
            {uniq("urgency")
              .concat(["normal"])
              .map((u) => (
                <option key={u}>{u}</option>
              ))}
          </select>
          <select
            className="border rounded-xl px-3 py-2"
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value }))
            }
          >
            <option value="">Status</option>
            {["submitted", "assigned", "scheduled", "completed"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Title</th>
              <th className="py-2">Tenant</th>
              <th className="py-2">Property</th>
              <th className="py-2">Type</th>
              <th className="py-2">Urgency</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">{r.title}</td>
                <td className="py-2">{r.uid}</td>
                <td className="py-2">{r.propertyId || "-"}</td>
                <td className="py-2">{r.category}</td>
                <td className="py-2">{r.urgency || "normal"}</td>
                <td className="py-2">
                  <Badge color={statusColor(r.status)}>{r.status}</Badge>
                </td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-2">
                    {["submitted", "assigned", "scheduled", "completed"].map(
                      (s) => (
                        <button
                          key={s}
                          onClick={() => setStatus(r.id, s)}
                          className={`px-2 py-1 text-xs rounded border ${
                            r.status === s
                              ? "bg-blue-600 text-white"
                              : "bg-white"
                          }`}
                        >
                          {s}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => approveSlot(r)}
                      className="px-2 py-1 text-xs rounded border"
                      disabled={
                        !r.preferredDate ||
                        !r.preferredTime ||
                        r.status === "scheduled" ||
                        r.status === "completed"
                      }
                    >
                      Approve Slot
                    </button>
                    <button
                      onClick={() => openChat(r.uid)}
                      className="px-2 py-1 text-xs rounded border"
                    >
                      Chat
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={7}>
                  No issues
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
