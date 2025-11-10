import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/config.js";
import Card from "../../components/Shared/Card.jsx";
import Button from "../../components/Shared/Button.jsx";

function toCSV(rows) {
  const headers = [
    "requestId",
    "propertyId",
    "category",
    "urgency",
    "title",
    "status",
    "createdAt",
    "completedAt",
  ];
  const esc = (s) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const body = rows
    .map((r) =>
      [
        r.id,
        r.propertyId,
        r.category,
        r.urgency,
        r.title,
        r.status,
        r.createdAt?.toDate?.()?.toISOString?.() || "",
        r.completedAt?.toDate?.()?.toISOString?.() || "",
      ]
        .map(esc)
        .join(",")
    )
    .join("\n");
  return headers.join(",") + "\n" + body;
}

export default function ReportsPage() {
  const [rows, setRows] = useState([]);
  const [property, setProperty] = useState("");

  useEffect(() => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const list = useMemo(
    () => (property ? rows.filter((r) => r.propertyId === property) : rows),
    [rows, property]
  );
  const properties = Array.from(
    new Set(rows.map((r) => r.propertyId).filter(Boolean))
  );

  const exportCSV = () => {
    const csv = toCSV(list);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "maintenance_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    window.print(); // simple approach; for real PDF, integrate a library or server.
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Maintenance Reports</h2>
        <div className="flex gap-2">
          <select
            className="border rounded-xl px-3 py-2"
            value={property}
            onChange={(e) => setProperty(e.target.value)}
          >
            <option value="">All Properties</option>
            {properties.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <Button className="!px-3 !py-2" onClick={exportCSV}>
            Export CSV
          </Button>
          <Button className="!px-3 !py-2 bg-gray-800" onClick={printPDF}>
            Print / PDF
          </Button>
        </div>
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {list.map((r) => (
          <div key={r.id} className="border rounded-xl p-3">
            <div className="font-medium">{r.title}</div>
            <div className="text-xs text-gray-500">
              {r.propertyId || "-"} • {r.category} • {r.urgency || "normal"}
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-sm text-gray-500">No records</div>
        )}
      </div>
    </Card>
  );
}
