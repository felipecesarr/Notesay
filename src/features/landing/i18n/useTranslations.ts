import { useLanguageStore } from "../store/language-store";
import { translations } from "./translations";

export function useTranslations() {
  const language = useLanguageStore((state) => state.language);
  return translations[language];
}
