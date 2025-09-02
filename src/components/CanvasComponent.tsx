import { Canvas, FabricImage, FabricText } from "fabric";
import React, { useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { ArrowLeftRight, Trash2 } from "lucide-react";
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
        const fabricCanvas = new Canvas(canvasRef.current, {
          width: width || 222.5,
          height: height || 400,
          preserveObjectStacking: true,
        });
        fabricCanvas.backgroundColor = bgColor || "#1a1a1b";

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

    return (
      <div
        className={` p-2  ${className} ${
          isActive ? "border border-blue-500" : ""
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
