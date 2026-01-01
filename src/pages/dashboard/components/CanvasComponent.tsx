import { Canvas, FabricImage, FabricText, Rect } from "fabric";
import React, { useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/react/sortable";
import { ArrowLeftRight, Copy, Trash2 } from "lucide-react";
import type { CanvasComponentProps } from "../../../types";
import { Tooltip } from "../../../components/ui/tooltip";
import { useCanvasStore } from "../../../store/CanvasStore";
// Reusable Canvas Component
export const CanvasComponent: React.FC<CanvasComponentProps> = React.memo(
  ({
    id,
    index,
    onCanvasReady,
    className,
    zoom,
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
    translations,
    isPreview = false,
  }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<HTMLDivElement>(null);
    const fabricInstance = useRef<Canvas | null>(null);
    const setCanvasItemSize = useCanvasStore((s) => s.setCanvasItemSize);
    const {
      ref: sortableRef,
      handleRef,
      isDragging,
      isDropping,
    } = useSortable({
      id,
      index,
      transition,
    });
    // A ref to track an in-progress resize drag
    const resizeState = useRef({
      listening: false,
      startX: 0,
      startY: 0,
      startW: width || 300,
      startH: height || 400,
    });

    const startResize = (e: React.MouseEvent) => {
      e.preventDefault();
      // record starting values
      resizeState.current = {
        listening: true,
        startX: e.clientX,
        startY: e.clientY,
        startW: width || 300,
        startH: height || 400,
      };

      const onMouseMove = (ev: MouseEvent) => {
        if (!resizeState.current.listening) return;
        const dx = ev.clientX - resizeState.current.startX;
        const dy = ev.clientY - resizeState.current.startY;
        const scale = typeof zoom === "number" && zoom > 0 ? zoom : 1;
        const newW = Math.max(
          120,
          Math.round(resizeState.current.startW + dx / scale)
        );
        const newH = Math.max(
          120,
          Math.round(resizeState.current.startH + dy / scale)
        );
        setCanvasItemSize?.(id, newW, newH);
      };

      const onMouseUp = () => {
        resizeState.current.listening = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    };
    useEffect(() => {
      // create Fabric canvas only once per component instance
      if (canvasRef.current && !fabricInstance.current) {
        const fabricCanvas = new Canvas(canvasRef.current, {
          width: duplicateCanvas?.width || width || 222.5,
          height: duplicateCanvas?.height || height || 400,
          preserveObjectStacking: true,
        });
        fabricInstance.current = fabricCanvas;
        // fabricCanvas.loadFromJSON(json,()=>{
        //   fabricCanvas.renderAll();
        // });

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
        if (canvasRef.current && translations?.canvasData) {
          fabricCanvas.loadFromJSON(translations?.canvasData);
          fabricCanvas.requestRenderAll();
        }
        if (translations?.texts && Array.isArray(translations?.texts)) {
          translations?.texts.forEach((t) => {
            const textObj = new FabricText(t.text, {
              originX: t.originX || "center",
              left: t.left,
              top: t.top,
              fontSize: t.fontSize,
              fill: t.fill,
            });
            fabricCanvas.add(textObj);
          });
        }

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
        onCanvasReady(id, fabricCanvas, isPreview);
      }

      return () => {
        // dispose on unmount
        if (fabricInstance.current) {
          try {
            fabricInstance.current.dispose();
          } catch (e) {
            // ignore
          }
          fabricInstance.current = null;
        }
      };
      // create once; duplicateCanvas/width/height will be handled by separate effect
    }, [id, onCanvasReady, isPreview]);

    // Update canvas size when width/height props change without recreating the canvas
    useEffect(() => {
      const fc = fabricInstance.current;
      if (!fc) return;
      const newW = width || 222.5;
      const newH = height || 400;
      try {
        fc.setWidth(newW);
        fc.setHeight(newH);
        // Optionally update background image scale or reposition objects here
        fc.requestRenderAll();
      } catch (e) {
        // ignore errors if canvas disposed
      }
    }, [width, height]);

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
        ref={!items?.text && !items?.frame ? sortableRef : fabricCanvasRef}
      >
        <div
          className={`${
            isDragging || isDropping
              ? `!size-[35%] transition-all ease-in-out duration-200 opacity-90`
              : ""
          }`}
          onClick={onClick}
        >
          {/* {id} */}
          <canvas
            className={`${
              isDragging || isDropping
                ? `!size-[35%] transition-all ease-in-out duration-200 opacity-90`
                : ""
            }`}
            ref={canvasRef}
          />
          {/* Resize handle (bottom-right) */}
          <div
            onMouseDown={startResize}
            title="Drag to resize canvas"
            className="absolute bottom-10 right-0 w-10 opacity-0 h-10 bg-gray-300 cursor-se-resize z-50 rounded-full"
          />
          <div
            onMouseDown={startResize}
            title="Drag to resize canvas"
            className="absolute top-0 right-0 w-10 opacity-0 h-10 bg-gray-300 cursor-ne-resize z-50 rounded-full"
          />
          <div
            onMouseDown={startResize}
            title="Drag to resize canvas"
            className="absolute top-[12%] right-2 w-10 opacity-0 h-120 bg-gray-300 cursor-e-resize z-50 rounded-full"
          />

          <div
            onMouseDown={startResize}
            title="Drag to resize canvas"
            className="absolute bottom-10 left-0 w-10 opacity-0 h-10 bg-gray-300 cursor-sw-resize z-50 rounded-full"
          />
          <div
            onMouseDown={startResize}
            title="Drag to resize canvas"
            className="absolute top-0 left-0 w-10 opacity-0 h-10 bg-gray-300 cursor-nw-resize z-50 rounded-full"
          />
          <div
            onMouseDown={startResize}
            title="Drag to resize canvas"
            className="absolute top-[12%] left-2  w-10 opacity-0 h-120 bg-gray-300 cursor-w-resize z-50 rounded-full"
          />
        </div>
        {!items?.text && !items?.frame && (
          <div
            className={`flex space-x-4 justify-end mt-2 ${
              isDragging || isDropping ? `!size-[35%] opacity-0` : ""
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
              <button
                className={`${
                  isDragging || isDropping
                    ? `!size-[35%] transition-all ease-in-out duration-200  cursor-pointer text-gray-500`
                    : " cursor-pointer text-gray-500"
                }`}
                ref={handleRef}
              >
                <ArrowLeftRight />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
);
