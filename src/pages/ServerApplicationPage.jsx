import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Alert from "../components/UI/Alert";
import {
  ServerIcon,
  UserIcon,
  CalendarIcon,
  CpuChipIcon,
  CircleStackIcon,
  DocumentTextIcon,
  UsersIcon,
  ComputerDesktopIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const ServerApplicationPage = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ubuntu_username: "",
    node_id: "",
    expires_at: "",
    volume_size_gb: "",
    cuda_version: "",
    usage_purpose: "",
    ubuntu_gid: "",
    additional_info: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [availableNodes, setAvailableNodes] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [cudaVersions] = useState(["11.7", "11.8", "12.0", "12.1", "12.2"]);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const fetchInitialData = async () => {
      // Mock available nodes
      setAvailableNodes([
        {
          node_id: "LAB1",
          description: "GPU Lab 1 - RTX 4090 x2, 64GB RAM",
          memory_size_GB: 64,
          CPU_core_count: 16,
          available: true,
        },
        {
          node_id: "LAB2",
          description: "GPU Lab 2 - RTX 4080 x4, 128GB RAM",
          memory_size_GB: 128,
          CPU_core_count: 32,
          available: true,
        },
        {
          node_id: "FARM1",
          description: "Server Farm 1 - A100 x8, 256GB RAM",
          memory_size_GB: 256,
          CPU_core_count: 64,
          available: false,
        },
        {
          node_id: "FARM2",
          description: "Server Farm 2 - A100 x4, 128GB RAM",
          memory_size_GB: 128,
          CPU_core_count: 32,
          available: true,
        },
      ]);

      // Mock available groups
      setAvailableGroups([
        { ubuntu_gid: 1001, group_name: "default" },
        { ubuntu_gid: 1002, group_name: "researchers" },
        { ubuntu_gid: 1003, group_name: "students" },
        { ubuntu_gid: 1004, group_name: "faculty" },
      ]);

      // Set default expiry date (3 months from now)
      const defaultExpiry = new Date();
      defaultExpiry.setMonth(defaultExpiry.getMonth() + 3);
      setFormData((prev) => ({
        ...prev,
        expires_at: defaultExpiry.toISOString().split("T")[0],
      }));
    };

    fetchInitialData();
  }, []);

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

    if (!formData.ubuntu_username.trim()) {
      newErrors.ubuntu_username = "우분투 계정명을 입력해주세요.";
    } else if (!/^[a-z][a-z0-9_-]*[a-z0-9]$/.test(formData.ubuntu_username)) {
      newErrors.ubuntu_username =
        "유효한 우분투 계정명을 입력해주세요. (소문자, 숫자, _, - 만 사용 가능)";
    }

    if (!formData.node_id) {
      newErrors.node_id = "사용할 노드를 선택해주세요.";
    }

    if (!formData.expires_at) {
      newErrors.expires_at = "사용 만료일을 선택해주세요.";
    } else {
      const expiryDate = new Date(formData.expires_at);
      const today = new Date();
      if (expiryDate <= today) {
        newErrors.expires_at = "만료일은 오늘 이후 날짜여야 합니다.";
      }
    }

    if (!formData.volume_size_gb) {
      newErrors.volume_size_gb = "볼륨 크기를 입력해주세요.";
    } else {
      const size = parseInt(formData.volume_size_gb);
      if (isNaN(size) || size < 10 || size > 2000) {
        newErrors.volume_size_gb = "볼륨 크기는 10GB ~ 2000GB 사이여야 합니다.";
      }
    }

    if (!formData.cuda_version) {
      newErrors.cuda_version = "CUDA 버전을 선택해주세요.";
    }

    if (!formData.usage_purpose.trim()) {
      newErrors.usage_purpose = "사용 목적을 입력해주세요.";
    } else if (formData.usage_purpose.length < 10) {
      newErrors.usage_purpose = "사용 목적을 10자 이상 입력해주세요.";
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
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Mock API call

      // Create request data matching DDL structure
      const requestData = {
        user_id: user?.user_id,
        node_id: formData.node_id,
        ubuntu_username: formData.ubuntu_username,
        expires_at: formData.expires_at,
        volume_size_byte:
          parseInt(formData.volume_size_gb) * 1024 * 1024 * 1024, // Convert GB to bytes
        cuda_version: formData.cuda_version,
        usage_purpose: formData.usage_purpose,
        ubuntu_gid: formData.ubuntu_gid || null,
        form_answers: {
          additional_info: formData.additional_info,
        },
      };

      console.log("Request data:", requestData);

      setAlert({
        type: "success",
        message:
          "서버 신청이 성공적으로 제출되었습니다. 관리자 승인을 기다려주세요.",
      });

      // 3초 후 대시보드로 이동
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch {
      setAlert({
        type: "error",
        message: "서버 신청에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNodeStatusBadge = (available) => {
    return available ? (
      <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
        사용 가능
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800">
        사용 불가
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">서버 신청</h1>
        <p className="text-gray-600 mt-1">
          AI 연구를 위한 GPU 서버를 신청하세요.
        </p>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          onClose={() => setAlert(null)}
          title={alert.type === "success" ? "신청 완료" : "신청 실패"}
        >
          {alert.message}
        </Alert>
      )}

      {/* Application Form */}
      <Card
        title="서버 신청서"
        subtitle="모든 필수 항목을 정확히 입력해주세요."
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-[#F68313]" />
              기본 정보
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="우분투 계정명"
                name="ubuntu_username"
                type="text"
                value={formData.ubuntu_username}
                onChange={handleChange}
                error={errors.ubuntu_username}
                placeholder="예: john_doe123"
                help="소문자, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능"
                required
                icon={UserIcon}
              />

              <Input
                label="사용 만료일"
                name="expires_at"
                type="date"
                value={formData.expires_at}
                onChange={handleChange}
                error={errors.expires_at}
                help="서버 사용 종료 예정일"
                required
                icon={CalendarIcon}
              />
            </div>
          </div>

          {/* Server Configuration Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ServerIcon className="w-5 h-5 mr-2 text-[#F68313]" />
              서버 설정
            </h3>

            <div className="space-y-6">
              {/* Node Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ComputerDesktopIcon className="w-4 h-4 inline mr-1" />
                  사용할 노드 *
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {availableNodes.map((node) => (
                    <div key={node.node_id} className="relative">
                      <input
                        type="radio"
                        id={node.node_id}
                        name="node_id"
                        value={node.node_id}
                        checked={formData.node_id === node.node_id}
                        onChange={handleChange}
                        disabled={!node.available}
                        className="sr-only"
                      />
                      <label
                        htmlFor={node.node_id}
                        className={`block p-4 border cursor-pointer transition-all ${
                          !node.available
                            ? "bg-gray-50 border-gray-200 cursor-not-allowed"
                            : formData.node_id === node.node_id
                            ? "border-[#F68313] bg-orange-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900">
                                {node.node_id}
                              </span>
                              <div className="ml-2">
                                {getNodeStatusBadge(node.available)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {node.description}
                            </p>
                            <div className="flex space-x-4 text-xs text-gray-500 mt-2">
                              <span>CPU: {node.CPU_core_count} 코어</span>
                              <span>메모리: {node.memory_size_GB}GB</span>
                            </div>
                          </div>
                          {formData.node_id === node.node_id && (
                            <div className="w-4 h-4 border-2 border-[#F68313] rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-[#F68313] rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {errors.node_id && (
                  <p className="text-sm text-red-600 mt-1">{errors.node_id}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="볼륨 크기 (GB)"
                  name="volume_size_gb"
                  type="number"
                  value={formData.volume_size_gb}
                  onChange={handleChange}
                  error={errors.volume_size_gb}
                  placeholder="예: 500"
                  help="10GB ~ 2000GB 사이"
                  min="10"
                  max="2000"
                  required
                  icon={CircleStackIcon}
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <CpuChipIcon className="w-4 h-4 inline mr-1" />
                    CUDA 버전 *
                  </label>
                  <select
                    name="cuda_version"
                    value={formData.cuda_version}
                    onChange={handleChange}
                    className={`block w-full px-3 py-2 border text-sm h-[38px] focus:outline-none focus:ring-2 focus:ring-[#F68313] focus:border-[#F68313] ${
                      errors.cuda_version
                        ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="">CUDA 버전을 선택하세요</option>
                    {cudaVersions.map((version) => (
                      <option key={version} value={version}>
                        CUDA {version}
                      </option>
                    ))}
                  </select>
                  {errors.cuda_version && (
                    <p className="text-sm text-red-600">
                      {errors.cuda_version}
                    </p>
                  )}
                  {!errors.cuda_version && (
                    <p className="text-sm text-gray-500">
                      필요한 CUDA 버전을 선택하세요
                    </p>
                  )}
                </div>
              </div>

              {/* Optional Group Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UsersIcon className="w-4 h-4 inline mr-1" />
                  그룹 (선택사항)
                </label>
                <select
                  name="ubuntu_gid"
                  value={formData.ubuntu_gid}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F68313] focus:border-[#F68313]"
                >
                  <option value="">그룹을 선택하세요 (선택사항)</option>
                  {availableGroups.map((group) => (
                    <option key={group.ubuntu_gid} value={group.ubuntu_gid}>
                      {group.group_name} (GID: {group.ubuntu_gid})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  특정 그룹에 속하고 싶은 경우 선택하세요
                </p>
              </div>
            </div>
          </div>

          {/* Usage Information Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2 text-[#F68313]" />
              사용 정보
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사용 목적 *
                </label>
                <textarea
                  name="usage_purpose"
                  value={formData.usage_purpose}
                  onChange={handleChange}
                  rows={4}
                  className={`block w-full px-3 py-2 border text-sm focus:outline-none focus:ring-2 focus:ring-[#F68313] focus:border-[#F68313] ${
                    errors.usage_purpose
                      ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 text-gray-900"
                  }`}
                  placeholder="서버를 어떤 목적으로 사용할지 자세히 설명해주세요. (최소 10자)"
                  required
                />
                {errors.usage_purpose && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.usage_purpose}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  연구 내용, 사용할 프레임워크, 예상 작업량 등을 포함해주세요
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  추가 정보 (선택사항)
                </label>
                <textarea
                  name="additional_info"
                  value={formData.additional_info}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F68313] focus:border-[#F68313]"
                  placeholder="추가로 전달하고 싶은 정보가 있다면 입력해주세요"
                />
                <p className="text-xs text-gray-500 mt-1">
                  특별한 요구사항이나 참고사항이 있다면 입력해주세요
                </p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex items-start">
              <ClockIcon className="w-5 h-5 text-blue-400 mt-0.5 mr-2" />
              <div className="text-sm text-blue-700">
                <h4 className="font-medium mb-2">신청 전 확인사항</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>신청 후 관리자 승인까지 1-3일이 소요될 수 있습니다.</li>
                  <li>승인 후 서버 접속 정보가 이메일로 전송됩니다.</li>
                  <li>컨테이너 이미지는 승인 시 관리자가 지정합니다.</li>
                  <li>
                    데이터 백업은 사용자 책임이며, 정기적으로 백업하시기
                    바랍니다.
                  </li>
                  <li>
                    서버 사용 규정을 준수해야 하며, 위반 시 사용이 제한될 수
                    있습니다.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-300">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
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
              <ServerIcon className="w-4 h-4 mr-1" />
              신청 제출
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ServerApplicationPage;
