// This just piggibacks on MM2 translations, its not the best way to handle translations
import { createContext } from "react";

import { TranslationKeys } from "../../../src/types/module";
export type Translations = Partial<Record<TranslationKeys, string>>

interface TranslationsContextProps {
  translations: Translations | null;
  loading: boolean;
}

export const TranslationsContext = createContext<TranslationsContextProps | undefined>(undefined);

