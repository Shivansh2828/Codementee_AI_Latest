import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../components/ui/ThemeToggle';
import api from '../utils/api';

const ForgotPasswordPage = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (error) {
      // Always show success to prevent email enumeration
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link to="/login" className={`flex items-center gap-2 ${theme.text.secondary} hover:${theme.text.accent} transition-colors`}>
            <ArrowLeft size={18} />
            Back to Login
          </Link>
          <ThemeToggle />
        </div>

        <div className={`${theme.bg.card} rounded-xl ${theme.border.primary} border p-8 ${theme.shadow}`}>
          {!submitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>Forgot Password</h1>
                <p className={theme.text.secondary}>Enter your email and we'll send you a reset link</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors`}
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full justify-center"
                >
                  {isLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Sending...</>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <Mail size={48} className="mx-auto mb-4 text-[#06b6d4]" />
              <h2 className={`text-xl font-bold ${theme.text.primary} mb-2`}>Check Your Email</h2>
              <p className={`${theme.text.secondary} text-sm`}>
                If an account exists with this email, you'll receive a password reset link.
              </p>
              <Link to="/login" className={`inline-block mt-6 text-sm ${theme.text.accent} hover:underline`}>
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
