import { Canvas, FabricText, type TFiller } from "fabric";
import { useState, useEffect } from "react";
import { Button } from "@radix-ui/themes";
import { X } from "lucide-react";
import { Tooltip } from "../../../components/ui/tooltip";
interface TextEditorProps {
  selectedCanvas: Canvas | undefined;
}
export const TextEditor: React.FC<TextEditorProps> = ({ selectedCanvas }) => {
  const [selectedText, setSelectedText] = useState<FabricText | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(24);
  const [selText, setSelText] = useState<string>();
  const [fontFamily, setFontFamily] = useState<string>();
  const [fontWeight, setFontWeight] = useState<string>("normal");
  const [lineHeight, setLineHeight] = useState<number>();
  const [strokeColor, setStrokeColor] = useState<string | TFiller>("#000000");

  const defaultBgColor = "#000000";
  const [backgroundColor, setBackgroundColor] = useState<string | TFiller>(
    "#000000"
  );
  const defaultTextColor = "#FFFFFF";
  const [textColor, setTextColor] = useState<string | TFiller>(
    defaultTextColor
  );
  const [textAlign, setTextAlign] = useState<string>();
  useEffect(() => {
    const activeObject = selectedCanvas?.getActiveObject();
    if (activeObject && activeObject instanceof FabricText) {
      setSelectedText(activeObject);
      setIsActive(true);
    } else {
      setIsActive(false);
    }

    return () => {};
  }, [selectedText]);

  useEffect(() => {
    if (!selectedCanvas) return;

    const handleSelection = () => {
      const activeObject = selectedCanvas.getActiveObject();
      if (activeObject && activeObject instanceof FabricText) {
        setSelectedText(activeObject);
        setIsActive(true);
        setFontSize(activeObject?.fontSize);
        setSelText(activeObject?.text);
        setFontFamily(activeObject?.fontFamily);
        setStrokeColor(activeObject?.stroke || "#000000");
        setBackgroundColor(activeObject?.backgroundColor || "#000000");
        setTextColor(activeObject?.fill || "#000000");
        setTextAlign(activeObject?.textAlign);
      } else {
        setSelectedText(null);
      }
    };

    selectedCanvas.on("selection:created", handleSelection);
    selectedCanvas.on("selection:updated", handleSelection);
    selectedCanvas.on("selection:cleared", () => setSelectedText(null));

    return () => {
      selectedCanvas.off("selection:created", handleSelection);
      selectedCanvas.off("selection:updated", handleSelection);
      selectedCanvas.off("selection:cleared");
    };
  }, [selectedCanvas]);

  if (!selectedCanvas) {
    return <div className="p-4">Select a canvas to edit text.</div>;
  }

  const updateTextProperty = (property: string, value: any) => {
    if (selectedText) {
      selectedText.set(property as keyof FabricText, value);
      selectedCanvas.renderAll();
    }
  };
  const deleteText = () => {
    const activeObject = selectedCanvas.getActiveObject();
    if (selectedText && activeObject instanceof FabricText) {
      selectedCanvas.remove(activeObject);
    }
    selectedCanvas.renderAll();
  };
  return (
    <div className="w-full mx-auto flex flex-col overflow-y-scroll no-scrollbar">
      <h2 className="text-lg font-bold mb-2">Edit Text </h2>

      <div className="mb-2">
        <label
          className={`block text-sm font-medium ${!isActive && "opacity-50"}`}
        >
          Text Content
        </label>
        <textarea
          value={selText || selectedText?.text}
          onChange={(e) => {
            setSelText(e.target.value);
            updateTextProperty("text", e.target.value);
          }}
          disabled={!isActive}
          className={`w-full p-2 border rounded ${!isActive && "opacity-50"}`}
        />
      </div>

      <div className="mb-2">
        <label
          className={`block text-sm font-medium ${!isActive && "opacity-50"}`}
        >
          Font Size
        </label>
        <input
          type="number"
          max={120}
          value={fontSize || selectedText?.fontSize}
          onChange={(e) => {
            setFontSize(parseInt(e.target.value));
            updateTextProperty("fontSize", parseInt(e.target.value));
          }}
          disabled={!isActive}
          className={`w-full p-2 border rounded ${!isActive && "opacity-50"}`}
        />
        <input
          type="range"
          value={fontSize || selectedText?.fontSize}
          onChange={(e) => {
            setFontSize(parseInt(e.target.value));
            updateTextProperty("fontSize", parseInt(e.target.value));
          }}
          min="1"
          max="120"
          step="1"
          disabled={!isActive}
          id="text-font-size"
        />
      </div>
      <div className="mb-2">
        <label
          className={`block text-sm font-medium ${!isActive && "opacity-50"}`}
        >
          Font Weight
        </label>
        <select
          value={fontWeight}
          onChange={(e) => {
            setFontWeight(e.target.value);
            updateTextProperty("fontWeight", e.target.value);
          }}
          disabled={!isActive}
          className={`w-full p-2 border rounded ${!isActive && "opacity-50"}`}
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="lighter">Lighter</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="300">300</option>
          <option value="400">400</option>
          <option value="500">500</option>
          <option value="600">600</option>
          <option value="700">700</option>
          <option value="800">800</option>
          <option value="900">900</option>
        </select>
      </div>
      <div className="mb-2">
        <label
          htmlFor=""
          className={`block text-sm font-medium ${!isActive && "opacity-50"}`}
        >
          Text Align
        </label>
        <div className="inline-flex rounded-lg shadow-2xs">
          <button
            onClick={() => {
              setTextAlign("left");
              updateTextProperty("textAlign", textAlign);
            }}
            type="button"
            disabled={!isActive}
            className={`${
              textAlign === "left" && "bg-white"
            } py-2 px-3 inline-flex justify-center items-center gap-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-gray-300 text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 cursor-pointer`}
          >
            left
          </button>
          <button
            onClick={() => {
              setTextAlign("center");
              updateTextProperty("textAlign", "center");
            }}
            type="button"
            disabled={!isActive}
            className={`${
              textAlign === "center" && "bg-white"
            } py-2 px-3 inline-flex justify-center items-center gap-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-gray-300 text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 cursor-pointer`}
          >
            center
          </button>
          <button
            onClick={() => {
              setTextAlign("right");
              updateTextProperty("textAlign", "right");
            }}
            type="button"
            disabled={!isActive}
            className={`${
              textAlign === "right" && "bg-white"
            } py-2 px-3 inline-flex justify-center items-center gap-2 -ms-px first:rounded-s-lg first:ms-0 last:rounded-e-lg text-sm font-medium focus:z-10 border border-gray-200 bg-gray-300 text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 cursor-pointer`}
          >
            right
          </button>
        </div>
      </div>
      <div className="mb-2">
        <label
          className={`block text-sm font-medium ${!isActive && "opacity-50"}`}
        >
          Font Family
        </label>
        <select
          value={fontFamily || selectedText?.fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value);
            updateTextProperty("fontFamily", e.target.value);
          }}
          defaultValue={"helvetica"}
          disabled={!isActive}
          className={`w-full p-2 border rounded ${!isActive && "opacity-50"}`}
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="helvetica">Helvetica</option>
          <option value="myriad pro">Myriad Pro</option>
          <option value="delicious">Delicious</option>
          <option value="verdana">Verdana</option>
          <option value="georgia">Georgia</option>
          <option value="courier">Courier</option>
          <option value="comic sans ms">Comic Sans MS</option>
          <option value="impact">Impact</option>
          <option value="monaco">Monaco</option>
          <option value="optima">Optima</option>
          <option value="hoefler text">Hoefler Text</option>
          <option value="plaster">Plaster</option>
          <option value="engagement">Engagement</option>
        </select>
      </div>
      <div className="mb-2">
        <label
          className={`block text-sm font-medium ${!isActive && "opacity-50"}`}
        >
          Text Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={String(textColor) || String(selectedText?.fill)}
            onChange={(e) => {
              updateTextProperty("fill", e.target.value);
              setTextColor(e.target.value);
            }}
            disabled={!isActive}
            className={`w-10 h-10  border rounded ${!isActive && "opacity-50"}`}
          />
          <span className={`${!isActive && "opacity-50"}`}>
            {String(textColor)}
          </span>
          <Tooltip
            className={`${
              defaultTextColor === textColor && "opacity-0 hidden"
            }`}
            text="Reset color"
            placement="bottom"
          >
            <button
              className={`${
                defaultTextColor === textColor && "opacity-0 hidden"
              }`}
              onClick={() => {
                updateTextProperty("fill", defaultTextColor);
                setTextColor(defaultTextColor);
              }}
            >
              <X size={12} className="text-red-500 ml-1" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="mb-2">
        <label
          className={`block text-sm font-medium ${!isActive && "opacity-50"}`}
        >
          Background Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={
              String(backgroundColor) || String(selectedText?.backgroundColor)
            }
            onChange={(e) => {
              updateTextProperty("backgroundColor", e.target.value);
              setBackgroundColor(e.target.value);
            }}
            disabled={!isActive}
            className={`w-10 h-10 border rounded ${!isActive && "opacity-50"}`}
          />
          <span className={`${!isActive && "opacity-50"}`}>
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
                updateTextProperty("backgroundColor", defaultBgColor);
                setBackgroundColor(defaultBgColor);
              }}
            >
              <X size={12} className="text-red-500 ml-1" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="mb-2">
        <label
          className={`block text-sm font-medium ${!isActive && "opacity-50"}`}
        >
          Text Stroke Color
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={String(strokeColor) || String(selectedText?.stroke)}
            onChange={(e) => {
              updateTextProperty("stroke", e.target.value);
              setStrokeColor(e.target.value);
            }}
            disabled={!isActive}
            className={`w-10 h-10 border rounded ${!isActive && "opacity-50"}`}
          />
          <span className={`${!isActive && "opacity-50"}`}>
            {String(strokeColor)}
          </span>
        </div>
      </div>
      <div className="mb-2">
        <label
          className={`block text-sm font-medium ${!isActive && "opacity-50"}`}
        >
          Line Height
        </label>
        <input
          type="number"
          step="0.1"
          max={"10"}
          value={lineHeight || selectedText?.lineHeight}
          onChange={(e) => {
            setLineHeight(parseFloat(e.target.value));
            updateTextProperty(
              "lineHeight",
              parseFloat(e.target.value).toFixed(2)
            );
          }}
          disabled={!isActive}
          className={`w-full  p-2 border rounded ${!isActive && "opacity-50"}`}
        />
        <input
          type="range"
          value={lineHeight || selectedText?.lineHeight}
          onChange={(e) => {
            setLineHeight(parseFloat(e.target.value));
            updateTextProperty(
              "lineHeight",
              parseFloat(e.target.value).toFixed(2)
            );
          }}
          min="1"
          max="10"
          step="0.1"
          disabled={!isActive}
          id="text-font-size"
        />
        {isActive && (
          <Button
            className="!bg-red-500 hover:!bg-red-600 cursor-pointer mt-4"
            onClick={deleteText}
          >
            Delete Text
          </Button>
        )}
      </div>
    </div>
  );
};
