import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../../firebase/config.js";
import Card from "../Shared/Card.jsx";
import Button from "../Shared/Button.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const COMMON_ISSUES = [
  "Leaky faucet",
  "No hot water",
  "Power outage in room",
  "AC not cooling",
  "Heater not working",
  "Broken window",
  "Door lock stuck",
  "Clogged drain",
  "Water seepage",
];

export default function MaintenanceRequestForm() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    propertyId: "",
    category: "Plumbing",
    urgency: "normal",
    title: "",
    details: "",
    preferredDate: "",
    preferredTime: "",
    media: [], // urls after upload
  });

  const [suggestions, setSuggestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dropRef = useRef(null);

  // --- live validation ---
  useEffect(() => {
    const e = {};
    if (!data.propertyId.trim()) e.propertyId = "Property is required";
    if (!data.title.trim()) e.title = "Title is required";
    if (data.title.length > 100) e.title = "Keep title under 100 chars";
    if (!data.details.trim()) e.details = "Details required";
    if (step === 2) {
      if (!data.preferredDate) e.preferredDate = "Date required";
      if (!data.preferredTime) e.preferredTime = "Time required";
    }
    setErrors(e);
  }, [data, step]);

  // --- auto-suggest as typing title ---
  useEffect(() => {
    const t = data.title.toLowerCase();
    if (!t) return setSuggestions([]);
    const picks = COMMON_ISSUES.filter((s) =>
      s.toLowerCase().includes(t)
    ).slice(0, 5);
    setSuggestions(picks);
  }, [data.title]);

  // --- drag & drop handlers ---
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDrop = async (e) => {
      prevent(e);
      const files = Array.from(e.dataTransfer.files || []).filter((f) =>
        /^image\/|^video\//.test(f.type)
      );
      if (files.length) await handleUpload(files);
    };
    ["dragenter", "dragover", "dragleave", "drop"].forEach((ev) =>
      el.addEventListener(ev, prevent)
    );
    el.addEventListener("drop", onDrop);
    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((ev) =>
        el.removeEventListener(ev, prevent)
      );
      el.removeEventListener("drop", onDrop);
    };
  }, []);

  const handleUpload = async (files) => {
    setUploading(true);
    const uploaded = [];
    for (const f of files) {
      const key = `requests/${user?.uid}/${Date.now()}-${f.name}`;
      const sRef = ref(storage, key);
      await uploadBytes(sRef, f);
      const url = await getDownloadURL(sRef);
      uploaded.push({ url, name: f.name, type: f.type });
    }
    setData((d) => ({ ...d, media: [...d.media, ...uploaded] }));
    setUploading(false);
  };

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const canNext = useMemo(() => {
    if (step === 1)
      return !errors.propertyId && !errors.title && !errors.details;
    if (step === 2) return !errors.preferredDate && !errors.preferredTime;
    return true;
  }, [errors, step]);

  const submit = async () => {
    setSaving(true);
    await addDoc(collection(db, "requests"), {
      ...data,
      uid: user?.uid,
      status: "submitted",
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

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Issue Details</h3>
          <input
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Property ID"
            value={data.propertyId}
            onChange={(e) => setData({ ...data, propertyId: e.target.value })}
          />
          {errors.propertyId && (
            <p className="text-xs text-red-600">{errors.propertyId}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select
              className="border rounded-xl px-3 py-2 md:col-span-1"
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
            >
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Appliance</option>
              <option>Other</option>
            </select>

            <select
              className="border rounded-xl px-3 py-2 md:col-span-2"
              value={data.urgency}
              onChange={(e) => setData({ ...data, urgency: e.target.value })}
            >
              <option value="low">low</option>
              <option value="normal">normal</option>
              <option value="high">high</option>
              <option value="critical">critical</option>
            </select>
          </div>

          {/* Title with suggestions */}
          <div>
            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Short title (e.g., Leaky faucet)"
              value={data.title}
              maxLength={100}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
            {errors.title && (
              <p className="text-xs text-red-600">{errors.title}</p>
            )}
            {suggestions.length > 0 && (
              <div className="mt-1 border rounded-xl bg-white shadow">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                    onClick={() => setData({ ...data, title: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <textarea
            className="w-full border rounded-xl px-3 py-2"
            rows={4}
            placeholder="Describe the issue"
            value={data.details}
            onChange={(e) => setData({ ...data, details: e.target.value })}
          />
          {errors.details && (
            <p className="text-xs text-red-600">{errors.details}</p>
          )}

          {/* Drag & Drop / Upload */}
          <div
            ref={dropRef}
            className="border-2 border-dashed rounded-2xl p-4 text-center hover:bg-gray-50"
          >
            <p className="text-sm">Drag & drop images/videos here, or</p>
            <label className="inline-block mt-2 px-3 py-1 rounded bg-gray-900 text-white cursor-pointer">
              Browse
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(Array.from(e.target.files || []))}
              />
            </label>
            {uploading && (
              <p className="text-xs text-gray-500 mt-2">Uploading…</p>
            )}
            {data.media.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {data.media.map((m, i) => (
                  <div
                    key={i}
                    className="border rounded-xl p-1 text-xs truncate"
                  >
                    {m.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2 */}
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
          {errors.preferredDate && (
            <p className="text-xs text-red-600">{errors.preferredDate}</p>
          )}
          <input
            type="time"
            className="w-full border rounded-xl px-3 py-2"
            value={data.preferredTime}
            onChange={(e) =>
              setData({ ...data, preferredTime: e.target.value })
            }
          />
          {errors.preferredTime && (
            <p className="text-xs text-red-600">{errors.preferredTime}</p>
          )}
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Confirm</h3>
          <ul className="text-sm">
            <li>
              <strong>Property:</strong> {data.propertyId}
            </li>
            <li>
              <strong>Category:</strong> {data.category}
            </li>
            <li>
              <strong>Urgency:</strong> {data.urgency}
            </li>
            <li>
              <strong>Title:</strong> {data.title}
            </li>
            <li>
              <strong>Preferred:</strong> {data.preferredDate}{" "}
              {data.preferredTime}
            </li>
            <li>
              <strong>Files:</strong> {data.media.length}
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
        {step < 3 && (
          <Button onClick={next} disabled={!canNext}>
            Next
          </Button>
        )}
        {step === 3 && (
          <Button onClick={submit} disabled={saving}>
            {saving ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>
    </Card>
  );
}
