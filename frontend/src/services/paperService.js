import api from "./api";

export async function listPapers(filters = {}) {
  const params = {};

  if (filters.year) {
    params.year = Number(filters.year);
  }

  if (filters.category_id) {
    params.category_id = Number(filters.category_id);
  }

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.mine) {
    params.mine = true;
  }

  const response = await api.get("/papers", { params });
  return response.data;
}

export async function getPaper(paperId) {
  const response = await api.get(`/papers/${paperId}`);
  return response.data;
}

export async function createPaper(payload) {
  const response = await api.post("/papers", payload);
  return response.data;
}

export async function updatePaper(paperId, payload) {
  const response = await api.put(`/papers/${paperId}`, payload);
  return response.data;
}

export async function deletePaper(paperId) {
  const response = await api.delete(`/papers/${paperId}`);
  return response.data;
}

export async function reviewPaper(paperId, payload) {
  const response = await api.put(`/admin/papers/${paperId}/approve`, payload);
  return response.data;
}

export async function addPaperAuthor(paperId, payload) {
  const response = await api.post(`/papers/${paperId}/authors`, payload);
  return response.data;
}
