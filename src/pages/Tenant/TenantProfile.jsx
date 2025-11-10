import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Card from "../../components/Shared/Card.jsx";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../../firebase/config.js";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function TenantProfile() {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState("");
  const [contact, setContact] = useState({ phone: "", method: "email" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "profiles", user.uid));
      if (snap.exists()) {
        const d = snap.data();
        setAvatar(d.avatar || "");
        setContact({ phone: d.phone || "", method: d.method || "email" });
      }
    };
    if (user) load();
  }, [user]);

  const uploadAvatar = async (f) => {
    const key = `avatars/${user.uid}-${Date.now()}-${f.name}`;
    const sRef = ref(storage, key);
    await uploadBytes(sRef, f);
    const url = await getDownloadURL(sRef);
    setAvatar(url);
  };

  const save = async () => {
    setSaving(true);
    await setDoc(
      doc(db, "profiles", user.uid),
      {
        uid: user.uid,
        avatar,
        phone: contact.phone,
        method: contact.method,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
    setSaving(false);
  };

  return (
    <div className="max-w-xl mx-auto">
      <Card className="space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div className="flex items-center gap-3">
          <img
            src={avatar || "https://via.placeholder.com/64?text=👤"}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover border"
          />
          <label className="px-3 py-2 rounded bg-gray-900 text-white cursor-pointer">
            Upload Avatar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && uploadAvatar(e.target.files[0])
              }
            />
          </label>
        </div>

        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            placeholder="+91 ..."
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Preferred contact</label>
          <select
            className="w-full border rounded-xl px-3 py-2"
            value={contact.method}
            onChange={(e) => setContact({ ...contact, method: e.target.value })}
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="phone">Phone</option>
          </select>
        </div>

        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </Card>
    </div>
  );
}
