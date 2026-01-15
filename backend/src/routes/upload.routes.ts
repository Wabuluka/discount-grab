import { Router } from "express";
import multer from "multer";
import * as UploadController from "../controllers/upload.controller";
import { auth, isAdmin } from "../middleware/auth";

const uploadRouter = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
});

// Get presigned URL for direct upload (admin only)
uploadRouter.post("/presigned-url", auth, isAdmin, UploadController.getPresignedUrl);

// Upload file through backend (admin only)
uploadRouter.post(
  "/",
  auth,
  isAdmin,
  upload.single("file"),
  UploadController.uploadFile
);

// Delete file (admin only)
uploadRouter.delete("/", auth, isAdmin, UploadController.deleteFile);

// Delete multiple files (admin only)
uploadRouter.delete("/bulk", auth, isAdmin, UploadController.deleteMultipleFiles);

export default uploadRouter;
