import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Layout/Header.jsx";
import ProtectedRoute from "./components/Layout/ProtectedRoute.jsx";
import SignIn from "./components/Auth/SignIn.jsx";
import SignUp from "./components/Auth/SignUp.jsx";
import TenantDashboard from "./pages/Tenant/TenantDashboard.jsx";
import TenantProfile from "./pages/Tenant/TenantProfile.jsx";
import NewRequest from "./pages/Tenant/NewRequest.jsx";
import LandlordDashboard from "./pages/Landlord/LandlordDashboard.jsx";
import LandlordConsole from "./pages/Landlord/LandlordConsole.jsx";
import RequestDetailsPage from "./pages/Shared/RequestDetailsPage.jsx";
import ReportsPage from "./pages/Landlord/ReportsPage.jsx";
import LandlordPayments from "./pages/Landlord/LandlordPayments.jsx";
import ChatPage from "./pages/Shared/ChatPage.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          <Route
            path="/tenant"
            element={
              <ProtectedRoute>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/profile"
            element={
              <ProtectedRoute>
                <TenantProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/new-request"
            element={
              <ProtectedRoute>
                <NewRequest />
              </ProtectedRoute>
            }
          />

          <Route
            path="/landlord"
            element={
              <ProtectedRoute>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/console"
            element={
              <ProtectedRoute>
                <LandlordConsole />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/payments"
            element={
              <ProtectedRoute>
                <LandlordPayments />
              </ProtectedRoute>
            }
          />

          {/* shared */}
          <Route
            path="/request/:id"
            element={
              <ProtectedRoute>
                <RequestDetailsPage />
              </ProtectedRoute>
            }
          />

          {/* chat */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/tenant" replace />} />
          <Route path="*" element={<div className="p-6">Not Found</div>} />
        </Routes>
      </main>
    </div>
  );
}
