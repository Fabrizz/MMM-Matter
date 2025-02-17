import React, { useState, useEffect } from "react";
import { TranslationsContext, type Translations } from "./TranslationsContext";
import fallbackTranslations from "../../../translations/en.json";

interface TranslationsProviderProps {
  children: React.ReactNode;
}

export const TranslationsProvider: React.FC<TranslationsProviderProps> = ({
  children,
}) => {
  const [translations, setTranslations] = useState<Translations | null>(
    fallbackTranslations,
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch("/matter/api/translations");
        const data: Translations = await response.json();
        setTranslations(data);
        console.log("Translations loaded", data);
      } catch (error) {
        console.error("Error fetching translations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslations();
  }, []);

  return (
    <TranslationsContext.Provider value={{ translations, loading }}>
      {children}
    </TranslationsContext.Provider>
  );
};
