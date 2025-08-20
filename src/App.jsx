import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import DashboardLayout from "./components/Layout/DashboardLayout";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

// Dashboard Pages
import UserDashboard from "./pages/dashboard/UserDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

// Admin Pages
import RequestManagementPage from "./pages/admin/RequestManagementPage";

// Other Pages
import AccountPage from "./pages/AccountPage";
import ServerApplicationPage from "./pages/ServerApplicationPage";
import RequestStatusPage from "./pages/RequestStatusPage";

// Legacy Pages (for reference)
import HomePage from "./pages/HomePage";
import ExamplePage from "./pages/ExamplePage";

const AppContent = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
              replace
            />
          ) : (
            <LoginPage onLogin={login} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
              replace
            />
          ) : (
            <SignupPage />
          )
        }
      />

      {/* Protected User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout user={user} onLogout={logout}>
              <UserDashboard user={user} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/application"
        element={
          <ProtectedRoute>
            <DashboardLayout user={user} onLogout={logout}>
              <ServerApplicationPage user={user} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <DashboardLayout user={user} onLogout={logout}>
              <RequestStatusPage user={user} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <DashboardLayout user={user} onLogout={logout}>
              <AccountPage user={user} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout user={user} onLogout={logout}>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/request-management"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout user={user} onLogout={logout}>
              <RequestManagementPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/applications"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout user={user} onLogout={logout}>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">신청 관리</h2>
                <p className="text-gray-600 mt-2">개발 중입니다.</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout user={user} onLogout={logout}>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">
                  사용자 관리
                </h2>
                <p className="text-gray-600 mt-2">개발 중입니다.</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/monitoring"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout user={user} onLogout={logout}>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">
                  리소스 모니터링
                </h2>
                <p className="text-gray-600 mt-2">개발 중입니다.</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/containers"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout user={user} onLogout={logout}>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">
                  컨테이너 관리
                </h2>
                <p className="text-gray-600 mt-2">개발 중입니다.</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute requireAdmin>
            <DashboardLayout user={user} onLogout={logout}>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900">
                  시스템 설정
                </h2>
                <p className="text-gray-600 mt-2">개발 중입니다.</p>
              </div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Legacy Routes (for reference) */}
      <Route path="/legacy" element={<HomePage />} />
      <Route path="/example" element={<ExamplePage />} />

      {/* Root Route */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch All */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-8">페이지를 찾을 수 없습니다.</p>
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium text-white bg-[#F68313] hover:bg-[#E6750F]"
              >
                홈으로 돌아가기
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
