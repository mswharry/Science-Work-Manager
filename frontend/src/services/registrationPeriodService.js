import api from "./api";

export async function listRegistrationPeriods() {
  const response = await api.get("/registration-periods");
  return response.data;
}

export async function getRegistrationPeriod(periodId) {
  const response = await api.get(`/registration-periods/${periodId}`);
  return response.data;
}
