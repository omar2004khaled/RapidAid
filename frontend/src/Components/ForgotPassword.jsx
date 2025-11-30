import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';

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
      const response = await fetch("http://localhost:8080/auth/forgot-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: 'cors',
        body: JSON.stringify({
          email: email.toLowerCase().trim()
        })
      });

      const responseText = await response.text();
      let data;
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          data = { message: responseText };
        }
      } else {
        data = { message: responseText };
      }

      if (!response.ok) {
        let errorMessage = 'Failed to send reset link. Please try again.';
        
        if (data && typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (responseText && typeof responseText === 'string') {
          errorMessage = responseText;
        }

        setError(errorMessage);
        return;
      }

      setSuccess(true);
    } catch (error) {
      console.error("Forgot Password Error:", error);
      if (error.message === 'Failed to fetch') {
        setError('Cannot connect to server. Please try again later.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
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
            Reset Your Password
          </h1>
          <h2 className="text-gray-100 text-base font-normal leading-normal">
            We'll send you instructions to reset your password securely.
          </h2>
        </div>
        <div></div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gray-900">
        <div className="w-full max-w-md flex flex-col gap-8">
          {!success ? (
            <>
              <div className="flex flex-col gap-4">
                <Link 
                  to="/login"
                  className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors w-fit"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>

                <div className="flex flex-col gap-2 text-center md:text-left">
                  <h1 className="text-3xl font-bold text-white">Forgot Password?</h1>
                  <p className="text-gray-300">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-5">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-white">Email Address</span>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      required
                      className="h-12 w-full pl-12 pr-4 rounded-lg border border-gray-600 bg-gray-800 focus:bg-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 text-white placeholder:text-gray-400 transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </label>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="h-12 w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-foreground">Check Your Email</h2>
                <p className="text-muted-foreground">
                  We've sent a password reset link to <strong className="text-foreground">{email}</strong>
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground text-left">
                <p className="mb-2">Didn't receive the email?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check your spam folder</li>
                  <li>Make sure you entered the correct email</li>
                  <li>Wait a few minutes and try again</li>
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="h-12 w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
                >
                  Try Another Email
                </button>
                
                <Link
                  to="/login"
                  className="h-12 w-full flex items-center justify-center border border-input hover:bg-muted/50 font-medium rounded-lg transition-colors"
                >
                  Back to Login
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