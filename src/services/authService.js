import apiClient from "./api.js";

// 인증 관련 API 서비스
export const authService = {
  // 이메일 인증번호 발송
  sendEmailVerification: async (email) => {
    try {
      // POST 요청으로 이메일을 쿼리 파라미터로 전송 (curl과 동일)
      const response = await apiClient.postWithQuery('/api/auth/email/send', { email });
      return response;
    } catch (error) {
      throw new Error(error.message || '인증번호 전송에 실패했습니다.');
    }
  },

  // 이메일 인증번호 검증 (추후 구현 예정)
  verifyEmailCode: async (email, code) => {
    try {
      // TODO: 실제 API 엔드포인트로 교체 필요
      const response = await apiClient.post("/api/auth/email/verify", {
        email,
        code,
      });
      return response;
    } catch (error) {
      throw new Error(error.message || "인증번호 검증에 실패했습니다.");
    }
  },

  // 회원가입 (추후 구현 예정)
  signup: async (userData) => {
    try {
      // TODO: 실제 API 엔드포인트로 교체 필요
      const response = await apiClient.post("/api/auth/signup", userData);
      return response;
    } catch (error) {
      throw new Error(error.message || "회원가입에 실패했습니다.");
    }
  },

  // 로그인 (추후 구현 예정)
  login: async (email, password) => {
    try {
      // TODO: 실제 API 엔드포인트로 교체 필요
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
