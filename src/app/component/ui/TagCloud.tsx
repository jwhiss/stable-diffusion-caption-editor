import {TagStatistics} from "@/domain/data";
import {DismissRegular} from "@fluentui/react-icons";
import React from "react";

export interface TagCloudProps {
  tagStatistics: TagStatistics[]
  handleTagSelect: (tag: TagStatistics | null) => void,
  searchTags: string[]
  ignoreTags: string[]
  ctrlMode: boolean
  handleDeleteTagFromProject: (tag: TagStatistics) => void,
}

export function TagCloud(props: TagCloudProps) {
  const tagCloudElm = props.tagStatistics.map((t: TagStatistics) => {
    const isSearchTag = props.searchTags.includes(t.value())
    const isIgnoreTag = props.ignoreTags.includes(t.value())

    let clsName = "flex box-border border rounded-2xl p-1 pl-2 pr-2 m-1 select-none text-sm cursor-pointer hover:bg-neutral-800 "
    if (isSearchTag) {
      clsName += "bg-neutral-700 border-blue-600"
    } else if (isIgnoreTag) {
      clsName += "bg-neutral-700 border-red-500"
    } else {
      clsName += "bg-neutral-900 border-neutral-600"
    }

    const tagControlBaseCls = "relative left-1 flex w-8 justify-center items-center text-xs bg-neutral-800 rounded-full"
    const tagCountOrDeleteButton = !props.ctrlMode ?
      <div className={tagControlBaseCls}>{t.count()}</div> :
      <div onClick={(e) => {e.stopPropagation(); props.handleDeleteTagFromProject(t)}}
           className={tagControlBaseCls + " cursor-pointer hover:bg-red-500"}
      >
        <DismissRegular></DismissRegular>
      </div>


    return (
      <div className={clsName} key={t.value()}
        onClick={(e) => {
          e.stopPropagation()
          props.handleTagSelect(t)
        }}
      >
        {t.value()}
        {tagCountOrDeleteButton}
      </div>
    )
  })

  return (
    <div className="flex flex-wrap">
      {tagCloudElm}
    </div>
  )
}
