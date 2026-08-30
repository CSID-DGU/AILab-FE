import { useState, useEffect } from "react";
import {
  Container,
  Header,
  Table,
  Tabs,
  Button,
  Modal,
  Flashbar,
  Alert,
  StatusIndicator,
  Badge,
  KeyValuePairs,
  FormField,
  Input,
} from "../../design-system";
import { requestService } from "../../services/requestService";
import { podService } from "../../services/podService";
import { mapRequestDtoToUiModel } from "../../utils/requestMapper";

const STATUS_META = {
  PENDING: { type: "pending", label: "대기중" },
  PROCESSING: { type: "in-progress", label: "처리중" },
  FULFILLED: { type: "success", label: "승인됨" },
  DENIED: { type: "error", label: "거절됨" },
  DELETED: { type: "stopped", label: "삭제됨" },
};

const renderStatus = (status) => {
  const meta = STATUS_META[status];
  if (!meta) return <StatusIndicator type="info">{status}</StatusIndicator>;
  return <StatusIndicator type={meta.type}>{meta.label}</StatusIndicator>;
};

const RequestManagementPage = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, FULFILLED, DENIED
  const [alert, setAlert] = useState(null);
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [processingUsername, setProcessingUsername] = useState(null);
  const [provisioningStatus, setProvisioningStatus] = useState(null);

  // 목록에 PROCESSING 상태인 신청서가 있으면(다른 관리자가 처리 중이거나, 내가 승인 처리
  // 중에 페이지를 나갔다가 새로고침해서 돌아온 경우) processingRequestId가 이번 세션에서
  // 클릭한 적 없어도 그 신청서 기준으로 상태 배너/폴링을 이어간다.
  const processingListRequest = requests.find((r) => r.status === "PROCESSING") || null;

  // 승인 처리 중(Pod 생성 포함)일 때 config-server의 세세한 진행 단계를 폴링해서 보여준다.
  // 조회 실패는 승인 흐름 자체에 영향을 주지 않으므로 조용히 무시한다.
  const provisioningTargetUsername =
    processingUsername || processingListRequest?.ubuntu_username || null;

  useEffect(() => {
    if (!provisioningTargetUsername) {
      setProvisioningStatus(null);
      return;
    }
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await podService.getProvisioningStatus(provisioningTargetUsername);
        if (!cancelled) setProvisioningStatus(res?.data ?? null);
      } catch {
        // ignore
      }
    };
    poll();
    const interval = setInterval(poll, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [provisioningTargetUsername]);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      setAlert(null);

      try {
        const response = await requestService.getAllRequests();

        if (response.status === 200) {
          // API 응답 데이터를 기존 UI에 맞게 변환
          // response.data는 서버 응답이고, response.data.data가 실제 배열
          const requestsArray = response.data?.data ?? [];
          const transformedRequests = requestsArray.map(mapRequestDtoToUiModel);

          setRequests(transformedRequests);
        } else {
          setAlert({
            type: "error",
            message:
              "신청서 목록을 불러올 수 없습니다. 서버 상태를 확인하시거나 관리자에게 문의해주세요.",
          });
        }
      } catch (error) {
        console.error("Failed to fetch requests:", error);
        setAlert({
          type: "error",
          message:
            "신청서 목록 로딩 중 네트워크 오류가 발생했습니다. 인터넷 연결을 확인하시고 페이지를 새로고침해주세요.",
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
      // Sort by priority: PENDING > PROCESSING > FULFILLED > DENIED > DELETED
      const statusPriority = { PENDING: 1, PROCESSING: 2, FULFILLED: 3, DENIED: 4, DELETED: 5 };
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
    DELETED: requests.filter((r) => r.status === "DELETED").length,
  };

  const handleStatusUpdate = async (request, newStatus, comment = "") => {
    if (processingRequestId !== null) return;
    setProcessingRequestId(request.request_id);
    if (newStatus === "FULFILLED") {
      // 같은 사용자를 재승인할 때는 provisioningTargetUsername이 안 바뀌어서
      // 폴링 useEffect가 재실행되지 않는다 — 이전 실패 시도의 진행 단계 메시지가
      // 첫 폴링(2초) 전까지 그대로 남아 보이는 걸 막기 위해 여기서 바로 지운다.
      setProvisioningStatus(null);
      setProcessingUsername(request.ubuntu_username);
    }
    try {
      let response;

      if (newStatus === "FULFILLED") {
        // 승인 API 호출
        const approvalData = {
          requestId: request.request_id,
          imageId: request.image_id,
          resourceGroupId: request.rsgroup_id,
          volumeSizeGiB: request.volume_size_GB,
          adminComment: comment,
        };
        response = await requestService.approveRequest(approvalData);
      } else if (newStatus === "DENIED") {
        // 거절 API 호출
        const rejectData = {
          requestId: request.request_id,
          adminComment: comment,
        };
        response = await requestService.rejectRequest(rejectData);
      } else {
        return;
      }

      if (response.status === 200) {
        const processedAt = new Date().toISOString();

        setRequests((prev) =>
          prev.map((req) =>
            req.request_id === request.request_id
              ? {
                  ...req,
                  status: newStatus,
                  admin_comment: comment,
                  updated_at: processedAt,
                  approved_at: newStatus === "FULFILLED" ? processedAt : req.approved_at,
                }
              : req
          )
        );

        setAlert({
          type: "success",
          message: `${request.user_name}님의 신청서가 성공적으로 ${
            newStatus === "FULFILLED" ? "승인" : "거절"
          }되었습니다.`,
        });

        setSelectedRequest(null);

      } else {
        setAlert({
          type: "error",
          message:
            "신청서 처리 중 오류가 발생했습니다. 네트워크 연결을 확인하시거나 잠시 후 다시 시도해주세요.",
        });
      }
    } catch (error) {
      console.error("Failed to update request status:", error);

      if (error.status === 409) {
        // 실제 원인은 두 가지다: ① 다른 관리자가 먼저 처리함 ② 본인이 새로고침 후 이미
        // PROCESSING/처리 완료된 자신의 요청에 다시 클릭한 경우. 서버 응답만으로는 구분할
        // 수 없으므로 원인을 단정하지 않고 사실만 안내한다.
        setAlert({
          type: "error",
          message:
            "처리 상태가 바뀌어 요청을 완료하지 못했습니다. 목록을 새로고침해 현재 상태를 확인해주세요.",
        });
      } else if (error.name === "TimeoutError" || error.name === "AbortError") {
        setAlert({
          type: "warning",
          message: "승인 응답 시간이 초과되었습니다. 재시도하기 전에 목록을 새로고침해 실제 처리 상태를 확인해주세요.",
        });
      } else {
        setAlert({
          type: "error",
          message: error.status
            ? `신청서 처리에 실패했습니다. ${error.message}`
            : "서버와 연결할 수 없습니다. 네트워크를 확인하고 잠시 후 다시 시도해주세요.",
        });
      }
    } finally {
      setProcessingRequestId(null);
      setProcessingUsername(null);
    }
  };

  const promptApprove = (request) => {
    const comment = prompt("승인 사유를 입력하세요:", "승인되었습니다.");
    if (comment !== null) {
      handleStatusUpdate(request, "FULFILLED", comment || "승인되었습니다.");
    }
  };

  const promptDeny = (request) => {
    // PROCESSING 상태는 Pod 생성이 이미 진행 중일 수 있다 — 진행 단계가 멈춘 것처럼
    // 보인다고 오인해 실수로 취소하는 것을 막기 위해 별도로 확인한다.
    if (request.status === "PROCESSING") {
      const proceed = confirm(
        "이 신청서는 현재 Pod 생성 처리 중입니다. 거절하면 진행 중인 계정/Pod가 정리됩니다. 계속하시겠습니까?"
      );
      if (!proceed) return;
    }
    const comment = prompt("거절 사유를 입력하세요:", "거절되었습니다.");
    if (comment !== null) {
      handleStatusUpdate(request, "DENIED", comment || "거절되었습니다.");
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

  const emptyText =
    filter === "ALL"
      ? "아직 제출된 신청서가 없습니다."
      : `${
          filter === "PENDING"
            ? "대기중인"
            : filter === "FULFILLED"
            ? "승인된"
            : filter === "DENIED"
            ? "거절된"
            : "삭제된"
        } 신청서가 없습니다. 다른 상태의 신청서를 확인해보세요.`;

  const columns = [
    {
      id: "id",
      header: "ID",
      width: "72px",
      cell: (r) => `#${r.request_id}`,
    },
    {
      id: "user",
      header: "사용자",
      minWidth: "160px",
      cell: (r) => (
        <div>
          <div>{r.user_name}</div>
          <div className="text-(--decs-text-secondary)">
            {r.student_id} · {r.department}
          </div>
        </div>
      ),
    },
    {
      id: "rsgroup",
      header: "리소스 그룹",
      cell: (r) => r.rsgroup_name,
    },
    {
      id: "image",
      header: "이미지",
      cell: (r) => `${r.image_name}:${r.image_version}`,
    },
    {
      id: "expires",
      header: "만료",
      cell: (r) => new Date(r.expires_at).toLocaleDateString("ko-KR"),
    },
    {
      id: "status",
      header: "상태",
      cell: (r) => renderStatus(r.status),
    },
    {
      id: "actions",
      header: "작업",
      minWidth: "180px",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Button variant="inline-link" onClick={() => setSelectedRequest(r)}>
            상세
          </Button>
          {r.status === "PENDING" && (
            <Button variant="inline-link" disabled={processingRequestId !== null} loading={processingRequestId === r.request_id} onClick={() => promptApprove(r)}>
              승인
            </Button>
          )}
          {(r.status === "PENDING" || r.status === "PROCESSING") && (
            <Button
              variant="inline-link"
              disabled={processingRequestId !== null}
              style={{ color: "var(--decs-status-error)" }}
              onClick={() => promptDeny(r)}
            >
              거절
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <StatusIndicator type="loading">
          신청서 목록을 불러오는 중...
        </StatusIndicator>
      </div>
    );
  }

  const sel = selectedRequest;

  return (
    <div className="space-y-6">
      {alert && (
        <Flashbar
          items={[
            {
              id: "page-alert",
              type: alert.type,
              content: alert.message,
              dismissible: true,
              onDismiss: () => setAlert(null),
            },
          ]}
        />
      )}
      {processingRequestId !== null || processingListRequest ? (
        <Alert type="info">
          {processingListRequest && processingRequestId === null
            ? `${processingListRequest.user_name}님의 신청서가 Pod 생성 처리 중입니다.`
            : "Pod 생성으로 승인 처리에 최대 10분이 걸릴 수 있습니다."}{" "}
          중복 클릭해도 안전하지만, 완료 전까지는 같은 신청서에 대한 새 승인 요청이 거부됩니다.
          {provisioningStatus?.message ? ` (현재 단계: ${provisioningStatus.message})` : null}
        </Alert>
      ) : null}

      <Header
        variant="h1"
        description="사용자들의 서버 사용 신청서를 검토하고 승인/거절할 수 있습니다."
      >
        신청서 관리
      </Header>

      <Tabs
        tabs={[
          { key: "ALL", label: "전체" },
          { key: "PENDING", label: "대기중" },
          { key: "FULFILLED", label: "승인됨" },
          { key: "DENIED", label: "거절됨" },
          { key: "DELETED", label: "삭제됨" },
        ].map((tab) => ({
          id: tab.key,
          label: `${tab.label} (${statusCounts[tab.key]})`,
        }))}
        activeTabId={filter}
        onChange={setFilter}
      />

      <Container disablePadding>
        <Table
          density="compact"
          columns={columns}
          items={filteredRequests}
          trackBy="request_id"
          header={
            <Header variant="h2" counter={`(${filteredRequests.length})`}>
              신청서
            </Header>
          }
          empty={emptyText}
        />
      </Container>

      {/* Detail Modal */}
      {sel && (
        <Modal
          visible
          size="large"
          onDismiss={() => setSelectedRequest(null)}
          header={`신청 상세 정보 #${sel.request_id}`}
          footer={
            <>
              <Button variant="normal" onClick={() => setSelectedRequest(null)}>
                닫기
              </Button>
              {(sel.status === "PENDING" || sel.status === "PROCESSING") && (
                <Button
                  variant="normal"
                  disabled={processingRequestId !== null}
                  style={{
                    color: "var(--decs-status-error)",
                    borderColor: "var(--decs-status-error)",
                  }}
                  onClick={() => promptDeny(sel)}
                >
                  거절
                </Button>
              )}
              {sel.status === "PENDING" && (
                <Button variant="primary" disabled={processingRequestId !== null} loading={processingRequestId === sel.request_id} onClick={() => promptApprove(sel)}>
                  승인
                </Button>
              )}
            </>
          }
        >
          <div className="space-y-6">
            <div>{renderStatus(sel.status)}</div>

            <div>
              <Header variant="h3">사용자</Header>
              <KeyValuePairs
                columns={2}
                style={{ marginTop: "var(--decs-space-s)" }}
                items={[
                  { label: "이름", value: sel.user_name },
                  { label: "학번", value: sel.student_id },
                  { label: "이메일", value: sel.user_email },
                  { label: "학과", value: sel.department },
                  {
                    label: "전화번호",
                    value: sel.user_phone || "등록되지 않음",
                  },
                  {
                    label: "계정 상태",
                    value: sel.is_active ? (
                      <StatusIndicator type="success">활성</StatusIndicator>
                    ) : (
                      <StatusIndicator type="stopped">비활성</StatusIndicator>
                    ),
                  },
                ]}
              />
            </div>

            <div>
              <Header variant="h3">리소스 그룹</Header>
              <KeyValuePairs
                columns={2}
                style={{ marginTop: "var(--decs-space-s)" }}
                items={[
                  { label: "리소스 그룹명", value: sel.rsgroup_name },
                  { label: "서버", value: sel.server_name },
                  { label: "설명", value: sel.rsgroup_description },
                ]}
              />
            </div>

            <div>
              <Header variant="h3">신청 정보</Header>
              <KeyValuePairs
                columns={2}
                style={{ marginTop: "var(--decs-space-s)" }}
                items={[
                  {
                    label: "Ubuntu 사용자명",
                    value: sel.ubuntu_username,
                    copyable: true,
                    copyText: sel.ubuntu_username,
                  },
                  {
                    label: "컨테이너 이미지",
                    value: `${sel.image_name}:${sel.image_version}`,
                  },
                  {
                    label: "만료",
                    value: new Date(sel.expires_at).toLocaleDateString("ko-KR"),
                  },
                  ...(sel.ubuntu_gids && sel.ubuntu_gids.length > 0
                    ? [{ label: "Ubuntu GIDs", value: sel.ubuntu_gids.join(", ") }]
                    : []),
                  ...(sel.ubuntu_uid != null
                    ? [{ label: "Ubuntu UID", value: sel.ubuntu_uid }]
                    : []),
                  ...(sel.ubuntu_gid != null
                    ? [{ label: "Ubuntu GID (Primary)", value: sel.ubuntu_gid }]
                    : []),
                ]}
              />
              <div className="mt-4">
                <div className="text-(--decs-text-inactive) mb-1">사용 목적</div>
                <div className="bg-(--decs-surface-sunken) p-3">
                  {sel.usage_purpose}
                </div>
              </div>
              {sel.form_answers &&
                Object.keys(sel.form_answers).length > 0 && (
                  <div className="mt-4">
                    <div className="text-(--decs-text-inactive) mb-1">
                      추가 정보
                    </div>
                    <KeyValuePairs
                      columns={2}
                      items={Object.entries(sel.form_answers).map(
                        ([key, value]) => ({
                          label: key.replace("_", " "),
                          value,
                        })
                      )}
                    />
                  </div>
                )}
            </div>

            {sel.port_mappings && sel.port_mappings.length > 0 && (
              <div>
                <Header variant="h3">외부 포트</Header>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sel.port_mappings.map((port, index) => (
                    <Badge
                      key={index}
                      color={port.isActive !== false ? "green" : "grey"}
                    >
                      {port.externalPort}:{port.internalPort}
                      {port.usagePurpose ? ` (${port.usagePurpose})` : ""}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Header variant="h3">처리 이력</Header>
              <div className="space-y-2 mt-2">
                <StatusIndicator type="info">
                  신청 제출: {formatDate(sel.created_at)}
                </StatusIndicator>
                {sel.approved_at && (
                  <div>
                    <StatusIndicator type="success">
                      승인 완료: {formatDate(sel.approved_at)}
                    </StatusIndicator>
                  </div>
                )}
                {sel.status === "DENIED" && (
                  <div>
                    <StatusIndicator type="error">
                      거절: {formatDate(sel.updated_at)}
                    </StatusIndicator>
                  </div>
                )}
                {sel.status === "PENDING" && (
                  <div>
                    <StatusIndicator type="pending">
                      관리자 검토 대기 중
                    </StatusIndicator>
                  </div>
                )}
              </div>
              {sel.admin_comment && (
                <div className="mt-3">
                  <Alert
                    type={sel.status === "DENIED" ? "error" : "info"}
                    header="관리자 의견"
                  >
                    {sel.admin_comment}
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default RequestManagementPage;
