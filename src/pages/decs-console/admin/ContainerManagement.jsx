// ContainerManagement — Table + 검색/필터 + 행 상세 + 무한 스크롤
import React from "react";
import { Table, Header, Container, StatusIndicator, Badge, Button, Input, Select } from "../../../design-system";

const BATCH_SIZE = 10;

function ContainerManagement({ onOpenDetail, containers = [] }) {
  const all = containers;
  const [q, setQ] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [sort, setSort] = React.useState({ col: null, desc: false });
  const [visibleCount, setVisibleCount] = React.useState(BATCH_SIZE);
  const sentinelRef = React.useRef(null);

  let rows = all.filter((c) =>
    (q === "" || c.name.includes(q) || c.user.includes(q)) &&
    (statusFilter === "all" || c.status === statusFilter)
  );
  if (sort.col) {
    const f = sort.col.sortingField;
    rows = [...rows].sort((a, b) => String(a[f]).localeCompare(String(b[f])) * (sort.desc ? -1 : 1));
  }
  const hasMore = visibleCount < rows.length;
  const pageRows = rows.slice(0, visibleCount);

  React.useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [q, statusFilter, sort.col, sort.desc]);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount((count) => Math.min(count + BATCH_SIZE, rows.length));
      }
    }, { rootMargin: "200px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, rows.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--decs-space-l)" }}>
      <Header variant="h1" description="검색·필터로 원하는 컨테이너를 찾고 상세 정보를 확인합니다">컨테이너 관리</Header>

      <Container disablePadding header={
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--decs-space-s)" }}>
          <Header variant="h2" counter={`(${rows.length})`}>
            컨테이너
          </Header>
          <div style={{ display: "flex", gap: "var(--decs-space-s)" }}>
            <div style={{ flex: 1, maxWidth: 320 }}>
              <Input value={q} onChange={setQ} iconName="magnifying-glass" placeholder="이름 또는 사용자 검색" type="search" />
            </div>
            <div style={{ width: 200 }}>
              <Select selectedValue={statusFilter} onChange={setStatusFilter} options={[
                { value: "all", label: "모든 상태" },
                { value: "success", label: "실행 중" },
                { value: "in-progress", label: "프로비저닝 중" },
                { value: "pending", label: "승인 대기" },
                { value: "error", label: "오류" },
                { value: "stopped", label: "만료" },
              ]} />
            </div>
          </div>
        </div>
      }>
        <Table
          density="compact" trackBy="id"
          sortingColumn={sort.col} sortingDescending={sort.desc}
          onSortingChange={({ sortingColumn, sortingDescending }) => setSort({ col: sortingColumn, desc: sortingDescending })}
          items={pageRows}
          empty="조건에 맞는 컨테이너가 없습니다."
          columns={[
            { id: "name", header: "이름", sortingField: "name", cell: (c) => <a href="#" onClick={(e) => { e.preventDefault(); onOpenDetail(c); }} style={{ color: "var(--decs-text-link)", fontWeight: 600, textDecoration: "none" }}>{c.name}</a> },
            { id: "user", header: "사용자", sortingField: "user", cell: (c) => c.user },
            { id: "gpu", header: "리소스 그룹", cell: (c) => <Badge color="brand">{c.gpu}</Badge> },
            { id: "node", header: "노드", sortingField: "node", cell: (c) => c.node },
            { id: "status", header: "상태", cell: (c) => <StatusIndicator type={c.status}>{c.label}</StatusIndicator> },
            { id: "expires", header: "만료", sortingField: "expires", cell: (c) => <span style={{ color: "var(--decs-text-secondary)" }}>{c.expires}</span> },
            { id: "actions", header: "", width: 90, cell: (c) => <Button variant="normal" onClick={() => onOpenDetail(c)}>상세</Button> },
          ]}
          footer={rows.length > 0 ? (
            <div ref={sentinelRef} style={{ display: "flex", justifyContent: "center", color: "var(--decs-text-secondary)", fontSize: "var(--decs-fs-body-s)", minHeight: "1px" }}>
              {hasMore ? "스크롤하면 더 불러옵니다…" : null}
            </div>
          ) : null}
        />
      </Container>
    </div>
  );
}
export default ContainerManagement;
