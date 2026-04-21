import api from "./api";

export async function getDashboardStats() {
  const response = await api.get("/admin/statistics/dashboard");
  return response.data;
}

export async function getTopLecturers() {
  const response = await api.get("/statistics/top-lecturers");
  return response.data;
}

export async function getProjectLevelStatistics() {
  const response = await api.get("/statistics/project-levels");
  return response.data;
}

export async function getPaperLevelStatistics() {
  const response = await api.get("/statistics/paper-levels");
  return response.data;
}
