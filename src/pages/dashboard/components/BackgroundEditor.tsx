import { useEffect, useState } from "react";
import { Canvas, Gradient, FabricImage, type TFiller } from "fabric";
import { SegmentedControl } from "@radix-ui/themes";
import { Tooltip } from "../../../components/ui/tooltip";
import { ChevronDown, X } from "lucide-react";
import type { CanvasItem } from "../../../types";

interface BackgroundEditorProps {
  selectedCanvas: Canvas | undefined;
  allCanvases: CanvasItem[]; // Added prop to handle all canvases
}

export const BackgroundEditor: React.FC<BackgroundEditorProps> = ({
  selectedCanvas,
  allCanvases, // Added prop
}) => {
  const defaultBgColor = "#1a1a1a";
  const [backgroundColor, setBackgroundColor] = useState<string | TFiller>(
    defaultBgColor
  );
  const [backgroundType, setBackgroundType] = useState<
    "solid" | "gradient" | "pattern" | "image"
  >("solid");
  const [gradientColor1, setGradientColor1] = useState("#1a1a1a");
  const [gradientColor2, setGradientColor2] = useState("#4a4a4a");
  const [gradientDirection, setGradientDirection] = useState<
    "horizontal" | "vertical" | "diagonal"
  >("vertical");
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);
  const [openAccordion, toggleAccordion] = useState<"size" | "presets" | null>(
    null
  );

  useEffect(() => {
    if (!selectedCanvas) return;
    if (selectedCanvas.width !== canvasWidth) {
      setCanvasWidth(selectedCanvas.width || 800);
    }
    if (selectedCanvas.height !== canvasHeight) {
      setCanvasHeight(selectedCanvas.height || 600);
    }
  }, [selectedCanvas]);

  useEffect(() => {
    if (!selectedCanvas) return;

    // Only update state if the canvas has changed to avoid resetting
    const currentBackground = selectedCanvas.backgroundColor;
    if (currentBackground !== backgroundColor) {
      setBackgroundColor(currentBackground || "#1a1a1a");
    }

    const handleSelection = () => {
      if (selectedCanvas) {
        const newBackground = selectedCanvas.backgroundColor;
        if (newBackground !== backgroundColor) {
          setBackgroundColor(newBackground || "#1a1a1a");
        }
      }
    };

    selectedCanvas.on("selection:created", handleSelection);
    selectedCanvas.on("selection:updated", handleSelection);

    return () => {
      selectedCanvas.off("selection:created", handleSelection);
      selectedCanvas.off("selection:updated", handleSelection);
    };
  }, [selectedCanvas, backgroundColor, canvasWidth, canvasHeight]);

  if (!selectedCanvas) {
    return (
      <div className="p-4 text-gray-500">
        Select a canvas to edit background.
      </div>
    );
  }

  const updateCanvasProperty = (property: string, value: any) => {
    if (selectedCanvas) {
      selectedCanvas.set(property as keyof Canvas, value);
      selectedCanvas.renderAll();
    }
  };

  const applyGradient = () => {
    if (!selectedCanvas) return;

    let coords;
    switch (gradientDirection) {
      case "horizontal":
        coords = { x1: 0, y1: 0, x2: selectedCanvas.width, y2: 0 };
        break;
      case "vertical":
        coords = { x1: 0, y1: 0, x2: 0, y2: selectedCanvas.height };
        break;
      case "diagonal":
        coords = {
          x1: 0,
          y1: 0,
          x2: selectedCanvas.width,
          y2: selectedCanvas.height,
        };
        break;
    }

    const gradient = new Gradient({
      type: "linear",
      coords: coords,
      colorStops: [
        { offset: 0, color: gradientColor1 },
        { offset: 1, color: gradientColor2 },
      ],
    });

    selectedCanvas.set("backgroundColor", gradient);
    selectedCanvas.renderAll();
  };

  const resizeCanvas = () => {
    if (selectedCanvas) {
      // alert(canvasWidth);
      selectedCanvas.setDimensions({
        width: canvasWidth,
        height: canvasHeight,
      });
      selectedCanvas.renderAll();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          // Apply to selected canvas
          if (selectedCanvas) {
            const fabricImg = new FabricImage(img, {
              scaleX: selectedCanvas.width / img.width,
              scaleY: selectedCanvas.height / img.height,
            });
            selectedCanvas.set("backgroundImage", fabricImg);
            selectedCanvas.renderAll();
          }
        };
        img.src = imgUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyImageToAllCanvases = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          allCanvases?.forEach((canvas) => {
            const fabricImg = new FabricImage(img, {
              scaleX: canvas.canvas?.width
                ? canvas.canvas?.width / img.width
                : 322 / img.width,
              scaleY: canvas.canvas?.height
                ? canvas.canvas?.height / img.height
                : 640 / img.height,
            });
            canvas.canvas?.set("backgroundImage", fabricImg);
            canvas.canvas?.renderAll();
          });
        };
        img.src = imgUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <h2 className="text-lg font-bold mb-2 mt-4">Edit Background</h2>

      {/* Background Type Selector */}
      <div className="mb-4 flex justify-center">
        <div className="flex">
          {["solid", "gradient", "image"].map((type) => (
            <button
              key={type}
              onClick={() => setBackgroundType(type as any)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                backgroundType === type
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Solid Color */}
      {backgroundType === "solid" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Background Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={String(backgroundColor) || "#1a1a1a"}
              onChange={(e) => {
                updateCanvasProperty("backgroundColor", e.target.value);
                setBackgroundColor(e.target.value);
              }}
              className="w-12 h-12 border rounded-lg cursor-pointer"
            />
            <span className="text-sm text-gray-600 font-mono">
              {String(backgroundColor)}
            </span>
            <Tooltip
              className={`${
                defaultBgColor === backgroundColor && "opacity-0 hidden"
              }`}
              text="Reset color"
              placement="bottom"
            >
              <button
                className={`${
                  defaultBgColor === backgroundColor && "opacity-0 hidden"
                }`}
                onClick={() => {
                  updateCanvasProperty("backgroundColor", defaultBgColor);
                  setBackgroundColor(defaultBgColor);
                }}
              >
                <X size={12} className="text-red-500 ml-1" />
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Gradient */}
      {backgroundType === "gradient" && (
        <div className="space-y-4 mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Gradient Settings
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Start Color
              </label>
              <input
                type="color"
                value={gradientColor1}
                onChange={(e) => setGradientColor1(e.target.value)}
                className="w-full h-10 border rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                End Color
              </label>
              <input
                type="color"
                value={gradientColor2}
                onChange={(e) => setGradientColor2(e.target.value)}
                className="w-full h-10 border rounded cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Direction
            </label>
            <select
              value={gradientDirection}
              onChange={(e) => setGradientDirection(e.target.value as any)}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
              <option value="diagonal">Diagonal</option>
            </select>
          </div>
          <button
            onClick={applyGradient}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Apply Gradient
          </button>
        </div>
      )}

      {/* Image Upload */}
      {backgroundType === "image" && (
        <div className="space-y-4 mb-4">
          <div className="flex justify-center mb-6">
            <div className="w-full rounded-lg shadow-xl">
              <div>
                <label className="inline-block mb-2 text-gray-500">
                  File Upload (Selected Canvas)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-4 border-blue-200 border-dashed hover:bg-blue-100 hover:border-blue-300 hover:text-white cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-gray-400 group-hover:text-gray-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-100">
                        Attach a file
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="opacity-0"
                    />
                  </label>
                </div>
              </div>
              <div className="mt-4">
                <label className="inline-block mb-2 text-gray-500">
                  File Upload (All Canvases)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-4 border-blue-200 border-dashed hover:bg-blue-100 hover:border-blue-300 hover:text-white cursor-pointer">
                    <div className="flex flex-col items-center justify-center pt-7">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-gray-400 group-hover:text-gray-100"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-100">
                        Attach a file for all canvases
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={applyImageToAllCanvases}
                      className="opacity-0"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <SegmentedControl.Root
            defaultValue="Fit"
            className="grid grid-cols-3"
            onValueChange={(value) => {
              if (value && selectedCanvas?.backgroundImage) {
                const img = selectedCanvas.backgroundImage;
                const scale =
                  value === "Stretch"
                    ? {
                        scaleX: selectedCanvas.width / img.width,
                        scaleY: selectedCanvas.height / img.height,
                      }
                    : value === "Fit"
                    ? (() => {
                        const s = Math.min(
                          selectedCanvas.width / img.width,
                          selectedCanvas.height / img.height
                        );
                        return { scaleX: s, scaleY: s };
                      })()
                    : (() => {
                        const s = Math.max(
                          selectedCanvas.width / img.width,
                          selectedCanvas.height / img.height
                        );
                        return { scaleX: s, scaleY: s };
                      })();
                img.set(scale);
                selectedCanvas.renderAll();
              }
            }}
          >
            {["Fit", "Stretch", "Fill"].map((action) => (
              <SegmentedControl.Item value={action}>
                <span
                  key={action}
                  className="whitespace-nowrap text-center text-gray-700 rounded text-xs"
                >
                  {action}
                </span>
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
          <button
            onClick={async () => {
              if (selectedCanvas) {
                selectedCanvas.set("backgroundImage", null);
                selectedCanvas.requestRenderAll();
              }
            }}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
          >
            Remove Image
          </button>
        </div>
      )}

      <section className="divide-y divide-gray-200 mt-6">
        <div className="mb-4">
          <button
            onClick={() =>
              toggleAccordion(openAccordion === "size" ? null : "size")
            }
            className="w-full flex justify-between items-center px-2 py-3 font-medium"
          >
            <span className="flex items-center gap-2">Canvas Size</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openAccordion === "size" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openAccordion === "size" && (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Width
                  </label>
                  <input
                    type="number"
                    value={canvasWidth}
                    onChange={(e) => setCanvasWidth(Number(e.target.value))}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Height
                  </label>
                  <input
                    type="number"
                    value={canvasHeight}
                    onChange={(e) => setCanvasHeight(Number(e.target.value))}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              </div>
              <button
                onClick={resizeCanvas}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Resize Canvas
              </button>
            </div>
          )}
        </div>

        <div className="mb-4">
          <button
            onClick={() =>
              toggleAccordion(openAccordion === "presets" ? null : "presets")
            }
            className="w-full flex justify-between items-center px-2 py-3 font-medium"
          >
            <span className="flex items-center gap-2">Quick Presets</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                openAccordion === "presets" ? "rotate-180" : ""
              }`}
            />
          </button>
          {openAccordion === "presets" && (
            <div className="p-4 grid grid-cols-2 gap-2">
              {[
                {
                  name: "Dark",
                  color: "#000000",
                  classes: "bg-black text-white",
                },
                {
                  name: "Light",
                  color: "#ffffff",
                  classes: "bg-white text-black border",
                },
                {
                  name: "Slate",
                  color: "#1f2937",
                  classes: "bg-gray-800 text-white",
                },
                {
                  name: "Blue",
                  color: "#3b82f6",
                  classes: "bg-blue-500 text-white",
                },
              ].map(({ name, color, classes }) => (
                <button
                  key={name}
                  onClick={() => {
                    updateCanvasProperty("backgroundColor", color);
                    setBackgroundColor(color);
                  }}
                  className={`p-2 rounded text-sm hover:opacity-80 ${classes}`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};
