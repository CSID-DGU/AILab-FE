// ContainerDetail — 섹션(Container+Header) · 스펙(KeyValuePairs) · 탭(개요/로그/이벤트)
import { useState } from "react";
import {
  Container, Header, KeyValuePairs, Tabs, StatusIndicator, BreadcrumbGroup,
  Button, Modal, Alert, FormField, Input,
} from "../../../design-system";
import { requestService } from "../../../services/requestService";
import userService from "../../../services/userService";

function ContainerDetail({ item, onBack, onRefetch }) {
  const c = item;

  const [alert, setAlert] = useState(null);
  const [migrateOpen, setMigrateOpen] = useState(false);
  const [migrateNodesInput, setMigrateNodesInput] = useState("");
  const [migrateRatioInput, setMigrateRatioInput] = useState("");
  const [migrateFormError, setMigrateFormError] = useState(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  if (!c) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--decs-space-m)" }}>
        <BreadcrumbGroup items={[{ text: "컨테이너", href: "#" }, { text: "상세" }]} onFollow={(it) => { if (it.href) onBack(); }} />
        <Header variant="h1">컨테이너 상세</Header>
        <Container>
          <div style={{ color: "var(--decs-text-secondary)", fontSize: "var(--decs-fs-body-s)", padding: "24px 0", textAlign: "center" }}>
            컨테이너 데이터를 찾을 수 없습니다.
          </div>
        </Container>
      </div>
    );
  }

  const openMigrate = () => {
    setMigrateNodesInput("");
    setMigrateRatioInput("");
    setMigrateFormError(null);
    setMigrateOpen(true);
  };

  const closeMigrate = () => {
    if (isMigrating) return;
    setMigrateOpen(false);
  };

  const submitMigrate = async () => {
    const nodes = migrateNodesInput
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);

    if (nodes.length === 0) {
      setMigrateFormError("후보 노드를 하나 이상 입력하세요.");
      return;
    }

    let minImprovementRatio;
    if (migrateRatioInput.trim() !== "") {
      const parsed = Number(migrateRatioInput.trim());
      if (Number.isNaN(parsed)) {
        setMigrateFormError("최소 개선 비율은 숫자로 입력하세요.");
        return;
      }
      minImprovementRatio = parsed;
    }

    setMigrateFormError(null);
    setIsMigrating(true);
    try {
      const response = await requestService.migrateRequest(c.requestId, nodes, minImprovementRatio);
      const result = response.data?.data ?? response.data;

      if (result?.status === "migrated") {
        setAlert({
          type: "success",
          message: `Pod를 ${result.from} → ${result.to}(으)로 마이그레이션했습니다.${
            result.old_pod_cleanup === "failed" ? " (기존 Pod 정리는 실패해 수동 확인이 필요합니다.)" : ""
          }`,
        });
      } else {
        setAlert({
          type: "info",
          message: `마이그레이션을 건너뛰었습니다: ${result?.reason ?? "개선 효과가 충분하지 않습니다."}${
            result?.best_candidate ? ` (최적 후보: ${result.best_candidate})` : ""
          }`,
        });
      }
      setMigrateOpen(false);
      onRefetch?.();
    } catch (error) {
      console.error("Failed to migrate pod:", error);
      if (error.status === 409) {
        setMigrateFormError("이미 마이그레이션이 진행 중이거나 FULFILLED 상태가 아닙니다.");
      } else if (error.status === 502) {
        setMigrateFormError("config-server 마이그레이션 API 호출에 실패했습니다.");
      } else if (error.name === "TimeoutError" || error.name === "AbortError") {
        setMigrateFormError("응답 시간이 초과되었습니다. 실제 처리 상태는 목록을 새로고침해 확인해주세요.");
      } else {
        setMigrateFormError(error.message || "마이그레이션 요청에 실패했습니다.");
      }
    } finally {
      setIsMigrating(false);
    }
  };

  const submitDelete = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await userService.deleteUbuntuAccount(c.name);
      onRefetch?.();
      onBack();
    } catch (error) {
      console.error("Failed to delete container:", error);
      setDeleteError(error.message || "컨테이너 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  const overview = (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--decs-space-l)" }}>
      <Container header={<Header variant="h2">스펙</Header>}>
        <KeyValuePairs columns={3} items={[
          { label: "상태", value: <StatusIndicator type={c.status}>{c.label}</StatusIndicator> },
          { label: "리소스 그룹", value: c.gpu },
          { label: "노드", value: c.node },
          { label: "이미지", value: c.image },
          { label: "Pod", value: c.podName || "—" },
          { label: "네임스페이스", value: c.namespace },
          { label: "호스트 IP", value: c.hostIP },
          { label: "생성일", value: c.createdAt },
          { label: "만료", value: c.expires },
          { label: "컨테이너", value: c.podContainers.length ? c.podContainers.map((container) => `${container.name} (${container.image})`).join(", ") : "—" },
        ]} />
      </Container>
    </div>
  );

  const logs = (
    <div style={{ color: "var(--decs-text-secondary)", fontSize: "var(--decs-fs-body-s)", padding: "16px 0", textAlign: "center" }}>
      표시할 로그 데이터가 없습니다.
    </div>
  );

  const events = (
    <div style={{ color: "var(--decs-text-secondary)", fontSize: "var(--decs-fs-body-s)", padding: "16px 0", textAlign: "center" }}>
      표시할 이벤트 데이터가 없습니다.
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--decs-space-m)" }}>
      <BreadcrumbGroup items={[{ text: "컨테이너", href: "#" }, { text: c.name }]} onFollow={(it) => { if (it.href) onBack(); }} />

      {alert && (
        <Alert type={alert.type} dismissible onDismiss={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      <Header
        variant="h1"
        actions={
          <div style={{ display: "flex", gap: "var(--decs-space-s)" }}>
            {c.status !== "stopped" && c.requestId != null && (
              <Button variant="normal" onClick={openMigrate}>마이그레이션</Button>
            )}
            <Button
              variant="normal"
              style={{ color: "var(--decs-status-error)", borderColor: "var(--decs-status-error)" }}
              onClick={() => { setDeleteError(null); setDeleteOpen(true); }}
            >
              삭제
            </Button>
          </div>
        }
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>{c.name}</span>
      </Header>
      <Tabs tabs={[
        { id: "overview", label: "개요", content: overview },
        { id: "logs", label: "로그", content: logs },
        { id: "events", label: "이벤트", content: events },
      ]} />

      <Modal
        visible={migrateOpen}
        onDismiss={closeMigrate}
        header={`Pod 마이그레이션 — ${c.userName ?? c.name} (${c.name})`}
        footer={
          <>
            <Button variant="normal" disabled={isMigrating} onClick={closeMigrate}>취소</Button>
            <Button variant="primary" loading={isMigrating} onClick={submitMigrate}>마이그레이션 실행</Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--decs-space-m)" }}>
          <Alert type="info">
            config-server가 후보 노드 중 가장 개선 효과가 큰 노드로 Pod를 옮깁니다. 완료까지 최대 10분이 걸릴 수 있습니다.
          </Alert>
          <FormField
            label="후보 노드"
            description="현재 배포된 노드를 포함해 쉼표(,)로 구분해 입력하세요."
            constraintText="예: farm1, farm2"
            errorText={migrateFormError}
          >
            <Input
              value={migrateNodesInput}
              onChange={setMigrateNodesInput}
              placeholder="farm1, farm2"
              disabled={isMigrating}
            />
          </FormField>
          <FormField label="최소 개선 비율 (선택)" description="생략하면 config-server 기본값을 사용합니다.">
            <Input
              value={migrateRatioInput}
              onChange={setMigrateRatioInput}
              placeholder="0.2"
              type="number"
              disabled={isMigrating}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        visible={deleteOpen}
        onDismiss={() => !isDeleting && setDeleteOpen(false)}
        header="컨테이너 삭제"
        size="small"
        footer={
          <>
            <Button variant="normal" disabled={isDeleting} onClick={() => setDeleteOpen(false)}>취소</Button>
            <Button
              variant="primary"
              loading={isDeleting}
              style={{ background: "var(--decs-status-error)", color: "#fff" }}
              onClick={submitDelete}
            >
              삭제
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--decs-space-s)" }}>
          {deleteError ? <Alert type="error">{deleteError}</Alert> : null}
          <p>
            컨테이너 &quot;{c.name}&quot;이(가) 영구적으로 삭제됩니다 (외부 계정/Pod 정리 포함).
            이 작업은 되돌릴 수 없습니다.
          </p>
        </div>
      </Modal>
    </div>
  );
}
export default ContainerDetail;
