// AdminDashboard — 전체 상태 즉시 파악 (GPU 사용률 · 컨테이너 상태 · 만료 예정 · 최근 활동)
import { useEffect, useState, useCallback } from "react";
import { Container, Header, StatusIndicator, Badge, Button, Table, Alert, ProgressBar } from "../../../design-system";
import { monitoringService } from "../../../services/grafanaService";

const GPU_METRICS_REFRESH_MS = 30_000;

function GpuUtilPanel() {
  const [servers, setServers] = useState(null);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await monitoringService.getMetrics();
      if (res?.status === 200 && res.data?.data) {
        setServers(res.data.data.gpuServers ?? []);
        setError(null);
      } else {
        setError("지표를 불러오지 못했습니다.");
      }
    } catch {
      setError("모니터링 서버와 연결할 수 없습니다.");
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
    const id = setInterval(fetchMetrics, GPU_METRICS_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchMetrics]);

  if (error) {
    return <div style={{ color: "var(--decs-text-secondary)", fontSize: "var(--decs-fs-body-s)", padding: "16px 0", textAlign: "center" }}>{error}</div>;
  }
  if (servers === null) {
    return <StatusIndicator type="loading">지표를 불러오는 중...</StatusIndicator>;
  }
  if (servers.length === 0) {
    return <div style={{ color: "var(--decs-text-secondary)", fontSize: "var(--decs-fs-body-s)", padding: "16px 0", textAlign: "center" }}>GPU 데이터를 수신하지 못했습니다.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--decs-space-m)" }}>
      {servers.map((s) => (
        <div key={s.hostname}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
            <span style={{ fontSize: "var(--decs-fs-body-s)", fontWeight: 600, color: "var(--decs-text-heading)" }}>{s.hostname}</span>
            <span style={{ fontSize: "var(--decs-fs-body-s)", color: "var(--decs-text-secondary)" }}>GPU {s.gpuCount}개</span>
          </div>
          {/* ProgressBar의 status="error"는 진행률이 아니라 "완료(실패)" 취급이라 바 자체가
              안 그려진다 — 사용률 게이지 용도로는 항상 in-progress로 그리고, 높은 사용률은
              텍스트 색으로만 강조한다. */}
          <ProgressBar
            value={s.gpuUtil}
            status="in-progress"
            description={<span style={{ color: s.gpuUtil >= 80 ? "var(--decs-status-error)" : undefined, fontWeight: s.gpuUtil >= 80 ? 700 : undefined }}>{s.gpuUtil}%</span>}
          />
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, accent, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, background: "var(--decs-surface-container)", border: "1px solid var(--decs-border-container)",
        borderRadius: "var(--decs-radius-container)", boxShadow: "var(--decs-shadow-container)", padding: "var(--decs-space-l)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ fontSize: "var(--decs-fs-body-s)", color: "var(--decs-text-inactive)" }}>{label}</div>
      <div style={{ fontSize: "var(--decs-fs-heading-xl)", fontWeight: 700, color: accent || "var(--decs-text-heading)", marginTop: 4, lineHeight: 1.1 }}>{value}</div>
      {sub ? <div style={{ fontSize: "var(--decs-fs-body-s)", color: "var(--decs-text-secondary)", marginTop: 4 }}>{sub}</div> : null}
    </div>
  );
}

function AdminDashboard({ onOpenContainers, onOpenErrorContainers, onOpenDetail, containers = [], users = [] }) {
  const running = containers.filter((c) => c.status === "success").length;
  const errored = containers.filter((c) => c.status === "error").length;
  const expiring = containers.filter((c) => c.status !== "stopped" && c.expires !== "—" && c.expires <= "2026-07-11").length;
  // 최신순(생성일 내림차순) — createdAt이 없는 항목은 맨 뒤로
  const recentContainers = [...containers].sort((a, b) => {
    const aKey = a.createdAt === "—" ? "" : a.createdAt;
    const bKey = b.createdAt === "—" ? "" : b.createdAt;
    return bKey.localeCompare(aKey);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--decs-space-l)" }}>
      <Header variant="h1" description="클러스터 자원과 컨테이너 상태를 한눈에 확인합니다">대시보드</Header>

      {errored > 0 ? (
        <Alert type="error" header={`컨테이너 ${errored}건에 오류가 있습니다`} action={<Button variant="normal" onClick={onOpenErrorContainers}>확인</Button>}>
          desired-state와 observed-state 불일치가 감지되었습니다. 상세에서 이벤트 로그를 확인하세요.
        </Alert>
      ) : null}

      <div style={{ display: "flex", gap: "var(--decs-space-m)" }}>
        <StatCard label="실행 중 컨테이너" value={running} sub={`전체 ${containers.length}건`} onClick={onOpenContainers} />
        <StatCard label="오류" value={errored} sub="즉시 조치 필요" accent="var(--decs-status-error)" onClick={onOpenErrorContainers} />
        <StatCard label="만료 임박 (3일)" value={expiring} sub="연장 안내 대상" accent="var(--decs-status-warning)" onClick={onOpenContainers} />
        <StatCard label="등록 사용자" value={users.length} sub="활성 세션 5" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "var(--decs-space-l)", alignItems: "start" }}>
        <Container header={<Header variant="h2" description="30초마다 자동으로 갱신됩니다.">GPU 클러스터 사용률</Header>}>
          <GpuUtilPanel />
        </Container>

        <Container disablePadding header={<Header variant="h2" counter={`(${containers.length})`} actions={<Button variant="link" onClick={onOpenContainers}>전체 보기</Button>}>최근 컨테이너</Header>}>
          <Table density="compact" trackBy="id" items={recentContainers.slice(0, 5)} columns={[
            {
              id: "name",
              header: "이름",
              cell: (c) => (
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onOpenDetail?.(c); }}
                  style={{ fontWeight: 600, color: "var(--decs-text-link)", textDecoration: "none" }}
                >
                  {c.name}
                </a>
              ),
            },
            { id: "user", header: "사용자", cell: (c) => c.user },
            { id: "gpu", header: "리소스 그룹", cell: (c) => <Badge color="brand">{c.gpu}</Badge> },
            { id: "status", header: "상태", cell: (c) => <StatusIndicator type={c.status}>{c.label}</StatusIndicator> },
          ]} />
        </Container>
      </div>
    </div>
  );
}
export default AdminDashboard;
