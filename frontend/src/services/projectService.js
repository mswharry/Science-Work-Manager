import api from "./api";

export async function listProjects(filters = {}) {
  const params = {};

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.year) {
    params.year = Number(filters.year);
  }

  if (filters.keyword) {
    params.keyword = filters.keyword;
  }

  if (filters.mine) {
    params.mine = true;
  }

  if (filters.completion_requested !== undefined && filters.completion_requested !== null) {
    params.completion_requested = filters.completion_requested;
  }

  const response = await api.get("/projects", { params });
  return response.data;
}

export async function getProject(projectId) {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
}

export async function createProject(payload) {
  const response = await api.post("/projects", payload);
  return response.data;
}

export async function updateProject(projectId, payload) {
  const response = await api.put(`/projects/${projectId}`, payload);
  return response.data;
}

export async function deleteProject(projectId) {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
}

export async function requestProjectCompletion(projectId) {
  const response = await api.put(`/projects/${projectId}/request-completion`);
  return response.data;
}

export async function reviewProject(projectId, payload) {
  const response = await api.put(`/admin/projects/${projectId}/review`, payload);
  return response.data;
}

export async function completeProject(projectId) {
  const response = await api.put(`/admin/projects/${projectId}/complete`);
  return response.data;
}
