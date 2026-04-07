import api from "./api";

export async function uploadPaperFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/uploads/paper-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
  return response.data;
}

export async function uploadProjectProposal(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/uploads/project-proposal", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
  return response.data;
}

export async function uploadProjectFinalReport(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/uploads/project-final-report", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
  });
  return response.data;
}

export function buildAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/uploads")) return path;
  return path;
}
