import apiClient from "./api.js";

export const nodeService = {
  getAllNodes: () => apiClient.get("/api/admin/nodes"),
};
