import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Siren, AlertCircle, ArrowRight } from 'lucide-react';
import authAPI from '../services/authAPI';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Missing or invalid password reset token.');
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter and one number');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, formData.password);
      navigate('/login', {
        state: { message: 'Password reset successfully! Please sign in with your new password.' }
      });
    } catch (err) {
      const msg = err.message || 'Failed to reset password.';
      if (msg.includes('expired') || msg.includes('invalid')) {
        setTokenValid(false);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-[#F8EDE3] text-[#283227]">
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-[#798777] via-[#5B6859] to-[#3F493D] relative overflow-hidden border-r border-[#A2B29F]/30">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#BDD2B6] shadow-xl">
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Rapid<span className="text-[#BDD2B6]">Aid</span>
            </h2>
            <p className="text-xs text-[#BDD2B6] font-medium tracking-wide">Emergency Dispatch System</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight text-white">
            Set New <span className="text-[#BDD2B6]">Password.</span>
          </h1>
          <p className="text-[#F8EDE3]/90 text-base leading-relaxed">
            Create a strong, unique password to secure access to dispatch capabilities and vehicle operations.
          </p>
        </div>

        <div className="relative z-10 text-xs text-[#BDD2B6]/70 font-mono">
          RapidAid &bull; Account Security
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#F8EDE3]">
        <div className="w-full max-w-md bg-white border border-[#BDD2B6] rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-[#283227] tracking-tight">
              Create New Password
            </h2>
            <p className="text-sm text-[#5B6859]">
              Ensure your new password meets complexity requirements
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {tokenValid ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#5B6859] uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="8+ characters"
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] focus:outline-none focus:border-[#798777] text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6859] hover:text-[#283227]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5B6859] uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Re-enter password"
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] focus:outline-none focus:border-[#798777] text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B6859] hover:text-[#283227]"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-[#5B6859]">
                This reset token is invalid or has expired.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#798777] text-white text-xs font-semibold hover:bg-[#687566] shadow-sm"
              >
                Request a new link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;