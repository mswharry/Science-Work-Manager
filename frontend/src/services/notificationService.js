import api from "./api";

export async function listNotifications() {
  const response = await api.get("/notifications");
  return response.data;
}

export async function createNotification(payload) {
  const response = await api.post("/admin/notifications", payload);
  return response.data;
}
