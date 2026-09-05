import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Siren, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import authAPI from '../services/authAPI';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get("error");
    if (errorParam === "not_registered") {
      setError("This Google account is not registered. Please sign up first.");
      setSuccessMessage('');
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [location]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await authAPI.login({
        email: formData.email.toLowerCase().trim(),
        password: formData.password
      });

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        if (data.role) localStorage.setItem('userRole', data.role);
        if (data.email) localStorage.setItem('userEmail', data.email);
      }

      navigate('/dashboard');
    } catch (err) {
      let msg = err.message || 'Login failed';
      if (msg.includes('verify') || msg.includes('verified')) {
        msg = 'Please verify your email before logging in. Check your inbox for the verification link.';
      } else if (msg.includes('401')) {
        msg = 'Invalid email or password. Please try again.';
      } else if (msg.includes('403')) {
        msg = 'Account not verified or pending approval. Please check your email.';
      } else if (msg.includes('Failed to fetch')) {
        msg = 'Cannot connect to server. Please verify backend is running on http://localhost:8080';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-[#F8EDE3] text-[#283227]">
      {/* Left Emergency Hero Panel */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-[#798777] via-[#5B6859] to-[#3F493D] relative overflow-hidden border-r border-[#BDD2B6]/30">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-[#BDD2B6]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -top-24 w-96 h-96 bg-[#F8EDE3]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl">
            <Siren className="w-6 h-6 text-[#F8EDE3] animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Rapid<span className="text-[#BDD2B6]">Aid</span>
            </h2>
            <p className="text-xs text-[#E5ECE3] font-medium tracking-wide">Emergency Dispatch System</p>
          </div>
        </div>

        {/* Center message */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight text-white">
            Rapid & Reliable <span className="text-[#BDD2B6]">Response.</span>
          </h1>
          <p className="text-[#E7EDE5] text-base leading-relaxed">
            Intelligent emergency dispatch coordination connecting medical, fire, and police units with real-time tracking when every second counts.
          </p>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-[#D8E2D6] font-mono">
          RapidAid System &bull; Secured with TLS & JWT &bull; 2026
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#F8EDE3]">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-[#BDD2B6] space-y-7">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 md:hidden mb-4">
              <Siren className="w-6 h-6 text-[#798777]" />
              <span className="text-xl font-bold text-[#283227]">RapidAid</span>
            </div>
            <h2 className="text-3xl font-extrabold text-[#283227] tracking-tight">
              Sign In to Command
            </h2>
            <p className="text-sm text-[#5B6859]">
              Access the emergency dispatch optimization platform
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-[#BDD2B6]/30 border border-[#A2B29F] text-[#283227] text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#798777] flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#5B6859] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="dispatcher@emergency.gov"
                className="w-full h-12 px-4 rounded-xl bg-[#F8EDE3]/40 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] focus:outline-none focus:border-[#798777] focus:ring-2 focus:ring-[#798777]/20 transition-all text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#5B6859] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#798777] hover:text-[#283227] font-semibold transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-[#F8EDE3]/40 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] focus:outline-none focus:border-[#798777] focus:ring-2 focus:ring-[#798777]/20 transition-all text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#798777] hover:text-[#283227] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-[#798777] hover:bg-[#687566] text-white font-bold text-sm shadow-md shadow-[#798777]/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Emergency reporting quick link */}
          <div className="pt-5 border-t border-[#BDD2B6]/60 text-center">
            <Link
              to="/report"
              className="w-full h-11 rounded-xl bg-[#BDD2B6]/30 hover:bg-[#BDD2B6]/50 border border-[#BDD2B6] text-[#283227] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Siren className="w-4 h-4 text-[#798777]" />
              Public Emergency Incident Reporting Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;