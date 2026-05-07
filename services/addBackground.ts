import { randomUUID } from "crypto";
import fs from "fs"
import { dataFolder } from "./exposeDataPath";
import { join } from "path";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { getBackgroundsData } from "./getBackgroundsData";

ffmpeg.setFfmpegPath(ffmpegPath!);

const extensions = {
    images: ["jpg", "jpeg", "png", "webp"],
    videos: ["mp4", "webm"]
}

const postersFolderPath = join(dataFolder, "assets", "backgrounds", "posters")

export const addBackground = async (path: string) => {

    let backgrounds = await getBackgroundsData();

    // Generate random name for the file
    const fileName = randomUUID()
    const extension = path.split('.').pop()!

    if (fs.existsSync(path)) {

        let object: { path: string, type: "image" | "video", poster?: string } = { path: "", type: "image" };

        if (extensions.images.includes(extension)) {
            const bgNewPath = join(dataFolder, "assets", "backgrounds", "static", `${fileName}.${extension}`)
            fs.copyFileSync(path, bgNewPath);
            object = { path: bgNewPath, type: "image" }

        }
        else if (extensions.videos.includes(extension)) {

            const bgNewPath = join(dataFolder, "assets", "backgrounds", "animated", `${fileName}.mp4`)

            await new Promise<void>((resolve, reject) => {
                ffmpeg(path)
                    .outputOptions([
                        '-vf', 'fps=24,scale=1280:-2',
                        '-c:v', 'libx264',
                        '-profile:v', 'high',
                        '-pix_fmt', 'yuv420p',
                        '-preset', 'medium',
                        '-crf', '26',
                        '-g', '48',
                        '-movflags', '+faststart',
                        '-an'
                    ])
                    .output(bgNewPath)
                    .on('end', () => resolve())
                    .on('error', reject)
                    .run()
            });

            const poster = await new Promise<string>((resolve, reject) => {
                ffmpeg(path)
                    .screenshots({
                        count: 1,
                        timestamps: ['00:00:03'],
                        filename: `${fileName}.png`,
                        folder: postersFolderPath
                    })
                    .on('end', () => resolve(join(postersFolderPath, `${fileName}.png`)))
                    .on('error', reject);
            });

            object = { path: bgNewPath, type: "video", poster }

        }

        else return new Error("Invalid file type");

        if (backgrounds) {
            backgrounds.push(object);
            fs.writeFileSync(join(dataFolder, "backgrounds.json"), JSON.stringify(backgrounds));
        }


        else return new Error("Couldn't fetch backgrounds");
    }

    else {
        return Error("File not found")
    }

}