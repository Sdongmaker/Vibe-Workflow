import axios from "axios";

export const uploadFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post("/api/app/upload_file", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
    return response.data.url;
  } catch (directUploadError) {
    const response = await axios.get("/api/app/get_file_upload_url", {
      params: { filename: file.name },
    });
    const { url, fields, upload_url: uploadUrl, public_url: publicUrl, file_url: fileUrl } = response.data;
    const targetUrl = uploadUrl || url;

    if (!targetUrl) {
      throw directUploadError;
    }

    if (targetUrl === "/api/app/upload_file" || targetUrl.endsWith("/api/app/upload_file")) {
      const retryFormData = new FormData();
      retryFormData.append("file", file);
      const retryResponse = await axios.post(targetUrl, retryFormData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      });
      return retryResponse.data.url;
    }

    const fallbackFormData = new FormData();
    Object.entries(fields || {}).forEach(([key, value]) => {
      fallbackFormData.append(key, value);
    });
    fallbackFormData.append("file", file);
    await axios.post(targetUrl, fallbackFormData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
    return publicUrl || fileUrl || fields?.url || fields?.key;
  }
};
