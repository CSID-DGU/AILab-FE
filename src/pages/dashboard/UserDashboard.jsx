import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Badge from "../../components/UI/Badge";
import Alert from "../../components/UI/Alert";
import {
  ServerIcon,
  ClockIcon,
  PlusIcon,
  CogIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const UserDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call to fetch user dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);

      // Mock data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData = {
        totalServers: 2,
        activeServers: 1,
        approvedServers: [
          {
            request_id: 1,
            node_id: "LAB1",
            ubuntu_username: "user123",
            image_name: "ubuntu",
            image_version: "20.04",
            expires_at: "2024-12-31",
            volume_size_byte: 500000000000, // 500GB
            cuda_version: "11.8",
            usage_purpose: "딥러닝 모델 훈련",
            approved_at: "2024-01-15",
            status: "FULFILLED",
            created_at: "2024-01-10",
            serverInfo: {
              address: "ailab1.dgu.ac.kr",
              port: "22001",
              isActive: true,
            },
            nodeInfo: {
              memory_size_GB: 64,
              CPU_core_count: 16,
              gpus: [
                { gpu_model: "RTX 4090", RAM_GB: 24 },
                { gpu_model: "RTX 4090", RAM_GB: 24 },
              ],
            },
          },
          {
            request_id: 2,
            node_id: "FARM2",
            ubuntu_username: "user123_2",
            image_name: "pytorch",
            image_version: "1.12",
            expires_at: "2024-11-30",
            volume_size_byte: 1000000000000, // 1TB
            cuda_version: "11.7",
            usage_purpose: "자연어처리 연구",
            approved_at: "2024-02-20",
            status: "FULFILLED",
            created_at: "2024-02-15",
            serverInfo: {
              address: "ailab2.dgu.ac.kr",
              port: "22002",
              isActive: false,
            },
            nodeInfo: {
              memory_size_GB: 128,
              CPU_core_count: 32,
              gpus: [
                { gpu_model: "A100", RAM_GB: 80 },
                { gpu_model: "A100", RAM_GB: 80 },
                { gpu_model: "A100", RAM_GB: 80 },
                { gpu_model: "A100", RAM_GB: 80 },
              ],
            },
          },
        ],
        pendingRequests: [
          {
            request_id: 3,
            node_id: "LAB3",
            ubuntu_username: "user123_3",
            expires_at: "2024-10-31",
            volume_size_byte: 250000000000, // 250GB
            cuda_version: "12.0",
            usage_purpose: "컴퓨터 비전 연구",
            status: "PENDING",
            created_at: "2024-08-01",
          },
        ],
      };

      setDashboardData(mockData);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F68313] mx-auto"></div>
          <p className="mt-4 text-gray-600">대시보드 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "FULFILLED":
        return <Badge variant="success">승인완료</Badge>;
      case "PENDING":
        return <Badge variant="warning">승인대기</Badge>;
      case "DENIED":
        return <Badge variant="danger">거절됨</Badge>;
      default:
        return <Badge variant="default">알 수 없음</Badge>;
    }
  };

  const getServerStatusBadge = (isActive) => {
    return isActive ? (
      <Badge variant="success">활성</Badge>
    ) : (
      <Badge variant="danger">비활성</Badge>
    );
  };

  const formatBytes = (bytes) => {
    return Math.round(bytes / (1024 * 1024 * 1024)) + " GB";
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          안녕하세요, {user?.name || "사용자"}님!
        </h1>
        <p className="text-gray-600 mt-1">
          승인받은 서버 현황을 확인하고 관리하세요.
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="전체 서버">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ServerIcon className="w-8 h-8 text-[#F68313] mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.totalServers}
                </p>
                <p className="text-sm text-gray-600">승인받은 서버</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="활성 서버">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ComputerDesktopIcon className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.activeServers}
                </p>
                <p className="text-sm text-gray-600">현재 사용 가능</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="대기 중인 신청">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.pendingRequests.length}
                </p>
                <p className="text-sm text-gray-600">승인 대기 중</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Server Request Alert */}
      {dashboardData.approvedServers.length === 0 && (
        <Alert type="info" title="서버 신청 안내">
          아직 승인된 서버가 없습니다. 새로운 서버를 신청해보세요.
          <div className="mt-3">
            <Button
              variant="primary"
              size="small"
              className="bg-[#F68313] hover:bg-[#E6750F] border-[#F68313] hover:border-[#E6750F]"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              서버 신청하기
            </Button>
          </div>
        </Alert>
      )}

      {/* Approved Servers */}
      {dashboardData.approvedServers.length > 0 && (
        <Card title="승인받은 서버 목록">
          <div className="space-y-6">
            {dashboardData.approvedServers.map((server) => {
              const daysLeft = getDaysUntilExpiry(server.expires_at);
              const isExpiringSoon = daysLeft <= 7;

              return (
                <div
                  key={server.request_id}
                  className="border border-gray-300 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {server.node_id} - {server.ubuntu_username}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {server.usage_purpose}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {getStatusBadge(server.status)}
                      {getServerStatusBadge(server.serverInfo.isActive)}
                    </div>
                  </div>

                  {/* Server Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-3">
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        서버 주소
                      </p>
                      <p className="text-sm font-mono text-gray-900 mt-1">
                        {server.serverInfo.address}:{server.serverInfo.port}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3">
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        만료일
                      </p>
                      <p
                        className={`text-sm font-medium mt-1 ${
                          isExpiringSoon ? "text-red-600" : "text-gray-900"
                        }`}
                      >
                        {server.expires_at} (D-{daysLeft})
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3">
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        볼륨 크기
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatBytes(server.volume_size_byte)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3">
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        CUDA 버전
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {server.cuda_version}
                      </p>
                    </div>
                  </div>

                  {/* Hardware Specs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-3">
                      <div className="flex items-center">
                        <CpuChipIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-900">
                          CPU
                        </span>
                      </div>
                      <p className="text-sm text-blue-800 mt-1">
                        {server.nodeInfo.CPU_core_count} 코어
                      </p>
                    </div>
                    <div className="bg-green-50 p-3">
                      <div className="flex items-center">
                        <ComputerDesktopIcon className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-900">
                          메모리
                        </span>
                      </div>
                      <p className="text-sm text-green-800 mt-1">
                        {server.nodeInfo.memory_size_GB} GB
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3">
                      <div className="flex items-center">
                        <CpuChipIcon className="w-5 h-5 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-purple-900">
                          GPU
                        </span>
                      </div>
                      <div className="text-sm text-purple-800 mt-1">
                        {server.nodeInfo.gpus.map((gpu, idx) => (
                          <div key={idx}>
                            {gpu.gpu_model} ({gpu.RAM_GB}GB)
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Warning for expiring servers */}
                  {isExpiringSoon && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3">
                      <p className="text-sm text-red-700">
                        ⚠️ 서버 사용 기간이 {daysLeft}일 남았습니다. 연장이
                        필요한 경우 관리자에게 문의하세요.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-4">
                    <Button
                      variant="outline"
                      size="small"
                      className="border-[#F68313] text-[#F68313] hover:bg-[#F68313] hover:text-white"
                    >
                      접속 정보 복사
                    </Button>
                    <Button variant="outline" size="small">
                      사용 가이드
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Pending Requests */}
      {dashboardData.pendingRequests.length > 0 && (
        <Card title="승인 대기 중인 신청">
          <div className="space-y-4">
            {dashboardData.pendingRequests.map((request) => (
              <div
                key={request.request_id}
                className="border border-gray-300 p-4 bg-yellow-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {request.node_id} - {request.ubuntu_username}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {request.usage_purpose}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      신청일: {request.created_at}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card title="빠른 작업">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/application">
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col justify-center border-[#F68313] text-[#F68313] hover:bg-[#F68313] hover:text-white"
            >
              <PlusIcon className="w-5 h-5 mb-1" />
              <span className="text-sm">새 서버 신청</span>
            </Button>
          </Link>
          <Link to="/requests">
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col justify-center"
            >
              <ClipboardDocumentListIcon className="w-5 h-5 mb-1" />
              <span className="text-sm">신청 현황 조회</span>
            </Button>
          </Link>
          <Link to="/account">
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col justify-center"
            >
              <CogIcon className="w-5 h-5 mb-1" />
              <span className="text-sm">계정 설정</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default UserDashboard;
