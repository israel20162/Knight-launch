import { Canvas, FabricImage, IText } from "fabric";
import React, { useCallback, useEffect, useState } from "react";
import { CanvasComponent } from "../CanvasComponent";
import type { CanvasItem, layoutType } from "../../types";

interface LayoutEditorProps {
  selectedCanvas: Canvas|undefined;
}
export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  selectedCanvas,
}) => {
  const [_, setCanvasItems] = useState<CanvasItem[]>([]);

  const layoutCanvasHeight = 140;
  const layoutCanvaswidth = 100;

  const add = async (items: layoutType) => {
      if (!selectedCanvas) {
        alert("No canvas selected!");
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

  const layouts: layoutType[] = [
    {
      id: 1,
      text: {
        value: "Insert your text here",
        left: 0,
        top: 3,
        originX: "center",
        fontSize: 7,
        fill: "#FFFFFF",
      },
      frame: {
        url: "/frames/iphone.png",
        originX: "center",
        originY: "center",
        left: 50,
        top: 2,
        scaleX: 1,
        scaleY: 1,
      },
    },
    {
      id: 2,
      text: {
        value: "Insert your text here",
        left: 0,
        top: 3,
        originX: "center",
        fontSize: 7,
        fill: "#FFFFFF",
      },
      frame: {
        url: "/frames/iphone.png",
        originX: "center",
        originY: "center",
        left: 90,
        top: 70,
        scaleX: 1,
        scaleY: 1,
      },
    },
    {
      id: 3,
      text: {
        value: "Insert your text here",
        left: 0,
        top: 3,
        originX: "center",
        fontSize: 7,
        fill: "#FFFFFF",
      },
      frame: {
        url: "/frames/iphone.png",
        originX: "center",
        originY: "center",
        left: 95,
        top: 90,
        scaleX: 1,
        scaleY: 1,
        angle: 45,
      },
    },
    {
      id: 4,
      text: {
        value: "Insert your text here",
        left: 0,
        top: 3,
        originX: "center",
        fontSize: 7,
        fill: "#FFFFFF",
      },
      frame: {
        url: "/frames/iphone.png",
        originX: "center",
        originY: "center",
        left: -5,
        top: 75,
        scaleX: 1,
        scaleY: 1,
        angle: 45,
      },
    },
    {
      id: 5,
      text: {
        value: "Insert your text here",
        left: 0,
        top: 3,
        originX: "center",
        fontSize: 7,
        fill: "#FFFFFF",
      },
      frame: {
        url: "/frames/iphone.png",
        originX: "center",
        originY: "center",
        left: 50,
        top: 75,
        scaleX: 1,
        scaleY: 1,
        angle: 30,
      },
    },
    {
      id: 6,
      text: {
        value: "Insert your text here",
        left: 0,
        top: 3,
        originX: "center",
        fontSize: 7,
        fill: "#FFFFFF",
      },
      frame: {
        url: "/frames/iphone.png",
        originX: "center",
        originY: "center",
        left: 50,
        top: 75,
        scaleX: 1,
        scaleY: 1,
        angle: -30,
      },
    },
    {
      id: 7,
      text: {
        value: "Insert your text here",
        left: 0,
        top: 3,
        originX: "center",
        fontSize: 7,
        fill: "#FFFFFF",
      },
      frame: {
        url: "/frames/iphone.png",
        originX: "center",
        originY: "center",
        left: -10,
        top: 70,
        scaleX: 1,
        scaleY: 1,
        angle: 0,
      },
    },
  ];
  // Callback to store the canvas instance when initialized
  const handleCanvasReady = useCallback((id: string, canvas: Canvas) => {}, []);
  useEffect(() => {
    const setLayouts = () => {
      layouts.map((layout) => {
        const newId = `canvas-${layout.id}`;
        setCanvasItems([{ id: newId }]);
      });
    };
    setLayouts();

    return () => {};
  }, []);

  return (
    <div className="grid grid-cols-2 p-4">
      {layouts.map((item, index) => (
        <div key={item.id} onClick={() => add(item)} className={`p-2 `}>
          <CanvasComponent
            height={layoutCanvasHeight}
            deleteCanvas={()=>{}}
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
