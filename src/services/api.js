// API 기본 설정
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// API 클라이언트 클래스
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        // body가 빈 문자열이 아닐 때만 Content-Type 설정
        ...(options.body !== '' && { "Content-Type": "application/json" }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return this.request(url.pathname + url.search, {
      method: "GET",
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // POST 요청에 쿼리 파라미터 사용 (curl과 동일한 방식)
  async postWithQuery(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return this.request(url.pathname + url.search, {
      method: "POST",
      headers: {
        'accept': 'application/json;charset=UTF-8',
        // Content-Type은 빈 body일 때 제거
      },
      body: '', // 빈 body (curl -d '' 와 동일)
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  }
}

// API 클라이언트 인스턴스
const apiClient = new ApiClient();

export default apiClient;
