"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const transcoder_js_1 = __importDefault(require("./transcoder.js"));
const s3_1 = require("./s3");
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let format;
app.get('/s3url', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Hi");
    const url = yield (0, s3_1.generateSingedUploadUrl)();
    console.log(url);
    res.send({ url });
}));
app.post("/transcodeVideo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const s3Url = req.body.s3Url;
    const inputFilePath = `./input-videos/input.${req.body.fileType}`;
    yield downloadFile(s3Url, inputFilePath);
    const outputPaths = [
        { path: `./output-videos/output-240p.mp4`, resolution: "426x240" },
        { path: `./output-videos/output-360p.mp4`, resolution: "640x360" },
        { path: `./output-videos/output-480p.mp4`, resolution: "854x480" },
        { path: `./output-videos/output-720p.mp4`, resolution: "1280x720" },
        { path: `./output-videos/output-1080p.mp4`, resolution: "1920x1080" },
        { path: `./output-videos/output-1440p.mp4`, resolution: "2560x1440" },
        { path: `./output-videos/output-2160p.mp4`, resolution: "3840x2160" },
    ];
    const resData = {
        id: req.body.id,
        urls: [],
    };
    for (const outputPathInfo of outputPaths) {
        yield (0, transcoder_js_1.default)(inputFilePath, outputPathInfo.path, outputPathInfo.resolution);
        const url = yield (0, s3_1.generateSingedUploadUrlMp4)();
        const contentType = "video/" + req.body.fileType;
        // console.log(contentType);
        const fileContent = fs_1.default.readFileSync(outputPathInfo.path);
        yield axios_1.default.put(url, fileContent, {
            headers: {
                "content-Type": contentType,
            },
        });
        const tempData = {
            url: url.split("?")[0],
            quality: outputPathInfo.resolution
        };
        resData.urls.push(tempData);
    }
    console.log("\n\n\nAll conversions completed!\n\n\n");
    res.send(resData);
}));
app.listen(3000, () => {
    console.log("server is listening on port 3000");
});
function downloadFile(url, filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(url, { responseType: "arraybuffer" });
            fs_1.default.writeFileSync(filePath, response.data);
            console.log(`Downloaded and saved file to ${filePath}`);
        }
        catch (error) {
            console.error("Error downloading file:", error);
        }
    });
}
