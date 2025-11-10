import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase/config";
import Card from "../../components/Shared/Card";

export default function LandlordDashboard() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const filtered = status ? rows.filter((r) => r.status === status) : rows;

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Issues</h2>
        <select
          className="border rounded-xl px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="submitted">Submitted</option>
          <option value="assigned">Assigned</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Title</th>
              <th className="py-2">Category</th>
              <th className="py-2">Status</th>
              <th className="py-2">Preferred</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="py-2">{r.title}</td>
                <td className="py-2">{r.category}</td>
                <td className="py-2">{r.status}</td>
                <td className="py-2">
                  {r.preferredDate} {r.preferredTime}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
