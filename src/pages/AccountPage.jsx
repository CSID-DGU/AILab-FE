import { useState, useEffect } from "react";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Alert from "../components/UI/Alert";
import {
  UserIcon,
  LockClosedIcon,
  PhoneIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  IdentificationIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const AccountPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    department: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // 사용자 정보 로드
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        department: user.department || "",
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
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

  const validateProfileForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "전화번호를 입력해주세요.";
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
    }

    if (!formData.department.trim()) {
      newErrors.department = "학과를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "현재 비밀번호를 입력해주세요.";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "새 비밀번호를 입력해주세요.";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "비밀번호는 8자 이상이어야 합니다.";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfileForm()) {
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // TODO: API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock API call

      setAlert({
        type: "success",
        message: "프로필 정보가 성공적으로 업데이트되었습니다.",
      });
    } catch {
      setAlert({
        type: "error",
        message: "프로필 업데이트에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // TODO: API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock API call

      setAlert({
        type: "success",
        message: "비밀번호가 성공적으로 변경되었습니다.",
      });

      // 폼 초기화
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setAlert({
        type: "error",
        message: "비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "profile", name: "프로필 정보", icon: UserIcon },
    { id: "password", name: "비밀번호 변경", icon: LockClosedIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">계정 설정</h1>
        <p className="text-gray-600 mt-1">개인정보와 보안 설정을 관리하세요.</p>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          onClose={() => setAlert(null)}
          title={alert.type === "success" ? "성공" : "오류"}
        >
          {alert.message}
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-300">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-[#F68313] text-[#F68313]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <IconComponent
                    className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id
                        ? "text-[#F68313]"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  기본 정보
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  개인정보를 업데이트하세요. 이메일과 학번은 변경할 수 없습니다.
                </p>
              </div>

              {/* Read-only fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                    이메일
                  </label>
                  <div className="px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    {user?.email || "이메일 정보 없음"}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    이메일은 변경할 수 없습니다.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <IdentificationIcon className="w-4 h-4 inline mr-1" />
                    학번
                  </label>
                  <div className="px-3 py-2 border border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    {user?.studentId || "학번 정보 없음"}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    학번은 변경할 수 없습니다.
                  </p>
                </div>
              </div>

              {/* Editable form */}
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="이름"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleProfileChange}
                    error={errors.name}
                    placeholder="이름을 입력하세요"
                    required
                    icon={UserIcon}
                  />

                  <Input
                    label="전화번호"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    error={errors.phone}
                    placeholder="010-1234-5678"
                    required
                    icon={PhoneIcon}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="학과"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleProfileChange}
                      error={errors.department}
                      placeholder="학과를 입력하세요"
                      required
                      icon={AcademicCapIcon}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-300">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({
                        name: user?.name || "",
                        phone: user?.phone || "",
                        department: user?.department || "",
                      });
                      setErrors({});
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    disabled={isLoading}
                    className="bg-[#F68313] hover:bg-[#E6750F] border-[#F68313] hover:border-[#E6750F]"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    저장
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  비밀번호 변경
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  보안을 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <Input
                  label="현재 비밀번호"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  error={errors.currentPassword}
                  placeholder="현재 비밀번호를 입력하세요"
                  required
                  icon={LockClosedIcon}
                />

                <Input
                  label="새 비밀번호"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  error={errors.newPassword}
                  placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                  required
                  icon={LockClosedIcon}
                />

                <Input
                  label="새 비밀번호 확인"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  error={errors.confirmPassword}
                  placeholder="새 비밀번호를 다시 입력하세요"
                  required
                  icon={LockClosedIcon}
                />

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="text-sm text-blue-700">
                    <h4 className="font-medium mb-2">비밀번호 요구사항:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>최소 8자 이상</li>
                      <li>영문자, 숫자, 특수문자 조합 권장</li>
                      <li>개인정보와 관련없는 비밀번호 사용</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-300">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      setErrors({});
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    disabled={isLoading}
                    className="bg-[#F68313] hover:bg-[#E6750F] border-[#F68313] hover:border-[#E6750F]"
                  >
                    <LockClosedIcon className="w-4 h-4 mr-1" />
                    비밀번호 변경
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Card>

      {/* Account Status */}
      <Card title="계정 상태">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              계정 유형
            </h4>
            <div
              className={`inline-flex px-2 py-1 text-xs font-medium ${
                user?.role === "ADMIN"
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {user?.role === "ADMIN" ? "관리자" : "일반 사용자"}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              계정 상태
            </h4>
            <div
              className={`inline-flex px-2 py-1 text-xs font-medium ${
                user?.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {user?.is_active ? "활성" : "비활성"}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">가입일</h4>
            <p className="text-sm text-gray-600">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "정보 없음"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              최종 수정일
            </h4>
            <p className="text-sm text-gray-600">
              {user?.updated_at
                ? new Date(user.updated_at).toLocaleDateString()
                : "정보 없음"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccountPage;
