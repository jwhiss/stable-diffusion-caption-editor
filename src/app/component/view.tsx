import {DaggerImage, Tag} from "@/domain/data";
import {CropSparkle24Filled, DeleteRegular} from "@fluentui/react-icons";
import {useForm} from "react-hook-form";
import {TagSelector} from "@/app/component/ui/TagSelector";
import {Promotion} from "@/app/component/ui/Promotion";

interface ImageViewAreaProps {
  daggerImages: DaggerImage[]
  handleDeleteTagFromImage: (images: DaggerImage[]) => (tag: Tag) => void
  handleDeleteImageFromProject: (images: DaggerImage[]) => void
  handleAddTagToImage: (images: DaggerImage[]) => (tag: string) => void
  setInCropMode: (img: DaggerImage) => void
}

export default function ImageViewArea(props: ImageViewAreaProps) {
  const { register, handleSubmit, reset } = useForm();
  const onSubmit = (data: any) => {
    console.log(data)
    if (data.newTag) {
      if (data.newTag.includes(',')) {
        alert("Comma is not allowed in tags!");
        return;
      }

      props.handleAddTagToImage(images)(data.newTag);
      reset();
    }
  };

  if (props.daggerImages.length === 0) {
    return <Promotion></Promotion>
  }
  const isSingleImage = props.daggerImages.length === 1
  const images = props.daggerImages
  const image = props.daggerImages[0]
  const commonTags = images.map(i => i.caption.asTag()).reduce((prev, curr) => prev.filter(e => curr.some(f => f.value() === e.value())))

  const tagComponents = commonTags.map((tag, i) => (
    <TagSelector handleDeleteTagFromImage={props.handleDeleteTagFromImage(images)} selected={true} tag={tag} key={image.realPath + tag.value() + i} />
  ))

  const imageName = isSingleImage ? image.fileName : `${props.daggerImages.length} images selected`

  return (
    <div className="w-full h-full flex flex-col p-2 bg-neutral-800">
      <div className={"flex justify-center h-[380px] w-full shrink-0 " + (isSingleImage ? "" : "items-center")}>
        {
          props.daggerImages.map((image, i, l) => {
            const degrees = isSingleImage ? [0] : [9];
            const randomDegree = degrees[Math.floor(Math.random() * degrees.length)];
            const translateY = isSingleImage ? [0] : [Math.min(i * 5, 20) - 10];
            const translateX = isSingleImage ? [0] : [Math.min(i * 5, 20) - 10];
            if (i > 30 && i !== l.length - 1) {
              return null
            }
            return (
              <img className={isSingleImage ? "object-contain" : "rounded absolute max-w-[200px] max-h-[200px]"}
                   style={{transform: `rotate(${randomDegree}deg) translate(${translateY}px, ${translateX}px)`}}
                   src={isSingleImage ? image.url : image.thumbnailUrl} alt={image.caption.value}
                   key={image.fileName + i}
              />
            )
          }).filter(Boolean)
        }
      </div>

      <div className="flex justify-center mt-4 gap-3">
        {
          isSingleImage ?
            <div onClick={() => { props.setInCropMode(image) }} className="flex justify-center items-center text-3xl rounded-full bg-neutral-900 border-neutral-950 border hover:bg-neutral-800 cursor-pointer w-[80px] h-[40px]">
              <CropSparkle24Filled />
            </div>
            :
            <></>
        }
        <div onClick={() => { props.handleDeleteImageFromProject(images) }} className="flex justify-center items-center text-3xl rounded-full bg-neutral-900 border-neutral-950 border hover:bg-neutral-800 cursor-pointer w-[80px] h-[40px]">
          <DeleteRegular />
        </div>
      </div>

      <input className="mt-4 bg-neutral-900 border-neutral-950 rounded border p-2 text-sm cursor-text overflow-x-auto" value={imageName} disabled={true}></input>

      <div className="mt-4 rounded border bg-neutral-900 border-neutral-950 flex-grow min-h-0 flex-col flex gap-2">
        <div className="w-full p-2 h-full flex flex-col overflow-hidden select-text">
          <div className="flex flex-wrap content-start overflow-y-auto flex-grow h-0">
            {tagComponents}
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="pt-4 shrink-0">
            <input
              {...register("newTag")}
              className="bg-neutral-700 rounded h-9 w-full pl-3"
              placeholder="add new tag..."
            />
            <input type="submit" style={{display: 'none'}} />
          </form>
        </div>
      </div>
    </div>
  )
}
