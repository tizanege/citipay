import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import TopNav from '../components/TopNav'
import MakePaymentModal from '../components/modals/MakePaymentModal'
import ReceiptModal from '../components/modals/ReceiptModal'
import ManualPaymentModal from '../components/modals/ManualPaymentModal'
import EligibilityOverrideModal from '../components/modals/EligibilityOverrideModal'
import RuleConfigModal from '../components/modals/RuleConfigModal'
import ReminderModal from '../components/modals/ReminderModal'
import OtpVerificationModal from '../components/modals/OtpVerificationModal'
import PasswordResetModal from '../components/modals/PasswordResetModal'
import './DashboardLayout.css'

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-body-wrap">
        <TopNav />
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>

      {/* Global Modals for Interactive CitiPay Flows */}
      <MakePaymentModal />
      <ReceiptModal />
      <ManualPaymentModal />
      <EligibilityOverrideModal />
      <RuleConfigModal />
      <ReminderModal />
      <OtpVerificationModal />
      <PasswordResetModal />
    </div>
  )
}
