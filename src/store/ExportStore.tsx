import { create } from "zustand";

interface ExportState {
  translations: Record<string, { id: string; items: any }[]>;
  language: string | null;
  file: File | File[] | null;
}

interface ExportActions {
  setLanguage: (language: string | null) => void;
  setTranslations: (
    language: string,
    translations: { id: string; items: any }[]
  ) => void;
  setFile: (file: File | File[] | null) => void;
}

export const useExportStore = create<ExportState & ExportActions>((set) => ({
  translations: {},
  language: null,
  file: null,
  setFile: (file) => set({ file }),
  setLanguage: (language) => set({ language }),
  setTranslations: (language, translations) =>
    set((state) => ({
      translations: {
        ...state.translations,
        [language]: translations,
      },
    })),
}));
