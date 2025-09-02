import { useState } from "react";
import { Dialog, Button, RadioGroup, Flex, Checkbox,Grid } from "@radix-ui/themes";
import { Download } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Label } from "@radix-ui/themes/components/context-menu";
import type { CanvasItem } from "../../../types";

// Possible Google Play screenshot presets
type ScreenshotPreset =
  | "phone-portrait" 
  | "phone-landscape"
  | "tablet-portrait";

interface ExportDialogProps {
  // Your array of canvas items. Each must have a .canvas with toDataURL()
  sortedCanvasItems: CanvasItem[];
  selectedCanvas?: {
    width: number;
    height: number;
  } | null;
}
/**
 * Available screenshot presets for Play Store:
 * - Two‐screenshot minimum across devices (any orientation).
 * - "Highly recommended" for apps: ≥4 screenshots at 1920×1080 or 1080×1920.
 * - "Highly recommended" for games: ≥3 landscape (1920×1080) or ≥3 portrait (1080×1920).
 */
type ExportMode =
  | "minimum"
  | "app-highly-recommended"
  | "game-highly-recommended";

export const ExportDialog: React.FC<ExportDialogProps> = ({
  sortedCanvasItems,
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ExportMode>("minimum");
  const [preset, setPreset] = useState<ScreenshotPreset>("phone-portrait");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );
  const [format, setFormat] = useState<"jpeg" | "png">("png");
  const [highQuality, setHighQuality] = useState(false);
  const [loading, setLoading] = useState(false);
  // Mapping presets → [width, height]
  const presetDimensions: Record<ScreenshotPreset, [number, number]> = {
    "phone-portrait": [1080, 1920],
    "phone-landscape": [1920, 1080],
    "tablet-portrait": [1200, 1920],
  };

  /**
   * Exports all canvases as ZIP of JPEGs that meet Google Play's requirements.
   *
   * @param sortedCanvasItems  Array of CanvasItem, each with a .canvas
   * @param mode               'minimum' | 'app-highly-recommended' | 'game-highly-recommended'
   */
  async function exportAllCanvasAsPlayStoreScreenshots(): Promise<void> {
    // 1. REQUIRE AT LEAST TWO CANVASES (minimum guideline)
    if (sortedCanvasItems.length < 2) {
      alert("You must provide at least two screenshots to export.");
      return;
    }

    // 2. DETERMINE HOW MANY SCREENSHOTS ARE REQUIRED
    let requiredCount: number;
    switch (mode) {
      case "app-highly-recommended":
        requiredCount = 4; // 4 app screenshots (any mix of portrait/landscape)
        break;
      case "game-highly-recommended":
        requiredCount = 3; // 3 game screenshots (preferably all landscape or all portrait)
        break;
      default:
        requiredCount = 2; // minimum
    }

    if (sortedCanvasItems.length < requiredCount) {
      alert(
        `Mode "${mode}" requires at least ${requiredCount} canvases. You only have ${sortedCanvasItems.length}.`
      );
      return;
    }

    // 3. SET THE TARGET DIMENSIONS BASED ON ORIENTATION
    //    - Landscape target: 1920×1080 (px)  (16:9)
    //    - Portrait target: 1080×1920 (px)  (9:16)
    //    All final dimensions must be within [320, 3840] px,
    //    and maxDimension ≤ 2 × minDimension (this is already true for 1920/1080).
    setLoading(true);
    const ZIP = new JSZip();
    const scalePromises: Promise<void>[] = [];

    // Determine target dimensions based on chosen preset and orientation override
    let [baseW, baseH] = presetDimensions[preset];
    if (orientation === "portrait") {
      // ensure baseW < baseH
      [baseW, baseH] = baseW <= baseH ? [baseW, baseH] : [baseH, baseW];
    } else {
      // ensure baseW > baseH
      [baseW, baseH] = baseW >= baseH ? [baseW, baseH] : [baseH, baseW];
    }

    // Clamp to Play Store guidelines: [320, 3840], max ≤ 2×min
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

    // 3. GENERATE EACH CANVAS IMAGE
    for (let idx = 0; idx < sortedCanvasItems.length; idx++) {
      const item = sortedCanvasItems[idx];
      const canvas = item.canvas;
      if (!canvas) continue;

      const origW = canvas.getWidth();
      const origH = canvas.getHeight();
      if (!origW || !origH) continue;

      // Compute multiplier so that original canvas → target dimensions
      // We match width to baseW (assuming aspect ratio is correct 9:16 or 16:9).
      const multiplier = baseW / origW;
      // const multiplier = 6;

      scalePromises.push(
        (async () => {
          // Generate data URL in chosen format
          const dataURL = canvas.toDataURL({
            format,
            quality: format === "jpeg" ? (highQuality ? 1 : 0.8) : undefined,
            multiplier,
          });

          const blob: Blob = await fetch(dataURL).then((r) => r.blob());

          // Use .jpg extension for JPEG, .png for PNG
          const ext = format === "jpeg" ? "jpg" : "png";
          ZIP.file(`screenshot-${idx + 1}.${ext}`, blob);
        })()
      );
    }

    // 4. ZIP + DOWNLOAD
    try {
      await Promise.all(scalePromises);
      ZIP.generateAsync({ type: "blob" }).then((zipBlob) => {
        saveAs(zipBlob, "play-store-screenshots.zip");
        setLoading(false);
        setOpen(false);
      });
    } catch (error) {
      console.error("Error exporting screenshots:", error);
      alert("Failed to export screenshots. See console for details.");
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Trigger Button */}
      <Dialog.Trigger>
        <Button
          color="blue"
          variant="solid"
          className="!cursor-pointer"
          size="2"
        >
          <Download size={16} className="mr-2 cursor-pointer" />
          Export Screenshots
        </Button>
      </Dialog.Trigger>

      {/* Dialog Content */}
      <Dialog.Content className="max-w-md p-6">
        <Dialog.Title>Export Screenshots</Dialog.Title>
        <Dialog.Description className="mb-4 text-gray-600">
          Choose a device preset, then click “Export.” Each canvas will be
          bundled into a ZIP at that resolution.
        </Dialog.Description>
        <Grid
          columns="2"
          gap="3"
          align="start"
          className="mt-6"
          justify={"center"}
          width="auto"
        >
          {/* Mode Selection */}
          {/* <Flex direction="column" gap="2" className="mb-4">
            <Label className="">Mode</Label>
            <RadioGroup.Root
              value={mode}
              onValueChange={(val) => setMode(val as ExportMode)}
              orientation="vertical"
            >
              <RadioGroup.Item value="minimum" className="mb-1">
                <span className="text-sm">Minimum (2 screenshots)</span>
              </RadioGroup.Item>
              <RadioGroup.Item value="app-highly-recommended" className="mb-1 ">
                App – Highly Recommended (≥4 screenshots)
              </RadioGroup.Item>
              <RadioGroup.Item value="game-highly-recommended" className="">
                Game – Highly Recommended (≥3 screenshots)
              </RadioGroup.Item>
            </RadioGroup.Root>
          </Flex> */}

          {/* Preset Selection */}
          {/* <Flex direction="column" gap="2" className="mb-4">
            <Label className="">Device Preset</Label>
            <RadioGroup.Root
              value={preset}
              onValueChange={(val) => setPreset(val as ScreenshotPreset)}
              orientation="vertical"
            >
              <RadioGroup.Item value="phone-portrait" className="mb-1 ">
                Phone (Portrait 1080×1920)
              </RadioGroup.Item>
              <RadioGroup.Item value="phone-landscape" className="mb-1 ">
                Phone (Landscape 1920×1080)
              </RadioGroup.Item>
              <RadioGroup.Item value="tablet-portrait">
                Tablet (Portrait 1200×1920)
              </RadioGroup.Item>
            </RadioGroup.Root>
          </Flex> */}

          {/* Orientation Override */}
          <Flex direction="column" gap="2" className="mb-4">
            <Label className="text-sm">Orientation</Label>
            <RadioGroup.Root
              value={orientation}
              onValueChange={(val) => setOrientation(val as any)}
              orientation="horizontal"
            >
              <RadioGroup.Item value="portrait" className="mr-4">
                Portrait
              </RadioGroup.Item>
              <RadioGroup.Item value="landscape">Landscape</RadioGroup.Item>
            </RadioGroup.Root>
          </Flex>

          {/* Format Selection */}
          <Flex direction="column" gap="2" className="mb-4">
            <Label className="">Format</Label>
            <RadioGroup.Root
              value={format}
              onValueChange={(val) => setFormat(val as any)}
              orientation="horizontal"
            >
              <RadioGroup.Item value="jpeg" className="mr-4">
                JPEG
              </RadioGroup.Item>
              <RadioGroup.Item value="png">PNG</RadioGroup.Item>
            </RadioGroup.Root>
          </Flex>
        </Grid>

        {/* Quality Checkbox */}
        <Flex align="center" gap="2" className="mb-4">
          <Checkbox
            checked={highQuality}
            id="quality-checkbox"
            onCheckedChange={(checked) => setHighQuality(Boolean(checked))}
          />
          <label htmlFor="quality-checkbox" className="cursor-pointer">
            Highest Quality
          </label>
        </Flex>

        {/* Export Button */}
        <div className="mt-6 flex justify-end items-center gap-2 space-x-2">
          <Dialog.Close>
            <Button variant="ghost" className="cursor-pointer" size="2">
              Cancel
            </Button>
          </Dialog.Close>
          <Button
            color="green"
            variant="solid"
            className="cursor-pointer"
            size="2"
            onClick={exportAllCanvasAsPlayStoreScreenshots}
            disabled={loading}
          >
            {loading ? "Exporting…" : "Export"}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default ExportDialog;
