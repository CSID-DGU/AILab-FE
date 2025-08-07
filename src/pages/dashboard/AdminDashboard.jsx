import { useState, useEffect } from "react";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Badge from "../../components/UI/Badge";
import {
  UsersIcon,
  ServerIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock API call to fetch admin dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);

      // Mock data - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData = {
        stats: {
          totalUsers: 156,
          activeUsers: 89,
          pendingApplications: 7,
          activeServers: 23,
          totalResources: {
            cpu: { total: 320, used: 156 },
            gpu: { total: 48, used: 31 },
            memory: { total: 2048, used: 1234 },
            storage: { total: 50000, used: 23456 },
          },
        },
        pendingApplications: [
          {
            id: 1,
            userName: "김철수",
            email: "kim@dgu.ac.kr",
            department: "컴퓨터공학과",
            submittedAt: "2024-01-15",
            type: "new",
          },
          {
            id: 2,
            userName: "이영희",
            email: "lee@dgu.ac.kr",
            department: "전자공학과",
            submittedAt: "2024-01-14",
            type: "extension",
          },
          {
            id: 3,
            userName: "박민수",
            email: "park@dgu.ac.kr",
            department: "컴퓨터공학과",
            submittedAt: "2024-01-13",
            type: "modification",
          },
        ],
        recentActivities: [
          {
            id: 1,
            action: "새 사용자 가입",
            target: "홍길동 (hong@dgu.ac.kr)",
            time: "10분 전",
          },
          {
            id: 2,
            action: "서버 신청 승인",
            target: "김철수 - 신규 신청",
            time: "1시간 전",
          },
          {
            id: 3,
            action: "리소스 사용량 초과",
            target: "이영희 - GPU 사용량 90%",
            time: "2시간 전",
          },
          {
            id: 4,
            action: "사용 기간 만료 예정",
            target: "박민수 - 7일 후 만료",
            time: "3시간 전",
          },
        ],
        systemAlerts: [
          {
            id: 1,
            message: "서버 1번 GPU 사용률이 95%를 초과했습니다.",
            severity: "warning",
            time: "30분 전",
          },
          {
            id: 2,
            message: "3명의 사용자 사용 기간이 일주일 내 만료됩니다.",
            severity: "info",
            time: "1시간 전",
          },
          {
            id: 3,
            message: "새로운 서버 신청 7건이 대기 중입니다.",
            severity: "info",
            time: "2시간 전",
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">관리자 대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const getProgressWidth = (used, total) => {
    return Math.min((used / total) * 100, 100);
  };

  const getProgressColor = (used, total) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getApplicationTypeBadge = (type) => {
    switch (type) {
      case "new":
        return <Badge variant="info">신규</Badge>;
      case "extension":
        return <Badge variant="warning">연장</Badge>;
      case "modification":
        return <Badge variant="primary">변경</Badge>;
      default:
        return <Badge variant="default">기타</Badge>;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "critical":
        return <Badge variant="danger">긴급</Badge>;
      case "warning":
        return <Badge variant="warning">경고</Badge>;
      case "info":
        return <Badge variant="info">정보</Badge>;
      default:
        return <Badge variant="default">일반</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600 mt-1">
          DGU AI Lab 시스템 전체 현황을 확인하세요.
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">전체 사용자</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.totalUsers}
              </p>
              <p className="text-xs text-green-600">
                활성: {dashboardData.stats.activeUsers}명
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">대기 중인 신청</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.pendingApplications}
              </p>
              <p className="text-xs text-yellow-600">처리 필요</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <ServerIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">활성 서버</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.stats.activeServers}
              </p>
              <p className="text-xs text-green-600">정상 운영</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">리소스 사용률</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  (dashboardData.stats.totalResources.cpu.used /
                    dashboardData.stats.totalResources.cpu.total) *
                    100
                )}
                %
              </p>
              <p className="text-xs text-purple-600">CPU 기준</p>
            </div>
          </div>
        </Card>
      </div>

      {/* System Resource Usage */}
      <Card
        title="시스템 리소스 현황"
        subtitle="전체 리소스의 사용량을 모니터링합니다"
      >
        <div className="space-y-6">
          {Object.entries(dashboardData.stats.totalResources).map(
            ([key, resource]) => {
              const labels = {
                cpu: "CPU 코어",
                gpu: "GPU 코어",
                memory: "메모리 (GB)",
                storage: "스토리지 (GB)",
              };

              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">
                      {labels[key]}
                    </span>
                    <span className="text-gray-600">
                      {resource.used} / {resource.total}(
                      {Math.round((resource.used / resource.total) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(
                        resource.used,
                        resource.total
                      )}`}
                      style={{
                        width: `${getProgressWidth(
                          resource.used,
                          resource.total
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </Card>

      {/* Pending Applications */}
      <Card title="대기 중인 신청" subtitle="검토가 필요한 신청 목록입니다">
        <div className="space-y-4">
          {dashboardData.pendingApplications.map((application) => (
            <div
              key={application.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {application.userName}
                  </p>
                  <p className="text-sm text-gray-600">{application.email}</p>
                  <p className="text-xs text-gray-500">
                    {application.department} • {application.submittedAt}
                  </p>
                </div>
                {getApplicationTypeBadge(application.type)}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="small">
                  검토
                </Button>
                <Button variant="primary" size="small">
                  승인
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="outline">모든 신청 보기</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <Card title="시스템 알림">
          <div className="space-y-3">
            {dashboardData.systemAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start p-3 bg-gray-50 rounded-lg"
              >
                <div className="mr-3 mt-1">
                  {getSeverityBadge(alert.severity)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="outline" size="small">
              모든 알림 보기
            </Button>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card title="최근 활동">
          <div className="space-y-3">
            {dashboardData.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{activity.action}</span>
                  </p>
                  <p className="text-sm text-gray-600">{activity.target}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="outline" size="small">
              활동 로그 보기
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="빠른 작업">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Button
            variant="outline"
            className="h-16 flex flex-col justify-center"
          >
            <UsersIcon className="w-5 h-5 mb-1" />
            <span className="text-sm">사용자 관리</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col justify-center"
          >
            <ClockIcon className="w-5 h-5 mb-1" />
            <span className="text-sm">신청 처리</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col justify-center"
          >
            <ServerIcon className="w-5 h-5 mb-1" />
            <span className="text-sm">서버 관리</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col justify-center"
          >
            <ChartBarIcon className="w-5 h-5 mb-1" />
            <span className="text-sm">모니터링</span>
          </Button>
          <Button
            variant="outline"
            className="h-16 flex flex-col justify-center"
          >
            <ExclamationTriangleIcon className="w-5 h-5 mb-1" />
            <span className="text-sm">시스템 설정</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
