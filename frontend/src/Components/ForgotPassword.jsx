import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Siren, AlertCircle, CheckCircle2 } from 'lucide-react';
import authAPI from '../services/authAPI';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.forgotPassword(email.toLowerCase().trim());
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 bg-[#F8EDE3] text-[#283227]">
      {/* Left Emergency Hero Panel */}
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
            Secure Account <span className="text-[#BDD2B6]">Recovery.</span>
          </h1>
          <p className="text-[#F8EDE3]/90 text-base leading-relaxed">
            Enter your registered dispatch email address to receive secure instructions for resetting your operational credentials.
          </p>
        </div>

        <div className="relative z-10 text-xs text-[#BDD2B6]/70 font-mono">
          RapidAid &bull; Credential Recovery
        </div>
      </div>

      {/* Right Recovery Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#F8EDE3]">
        <div className="w-full max-w-md bg-white border border-[#BDD2B6] rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
          {!success ? (
            <>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#5B6859] hover:text-[#283227] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
                <h2 className="text-3xl font-extrabold text-[#283227] tracking-tight">
                  Forgot Password?
                </h2>
                <p className="text-sm text-[#5B6859]">
                  Enter your email address to receive password reset instructions.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#5B6859] uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-[#798777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      required
                      placeholder="dispatcher@emergency.gov"
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#F8EDE3]/50 border border-[#BDD2B6] text-[#283227] placeholder-[#A2B29F] focus:outline-none focus:border-[#798777] focus:ring-2 focus:ring-[#798777]/20 text-sm"
                    />
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
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#BDD2B6]/40 border border-[#A2B29F] text-[#798777] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#283227]">Check Your Inbox</h2>
                <p className="text-sm text-[#5B6859]">
                  We have sent reset instructions to <span className="font-semibold text-[#283227]">{email}</span>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#F8EDE3] border border-[#BDD2B6] text-xs text-[#5B6859] text-left space-y-2">
                <p className="font-semibold text-[#283227]">Next Steps:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check your inbox and spam/junk folder</li>
                  <li>Click the single-use recovery link inside the email</li>
                  <li>Set a new compliant password</li>
                </ul>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => { setSuccess(false); setEmail(''); }}
                  className="w-full h-11 rounded-xl bg-[#F8EDE3] hover:bg-[#ebdcd0] border border-[#BDD2B6] text-[#283227] text-xs font-semibold transition-colors"
                >
                  Try Another Email
                </button>
                <Link
                  to="/login"
                  className="block w-full text-center text-xs text-[#798777] hover:text-[#5B6859] font-semibold"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;