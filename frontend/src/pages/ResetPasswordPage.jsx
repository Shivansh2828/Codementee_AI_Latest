import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../components/ui/ThemeToggle';
import api from '../utils/api';

const ResetPasswordPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: formData.password });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center p-4`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold ${theme.text.primary} mb-4`}>Invalid Reset Link</h1>
          <p className={`${theme.text.secondary} mb-6`}>This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className={`${theme.text.accent} hover:underline`}>Request a new reset link</Link>
        </div>
      </div>
    );
  }

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
          {!success ? (
            <>
              <div className="text-center mb-8">
                <h1 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>Reset Password</h1>
                <p className={theme.text.secondary}>Enter your new password</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 pr-12 rounded-lg ${theme.input.base} transition-colors`}
                      placeholder="Enter new password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-3 pr-12 rounded-lg ${theme.input.base} transition-colors`}
                      placeholder="Confirm new password"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors">
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center">
                  {isLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Resetting...</>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
              <h2 className={`text-xl font-bold ${theme.text.primary} mb-2`}>Password Reset!</h2>
              <p className={`${theme.text.secondary} text-sm`}>
                Your password has been reset successfully. Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
