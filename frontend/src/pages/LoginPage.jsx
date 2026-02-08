import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '../components/ui/ThemeToggle';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Debug: Log environment variables
  console.log('🔍 LOGIN_PAGE: Backend URL:', process.env.REACT_APP_BACKEND_URL);
  console.log('🔍 LOGIN_PAGE: Environment:', process.env.REACT_APP_ENVIRONMENT);

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.name}!`);
      
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'mentor') navigate('/mentor');
      else if (user.role === 'mentee') navigate('/mentee');
      else navigate(from);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg.primary} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className={`flex items-center gap-2 ${theme.text.secondary} hover:${theme.text.accent} transition-colors`}>
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        <div className={`${theme.bg.card} rounded-xl ${theme.border.primary} border p-8 ${theme.shadow}`}>
          <div className="text-center mb-8">
            <h1 className={`text-2xl font-bold ${theme.text.primary} mb-2`}>Welcome Back</h1>
            <p className={theme.text.secondary}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors`}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors`}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center"
            >
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className={`text-center ${theme.text.secondary} text-sm mt-6`}>
            Don't have an account?{' '}
            <Link to="/register" className={`${theme.text.accent} hover:underline`}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
