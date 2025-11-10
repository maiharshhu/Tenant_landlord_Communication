import { useMemo, useState } from "react";
import Card from "../Shared/Card.jsx";

function buildSlots(days = 7) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const label = d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    out.push({
      dateISO: d.toISOString().slice(0, 10),
      label,
      times: ["09:00", "11:00", "14:00", "16:00"],
    });
  }
  return out;
}

export default function AppointmentScheduler({ onPick }) {
  const days = useMemo(() => buildSlots(7), []);
  const [picked, setPicked] = useState({ date: "", time: "" });

  const choose = (date, time) => {
    const sel = { date, time };
    setPicked(sel);
    onPick?.(sel);
  };

  return (
    <Card>
      <h3 className="font-semibold mb-3">Pick a slot</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {days.map((d) => (
          <div key={d.dateISO} className="border rounded-xl p-2">
            <div className="text-sm font-medium">{d.label}</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {d.times.map((t) => {
                const active = picked.date === d.dateISO && picked.time === t;
                return (
                  <button
                    key={t}
                    onClick={() => choose(d.dateISO, t)}
                    className={`px-2 py-1 rounded border text-xs ${
                      active ? "bg-blue-600 text-white" : "bg-white"
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {picked.date && (
        <div className="mt-3 text-sm text-gray-700">
          Selected: <b>{picked.date}</b> at <b>{picked.time}</b>
        </div>
      )}
    </Card>
  );
}
