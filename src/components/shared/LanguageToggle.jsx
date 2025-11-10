import Button from "./Button";
import { useI18n } from "../../utils/i18n";

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();
  const next = lang === "en" ? "hi" : "en";
  return (
    <Button onClick={() => setLang(next)} className="bg-gray-900">
      {lang.toUpperCase()}
    </Button>
  );
}
