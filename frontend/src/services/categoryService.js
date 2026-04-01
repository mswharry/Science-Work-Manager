import api from "./api";

export async function listProjectCategories() {
  const response = await api.get("/admin/categories/project-types");
  return response.data;
}

export async function createProjectCategory(payload) {
  const response = await api.post("/admin/categories/project-types", payload);
  return response.data;
}

export async function updateProjectCategory(categoryId, payload) {
  const response = await api.put(`/admin/categories/project-types/${categoryId}`, payload);
  return response.data;
}

export async function deleteProjectCategory(categoryId) {
  const response = await api.delete(`/admin/categories/project-types/${categoryId}`);
  return response.data;
}

export async function listPaperCategories() {
  const response = await api.get("/admin/categories/paper-types");
  return response.data;
}

export async function createPaperCategory(payload) {
  const response = await api.post("/admin/categories/paper-types", payload);
  return response.data;
}

export async function updatePaperCategory(categoryId, payload) {
  const response = await api.put(`/admin/categories/paper-types/${categoryId}`, payload);
  return response.data;
}

export async function deletePaperCategory(categoryId) {
  const response = await api.delete(`/admin/categories/paper-types/${categoryId}`);
  return response.data;
}
