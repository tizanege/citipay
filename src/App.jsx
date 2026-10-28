import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useCitiPay } from './contexts/CitiPayContext'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// 1. Member / Player Access Level Pages
import PlayerDashboard from './pages/PlayerDashboard'
import PaymentsPage from './pages/PaymentsPage'
import PaymentHistoryPage from './pages/PaymentHistoryPage'
import ProfilePage from './pages/ProfilePage'

// 2. Club Executive Access Level Pages
import ClubDashboard from './pages/ClubDashboard'
import ClubSquadPage from './pages/ClubSquadPage'
import ClubPaymentsPage from './pages/ClubPaymentsPage'
import ClubReceiptsPage from './pages/ClubReceiptsPage'
import ClubAuditPage from './pages/ClubAuditPage'
import ClubProfilePage from './pages/ClubProfilePage'

// 3. Super Admin / Federation Access Level Pages
import AdminDashboard from './pages/AdminDashboard'
import AdminClubsPage from './pages/AdminClubsPage'
import AdminPlayersPage from './pages/AdminPlayersPage'
import AdminPaymentsPage from './pages/AdminPaymentsPage'
import AdminAuditPage from './pages/AdminAuditPage'
import AdminSettingsPage from './pages/AdminSettingsPage'

function getHomePathForRole(role) {
  if (role === 'super_admin') return '/admin/dashboard'
  if (role === 'club_admin' || role === 'president') return '/club/dashboard'
  return '/dashboard'
}

// Protected route wrapper enforcing authentication
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useCitiPay()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

// Role-restricted route wrapper
function RoleRoute({ allowedRoles, children }) {
  const { isAuthenticated, currentRole } = useCitiPay()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (allowedRoles && !allowedRoles.includes(currentRole)) {
    return <Navigate to={getHomePathForRole(currentRole)} replace />
  }
  return children
}

// Public route wrapper
function PublicRoute({ children }) {
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public routes - Login is the primary entrance */}
      <Route path="/" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Authenticated Dashboard Layout Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* ── 1. Member / Player Access Level ── */}
        <Route path="/dashboard" element={<PlayerDashboard />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/payment-history" element={<PaymentHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/performance" element={<Navigate to="/dashboard" replace />} />
        <Route path="/rankings" element={<Navigate to="/dashboard" replace />} />

        {/* ── 2. Club Executive Access Level (Ikoyi Sunday League Admin) ── */}
        <Route path="/club/dashboard" element={<RoleRoute allowedRoles={['club_admin', 'president', 'super_admin']}><ClubDashboard /></RoleRoute>} />
        <Route path="/club/players" element={<RoleRoute allowedRoles={['club_admin', 'president', 'super_admin']}><ClubSquadPage /></RoleRoute>} />
        <Route path="/club/payments" element={<RoleRoute allowedRoles={['club_admin', 'president', 'super_admin']}><ClubPaymentsPage /></RoleRoute>} />
        <Route path="/club/receipts" element={<RoleRoute allowedRoles={['club_admin', 'president', 'super_admin']}><ClubReceiptsPage /></RoleRoute>} />
        <Route path="/club/audit" element={<RoleRoute allowedRoles={['club_admin', 'president', 'super_admin']}><ClubAuditPage /></RoleRoute>} />
        <Route path="/club/profile" element={<RoleRoute allowedRoles={['club_admin', 'president', 'super_admin']}><ClubProfilePage /></RoleRoute>} />

        {/* ── 3. Super Admin Federation Access Level ── */}
        <Route path="/admin/dashboard" element={<RoleRoute allowedRoles={['super_admin']}><AdminDashboard /></RoleRoute>} />
        <Route path="/admin/clubs" element={<RoleRoute allowedRoles={['super_admin']}><AdminClubsPage /></RoleRoute>} />
        <Route path="/admin/players" element={<RoleRoute allowedRoles={['super_admin']}><AdminPlayersPage /></RoleRoute>} />
        <Route path="/admin/payments" element={<RoleRoute allowedRoles={['super_admin']}><AdminPaymentsPage /></RoleRoute>} />
        <Route path="/admin/audit" element={<RoleRoute allowedRoles={['super_admin']}><AdminAuditPage /></RoleRoute>} />
        <Route path="/admin/settings" element={<RoleRoute allowedRoles={['super_admin']}><AdminSettingsPage /></RoleRoute>} />
      </Route>

      {/* Default Catch-all redirects to the login main page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
