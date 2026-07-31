import React from "react";

export function ShortcutIcon(props: { name: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center border border-white rounded p-2">
      <p className="font-bold">{props.name}</p>
      <p>{props.description}</p>
    </div>
  )
}
