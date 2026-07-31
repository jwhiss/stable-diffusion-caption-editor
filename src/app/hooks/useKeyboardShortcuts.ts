import { useEffect } from "react";
import { DaggerImage } from "@/domain/data";

interface UseKeyboardShortcutsProps {
  lastClickedImage: DaggerImage | null;
  setLastClickedImage: (img: DaggerImage | null) => void;
  selectedImages: DaggerImage[];
  setSelectedImages: (images: DaggerImage[]) => void;
  currentImages: DaggerImage[];
  shiftMode: boolean;
  setShiftMode: (mode: boolean) => void;
  ctrlMode: boolean;
  setCtrlMode: (mode: boolean) => void;
  handleDeleteImageFromProject: (images: DaggerImage[]) => void;
}

export function useKeyboardShortcuts({
  lastClickedImage,
  setLastClickedImage,
  selectedImages,
  setSelectedImages,
  currentImages,
  shiftMode,
  setShiftMode,
  ctrlMode,
  setCtrlMode,
  handleDeleteImageFromProject,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Shift") {
        if (!lastClickedImage && selectedImages.length > 0) {
          setLastClickedImage(selectedImages[selectedImages.length - 1]);
        }
        setShiftMode(true);
      }
      if (e.key === "Control") {
        setCtrlMode(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedImages(currentImages);
      }
      if (e.key === "Delete") {
        handleDeleteImageFromProject(selectedImages);
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "Shift") {
        setShiftMode(false);
      }
      if (e.key === "Control") {
        setCtrlMode(false);
      }
    }

    document.onkeyup = handleKeyUp;
    document.onkeydown = handleKeyDown;

    return () => {
      document.onkeyup = null;
      document.onkeydown = null;
    };
  }, [
    shiftMode,
    ctrlMode,
    selectedImages,
    currentImages,
    lastClickedImage,
    setLastClickedImage,
    setShiftMode,
    setCtrlMode,
    setSelectedImages,
    handleDeleteImageFromProject,
  ]);
}
