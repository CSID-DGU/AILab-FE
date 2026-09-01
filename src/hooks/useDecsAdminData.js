import { useCallback, useEffect, useRef, useState } from "react";
import { podService } from "../services/podService";
import userService from "../services/userService";
import { requestService } from "../services/requestService";
import { mapAdminContainer } from "../utils/decsMapper";

const ERROR_MESSAGE = "일부 Pod 상세 정보를 불러오지 못했습니다.";

function getArrayData(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return undefined;
}

export function useDecsAdminData() {
  const [containers, setContainers] = useState(undefined);
  const [users, setUsers] = useState(undefined);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [pendingChangeRequestCount, setPendingChangeRequestCount] = useState(0);
  const [error, setError] = useState(null);
  const cancelledRef = useRef(false);

  const load = useCallback(async () => {
    setError(null);

    const [containersResult, usersResult, requestsResult, changeRequestsResult] = await Promise.allSettled([
      podService.getActiveContainers(),
      userService.getAllUsers(),
      requestService.getAllRequests(),
      requestService.getChangeRequests(),
    ]);
    if (cancelledRef.current) return;

    if (requestsResult.status === "fulfilled") {
      const requestsArray = getArrayData(requestsResult.value) ?? [];
      setPendingRequestCount(requestsArray.filter((r) => r.status === "PENDING").length);
    }
    if (changeRequestsResult.status === "fulfilled") {
      const changeRequestsArray = getArrayData(changeRequestsResult.value) ?? [];
      setPendingChangeRequestCount(changeRequestsArray.filter((r) => r.status === "PENDING").length);
    }

    let hasError = false;

    if (containersResult.status === "fulfilled" && containersResult.value?.status === 200) {
      const activeContainers = getArrayData(containersResult.value);
      if (activeContainers) {
        const [details, provisioningStatuses] = await Promise.all([
          Promise.allSettled(activeContainers.map((container) =>
            container.podName ? podService.getPod(container.podName) : Promise.resolve(null)
          )),
          Promise.allSettled(activeContainers.map((container) =>
            container.ubuntuUsername ? podService.getProvisioningStatus(container.ubuntuUsername) : Promise.resolve(null)
          )),
        ]);
        if (cancelledRef.current) return;
        setContainers(activeContainers.map((container, index) => {
          const result = details[index];
          const statusResult = provisioningStatuses[index];
          const detail = result.status === "fulfilled" ? result.value?.data?.data ?? result.value?.data : null;
          const provisioning = statusResult.status === "fulfilled" ? statusResult.value?.data : null;
          // Pod 상세도 프로비저닝 상태도 못 가져오면 그 컨테이너가 실제로 정상인지 전혀 알 수
          // 없다는 뜻이라, "확인 불가"를 조용히 pending으로 묻지 않고 오류로 명시한다.
          const couldNotResolveStatus = container.podName && !detail && (!provisioning || provisioning.stage === "unknown");
          if (couldNotResolveStatus) hasError = true;
          // effectiveStatus는 phase(예: Running)보다 컨테이너 실제 waiting/terminated 사유
          // (CrashLoopBackOff 등)를 우선한다 — phase만 보면 반복 재시작 중인 컨테이너를 놓친다.
          const status = couldNotResolveStatus
              ? "lookup-failed"
              : detail?.effectiveStatus ?? detail?.status ?? provisioning?.stage;
          return mapAdminContainer({ ...container, podDetail: detail, status });
        }));
      } else {
        hasError = true;
      }
    } else {
      hasError = true;
    }

    if (usersResult.status === "fulfilled" && usersResult.value?.status === 200) {
      const userList = getArrayData(usersResult.value);
      if (userList) {
        setUsers(userList);
      } else {
        hasError = true;
      }
    } else {
      hasError = true;
    }

    if (hasError) {
      setError(ERROR_MESSAGE);
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    load();

    return () => {
      cancelledRef.current = true;
    };
  }, [load]);

  return { containers, users, pendingRequestCount, pendingChangeRequestCount, error, refetch: load };
}
