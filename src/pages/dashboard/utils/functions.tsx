import type { CanvasItem } from "../../../types";
import { Canvas, FabricObject, InteractiveFabricObject } from "fabric";
import { Control } from "fabric";
export const disposeCanvas = (canvasItem: CanvasItem | undefined) => {
  if (canvasItem?.canvas) {
    try {
      canvasItem.canvas.dispose();
    } catch (error) {
      console.error(`Error disposing canvas ${canvasItem.id}:`, error);
    }
  }
};
export const findNextCanvasId = (
  canvasItems: CanvasItem[],
  currentId: string | null,
  _: string
): string | null => {
  if (canvasItems.length === 0) return null;

  // If no current ID or current ID not found, select first canvas
  if (!currentId || !canvasItems.find((item) => item.id === currentId)) {
    return canvasItems[0].id;
  }

  // Find index in sorted array to maintain order
  const sortedIds = canvasItems.map((item) => item.id);
  const currentIndex = sortedIds.indexOf(currentId);

  // Select next canvas, or previous if at the end
  if (currentIndex < sortedIds.length - 1) {
    return sortedIds[currentIndex + 1];
  } else if (currentIndex > 0) {
    return sortedIds[currentIndex - 1];
  }
  return canvasItems[0].id;
};

export const validateTranslationsJson = (
  json: any,
  languages: string[]
  // originalCanvases: CanvasItem[]
): boolean => {
  if (typeof json !== "object") return false;

  for (const lang of languages) {
    const section = json[lang];
    if (!section || section.language !== lang) return false;
    if (!Array.isArray(section.canvases)) return false;
    // if (section.canvases.length !== originalCanvases.length) return false;

    for (let i = 0; i < section.canvases.length; i++) {
      const canvasData = section.canvases[i];
      // if (canvasData.id !== i) return false;
      if (!Array.isArray(canvasData.texts)) return false;

      for (const t of canvasData.texts) {
        if (typeof t.canvasId !== "string") return false;
        if (typeof t.text !== "string") return false;

        // const originalCanvas = originalCanvases.find((c) => c.id === t.canvasId);
        // if (!originalCanvas) return false;
      }
    }
  }

  return true;
};


export function countObjectsByType<
  T1 extends typeof FabricObject,
  T2 extends typeof FabricObject
>(canvas: Canvas | null, TypeClass1: T1, TypeClass2?: T2): number {
  if (!canvas) return 0;

  return canvas.getObjects().reduce((count, obj: any) => {
    if (
      obj instanceof TypeClass1 ||
      (TypeClass2 && obj instanceof TypeClass2)
    ) {
      return count + 1;
    }
    return count;
  }, 0);
}



interface RenderIconParams {
  ctx: CanvasRenderingContext2D;
  left: number;
  top: number;
  _styleOverride: any;
  fabricObject: InteractiveFabricObject;
}
const deleteIconUrl = "/icons/deleteFrame.svg";

const deleteImg = new Image();
deleteImg.src = deleteIconUrl;

function renderIcon(
  ctx: RenderIconParams["ctx"],
  left: RenderIconParams["left"],
  top: RenderIconParams["top"],
  _styleOverride: RenderIconParams["_styleOverride"]
  // fabricObject: RenderIconParams["fabricObject"]
): void {
  const size = 24;
  ctx.save();
  ctx.translate(left, top);
  // ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
  ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
  ctx.restore();
}


export function addDeleteControl(object: FabricObject, onDelete: () => void) {
  object.controls.deleteControl = new Control({
    x: 0.5,
    y: -0.5,
    offsetY: 24,
    cursorStyle: "pointer",
    render: renderIcon,
    mouseUpHandler:  onDelete,
  });
}
