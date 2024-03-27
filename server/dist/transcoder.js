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
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const ffmpegPath = './ffmpeg';
function transcodeVideoQuality(inputFile, outputFile, resolution) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const ffmpeg = (0, child_process_1.spawn)(ffmpegPath, [
                '-i', inputFile,
                '-vf', `scale=${resolution}`,
                '-c:a', 'copy',
                '-y',
                outputFile,
            ]);
            ffmpeg.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });
            ffmpeg.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
            ffmpeg.on('close', (code) => {
                console.log(`child process exited with code ${code}`);
                resolve();
            });
            ffmpeg.on('error', (err) => {
                console.error('Failed to start subprocess.', err);
                reject(err);
            });
        });
    });
}
exports.default = transcodeVideoQuality;
