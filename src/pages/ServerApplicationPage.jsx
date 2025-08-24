import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import Alert from "../components/UI/Alert";
import { requestService } from "../services/requestService";
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
  PencilSquareIcon,
  CheckCircleIcon,
  XMarkIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

const ServerApplicationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("new"); // "new" 또는 "change"
  const [formData, setFormData] = useState({
    ubuntu_username: "",
    ubuntu_password: "",
    rsgroup_id: "",
    image_id: "",
    expires_at: "",
    volume_size_gb: "",
    usage_purpose: "",
    ubuntu_gids: [], // 배열로 변경
  });
  const [changeFormData, setChangeFormData] = useState({
    request_id: "",
    change_type: "",
    new_value: "",
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [resourceGroups, setResourceGroups] = useState([]);
  const [gpuTypes, setGpuTypes] = useState([]); // GPU 타입 목록 (server_name별 분리)
  const [containerImages, setContainerImages] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [userRequests, setUserRequests] = useState([]); // 사용자의 승인된 요청들

  useEffect(() => {
    // API에서 실제 데이터를 가져오는 함수
    const fetchInitialData = async () => {
      try {
        // 실제 API 호출
        const [gpuTypesResponse, imagesResponse, groupsResponse] =
          await Promise.all([
            requestService.getGpuTypes(),
            requestService.getContainerImages(),
            requestService.getGroups(),
          ]);

        console.log("GPU Types Response:", gpuTypesResponse);
        console.log("Images Response:", imagesResponse);
        console.log("Groups Response:", groupsResponse);

        if (gpuTypesResponse.status === 200) {
          // GPU Types 응답은 중첩된 구조: response.data.data
          const gpuData = gpuTypesResponse.data?.data || gpuTypesResponse.data;
          if (Array.isArray(gpuData)) {
            // API 응답에 gpuModel 필드가 없으므로 description에서 추출
            const processedGpuData = gpuData.map((gpu) => {
              // description에서 GPU 모델명 추출 (예: "RTX2080TI D6 11GB" → "RTX2080TI D6")
              let gpuModel = "Unknown GPU";
              if (gpu.description) {
                const parts = gpu.description.trim().split(" ");
                if (parts.length >= 2) {
                  gpuModel = parts.slice(0, 2).join(" "); // 첫 두 단어만 사용
                }
              }
              return {
                ...gpu,
                gpuModel,
              };
            });
            setGpuTypes(processedGpuData);
          } else {
            console.warn("GPU Types 데이터가 배열이 아닙니다:", gpuData);
            setGpuTypes([]);
          }
        } else {
          console.warn("GPU Types API 응답 실패:", gpuTypesResponse.status);
          setGpuTypes([]);
        }

        if (imagesResponse.status === 200) {
          // Container Images 응답도 중첩된 구조일 수 있음: response.data.data 또는 response.data
          const imageData = imagesResponse.data?.data || imagesResponse.data;
          if (Array.isArray(imageData)) {
            setContainerImages(imageData);
          } else {
            console.warn(
              "Container Images 데이터가 배열이 아닙니다:",
              imageData
            );
            setContainerImages([]);
          }
        } else {
          console.warn(
            "Container Images API 응답 실패:",
            imagesResponse.status
          );
          setContainerImages([]);
        }

        if (groupsResponse.status === 200) {
          // Groups 응답도 중첩된 구조일 수 있음: response.data.data 또는 response.data
          const groupData = groupsResponse.data?.data || groupsResponse.data;
          if (Array.isArray(groupData)) {
            // API 응답 구조에 맞게 변환: ubuntuGid -> ubuntu_gid, groupName -> group_name
            const processedGroups = groupData.map((group) => ({
              ubuntu_gid: group.ubuntuGid || group.ubuntu_gid,
              group_name: group.groupName || group.group_name,
            }));
            setAvailableGroups(processedGroups);
          } else {
            console.warn("Groups 데이터가 배열이 아닙니다:", groupData);
            setAvailableGroups([]);
          }
        } else {
          console.warn("Groups API 응답 실패:", groupsResponse.status);
          setAvailableGroups([]);
        }

        // Mock data for other components until APIs are available
        setResourceGroups([
          {
            rsgroup_id: 1,
            description: "RTX A3000 GPU 그룹",
            gpu_model: "RTX A3000",
            ram_gb: 12,
            nodes_count: 4,
            available: true,
          },
          {
            rsgroup_id: 2,
            description: "RTX 3090 GPU 그룹",
            gpu_model: "RTX 3090",
            ram_gb: 24,
            nodes_count: 2,
            available: true,
          },
        ]);

        setUserRequests([
          {
            request_id: 1,
            rsgroup_id: 1,
            image_id: 1,
            volume_size_gb: 500,
            expires_at: "2025-11-10",
            ubuntu_gids: [1001, 1003],
            status: "FULFILLED",
            gpu_model: "RTX A3000",
            image_name: "pytorch",
            image_version: "2.0-cuda11.8",
            group_names: ["default", "students"],
          },
          {
            request_id: 2,
            rsgroup_id: 2,
            image_id: 2,
            volume_size_gb: 1000,
            expires_at: "2025-12-15",
            ubuntu_gids: [1002],
            status: "FULFILLED",
            gpu_model: "RTX 3090",
            image_name: "tensorflow",
            image_version: "2.13-cuda11.8",
            group_names: ["researchers"],
          },
        ]);

        // Set default expiry date (3 months from now)
        const defaultExpiry = new Date();
        defaultExpiry.setMonth(defaultExpiry.getMonth() + 3);
        setFormData((prev) => ({
          ...prev,
          expires_at: defaultExpiry.toISOString().split("T")[0],
        }));
      } catch (error) {
        console.error("초기 데이터 로드 실패:", error);
        setAlert({
          type: "error",
          message: "초기 데이터를 불러오는데 실패했습니다.",
        });
      } finally {
        setIsInitialLoading(false);
      }
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

  const handleChangeFormChange = (e) => {
    const { name, value } = e.target;

    // change_type이 변경될 때 new_value 초기화
    if (name === "change_type") {
      const initialValue = value === "GROUPS" ? JSON.stringify([]) : "";
      setChangeFormData((prev) => ({
        ...prev,
        [name]: value,
        new_value: initialValue,
      }));
    } else {
      setChangeFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // 그룹 추가 핸들러
  const addGroup = (gid) => {
    if (activeTab === "new") {
      if (!formData.ubuntu_gids.includes(gid)) {
        setFormData((prev) => ({
          ...prev,
          ubuntu_gids: [...prev.ubuntu_gids, gid],
        }));
      }
    } else {
      // 변경 요청 탭에서는 new_value를 배열로 관리
      const currentGroups = changeFormData.new_value
        ? JSON.parse(changeFormData.new_value)
        : [];
      if (!currentGroups.includes(gid)) {
        const newGroups = [...currentGroups, gid];
        setChangeFormData((prev) => ({
          ...prev,
          new_value: JSON.stringify(newGroups),
        }));
      }
    }
  };

  // 그룹 제거 핸들러
  const removeGroup = (gid) => {
    if (activeTab === "new") {
      setFormData((prev) => ({
        ...prev,
        ubuntu_gids: prev.ubuntu_gids.filter((id) => id !== gid),
      }));
    } else {
      // 변경 요청 탭에서는 new_value를 배열로 관리
      const currentGroups = changeFormData.new_value
        ? JSON.parse(changeFormData.new_value)
        : [];
      const newGroups = currentGroups.filter((id) => id !== gid);
      setChangeFormData((prev) => ({
        ...prev,
        new_value: JSON.stringify(newGroups),
      }));
    }
  };

  // 그룹 선택 UI 컴포넌트
  const GroupSelector = ({ selectedGroups }) => {
    const getGroupName = (gid) => {
      const group = availableGroups.find((g) => g.ubuntu_gid === gid);
      return group ? group.group_name : `GID: ${gid}`;
    };

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <UsersIcon className="w-4 h-4 inline mr-1" />
          그룹 (선택사항)
        </label>

        {/* 선택된 그룹들 표시 */}
        {selectedGroups.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {selectedGroups.map((gid) => (
                <span
                  key={gid}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F68313] text-white"
                >
                  {getGroupName(gid)}
                  <button
                    type="button"
                    onClick={() => removeGroup(gid)}
                    className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-[#E6750F] focus:outline-none"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 그룹 선택 드롭다운 */}
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              addGroup(parseInt(e.target.value));
              e.target.value = ""; // 선택 후 초기화
            }
          }}
          className="block w-full px-3 py-2 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#F68313] focus:border-[#F68313]"
        >
          <option value="">그룹을 추가하려면 선택하세요</option>
          {availableGroups
            .filter((group) => !selectedGroups.includes(group.ubuntu_gid))
            .map((group) => (
              <option key={group.ubuntu_gid} value={group.ubuntu_gid}>
                {group.group_name} (GID: {group.ubuntu_gid})
              </option>
            ))}
        </select>

        <p className="text-xs text-gray-500 mt-1">
          {selectedGroups.length > 0
            ? `${selectedGroups.length}개 그룹이 선택됨. 뱃지의 X 버튼을 클릭하여 제거할 수 있습니다.`
            : "필요한 경우 하나 이상의 그룹을 선택할 수 있습니다."}
        </p>
      </div>
    );
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.ubuntu_username.trim()) {
      newErrors.ubuntu_username = "우분투 계정명을 입력해주세요.";
    } else if (!/^[a-z][a-z0-9_-]*[a-z0-9]$/.test(formData.ubuntu_username)) {
      newErrors.ubuntu_username =
        "유효한 우분투 계정명을 입력해주세요. (소문자, 숫자, _, - 만 사용 가능)";
    }

    if (!formData.ubuntu_password.trim()) {
      newErrors.ubuntu_password = "우분투 계정 비밀번호를 입력해주세요.";
    } else if (formData.ubuntu_password.length < 4) {
      newErrors.ubuntu_password = "비밀번호는 최소 4자 이상이어야 합니다.";
    }

    if (!formData.rsgroup_id) {
      newErrors.rsgroup_id = "GPU 기종을 선택해주세요.";
    }

    if (!formData.image_id) {
      newErrors.image_id = "컨테이너 이미지를 선택해주세요.";
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

    if (!formData.usage_purpose.trim()) {
      newErrors.usage_purpose = "사용 목적을 입력해주세요.";
    } else if (formData.usage_purpose.length < 10) {
      newErrors.usage_purpose = "사용 목적을 10자 이상 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateChangeForm = () => {
    const newErrors = {};

    if (!changeFormData.request_id) {
      newErrors.request_id = "변경할 서버를 선택해주세요.";
    }

    if (!changeFormData.change_type) {
      newErrors.change_type = "변경 항목을 선택해주세요.";
    }

    if (!changeFormData.new_value) {
      newErrors.new_value = "새로운 값을 입력해주세요.";
    } else {
      // 변경 타입별 유효성 검사
      if (changeFormData.change_type === "VOLUME_SIZE") {
        const size = parseInt(changeFormData.new_value);
        if (isNaN(size) || size < 10 || size > 2000) {
          newErrors.new_value = "볼륨 크기는 10GB ~ 2000GB 사이여야 합니다.";
        }
      } else if (changeFormData.change_type === "EXPIRES_AT") {
        const expiryDate = new Date(changeFormData.new_value);
        const today = new Date();
        if (expiryDate <= today) {
          newErrors.new_value = "만료일은 오늘 이후 날짜여야 합니다.";
        }
      }
    }

    if (!changeFormData.reason.trim()) {
      newErrors.reason = "변경 사유를 입력해주세요.";
    } else if (changeFormData.reason.length < 10) {
      newErrors.reason = "변경 사유를 10자 이상 입력해주세요.";
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
      // API 요청 데이터 구성 (curl 명령어와 일치)
      const requestData = {
        resourceGroupId: parseInt(formData.rsgroup_id),
        imageId: parseInt(formData.image_id),
        ubuntuUsername: formData.ubuntu_username,
        ubuntuPassword: formData.ubuntu_password,
        volumeSizeGiB: parseInt(formData.volume_size_gb),
        usagePurpose: formData.usage_purpose,
        formAnswers: {}, // 필요에 따라 추가 정보를 채울 수 있습니다
        expiresAt: new Date(formData.expires_at).toISOString(),
        ubuntuGids: formData.ubuntu_gids,
      };

      console.log("Request data:", requestData);

      // requestService를 사용하여 API 호출
      const response = await requestService.createRequest(requestData);

      if (response.status === 200) {
        // 폼 데이터 초기화
        setFormData({
          ubuntu_username: "",
          ubuntu_password: "",
          rsgroup_id: "",
          image_id: "",
          expires_at: "",
          volume_size_gb: "",
          usage_purpose: "",
          ubuntu_gids: [],
        });

        // 기본 만료일 다시 설정 (3개월 후)
        const defaultExpiry = new Date();
        defaultExpiry.setMonth(defaultExpiry.getMonth() + 3);
        setTimeout(() => {
          setFormData((prev) => ({
            ...prev,
            expires_at: defaultExpiry.toISOString().split("T")[0],
          }));
        }, 100);

        setAlert({
          type: "success",
          message:
            "서버 신청이 성공적으로 제출되었습니다. 관리자 승인을 기다려주세요.",
        });

        // 부드럽게 페이지 맨 위로 스크롤 (DashboardLayout의 main 요소를 대상으로)
        setTimeout(() => {
          // main 요소 찾기 (DashboardLayout의 overflow-auto가 적용된 요소)
          const mainElement =
            document.querySelector("main.overflow-auto") ||
            document.querySelector("main") ||
            document.querySelector('[class*="overflow-auto"]');

          if (mainElement) {
            // main 요소에 스크롤 적용
            mainElement.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          } else {
            // fallback: window 스크롤
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          }
        }, 100);
      } else {
        setAlert({
          type: "error",
          message: "서버 신청 중 오류가 발생했습니다. 다시 시도해주세요.",
        });
      }
    } catch (error) {
      console.error("Server application error:", error);
      setAlert({
        type: "error",
        message: "서버 신청에 실패했습니다. 입력하신 정보를 확인해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeSubmit = async (e) => {
    e.preventDefault();

    if (!validateChangeForm()) {
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // Get old value for comparison
      const selectedRequest = userRequests.find(
        (req) => req.request_id === parseInt(changeFormData.request_id)
      );

      let oldValue = "";
      if (changeFormData.change_type === "VOLUME_SIZE") {
        oldValue = selectedRequest.volume_size_gb;
      } else if (changeFormData.change_type === "EXPIRES_AT") {
        oldValue = selectedRequest.expires_at;
      } else if (changeFormData.change_type === "RSGROUP_ID") {
        oldValue = selectedRequest.rsgroup_id;
      } else if (changeFormData.change_type === "IMAGE_ID") {
        oldValue = selectedRequest.image_id;
      } else if (changeFormData.change_type === "GROUPS") {
        oldValue = JSON.stringify(selectedRequest.ubuntu_gids); // 배열을 JSON으로 변환
      }

      // Create change request data
      const changeRequestData = {
        request_id: parseInt(changeFormData.request_id),
        change_type: changeFormData.change_type,
        old_value: oldValue,
        new_value: changeFormData.new_value,
        reason: changeFormData.reason,
      };

      console.log("Change request data:", changeRequestData);

      // requestService를 사용하여 변경 요청 API 호출
      const response = await requestService.createChangeRequest(
        changeRequestData
      );

      if (response.status === 200) {
        setAlert({
          type: "success",
          message:
            "변경 요청이 성공적으로 제출되었습니다. 관리자 승인을 기다려주세요.",
        });

        // Reset form
        setChangeFormData({
          request_id: "",
          change_type: "",
          new_value: "",
          reason: "",
        });

        // 부드럽게 페이지 맨 위로 스크롤 (DashboardLayout의 main 요소를 대상으로)
        setTimeout(() => {
          // main 요소 찾기 (DashboardLayout의 overflow-auto가 적용된 요소)
          const mainElement =
            document.querySelector("main.overflow-auto") ||
            document.querySelector("main") ||
            document.querySelector('[class*="overflow-auto"]');

          if (mainElement) {
            // main 요소에 스크롤 적용
            mainElement.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          } else {
            // fallback: window 스크롤
            window.scrollTo({
              top: 0,
              left: 0,
              behavior: "smooth",
            });
          }
        }, 100);
      } else {
        setAlert({
          type: "error",
          message: "변경 요청 중 오류가 발생했습니다. 다시 시도해주세요.",
        });
      }
    } catch (error) {
      console.error("Change request error:", error);
      setAlert({
        type: "error",
        message: "변경 요청에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getNewValueInput = () => {
    const { change_type } = changeFormData;

    switch (change_type) {
      case "VOLUME_SIZE":
        return (
          <Input
            label="새로운 볼륨 크기 (GB)"
            name="new_value"
            type="number"
            value={changeFormData.new_value}
            onChange={handleChangeFormChange}
            error={errors.new_value}
            placeholder="예: 1000"
            help="10GB ~ 2000GB 사이"
            min="10"
            max="2000"
            required
            icon={CircleStackIcon}
          />
        );
      case "EXPIRES_AT":
        return (
          <Input
            label="새로운 만료일"
            name="new_value"
            type="date"
            value={changeFormData.new_value}
            onChange={handleChangeFormChange}
            error={errors.new_value}
            help="서버 사용 종료 예정일"
            required
            icon={CalendarIcon}
          />
        );
      case "RSGROUP_ID":
        return (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              <CpuChipIcon className="w-4 h-4 inline mr-1" />
              새로운 GPU 기종 *
            </label>
            <select
              name="new_value"
              value={changeFormData.new_value}
              onChange={handleChangeFormChange}
              className={`block w-full px-3 py-2 border text-sm h-[38px] focus:outline-none focus:ring-2 focus:ring-[#F68313] focus:border-[#F68313] ${
                errors.new_value
                  ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 text-gray-900"
              }`}
              required
            >
              <option value="">GPU 기종을 선택하세요</option>
              {resourceGroups.map((group) => (
                <option key={group.rsgroup_id} value={group.rsgroup_id}>
                  {group.gpu_model} ({group.ram_gb}GB, {group.nodes_count}개
                  노드)
                </option>
              ))}
            </select>
            {errors.new_value && (
              <p className="text-sm text-red-600">{errors.new_value}</p>
            )}
          </div>
        );
      case "IMAGE_ID":
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              <ComputerDesktopIcon className="w-4 h-4 inline mr-1" />
              새로운 컨테이너 이미지 *
            </label>

            {/* 컨테이너 이미지가 로드되지 않았을 때 */}
            {!containerImages || containerImages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F68313] mx-auto mb-2"></div>
                컨테이너 이미지 정보를 불러오는 중...
              </div>
            ) : (
              /* 컨테이너 이미지를 프레임워크별로 그룹화하여 표시 */
              Object.entries(
                containerImages.reduce((acc, image) => {
                  // API 응답의 구조에 따라 필드명 조정
                  const frameworkName =
                    image.imageName || image.image_name || "Unknown";
                  const imageId = image.imageId || image.image_id;
                  const imageVersion =
                    image.imageVersion || image.image_version;
                  const cudaVersion = image.cudaVersion || image.cuda_version;
                  const description = image.description;

                  if (!acc[frameworkName]) {
                    acc[frameworkName] = [];
                  }
                  acc[frameworkName].push({
                    ...image,
                    imageId,
                    imageName: frameworkName,
                    imageVersion,
                    cudaVersion,
                    description,
                  });
                  return acc;
                }, {})
              ).map(([frameworkName, frameworkImages]) => (
                <div key={frameworkName} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
                    <ComputerDesktopIcon className="w-4 h-4 mr-2 text-[#F68313]" />
                    {frameworkName.charAt(0).toUpperCase() +
                      frameworkName.slice(1)}
                  </h4>

                  <div className="grid grid-cols-1 gap-2">
                    {frameworkImages.map((image) => (
                      <div
                        key={`change-${frameworkName}-${image.imageId}`}
                        className="relative"
                      >
                        <input
                          type="radio"
                          id={`change_image_${image.imageId}`}
                          name="new_value"
                          value={image.imageId}
                          checked={
                            changeFormData.new_value ===
                            image.imageId.toString()
                          }
                          onChange={handleChangeFormChange}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`change_image_${image.imageId}`}
                          className={`block p-3 border cursor-pointer transition-all ${
                            changeFormData.new_value ===
                            image.imageId.toString()
                              ? "border-[#F68313] bg-orange-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900 text-sm">
                                  {image.imageName} {image.imageVersion}
                                </span>
                              </div>
                              {image.description && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {image.description}
                                </p>
                              )}
                              <div className="flex space-x-4 text-xs text-gray-500 mt-1">
                                <span>CUDA: {image.cudaVersion}</span>
                                <span>ID: {image.imageId}</span>
                              </div>
                            </div>
                            {changeFormData.new_value ===
                              image.imageId.toString() && (
                              <div className="w-4 h-4 border-2 border-[#F68313] rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-[#F68313] rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            {errors.new_value && (
              <p className="text-sm text-red-600">{errors.new_value}</p>
            )}
          </div>
        );
      case "GROUPS": {
        const currentGroups = changeFormData.new_value
          ? JSON.parse(changeFormData.new_value)
          : [];
        return <GroupSelector selectedGroups={currentGroups} />;
      }
      default:
        return null;
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F68313] mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">서버 관리</h1>
        <p className="text-gray-600 mt-1">
          새로운 서버를 신청하거나 기존 서버 정보를 변경하세요.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => {
              setActiveTab("new");
              setAlert(null);
              setErrors({});
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "new"
                ? "border-[#F68313] text-[#F68313]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <ServerIcon className="w-5 h-5 inline mr-2" />
            서버 신청서
          </button>
          <button
            onClick={() => {
              setActiveTab("change");
              setAlert(null);
              setErrors({});
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "change"
                ? "border-[#F68313] text-[#F68313]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <PencilSquareIcon className="w-5 h-5 inline mr-2" />
            승인된 서버 정보 변경
          </button>
        </nav>
      </div>

      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          onClose={() => setAlert(null)}
          title={
            alert.type === "success"
              ? activeTab === "new"
                ? "신청 완료"
                : "변경 요청 완료"
              : activeTab === "new"
              ? "신청 실패"
              : "변경 요청 실패"
          }
        >
          {alert.message}
        </Alert>
      )}

      {/* Tab Content */}
      {activeTab === "new" ? (
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
                  label="우분투 계정 비밀번호"
                  name="ubuntu_password"
                  type="password"
                  value={formData.ubuntu_password}
                  onChange={handleChange}
                  error={errors.ubuntu_password}
                  placeholder="비밀번호를 입력하세요"
                  help="최소 4자 이상 입력해주세요"
                  required
                  icon={KeyIcon}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 mt-6">
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
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-20 flex items-center">
                <ServerIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                리소스 선택
              </h3>

              <div className="space-y-6">
                {/* Resource Group Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CpuChipIcon className="w-4 h-4 inline mr-1" />
                    GPU 기종 선택 *
                  </label>

                  {/* GPU 타입이 로드되지 않았을 때 */}
                  {!gpuTypes || gpuTypes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F68313] mx-auto mb-2"></div>
                      GPU 리소스 정보를 불러오는 중...
                    </div>
                  ) : (
                    /* GPU 타입을 서버별로 그룹화하여 표시 */
                    Object.entries(
                      gpuTypes.reduce((acc, gpu) => {
                        if (!acc[gpu.serverName]) {
                          acc[gpu.serverName] = [];
                        }
                        acc[gpu.serverName].push(gpu);
                        return acc;
                      }, {})
                    ).map(([serverName, serverGpus]) => (
                      <div key={serverName} className="mb-6">
                        <h4 className="text-base font-medium text-gray-800 mb-3 flex items-center">
                          <ServerIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                          {serverName} 서버
                        </h4>

                        <div className="grid grid-cols-1 gap-3">
                          {/* 각 GPU 모델별로 그룹화 */}
                          {Object.entries(
                            serverGpus.reduce((acc, gpu) => {
                              const key = `${gpu.gpuModel}-${gpu.ramGb}GB`;
                              if (!acc[key]) {
                                acc[key] = {
                                  ...gpu,
                                  availableNodes: 0,
                                  nodeIds: [],
                                };
                              }
                              acc[key].availableNodes +=
                                gpu.availableNodes || 0;
                              acc[key].nodeIds.push(gpu.nodeId);
                              return acc;
                            }, {})
                          ).map(([gpuKey, gpuGroup]) => (
                            <div
                              key={`${serverName}-${gpuKey}`}
                              className="relative"
                            >
                              <input
                                type="radio"
                                id={`rsgroup_${gpuGroup.rsgroupId}`}
                                name="rsgroup_id"
                                value={gpuGroup.rsgroupId}
                                checked={
                                  formData.rsgroup_id ===
                                  gpuGroup.rsgroupId.toString()
                                }
                                onChange={handleChange}
                                disabled={gpuGroup.availableNodes === 0}
                                className="sr-only"
                              />
                              <label
                                htmlFor={`rsgroup_${gpuGroup.rsgroupId}`}
                                className={`block p-4 border cursor-pointer transition-all ${
                                  gpuGroup.availableNodes === 0
                                    ? "bg-gray-50 border-gray-200 cursor-not-allowed"
                                    : formData.rsgroup_id ===
                                      gpuGroup.rsgroupId.toString()
                                    ? "border-[#F68313] bg-orange-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center">
                                      <span className="font-medium text-gray-900">
                                        {gpuGroup.gpuModel}
                                      </span>
                                      <div className="ml-2">
                                        {gpuGroup.availableNodes > 0 ? (
                                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                                            사용 가능
                                          </span>
                                        ) : (
                                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800">
                                            사용 불가
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {gpuGroup.description}
                                    </p>
                                    <div className="flex space-x-4 text-xs text-gray-500 mt-2">
                                      <span>
                                        GPU 메모리: {gpuGroup.ramGb}GB
                                      </span>
                                      <span>
                                        사용 가능 노드:{" "}
                                        {gpuGroup.availableNodes}개
                                      </span>
                                      <span>
                                        노드 ID: {gpuGroup.nodeIds.join(", ")}
                                      </span>
                                    </div>
                                  </div>
                                  {formData.rsgroup_id ===
                                    gpuGroup.rsgroupId.toString() && (
                                    <div className="w-4 h-4 border-2 border-[#F68313] rounded-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-[#F68313] rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}

                  {errors.rsgroup_id && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.rsgroup_id}
                    </p>
                  )}
                </div>

                {/* Container Image Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 mt-10">
                    <ComputerDesktopIcon className="w-4 h-4 inline mr-1" />
                    컨테이너 이미지 *
                  </label>

                  {/* 컨테이너 이미지가 로드되지 않았을 때 */}
                  {!containerImages || containerImages.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F68313] mx-auto mb-2"></div>
                      컨테이너 이미지 정보를 불러오는 중...
                    </div>
                  ) : (
                    /* 컨테이너 이미지를 프레임워크별로 그룹화하여 표시 */
                    Object.entries(
                      containerImages.reduce((acc, image) => {
                        // API 응답의 구조에 따라 필드명 조정
                        const frameworkName =
                          image.imageName || image.image_name || "Unknown";
                        const imageId = image.imageId || image.image_id;
                        const imageVersion =
                          image.imageVersion || image.image_version;
                        const cudaVersion =
                          image.cudaVersion || image.cuda_version;
                        const description = image.description;

                        if (!acc[frameworkName]) {
                          acc[frameworkName] = [];
                        }
                        acc[frameworkName].push({
                          ...image,
                          imageId,
                          imageName: frameworkName,
                          imageVersion,
                          cudaVersion,
                          description,
                        });
                        return acc;
                      }, {})
                    ).map(([frameworkName, frameworkImages]) => (
                      <div key={frameworkName} className="mb-6">
                        <h4 className="text-base font-medium text-gray-800 mb-3 flex items-center">
                          <ComputerDesktopIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                          {frameworkName.charAt(0).toUpperCase() +
                            frameworkName.slice(1)}
                        </h4>

                        <div className="grid grid-cols-1 gap-3">
                          {frameworkImages.map((image) => (
                            <div
                              key={`${frameworkName}-${image.imageId}`}
                              className="relative"
                            >
                              <input
                                type="radio"
                                id={`image_${image.imageId}`}
                                name="image_id"
                                value={image.imageId}
                                checked={
                                  formData.image_id === image.imageId.toString()
                                }
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <label
                                htmlFor={`image_${image.imageId}`}
                                className={`block p-4 border cursor-pointer transition-all ${
                                  formData.image_id === image.imageId.toString()
                                    ? "border-[#F68313] bg-orange-50"
                                    : "border-gray-300 hover:border-gray-400"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center">
                                      <span className="font-medium text-gray-900">
                                        {image.imageName} {image.imageVersion}
                                      </span>
                                    </div>
                                    {image.description && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {image.description}
                                      </p>
                                    )}
                                    <div className="flex space-x-4 text-xs text-gray-500 mt-2">
                                      <span>CUDA: {image.cudaVersion}</span>
                                      <span>이미지 ID: {image.imageId}</span>
                                    </div>
                                  </div>
                                  {formData.image_id ===
                                    image.imageId.toString() && (
                                    <div className="w-4 h-4 border-2 border-[#F68313] rounded-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-[#F68313] rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}

                  {errors.image_id && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.image_id}
                    </p>
                  )}
                  {!errors.image_id && (
                    <p className="text-xs text-gray-500 mt-1">
                      연구에 필요한 프레임워크와 CUDA 버전을 고려하여 선택하세요
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6">
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
                </div>

                {/* Optional Group Selection */}
                <GroupSelector selectedGroups={formData.ubuntu_gids} />
              </div>
            </div>{" "}
            {/* Usage Information Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-20 flex items-center">
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
                    <li>
                      선택한 GPU 기종과 컨테이너 이미지에 따라 리소스가
                      할당됩니다.
                    </li>
                    <li>
                      컨테이너 이미지의 CUDA 버전과 GPU 호환성을 확인해주세요.
                    </li>
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
      ) : (
        /* Change Request Form */
        <Card
          title="서버 정보 변경 요청"
          subtitle="승인된 서버의 설정을 변경할 수 있습니다."
        >
          <form onSubmit={handleChangeSubmit} className="space-y-8">
            {/* Request Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                변경할 서버 선택
              </h3>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  승인된 서버 *
                </label>
                <select
                  name="request_id"
                  value={changeFormData.request_id}
                  onChange={handleChangeFormChange}
                  className={`block w-full px-3 py-2 border text-sm h-[38px] focus:outline-none focus:ring-2 focus:ring-[#F68313] focus:border-[#F68313] ${
                    errors.request_id
                      ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 text-gray-900"
                  }`}
                  required
                >
                  <option value="">변경할 서버를 선택하세요</option>
                  {userRequests.map((request) => (
                    <option key={request.request_id} value={request.request_id}>
                      {request.gpu_model} - {request.image_name}{" "}
                      {request.image_version} ({request.volume_size_gb}GB, 만료:{" "}
                      {request.expires_at}, 그룹:{" "}
                      {request.group_names.join(", ") || "없음"})
                    </option>
                  ))}
                </select>
                {errors.request_id && (
                  <p className="text-sm text-red-600">{errors.request_id}</p>
                )}
                {!errors.request_id && (
                  <p className="text-sm text-gray-500">
                    변경하고자 하는 승인된 서버를 선택하세요
                  </p>
                )}
              </div>
            </div>

            {/* Change Type Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PencilSquareIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                변경 항목
              </h3>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    변경할 항목 *
                  </label>
                  <select
                    name="change_type"
                    value={changeFormData.change_type}
                    onChange={handleChangeFormChange}
                    className={`block w-full px-3 py-2 border text-sm h-[38px] focus:outline-none focus:ring-2 focus:ring-[#F68313] focus:border-[#F68313] ${
                      errors.change_type
                        ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                        : "border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="">변경할 항목을 선택하세요</option>
                    <option value="VOLUME_SIZE">볼륨 크기</option>
                    <option value="EXPIRES_AT">사용 만료일</option>
                    <option value="RSGROUP_ID">GPU 기종</option>
                    <option value="IMAGE_ID">컨테이너 이미지</option>
                    <option value="GROUPS">그룹</option>
                  </select>
                  {errors.change_type && (
                    <p className="text-sm text-red-600">{errors.change_type}</p>
                  )}
                </div>

                {/* Dynamic input based on change type */}
                {changeFormData.change_type && <div>{getNewValueInput()}</div>}
              </div>
            </div>

            {/* Reason */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                변경 사유
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  변경 사유 *
                </label>
                <textarea
                  name="reason"
                  value={changeFormData.reason}
                  onChange={handleChangeFormChange}
                  rows={4}
                  className={`block w-full px-3 py-2 border text-sm focus:outline-none focus:ring-2 focus:ring-[#F68313] focus:border-[#F68313] ${
                    errors.reason
                      ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 text-gray-900"
                  }`}
                  placeholder="변경이 필요한 이유를 자세히 설명해주세요. (최소 10자)"
                  required
                />
                {errors.reason && (
                  <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  연구 진행 상황 변화, 리소스 부족, 기타 사유 등을 포함해주세요
                </p>
              </div>
            </div>

            {/* Important Notes for Change Request */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex items-start">
                <ClockIcon className="w-5 h-5 text-yellow-400 mt-0.5 mr-2" />
                <div className="text-sm text-yellow-700">
                  <h4 className="font-medium mb-2">변경 요청 주의사항</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      변경 요청 후 관리자 승인까지 1-3일이 소요될 수 있습니다.
                    </li>
                    <li>승인 전까지는 기존 설정으로 서버가 운영됩니다.</li>
                    <li>일부 변경사항은 서버 재시작이 필요할 수 있습니다.</li>
                    <li>변경 요청이 거절될 경우 사유가 안내됩니다.</li>
                    <li>
                      중요한 데이터는 변경 전에 반드시 백업하시기 바랍니다.
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
                <PencilSquareIcon className="w-4 h-4 mr-1" />
                변경 요청 제출
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ServerApplicationPage;
