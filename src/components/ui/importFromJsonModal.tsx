import React, { useRef, useState } from "react";
// import { CanvasComponent } from "./CanvasComponent";
import type { Canvas } from "fabric";
import { CanvasComponent } from "../CanvasComponent";
export interface TranslationComponetProps {
 

 
 
  // duplicateCanvas?: Canvas;
 
  canvasWidth?: number;
  canvasHeight?: number;
 
  // items?: layoutType;
  setConfirmOpen: (state: boolean) => void;
  canvasToDuplicate?: Canvas;
  duplicateCanvas: (id: string) => void;
  setSelectedCanvasId: (id: string) => void;
  selectedCanvasId: string | null;
  handleCanvasReady: (id: string, canvas: Canvas) => void;

  zoom?: number;
 
  // selectedCanvas?: Canvas | undefined;
}
export default function TranslationsUploader({
  zoom,
  canvasWidth,
  canvasHeight,
  setConfirmOpen,
  canvasToDuplicate,
  duplicateCanvas,
  setSelectedCanvasId,
  selectedCanvasId,
  handleCanvasReady,
}: TranslationComponetProps) {
  const [translations, setTranslations] = useState<any>(null);
  const translatedCanvasesRef = useRef<
    Record<string, { id: string; items: any }[]>
  >({});
  const [language, setLanguage] = useState<string | null>(null);
  

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setTranslations(parsed);

        // default to first language found
        const firstLang = Object.keys(parsed)[0];
        setLanguage(firstLang);
      } catch (err) {
        console.error("Invalid JSON file", err);
      }
    };
    reader.readAsText(file);
  };

  if (translations && language) {
    translatedCanvasesRef.current[language] = translations[
      language
    ].canvases.map((c: any, index: number) => ({
      id: `${language}-canvas-${index}`,
      items: { texts: c.texts },
    }));
  }
  
  console.log("translatedCanvasesRef.current", translatedCanvasesRef.current);

  return (
    <div className="flex flex-col gap-6 items-center justify-center">
      <h1>Upload Translations JSON</h1>

      {/* Upload button */}
      <input
        type="file"
        accept="application/json"
        onChange={handleFileUpload}
      />

      {/* Language selector tabs */}
      {translations && (
        <div className="flex gap-4 mb-4">
          {Object.keys(translations).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1 rounded ${
                language === lang ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-row">
        {/* Canvases for active language */}
        {language &&
          translatedCanvasesRef.current[language]?.map((item, index) => (
            <CanvasComponent
              key={item.id}
              zoom={zoom}
              width={canvasWidth}
              height={canvasHeight}
              deleteCanvas={() => setConfirmOpen(true)}
              duplicateCanvas={canvasToDuplicate ?? undefined}
              onDuplicateCanvas={duplicateCanvas}
              onClick={() => setSelectedCanvasId(item.id)}
              isActive={item.id === selectedCanvasId}
              className="p-2"
              id={item.id}
              index={index}
              bgColor="#1a1a1b"
              transition={{
                duration: 5,
                idle: false,
                easing: "ease-in-out",
              }}
              onCanvasReady={handleCanvasReady}
              translations={item.items}
            />
          ))}
      </div>
    </div>
  );
}
