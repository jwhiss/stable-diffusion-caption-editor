import {DaggerImage} from "@/domain/data";
import React from "react";

export function ImageCard({img, handler, isCurrent, visible, size}: {
  img: DaggerImage,
  isCurrent: boolean,
  handler: (img: DaggerImage) => void
  visible: boolean
  size: number
}) {
  let cls = `flex flex-col content-between overflow-hidden mt-3 hover:bg-neutral-800 shrink-0`
  if (!visible) cls += " hidden"

  return (
    <div className={cls} style={{width: `${size}px`, height: `${size + 40}px`}}
         onMouseDown={(e) => {
           e.stopPropagation();
           handler(img)
         }}
         onDoubleClick={(e) => {
           e.stopPropagation();
           window.open(img.url, '_blank')
         }}
    >
      <div
        className={`flex justify-center m-1 overflow-hidden shrink-0 items-center ` + (isCurrent ? "border-sky-500 border-2" : "")}
        style={{height: `${size}px`}}>
        <img className={"object-cover pointer-events-none"} onDragStart={(e) => e.stopPropagation()} src={img.thumbnailUrl} alt={img.caption.value}></img>
      </div>
      <div className="flex justify-center text-sm pt-2">
        <p className="overflow-ellipsis max-w-[128px] overflow-hidden whitespace-nowrap">{img.fileName}</p>
      </div>
    </div>
  )
}
