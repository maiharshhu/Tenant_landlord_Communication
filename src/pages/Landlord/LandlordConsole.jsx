import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import Card from "../../components/Shared/Card";

export default function LandlordConsole() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "requests"), (snap) =>
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const setStatus = async (id, status) => {
    await updateDoc(doc(db, "requests", id), { status });
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {rows.map((r) => (
        <Card key={r.id}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{r.title}</div>
              <div className="text-sm text-gray-500">{r.category}</div>
            </div>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {r.status}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            {["submitted", "assigned", "scheduled", "completed"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(r.id, s)}
                className={`px-3 py-1 rounded border ${
                  r.status === s ? "bg-blue-600 text-white" : "bg-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
