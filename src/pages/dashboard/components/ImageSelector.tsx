import React, { useState, useEffect, type ChangeEvent, useRef } from "react";
import { FabricImage, type Canvas, Rect, Group } from "fabric";
import { X } from "lucide-react";
import { Upload } from "lucide-react";
import { addDeleteControl } from "../utils/functions";
import { useAppFrameStore } from "../../../store/AppFrameStore";
import { useCanvasStore } from "../../../store/CanvasStore";
import { Tooltip } from "../../../components/ui/tooltip";
import { toast } from "sonner";

interface ImageSelectorProps {
  selectedCanvasId: string;
  selectedCanvas: Canvas | undefined;
}
export const ImageSelector: React.FC<ImageSelectorProps> = ({
  selectedCanvas,
  // selectedCanvasId,
}) => {
  const [images, setImages] = useState<string[]>([]);

  const fileSizeLimit = 1024 * 1024 * 5; // 5MB in bytes

  const { device } = useAppFrameStore();
  const { deleteCanvasObject } = useCanvasStore();

  // Load images from localStorage on component mount
  useEffect(() => {
    // console.log(device);
    const storedImages = localStorage.getItem("storedImages");
    if (storedImages) {
      try {
        const parsedImages: string[] = JSON.parse(storedImages);
        setImages(parsedImages);
      } catch (error) {
        console.error("Failed to parse stored images:", error);
      }
    }
  }, []);

  // Handle image removal
  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    localStorage.setItem("storedImages", JSON.stringify(newImages));
  };
  function upscaleImage(
    imageURL: string,
    minWidth: number,
    minHeight: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Enable CORS if needed
      img.onload = () => {
        const { width, height } = img;
        if (width >= minWidth && height >= minHeight) {
          // No upscaling needed
          resolve(imageURL);
          return;
        }

        // Calculate scaling factor
        // const scaleX = minWidth / width;
        // const scaleY = minHeight / height;
        // const scale = Math.max(scaleX, scaleY);

        const canvas = document.createElement("canvas");
        canvas.width = minWidth;
        canvas.height = minHeight;
        // canvas.width = Math.round(width * scale);
        // canvas.height = Math.round(height * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const upscaledDataURL = canvas.toDataURL("image/png");
        resolve(upscaledDataURL);
      };
      img.onerror = reject;
      img.src = imageURL;
    });
  }

  async function addNewImageToActiveFrame(
    imageURL: string,
    screenWidth: number = device.width,
    screenHeight: number = device.height
    // screenOffsetX: number = 0,
    // screenOffsetY: number = 0
  ): Promise<void> {
    if (!selectedCanvas) {
      toast.info("Please select a canvas first.");
      return;
    }
    const frame = selectedCanvas.getActiveObject();

    if (!frame || !(frame instanceof FabricImage)) {
      toast.info("Please select a phone frame  first.");
      return;
    }
    const upscaledImageURL = await upscaleImage(
      imageURL,
      screenWidth,
      screenHeight
    );
    // console.log(upscaledImageURL, selectedCanvasId);
    const innerImg = await FabricImage.fromURL(upscaledImageURL, {
      crossOrigin: "anonymous",
    });
   

    const imageWidth = innerImg.width || 0;
    const imageHeight = innerImg.height || 0;

    let scale: number = 0;

    const frameScaleX = frame.scaleX || 1;
    const frameScaleY = frame.scaleY || 1;

    let devicetype = device.type;

    switch (devicetype) {
      case "tab":
        scale = Math.max(
          (screenWidth * frameScaleX) / imageWidth,
          (screenHeight * frameScaleY) / imageHeight
        );
        break;
      default:
        scale = Math.min(
          (screenWidth * frameScaleX) / imageWidth,
          (screenHeight * frameScaleY) / imageHeight
        );
        break;
    }

    innerImg.set({
      originX: "center",
      originY: "center",
      scaleX: scale * 1.025,
      scaleY: scale * 1.015,
      left: frame.left,
      top: frame.top,
      angle: frame.angle,
      selectable: false,
      absolutePositioned: true,
    });

    const clipRect = new Rect({
      originX: "center",
      originY: "center",
      width: innerImg.width,
      height: innerImg.height,
      // scaleX: innerImg.scaleX,
      // scaleY: innerImg.scaleY,
      // angle: frame.angle,
      absolutePositioned: true,
      rx: device.rx,
      ry: device.ry,
      left: frame.left,
      top: frame.top,
    });
    innerImg.clipPath = clipRect;

    const clonedFrame = await frame.clone();
    selectedCanvas.remove(frame);
    const group = new Group([innerImg, clonedFrame], {
      originX: "center",
      originY: "center",
      left: frame.left,
      top: frame.top,
      selectable: true,
      // angle: frame.angle,
      // angle:fa,
      hasControls: true,
      hasBorders: false,
      // lockScalingX: true,
      // lockScalingY: true,
      // lockMovementX: true, // Disables horizontal movement
      // lockMovementY: true,
      // lockRotation: true,
    });
    // selectedCanvas.sendObjectToBack(innerImg);
    addDeleteControl(group, () => {
      deleteCanvasObject(group);
    }); // Add delete button to group
    selectedCanvas.add(group);
    selectedCanvas.setActiveObject(group);
    selectedCanvas.requestRenderAll();
  }
  // Handle image upload
  const ImageUploadInput: React.FC = () => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) {
        return;
      }
      if (event.target.files[0].size > fileSizeLimit) {
        // 5mb in bytes
        toast.info("File is too big!");
        event.target.value = "";
        return;
      }
      if (images.length >= 5) {
        toast.info("Can only upload 5 images!");
        event.target.value = "";
        return;
      }
      const file = event.target?.files[0];

      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const newImages = [...images, base64String];
          setPreview(reader.result as string);
          setImages(newImages);
          localStorage.setItem("storedImages", JSON.stringify(newImages));
        };
        reader.readAsDataURL(file);
        event.target.value = "";
      } else {
        setPreview(null);
      }
    };

    const handleButtonClick = () => {
      fileInputRef.current?.click();
    };

    return (
      <div className="flex flex-col items-center space-y-4 max-w-full h-full">
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-48 h-48 object-cover rounded-md shadow"
          />
        )}

        <button
          type="button"
          onClick={handleButtonClick}
          className="flex items-center cursor-pointer px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Image
        </button>
        <label className="text-xs text-gray-500 font-bold p-0" htmlFor="">
          max file size :1MB max images: 5
        </label>
        <input
          type="file"
          // max={24}
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* <h1 className=" font-bold mb-4">Image Uploader</h1> */}

      <ImageUploadInput />
      <div className="grid grid-cols-2  gap-4">
        {images.map((src, index) => (
          <div key={index} className="relative">
            <img
              src={src}
              onClick={() => addNewImageToActiveFrame(src)}
              alt={`Uploaded ${index}`}
              className="w-48 cursor-pointer h-48 object-cover rounded shadow"
            />
            <Tooltip text="Delete Image">
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 text-xs bg-red-400 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X width={12} height={12} />
                {/* &times; */}
              </button>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
};
