import { useEffect, useState } from "react";
import { rtdb } from "../../firebase/config.js";
import { ref, onValue, off, get, child } from "firebase/database";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Threads({ onOpen }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]); // [{id, otherUid, updatedAt}]

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
      // ensure updatedAt from threads if missing
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

  const open = (id) => onOpen?.(id);

  const newThreadPrompt = async () => {
    const other = prompt("Enter other user UID:");
    if (!other) return;
    // App-level util will create; we open from Landlord IssuesTable usually.
    alert("Use 'Chat' button from issues list to auto-create threads. 👍");
  };

  return (
    <div className="border rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Threads</div>
        <button className="text-sm underline" onClick={newThreadPrompt}>
          New
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {threads.map((t) => (
          <div
            key={t.id}
            className="p-2 border rounded-xl cursor-pointer hover:bg-gray-50"
            onClick={() => open(t.id)}
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
