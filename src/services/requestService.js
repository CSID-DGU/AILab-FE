import apiClient from "./api.js";
import { authService } from "./authService.js";

// 서버 요청 관련 API 서비스
export const requestService = {
  // 서버 신청
  createRequest: async (requestData) => {
    try {
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await apiClient.request("/api/requests", {
        method: "POST",
        headers: {
          accept: "application/json;charset=UTF-8",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(requestData),
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "서버 신청에 실패했습니다.");
    }
  },

  // 리소스 그룹 목록 조회
  getResourceGroups: async () => {
    try {
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await apiClient.request("/api/resource-groups", {
        method: "GET",
        headers: {
          accept: "application/json;charset=UTF-8",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "리소스 그룹 조회에 실패했습니다.");
    }
  },

  // 컨테이너 이미지 목록 조회
  getContainerImages: async () => {
    try {
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await apiClient.request("/api/images", {
        method: "GET",
        headers: {
          accept: "application/json;charset=UTF-8",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "컨테이너 이미지 조회에 실패했습니다.");
    }
  },

  // 사용자의 요청 목록 조회
  getUserRequests: async () => {
    try {
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await apiClient.request("/api/users/me/requests", {
        method: "GET",
        headers: {
          accept: "application/json;charset=UTF-8",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "요청 목록 조회에 실패했습니다.");
    }
  },

  // 요청 변경 신청
  createChangeRequest: async (changeRequestData) => {
    try {
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        throw new Error("인증 토큰이 없습니다.");
      }

      const response = await apiClient.request("/api/change-requests", {
        method: "POST",
        headers: {
          accept: "application/json;charset=UTF-8",
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify(changeRequestData),
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "변경 요청에 실패했습니다.");
    }
  },
};
