import {TagStatistics, DaggerImage} from "@/domain/data";
import {useState} from "react";
import {TagCloud} from "@/app/component/ui/TagCloud";

interface TagViewProps {
  tagStatistics: TagStatistics[]
  handleTagSelect: (tag: TagStatistics | null) => void
  toggleTaggingMode: (bool: boolean) => void,
  toggleFilterMode: (bool: boolean) => void,
  handleToggleTaggingTags: (tag: TagStatistics) => void,
  ctrlMode: boolean,
  handleDeleteTagFromProject: (tag: TagStatistics) => void,
  isTaggingMode: boolean,
  taggingTags: string[]
  searchTags: string[]
  ignoreTags: string[]
  layoutMode: 'view' | 'edit'
  selectedImages: DaggerImage[]
  handleAddTagToSelectedImages: (tag: string) => void
  handleRemoveTagFromSelectedImages: (tag: TagStatistics) => void
}

export default function TagView(props: TagViewProps) {
  const [tagSearch, setTagSearch] = useState<string>("")
  const [editAction, setEditAction] = useState<'add' | 'remove'>('add')
  const filterMode = !props.isTaggingMode

  const addTags = props.tagStatistics.filter(t => {
    if (props.selectedImages.length === 0) return false;
    return props.selectedImages.some(img => !img.caption.asTag().find(tag => tag.value() === t.value()))
  }).filter(t => t.value().includes(tagSearch));

  const removeTags = props.tagStatistics.filter(t => {
    if (props.selectedImages.length === 0) return false;
    return props.selectedImages.some(img => img.caption.asTag().find(tag => tag.value() === t.value()))
  }).filter(t => t.value().includes(tagSearch));

  return (
    <div className="flex flex-col pl-4 w-full pt-2 bg-neutral-800 overflow-hidden select-none">
      <div className="flex pb-2 justify-between">
        <div className="flex gap-4">
          {props.layoutMode === 'view' ? (
            <button className={filterMode ? "text-white border-b border-sky-500" : "text-neutral-400"}
                    onClick={() => props.toggleFilterMode(true)}>FILTER BY TAGS
            </button>
          ) : (
            <>
              <button className={editAction === 'add' ? "text-white border-b border-sky-500" : "text-neutral-400"}
                      onClick={() => setEditAction('add')}>ADD TAGS</button>
              <button className={editAction === 'remove' ? "text-white border-b border-sky-500" : "text-neutral-400"}
                      onClick={() => setEditAction('remove')}>REMOVE TAGS</button>
            </>
          )}
        </div>
        <div className="pr-4">
          <input placeholder={"Search"}
                 className={"bg-neutral-700 border-0 pl-1 rounded w-[256px]"}
                 onChange={(e) => setTagSearch(e.target.value)}
                 value={tagSearch}
          />
        </div>
      </div>

      <div className="w-full overflow-y-auto">
        {
          props.layoutMode === 'view' ? (
            filterMode ?
              <TagCloud tagStatistics={props.tagStatistics.filter((t: TagStatistics) => t.value().includes(tagSearch))}
                        ignoreTags={props.ignoreTags}
                        searchTags={props.searchTags}
                        handleTagSelect={props.handleTagSelect}
                        ctrlMode={props.ctrlMode}
                        handleDeleteTagFromProject={props.handleDeleteTagFromProject}
              />
              :
              <></>
          ) : (
            <TagCloud tagStatistics={editAction === 'add' ? addTags : removeTags}
                      ignoreTags={[]}
                      searchTags={[]}
                      handleTagSelect={(t) => {
                        if (t) {
                          if (editAction === 'add') {
                            props.handleAddTagToSelectedImages(t.value());
                          } else {
                            props.handleRemoveTagFromSelectedImages(t);
                          }
                        }
                      }}
                      ctrlMode={false}
                      handleDeleteTagFromProject={() => {}}
            />
          )
        }
      </div>

    </div>
  )
}
