import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import type { DeviceType } from "../../../types";
import { useAppContext } from "../../../context/AppContext";
import { devices } from "../utils/devices";
interface DeviceSelectorProps {
  onDeviceSelect?: (device: string) => void;
  selectedDevice?: string | null;
}

export const DeviceSelector = ({
  onDeviceSelect,
}: //   selectedDevice,
DeviceSelectorProps) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(devices[0]);
  // saves current device to global context
  const { updateDevice } = useAppContext();

  const toggleCategory = (category: string) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };
  const categories = Array.from(new Set(devices.map((d) => d.category)));
  useEffect(() => {
    updateDevice(selectedDevice);
    return () => {};
  }, [selectedDevice]);
  return (
    <div className="p-1 no-scrollbar">
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category} className=" border border-gray-200 rounded">
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
                      <button
                        key={device.id}
                        onClick={() => {
                          onDeviceSelect?.(device.imageUrl);
                          setSelectedDevice(device);
                          updateDevice(device);
                        }}
                        className={`flex items-start gap-3 w-full p-2 rounded border transition-all text-left ${
                          selectedDevice?.id === device.id
                            ? "bg-blue-50 border-blue-400"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <Icon className="w-5 h-5 mt-1" />
                        <div>
                          <div className="flex items-center gap-">
                            <span className="font-medium capitalize text-sm  text-ellipsis">
                              {device.name}
                            </span>
                            {device.popular && (
                              <span className="bg-blue-100 text-blue-700 text-[10px] ml-1  py-0.5 rounded">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {device.dimensions}
                          </p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        ))}

        <p className="text-sm text-gray-500 text-center pt-4">
          More device frames coming soon!
        </p>
      </div>
    </div>
  );
};
