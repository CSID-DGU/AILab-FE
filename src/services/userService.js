import apiClient from "./api";
import { authService } from "./authService.js";

class UserService {
  // 모든 사용자 목록 조회 (관리자 전용)
  async getAllUsers() {
    const token = authService.getAccessToken();

    if (!token) {
      throw new Error("인증 토큰이 없습니다.");
    }

    try {
      console.log("사용자 목록 요청 시작...");
      console.log("사용 중인 토큰:", token);

      const response = await apiClient.request("/api/admin/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json;charset=UTF-8",
        },
      });

      console.log("사용자 목록 응답:", response);
      return response;
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error);
      throw error;
    }
  }

  // 사용자 상태 변경 (활성화/비활성화)
  async toggleUserStatus(userId, isActive) {
    const token = authService.getAccessToken();

    if (!token) {
      throw new Error("인증 토큰이 없습니다.");
    }

    try {
      const response = await apiClient.request(
        `/api/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive }),
        }
      );

      return response;
    } catch (error) {
      console.error("사용자 상태 변경 실패:", error);
      throw error;
    }
  }

  // 사용자 역할 변경
  async changeUserRole(userId, role) {
    const token = authService.getAccessToken();

    if (!token) {
      throw new Error("인증 토큰이 없습니다.");
    }

    try {
      const response = await apiClient.request(
        `/api/admin/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        }
      );

      return response;
    } catch (error) {
      console.error("사용자 역할 변경 실패:", error);
      throw error;
    }
  }

  // 사용자 삭제
  async deleteUser(userId) {
    const token = authService.getAccessToken();

    if (!token) {
      throw new Error("인증 토큰이 없습니다.");
    }

    try {
      const response = await apiClient.request(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (error) {
      console.error("사용자 삭제 실패:", error);
      throw error;
    }
  }
}

const userService = new UserService();
export default userService;
