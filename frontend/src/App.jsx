import { Routes, Route } from 'react-router-dom';
import SignUp from "./Components/SignUp";
import Login from "./Components/Login";
import VerifyEmail from "./Components/VerifyEmail";
import EmailVerified from "./Components/EmailVerified";
import ForgotPassword from './Components/ForgotPassword';
import ResetPassword from './Components/ResetPassword';
import OAuthCallback from "./Components/OAuthCallback";
import Dashboard from "./Components/Dashboard";
import CompleteProfile from "./Components/CompleteProfile";
import DispatcherPage from './pages/DispatcherPage';
import ReporterPage from './pages/ReporterPage';
import ProtectedRoute from "./Components/ProtectedRoute";
import AuthRoute from "./Components/AuthRoute";

function App() {
  return (
    <Routes>
      <Route
        path="/signup"
        element={
          <AuthRoute>
            <SignUp />
          </AuthRoute>
        }
      />
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
      <Route path='/report' element={<ReporterPage />} />
      <Route
        path="/"
        element={
          <AuthRoute>
            <Login />
          </AuthRoute>
        }
      />
    </Routes>
  );
}

export default App;
