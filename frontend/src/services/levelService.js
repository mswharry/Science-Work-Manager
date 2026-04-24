import api from "./api";

export const listProjectLevels = async () => {
  const response = await api.get("/admin/levels/project-levels");
  return response.data;
};

export const createProjectLevel = async (payload) => {
  const response = await api.post("/admin/levels/project-levels", {
    ...payload,
    entity_type: "project",
  });
  return response.data;
};

export const updateProjectLevel = async (levelId, payload) => {
  const response = await api.put(`/admin/levels/project-levels/${levelId}`, payload);
  return response.data;
};

export const deleteProjectLevel = async (levelId) => {
  const response = await api.delete(`/admin/levels/project-levels/${levelId}`);
  return response.data;
};

export const listPaperLevels = async () => {
  const response = await api.get("/admin/levels/paper-levels");
  return response.data;
};

export const createPaperLevel = async (payload) => {
  const response = await api.post("/admin/levels/paper-levels", {
    ...payload,
    entity_type: "paper",
  });
  return response.data;
};

export const updatePaperLevel = async (levelId, payload) => {
  const response = await api.put(`/admin/levels/paper-levels/${levelId}`, payload);
  return response.data;
};

export const deletePaperLevel = async (levelId) => {
  const response = await api.delete(`/admin/levels/paper-levels/${levelId}`);
  return response.data;
};

export const getPublicProjectLevels = async () => {
  const response = await api.get("/levels/project-levels");
  return response.data;
};

export const getPublicPaperLevels = async () => {
  const response = await api.get("/levels/paper-levels");
  return response.data;
};

export const getProjectLevelStatistics = async () => {
  const response = await api.get("/admin/statistics/project-levels");
  return response.data;
};

export const getPaperLevelStatistics = async () => {
  const response = await api.get("/admin/statistics/paper-levels");
  return response.data;
};
