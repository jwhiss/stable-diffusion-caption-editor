import React from "react";
import {ShortcutIcon} from "@/app/component/ui/ShortcutIcon";

export function Promotion() {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-10 bg-gradient-to-r w-full text-white rounded-md">
      <div className="text-3xl font-bold animate-pulse text-center">Dagger️</div>
      <div>🗡️</div>
      <div className="text-xl">
        <p>Get started by importing your image and caption files.</p>
      </div>
      <div className="text-lg">
        <p>Please see the <a className="underline" href="https://github.com/kznrluk/dagger">README</a> for detailed usage instructions.</p>
        <p>We welcome your contributions and feedback. Please feel free to submit issues and pull requests on our <a className="underline" href="https://github.com/kznrluk/dagger">GitHub repository</a>.</p>
      </div>
      <div className="flex flex-col gap-2 text-center">
        <ShortcutIcon name="CTRL + Click" description="Select multiple" />
        <ShortcutIcon name="SHIFT + Click" description="Select in a row" />
        <ShortcutIcon name="CTRL + A" description="Select all" />
      </div>
    </div>
  )
}
