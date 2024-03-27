import { spawn } from 'child_process';

const ffmpegPath = './ffmpeg';


async function transcodeVideoQuality(inputFile: string, outputFile: string, resolution: string):Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, [
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
}

export default transcodeVideoQuality;