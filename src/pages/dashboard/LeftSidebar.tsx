import { ChevronDown, Plus, Hash, ImageIcon, Layout } from "lucide-react";
import { useState } from "react";
import { DeviceSelector } from "./components/DeviceSelector";
import type { CanvasItem } from "../../types";
import { ImageSelector } from "./components/ImageSelector";
import type { Canvas } from "fabric";
import { Tooltip } from "../../components/ui/tooltip";
import { LayoutSelector } from "./components/LayoutSelector";
interface LeftSidebarProps {
  addFrame: (imageUrl: string) => void;
  addCanvas: () => void;
  canvasItems: CanvasItem[];
  selectedCanvas: Canvas | undefined;
  selectedCanvasId: string;
  setSelectedCanvas: (id: string) => void;
}

export default function LeftSidebar({
  addFrame,
  addCanvas,
  canvasItems,
  selectedCanvas,
  setSelectedCanvas,
  selectedCanvasId,
}: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<"editor" | "assets">("editor");
  const [openAccordion, setOpenAccordion] = useState<string | null>("devices");

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  return (
    <div className="max-h-screen overflow-y-auto no-scrollbar w-full bg-white">
      {/* Tabs */}
      <div className="flex w-full">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "editor"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          <Layout className="inline-block w-4 h-4 mr-1" />
          Editor
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`flex-1 px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === "assets"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          <ImageIcon className="inline-block w-4 h-4 mr-1" />
          Assets
        </button>
      </div>

      {/* Tab Content */}
      <div className="overflow-y-auto h-full p-2 no-scrollbar">
        {activeTab === "editor" && (
          <div className="space-y-4 divide-y divide-gray-200">
            {/* Devices Accordion */}
            <section>
              <button
                onClick={() => toggleAccordion("devices")}
                className="w-full flex justify-between items-center px-2 py-3 font-medium"
              >
                <span className="flex items-center gap-2">Device Frames</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openAccordion === "devices" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "devices" && (
                <div className="transition-all duration-200">
                  <DeviceSelector onDeviceSelect={addFrame} />
                </div>
              )}
            </section>
            {/* Layouts Accordion */}
            <section>
              <button
                onClick={() => toggleAccordion("layouts")}
                className="w-full flex justify-between items-center px-2 py-3 font-medium"
              >
                <span className="flex items-center gap-2">Layouts</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openAccordion === "layouts" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "layouts" && (
                <div className="transition-all duration-200">
                  <LayoutSelector selectedCanvas={selectedCanvas} />
                </div>
              )}
            </section>

            {/* Canvas Accordion */}
            <section>
              <div
                // onClick={() => toggleAccordion("canvases")}
                className="w-full flex justify-between items-center px-2 py-3 font-medium"
              >
                <span className="flex items-center gap-2">Canvases</span>
                <Tooltip text="Add Canvas">
                  <button onClick={() => addCanvas()}>
                    <Plus className="w-4 h-4" />
                  </button>
                </Tooltip>
              </div>

              <div className="flex flex-col px-2 gap-y-2">
                {canvasItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Hash
                      className={`w-4 h-4   ${
                        selectedCanvasId === item.id
                          ? " !text-blue-500"
                          : "text-gray-500"
                      }`}
                    />
                    <p
                      onClick={() => setSelectedCanvas(item.id)}
                      className={`cursor-pointer ${
                        selectedCanvasId === item.id
                          ? " text-blue-500"
                          : "text-gray-700"
                      }`}
                    >
                      {item.id}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "assets" && (
          <ImageSelector
            selectedCanvasId={selectedCanvasId}
            selectedCanvas={selectedCanvas}
          />
        )}
      </div>
    </div>
  );
}
