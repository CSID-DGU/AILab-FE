import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Badge from "../components/UI/Badge";
import Alert from "../components/UI/Alert";
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ServerIcon,
  CalendarIcon,
  CpuChipIcon,
  CircleStackIcon,
  ComputerDesktopIcon,
  UsersIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const RequestStatusPage = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, FULFILLED, DENIED

  useEffect(() => {
    // Mock API call to fetch user's requests
    const fetchRequests = async () => {
      setLoading(true);

      // Mock data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockRequests = [
        {
          request_id: 1,
          user_id: user?.user_id,
          node_id: "LAB1",
          image_name: "ubuntu",
          image_version: "20.04",
          ubuntu_gid: 1002,
          ubuntu_username: "user123",
          expires_at: "2024-12-31T00:00:00Z",
          volume_size_byte: 500000000000, // 500GB
          cuda_version: "11.8",
          usage_purpose: "딥러닝 모델 훈련을 위한 GPU 서버 사용",
          form_answers: {
            additional_info:
              "PyTorch와 TensorFlow를 사용한 이미지 분류 모델 학습",
          },
          approved_at: "2024-01-20T10:30:00Z",
          status: "FULFILLED",
          comment: null,
          created_at: "2024-01-15T14:20:00Z",
          updated_at: "2024-01-20T10:30:00Z",
          nodeInfo: {
            memory_size_GB: 64,
            CPU_core_count: 16,
            gpus: [
              { gpu_model: "RTX 4090", RAM_GB: 24 },
              { gpu_model: "RTX 4090", RAM_GB: 24 },
            ],
          },
          groupInfo: {
            group_name: "researchers",
          },
          serverInfo: {
            address: "ailab1.dgu.ac.kr",
            port: "22001",
            username: "user123",
          },
        },
        {
          request_id: 2,
          user_id: user?.user_id,
          node_id: "FARM2",
          ubuntu_username: "user123_2",
          expires_at: "2024-11-30T00:00:00Z",
          volume_size_byte: 1000000000000, // 1TB
          cuda_version: "12.0",
          usage_purpose: "자연어처리 연구를 위한 대용량 데이터 처리",
          form_answers: {
            additional_info: "BERT, GPT 모델 파인튜닝 작업",
          },
          status: "PENDING",
          comment: null,
          created_at: "2024-08-01T09:15:00Z",
          updated_at: "2024-08-01T09:15:00Z",
          nodeInfo: {
            memory_size_GB: 128,
            CPU_core_count: 32,
            gpus: [
              { gpu_model: "A100", RAM_GB: 80 },
              { gpu_model: "A100", RAM_GB: 80 },
            ],
          },
        },
        {
          request_id: 3,
          user_id: user?.user_id,
          node_id: "LAB2",
          ubuntu_username: "user123_old",
          expires_at: "2024-06-30T00:00:00Z",
          volume_size_byte: 250000000000, // 250GB
          cuda_version: "11.7",
          usage_purpose: "컴퓨터 비전 프로젝트",
          form_answers: {
            additional_info: "OpenCV, YOLO 모델 실험",
          },
          status: "DENIED",
          comment: "리소스 부족으로 인한 거절. 다른 노드로 재신청 바랍니다.",
          created_at: "2024-05-15T16:45:00Z",
          updated_at: "2024-05-20T11:20:00Z",
          nodeInfo: {
            memory_size_GB: 32,
            CPU_core_count: 8,
            gpus: [{ gpu_model: "RTX 4080", RAM_GB: 16 }],
          },
        },
      ];

      setRequests(mockRequests);
      setLoading(false);
    };

    fetchRequests();
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "FULFILLED":
        return <Badge variant="success">승인됨</Badge>;
      case "PENDING":
        return <Badge variant="warning">대기중</Badge>;
      case "DENIED":
        return <Badge variant="danger">거절됨</Badge>;
      default:
        return <Badge variant="default">알 수 없음</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "FULFILLED":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "PENDING":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "DENIED":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatBytes = (bytes) => {
    return Math.round(bytes / (1024 * 1024 * 1024)) + " GB";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredRequests = requests
    .filter((request) => {
      if (filter === "ALL") return true;
      return request.status === filter;
    })
    .sort((a, b) => {
      // Sort by priority: PENDING > FULFILLED > DENIED
      const statusPriority = { PENDING: 1, FULFILLED: 2, DENIED: 3 };
      if (statusPriority[a.status] !== statusPriority[b.status]) {
        return statusPriority[a.status] - statusPriority[b.status];
      }
      // Within same status, sort by date (newest first)
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const statusCounts = {
    ALL: requests.length,
    PENDING: requests.filter((r) => r.status === "PENDING").length,
    FULFILLED: requests.filter((r) => r.status === "FULFILLED").length,
    DENIED: requests.filter((r) => r.status === "DENIED").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F68313] mx-auto"></div>
          <p className="mt-4 text-gray-600">신청 현황을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">신청 현황 조회</h1>
          <p className="text-gray-600 mt-1">
            서버 신청 내역과 승인 상태를 확인하세요.
          </p>
        </div>
        <Link to="/application">
          <Button
            variant="primary"
            className="bg-[#F68313] hover:bg-[#E6750F] border-[#F68313] hover:border-[#E6750F]"
          >
            <PlusIcon className="w-4 h-4 mr-1" />새 신청
          </Button>
        </Link>
      </div>

      {/* Status Filter */}
      <Card>
        <div className="flex space-x-1">
          {[
            { key: "ALL", label: "전체" },
            { key: "PENDING", label: "대기중" },
            { key: "FULFILLED", label: "승인됨" },
            { key: "DENIED", label: "거절됨" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-[#F68313] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label} ({statusCounts[tab.key]})
            </button>
          ))}
        </div>
      </Card>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "ALL"
                ? "신청 내역이 없습니다"
                : `${
                    filter === "PENDING"
                      ? "대기중인"
                      : filter === "FULFILLED"
                      ? "승인된"
                      : "거절된"
                  } 신청이 없습니다`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "ALL"
                ? "첫 번째 서버를 신청해보세요."
                : "다른 상태의 신청을 확인해보세요."}
            </p>
            {filter === "ALL" && (
              <Link to="/application">
                <Button
                  variant="primary"
                  className="bg-[#F68313] hover:bg-[#E6750F] border-[#F68313] hover:border-[#E6750F]"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  서버 신청하기
                </Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.request_id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(request.status)}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.node_id} - {request.ubuntu_username}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        신청일
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        만료일
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(request.expires_at).toLocaleDateString()}
                        {request.status === "FULFILLED" && (
                          <span
                            className={`ml-2 text-xs ${
                              getDaysUntilExpiry(request.expires_at) <= 7
                                ? "text-red-600"
                                : "text-gray-500"
                            }`}
                          >
                            (D-{getDaysUntilExpiry(request.expires_at)})
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        볼륨 크기
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {formatBytes(request.volume_size_byte)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        CUDA 버전
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {request.cuda_version}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                      사용 목적
                    </p>
                    <p className="text-sm text-gray-900">
                      {request.usage_purpose}
                    </p>
                  </div>

                  {/* Status-specific information */}
                  {request.status === "FULFILLED" && request.approved_at && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-4">
                      <div className="text-sm text-green-700">
                        <p className="font-medium mb-1">승인 완료</p>
                        <p>승인일: {formatDate(request.approved_at)}</p>
                        {request.serverInfo && (
                          <p>
                            접속 정보: {request.serverInfo.address}:
                            {request.serverInfo.port}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {request.status === "DENIED" && request.comment && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
                      <div className="text-sm text-red-700">
                        <p className="font-medium mb-1">거절 사유</p>
                        <p>{request.comment}</p>
                      </div>
                    </div>
                  )}

                  {request.status === "PENDING" && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                      <div className="text-sm text-yellow-700">
                        <p className="font-medium mb-1">승인 대기 중</p>
                        <p>
                          관리자 검토가 진행 중입니다. 1-3일 정도 소요될 수
                          있습니다.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    상세보기
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    신청 상세 정보
                  </h2>
                  <p className="text-sm text-gray-600">
                    Request ID: {selectedRequest.request_id}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedRequest.status)}
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setSelectedRequest(null)}
                  >
                    닫기
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                    신청 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          우분투 계정명
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.ubuntu_username}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          노드
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.node_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          만료일
                        </p>
                        <p className="text-sm text-gray-900">
                          {new Date(
                            selectedRequest.expires_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          볼륨 크기
                        </p>
                        <p className="text-sm text-gray-900">
                          {formatBytes(selectedRequest.volume_size_byte)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          CUDA 버전
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.cuda_version}
                        </p>
                      </div>
                      {selectedRequest.groupInfo && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            그룹
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedRequest.groupInfo.group_name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">
                      사용 목적
                    </p>
                    <p className="text-sm text-gray-900 mt-1">
                      {selectedRequest.usage_purpose}
                    </p>
                  </div>
                  {selectedRequest.form_answers?.additional_info && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700">
                        추가 정보
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedRequest.form_answers.additional_info}
                      </p>
                    </div>
                  )}
                </div>

                {/* Hardware Information */}
                {selectedRequest.nodeInfo && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <ComputerDesktopIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                      하드웨어 정보
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3">
                        <div className="flex items-center mb-1">
                          <CpuChipIcon className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="text-sm font-medium text-blue-900">
                            CPU
                          </span>
                        </div>
                        <p className="text-sm text-blue-800">
                          {selectedRequest.nodeInfo.CPU_core_count} 코어
                        </p>
                      </div>
                      <div className="bg-green-50 p-3">
                        <div className="flex items-center mb-1">
                          <CircleStackIcon className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-sm font-medium text-green-900">
                            메모리
                          </span>
                        </div>
                        <p className="text-sm text-green-800">
                          {selectedRequest.nodeInfo.memory_size_GB} GB
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3">
                        <div className="flex items-center mb-1">
                          <CpuChipIcon className="w-4 h-4 text-purple-600 mr-1" />
                          <span className="text-sm font-medium text-purple-900">
                            GPU
                          </span>
                        </div>
                        <div className="text-sm text-purple-800">
                          {selectedRequest.nodeInfo.gpus?.map((gpu, idx) => (
                            <div key={idx}>
                              {gpu.gpu_model} ({gpu.RAM_GB}GB)
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Server Access Information (for approved requests) */}
                {selectedRequest.status === "FULFILLED" &&
                  selectedRequest.serverInfo && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <ServerIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                        서버 접속 정보
                      </h3>
                      <div className="bg-gray-50 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              서버 주소
                            </p>
                            <code className="block mt-1 p-2 bg-white border text-sm">
                              {selectedRequest.serverInfo.address}
                            </code>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              포트
                            </p>
                            <code className="block mt-1 p-2 bg-white border text-sm">
                              {selectedRequest.serverInfo.port}
                            </code>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              사용자명
                            </p>
                            <code className="block mt-1 p-2 bg-white border text-sm">
                              {selectedRequest.serverInfo.username}
                            </code>
                          </div>
                        </div>
                        {selectedRequest.image_name && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700">
                              컨테이너 이미지
                            </p>
                            <code className="block mt-1 p-2 bg-white border text-sm">
                              {selectedRequest.image_name}:
                              {selectedRequest.image_version}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Status History */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ClockIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                    처리 이력
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">
                        신청 제출: {formatDate(selectedRequest.created_at)}
                      </span>
                    </div>
                    {selectedRequest.approved_at && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">
                          승인 완료: {formatDate(selectedRequest.approved_at)}
                        </span>
                      </div>
                    )}
                    {selectedRequest.status === "DENIED" && (
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-900">
                          거절: {formatDate(selectedRequest.updated_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestStatusPage;
