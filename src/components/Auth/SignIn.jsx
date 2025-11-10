import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Card from "../Shared/Card.jsx";
import Button from "../Shared/Button.jsx";
import { useI18n } from "../../utils/i18n.jsx";

export default function SignIn() {
  const { signIn, role, user } = useAuth();
  const nav = useNavigate();
  const { t } = useI18n();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && role) nav(role === "landlord" ? "/landlord" : "/tenant");
  }, [user, role, nav]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await signIn(form.email, form.password);
      // role redirect triggers via effect once role loads
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <h1 className="text-xl font-semibold mb-4">{t("signIn")}</h1>
        <form onSubmit={submit} className="space-y-3">
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
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" className="w-full">
            {t("signIn")}
          </Button>
        </form>
        <p className="text-sm mt-3">
          No account?{" "}
          <Link className="text-blue-600" to="/signup">
            {t("signUp")}
          </Link>
        </p>
      </Card>
    </div>
  );
}
