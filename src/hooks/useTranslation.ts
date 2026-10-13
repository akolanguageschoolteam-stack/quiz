'use client'
import en from "@/utils/locale/en.json";
import { useSelector } from "react-redux";
import { currentTranslationsSelector } from "@/redux/reducers/languageSlice";

export const useTranslation = () => {
  const translations = useSelector(currentTranslationsSelector);

  const t = (label: string): string => {
    if (translations[label]) {
      return translations[label];
    }

    if (en[label as keyof typeof en]) {
      return en[label as keyof typeof en];
    }

    // Return original label if no translation found
    return label;
  };

  return { t };
};
