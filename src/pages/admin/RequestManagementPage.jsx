import { useState, useEffect, useCallback } from "react";
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
  Input,
} from "../../design-system";
import { requestService } from "../../services/requestService";
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
  const [migratingRequestId, setMigratingRequestId] = useState(null);
  const [migrateTarget, setMigrateTarget] = useState(null);
  const [migrateNodeOptions, setMigrateNodeOptions] = useState([]);
  const [selectedMigrateNodes, setSelectedMigrateNodes] = useState(new Set());
  const [minImprovementRatio, setMinImprovementRatio] = useState("0.2");
  const [migrateLoadError, setMigrateLoadError] = useState(null);

  const fetchRequests = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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
        setAlert({
          type: "error",
          message:
            "이 신청서는 이미 다른 관리자에 의해 처리되었습니다. 페이지를 새로고침해주세요.",
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
    }
  };

  const MIGRATE_SKIP_REASON_LABELS = {
    no_significant_improvement: "이미 최적 노드에 있어 마이그레이션이 필요하지 않습니다.",
    no_candidate_node: "이동 가능한 다른 노드가 없습니다.",
  };

  const openMigrateModal = async (request) => {
    if (migratingRequestId !== null) return;
    setMigrateLoadError(null);
    setMigrateTarget(request);
    setMigrateNodeOptions([]);
    setSelectedMigrateNodes(new Set());
    setMinImprovementRatio("0.2");

    try {
      const response = await requestService.getGpuTypes();
      const gpuTypes = response.data?.data ?? [];
      const nodeIds = [
        ...new Set(
          gpuTypes
            .filter((g) => String(g.rsgroupId) === String(request.rsgroup_id))
            .map((g) => g.nodeId)
            .filter(Boolean)
        ),
      ];
      setMigrateNodeOptions(nodeIds);
      // 현재 노드가 후보 목록에 반드시 포함되어야 하므로 기본적으로 전부 선택해둔다.
      setSelectedMigrateNodes(new Set(nodeIds));
      if (nodeIds.length === 0) {
        setMigrateLoadError("이 리소스 그룹에 속한 노드 정보를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("Failed to load node options for migration:", error);
      setMigrateLoadError("노드 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  };

  const closeMigrateModal = () => {
    if (migratingRequestId !== null) return;
    setMigrateTarget(null);
  };

  const toggleMigrateNode = (nodeId) => {
    setSelectedMigrateNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const handleMigrate = async () => {
    const request = migrateTarget;
    if (!request || selectedMigrateNodes.size === 0) return;

    setMigratingRequestId(request.request_id);
    try {
      const ratio = parseFloat(minImprovementRatio);
      const response = await requestService.migrateRequest(request.request_id, {
        nodes: [...selectedMigrateNodes],
        ...(Number.isFinite(ratio) ? { minImprovementRatio: ratio } : {}),
      });

      const result = response.data?.data;

      if (response.status === 200 && result?.status === "migrated") {
        setAlert({
          type: "success",
          message: `${request.user_name}님의 서버를 ${result.from} → ${result.to} 노드로 마이그레이션했습니다.`,
        });
        setMigrateTarget(null);
        await fetchRequests();
      } else if (response.status === 200 && result?.status === "skipped") {
        setAlert({
          type: "info",
          message:
            MIGRATE_SKIP_REASON_LABELS[result.reason] ||
            `마이그레이션이 건너뛰어졌습니다. (${result.reason || "알 수 없는 사유"})`,
        });
        setMigrateTarget(null);
      } else {
        setAlert({
          type: "error",
          message: "마이그레이션 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        });
      }
    } catch (error) {
      console.error("Failed to migrate pod:", error);

      if (error.name === "TimeoutError" || error.name === "AbortError") {
        setAlert({
          type: "warning",
          message: "마이그레이션 응답 시간이 초과되었습니다. 재시도하기 전에 목록을 새로고침해 실제 상태를 확인해주세요.",
        });
        setMigrateTarget(null);
        await fetchRequests();
      } else {
        setAlert({
          type: "error",
          message: error.status
            ? `마이그레이션에 실패했습니다. ${error.message}`
            : "서버와 연결할 수 없습니다. 네트워크를 확인하고 잠시 후 다시 시도해주세요.",
        });
      }
    } finally {
      setMigratingRequestId(null);
    }
  };

  const promptApprove = (request) => {
    const comment = prompt("승인 사유를 입력하세요:", "승인되었습니다.");
    if (comment !== null) {
      handleStatusUpdate(request, "FULFILLED", comment || "승인되었습니다.");
    }
  };

  const promptDeny = (request) => {
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
          {r.status === "FULFILLED" && (
            <Button
              variant="inline-link"
              disabled={migratingRequestId !== null}
              loading={migratingRequestId === r.request_id}
              onClick={() => openMigrateModal(r)}
            >
              마이그레이션
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
      {processingRequestId !== null ? <Alert type="info">Pod 생성으로 승인 처리에 최대 5분이 걸릴 수 있습니다. 완료될 때까지 창을 닫거나 다시 클릭하지 마세요.</Alert> : null}

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

      {/* 마이그레이션 모달 */}
      {migrateTarget && (
        <Modal
          visible
          onDismiss={closeMigrateModal}
          header={`Pod 마이그레이션 — ${migrateTarget.user_name}`}
          footer={
            <>
              <Button variant="normal" disabled={migratingRequestId !== null} onClick={closeMigrateModal}>
                취소
              </Button>
              <Button
                variant="primary"
                disabled={migratingRequestId !== null || selectedMigrateNodes.size === 0}
                loading={migratingRequestId === migrateTarget.request_id}
                onClick={handleMigrate}
              >
                마이그레이션 실행
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Alert type="warning">
              실행 중인 서버를 다른 GPU 노드로 이동합니다. 이동 도중 일시적으로 접속이 끊길 수 있고, 완료까지 몇 분 걸릴 수 있습니다.
            </Alert>

            {migrateLoadError && <Alert type="error">{migrateLoadError}</Alert>}

            <div>
              <div className="text-(--decs-text-inactive) mb-2">
                후보 노드 (현재 노드를 포함해야 하므로 임의로 해제하지 마세요)
              </div>
              <div className="space-y-1">
                {migrateNodeOptions.map((nodeId) => (
                  <label key={nodeId} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedMigrateNodes.has(nodeId)}
                      onChange={() => toggleMigrateNode(nodeId)}
                    />
                    <span>{nodeId}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-(--decs-text-inactive) mb-1">최소 개선 비율</div>
              <Input
                type="number"
                value={minImprovementRatio}
                onChange={setMinImprovementRatio}
                placeholder="0.2"
              />
              <div className="text-(--decs-text-secondary)" style={{ fontSize: "var(--decs-fs-body-s)", marginTop: 4 }}>
                후보 노드 중 가장 여유있는 노드가 현재 노드보다 이 비율 이상 나아야 마이그레이션이 실행됩니다.
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RequestManagementPage;
