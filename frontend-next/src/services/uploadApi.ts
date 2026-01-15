import api from "./api";

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
}

export interface UploadResponse {
  url: string;
  key: string;
}

export interface BulkDeleteResponse {
  message: string;
  success: string[];
  failed: string[];
}

export const uploadApi = {
  // Get presigned URL for direct S3 upload
  getPresignedUrl: (filename: string, folder: string = "uploads") =>
    api.post<PresignedUrlResponse>("/upload/presigned-url", { filename, folder }),

  // Upload file through backend
  uploadFile: async (file: File, folder: string = "uploads"): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await api.post<UploadResponse>("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Upload directly to S3 using presigned URL
  uploadToS3Direct: async (file: File, folder: string = "uploads"): Promise<string> => {
    // Get presigned URL
    const { data } = await uploadApi.getPresignedUrl(file.name, folder);

    // Upload directly to S3
    await fetch(data.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    return data.fileUrl;
  },

  // Delete single file
  deleteFile: (url: string) =>
    api.delete("/upload", { data: { url } }),

  // Delete multiple files
  deleteMultipleFiles: (urls: string[]) =>
    api.delete<BulkDeleteResponse>("/upload/bulk", { data: { urls } }),
};
