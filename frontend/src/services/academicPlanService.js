import api from "./api";

export async function listAcademicPlans() {
  const response = await api.get("/plans");
  return response.data;
}

export async function getAcademicPlan(planId) {
  const response = await api.get(`/plans/${planId}`);
  return response.data;
}

export async function createAcademicPlan(payload) {
  const response = await api.post("/admin/plans", payload);
  return response.data;
}

export async function updateAcademicPlan(planId, payload) {
  const response = await api.put(`/admin/plans/${planId}`, payload);
  return response.data;
}

export async function deleteAcademicPlan(planId) {
  const response = await api.delete(`/admin/plans/${planId}`);
  return response.data;
}

export async function activateAcademicPlan(planId) {
  const response = await api.put(`/admin/plans/${planId}/activate`);
  return response.data;
}

export async function closeAcademicPlan(planId) {
  const response = await api.put(`/admin/plans/${planId}/close`);
  return response.data;
}
