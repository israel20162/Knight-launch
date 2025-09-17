import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { toast } from "sonner";
import { useExportStore } from "../../store/ExportStore";
export interface TranslationComponetProps {
  setTranslations: (translations: any) => void;
  setLanguage: (language: string | null) => void;
  setIsParsing?: (loading: boolean) => void; // 👈 parent can use this to disable Next
  zoom?: number;
}

export default function TranslationsUploader({
  setTranslations,
  setLanguage,
  setIsParsing,
}: TranslationComponetProps) {
  const file = useExportStore((s) => s.file);
  const setFile = useExportStore((s) => s.setFile);
  const [loading, setLoading] = useState(false);

  const handleChange = (file: File | File[]) => {
    setFile(file);
    toast.success("File uploaded successfully!");
    handleFileUpload(file);
  };

  // Handle file upload + parsing
  const handleFileUpload = (file: File | File[]) => {
    if (!file) return;

    const reader = new FileReader();
    setLoading(true);
    setIsParsing?.(true);

    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setTranslations(parsed);

        // default to first language found
        const firstLang = Object.keys(parsed)[0];
        setLanguage(firstLang);

        toast.success("JSON parsed successfully!");
      } catch (err) {
        console.error("Invalid JSON file", err);
        toast.error("Invalid JSON file");
      } finally {
        setLoading(false);
        setIsParsing?.(false);
      }
    };

    reader.readAsText(file as Blob);
  };

  return (
    <div className="flex flex-col gap-6 items-center justify-center w-full">
      <FileUploader handleChange={handleChange} name="file" types={["json"]}>
        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-86 h-64 border-2 border-dashed rounded-lg cursor-pointer 
              ${
                file
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {loading ? (
                <span className="text-sm text-blue-500 animate-pulse">
                  Parsing JSON...
                </span>
              ) : (
                <>
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    JSON file with translations
                  </p>
                </>
              )}
            </div>
            <input
              id="dropzone-file"
              type="file"
              accept="application/json"
              className="hidden"
            />
          </label>
        </div>
      </FileUploader>

      {file && !loading && (
        <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-green-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
          <span>
            File added:{" "}
            {Array.isArray(file)
              ? file.map((f) => f.name).join(", ")
              : file.name}
          </span>
        </div>
      )}
    </div>
  );
}
