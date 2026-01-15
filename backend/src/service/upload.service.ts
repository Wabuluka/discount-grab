import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import config from "../config";
import crypto from "crypto";

// Initialize S3 Client
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

// Generate a unique filename
const generateFileName = (originalName: string): string => {
  const ext = originalName.split(".").pop() || "jpg";
  const randomId = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now();
  return `${timestamp}-${randomId}.${ext}`;
};

// Get content type from file extension
const getContentType = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };
  return contentTypes[ext || ""] || "application/octet-stream";
};

// Upload file to S3
export const uploadToS3 = async (
  file: Buffer,
  originalFilename: string,
  folder: string = "uploads"
): Promise<{ url: string; key: string }> => {
  const fileName = generateFileName(originalFilename);
  const key = `${folder}/${fileName}`;
  const contentType = getContentType(originalFilename);

  const command = new PutObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Construct the public URL
  const url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;

  return { url, key };
};

// Delete file from S3
export const deleteFromS3 = async (key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
  });

  await s3Client.send(command);
};

// Delete multiple files from S3
export const deleteMultipleFromS3 = async (
  keys: string[]
): Promise<{ success: string[]; failed: string[] }> => {
  const success: string[] = [];
  const failed: string[] = [];

  for (const key of keys) {
    try {
      await deleteFromS3(key);
      success.push(key);
    } catch {
      failed.push(key);
    }
  }

  return { success, failed };
};

// Delete files by URLs from S3
export const deleteByUrls = async (
  urls: string[]
): Promise<{ success: string[]; failed: string[] }> => {
  const keys = urls
    .map((url) => getKeyFromUrl(url))
    .filter((key): key is string => key !== null);

  return deleteMultipleFromS3(keys);
};

// Generate presigned URL for direct upload from frontend
export const generatePresignedUrl = async (
  filename: string,
  folder: string = "uploads"
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> => {
  const fileName = generateFileName(filename);
  const key = `${folder}/${fileName}`;
  const contentType = getContentType(filename);

  const command = new PutObjectCommand({
    Bucket: config.aws.s3Bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const fileUrl = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl, key };
};

// Extract key from S3 URL
export const getKeyFromUrl = (url: string): string | null => {
  try {
    const bucketUrl = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/`;
    if (url.startsWith(bucketUrl)) {
      return url.replace(bucketUrl, "");
    }
    return null;
  } catch {
    return null;
  }
};
