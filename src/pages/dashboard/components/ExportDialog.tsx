import { use, useRef, useState } from "react";
import {
  Dialog,
  Button,
  RadioGroup,
  Flex,
  Checkbox,
  Grid,
} from "@radix-ui/themes";
import { Download } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Label } from "@radix-ui/themes/components/context-menu";
import type { CanvasItem } from "../../../types";
import TranslationStep from "./exportComponents/TranslationStep";
import { IText } from "fabric";
import { CanvasComponent } from "../../../components/CanvasComponent";
import { useCanvasStore } from "../../../context/store/CanvasStore";
import { useExportStore } from "../../../context/store/ExportStore";
type ScreenshotPreset =
  | "phone-portrait"
  | "phone-landscape"
  | "tablet-portrait";
type ExportMode =
  | "minimum"
  | "app-highly-recommended"
  | "game-highly-recommended";

interface ExportDialogProps {
  // sortedCanvasItems: CanvasItem[];
  selectedCanvas?: {
    width: number;
    height: number;
  } | null;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  // sortedCanvasItems,
}) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  
  const [mode, setMode] = useState<ExportMode>("minimum");
  const [preset, setPreset] = useState<ScreenshotPreset>("phone-portrait");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [format, setFormat] = useState<"jpeg" | "png">("png");
  const [highQuality, setHighQuality] = useState(false);
  const [loading, setLoading] = useState(false);

  const [translations, setTranslations] = useState<any>(null);
  const translatedCanvasesRef = useRef<
    Record<string, { id: string; items: any }[]>
  >({});
  const [language, setLanguage] = useState<string | null>(null);

  const presetDimensions: Record<ScreenshotPreset, [number, number]> = {
    "phone-portrait": [1080, 1920],
    "phone-landscape": [1920, 1080],
    "tablet-portrait": [1200, 1920],
  };

  const handleCanvasReady = useCanvasStore((s) => s.handleCanvasReady);
  const selectedCanvasId = useCanvasStore((s) => s.selectedCanvasId);
  const setSelectedCanvasId = useCanvasStore((s) => s.setSelectedCanvasId);
  const canvasHeight = useCanvasStore((s) => s.canvasHeight);
  const canvasWidth = useCanvasStore((s) => s.canvasWidth);
  const setConfirmOpen = useCanvasStore((s) => s.setConfirmOpen);
  const canvasToDuplicate = useCanvasStore((s) => s.canvasToDuplicate);
  const duplicateCanvas = useCanvasStore((s) => s.duplicateCanvas);
  const sortedCanvasItems = useCanvasStore((s) => s.sortedCanvasItems);


  async function exportAllCanvasAsPlayStoreScreenshots(): Promise<void> {
    if (sortedCanvasItems.length < 2) {
      alert("You must provide at least two screenshots to export.");
      return;
    }

    let requiredCount: number;
    switch (mode) {
      case "app-highly-recommended":
        requiredCount = 4;
        break;
      case "game-highly-recommended":
        requiredCount = 3;
        break;
      default:
        requiredCount = 2;
    }

    if (sortedCanvasItems.length < requiredCount) {
      alert(
        `Mode "${mode}" requires at least ${requiredCount} canvases. You only have ${sortedCanvasItems.length}.`
      );
      return;
    }

    setLoading(true);
    const ZIP = new JSZip();
    const scalePromises: Promise<void>[] = [];

    let [baseW, baseH] = presetDimensions[preset];
    if (orientation === "portrait") {
      [baseW, baseH] = baseW <= baseH ? [baseW, baseH] : [baseH, baseW];
    } else {
      [baseW, baseH] = baseW >= baseH ? [baseW, baseH] : [baseH, baseW];
    }

    const clamp = (v: number) => Math.max(320, Math.min(3840, v));
    baseW = clamp(baseW);
    baseH = clamp(baseH);
    const maxDim = Math.max(baseW, baseH);
    const minDim = Math.min(baseW, baseH);
    if (maxDim > 2 * minDim) {
      const newMin = Math.ceil(maxDim / 2);
      if (baseW < baseH) baseW = clamp(newMin);
      else baseH = clamp(newMin);
    }

    for (let idx = 0; idx < sortedCanvasItems.length; idx++) {
      const item = sortedCanvasItems[idx];
      const canvas = item.canvas;
      if (!canvas) continue;

      const origW = canvas.getWidth();
      const origH = canvas.getHeight();
      if (!origW || !origH) continue;

      const multiplier = baseW / origW;

      scalePromises.push(
        (async () => {
          const dataURL = canvas.toDataURL({
            format,
            quality: format === "jpeg" ? (highQuality ? 1 : 0.8) : undefined,
            multiplier,
          });

          const blob: Blob = await fetch(dataURL).then((r) => r.blob());
          const ext = format === "jpeg" ? "jpg" : "png";
          ZIP.file(`screenshot-${idx + 1}.${ext}`, blob);
        })()
      );
    }

    try {
      await Promise.all(scalePromises);
      ZIP.generateAsync({ type: "blob" }).then((zipBlob) => {
        saveAs(zipBlob, "play-store-screenshots.zip");
        setLoading(false);
        setOpen(false);
        setStep(0);
      });
    } catch (error) {
      console.error("Error exporting screenshots:", error);
      alert("Failed to export screenshots. See console for details.");
      setLoading(false);
    }
  }
  const handleExportAsJson = (data: Record<string, any>) => {
    // Convert data to JSON string with indentation
    const jsonString = JSON.stringify(data, null, 2);

    // Create a Blob with the JSON data
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const link = document.createElement("a");
    link.href = url;
    link.download = "translations.json"; // File name for download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const exportTexts = (
    canvases: CanvasItem[],
    languages: { code: string; name: string }[]
  ) => {
    const result: Record<string, any> = {};
    languages.forEach((lang) => {
      const langJson: any = { language: lang.name, canvases: [] };
      canvases.forEach((canvas, canvasIndex) => {
        const texts: any[] = [];

        canvas.canvas?.getObjects().forEach(async (obj, _) => {
          if (!(obj instanceof IText)) return;
          texts.push({
            canvasId: `${canvas.id}`, // unique reference
            text: lang === languages[0] ? obj.text || "" : "", // only fill text for the first language
            originX: obj.originX,
            left: Math.round(obj.left),
            top: Math.round(obj.top),
            fontSize: obj.fontSize,
            fill: obj.fill,
          });
        });
        const fullCanvasData = canvas.canvas?.toJSON();

        langJson.canvases.push({
          id: canvasIndex,
          texts,
          fullCanvas: fullCanvasData,
        });
      });
      result[lang.code] = langJson;
    });

    handleExportAsJson(result);
    return result;
  };

  if (translations && language) {
    translatedCanvasesRef.current[language] = translations[
      language
    ].canvases.map((c: any, index: number) => ({
      id: `${language}-canvas-${index}`,
      items: { texts: c.texts,canvasData:c.fullCanvas },
    }));
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button color="blue" variant="solid" size="2">
          <Download size={16} className="mr-2" />
          Export Screenshots
        </Button>
      </Dialog.Trigger>

      <Dialog.Content className="max-w-md p-6">
        <Dialog.Title>Export Screenshots</Dialog.Title>

        {/* Step Indicator */}
        <div className="flex justify-between mb-4 text-sm">
          {["Settings",
          //  "Translations",
          //  "Preview", 
           "Export"].map(
            (label, index) => (
              <span
                key={index}
                className={`flex-1 text-center ${
                  step === index ? "font-bold text-blue-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            )
          )}
        </div>

        {/* Step 0 - Settings */}
        {step === 0 && (
          <div>
            <Dialog.Description className="mb-4 text-gray-600">
              Choose a device preset, orientation, and format.
            </Dialog.Description>
            <Grid columns="2" gap="3" className="mt-6">
              <Flex direction="column" gap="2">
                <Label className="text-sm">Orientation</Label>
                <RadioGroup.Root
                  value={orientation}
                  onValueChange={(val) => setOrientation(val as any)}
                  orientation="horizontal"
                >
                  <RadioGroup.Item value="portrait">Portrait</RadioGroup.Item>
                  <RadioGroup.Item value="landscape">Landscape</RadioGroup.Item>
                </RadioGroup.Root>
              </Flex>

              <Flex direction="column" gap="2">
                <Label className="text-sm">Format</Label>
                <RadioGroup.Root
                  value={format}
                  onValueChange={(val) => setFormat(val as any)}
                  orientation="horizontal"
                >
                  <RadioGroup.Item value="jpeg">JPEG</RadioGroup.Item>
                  <RadioGroup.Item value="png">PNG</RadioGroup.Item>
                </RadioGroup.Root>
              </Flex>
            </Grid>

            <Flex align="center" gap="2" className="mt-4">
              <Checkbox
                checked={highQuality}
                id="quality-checkbox"
                onCheckedChange={(checked) => setHighQuality(Boolean(checked))}
              />
              <label htmlFor="quality-checkbox" className="cursor-pointer">
                Highest Quality
              </label>
            </Flex>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(1)}>Next</Button>
            </div>
          </div>
        )}

        {/* Step 1 - Translations */}
        {/* {step === 1 && (
          <div>
            <Dialog.Description className="mb-4 text-gray-600">
              <span>
                This step generates a <strong>translation JSON</strong> file. It
                contains all the texts from your canvases:
              </span>
            </Dialog.Description>
            <ul className="list-disc list-inside mt-2 text-sm text-gray-500">
              <li>
                The first language (e.g. <code>en</code>) is pre-filled with
                your original texts.
              </li>
              <li>
                Other languages (e.g. <code>fr</code>, <code>es</code>) have
                empty fields for you to fill in.
              </li>
              <li>
                You can share this JSON with translators or fill it in yourself.
              </li>
              <li>Re-import it to update texts in your canvases.</li>
            </ul>
            <TranslationStep
              exportTexts={exportTexts}
              setLanguage={setLanguage}
              setTranslations={setTranslations}
              canvases={sortedCanvasItems}
              onBack={() => setStep((prev) => prev - 1)}
              onNext={() => setStep((prev) => prev + 1)}
            />
          </div>
        )} */}

         {/* Step 2 - Preview  */}
        {/* {step === 2 && (
          <div>
            <Dialog.Description className="mb-4 text-gray-600">
              Here’s how your canvases will look before export.
            </Dialog.Description>
            
            {translations && (
              <div className="flex gap-4 mb-4">
                {Object.keys(translations).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1 rounded ${
                      language === lang
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-row max-w-full  items-start overflow-scroll justify-center">
           
              {language &&
                translatedCanvasesRef.current[language]?.map((item, index) => (
                  <CanvasComponent
                    key={item.id}
                    zoom={0.3}
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
                    isPreview={true}
                  />
                ))}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )} */}

        {/* Step 3 - Export */}
        {step === 1 && (
          <div>
            <Dialog.Description className="mb-4 text-gray-600">
              Export all canvases as a ZIP of screenshots.
            </Dialog.Description>
            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                color="green"
                onClick={exportAllCanvasAsPlayStoreScreenshots}
                disabled={loading}
              >
                {loading ? "Exporting…" : "Export"}
              </Button>
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default ExportDialog;
