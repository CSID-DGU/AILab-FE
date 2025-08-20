import { useState, useEffect } from "react";
import {
  DocumentTextIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import Card from "../../components/UI/Card";
import Badge from "../../components/UI/Badge";
import Button from "../../components/UI/Button";
import Alert from "../../components/UI/Alert";
import { requestService } from "../../services/requestService";

const RequestManagementPage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, FULFILLED, DENIED
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setAlert(null);

      try {
        const response = await requestService.getAllRequests();

        if (response.status === 200) {
          // API 응답 데이터를 기존 UI에 맞게 변환
          const transformedRequests = response.data.map((request) => ({
            request_id: request.requestId,
            user_id: request.userId || "N/A",
            user_name: request.userName || "알 수 없음",
            user_email: request.userEmail || "N/A",
            student_id: request.studentId || "N/A",
            department: request.department || "N/A",
            rsgroup_id: request.resourceGroupId,
            rsgroup_name: `RG-${request.resourceGroupId}`,
            image_id: request.imageId || "N/A",
            image_name: request.imageName,
            image_version: request.imageVersion,
            ubuntu_username: request.ubuntuUsername,
            ubuntu_uid: request.ubuntuUid,
            ubuntu_gids: request.ubuntuGids,
            volume_size_GB: request.volumeSizeByte,
            expires_at: request.expiresAt,
            usage_purpose: request.usagePurpose,
            form_answers: request.formAnswers,
            status: request.status,
            admin_comment: request.comment,
            approved_at: request.approvedAt,
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
              "신청서 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          });
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
        setAlert({
          type: "error",
          message:
            "신청서 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning">대기중</Badge>;
      case "FULFILLED":
        return <Badge variant="success">승인됨</Badge>;
      case "DENIED":
        return <Badge variant="danger">거절됨</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
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

  const handleStatusUpdate = async (requestId, newStatus, comment = "") => {
    try {
      const response = await requestService.updateRequestStatus(
        requestId,
        newStatus,
        comment
      );

      if (response.status === 200) {
        setRequests((prev) =>
          prev.map((req) =>
            req.request_id === requestId
              ? {
                  ...req,
                  status: newStatus,
                  admin_comment: comment,
                  updated_at: new Date().toISOString(),
                  ...(newStatus === "FULFILLED" && {
                    approved_at: new Date().toISOString(),
                  }),
                }
              : req
          )
        );

        setAlert({
          type: "success",
          message: `신청서가 ${
            newStatus === "FULFILLED" ? "승인" : "거절"
          }되었습니다.`,
        });

        setSelectedRequest(null);
      } else {
        setAlert({
          type: "error",
          message:
            "상태 업데이트 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
      }
    } catch (error) {
      console.error("Failed to update request status:", error);
      setAlert({
        type: "error",
        message:
          "상태 업데이트 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F68313] mx-auto"></div>
          <p className="mt-4 text-gray-600">신청서 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">신청서 관리</h1>
        <p className="text-gray-600 mt-1">
          사용자들의 서버 사용 신청서를 검토하고 승인/거절할 수 있습니다.
        </p>
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
                ? "신청서가 없습니다"
                : `${
                    filter === "PENDING"
                      ? "대기중인"
                      : filter === "FULFILLED"
                      ? "승인된"
                      : "거절된"
                  } 신청서가 없습니다`}
            </h3>
            <p className="text-gray-600">
              {filter === "ALL"
                ? "아직 제출된 신청서가 없습니다."
                : "다른 상태의 신청서를 확인해보세요."}
            </p>
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
                      #{request.request_id} - {request.user_name}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        사용자 정보
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {request.student_id} | {request.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        리소스
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {request.rsgroup_name} | {request.volume_size_GB}GB
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        이미지
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {request.image_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                        만료일
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {new Date(request.expires_at).toLocaleDateString(
                          "ko-KR"
                        )}
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
                      </div>
                    </div>
                  )}

                  {request.status === "DENIED" && request.admin_comment && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
                      <div className="text-sm text-red-700">
                        <p className="font-medium mb-1">거절 사유</p>
                        <p>{request.admin_comment}</p>
                      </div>
                    </div>
                  )}

                  {request.status === "PENDING" && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                      <div className="text-sm text-yellow-700">
                        <p className="font-medium mb-1">승인 대기 중</p>
                        <p>관리자 검토가 필요합니다.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    상세보기
                  </Button>

                  {request.status === "PENDING" && (
                    <div className="flex space-x-2">
                      <Button
                        variant="success"
                        size="small"
                        onClick={() =>
                          handleStatusUpdate(
                            request.request_id,
                            "FULFILLED",
                            "승인되었습니다."
                          )
                        }
                      >
                        <CheckIcon className="w-4 h-4 mr-1" />
                        승인
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => {
                          const comment = prompt("거절 사유를 입력하세요:");
                          if (comment) {
                            handleStatusUpdate(
                              request.request_id,
                              "DENIED",
                              comment
                            );
                          }
                        }}
                      >
                        <XMarkIcon className="w-4 h-4 mr-1" />
                        거절
                      </Button>
                    </div>
                  )}
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
                {/* User Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <UserIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                    사용자 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          이름
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.user_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          이메일
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.user_email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          학번
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.student_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          학과
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.department}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2 text-[#F68313]" />
                    신청 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Ubuntu 사용자명
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.ubuntu_username}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          리소스 그룹
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.rsgroup_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          볼륨 크기
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.volume_size_GB}GB
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          컨테이너 이미지
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.image_name}:
                          {selectedRequest.image_version}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          만료일
                        </p>
                        <p className="text-sm text-gray-900">
                          {new Date(
                            selectedRequest.expires_at
                          ).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Ubuntu UID
                        </p>
                        <p className="text-sm text-gray-900">
                          {selectedRequest.ubuntu_uid || "설정되지 않음"}
                        </p>
                      </div>
                      {selectedRequest.ubuntu_gids &&
                        selectedRequest.ubuntu_gids.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Ubuntu GIDs
                            </p>
                            <p className="text-sm text-gray-900">
                              {selectedRequest.ubuntu_gids.join(", ")}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">
                      사용 목적
                    </p>
                    <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded">
                      {selectedRequest.usage_purpose}
                    </p>
                  </div>
                  {selectedRequest.form_answers && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        추가 정보
                      </p>
                      <div className="bg-gray-50 p-3 rounded space-y-2">
                        {Object.entries(selectedRequest.form_answers).map(
                          ([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600 capitalize">
                                {key.replace("_", " ")}:
                              </span>
                              <span className="text-sm text-gray-900">
                                {value}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

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
                  {selectedRequest.admin_comment && (
                    <div className="mt-4 bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium text-gray-700">
                        관리자 의견
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedRequest.admin_comment}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === "PENDING" && (
                <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                  <Button
                    variant="success"
                    onClick={() =>
                      handleStatusUpdate(
                        selectedRequest.request_id,
                        "FULFILLED",
                        "승인되었습니다."
                      )
                    }
                  >
                    <CheckIcon className="w-4 h-4 mr-1" />
                    승인
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      const comment = prompt("거절 사유를 입력하세요:");
                      if (comment) {
                        handleStatusUpdate(
                          selectedRequest.request_id,
                          "DENIED",
                          comment
                        );
                      }
                    }}
                  >
                    <XMarkIcon className="w-4 h-4 mr-1" />
                    거절
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestManagementPage;
