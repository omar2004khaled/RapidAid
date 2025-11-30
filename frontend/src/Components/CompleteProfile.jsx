import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    role: ''
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
        if (!/^[A-Za-z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return '';

      case 'phone':
        if (!value) return 'Phone number is required';
        if (!/^[\d\s\-\(\)\+]+$/.test(value)) return 'Please enter a valid phone number';
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
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);

      try {
        const response = await fetch(`http://localhost:8080/auth/complete-oauth-profile?email=${encodeURIComponent(email)}`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          mode: 'cors',
          body: JSON.stringify({
            username: formData.username.trim(),
            phone: formData.phone,
            role: formData.role
          })
        });

        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = { message: responseText };
        }

        if (!response.ok) {
          let errorMessage = 'Profile completion failed';
          
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data.message) {
            errorMessage = data.message;
          }

          setApiError(errorMessage);
          return;
        }

        // Success - store token and redirect
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        navigate('/dashboard');
          
      } catch (error) {
        console.error("Profile completion error:", error);
        setApiError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      {/* Left Panel */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-red-600 via-red-700 to-black text-center">
        <div className="self-start">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.jpg" 
              alt="Logo"
              className="h-12 w-auto object-contain"
            />
            <span className="text-2xl font-bold text-white">Emergency Dispatch</span>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h1 className="text-white text-5xl font-black leading-tight tracking-[-0.033em]">
            Complete Your Profile
          </h1>
          <h2 className="text-gray-100 text-base font-normal leading-normal">
            Provide additional information to access the emergency dispatch system.
          </h2>
        </div>
        <div></div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gray-900">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white">Complete Your Profile</h1>
            <p className="text-gray-300">
              Signed in as: <span className="font-medium text-white">{email}</span>
            </p>
          </div>

          {apiError && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-sm text-red-300">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white">Username</span>
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`h-12 px-4 rounded-lg border ${
                  errors.username ? 'border-red-500' : 'border-gray-600'
                } bg-gray-800 focus:bg-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white placeholder:text-gray-400 transition-colors`}
                placeholder="e.g. dispatcher01"
              />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username}</p>
              )}
            </label>

            {/* Phone */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white">Phone Number</span>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`h-12 px-4 rounded-lg border ${
                  errors.phone ? 'border-red-500' : 'border-gray-600'
                } bg-gray-800 focus:bg-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white placeholder:text-gray-400 transition-colors`}
                placeholder="(123) 456-7890"
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </label>

            {/* Role */}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-white">Role</span>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`h-12 px-4 rounded-lg border ${
                  errors.role ? 'border-red-500' : 'border-gray-600'
                } bg-gray-800 focus:bg-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white transition-colors`}
              >
                <option value="">Select role</option>
                <option value="DISPATCHER">Dispatcher</option>
                <option value="RESPONDER">Responder</option>
                <option value="ADMINISTRATOR">Administrator</option>
              </select>
              {errors.role && (
                <p className="text-xs text-red-500">{errors.role}</p>
              )}
            </label>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Completing...
                </>
              ) : (
                'Complete Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;