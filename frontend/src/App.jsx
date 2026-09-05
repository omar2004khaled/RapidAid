import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './Components/Login';
import VerifyEmail from './Components/VerifyEmail';
import EmailVerified from './Components/EmailVerified';
import ForgotPassword from './Components/ForgotPassword';
import ResetPassword from './Components/ResetPassword';
import OAuthCallback from './Components/OAuthCallback';
import CompleteProfile from './Components/CompleteProfile';
import Dashboard from './Components/Dashboard';
import DispatcherPage from './pages/DispatcherPage';
import ReporterPage from './pages/ReporterPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DebugPage from './pages/DebugPage';
import ProtectedRoute from './Components/ProtectedRoute';
import AuthRoute from './Components/AuthRoute';
import { Siren } from 'lucide-react';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F8EDE3] text-[#283227] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white border border-[#BDD2B6] rounded-3xl p-8 max-w-md shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#BDD2B6]/40 border border-[#A2B29F] text-[#798777] flex items-center justify-center mx-auto shadow-md">
          <Siren className="w-8 h-8 animate-pulse" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#283227] mb-2">404 - Page Not Found</h1>
          <p className="text-xs text-[#5B6859] leading-relaxed">
            The requested tactical dispatch route does not exist or has been decommissioned.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="inline-block px-6 py-3 rounded-xl bg-[#798777] hover:bg-[#687566] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#798777]/25 transition-all"
        >
          Return to Command Center
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/email-verified" element={<EmailVerified />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dispatcher"
        element={
          <ProtectedRoute>
            <DispatcherPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/report" element={<ReporterPage />} />
      <Route path="/debug" element={<DebugPage />} />

      <Route
        path="/"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
