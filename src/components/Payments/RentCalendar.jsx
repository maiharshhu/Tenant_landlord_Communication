import Card from "../Shared/Card";

function buildMonths(n = 6) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    out.push({
      label: d.toLocaleString(undefined, { month: "short", year: "numeric" }),
      due: new Date(d.getFullYear(), d.getMonth(), 5).toLocaleDateString(),
    });
  }
  return out;
}

export default function RentCalendar() {
  const months = buildMonths();
  return (
    <Card>
      <h3 className="font-semibold mb-3">Rent Calendar</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {months.map((m) => (
          <div key={m.label} className="border rounded-xl p-3">
            <div className="text-sm text-gray-500">{m.label}</div>
            <div className="text-lg">Due: {m.due}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
