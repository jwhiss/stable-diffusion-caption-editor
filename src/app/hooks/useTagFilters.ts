import { useState, useEffect } from "react";
import { DaggerImage } from "@/domain/data";

interface UseTagFiltersProps {
  projectImages: DaggerImage[];
  setCurrentImages: (images: DaggerImage[]) => void;
  setSelectedImages: (images: DaggerImage[]) => void;
}

export function useTagFilters({
  projectImages,
  setCurrentImages,
  setSelectedImages,
}: UseTagFiltersProps) {
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [ignoreTags, setIgnoreTags] = useState<string[]>([]);

  useEffect(() => {
    const anySelectedTags = searchTags.length !== 0 || ignoreTags.length !== 0;
    if (!anySelectedTags) {
      setCurrentImages(projectImages);
      return;
    }

    const showImages: DaggerImage[] = [];
    for (const image of projectImages) {
      const isSearchTarget = searchTags.every((t) =>
        image.caption.asTag().find((tag) => tag.value() === t)
      );
      const isIgnoreTarget = ignoreTags.some((t) =>
        image.caption.asTag().find((tag) => tag.value() === t)
      );
      const shouldShow = isSearchTarget && !isIgnoreTarget;

      if (shouldShow) {
        showImages.push(image);
      }
    }
    setCurrentImages(showImages);
    if (showImages.length !== 0) {
      setSelectedImages([showImages[0]]);
    }
  }, [searchTags, ignoreTags, projectImages, setCurrentImages, setSelectedImages]);

  return {
    searchTags,
    setSearchTags,
    ignoreTags,
    setIgnoreTags,
  };
}
