import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import Alert from "../../components/UI/Alert";

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // TODO: API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock API call

      // Mock successful login
      const mockUser = {
        id: 1,
        name: "홍길동",
        email: formData.email,
        role: formData.email.includes("admin") ? "ADMIN" : "USER",
        department: "컴퓨터공학과",
        studentId: "2021123456",
      };

      onLogin(mockUser);
    } catch {
      setAlert({
        type: "error",
        message: "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Logo and Title */}
            <div className="flex items-center mb-8">
              <img
                src="/dongguk_university_logo.svg"
                alt="동국대학교 로고"
                className="h-12 w-auto mr-3"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">DGU AI Lab</h1>
                <p className="text-sm text-gray-600">
                  동국대학교 AI 연구실 관리 시스템
                </p>
              </div>
            </div>

            <div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {alert && (
                  <Alert type={alert.type} onClose={() => setAlert(null)}>
                    {alert.message}
                  </Alert>
                )}

                <Input
                  label="이메일"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="이메일을 입력하세요"
                  required
                />

                <Input
                  label="비밀번호"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="비밀번호를 입력하세요"
                  required
                />

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <Link
                      to="/forgot-password"
                      className="font-medium text-[#F68313] hover:text-[#E6750F]"
                    >
                      비밀번호를 잊으셨나요?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  로그인
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">또는</span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    계정이 없으신가요?{" "}
                    <Link
                      to="/signup"
                      className="font-medium text-[#F68313] hover:text-[#E6750F]"
                    >
                      회원가입
                    </Link>
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 text-center text-xs text-gray-500">
                <p>dgu.ac.kr 또는 dongguk.edu 이메일로만 로그인 가능합니다.</p>
                <p className="mt-1">
                  관리자 권한이 필요한 경우 담당자에게 문의하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Background Image */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/dongguk_university_picture_1.jpg"
          alt="동국대학교"
        />
        <div className="absolute inset-0 bg-[#F68313] opacity-20"></div>
      </div>
    </div>
  );
};

export default LoginPage;
