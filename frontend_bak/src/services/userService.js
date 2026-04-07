import api from "./api";
import { toBooleanQuery } from "../utils/formatters";

export async function listUsers(filters = {}) {
  const params = {};

  if (filters.role) {
    params.role = filters.role;
  }

  const isActive = toBooleanQuery(filters.is_active);
  const isApproved = toBooleanQuery(filters.is_approved);

  if (isActive !== undefined) {
    params.is_active = isActive;
  }

  if (isApproved !== undefined) {
    params.is_approved = isApproved;
  }

  const response = await api.get("/admin/users", { params });
  return response.data;
}

export async function approveUser(userId, payload) {
  const response = await api.put(`/admin/users/${userId}/approve`, payload);
  return response.data;
}

export async function toggleUserBlock(userId) {
  const response = await api.put(`/admin/users/${userId}/toggle-block`);
  return response.data;
}
