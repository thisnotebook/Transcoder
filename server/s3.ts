import { S3 } from "aws-sdk";
import dotenv from "dotenv";
import { randomBytes } from "crypto";
import { promisify } from "util";

dotenv.config();

const region = "ap-south-1";
const bucketName = "transcoder101";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

export async function generateSingedUploadUrlMp4() {
  const rawBytes = randomBytes(16);
  const imageName = rawBytes.toString("hex") + ".mp4";
  console.log(imageName);
  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 180,
  };

  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
  return uploadUrl;
}

export async function generateSingedUploadUrl() {
  const rawBytes = randomBytes(16);
  const imageName = rawBytes.toString("hex");
  console.log(imageName);
  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 180,
  };

  const uploadUrl = await s3.getSignedUrlPromise("putObject", params);
  return uploadUrl;
}
