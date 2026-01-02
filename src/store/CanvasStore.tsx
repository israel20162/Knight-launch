import { FabricImage, IText, type Canvas, FabricObject } from "fabric";
import { create } from "zustand";
import type { CanvasItem } from "../types";
import { toast } from "sonner";
import {
  addDeleteControl,
  countObjectsByType,
  disposeCanvas,
  findNextCanvasId,
} from "../pages/dashboard/utils/functions";

// State shape
interface CanvasState {
  canvasWidth: number;
  canvasHeight: number;
  confirmOpen: boolean;
  canvasItems: CanvasItem[];
  sortedCanvasItems: CanvasItem[];
  selectedCanvasId: string;
  selectedCanvas: Canvas | undefined;
  zoom: number;
  canvasToDuplicate?: Canvas;
}

// Actions
interface CanvasActions {
  setConfirmOpen: (state: boolean) => void;
  setSortedCanvasItems: (items: CanvasItem[]) => void;
  setCanvasItems: (items: CanvasItem[]) => void;
  setSelectedCanvasId: (id: string) => void;
  setSelectedCanvas: (canvas: Canvas | undefined) => void;
  setZoom: (z: number) => void;
  handleCanvasReady: (id: string, canvas: Canvas, isPreview?: boolean) => void;
  duplicateCanvas: (id: string) => void;
  addNewCanvas: () => void;
  addText: () => void;
  deleteCanvas: (id: string) => void;
  addFrame: (
    imageUrl: string,
    deviceType?: string,
    fill?: boolean
  ) => Promise<void>;
  applyFramesToAllCanvases: (
    imageUrl: string,
    deviceType?: string,
    fill?: boolean
  ) => Promise<void>;
  setCanvasItemSize: (id: string, width: number, height: number) => void;
  deleteCanvasObject: (object: FabricObject) => void;
}

// Zustand store
export const useCanvasStore = create<CanvasState & CanvasActions>(
  (set, get) => ({
    // Defaults
    canvasWidth: 450,
    canvasHeight: 800,
    confirmOpen: false,
    setConfirmOpen: (state) => set({ confirmOpen: state }),

    // Start with one canvas
    canvasItems: [{ id: "canvas-1" }],
    sortedCanvasItems: [{ id: "canvas-1" }],
    setCanvasItems: (items) => set({ canvasItems: items }),
    setSortedCanvasItems: (items) => set({ sortedCanvasItems: items }),

    // Selected canvas
    selectedCanvasId: "canvas-1",
    setSelectedCanvasId: (id) => set({ selectedCanvasId: id }),

    // When a canvas is ready
    handleCanvasReady: (id, canvas, isPreview) => {
      const { canvasItems, sortedCanvasItems, selectedCanvas } = get();

      const updatedCanvasItems = canvasItems.map((item) =>
        item.id === id ? { ...item, canvas } : item
      );
      const updatedSortedCanvasItems = sortedCanvasItems.map((item) =>
        item.id === id ? { ...item, canvas } : item
      );

      set({
        canvasItems: updatedCanvasItems,
        selectedCanvas: isPreview ? selectedCanvas : canvas,
        sortedCanvasItems: updatedSortedCanvasItems,
      });
    },

    // Zoom
    zoom: 0.3,
    setZoom: (z) => set({ zoom: z }),

    // Selected/duplicate canvas
    canvasToDuplicate: undefined,
    selectedCanvas: undefined,
    setSelectedCanvas: (canvas) => set({ selectedCanvas: canvas }),

    // Add a new canvas
    addNewCanvas: () => {
      const { canvasItems, sortedCanvasItems, setSelectedCanvasId } = get();
      set({ canvasToDuplicate: undefined });

      // Find next available number
      const numbers = canvasItems.map((item) => {
        const match = item.id.match(/canvas-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      });
      const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
      const newId = `canvas-${maxNumber + 1}`;

      setSelectedCanvasId(newId);
      const newItem: CanvasItem = {
        id: newId,
        width: get().canvasWidth,
        height: get().canvasHeight,
      };
      set({
        canvasItems: [...canvasItems, newItem],
        selectedCanvasId: newId,
        sortedCanvasItems: [...sortedCanvasItems, newItem],
      });

      toast.success("New canvas created", { duration: 500 });
    },

    // Duplicate a canvas
    duplicateCanvas: (id) => {
      const { canvasItems, sortedCanvasItems } = get();
      const canvasToDuplicate = canvasItems.find((c) => c.id === id);
      if (!canvasToDuplicate) return;

      // Create unique ID with (1), (2), etc.
      const baseId = id.replace(/\(\d+\)$/, "");
      let copyIndex = 1;
      let newId = `${baseId} (${copyIndex})`;
      const existingIds = canvasItems.map((c) => c.id);
      while (existingIds.includes(newId)) {
        copyIndex++;
        newId = `${baseId} (${copyIndex})`;
      }

      const newItem: CanvasItem = {
        id: newId,
        width: canvasToDuplicate?.width ?? get().canvasWidth,
        height: canvasToDuplicate?.height ?? get().canvasHeight,
      };

      // Insert right after original
      const originalIndex = canvasItems.findIndex((c) => c.id === id);
      const newCanvasItems = [...sortedCanvasItems];
      newCanvasItems.splice(originalIndex + 1, 0, newItem);

      set({
        canvasItems: newCanvasItems,
        sortedCanvasItems: [...newCanvasItems],
        selectedCanvasId: newId,
        canvasToDuplicate: canvasToDuplicate.canvas,
      });
    },

    // Add text
    addText: () => {
      const { selectedCanvas } = get();
      if (!selectedCanvas) {
        toast.error("Please select a canvas first.");
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
      selectedCanvas.setActiveObject(text);
      selectedCanvas.requestRenderAll();

      toast.success("Text added");
    },

    // Delete a canvas
    deleteCanvas: (id: string) => {
      const { canvasItems, selectedCanvasId } = get();

      // Dispose and remove
      const canvasToDelete = canvasItems.find((canvas) => canvas.id === id);
      disposeCanvas(canvasToDelete);
      const updatedCanvasItems = canvasItems.filter(
        (canvas) => canvas.id !== id
      );

      // Pick next canvas
      const nextCanvasId = findNextCanvasId(canvasItems, selectedCanvasId, id);
      set({
        canvasItems: updatedCanvasItems,
        sortedCanvasItems: [...updatedCanvasItems],
        selectedCanvasId: nextCanvasId || "canvas-1",
      });

      if (updatedCanvasItems.length === 0) {
        set({ selectedCanvas: undefined });
      }

      toast.error(`${id} deleted`, { duration: 500 });
    },
    applyFramesToAllCanvases: async (
      phoneImageURL: string,
      deviceType?: string,
      fill?: boolean
    ) => {
      const { canvasItems, deleteCanvasObject } = get();
      if (canvasItems.length !== 0) {
        canvasItems.forEach(async (canvasItem) => {
          const phoneImg = await FabricImage.fromURL(phoneImageURL);
          // Adjust scaling for tablets (tabs) to better fit wider/taller frames
          const fitMin = Math.min(
            canvasItem.canvas?.width! / phoneImg.width!,
            canvasItem.canvas?.height! / phoneImg.height!
          );
          const fitMax = Math.max(
            canvasItem.canvas?.width! / phoneImg.width!,
            canvasItem.canvas?.height! / phoneImg.height!
          );
          // If fill is requested, use the larger fit (cover) so the image fills the canvas
          let scale: number;
          if (fill) {
            scale = fitMax;
          } else {
            scale = fitMin * 0.75;
            if (deviceType === "tab" || deviceType === "tablet") {
              scale = fitMin * 0.95; // tablets slightly larger
            }
          }
          phoneImg.set({
            originX: "center",
            originY: "center",
            left: canvasItem.canvas?.width! / 2,
            top: canvasItem.canvas?.height! / 2,
            scaleX: scale,
            scaleY: scale,
            selectable: true,
            hasControls: true,
            // lockScalingX: true,
            // lockScalingY: true,
            // lockMovementX: true,
            // lockMovementY: true,
            hasBorders: true,
          });

          addDeleteControl(phoneImg, () => {
            deleteCanvasObject(phoneImg);
          });

          canvasItem.canvas?.add(phoneImg);
          canvasItem.canvas?.setActiveObject(phoneImg);
          canvasItem.canvas?.requestRenderAll();
        });
      } else {
        toast.error("No canvases available to apply frames.");
        return;
      }
    },
    addFrame: async (
      phoneImageURL: string,
      deviceType?: string,
      fill?: boolean
    ) => {
      const { selectedCanvas, deleteCanvasObject } = get();
      if (!selectedCanvas) {
        toast.info("Please select a canvas first.");
        return;
      }

      const totalFabricImage = countObjectsByType(selectedCanvas, FabricImage);
      if (totalFabricImage >= 2) {
        alert("You can only add up to 2 frames.");
        return;
      }

      const phoneImg = await FabricImage.fromURL(phoneImageURL);

      const fitMin = Math.min(
        selectedCanvas.width! / phoneImg.width!,
        selectedCanvas.height! / phoneImg.height!
      );
      const fitMax = Math.max(
        selectedCanvas.width! / phoneImg.width!,
        selectedCanvas.height! / phoneImg.height!
      );
      let scale: number;
      if (fill) {
        // Use cover behavior to fill screen
        scale = fitMax;
      } else {
        scale = fitMin * 0.75;
        if (deviceType === "tab" || deviceType === "tablet") {
          scale = fitMin * 0.95; // larger for tablets
        }
      }
      phoneImg.set({
        originX: "center",
        originY: "center",
        left: selectedCanvas.width! / 2,
        top: selectedCanvas.height! / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: true,
        hasControls: true,
        // lockScalingX: true,
        // lockScalingY: true,
        // lockMovementX: true,
        // lockMovementY: true,
        hasBorders: true,
      });

      addDeleteControl(phoneImg, () => {
        deleteCanvasObject(phoneImg);
      });

      selectedCanvas.add(phoneImg);
      selectedCanvas.setActiveObject(phoneImg);
      selectedCanvas.requestRenderAll();
    },
    // Update a specific canvas item's dimensions and apply to the Fabric canvas if present
    setCanvasItemSize: (id: string, width: number, height: number) => {
      const { canvasItems, sortedCanvasItems } = get();
      const updatedCanvasItems = canvasItems.map((item) =>
        item.id === id ? { ...item, width, height } : item
      );
      const updatedSorted = sortedCanvasItems.map((item) =>
        item.id === id ? { ...item, width, height } : item
      );

      // Update any live Fabric canvas size
      updatedCanvasItems.forEach((item) => {
        if (item.canvas && (item.width || item.height)) {
          try {
            if (typeof item.width === "number")
              item.canvas.setWidth(item.width);
            if (typeof item.height === "number")
              item.canvas.setHeight(item.height);
            item.canvas.requestRenderAll();
          } catch (e) {
            // ignore if canvas disposed
          }
        }
      });

      set({
        canvasItems: updatedCanvasItems,
        sortedCanvasItems: updatedSorted,
      });
    },
    deleteCanvasObject: (object: FabricObject) => {
      const { selectedCanvas } = get();
      if (!selectedCanvas) return;
      if (selectedCanvas && object) {
        selectedCanvas.remove(object);
        selectedCanvas.requestRenderAll();
      }
    },
  })
);
