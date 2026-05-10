import api from "./api";

export async function listRegistrationPeriods(filters = {}) {
  const params = {};

  if (filters.keyword) {
    params.keyword = filters.keyword;
  }

  if (filters.year) {
    params.year = Number(filters.year);
  }

  const response = await api.get("/registration-periods", { params });
  return response.data;
}

export async function getRegistrationPeriod(periodId) {
  const response = await api.get(`/registration-periods/${periodId}`);
  return response.data;
}

export async function createRegistrationPeriod(payload) {
  const response = await api.post("/admin/registration-periods", payload);
  return response.data;
}

export async function updateRegistrationPeriod(periodId, payload) {
  const response = await api.put(`/admin/registration-periods/${periodId}`, payload);
  return response.data;
}

export async function openRegistrationPeriod(periodId) {
  const response = await api.patch(`/admin/registration-periods/${periodId}/open`);
  return response.data;
}

export async function closeRegistrationPeriod(periodId) {
  const response = await api.patch(`/admin/registration-periods/${periodId}/close`);
  return response.data;
}

export async function deleteRegistrationPeriod(periodId) {
  const response = await api.delete(`/admin/registration-periods/${periodId}`);
  return response.data;
}
