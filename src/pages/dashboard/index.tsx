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
import { CanvasComponent } from "./components/CanvasComponent";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import RightSidebar from "./RightSidebar";
import { Tooltip } from "../../components/ui/tooltip";
import ExportDialog from "./components/ExportDialog";
import Logo from "../../components/ui/logo";
import { useKeyboardShortcuts } from "../../lib/hooks/useKeyboardShortcuts";
import { ConfirmDialog } from "../../components/ui/confirmDialog";
import { useCanvasStore } from "../../store/CanvasStore";

export default function Dashboard() {
  const [zoom, setZoom] = useState<number>(0.3);
  const canvasAreaRef = useRef<HTMLDivElement | null>(null); // Ref for the canvas area

  var canvasWidth = 450; // default canvas width
  var canvasHeight = 800; // default canvas height

  const deleteCanvas = useCanvasStore((s) => s.deleteCanvas); // Function to delete a canvas
  const addText = useCanvasStore((s) => s.addText); // Function to add text to the canvas
  const canvasToDuplicate = useCanvasStore((s) => s.canvasToDuplicate); // Get the canvas to duplicate
  const handleCanvasReady = useCanvasStore((s) => s.handleCanvasReady); // Callback when a canvas is ready
  const setSortedCanvasItems = useCanvasStore((s) => s.setSortedCanvasItems); // Function to update the order of canvas items
  const selectedCanvas = useCanvasStore((s) => s.selectedCanvas); // Get the currently selected canvas
  const setSelectedCanvas = useCanvasStore((s) => s.setSelectedCanvas); // Function to set the currently selected canvas
  const sortedCanvasItems = useCanvasStore((s) => s.sortedCanvasItems); // Get the list of canvas items in sorted order
  const addNewCanvas = useCanvasStore((s) => s.addNewCanvas); // Function to add a new canvas
  const canvasItems = useCanvasStore((s) => s.canvasItems); // Get the list of all canvas items
  const duplicateCanvas = useCanvasStore((s) => s.duplicateCanvas); // Function to duplicate a canvas
  const setSelectedCanvasId = useCanvasStore((s) => s.setSelectedCanvasId); // Function to set the currently selected canvas id
  const selectedCanvasId = useCanvasStore((s) => s.selectedCanvasId); // Get the currently selected canvas id

  const [isDeletable, setIsDeletable] = useState(false); // State to track if the selected object can be deleted
  const [isTextActive, setIsTextActive] = useState(false); // State to track if the selected object is text
  const [confirmOpen, setConfirmOpen] = useState(false); //  State to control the visibility of the delete confirmation dialog
  const [disablePanning, setDisablePanning] = useState(false); // State to control whether panning is disabled
  const [shiftPressed, setShiftPressed] = useState(false); // State to track if the Shift key is pressed
  const [showLeft, setShowLeft] = useState(false); // State to control the visibility of the left sidebar
  const [showRight, setShowRight] = useState(false); // State to control the visibility of the right sidebarmmm

  // Zoom Controls Component
  const ZoomControls = () => {
    const { zoomIn, zoomOut } = useControls();

    return (
      <div className="bg-red-500  z-40 space-x-2 flex items-center">
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

        <LeftSidebar />
      </aside>

      {/* Main Area */}
      <main className="flex-1 bg-gray-50 overflow-x-auto no-scrollbar relative">
        {/* Top Toolbar */}
        <div className="flex items-center fixed z-30 w-full bg-white  p-2 gap-2 shadow-sm flex-wrap">
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
          <header className="flex w-full  justify-center relative md:justify-start flex-row space-x-3 items-center text-sm">
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
            {/* <ZoomControls /> */}
          </div>
          <TransformComponent wrapperClass="w-full mt-40" contentClass="no-scrollbar">
            <div ref={canvasAreaRef} className="flex justify-center p-2 mt-40">
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
                        bgColor="#1b1b1b"
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
