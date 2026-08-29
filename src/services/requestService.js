import apiClient from "./api.js";

// 신청·승인 API. 인증과 공통 오류 처리는 apiClient가 담당합니다.
export const requestService = {
  createRequest: (data) => apiClient.post("/api/requests", data),
  getResourceGroups: () => apiClient.get("/api/resources/groups"),
  getContainerImages: () => apiClient.get("/api/images"),
  getUserRequests: () => apiClient.get("/api/requests/my"),
  getAllRequests: () => apiClient.get("/api/admin/requests"),

  approveRequest: (data) =>
    apiClient.patch("/api/admin/requests/approve", data, {
      // 타임아웃은 안쪽 레이어보다 바깥쪽이 더 길어야 한다: config-server(550s)
      // < admin_be podWebClient(600s) < nginx/ingress(650s) < 여기(프론트).
      // 짧게 잡으면 백엔드가 아직 정상 처리 중인데 프론트가 먼저 포기해버린다.
      signal: AbortSignal.timeout(660_000),
    }),
  rejectRequest: (data) => apiClient.patch("/api/admin/requests/reject", data),

  createChangeRequest: (requestId, data) =>
    apiClient.post(`/api/requests/${requestId}/change`, data),
  getChangeRequests: () => apiClient.get("/api/admin/requests/change/all"),
  approveChangeRequest: (changeRequestId, adminComment) =>
    apiClient.patch("/api/admin/requests/change/approve", {
      changeRequestId,
      adminComment,
    }),
  rejectChangeRequest: (changeRequestId, adminComment) =>
    apiClient.patch("/api/admin/requests/change/reject", {
      changeRequestId,
      adminComment,
    }),
  getMyChangeRequests: () => apiClient.get("/api/requests/my/changes"),

  migrateRequest: (requestId, nodes, minImprovementRatio) =>
    apiClient.post(`/api/admin/requests/${requestId}/migrate`, {
      nodes,
      ...(minImprovementRatio != null && { minImprovementRatio }),
    }, {
      // nginx/ingress 프록시 타임아웃(650s)보다 길게 잡아야 백엔드가 정상
      // 처리 중일 때 프론트가 먼저 타임아웃돼버리는 걸 막을 수 있다.
      signal: AbortSignal.timeout(660_000),
    }),

  getGpuTypes: () => apiClient.get("/api/resources/gpu-types"),
  getGroups: () => apiClient.get("/api/groups"),
  checkUbuntuUsername: (username) =>
    apiClient.get("/api/requests/config/check-username", { username }),
  createGroup: (groupName, ubuntuUsername) =>
    apiClient.post("/api/groups", {
      groupName,
      ...(ubuntuUsername && { ubuntuUsername }),
    }),
  getDashboardServers: (status = "ALL") =>
    apiClient.get("/api/dashboard/me/servers", { status }),
  getApprovedRequests: () => apiClient.get("/api/requests/my/approved"),
};
