import { NextFunction, Request, Response } from "express";
import { AppError } from "../middleware/errorHandler";
import * as UploadService from "../service/upload.service";

// Generate presigned URL for direct upload
export const getPresignedUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { filename, folder } = req.body;

    if (!filename) {
      throw new AppError("Filename is required", 400);
    }

    // Validate file extension
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const ext = filename.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      throw new AppError(
        `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`,
        400
      );
    }

    // Validate folder (optional security measure)
    const allowedFolders = ["products", "categories", "uploads"];
    const targetFolder = folder && allowedFolders.includes(folder) ? folder : "uploads";

    const result = await UploadService.generatePresignedUrl(filename, targetFolder);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Upload file directly through backend (for smaller files)
export const uploadFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const folder = (req.body.folder as string) || "uploads";
    const allowedFolders = ["products", "categories", "uploads"];
    const targetFolder = allowedFolders.includes(folder) ? folder : "uploads";

    const result = await UploadService.uploadToS3(
      req.file.buffer,
      req.file.originalname,
      targetFolder
    );

    res.json({
      url: result.url,
      key: result.key,
    });
  } catch (err) {
    next(err);
  }
};

// Delete file from S3
export const deleteFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { url, key } = req.body;

    let targetKey = key;
    if (!targetKey && url) {
      targetKey = UploadService.getKeyFromUrl(url);
    }

    if (!targetKey) {
      throw new AppError("File key or URL is required", 400);
    }

    await UploadService.deleteFromS3(targetKey);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Delete multiple files from S3
export const deleteMultipleFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { urls, keys } = req.body;

    if (!urls && !keys) {
      throw new AppError("Either urls or keys array is required", 400);
    }

    let result: { success: string[]; failed: string[] };

    if (urls && Array.isArray(urls) && urls.length > 0) {
      result = await UploadService.deleteByUrls(urls);
    } else if (keys && Array.isArray(keys) && keys.length > 0) {
      result = await UploadService.deleteMultipleFromS3(keys);
    } else {
      throw new AppError("No valid urls or keys provided", 400);
    }

    res.json({
      message: `Deleted ${result.success.length} file(s)`,
      success: result.success,
      failed: result.failed,
    });
  } catch (err) {
    next(err);
  }
};
