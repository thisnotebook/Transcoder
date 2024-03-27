"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSingedUploadUrl = exports.generateSingedUploadUrlMp4 = void 0;
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = require("crypto");
dotenv_1.default.config();
const region = "ap-south-1";
const bucketName = "transcoder101";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const s3 = new aws_sdk_1.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});
function generateSingedUploadUrlMp4() {
  return __awaiter(this, void 0, void 0, function* () {
    const rawBytes = (0, crypto_1.randomBytes)(16);
    const imageName = rawBytes.toString("hex") + ".mp4";
    console.log(imageName);
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Expires: 180,
    };
    const uploadUrl = yield s3.getSignedUrlPromise("putObject", params);
    return uploadUrl;
  });
}
exports.generateSingedUploadUrlMp4 = generateSingedUploadUrlMp4;
function generateSingedUploadUrl() {
  return __awaiter(this, void 0, void 0, function* () {
    const rawBytes = (0, crypto_1.randomBytes)(16);
    const imageName = rawBytes.toString("hex");
    console.log(imageName);
    const params = {
      Bucket: bucketName,
      Key: imageName,
      Expires: 180,
    };
    const uploadUrl = yield s3.getSignedUrlPromise("putObject", params);
    console.log("Generated upload URL:", uploadUrl);
    return uploadUrl;
  });
}
exports.generateSingedUploadUrl = generateSingedUploadUrl;
