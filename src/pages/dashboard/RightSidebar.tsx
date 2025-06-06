import { Layout, ImageIcon } from "lucide-react";
import { useState } from "react";
import { TextEditor } from "./components/TextEditor";
import { BackgroundEditor } from "./components/BackgroundEditor";
import type { Canvas } from "fabric";

interface RightSidebarProps {
  //   addFrame: (imageUrl: string) => void;
  //   addCanvas: () => void;
  //   canvasItems: CanvasItem[];
  selectedCanvas: Canvas | undefined;
  //   setSelectedCanvas: (id: string) => void;
}

export default function RightSidebar({ selectedCanvas }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<"text" | "background">("text");
  return (
    <div className="max-h-screen overflow-x-clip overflow-y-auto no-scrollbar  w-full bg-white ">
      {/* Tabs */}
      <div className="flex w-full">
        <button
          onClick={() => setActiveTab("text")}
          className={`flex-1 whitespace-nowrap px-4  text-sm font-medium border-b-2 ${
            activeTab === "text"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          <Layout className="inline-block w-4 h-4 mr-1" />
          Text
        </button>
        <button
          onClick={() => setActiveTab("background")}
          className={`flex-1 whitespace-nowrap px-4  text-sm font-medium border-b-2 ${
            activeTab === "background"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-blue-600"
          }`}
        >
          <ImageIcon className="inline-block w-4 h-4 mr-1" />
          Background
        </button>
      </div>
      {/* Tab Content */}
      <div className=" pb-10">
        <div className="w-full max-w-55 overflow-x-clip p-2 no-scrollbar">
          {activeTab === "background" && (
            <BackgroundEditor selectedCanvas={selectedCanvas} />
          )}
        </div>
        <div className="w-full overflow-x-clip p-2 no-scrollbar">
          {activeTab === "text" && (
            <TextEditor selectedCanvas={selectedCanvas} />
          )}
        </div>
      </div>
    </div>
  );
}
