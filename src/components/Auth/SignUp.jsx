import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Card from "../Shared/Card.jsx";
import Button from "../Shared/Button.jsx";
import { useI18n } from "../../utils/i18n.jsx";

export default function SignUp() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "tenant",
  });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await signUp(form.name, form.email, form.password, form.role);
      nav(form.role === "landlord" ? "/landlord" : "/tenant");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-xl font-semibold mb-4">{t("signUp")}</h1>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full border rounded-xl px-3 py-2"
            placeholder={t("name")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="w-full border rounded-xl px-3 py-2"
            placeholder={t("email")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            type="email"
            required
          />
          <input
            className="w-full border rounded-xl px-3 py-2"
            placeholder={t("password")}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            type="password"
            required
          />

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-2">
            <label className="border rounded-xl px-3 py-2 flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="tenant"
                checked={form.role === "tenant"}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
              <span>Tenant</span>
            </label>
            <label className="border rounded-xl px-3 py-2 flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="landlord"
                checked={form.role === "landlord"}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
              <span>Landlord</span>
            </label>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            {t("signUp")}
          </Button>
        </form>
        <p className="text-sm mt-3">
          Have an account?{" "}
          <Link className="text-blue-600" to="/signin">
            {t("signIn")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
