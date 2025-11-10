import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/config.js";
import { useAuth } from "./AuthContext.jsx";

const NotifCtx = createContext(undefined);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);
  const seen = useRef(new Set());

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((ch) => {
        const n = { id: ch.doc.id, ...ch.doc.data() };
        if (ch.type === "added" && !seen.current.has(n.id) && !n.read) {
          seen.current.add(n.id);
          setToasts((t) => [...t, n]);
        }
      });
    });
    return () => unsub();
  }, [user]);

  const dismiss = useCallback(async (id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch {}
  }, []);

  return (
    <NotifCtx.Provider value={{ toasts, dismiss }}>
      {children}
    </NotifCtx.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotifCtx);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within <NotificationProvider>"
    );
  return ctx;
}
