import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/config.js";
import Card from "../../components/Shared/Card.jsx";
import Badge from "../../components/Shared/Badge.jsx";
import Button from "../../components/Shared/Button.jsx";

const statusColor = (s) =>
  s === "paid"
    ? "green"
    : s === "overdue"
    ? "red"
    : s === "delay_requested"
    ? "amber"
    : "blue";

export default function LandlordPayments() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const q = query(collection(db, "payments"), orderBy("dueDate", "desc"));
    const unsub = onSnapshot(q, (snap) =>
      setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, []);

  const list = useMemo(
    () => (status ? rows.filter((r) => r.status === status) : rows),
    [rows, status]
  );

  const markOverdue = async (id) => {
    await updateDoc(doc(db, "payments", id), { status: "overdue" });
  };

  const sendReminder = async (p) => {
    await addDoc(collection(db, "notifications"), {
      recipientId: p.uid,
      type: "payment_reminder",
      message: `Rent reminder for ${p.month}: ₹${p.amount} due soon.`,
      link: "/tenant", // or "/payments" if you add a dedicated page
      createdAt: serverTimestamp(),
      read: false,
    });
    alert(`Reminder queued for ${p.uid}`);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Payments Dashboard</h2>
        <select
          className="border rounded-xl px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="delay_requested">Delay Requested</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Tenant</th>
              <th className="py-2">Property</th>
              <th className="py-2">Month</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Due</th>
              <th className="py-2">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="py-2">{p.uid}</td>
                <td className="py-2">{p.propertyId || "-"}</td>
                <td className="py-2">{p.month}</td>
                <td className="py-2">₹{p.amount}</td>
                <td className="py-2">
                  {new Date(
                    p.dueDate?.seconds ? p.dueDate.seconds * 1000 : p.dueDate
                  ).toLocaleDateString()}
                </td>
                <td className="py-2">
                  <Badge color={statusColor(p.status)}>{p.status}</Badge>
                </td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <Button
                      className="!px-3 !py-1"
                      onClick={() => sendReminder(p)}
                    >
                      Send Reminder
                    </Button>
                    <Button
                      className="!px-3 !py-1 bg-red-600"
                      onClick={() => markOverdue(p.id)}
                      disabled={p.status === "overdue"}
                    >
                      Mark Overdue
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={7}>
                  No payments
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
