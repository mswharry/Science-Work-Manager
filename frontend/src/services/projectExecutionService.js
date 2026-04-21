import api from "./api";

export async function getExecutionOverview(projectId) {
  const response = await api.get(`/projects/${projectId}/execution-overview`);
  return response.data;
}

export async function listProjectTasks(projectId) {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data;
}

export async function createProjectTask(projectId, payload) {
  const response = await api.post(`/projects/${projectId}/tasks`, payload);
  return response.data;
}

export async function updateProjectTask(projectId, taskId, payload) {
  const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, payload);
  return response.data;
}

export async function submitProjectTask(projectId, taskId, payload) {
  const response = await api.put(`/projects/${projectId}/tasks/${taskId}/submit`, payload);
  return response.data;
}

export async function reviewProjectTask(projectId, taskId, payload) {
  const response = await api.put(`/projects/${projectId}/tasks/${taskId}/review`, payload);
  return response.data;
}

export async function listPeriodicReports(projectId) {
  const response = await api.get(`/projects/${projectId}/reports`);
  return response.data;
}

export async function createPeriodicReport(projectId, payload) {
  const response = await api.post(`/projects/${projectId}/reports`, payload);
  return response.data;
}

export async function submitPeriodicReport(projectId, reportId, payload) {
  const response = await api.put(`/projects/${projectId}/reports/${reportId}/submit`, payload);
  return response.data;
}

export async function reviewPeriodicReport(projectId, reportId, payload) {
  const response = await api.put(`/projects/${projectId}/reports/${reportId}/review`, payload);
  return response.data;
}
