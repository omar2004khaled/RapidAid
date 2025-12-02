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

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/email-verified" element={<EmailVerified />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dispatcher" element={<DispatcherPage />} />
      <Route path='/report' element={<ReporterPage />} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
}

export default App;
