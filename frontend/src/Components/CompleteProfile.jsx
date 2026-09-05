import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Siren, AlertCircle, ArrowRight } from 'lucide-react';
import authAPI from '../services/authAPI';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    role: 'ADMINISTRATOR'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const validateField = (name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.trim().length < 3) return 'Username must be at least 3 characters';
        return '';
      case 'phone':
        if (!value) return 'Phone number is required';
        return '';
      case 'role':
        if (!value) return 'Role is required';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (apiError) setApiError('');
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const data = await authAPI.completeOAuthProfile(email, {
        username: formData.username.trim(),
        phone: formData.phone,
        role: formData.role
      });

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        if (data.role) localStorage.setItem('userRole', data.role);
        if (data.email) localStorage.setItem('userEmail', data.email);
      }
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message || 'Failed to complete profile');
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
            Complete Dispatch <span className="text-[#BDD2B6]">Profile.</span>
          </h1>
          <p className="text-[#F8EDE3]/90 text-base leading-relaxed">
            Provide remaining contact details to finalize registration for your verified Google account.
          </p>
        </div>

        <div className="relative z-10 text-xs text-[#BDD2B6]/70 font-mono">
          RapidAid &bull; Profile Completion
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#F8EDE3]">
        <div className="w-full max-w-md bg-white border border-[#BDD2B6] rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-[#283227] tracking-tight">
              Finalize Profile
            </h2>
            <p className="text-sm text-[#5B6859]">
              Authenticated as: <span className="text-[#283227] font-semibold">{email}</span>
            </p>
          </div>

          {apiError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#5B6859] uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="dispatcher_01"
                className="w-full h-12 px-4 rounded-xl bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] focus:outline-none focus:border-[#798777] text-sm"
              />
              {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5B6859] uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+1 (555) 000-0000"
                className="w-full h-12 px-4 rounded-xl bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] focus:outline-none focus:border-[#798777] text-sm"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5B6859] uppercase tracking-wider mb-2">
                Assigned Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] focus:outline-none focus:border-[#798777] text-sm"
              >
                <option value="ADMINISTRATOR">Administrator</option>
              </select>
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
                  <span>Complete Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;