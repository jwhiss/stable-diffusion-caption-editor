import { useState, useEffect } from "react";
import { DaggerImage, Tag, TagStatistics } from "@/domain/data";

export function useProjectState() {
  const [projectImages, setProjectImages] = useState<DaggerImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<DaggerImage[]>([]);
  const [projectTags, setProjectTags] = useState<TagStatistics[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [changed, setChanged] = useState(false);
  const [lastClickedImage, setLastClickedImage] = useState<DaggerImage | null>(null);
  const [lastLoadedImage, setLastLoadedImage] = useState<DaggerImage | null>(null);
  const [inCropMode, setInCropMode] = useState<DaggerImage | null>(null);

  // Background loading of images
  useEffect(() => {
    const loadingImages = projectImages.filter((image) => !image.isLoaded);
    const loadedImage = projectImages.filter((image) => image.isLoaded);

    for (const image of loadingImages) {
      if (!image.isLoaded) {
        image.asyncLoad().then(() => {
          setLastLoadedImage(image);
        });
      }
    }

    setLoaded(loadedImage.length);
  }, [loaded, projectImages, lastLoadedImage]);

  // Tag cloud generation
  useEffect(() => {
    if (projectImages.length === 0) {
      setProjectTags([]);
    }

    if (loaded !== projectImages.length) {
      return;
    }

    const nextTags: TagStatistics[] = [];
    for (const image of projectImages) {
      if (!image.isLoaded) {
        continue;
      }
      for (const tag of image.caption.asTag()) {
        const tagStat = nextTags.find((t) => t.value() === tag.value());
        if (tagStat) {
          tagStat.increment();
        } else {
          nextTags.push(new TagStatistics(tag, 1));
        }
      }
    }

    nextTags.sort((a, b) => b.count() - a.count());
    setProjectTags(nextTags);
  }, [loaded, projectImages]);

  function handleDeleteImageFromProject(images: DaggerImage[]) {
    if (images.length > 1 && !confirm(`Remove ${images.length} images from project?`)) return;
    setProjectImages((prev) => {
      return prev.filter((i) => images.find((img) => img.id === i.id) === undefined);
    });
    setLoaded((prevLoaded) => prevLoaded - images.length);
    setSelectedImages([]);
    setChanged(true);
  }

  function handleClearAllImages() {
    if (projectImages.length === 0) return;
    if (!confirm(`Are you sure you want to clear all ${projectImages.length} images?`)) return;
    setProjectImages([]);
    setLoaded(0);
    setSelectedImages([]);
    setProjectTags([]);
    setLastClickedImage(null);
    setChanged(false);
  }

  function handleSaveCrop(image: DaggerImage, from: DaggerImage, asNew: boolean) {
    setInCropMode(null);
    setChanged(true);

    if (asNew) {
      setProjectImages((prev) => {
        const newImages = [...prev];
        const index = newImages.findIndex((i) => i.fileName === from.fileName);
        newImages.splice(index + 1, 0, image);
        return newImages;
      });
    } else {
      setProjectImages((prev) => {
        const newImages = [...prev];
        const index = prev.findIndex((i) => i.fileName === from.fileName);
        newImages[index] = image;
        return newImages;
      });
      setLoaded((prev) => prev - 1);
    }
    setSelectedImages([image]);
  }

  function handleDeleteTagFromProject(tag: TagStatistics) {
    if (tag.count() >= 2) {
      if (!confirm(`Delete tag "${tag.value()}" from ${tag.count()} images?`)) {
        return;
      }
    }
    setProjectImages((prev) => {
      return prev.map((i) => {
        i.caption.deleteTag(tag.getTag());
        return i;
      });
    });
    setChanged(true);
  }

  function handleDeleteTagFromImage(images: DaggerImage[]) {
    return (tag: Tag) => {
      setProjectImages((prev) => {
        return prev.map((i) => {
          if (images.find((img) => img === i)) {
            i.caption.deleteTag(tag);
          }
          return i;
        });
      });
      setChanged(true);
    };
  }

  function handleAddTagToImage(images: DaggerImage[]) {
    return (tag: string) => {
      for (const image of images) {
        image.caption.addTag(tag);
      }
      setProjectImages((prev) => [...prev]);
      setChanged(true);
    };
  }

  function handleOpenImage(
    image: DaggerImage | null,
    shiftMode: boolean,
    ctrlMode: boolean,
    currentImages: DaggerImage[]
  ) {
    if ((shiftMode || ctrlMode) && !image) {
      return;
    }

    if (!image) {
      setSelectedImages([]);
      return;
    }

    if (ctrlMode) {
      if (selectedImages.find((i) => i === image)) {
        setSelectedImages(selectedImages.filter((i) => i !== image));
      } else {
        setSelectedImages([...selectedImages, image]);
      }
    } else {
      setSelectedImages([image]);
    }

    if (lastClickedImage && shiftMode) {
      const startIndex = projectImages.findIndex((i) => i === lastClickedImage);
      const endIndex = projectImages.findIndex((i) => i === image);
      const newCurrentImages = projectImages.slice(
        Math.min(startIndex, endIndex),
        Math.max(startIndex, endIndex) + 1
      );
      setSelectedImages(
        newCurrentImages.filter((i) => currentImages.find((s) => s === i))
      );
    } else {
      setLastClickedImage(image);
    }
  }

  return {
    projectImages,
    setProjectImages,
    selectedImages,
    setSelectedImages,
    projectTags,
    loaded,
    changed,
    setChanged,
    lastClickedImage,
    setLastClickedImage,
    inCropMode,
    setInCropMode,
    handleDeleteImageFromProject,
    handleClearAllImages,
    handleSaveCrop,
    handleDeleteTagFromProject,
    handleDeleteTagFromImage,
    handleAddTagToImage,
    handleOpenImage,
  };
}
