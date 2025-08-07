import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import Alert from "../../components/UI/Alert";

const SignupPage = () => {
  const [step, setStep] = useState(1); // 1: 이메일 인증, 2: 회원가입 폼
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    password: "",
    confirmPassword: "",
    name: "",
    department: "",
    studentId: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);

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

  const validateEmail = (email) => {
    const dguPattern = /@(dgu\.ac\.kr|dongguk\.edu)$/;
    return dguPattern.test(email);
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "dgu.ac.kr 또는 dongguk.edu 이메일만 사용 가능합니다.";
    }

    if (step === 1 && formData.verificationCode && !formData.verificationCode) {
      newErrors.verificationCode = "인증번호를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    if (!formData.name) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!formData.department) {
      newErrors.department = "학과를 입력해주세요.";
    }

    if (!formData.studentId) {
      newErrors.studentId = "학번을 입력해주세요.";
    }

    if (!formData.phone) {
      newErrors.phone = "전화번호를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendVerification = async (e) => {
    e.preventDefault();

    if (!validateStep1()) {
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // TODO: API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock API call

      setEmailVerified(true);
      setAlert({
        type: "success",
        message: "인증번호가 이메일로 전송되었습니다. 이메일을 확인해주세요.",
      });
    } catch {
      setAlert({
        type: "error",
        message: "인증번호 전송에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (!formData.verificationCode) {
      setErrors({ verificationCode: "인증번호를 입력해주세요." });
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // TODO: API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock API call

      setStep(2);
      setAlert({
        type: "success",
        message: "이메일 인증이 완료되었습니다.",
      });
    } catch {
      setAlert({
        type: "error",
        message: "인증번호가 일치하지 않습니다. 다시 확인해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // TODO: API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Mock API call

      setAlert({
        type: "success",
        message: "회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.",
      });

      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch {
      setAlert({
        type: "error",
        message: "회원가입에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white flex">
      {/* Left Side - Signup Form */}
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
                <h1 className="text-xl font-bold text-gray-900">회원가입</h1>
                <p className="text-sm text-gray-600">
                  DGU AI Lab 계정을 만들어보세요
                </p>
              </div>
            </div>

            <div>
              {/* Step Indicator */}
              <div className="mb-8">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 text-sm font-medium ${
                      step >= 1
                        ? "bg-[#F68313] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    style={{ borderRadius: "2px" }}
                  >
                    1
                  </div>
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step >= 2 ? "bg-[#F68313]" : "bg-gray-200"
                    }`}
                  ></div>
                  <div
                    className={`flex items-center justify-center w-8 h-8 text-sm font-medium ${
                      step >= 2
                        ? "bg-[#F68313] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                    style={{ borderRadius: "2px" }}
                  >
                    2
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">이메일 인증</span>
                  <span className="text-xs text-gray-500">정보 입력</span>
                </div>
              </div>

              {alert && (
                <Alert
                  type={alert.type}
                  onClose={() => setAlert(null)}
                  className="mb-6"
                >
                  {alert.message}
                </Alert>
              )}

              {step === 1 ? (
                <form className="space-y-6" onSubmit={handleSendVerification}>
                  <Input
                    label="이메일"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="example@dgu.ac.kr"
                    help="dgu.ac.kr 또는 dongguk.edu 이메일만 사용 가능합니다."
                    disabled={emailVerified}
                    required
                  />

                  {emailVerified && (
                    <Input
                      label="인증번호"
                      name="verificationCode"
                      type="text"
                      value={formData.verificationCode}
                      onChange={handleChange}
                      error={errors.verificationCode}
                      placeholder="인증번호 6자리를 입력하세요"
                      help="이메일로 전송된 6자리 인증번호를 입력하세요."
                      required
                    />
                  )}

                  <div className="flex space-x-3">
                    {emailVerified && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="large"
                        className="flex-1"
                        onClick={handleSendVerification}
                        disabled={isLoading}
                      >
                        재전송
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      size="large"
                      className={emailVerified ? "flex-1" : "w-full"}
                      loading={isLoading}
                      disabled={isLoading}
                      onClick={emailVerified ? handleVerifyCode : undefined}
                    >
                      {emailVerified ? "인증" : "인증번호 전송"}
                    </Button>
                  </div>
                </form>
              ) : (
                <form className="space-y-6" onSubmit={handleSignup}>
                  <div className="grid grid-cols-1 gap-6">
                    <Input
                      label="이메일"
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-50"
                    />

                    <Input
                      label="비밀번호"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      placeholder="8자 이상의 비밀번호를 입력하세요"
                      required
                    />

                    <Input
                      label="비밀번호 확인"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      placeholder="비밀번호를 다시 입력하세요"
                      required
                    />

                    <Input
                      label="이름"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      placeholder="실명을 입력하세요"
                      required
                    />

                    <Input
                      label="학과"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      error={errors.department}
                      placeholder="예: 컴퓨터공학과"
                      required
                    />

                    <Input
                      label="학번"
                      name="studentId"
                      type="text"
                      value={formData.studentId}
                      onChange={handleChange}
                      error={errors.studentId}
                      placeholder="예: 2021123456"
                      required
                    />

                    <Input
                      label="전화번호"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      placeholder="예: 010-1234-5678"
                      required
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="large"
                      className="flex-1"
                      onClick={() => setStep(1)}
                    >
                      이전
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="large"
                      className="flex-1"
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      회원가입
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  이미 계정이 있으신가요?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-[#F68313] hover:text-[#E6750F]"
                  >
                    로그인
                  </Link>
                </p>
              </div>

              {/* Additional Info */}
              <div className="mt-8 text-center text-xs text-gray-500">
                <p>
                  회원가입 후 관리자 승인을 받아야 서비스를 이용할 수 있습니다.
                </p>
                <p className="mt-1">
                  관리자 권한이 필요한 경우 서버실에서 직접 권한을 변경해야
                  합니다.
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

export default SignupPage;
