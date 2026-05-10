import api from "./api";

export async function loginApi(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function registerApi(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function getMeApi() {
  const response = await api.get("/users/me");
  return response.data;
}

export async function changePasswordApi(payload) {
  const response = await api.put("/users/me/password", payload);
  return response.data;
}
