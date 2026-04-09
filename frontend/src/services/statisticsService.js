import api from "./api";

export async function getDashboardStats() {
  const response = await api.get("/admin/statistics/dashboard");
  return response.data;
}

export async function getTopLecturers() {
  const response = await api.get("/statistics/top-lecturers");
  return response.data;
}
