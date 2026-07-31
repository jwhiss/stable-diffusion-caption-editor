import {DismissRegular} from "@fluentui/react-icons";
export interface FilterTagViewProps {
  handleRemoveTagFromFilter: (tag: string) => void
  tags: string[]
  color: "red" | "blue"
  join: string
}

export function FilterTagView(props: FilterTagViewProps) {
  const tagCloudElm = props.tags.map((t: string, i, l) => {
    let clsName = "flex box-border border rounded-2xl p-1 pl-2 pr-2 m-1 select-none text-sm cursor-pointer whitespace-nowrap hover:bg-neutral-800 "
    if (props.color === "blue") {
      clsName += "bg-neutral-900 border-blue-600"
    } else if (props.color === "red") {
      clsName += "bg-neutral-900 border-red-500"
    } else {
      clsName += "bg-neutral-900 border-neutral-600"
    }

    return (
      <div key={t} className="flex items-center">
        <div
          className={clsName}
          key={t}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {t}
          <div
            onClick={() => {
              props.handleRemoveTagFromFilter(t)
            }}
            className="relative left-1 flex w-5 justify-center items-center text-xs bg-neutral-800 rounded-full hover:bg-red-500"
          >
            <DismissRegular></DismissRegular>
          </div>
        </div>
        {i !== l.length - 1 ? <p className="text-neutral-400 text-sm">{props.join}</p> : ""}
      </div>
    )
  })

  return (
    <div className="flex items-center">
      {tagCloudElm}
    </div>
  )
}
