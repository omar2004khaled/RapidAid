import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle, Siren } from 'lucide-react';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const handleCallback = () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('No authentication token received from Google.');
        return;
      }

      try {
        localStorage.setItem('authToken', token);
        const userData = parseJwt(token);
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }

        setStatus('success');
        setMessage('Google authentication successful! Redirecting to command center...');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } catch (err) {
        setStatus('error');
        setMessage('Failed to process authentication credentials.');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8EDE3] p-4 text-[#283227]">
      <div className="max-w-md w-full bg-white border border-[#BDD2B6] rounded-3xl shadow-xl p-8 text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Siren className="w-6 h-6 text-[#798777]" />
          <span className="text-xl font-black text-[#283227]">Rapid<span className="text-[#798777]">Aid</span></span>
        </div>

        {status === 'processing' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-[#798777] animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-[#283227]">Authenticating with Google</h2>
            <p className="text-sm text-[#5B6859]">Verifying security token and initializing your dispatch session...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#BDD2B6]/40 border border-[#A2B29F] text-[#798777] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#283227]">Access Granted</h2>
            <p className="text-sm text-[#5B6859]">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-500 flex items-center justify-center mx-auto shadow-md">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#283227]">Authentication Failed</h2>
            <p className="text-sm text-[#5B6859]">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-xl bg-[#798777] hover:bg-[#687566] text-white font-semibold text-sm shadow-md shadow-[#798777]/25 transition-all"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;