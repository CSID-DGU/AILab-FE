import apiClient from "./api.js";

// 인증 관련 API 서비스
export const authService = {
  // 토큰 관리
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },

  getAccessToken: () => {
    return localStorage.getItem("accessToken");
  },

  getRefreshToken: () => {
    return localStorage.getItem("refreshToken");
  },

  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  // 이메일 인증번호 발송
  sendEmailVerification: async (email) => {
    try {
      // POST 요청으로 이메일을 쿼리 파라미터로 전송 (curl과 동일)
      const response = await apiClient.postWithQuery("/api/auth/email/send", {
        email,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "인증번호 전송에 실패했습니다.");
    }
  },

  // 이메일 인증번호 검증
  verifyEmailCode: async (email, code) => {
    try {
      // POST 요청으로 이메일과 코드를 쿼리 파라미터로 전송 (curl과 동일)
      const response = await apiClient.postWithQuery("/api/auth/email/verify", {
        email,
        code,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "인증번호 검증에 실패했습니다.");
    }
  },

  // 회원가입
  register: async (userData) => {
    try {
      const response = await apiClient.post("/api/auth/register", {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        department: userData.department,
        studentId: userData.studentId,
        phone: userData.phone,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "회원가입에 실패했습니다.");
    }
  },

  // 로그인
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "로그인에 실패했습니다.");
    }
  },
};
