import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Siren } from 'lucide-react';
import authAPI from '../services/authAPI';

const EmailVerified = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('Missing or invalid verification token.');
        return;
      }

      try {
        const res = await authAPI.verifyEmail(token);
        setStatus('success');
        setMessage(res?.message || 'Email verified successfully!');

        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Email successfully verified. You may now sign in.' }
          });
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Email verification failed. The link may be expired.');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8EDE3] p-4 text-[#283227]">
      <div className="max-w-md w-full bg-white border border-[#BDD2B6] rounded-3xl shadow-xl p-8 text-center space-y-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Siren className="w-6 h-6 text-[#798777]" />
          <span className="text-xl font-black text-[#283227]">Rapid<span className="text-[#798777]">Aid</span></span>
        </div>

        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-[#798777] animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-[#283227]">Verifying Your Credentials</h2>
            <p className="text-sm text-[#5B6859]">Please wait while we validate your verification token...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#BDD2B6]/40 border border-[#A2B29F] text-[#798777] flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#283227]">Email Verified!</h2>
            <p className="text-sm text-[#5B6859]">{message}</p>
            <div className="p-3 bg-[#BDD2B6]/30 border border-[#A2B29F] rounded-xl text-xs text-[#283227]">
              Redirecting you to the sign-in portal in 3 seconds...
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#798777] hover:bg-[#687566] text-white font-semibold text-sm shadow-md shadow-[#798777]/25 transition-all"
            >
              Sign In Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-red-500 flex items-center justify-center mx-auto shadow-md">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#283227]">Verification Failed</h2>
            <p className="text-sm text-[#5B6859]">{message}</p>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-[#798777] hover:bg-[#687566] text-white font-semibold text-sm shadow-md shadow-[#798777]/25 transition-all"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerified;