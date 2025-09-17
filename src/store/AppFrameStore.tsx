import { create } from "zustand";
import type { DeviceType } from "../types";
import { Phone } from "lucide-react";

interface AppFrameState {
  currentFrameScreenWidth: number;
  currentFrameScreenHeight: number;
  device: DeviceType;
}
interface AppFrameActions {
  updateScreenWidth: (newVal: number) => void;
  updateScreenHeight: (newVal: number) => void;
  updateDevice: (device: DeviceType) => void;
}

export const useAppFrameStore = create<AppFrameState & AppFrameActions>(
  (set) => ({
    currentFrameScreenWidth: 0,
    currentFrameScreenHeight: 0,
    device: {
      name: "",
      type: "iphone",
      width: 0,
      height: 0,
      imageUrl: "",
      icon: Phone,
      category: "mobile",
    },
    updateScreenWidth: (newVal: number) => {
      set({ currentFrameScreenWidth: newVal });
    },
    updateScreenHeight: (newVal: number) => {
      set({ currentFrameScreenHeight: newVal });
    },
    updateDevice: (device: DeviceType) => {
      set({ device });
    },
  })
);
