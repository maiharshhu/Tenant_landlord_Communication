import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";
import Card from "../Shared/Card";
import Button from "../Shared/Button";
import { useAuth } from "../../context/AuthContext";

export default function MaintenanceRequestForm() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    category: "Plumbing",
    title: "",
    details: "",
    preferredDate: "",
    preferredTime: "",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    setSaving(true);
    await addDoc(collection(db, "requests"), {
      ...data,
      status: "submitted",
      uid: user?.uid,
      createdAt: serverTimestamp(),
    });
    setSaving(false);
    setDone(true);
  };

  if (done) return <Card>Request submitted ✅</Card>;

  return (
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded ${
              i <= step ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Issue Details</h3>
          <select
            className="w-full border rounded-xl px-3 py-2"
            value={data.category}
            onChange={(e) => setData({ ...data, category: e.target.value })}
          >
            <option>Plumbing</option>
            <option>Electrical</option>
            <option>Appliance</option>
            <option>Other</option>
          </select>
          <input
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Short title"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
          <textarea
            className="w-full border rounded-xl px-3 py-2"
            rows={4}
            placeholder="Describe the issue"
            value={data.details}
            onChange={(e) => setData({ ...data, details: e.target.value })}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Schedule Preference</h3>
          <input
            type="date"
            className="w-full border rounded-xl px-3 py-2"
            value={data.preferredDate}
            onChange={(e) =>
              setData({ ...data, preferredDate: e.target.value })
            }
          />
          <input
            type="time"
            className="w-full border rounded-xl px-3 py-2"
            value={data.preferredTime}
            onChange={(e) =>
              setData({ ...data, preferredTime: e.target.value })
            }
          />
        </div>
      )}

      {step === 3 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Confirm</h3>
          <ul className="text-sm">
            <li>
              <strong>Category:</strong> {data.category}
            </li>
            <li>
              <strong>Title:</strong> {data.title}
            </li>
            <li>
              <strong>Details:</strong> {data.details}
            </li>
            <li>
              <strong>Preferred:</strong> {data.preferredDate}{" "}
              {data.preferredTime}
            </li>
          </ul>
        </div>
      )}

      <div className="flex gap-2 justify-end">
        {step > 1 && (
          <Button onClick={back} className="bg-gray-800">
            Back
          </Button>
        )}
        {step < 3 && <Button onClick={next}>Next</Button>}
        {step === 3 && (
          <Button onClick={submit} disabled={saving}>
            {saving ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>
    </Card>
  );
}
