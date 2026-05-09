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
