import express, {Request, Response} from "express";
import transcodeVideoQuality from "./transcoder.js";
import {generateSingedUploadUrl, generateSingedUploadUrlMp4} from './s3';
import cors from "cors";
import axios from "axios";
import path from "path";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

let format;

type UrlData = {
    quality: string,
    url: string,
}
type ResponseData = {
    id: string,
    urls : UrlData[],
}

app.get('/s3url', async(req :Request, res : Response) => {
    console.log("Hi");
    const url = await generateSingedUploadUrl();
    console.log(url);
    res.send({url});
})

app.post("/transcodeVideo",  async (req :Request, res: Response) => {
    console.log(req.body);
    const s3Url = req.body.s3Url;
    const inputFilePath = `./input-videos/input.${req.body.fileType}`;
    await downloadFile(s3Url, inputFilePath);
    const outputPaths = [
        { path: `./output-videos/output-240p.mp4`, resolution: "426x240" },
        { path: `./output-videos/output-360p.mp4`, resolution: "640x360" },
        { path: `./output-videos/output-480p.mp4`, resolution: "854x480" },
        { path: `./output-videos/output-720p.mp4`, resolution: "1280x720" },
        { path: `./output-videos/output-1080p.mp4`, resolution: "1920x1080" },
        { path: `./output-videos/output-1440p.mp4`, resolution: "2560x1440" },
        { path: `./output-videos/output-2160p.mp4`, resolution: "3840x2160" },
    ];
    const resData : ResponseData = {
        id: req.body.id,
        urls: [],
    };

    for (const outputPathInfo of outputPaths) {
        await transcodeVideoQuality(
            inputFilePath,
            outputPathInfo.path,
            outputPathInfo.resolution
        );
        const url = await generateSingedUploadUrlMp4();
        const contentType = "video/" + req.body.fileType;
        // console.log(contentType);
        const fileContent = fs.readFileSync(outputPathInfo.path);
        await axios.put(url, fileContent, {
            headers: {
                "content-Type": contentType,
            },
        });
        const tempData ={
            url:  url.split("?")[0],
            quality: outputPathInfo.resolution
        };
        resData.urls.push(tempData)
    }

    console.log("\n\n\nAll conversions completed!\n\n\n")
    res.send(resData);
});

app.listen(3000, () => {
    console.log("server is listening on port 3000");
});

async function downloadFile(url :string, filePath: string) {
    try {
        const response = await axios.get(url, { responseType: "arraybuffer" });
        fs.writeFileSync(filePath, response.data);
        console.log(`Downloaded and saved file to ${filePath}`);
    } catch (error) {
        console.error("Error downloading file:", error);
    }
}
