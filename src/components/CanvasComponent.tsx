import { Canvas, FabricImage, FabricText, Rect, Group } from "fabric";
import React, { useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { ArrowLeftRight, Copy, Trash2 } from "lucide-react";
import type { CanvasComponentProps } from "../types";
import { Tooltip } from "./ui/tooltip";
// Reusable Canvas Component
export const CanvasComponent: React.FC<CanvasComponentProps> = React.memo(
  ({
    id,
    index,
    onCanvasReady,
    className,
    onClick,
    isActive,
    deleteCanvas,
    width,
    height,
    bgColor,
    transition,
    items,
    onDuplicateCanvas,
    duplicateCanvas,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<HTMLDivElement>(null);
    const { ref, handleRef, isDragging, isDropping } = useSortable({
      id,
      index,
      transition,
    });
    useEffect(() => {
      if (canvasRef.current) {
        // const json = duplicateCanvas?.toJSON();

        const fabricCanvas = new Canvas(canvasRef.current, {
          width: duplicateCanvas?.width || width || 222.5,
          height: duplicateCanvas?.height || height || 400,
          preserveObjectStacking: true,
        });
        // fabricCanvas.loadFromJSON(json,()=>{
        //   fabricCanvas.renderAll();
        // });

        // If you want to copy background color and image from duplicateCanvas
        // Uncomment the following lines
        fabricCanvas.backgroundColor =
          duplicateCanvas?.backgroundColor || bgColor || "#1a1a1b";
        if (duplicateCanvas?.backgroundImage) {
          const duplicatedBgImage =
            duplicateCanvas?.backgroundImage?.cloneAsImage({});
          fabricCanvas.set("backgroundImage", duplicatedBgImage);
          fabricCanvas.requestRenderAll();
        }
        duplicateCanvas?.getObjects().forEach(async (obj) => {
          // Skip if it's the clipRect
          if (obj instanceof Rect) return;

          // Clone everything else
          fabricCanvas.add(await obj.clone());
          fabricCanvas.requestRenderAll();
        });

        if (items?.text) {
          const text = new FabricText(items?.text.value, {
            originX: "center",
            left: fabricCanvas.getWidth() / 2,
            top: items.text.top,
            fontSize: items.text.fontSize,
            fill: items.text.fill,
          });

          fabricCanvas.add(text);
        }
        if (items?.frame) {
          async function loadImg() {
            const phoneImg = await FabricImage.fromURL(
              String(items?.frame.url)
            );
            const fitScale = Math.min(
              fabricCanvas.width! / phoneImg?.width!,
              fabricCanvas.height! / phoneImg.height!
            );
            const scale = fitScale * 0.75;
            phoneImg.set({
              originX: "center",
              originY: "center",
              left: Number(items?.frame.left),
              top: Number(items?.frame.top) || 2,
              scaleX: scale,
              angle: Number(items?.frame.angle) || 0,
              scaleY: scale,
              selectable: true,
              hasControls: false,
              hasBorders: false,
              lockMovementX: true, // Disables horizontal movement
              lockMovementY: true,
            });
            fabricCanvas.add(phoneImg);
            // fabricCanvas.setActiveObject(phoneImg);
            fabricCanvas.requestRenderAll();
          }

          loadImg();
        }
        fabricCanvas.renderAll();
        onCanvasReady(id, fabricCanvas);
        return () => {
          fabricCanvas.dispose();
        };
      }
    }, [id, onCanvasReady, width, height]);

    // async function cloneCanvasWithNewFrame(
    //   sourceCanvas: Canvas,
    //   newFrameURL: string,
    //   device: { width: number; height: number; rx?: number; ry?: number }
    // ): Promise<any>{
    //  if(canvasRef.current){
    //   const newCanvas = new Canvas(canvasRef.current, {
    //     width: sourceCanvas.width,
    //     height: sourceCanvas.height,
    //     preserveObjectStacking: true,
    //     backgroundColor: sourceCanvas.backgroundColor,
    //   });

    //   const group = sourceCanvas
    //     .getObjects()
    //     .find((obj) => obj.type === "group") as Group;
    //   if (!group) throw new Error("No frame group found in source canvas.");

    //   const innerImg = group._objects.find(
    //     (o) => o instanceof FabricImage
    //   ) as FabricImage;
    //   if (!innerImg) throw new Error("No inner image found.");

    //   const clonedInnerImg = await innerImg.clone();
    //   const newFrame = await FabricImage.fromURL(newFrameURL);

    //   const fitScale = Math.min(
    //     newCanvas.width! / newFrame.width!,
    //     newCanvas.height! / newFrame.height!
    //   );
    //   newFrame.set({
    //     originX: "center",
    //     originY: "center",
    //     left: newCanvas.width! / 2,
    //     top: newCanvas.height! / 2,
    //     scaleX: fitScale * 0.75,
    //     scaleY: fitScale * 0.75,
    //     selectable: true,
    //     hasControls: true,
    //     hasBorders: false,
    //   });

    //   const scale = Math.min(
    //     (device.width * (newFrame.scaleX || 1)) / (clonedInnerImg.width || 1),
    //     (device.height * (newFrame.scaleY || 1)) / (clonedInnerImg.height || 1)
    //   );

    //   clonedInnerImg.set({
    //     originX: "center",
    //     originY: "center",
    //     scaleX: scale * 1.025,
    //     scaleY: scale * 1.015,
    //     left: newFrame.left,
    //     top: newFrame.top,
    //     selectable: false,
    //     absolutePositioned: true,
    //     clipPath: new Rect({
    //       originX: "center",
    //       originY: "center",
    //       width: clonedInnerImg.width! - 10,
    //       height: clonedInnerImg.height! - 10,
    //       rx: device.rx || 0,
    //       ry: device.ry || 0,
    //       left: newFrame.left,
    //       top: newFrame.top,
    //     }),
    //   });

    //   const newGroup = new Group([clonedInnerImg, newFrame], {
    //     originX: "center",
    //     originY: "center",
    //     left: newCanvas.width! / 2,
    //     top: newCanvas.height! / 2,
    //   });

    //   newCanvas.add(newGroup);
    //   newCanvas.setActiveObject(newGroup);
    //   newCanvas.requestRenderAll();

    //   return newCanvas;
    //  }
    // }

    
    

    return (
      <div
        className={` p-2  ${className} ${
          isActive ? "border border-blue-500 p-4" : ""
        } `}
        ref={!items?.text && !items?.frame ? ref : fabricCanvasRef}
      >
        <div onClick={onClick}>
          {/* {id} */}
          <canvas
            className={`${
              isDragging || isDropping ? `!size-[55%] opacity-90` : ""
            }`}
            ref={canvasRef}
          />
        </div>
        {!items?.text && !items?.frame && (
          <div
            className={`flex space-x-4 justify-end mt-2 ${
              isDragging || isDropping ? `!size-[55%] opacity-90` : ""
            }`}
          >
            <Tooltip text="Duplicate Canvas" placement="bottom">
              <button
                className="cursor-pointer text-gray-500"
                onClick={() => onDuplicateCanvas(id)}
              >
                <Copy />
              </button>
            </Tooltip>
            <Tooltip text="Delete Canvas" placement="bottom">
              <button
                className="cursor-pointer text-gray-500"
                onClick={() => deleteCanvas(id)}
              >
                <Trash2 />
              </button>
            </Tooltip>
            <Tooltip text="Move Canvas" placement="bottom">
              <button className="cursor-pointer text-gray-500" ref={handleRef}>
                <ArrowLeftRight />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
);
