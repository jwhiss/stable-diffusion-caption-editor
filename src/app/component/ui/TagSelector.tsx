import {Tag} from "@/domain/data";
import {DismissRegular} from "@fluentui/react-icons";
export function TagSelector(props: { tag: Tag, selected: boolean, handleDeleteTagFromImage: (tag: Tag) => void }) {
  let className = "flex border bg-neutral-900 border-neutral-600 rounded-2xl p-1 pl-2 pr-2 m-1 text-sm"
  if (props.selected) {
    className += " "
  }

  return(
    <div className={className}>
      {props.tag.value()}
      <div
        onClick={() => {
          props.handleDeleteTagFromImage(props.tag)
        }}
        className="relative left-1 flex w-5 justify-center items-center text-xs bg-neutral-800 rounded-full cursor-pointer hover:bg-red-500"
      >
        <DismissRegular></DismissRegular>
      </div>
    </div>
  )
}
