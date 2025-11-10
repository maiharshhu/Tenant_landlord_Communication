import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config.js";
import { ref, onValue, off, get, child } from "firebase/database";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Threads({ onOpen }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    if (!user) return;
    const listRef = ref(rtdb, `userThreads/${user.uid}`);
    const handler = (snap) => {
      const val = snap.val() || {};
      const arr = Object.entries(val).map(([id, v]) => ({
        id,
        otherUid: v.otherUid,
        updatedAt: v.updatedAt || 0,
      }));
      Promise.all(
        arr.map(async (t) => {
          if (t.updatedAt) return t;
          const ts = await get(child(ref(rtdb), `threads/${t.id}/updatedAt`));
          return { ...t, updatedAt: ts.val() || 0 };
        })
      ).then((filled) => {
        filled.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setThreads(filled);
      });
    };
    onValue(listRef, handler);
    return () => off(listRef, "value", handler);
  }, [user]);

  return (
    <div className="border rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Threads</div>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {threads.map((t) => (
          <div
            key={t.id}
            className="p-2 border rounded-xl cursor-pointer hover:bg-gray-50"
            onClick={() => onOpen?.(t.id)}
          >
            <div className="text-sm">Other: {t.otherUid}</div>
            <div className="text-xs text-gray-500">
              Updated:{" "}
              {t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "-"}
            </div>
          </div>
        ))}
        {threads.length === 0 && (
          <div className="text-sm text-gray-500">No threads</div>
        )}
      </div>
    </div>
  );
}
