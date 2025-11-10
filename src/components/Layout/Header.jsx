import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Button from "../Shared/Button.jsx";
import LanguageToggle from "../Shared/LanguageToggle.jsx";
import { useI18n } from "../../utils/i18n.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import Toast from "../Shared/Toast.jsx";

export default function Header() {
  const { user, logOut, role, isLandlord } = useAuth();
  const { t } = useI18n();
  const { toasts, dismiss } = useNotifications();

  // Safe display name fallback
  const displayName =
    user?.displayName?.trim() ||
    (user?.email ? user.email.split("@")[0] : "User");

  const roleLabel =
    role === "landlord" ? "Landlord" : role === "tenant" ? "Tenant" : "";

  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4 gap-3">
        {/* Brand */}
        <Link to="/" className="font-bold text-xl">
          🏢 Tenant-Landlord
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-2">
          {user && (
            <NavLink
              to={isLandlord ? "/landlord" : "/tenant"}
              className="px-3 py-2 rounded hover:bg-gray-100"
            >
              Dashboard
            </NavLink>
          )}
          {user && (
            <NavLink to="/chat" className="px-3 py-2 rounded hover:bg-gray-100">
              Chat
            </NavLink>
          )}
          {user && isLandlord && (
            <>
              <NavLink
                to="/landlord/reports"
                className="px-3 py-2 rounded hover:bg-gray-100"
              >
                Reports
              </NavLink>
              <NavLink
                to="/landlord/payments"
                className="px-3 py-2 rounded hover:bg-gray-100"
              >
                Payments
              </NavLink>
              {/* 👇 Console link removed */}
            </>
          )}
        </nav>

        {/* Right side: Name + Role + Auth + Lang */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Name + Role pill */}
              <div className="flex items-center gap-2 max-w-[55vw] md:max-w-none">
                <span className="truncate font-medium">{displayName}</span>
                {roleLabel && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100">
                    {roleLabel}
                  </span>
                )}
              </div>

              <NavLink
                to="/tenant/profile"
                className="hidden md:inline-block px-3 py-2 rounded hover:bg-gray-100"
              >
                {t("profile")}
              </NavLink>

              <LanguageToggle />
              <Button onClick={logOut}>Logout</Button>
            </>
          ) : (
            <>
              <LanguageToggle />
              <NavLink
                to="/signin"
                className="px-3 py-2 rounded hover:bg-gray-100"
              >
                {t("signIn")}
              </NavLink>
              <NavLink
                to="/signup"
                className="px-3 py-2 rounded hover:bg-gray-100"
              >
                {t("signUp")}
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav (optional) */}
      <div className="md:hidden border-t bg-white">
        <div className="max-w-6xl mx-auto flex items-center gap-2 p-2">
          {user && (
            <>
              <NavLink
                to={isLandlord ? "/landlord" : "/tenant"}
                className="px-3 py-2 rounded hover:bg-gray-100"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/chat"
                className="px-3 py-2 rounded hover:bg-gray-100"
              >
                Chat
              </NavLink>
              {isLandlord && (
                <>
                  <NavLink
                    to="/landlord/reports"
                    className="px-3 py-2 rounded hover:bg-gray-100"
                  >
                    Reports
                  </NavLink>
                  <NavLink
                    to="/landlord/payments"
                    className="px-3 py-2 rounded hover:bg-gray-100"
                  >
                    Payments
                  </NavLink>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      {toasts.map((n) => (
        <Toast
          key={n.id}
          title="Alert"
          message={n.message}
          link={n.link}
          onClose={() => dismiss(n.id)}
        />
      ))}
    </header>
  );
}
