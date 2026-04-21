import api from "./api";

export async function listPaperClassificationGroups() {
  const response = await api.get("/classifications/paper-groups");
  return response.data;
}
