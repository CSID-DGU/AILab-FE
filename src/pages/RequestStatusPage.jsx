import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Badge from "../components/UI/Badge";
import Alert from "../components/UI/Alert";
import { useAuth } from "../hooks/useAuth";
import { requestService } from "../services/requestService";
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ServerIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const RequestStatusPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, FULFILLED, DENIED
  const [alert, setAlert] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setAlert(null);

      try {
        const response = await requestService.getUserRequests();

        if (response.status === 200) {
          // API 응답 데이터를 기존 UI에 맞게 변환
          const transformedRequests = response.data.map((request) => ({
            request_id: request.requestId,
            user_id: user?.user_id,
            node_id: `RG-${request.resourceGroupId}`,
            image_name: request.imageName,
            image_version: request.imageVersion,
            ubuntu_gid:
              request.ubuntuGids?.length > 0
                ? request.ubuntuGids.join(", ")
                : null,
            ubuntu_username: request.ubuntuUsername,
            ubuntu_uid: request.ubuntuUid,
            expires_at: request.expiresAt,
            volume_size_byte: request.volumeSizeByte * 1024 * 1024 * 1024, // GB to bytes
            usage_purpose: request.usagePurpose,
            form_answers: request.formAnswers,
            approved_at: request.approvedAt,
            status: request.status,
            comment: request.comment,
            // API에서 제공되지 않는 created_at은 요청 ID로 대략적인 순서 유지
            created_at: new Date(
              Date.now() - (1000 - request.requestId) * 24 * 60 * 60 * 1000
            ).toISOString(),
            updated_at: request.approvedAt || new Date().toISOString(),
          }));

          setRequests(transformedRequests);
        } else {
          setAlert({
            type: "error",
            message:
              "요청 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          });
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
        setAlert({
          type: "error",
          message:
            "요청 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRequests();
    }
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
    if (!dateString) return "정보 없음";

    try {
      // ISO 8601 형식 처리
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "날짜 형식 오류";
    }
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
      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">
                      컨테이너 이미지
                    </p>
                    <p className="text-sm text-gray-900">
                      {request.image_name}:{request.image_version}
                    </p>
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
                        <p>사용자명: {request.ubuntu_username}</p>
                        <p>리소스 그룹: {request.node_id}</p>
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
                      {selectedRequest.ubuntu_gid && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Ubuntu GID
                            {selectedRequest.ubuntu_gid.includes(",")
                              ? "s"
                              : ""}
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedRequest.ubuntu_gid}
                          </p>
                        </div>
                      )}
                      {selectedRequest.ubuntu_uid && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Ubuntu UID
                          </p>
                          <p className="text-sm text-gray-900">
                            {selectedRequest.ubuntu_uid}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          리소스 그룹
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
                          컨테이너 이미지
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.image_name}:
                          {selectedRequest.image_version}
                        </p>
                      </div>
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
                  {selectedRequest.form_answers &&
                    Object.keys(selectedRequest.form_answers).length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700">
                          추가 정보
                        </p>
                        <div className="text-sm text-gray-900 mt-1 space-y-1">
                          {Object.entries(selectedRequest.form_answers).map(
                            ([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>{" "}
                                {value}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Server Access Information (for approved requests) */}
                {selectedRequest.status === "FULFILLED" && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <ServerIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                      서버 접속 정보
                    </h3>
                    <div className="bg-gray-50 p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            사용자명
                          </p>
                          <code className="block mt-1 p-2 bg-white border text-sm">
                            {selectedRequest.ubuntu_username}
                          </code>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            리소스 그룹 ID
                          </p>
                          <code className="block mt-1 p-2 bg-white border text-sm">
                            {selectedRequest.node_id}
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
