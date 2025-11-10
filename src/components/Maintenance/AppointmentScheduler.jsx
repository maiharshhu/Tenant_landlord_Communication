import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import Card from "../Shared/Card";
import Button from "../Shared/Button";

export default function AppointmentScheduler({ requestId }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saved, setSaved] = useState(false);

  const schedule = async () => {
    await addDoc(collection(db, "appointments"), {
      requestId: requestId || null,
      date,
      time,
      createdAt: serverTimestamp(),
    });
    setSaved(true);
  };

  return (
    <Card className="space-y-3">
      <h3 className="font-semibold">Schedule Appointment</h3>
      <input
        type="date"
        className="w-full border rounded-xl px-3 py-2"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        type="time"
        className="w-full border rounded-xl px-3 py-2"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <Button onClick={schedule} disabled={!date || !time}>
        {saved ? "Scheduled ✅" : "Schedule"}
      </Button>
    </Card>
  );
}
