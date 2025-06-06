import {
  useState,
  useRef,
  useEffect,
  type WheelEvent,
  useCallback,
} from "react";

import { ZoomIn, ZoomOut, Plus, Trash2, Type } from "lucide-react";
import LeftSidebar from "./LeftSidebar";
import { Canvas, FabricImage, IText, Group } from "fabric";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import { saveAs } from "file-saver";
import { CanvasComponent } from "../../components/CanvasComponent";
import type { CanvasItem } from "../../types";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import JSZip from "jszip";
import RightSidebar from "./RightSidebar";
import { Tooltip } from "../../components/ui/tooltip";

export default function Dashboard() {
  const [zoom, setZoom] = useState<number>(0.5);
  const canvasAreaRef = useRef<HTMLDivElement | null>(null);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([
    { id: "canvas-1" },
  ]);
  const [sortedCanvasItems, setSortedCanvasItems] = useState<CanvasItem[]>([
    { id: "canvas-1" },
  ]);
  var canvasWidth = 322.5;

  var canvasHeight = 500;
  const [selectedCanvasId, setSelectedCanvasId] = useState<string>("canvas-1");
  const [isDeletable, setIsDeletable] = useState(false);
  const [isTextActive, setIsTextActive] = useState(false);
 
  // Get the currently selected canvas
  const selectedCanvas = canvasItems.find(
    (item) => item.id === selectedCanvasId
  )?.canvas;
  const ZoomControls = () => {
    const { zoomIn, zoomOut } = useControls();

    return (
      <div className="absolute top-2 right-4 z-50 space-x-2 flex items-center">
        <button
          onClick={() => {
            zoomOut(0.35);
          }}
          className="p-2 rounded"
        >
          <ZoomOut />
        </button>
        <span className="text-sm">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => {
            zoomIn(0.35);
          }}
          className="p-2 rounded"
        >
          <ZoomIn />
        </button>

        {/* <button onClick={() => resetTransform()} className="btn">
          Reset
        </button> */}
      </div>
    );
  };

  const handleWheelZoom = (
    e: WheelEvent | (WheelEvent & { ctrlKey?: boolean })
  ): void => {
    if (e.ctrlKey || (e as WheelEvent).metaKey) {
      e.preventDefault();
      setZoom((z) =>
        e.deltaY > 0 ? Math.max(z - 0.1, 0.5) : Math.min(z + 0.1, 2)
      );
    }
  };

  const addFrame = async (phoneImageURL: string) => {
    if (!selectedCanvas) {
      alert("Please select a canvas first.");
      return;
    }
    const phoneImg = await FabricImage.fromURL(phoneImageURL);
    // Get screen dimensions from the frame image

    const fitScale = Math.min(
      selectedCanvas.width! / phoneImg.width!,
      selectedCanvas.height! / phoneImg.height!
    );
    const scale = fitScale * 0.75;
    phoneImg.set({
      originX: "center",
      originY: "center",
      left: selectedCanvas.width! / 2,
      top: selectedCanvas.height! / 2,
      scaleX: scale,
      scaleY: scale,
      selectable: true,
      hasControls: false,
      lockScalingX: true,
      lockScalingY: true,
      lockMovementX: true, // Disables horizontal movement
      lockMovementY: true,
      hasBorders: true,
    });

    selectedCanvas.add(phoneImg);
    selectedCanvas.setActiveObject(phoneImg);
    selectedCanvas.requestRenderAll();
  };

  // Add a new canvas
  const addNewCanvas = () => {
    const newId = `canvas-${canvasItems.length + 1}`;
    setCanvasItems((prev) => [...prev, { id: newId }]);
    setSortedCanvasItems((prev) => [...prev, { id: newId }]);
    setSelectedCanvasId(newId);
  };
  // Callback to store the canvas instance when initialized
  const handleCanvasReady = useCallback((id: string, canvas: Canvas) => {
    setCanvasItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, canvas } : item))
    );
    setSortedCanvasItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, canvas } : item))
    );
  }, []);
  const deleteCanvas = (id: string) => {
    const newCanvasItems = canvasItems.filter((canvas) => canvas.id !== id);
    const newSortedCanvasItems = sortedCanvasItems.filter(
      (canvas) => canvas.id !== id
    );
    setCanvasItems(newCanvasItems);
    setSortedCanvasItems(newSortedCanvasItems);
    setSelectedCanvasId(newCanvasItems[0].id);
  };
  const addText = () => {
    if (!selectedCanvas) {
      alert("Please select a canvas first.");
      return;
    }
    const text = new IText("Insert your text here", {
      originX: "center",
      left: selectedCanvas.getWidth() / 2,
      top: 30,
      fontSize: 24,
      hasControls: true,
      fill: "#FFFFFF",
    });
    selectedCanvas.add(text);
  };
  function deleteFrame() {
    const activeObject = selectedCanvas?.getActiveObject();
    if (activeObject) {
      selectedCanvas?.remove(activeObject);
      selectedCanvas?.discardActiveObject(); // Optional: clears selection
      selectedCanvas?.requestRenderAll(); // Re-render canvas
    }
  }
  const exportAllCanvas = async () => {
    if (!selectedCanvas) {
      alert("No canvas selected!");
      return;
    }

    const scale = 6;
    const zip = new JSZip();

    // Loop over canvas items and add each to the ZIP
    for (let index = 0; index < sortedCanvasItems.length; index++) {
      const item = sortedCanvasItems[index];
      const dataURL = item?.canvas?.toDataURL({
        format: "png",
        quality: 1,
        multiplier: scale,
      });

      if (dataURL) {
        // Convert Data URL to Blob
        const blob = await fetch(dataURL).then((res) => res.blob());

        // Add the file to the zip
        zip.file(`project-name-${index + 1}.png`, blob);
      }
    }

   try {
     const zipBlob: Blob = await zip.generateAsync({ type: "blob" });
     saveAs(zipBlob, "all-canvases.zip");
   } catch (error) {
     console.error("Failed to generate ZIP file:", error);
   }
  };
  useEffect(() => {
    const canvas = canvasAreaRef.current;
    if (!canvas) return;

    const wheelHandler = (e: WheelEvent): void => {
      handleWheelZoom(e);
    };

    canvas.addEventListener("wheel", wheelHandler as unknown as EventListener, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener(
        "wheel",
        wheelHandler as unknown as EventListener
      );
    };
  }, []);
  useEffect(() => {
    if (!selectedCanvas) {
      setIsDeletable(false);
      setIsTextActive(false);
      return;
    }

    const updateSelectionStatus = () => {
      const activeObject = selectedCanvas.getActiveObject();
      const isImage = activeObject instanceof FabricImage;
      const isGroup = activeObject instanceof Group;
      const isText = activeObject instanceof IText;

      setIsDeletable(isImage || isGroup);
      setIsTextActive(!!isText);
    };

    updateSelectionStatus();

    selectedCanvas.on("selection:created", updateSelectionStatus);
    selectedCanvas.on("selection:updated", updateSelectionStatus);
    selectedCanvas.on("selection:cleared", () => {
      setIsDeletable(false);
      setIsTextActive(false);
    });

    return () => {
      selectedCanvas.off("selection:created", updateSelectionStatus);
      selectedCanvas.off("selection:updated", updateSelectionStatus);
      selectedCanvas.off("selection:cleared", updateSelectionStatus);
    };
  }, [selectedCanvas]);
  return (
    <div className="flex  bg-gray-100">
      {/* Left Sidebar */}
      <aside className="w-3/12  bg-white border-r border-gray-100 p-4 shadow-sm max-h-screen no-scrollbar overflow-scroll">
        <h2 className="text-lg font-bold mb-4">Left Panel</h2>
        <LeftSidebar
          addFrame={addFrame}
          addCanvas={addNewCanvas}
          selectedCanvas={selectedCanvas}
          canvasItems={canvasItems}
          setSelectedCanvas={setSelectedCanvasId}
        />
      </aside>

      {/* Main Area */}
      <main className="w-9/12 no-scrollbar overflow-x-scroll max-w-full relative">
        {/* Top Toolbar */}
        <div className="flex items-center w-full  bg-white border-b border-gray-100 p-2 gap-2 shadow-sm">
          <header className="flex top-0 w-full flex-row mb-1 space-x-3 items-center">
            <Tooltip text="Add Canvas">
              <button
                onClick={addNewCanvas}
                className="px-4 py-2 text-sm  text-black bg-slate-100 rounded hover:"
              >
                <Plus size={18} />
              </button>
            </Tooltip>
            <Tooltip text="Delete Frame">
              <button
                onClick={() => deleteFrame()}
                disabled={!isDeletable}
                className={`px-4 py-2 text-sm  text-black bg-slate-100 rounded  ${
                  !isDeletable && "opacity-50 !cursor-not-allowed"
                }`}
              >
                <Trash2 size={18} />
              </button>
            </Tooltip>
            <Tooltip text="Add Text">
              <button
                onClick={addText}
                className="px-4 py-2 text-sm  text-black bg-slate-100 rounded "
              >
                <Type size={18} />
              </button>
            </Tooltip>
            {/* <select
              onChange={(e) => {
                // setDevIndex(Number(e.target.value));
                updateDevice(devices[Number(e.target.value)]);
              }}
              className="px-2 py-2 text-sm border rounded"
            >
              {devices.map((device, index: number) => (
                <option key={index} value={index}>
                  {device.name}
                </option>
              ))}
            </select> */}
          </header>
        </div>
        <div className=" ">
          <TransformWrapper
            initialScale={zoom}
            minScale={0.1}
            maxScale={1}
            wheel={{
              step: 0.05,
              activationKeys: ["Control", "Meta"], // require Ctrl or Cmd key to zoom
            }}
            panning={{
              velocityDisabled: true,
              disabled: isTextActive,
            }}
            initialPositionX={10}
            initialPositionY={50}
            maxPositionX={0}
            centerZoomedOut
            limitToBounds
            onTransformed={({ state }) => {
              setZoom(state.scale);
            }}
            // ref={canvasAreaRef}
          >
            <ZoomControls />{" "}
            <TransformComponent
              wrapperClass="!w-[59vw] "
              contentClass="no-scrollbar  "
            >
              {/* Canvas Area */}
              <div className="  w-full  ">
                <div ref={canvasAreaRef}>
                  <DragDropProvider
                    onDragEnd={(event) => {
                      setSortedCanvasItems((items) => move(items, event));
                    }}
                  >
                    <div className="!flex flex-1/3 items-center overflow-scroll no-scrollbar ">
                      {canvasItems.map((item, index) => (
                        <CanvasComponent
                          key={index}
                          width={canvasWidth}
                          height={canvasHeight}
                          deleteCanvas={deleteCanvas}
                          onClick={() => setSelectedCanvasId(item.id)}
                          isActive={item.id === selectedCanvasId}
                          className={`p-2  `}
                          id={item.id}
                          index={index}
                          bgColor="#1a1a1b"
                          onCanvasReady={handleCanvasReady}
                        />
                      ))}
                    </div>
                  </DragDropProvider>
                </div>
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-3/12 bg-white border-l border-gray-100 p-4 shadow-sm max-h-screen max-w-full  no-scrollbar ">
        <h2 className="text-lg font-bold mb-4">Right Panel</h2>
        <RightSidebar selectedCanvas={selectedCanvas} />
      </aside>
    </div>
  );
}
