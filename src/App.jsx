import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// 1. Member / Player Access Level Pages
import PlayerDashboard from './pages/PlayerDashboard'
import PaymentsPage from './pages/PaymentsPage'
import PaymentHistoryPage from './pages/PaymentHistoryPage'
import PerformancePage from './pages/PerformancePage'
import RankingsPage from './pages/RankingsPage'
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

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  return children
}

// Public route wrapper
function PublicRoute({ children }) {
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
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
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* ── 2. Club Executive Access Level ── */}
        <Route path="/club/dashboard" element={<ClubDashboard />} />
        <Route path="/club/players" element={<ClubSquadPage />} />
        <Route path="/club/payments" element={<ClubPaymentsPage />} />
        <Route path="/club/receipts" element={<ClubReceiptsPage />} />
        <Route path="/club/audit" element={<ClubAuditPage />} />
        <Route path="/club/profile" element={<ClubProfilePage />} />

        {/* ── 3. Super Admin Federation Access Level ── */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/clubs" element={<AdminClubsPage />} />
        <Route path="/admin/players" element={<AdminPlayersPage />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        <Route path="/admin/audit" element={<AdminAuditPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Default Catch-all */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
