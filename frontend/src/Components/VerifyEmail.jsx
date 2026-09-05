import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, Siren, ArrowRight, CheckCircle2 } from 'lucide-react';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const justRegistered = location.state?.justRegistered || false;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

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
            Verify Your <span className="text-[#BDD2B6]">Identity.</span>
          </h1>
          <p className="text-[#F8EDE3]/90 text-base leading-relaxed">
            Emergency dispatch access requires identity verification to ensure authorized operations and telemetry security.
          </p>
        </div>

        <div className="relative z-10 text-xs text-[#BDD2B6]/70 font-mono">
          RapidAid &bull; Email Verification
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#F8EDE3]">
        <div className="w-full max-w-md bg-white border border-[#BDD2B6] rounded-3xl p-8 sm:p-10 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#BDD2B6]/40 border border-[#A2B29F] text-[#798777] flex items-center justify-center mx-auto shadow-md">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-[#283227] tracking-tight">
              Check Your Inbox
            </h2>
            <p className="text-sm text-[#5B6859]">
              We have dispatched a verification link to:
            </p>
            <p className="text-base font-bold text-[#798777] font-mono">
              {email}
            </p>
          </div>

          {justRegistered && (
            <div className="p-4 rounded-xl bg-[#BDD2B6]/30 border border-[#A2B29F] text-[#283227] text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#798777]" />
              Registration complete. Please confirm your email to activate.
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#F8EDE3] border border-[#BDD2B6] text-xs text-[#5B6859] text-left space-y-2">
            <p className="font-semibold text-[#283227]">Important:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click the activation button inside the email</li>
              <li>Once verified, your account can sign into the dispatch center</li>
              <li>Check your spam folder if you do not see the message in 2 minutes</li>
            </ul>
          </div>

          <button
            onClick={() => navigate('/login', { state: { email } })}
            className="w-full h-12 rounded-xl bg-[#798777] hover:bg-[#687566] text-white font-bold text-sm shadow-md shadow-[#798777]/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;