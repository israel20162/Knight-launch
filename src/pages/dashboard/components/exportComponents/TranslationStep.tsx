import React, { useState } from "react";
import type { CanvasItem } from "../../../../types";
import { Separator, Section, Button } from "@radix-ui/themes";
import TranslationsUploader from "../../../../components/ui/translationUploader";
import { useCanvasStore } from "../../../../store/CanvasStore";

interface TranslationStepProps {
  canvases: CanvasItem[];
  onBack: () => void;
  onNext: () => void;
  setTranslations: (translations: any) => void;
  setLanguage: (language: string | null) => void;
  exportTexts: (
    canvases: CanvasItem[],
    languages: { code: string; name: string }[]
  ) => void;
}

const TranslationStep: React.FC<TranslationStepProps> = ({
  canvases,
  onBack,
  onNext,
  exportTexts,
  setTranslations,
  setLanguage,
}) => {
  const [selectedLanguages, setSelectedLanguages] = useState<
    { code: string; name: string }[]
  >([{ code: "en", name: "English" }]);

  const [availableLanguages, setAvailableLanguages] = useState<
    { code: string; name: string }[]
  >([
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "ar", name: "Arabic" },
  ]);

  const [newLangCode, setNewLangCode] = useState("");
  const [newLangName, setNewLangName] = useState("");

  const toggleLanguage = (code: string, name: string) => {
    setSelectedLanguages((prev) =>
      prev.find((l) => l.code === code)
        ? prev.filter((l) => l.code !== code)
        : [...prev, { code, name }]
    );
  };

  const addNewLanguage = () => {
    const code = newLangCode.trim().toLowerCase();
    const name = newLangName.trim();

    if (!code || !name) {
      alert("Please provide both a code and a name for the language.");
      return;
    }

    if (availableLanguages.find((l) => l.code === code)) {
      alert("This language code already exists.");
      return;
    }

    const newLang = { code, name };
    setAvailableLanguages([...availableLanguages, newLang]);
    setSelectedLanguages([...selectedLanguages, newLang]);

    // reset input fields
    setNewLangCode("");
    setNewLangName("");
  };

  const handleExport = () => {
    if (selectedLanguages.length === 0) {
      alert("Please select at least one language.");
      return;
    }
    exportTexts(canvases, selectedLanguages);
    // onNext();
  };

  return (
    <>
      <Section size={"1"}>
        <h2 className="text-xl font-bold">Translations 🌍</h2>
        <p className="mt-2 text-gray-600">
          Choose languages for your export JSON.
        </p>

        {/* Language selection */}
        <div className="mt-4 flex flex-wrap gap-3">
          {availableLanguages.map(({ code, name }) => (
            <label key={code} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(
                  selectedLanguages.find((l) => l.code === code)
                )}
                onChange={() => toggleLanguage(code, name)}
              />
              <span>
                {name} ({code.toUpperCase()})
              </span>
            </label>
          ))}
        </div>

        {/* Add new language */}
        <div className="mt-6 flex gap-2 items-end-safe justify-evenly">
          <div className="flex flex-col">
            <label className="text-sm font-medium">Code</label>
            <input
              type="text"
              value={newLangCode}
              onChange={(e) => setNewLangCode(e.target.value)}
              className="border rounded p-2 w-24"
              placeholder="e.g. jp"
            />
          </div>
          <div className="flex flex-col flex-1">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={newLangName}
              onChange={(e) => setNewLangName(e.target.value)}
              className="border rounded p-2"
              placeholder="e.g. Japanese"
            />
          </div>
          <Button
            type="button"
            onClick={addNewLanguage}
            className="px-4 py-2 !justify-self-center  !bg-green-500 !text-white rounded-xl"
          >
            Add
          </Button>
        </div>
        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-between">
          <div className="flex gap-3 items-center">
            <Button variant="ghost" onClick={() => onBack()}>
              Back
            </Button>
            <Button
              className="px-4 py-2 bg-blue-500 text-white rounded-xl"
              onClick={handleExport}
            >
              Export JSON
            </Button>
          </div>
          <Button
            className="!bg-gray-300 !text-gray-600"
            onClick={onNext}
            disabled={canvases.length === 0}
          >
            Skip
          </Button>
        </div>
      </Section>
      <Separator orientation="horizontal" size="4" />
      <Section size={"1"}>
        <div className="flex flex-col md:flex-nowrap gap-8 items-center justify-center">
          <h1 className="w-full ml-auto text-xl m-0 p-0">
            Reupload Translation JSON File
          </h1>
          <div className="flex  md:flex-nowrap gap-8 items-center justify-center">
            <TranslationsUploader
              setTranslations={setTranslations}
              setLanguage={setLanguage}
              zoom={0.3}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <div></div>
          <Button
            className="!bg-gray-300 !text-gray-600 w-full ml-auto"
            onClick={onNext}
            disabled={canvases.length === 0}
          >
            Next
          </Button>
        </div>
      </Section>
    </>
  );
};

export default TranslationStep;
