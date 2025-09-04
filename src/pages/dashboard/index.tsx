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
import { CanvasComponent } from "../../components/CanvasComponent";
import type { CanvasItem } from "../../types";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import RightSidebar from "./RightSidebar";
import { Tooltip } from "../../components/ui/tooltip";
import ExportDialog from "./components/ExportDialog";
import { countObjectsByType } from "./utils";
import Logo from "../../components/ui/logo";
import { useKeyboardShortcuts } from "../../lib/hooks/useKeyboardShortcuts";
import { toast } from "sonner"; // option
import { ConfirmDialog } from "../../components/ui/confirmDialog";

export default function Dashboard() {
  const [zoom, setZoom] = useState<number>(0.5);
  const canvasAreaRef = useRef<HTMLDivElement | null>(null);

  // 🔑 useRef instead of useState
  const canvasItemsRef = useRef<CanvasItem[]>([{ id: "canvas-1", nid: 1 }]);
  const sortedCanvasItemsRef = useRef<CanvasItem[]>([{ id: "canvas-1" }]);
  const [_, setCanvasItems] = useState<CanvasItem[]>([]);
  const [sortedCanvasItems, setSortedCanvasItems] = useState<CanvasItem[]>([]);

  var canvasWidth = 360;
  var canvasHeight = 640;

  // Get the currently selected canvas id
  const [selectedCanvasId, setSelectedCanvasId] = useState<string>("canvas-1");
  const [isDeletable, setIsDeletable] = useState(false);
  const [isTextActive, setIsTextActive] = useState(false);
  const [canvasToDuplicate, setCanvasToDuplicate] = useState<Canvas | null>(
    null
  );
  // Get the currently selected canvas instance
  const selectedCanvas = canvasItemsRef.current.find(
    (item) => item.id === selectedCanvasId
  )?.canvas;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disablePanning, setDisablePanning] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);

  // sync helper
  const syncCanvasState = () => {
    setSortedCanvasItems([...sortedCanvasItemsRef.current]); // shallow copy forces re-render
    setCanvasItems([...canvasItemsRef.current]); // shallow copy forces re-render
  };

  useEffect(() => {
    syncCanvasState();
  }, [canvasItemsRef.current.length]);

  // Zoom Controls Component
  const ZoomControls = () => {
    const { zoomIn, zoomOut } = useControls();

    return (
      <div className="absolute top-2 right-4 z-50 space-x-2 flex items-center">
        <button onClick={() => zoomOut(0.35)} className="p-2 rounded">
          <ZoomOut />
        </button>
        <span className="text-sm">{Math.round(zoom * 100)}%</span>
        <button onClick={() => zoomIn(0.35)} className="p-2 rounded">
          <ZoomIn />
        </button>
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

    const totalFabricImage = countObjectsByType(selectedCanvas, FabricImage);
    if (totalFabricImage >= 2) {
      alert("You can only add up to 2 frames.");
      return;
    }

    const phoneImg = await FabricImage.fromURL(phoneImageURL);

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
      // lockScalingX: true,
      // lockScalingY: true,
      // lockMovementX: true,
      // lockMovementY: true,
      hasBorders: true,
    });

    selectedCanvas.add(phoneImg);
    selectedCanvas.setActiveObject(phoneImg);
    selectedCanvas.requestRenderAll();
  };

  // Add a new canvas
  const addNewCanvas = () => {
    setCanvasToDuplicate(null);
    const numbers = canvasItemsRef.current.map((item) => {
      const match = item.id.match(/canvas-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
    const newId = `canvas-${maxNumber + 1}`;
    setSelectedCanvasId(newId);
    const newItem: CanvasItem = { id: newId };
    canvasItemsRef.current = [...canvasItemsRef.current, newItem];
    sortedCanvasItemsRef.current = [...canvasItemsRef.current];
    toast.success("New canvas created", { duration: 1000 });
  };

  // store the canvas instance when initialized
  const handleCanvasReady = useCallback((id: string, canvas: Canvas) => {
    canvasItemsRef.current = canvasItemsRef.current.map((item) =>
      item.id === id ? { ...item, canvas } : item
    );
    sortedCanvasItemsRef.current = sortedCanvasItemsRef.current.map((item) =>
      item.id === id ? { ...item, canvas } : item
    );
  }, []);

  const disposeCanvas = (canvasItem: CanvasItem | undefined) => {
    if (canvasItem?.canvas) {
      try {
        canvasItem.canvas.dispose();
      } catch (error) {
        console.error(`Error disposing canvas ${canvasItem.id}:`, error);
      }
    }
  };
  const findNextCanvasId = (
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
  const deleteCanvas = (id: string) => {
    // if (id !== selectedCanvasId) return;

    // Dispose of canvas
    const canvasToDelete = canvasItemsRef.current.find((c) => c.id === id);
    disposeCanvas(canvasToDelete);

    // Remove from refs
    canvasItemsRef.current = canvasItemsRef.current.filter((c) => c.id !== id);
    sortedCanvasItemsRef.current = [...canvasItemsRef.current];

    // Now decide the next canvas
    const nextCanvasId = findNextCanvasId(
      canvasItemsRef.current,
      selectedCanvasId,
      id
    );
    setSelectedCanvasId(nextCanvasId || "");

    // Sync state
    syncCanvasState();
    toast.error(`${id} deleted`,{ duration: 1000 });
  };

  const duplicateCanvas = (id: string) => {
    const canvasToDuplicate = canvasItemsRef.current.find((c) => c.id === id);
    if (!canvasToDuplicate || !canvasToDuplicate.canvas) return;

    // Remove any trailing "(number)" from base ID
    const baseId = id.replace(/\(\d+\)$/, "");

    // Find a unique ID like "canvas-1(1)", "canvas-1(2)", etc.
    let copyIndex = 1;
    let newId = `${baseId}(${copyIndex})`;

    const existingIds = canvasItemsRef.current.map((c) => c.id);
    while (existingIds.includes(newId)) {
      copyIndex++;
      newId = `${baseId}(${copyIndex})`;
    }

    const newItem: CanvasItem = { id: newId };

    // Insert the new item right after the original in the array
    const originalIndex = canvasItemsRef.current.findIndex((c) => c.id === id);

    const newCanvasItems = [...canvasItemsRef.current];
    newCanvasItems.splice(originalIndex + 1, 0, newItem); // insert after original

    canvasItemsRef.current = newCanvasItems;
    sortedCanvasItemsRef.current = [...newCanvasItems];

    setSelectedCanvasId(newId);
    setCanvasToDuplicate(canvasToDuplicate.canvas);

    setTimeout(() => {
      syncCanvasState();
      toast.success(`${id} duplicated`);
    }, 500);
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
      selectedCanvas?.requestRenderAll();
    }
  }

  useEffect(() => {
    const canvas = canvasAreaRef.current;
    if (!canvas) return;

    const wheelHandler = (e: WheelEvent): void => handleWheelZoom(e);

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

  useKeyboardShortcuts([
    {
      keys: ["ctrl", "d"],
      handler: () => duplicateCanvas(selectedCanvasId),
    },
    {
      keys: ["ctrl", "shift", "n"],
      handler: () => addNewCanvas(),
    },
    {
      keys: ["delete"],
      handler: () => setConfirmOpen(true),
    },
    {
      keys: ["ctrl", "backspace"],
      handler: () => setConfirmOpen(true),
    },
    { keys: ["shift"], handler: () => setShiftPressed(true) },
  ]);

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey) setShiftPressed(false);
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (shiftPressed && e.button === 0) {
        // Shift + Left Mouse Down
        setDisablePanning(true);
      }
    };
    const handleMouseUp = () => {
      setDisablePanning(false);
    };

    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [shiftPressed]);

  return (
    <div className="flex bg-gray-100 min-w-screen min-h-screen max-h-screen overflow-auto">
      {/* Left Sidebar */}
      <aside className="w-3/12 bg-white border- p-4 shadow-sm max-h-screen no-scrollbar overflow-scroll">
        <h2 className="text-lg font-bold mb-4">
          <Logo />
        </h2>
        <LeftSidebar
          addFrame={addFrame}
          addCanvas={addNewCanvas}
          selectedCanvas={selectedCanvas}
          canvasItems={sortedCanvasItems}
          setSelectedCanvas={setSelectedCanvasId}
        />
      </aside>

      {/* Main Area */}
      <main className="w-9/12 no-scrollbar overflow-x-scroll max-w-full relative">
        {/* Top Toolbar */}
        <div className="flex items-center w-full bg-white border- p-2 gap-2 shadow-sm">
          <header className="flex w-full flex-row space-x-3 items-center">
            {selectedCanvasId}
            <Tooltip text="Add Canvas">
              <button
                onClick={addNewCanvas}
                className="px-4 py-2 text-sm text-black bg-slate-100 rounded"
              >
                <Plus size={18} />
              </button>
            </Tooltip>
            <Tooltip text="Delete Frame">
              <button
                onClick={deleteFrame}
                disabled={!isDeletable}
                className={`px-4 py-2 text-sm text-black bg-slate-100 rounded ${
                  !isDeletable && "opacity-50 !cursor-not-allowed"
                }`}
              >
                <Trash2 size={18} />
              </button>
            </Tooltip>
            <Tooltip text="Add Text">
              <button
                onClick={addText}
                className="px-4 py-2 text-sm text-black bg-slate-100 rounded"
              >
                <Type size={18} />
              </button>
            </Tooltip>
          </header>
        </div>

        <TransformWrapper
          initialScale={zoom}
          minScale={0.1}
          maxScale={1}
          wheel={{
            step: 0.05,
            activationKeys: ["Control", "Meta"],
          }}
          panning={{
            velocityDisabled: true,
            disabled: disablePanning || isTextActive,
          }}
          initialPositionX={10}
          initialPositionY={50}
          maxPositionX={0}
          centerZoomedOut
          limitToBounds
          onTransformed={({ state }) => {
            setZoom(state.scale);
          }}
        >
          <ZoomControls />
          <TransformComponent
            wrapperClass="!w-[59vw]"
            contentClass="no-scrollbar"
          >
            <div className="w-full">
              <div ref={canvasAreaRef}>
                <DragDropProvider
                  onDragEnd={(event) => {
                    sortedCanvasItemsRef.current = move(
                      sortedCanvasItemsRef.current,
                      event
                    );
                    syncCanvasState();
                  }}
                >
                  <div className="!flex flex-1/3 items-center overflow-scroll no-scrollbar">
                    {canvasItemsRef.current.map((item, index) => (
                      <CanvasComponent
                        key={item.id}
                        zoom={zoom}
                        width={canvasWidth}
                        height={canvasHeight}
                        deleteCanvas={() => setConfirmOpen(true)}
                        duplicateCanvas={canvasToDuplicate ?? undefined}
                        onDuplicateCanvas={duplicateCanvas}
                        onClick={() => setSelectedCanvasId(item.id)}
                        isActive={item.id === selectedCanvasId}
                        className="p-2"
                        id={item.id}
                        index={index}
                        bgColor="#1a1a1b"
                        transition={{
                          duration: 5,
                          idle: false,
                          easing: "ease-in-out",
                        }}
                        onCanvasReady={handleCanvasReady}
                      />
                    ))}
                  </div>
                </DragDropProvider>
              </div>
            </div>
          </TransformComponent>
        </TransformWrapper>
      </main>

      {/* Right Sidebar */}
      <aside className="w-3/12 bg-white border- p-4 shadow-sm max-h-screen max-w-full no-scrollbar">
        <div className="mb-4 w-full">
          <ExportDialog sortedCanvasItems={sortedCanvasItemsRef.current} />
        </div>
        <RightSidebar
          allCanvases={sortedCanvasItemsRef.current}
          selectedCanvas={selectedCanvas}
        />
      </aside>

      <ConfirmDialog
        open={confirmOpen}
        message={`Are you sure you want to delete  "${selectedCanvasId}"?`}
        onConfirm={() => {
          deleteCanvas(selectedCanvasId);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
