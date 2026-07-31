import {DaggerImage} from "@/domain/data";
import React, {useState} from "react";
import {
  ControlButtonFilled, ControlButtonRegular,
  KeyboardShiftFilled, KeyboardShiftRegular,
  ZoomInRegular,
  ZoomOutRegular
} from "@fluentui/react-icons";
import {ImageCard} from "@/app/component/ui/ImageCard";
import {FilterTagView} from "@/app/component/ui/FilterTagView";

export interface ProjectFileProps {
  handleOpenImage: (daggerImage: DaggerImage | null) => void
  selectedImages: DaggerImage[]
  currentImages: DaggerImage[]
  searchTags: string[]
  ignoreTags: string[]
  handleRemoveTagFromFilter: (tag: string) => void

  shiftMode: boolean
  ctrlMode: boolean
  setShiftMode: (bool: boolean) => void
  setCtrlMode: (bool: boolean) => void

  images: DaggerImage[]
}

export default function ProjectFile(props: ProjectFileProps) {
  const [size, setSize] = useState(256)

  const imageCards = props.images.map((i, n) => {
    const shouldShow = props.currentImages.some(c => c.fileName === i.fileName)

    return (
      <ImageCard
        img={i}
        isCurrent={props.selectedImages.some(c => c.fileName === i.fileName)}
        handler={props.handleOpenImage}
        key={i.realPath + n}
        visible={shouldShow}
        size={size}
      />
    )
  })

  return (
    <div className="flex flex-col h-full select-none w-auto overflow-hidden">
      <div className="flex justify-between h-[50px] border-b border-neutral-950">
        <div className="flex ml-3 pr-3 w-auto items-center text-2xl">
          <div onClick={() => props.setShiftMode(!props.shiftMode)}
               className="flex items-center justify-center w-8 p-1.5 h-8 rounded hover:bg-neutral-800">
            {props.shiftMode ? <KeyboardShiftFilled/> : <KeyboardShiftRegular/>}
          </div>
          <div onClick={() => props.setCtrlMode(!props.ctrlMode)}
               className="flex items-center justify-center w-10 p-1.5 h-8 rounded ml-0.5 hover:bg-neutral-800">
            {props.ctrlMode ? <ControlButtonFilled/> : <ControlButtonRegular/>}
          </div>
          <div
            className="flex min-w-[512px] max-w-[1024px] h-[34px] m-[8px]  rounded overflow-x-auto overflow-y-hidden">
            <FilterTagView handleRemoveTagFromFilter={props.handleRemoveTagFromFilter} tags={props.searchTags}
                           color="blue" join="and"/>
            <FilterTagView handleRemoveTagFromFilter={props.handleRemoveTagFromFilter} tags={props.ignoreTags}
                           color="red" join="or"/>
          </div>
        </div>
        <div className={"flex justify-end pb-3 pt-3 pr-3 text-2xl"}>
          <ZoomOutRegular/>
          <input type="range" className="h-[24px] ml-3 mr-3 w-[128px]" min={128} max={512} step={64} value={size}
                 onChange={(v) => setSize(Number(v.target.value))}/>
          <ZoomInRegular/>
        </div>
      </div>
      <div className="flex flex-wrap h-full p-5 pt-0 gap-3 overflow-y-auto"
           onMouseDown={() => props.handleOpenImage(null)}>
        {imageCards}
      </div>
    </div>
  )
}


