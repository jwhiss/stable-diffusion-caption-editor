"use client"

import { open } from '@tauri-apps/api/dialog';
import ProjectFile from "@/app/component/project";
import ImageViewArea from "@/app/component/view";
import ToolBar from "@/app/component/tool";
import { DaggerImage, Tag, TagStatistics } from "@/domain/data";
import 'react-image-crop/dist/ReactCrop.css';
import TagView from "@/app/component/tag";
import { useCallback, useEffect, useState } from "react";
import {
  findCaptionFileByImageName,
  isCaptionFile,
  isImageFile,
  readImageWithCaptionFiles
} from "@/util/util";
import { downloadAsZip } from "@/util/zip";
import Split from "react-split";
import CropViewArea from "@/app/component/crop";
import { useDropzone } from "react-dropzone";
import { useKeyboardShortcuts } from "@/app/hooks/useKeyboardShortcuts";
import { useTagFilters } from "@/app/hooks/useTagFilters";
import { useProjectState } from "@/app/hooks/useProjectState";
import { saveImages } from "@/util/fileSystem";

export default function Home() {
  const {
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
  } = useProjectState();

  const [currentImages, setCurrentImages] = useState<DaggerImage[]>([])
  const [shiftMode, setShiftMode] = useState(false)
  const [ctrlMode, setCtrlMode] = useState(false)
  const [taggingMode, setTaggingMode] = useState(false)
  const [taggingTags, setTaggingTags] = useState<string[]>([])
  const { searchTags, setSearchTags, ignoreTags, setIgnoreTags } = useTagFilters({
    projectImages,
    setCurrentImages,
    setSelectedImages,
  })
  const [layoutMode, setLayoutMode] = useState<'view' | 'edit'>('view')


  const enableTagCloud = true

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', (event) => {
        if (changed) {
          event.preventDefault();
          event.returnValue = '';
        }
      })
      window.addEventListener('blur', () => {
        setCtrlMode(false)
        setShiftMode(false)
      })
    }
  }, [changed]);




  useKeyboardShortcuts({
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
  });


  function handleOpenDirectory() {
    // @ts-ignore
    if (window.__TAURI_IPC__) {
      open({ multiple: true, directory: false })
        .then(str => {
          if (!str) return
          if (Array.isArray(str)) {
            readImageWithCaptionFiles(str).then(imageList => {
              setProjectImages(imageList)
            })
          }
        })
    } else {
      directoryOpen()
        .then(async (files) => {
          handleFileOpen(files)
        })
    }
  }

  async function handleFileOpen(files: File[]) {
    const imageFiles = files.filter(f => isImageFile(f.name))
    const captionFiles = files.filter(f => isCaptionFile(f.name))
    const isFileNameConflict = projectImages.filter(image => imageFiles.some(f => f.name === image.fileName))
    if (isFileNameConflict.length !== 0) {
      if (!confirm("Same file name exists in the project. Are you sure to overwrite?")) {
        return
      } else {
        setProjectImages(projectImages.filter(image => !isFileNameConflict.includes(image)))
      }
    }

    const daggerImages: DaggerImage[] = []
    for (const imageFile of imageFiles) {
      const captionFile = findCaptionFileByImageName(imageFile.name, captionFiles)
      let caption = ""
      if (captionFile) {
        caption = await readFileAsText(captionFile)
      }

      daggerImages.push(DaggerImage.createWithBlob(imageFile, imageFile.name, caption))
    }

    setProjectImages(prev => [...prev, ...daggerImages])
  }


  function handleOpenImageWrapped(image: DaggerImage | null) {
    handleOpenImage(image, shiftMode, ctrlMode, currentImages);
  }

  function handleTagSelect(tag: TagStatistics | null) {
    if (tag === null) {
      setSearchTags([])
      setIgnoreTags([])
      return
    }
    const isSearchTag = searchTags.find(t => t === tag.value())
    const isIgnoreTag = ignoreTags.find(t => t === tag.value())

    if (isIgnoreTag) {
      setIgnoreTags(ignoreTags.filter(t => t !== tag.value()))
      return
    }

    if (isSearchTag) {
      setSearchTags(searchTags.filter(t => t !== tag.value()))
      return
    }

    if (ctrlMode) {
      if (shiftMode) {
        setIgnoreTags([tag.value()])
      } else {
        setIgnoreTags([...ignoreTags, tag.value()])
      }
      return
    }

    if (shiftMode) {
      setSearchTags([tag.value()])
    } else {
      setSearchTags([...searchTags, tag.value()])
    }

    return
  }

  function handleRemoveTagFromFilter(tag: string) {
    const isSearchTag = searchTags.find(t => t === tag)
    const isIgnoreTag = ignoreTags.find(t => t === tag)

    if (isSearchTag) {
      setSearchTags(searchTags.filter(t => t !== tag))
    } else if (isIgnoreTag) {
      setIgnoreTags(ignoreTags.filter(t => t !== tag))
    }
  }



  function handleToggleTaggingMode(bool: boolean) {
    setTaggingMode(bool)
    // toggleFilterMode(!bool)
  }

  function handleToggleTaggingTags(tag: TagStatistics) {
    if (taggingTags.includes(tag.value())) {
      setTaggingTags(taggingTags.filter(t => t !== tag.value()))
    } else {
      setTaggingTags([...taggingTags, tag.value()])
    }
  }

  async function handleFileSave() {
    // @ts-ignore
    const useTauri = !!window.__TAURI_IPC__;
    const targets = selectedImages.length === 0 ? projectImages : selectedImages;
    await saveImages(targets, useTauri, () => setChanged(false));
  }





  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFileOpen(acceptedFiles)
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, noClick: true });

  const overlayBaseCls = "flex justify-center items-center absolute h-screen w-screen bg-neutral-900 bg-opacity-70 z-10 p-10"
  return (
    <main className="flex font-mono h-screen min-w-screer text-neutral-50 select-none">
      <div
        className={overlayBaseCls + (loaded !== projectImages.length ? "" : " hidden")}>
        <div className="flex flex-col w-2/5 h-24 p-6 pt-5 rounded bg-neutral-800">
          <p>{loaded} / {projectImages.length}</p>
          <progress className="w-full h-3 rounded-full mt-2" max={projectImages.length} value={loaded}></progress>
        </div>
      </div>

      <div className={overlayBaseCls + (inCropMode ? "" : " hidden")}>
        {
          inCropMode &&
          <CropViewArea
            daggerImage={inCropMode}
            handleCancelCrop={() => setInCropMode(null)}
            handleSaveCrop={handleSaveCrop}
          />
        }
      </div>

      <div className="flex min-h-screen flex-col w-[48px] p-1 bg-neutral-800 border-neutral-950 border-r">
        <ToolBar handleOpenDirectory={handleOpenDirectory} handleSave={handleFileSave} layoutMode={layoutMode} setLayoutMode={setLayoutMode} handleClearAllImages={handleClearAllImages}></ToolBar>
      </div>

      <Split
        className={"flex min-h-screen bg-neutral-900 w-full"}
        direction={"horizontal"}
        sizes={[80, 20]}
        gutter={() => {
          const gutter = document.createElement("div")
          gutter.className = "h-full w-2 border-l border-neutral-900 bg-neutral-800 cursor-col-resize"
          return gutter
        }}
        gutterStyle={() => ({})}
      >
        <ul>
          <Split
            className={"flex h-screen flex-col bg-neutral-900 w-full border-r border-neutral-950 overflow-x-hidden overflow-y-hidden"}
            direction={"vertical"}
            sizes={[75, 35]}
            gutter={() => {
              const gutter = document.createElement("div")
              gutter.className = "w-full h-2 border-b border-neutral-950 cursor-row-resize"
              return gutter
            }}
            gutterStyle={() => ({})}
          >
            <ul className="overflow-y-auto overflow-x-hidden" {...getRootProps()}>
              <input {...getInputProps()} />
              <ProjectFile handleOpenImage={handleOpenImageWrapped}
                selectedImages={selectedImages}
                currentImages={currentImages}
                images={projectImages}
                searchTags={searchTags}
                ignoreTags={ignoreTags}
                shiftMode={shiftMode}
                ctrlMode={ctrlMode}
                setCtrlMode={setCtrlMode}
                setShiftMode={setShiftMode}
                handleRemoveTagFromFilter={handleRemoveTagFromFilter}
              />
            </ul>
            <ul className="flex overflow-hidden">
              <TagView tagStatistics={projectTags}
                toggleFilterMode={() => setTaggingMode(false)}
                handleToggleTaggingTags={handleToggleTaggingTags}
                searchTags={searchTags}
                ignoreTags={ignoreTags}
                ctrlMode={ctrlMode}
                handleTagSelect={handleTagSelect}
                toggleTaggingMode={handleToggleTaggingMode}
                isTaggingMode={taggingMode}
                taggingTags={taggingTags}
                handleDeleteTagFromProject={handleDeleteTagFromProject}
                layoutMode={layoutMode}
                selectedImages={selectedImages}
                handleAddTagToSelectedImages={handleAddTagToImage(selectedImages)}
                handleRemoveTagFromSelectedImages={(t) => handleDeleteTagFromImage(selectedImages)(t.getTag())}
              />
            </ul>
          </Split>
        </ul>
        <ul>
          <div className="flex h-screen w-full flex-col bg-neutral-800 overflow-hidden">
            <ImageViewArea daggerImages={selectedImages}
              handleDeleteTagFromImage={handleDeleteTagFromImage}
              handleAddTagToImage={handleAddTagToImage}
              setInCropMode={(img) => setInCropMode(img)}
              handleDeleteImageFromProject={handleDeleteImageFromProject}
            />
          </div>
        </ul>
      </Split>
    </main>
  )
}

function directoryOpen(): Promise<File[]> {
  return new Promise((resolve) => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.multiple = true;

    inputElement.addEventListener('change', () => {
      if (!inputElement.files) {
        resolve([])
        return
      }

      let files: File[] = []
      for (let i = 0; i < inputElement.files.length; i++) {
        const file = inputElement.files[i];
        files.push(file)
      }

      resolve(files)
    });

    inputElement.click();
  })
}

async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => resolve(event.target!.result as string);
    reader.onerror = error => reject(error);

    reader.readAsText(file);
  });
}