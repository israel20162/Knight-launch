import { useEffect, useState, useRef } from "react";
import type { DeviceType } from "../../../types";
import { devices } from "../utils/devices";
import { ChevronDown, Layers } from "lucide-react";
interface DeviceSelectorProps {
  // onDeviceSelect?: (device: string) => void;
  // selectedDevice?: string | null;
}
import { Tooltip } from "../../../components/ui/tooltip";
import { useAppFrameStore } from "../../../store/AppFrameStore";
import { useCanvasStore } from "../../../store/CanvasStore";

export const DeviceSelector = ({}: // onDeviceSelect,
// selectedDevice,
//   selectedDevice,
DeviceSelectorProps) => {
  const [openCategory, setOpenCategory] = useState<string | null>("Phon");
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(devices[0]);
  // saves current device to global context
  const updateDevice = useAppFrameStore((s) => s.updateDevice);
  const addFrame = useCanvasStore((s) => s.addFrame);
  const applyFramesToAllCanvases = useCanvasStore(
    (s) => s.applyFramesToAllCanvases
  );
  // local uploaded frames (object URLs)
  const [uploads, setUploads] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const selectedDevice = useAppFrameStore((s) => s.device);
  // toggle category open/close
  const toggleCategory = (category: string) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };
  const categories = Array.from(new Set(devices.map((d) => d.category)));
  useEffect(() => {
    updateDevice(selectedDevice);
    return () => {};
  }, [selectedDevice]);
  return (
    // 👈 add Layers (or another icon you like)

    <div className="no-scrollbar min-w-full">
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category} className="border border-gray-200 rounded">
            <button
              className="w-full flex justify-between items-center px-4 py-3 text-sm font-medium"
              onClick={() => toggleCategory(category)}
            >
              <span>{category}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openCategory === category ? "rotate-180" : ""
                }`}
              />
            </button>

            {openCategory === category && (
              <div className="p-2 space-y-2">
                {devices
                  .filter((d) => d.category === category)
                  .map((device) => {
                    const Icon = device.icon;
                    return (
                      <div
                        key={device.id}
                        className={`flex items-center justify-between gap-2 p-2 rounded border transition-all ${
                          selectedDevice?.id === device.id
                            ? "bg-blue-50 border-blue-400"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        {/* Select single canvas */}
                        <button
                          onClick={() => {
                            setSelectedDevice(device);
                            // pass device type so canvas store can handle tablets differently
                            addFrame(device.imageUrl, device.type);
                            updateDevice(device);
                          }}
                          className="flex items-start gap-3 text-left flex-1"
                        >
                          <Icon className="w-5 h-5 mt-1" />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium capitalize text-sm text-ellipsis">
                                {device.name}
                              </span>
                              {device.popular && (
                                <span className="bg-blue-100 text-blue-700 text-[10px] ml-1 py-0.5 rounded">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {device.dimensions}
                            </p>
                          </div>
                        </button>

                        {/* Apply to ALL canvases (icon button) */}
                        <button
                          onClick={() => {
                            // pass device type so applying to all canvases can adjust for tabs
                            applyFramesToAllCanvases(
                              device.imageUrl,
                              device.type
                            );
                            setSelectedDevice(device);
                            updateDevice(device);
                          }}
                          className="p-1 rounded hover:bg-blue-100"
                          title="Apply to all canvases"
                        >
                          <Tooltip text="Apply to all canvases">
                            <Layers className="w-4 h-4 text-blue-600" />
                          </Tooltip>
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ))}

        <p className="text-sm text-gray-500 text-center pt-4">
          More device frames coming soon!
        </p>
        {/* Upload custom frames */}
        <div className="mt-4 border border-gray-200 rounded p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Custom frames</span>
            <div>
              <input
                id="frame-upload"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const url = URL.createObjectURL(f);
                  setUploads((u) => [url, ...u]);
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 bg-slate-100 rounded text-sm"
              >
                Upload frame
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-auto p-1">
            {uploads.length === 0 && (
              <div className="text-xs text-gray-400">No custom frames yet</div>
            )}
            {uploads.map((u) => (
              <div
                key={u}
                className="w-16 h-24 border rounded overflow-hidden p-1 cursor-pointer flex-shrink-0"
                onClick={() => {
                  addFrame(u);
                }}
                title="Click to add to selected canvas"
              >
                <img
                  src={u}
                  alt="frame"
                  className="w-full h-full object-contain"
                />
                <div className="flex justify-center mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applyFramesToAllCanvases(u);
                    }}
                    className="text-xs text-blue-600"
                  >
                    Apply to all
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
