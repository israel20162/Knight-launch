import React, { createContext, useContext, useState } from "react";
import { type DeviceType } from '../types/index';
import { Phone } from "lucide-react";

interface AppContextType {
  currentFrameScreenWidth: number;
  currentFrameScreenHeight: number;
  updateScreenWidth: (newVal: number) => void;
  updateScreenHeight: (newVal: number) => void;
 device: DeviceType;
 updateDevice:(device:DeviceType)=>void
}
export const AppContext = createContext<AppContextType>({
  currentFrameScreenWidth: 0,
  currentFrameScreenHeight: 0,
  updateScreenWidth: () => {},
  updateScreenHeight: () => {},
  device:{
    name: "",
    type: "iphone",
    width: 0,
    height: 0,
    imageUrl: "",
    icon: Phone,
    category: "mobile",
  },
  updateDevice:()=>{}
});

// context/MyContext.tsx (continued)
export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentFrameScreenWidth, setCurrentFrameScreenWidth] =
    useState<number>(0);
  const [currentFrameScreenHeight, setCurrentFrameScreenHeight] =
    useState<number>(0);
    const [device, setDevice] = useState<DeviceType>({
      name: "",
      type: "iphone",
      width: 0,
      height: 0,
      imageUrl: "",
      icon: Phone,
      category: "mobile",
    });

  const updateScreenWidth = (newVal: number) => {
    setCurrentFrameScreenWidth(newVal);
  };
  const updateScreenHeight = (newVal: number) => {
    setCurrentFrameScreenHeight(newVal);
  };
  const updateDevice = (device:DeviceType)=>{
    setDevice(device)
  }

  return (
    <AppContext.Provider
      value={{
        currentFrameScreenWidth,
        currentFrameScreenHeight,
        updateScreenWidth,
        updateScreenHeight,
        device,
        updateDevice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
};
