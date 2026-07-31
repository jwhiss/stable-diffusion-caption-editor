import { DaggerImage } from "@/domain/data";
import { downloadAsZip } from "@/util/zip";

export async function saveImages(
  imagesToSave: DaggerImage[],
  useTauri: boolean,
  onComplete: () => void
) {
  if (useTauri) {
    const { writeBinaryFile, writeTextFile } = await import(
      "@tauri-apps/api/fs"
    );
    for (const image of imagesToSave) {
      if (!image.realPath) continue;

      const { imageBlob, caption } = image.export();

      if (imageBlob) {
        const buffer = await imageBlob.arrayBuffer();
        await writeBinaryFile(image.realPath, new Uint8Array(buffer));
      }

      const extIndex = image.realPath.lastIndexOf(".");
      const fileNameWithoutExt =
        extIndex > 0 ? image.realPath.substring(0, extIndex) : image.realPath;
      const captionPath = fileNameWithoutExt + ".txt";
      await writeTextFile(captionPath, caption);
    }
  } else {
    await downloadAsZip(imagesToSave);
  }
  
  onComplete();
}
