import apiClient from "./api.js";

export const podService = {
  getAllPods: () => apiClient.get("/api/admin/pods"),
  getPod: (podName) => apiClient.get(`/api/admin/pods/${encodeURIComponent(podName)}`),
  getPodLogs: (podName, container) =>
    apiClient.get(`/api/admin/pods/${encodeURIComponent(podName)}/logs`, container ? { container } : undefined),
  getPodEvents: (podName) => apiClient.get(`/api/admin/pods/${encodeURIComponent(podName)}/events`),
  getProvisioningStatus: (username) => apiClient.get(`/pod-status/pods/${encodeURIComponent(username)}/status`),
  getActiveContainers: () => apiClient.get("/api/admin/requests/containers"),
  getUsage: () => apiClient.get("/api/admin/requests/usage"),
};
