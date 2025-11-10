import React, { createContext, useContext, useMemo, useState } from "react";

const translations = {
  en: {
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    name: "Full Name",
    logout: "Log out",
    tenantDashboard: "Tenant Dashboard",
    landlordDashboard: "Landlord Dashboard",
    newRequest: "New Request",
    profile: "Profile",
  },
  hi: {
    signIn: "साइन इन",
    signUp: "साइन अप",
    email: "ईमेल",
    password: "पासवर्ड",
    name: "पूरा नाम",
    logout: "लॉगआउट",
    tenantDashboard: "टेनेंट डैशबोर्ड",
    landlordDashboard: "लैंडलॉर्ड डैशबोर्ड",
    newRequest: "नई रिक्वेस्ट",
    profile: "प्रोफ़ाइल",
  },
};

const LangContext = createContext(undefined);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en");
  const t = useMemo(() => (key) => translations[lang][key] ?? key, [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (ctx === undefined) {
    throw new Error(
      "useI18n must be used within <LanguageProvider> and via the same module path"
    );
  }
  return ctx;
}
