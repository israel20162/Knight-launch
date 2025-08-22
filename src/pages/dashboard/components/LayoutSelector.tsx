import { Canvas, FabricImage, IText } from "fabric";
import React, { useCallback, useEffect, useState } from "react";
import { CanvasComponent } from "../../../components/CanvasComponent";
import type { CanvasItem, layoutType } from "../../../types";
import { layouts } from "../utils/layouts";
import { countObjectsByType } from "../utils";
interface LayoutSelectorProps {
  selectedCanvas: Canvas | undefined;
}
export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  selectedCanvas,
}) => {
  const [_, setCanvasItems] = useState<CanvasItem[]>([]);
  const deviceLayouts = layouts();
  const layoutCanvasHeight = 192;
  const layoutCanvaswidth = 108;

  const add = async (items: layoutType) => {
    if (!selectedCanvas) {
      alert("No canvas selected!");
      return;
    }
    const totalFabricImage = countObjectsByType(selectedCanvas, FabricImage);
    if (totalFabricImage >= 2) {
      alert("You can only add up to 2 frames.");
      return;
    }
    const text = new IText(items.text.value, {
      originX: "center",
      left: selectedCanvas?.getWidth() / 2,
      top: 1,
      fontSize: 24,
      fill: "#FFFFFF",
    });
    const phoneImg = await FabricImage.fromURL(items.frame.url);
    // Get screen dimensions from the frame image

    const fitScale = Math.min(
      selectedCanvas.width! / phoneImg.width!,
      selectedCanvas.height! / phoneImg.height!
    );
    const scale = fitScale * 0.75;
    phoneImg.set({
      originX: "center",
      originY: "center",
      left:
        items.frame.left * (selectedCanvas.width / layoutCanvaswidth) ||
        selectedCanvas.width! / 2,
      top:
        items.frame.top * (selectedCanvas.height / layoutCanvasHeight) ||
        selectedCanvas.height! / 2,
      angle: items.frame.angle,
      scaleX: scale,
      scaleY: scale,
      selectable: true,
      hasControls: false,
      hasBorders: false,
      lockMovementX: true, // Disables horizontal movement
      lockMovementY: true,
    });

    selectedCanvas?.add(phoneImg);
    selectedCanvas.setActiveObject(phoneImg);
    selectedCanvas?.add(text);
  };

  // Callback to store the canvas instance when initialized
  const handleCanvasReady = useCallback(() => {}, []);
  useEffect(() => {
    const setLayouts = () => {
      deviceLayouts.map((layout) => {
        const newId = `canvas-${layout.id}`;
        setCanvasItems([{ id: newId }]);
      });
    };
    setLayouts();

    return () => {};
  }, []);

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {deviceLayouts.map((item, index) => (
        <div key={item.id} onClick={() => add(item)} className={`p- `}>
          <CanvasComponent
            height={layoutCanvasHeight}
            deleteCanvas={() => {}}
            items={item}
            index={index}
            width={layoutCanvaswidth}
            id={`canvas-${item.id}`}
            onCanvasReady={handleCanvasReady}
          />
        </div>
      ))}
    </div>
  );
};
