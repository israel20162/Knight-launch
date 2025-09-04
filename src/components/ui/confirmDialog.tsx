import { Button } from "@radix-ui/themes";
import React, { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  message = "Are you sure?",
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        ref={dialogRef}
        className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full"
      >
        <p className="text-gray-800">{message}</p>
        <div className="flex gap-4 mt-4 justify-end">
          <Button
            onClick={onCancel}
            className="!bg-gray-300 !text-black !cursor-pointer px-4 py-2 rounded-lg !hover:bg-gray-400"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="!bg-red-500 text-white !cursor-pointer px-4 py-2 rounded-lg !hover:bg-red-600"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
