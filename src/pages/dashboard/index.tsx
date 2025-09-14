import { useState, useRef, useEffect, type WheelEvent } from "react";
import {
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  Type,
  Menu,
  PanelRightClose,
} from "lucide-react";
import LeftSidebar from "./LeftSidebar";
import { FabricImage, IText, Group } from "fabric";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import { CanvasComponent } from "../../components/CanvasComponent";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import RightSidebar from "./RightSidebar";
import { Tooltip } from "../../components/ui/tooltip";
import ExportDialog from "./components/ExportDialog";
import Logo from "../../components/ui/logo";
import { useKeyboardShortcuts } from "../../lib/hooks/useKeyboardShortcuts";

import { ConfirmDialog } from "../../components/ui/confirmDialog";
import { useCanvasStore } from "../../context/store/CanvasStore";

export default function Dashboard() {
  const [zoom, setZoom] = useState<number>(0.3);
  const canvasAreaRef = useRef<HTMLDivElement | null>(null);

  var canvasWidth = 450;
  var canvasHeight = 800;
  const deleteCanvas = useCanvasStore((s) => s.deleteCanvas);
  const addText = useCanvasStore((s) => s.addText);
  const canvasToDuplicate = useCanvasStore((s) => s.canvasToDuplicate);
  const handleCanvasReady = useCanvasStore((s) => s.handleCanvasReady);
  // const setCanvasItems = useCanvasStore((s) => s.setCanvasItems);
  const setSortedCanvasItems = useCanvasStore((s) => s.setSortedCanvasItems);
  const selectedCanvas = useCanvasStore((s) => s.selectedCanvas);
  const setSelectedCanvas = useCanvasStore((s) => s.setSelectedCanvas);
  const sortedCanvasItems = useCanvasStore((s) => s.sortedCanvasItems);
  const addNewCanvas = useCanvasStore((s) => s.addNewCanvas);
  const canvasItems = useCanvasStore((s) => s.canvasItems);
  const duplicateCanvas = useCanvasStore((s) => s.duplicateCanvas);
  // Get the currently selected canvas id
  const setSelectedCanvasId = useCanvasStore((s) => s.setSelectedCanvasId);
  const selectedCanvasId = useCanvasStore((s) => s.selectedCanvasId);

  const [isDeletable, setIsDeletable] = useState(false);
  const [isTextActive, setIsTextActive] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disablePanning, setDisablePanning] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // Zoom Controls Component
  const ZoomControls = () => {
    const { zoomIn, zoomOut } = useControls();

    return (
      <div className="absolute top-2 right-4 z-40 space-x-2 flex items-center">
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
      keys: ["ctrl", "+", "="],
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
    { keys: [" "], handler: () => setShiftPressed(true) },
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
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen max-h-screen overflow-auto">
      {/* Left Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 md:w-2/10 min-w-2/10 no-scrollbar overflow-scroll  bg-white p-4 shadow-lg transform 
          transition-transform duration-300 ease-in-out
          ${showLeft ? "translate-x-0" : "-translate-x-full"}
          md:static md:translate-x-0 md:w-2/10 md:shadow-sm
        `}
      >
        <h2 className="text-lg font-bold mb-4">
          <Logo />
        </h2>

        <LeftSidebar  />
      </aside>

      {/* Main Area */}
      <main className="flex-1 bg-gray-50 overflow-x-auto no-scrollbar relative">
        {/* Top Toolbar */}
        <div className="flex items-center w-full bg-white p-2 gap-2 shadow-sm flex-wrap">
          {/* Mobile toggles */}
          <button
            className="md:hidden px-3 py-2 bg-gray-200 rounded"
            onClick={() => setShowLeft(!showLeft)}
          >
            <Menu size={18} />
          </button>

          <button
            className="md:hidden px-3 py-2 bg-gray-200 rounded"
            onClick={() => setShowRight(!showRight)}
          >
            <PanelRightClose size={18} />
          </button>
          <header className="flex w-full justify-center md:justify-start flex-row space-x-3 items-center text-sm">
            <Tooltip text="Add Canvas">
              <button
                onClick={addNewCanvas}
                className="px-4 py-2 text-black bg-slate-100 rounded"
              >
                <Plus size={18} />
              </button>
            </Tooltip>
            <Tooltip text="Delete Frame">
              <button
                onClick={deleteFrame}
                disabled={!isDeletable}
                className={`px-4 py-2 text-black bg-slate-100 rounded ${
                  !isDeletable && "opacity-50 !cursor-not-allowed"
                }`}
              >
                <Trash2 size={18} />
              </button>
            </Tooltip>
            <Tooltip text="Add Text">
              <button
                onClick={addText}
                className="px-4 py-2 text-black bg-slate-100 rounded"
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
            disabled: !disablePanning || isTextActive,
          }}
          initialPositionX={10}
          initialPositionY={50}
          centerZoomedOut
          limitToBounds
          onTransformed={({ state }) => {
            setZoom(state.scale);
          }}
        >
          <div className="hidden md:block">
            <ZoomControls />
          </div>
          <TransformComponent wrapperClass="w-full" contentClass="no-scrollbar">
            <div ref={canvasAreaRef} className="flex justify-center p-2">
              <DragDropProvider
                onDragEnd={(event) => {
                  setSortedCanvasItems(move(sortedCanvasItems, event));
                }}
              >
                <div className="flex flex-col">
                  <div className="flex flex-wrap md:flex-nowrap gap-8 items-center justify-center">
                    {canvasItems.map((item, index) => (
                      <CanvasComponent
                        key={item.id}
                        zoom={zoom}
                        width={canvasWidth}
                        height={canvasHeight}
                        deleteCanvas={() => setConfirmOpen(true)}
                        duplicateCanvas={canvasToDuplicate ?? undefined}
                        onDuplicateCanvas={duplicateCanvas}
                        onClick={() => {
                          const selectedCanvas = canvasItems.find(
                            (c) => c.id === item.id
                          )?.canvas;
                          setSelectedCanvasId(item.id);
                          setSelectedCanvas(selectedCanvas || undefined);
                        }}
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
                </div>
              </DragDropProvider>
            </div>
          </TransformComponent>
        </TransformWrapper>
      </main>

      {/* Right Sidebar */}
      <aside
        className={`
          fixed inset-y-0 right-0 z-50 w-64 md:w-2/10  no-scrollbar bg-white p-2 overflow-scroll shadow-lg transform 
          transition-transform duration-300 ease-in-out
          ${showRight ? "translate-x-0" : "translate-x-full"}
          md:static md:translate-x-0 md:w-2/10 md:shadow-sm
        `}
      >
        <div className="mb-4 w-full">
          <ExportDialog />
        </div>
        <RightSidebar />
      </aside>
      {/* Backdrop (only mobile) */}
      {(showLeft || showRight) && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => {
            setShowLeft(false);
            setShowRight(false);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        message={`Are you sure you want to delete "${selectedCanvasId}"?`}
        onConfirm={() => {
          deleteCanvas(selectedCanvasId);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
