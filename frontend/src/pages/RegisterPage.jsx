import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    currentRole: '',
    targetRole: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register-free', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        current_role: formData.currentRole,
        target_role: formData.targetRole
      });

      if (response.data.success) {
        // Auto-login with returned token
        localStorage.setItem('token', response.data.access_token);
        login(response.data.user, response.data.access_token);
        
        toast.success('Welcome to Codementee! 🎉');
        
        // Redirect to mentee dashboard
        setTimeout(() => {
          navigate('/mentee');
        }, 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <main className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container">
          <div className="max-w-md mx-auto">
            {/* Back Link */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-slate-400 hover:text-[#06b6d4] transition-colors mb-8"
            >
              <ArrowLeft size={18} />
              Back to Home
            </button>

            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-white mb-4">
                Join Codementee
              </h1>
              <p className="text-slate-400">
                Create your free account and explore the platform
              </p>
            </div>

            {/* Free Account Notice */}
            <div className="bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-lg p-4 mb-6">
              <p className="text-[#06b6d4] text-sm font-medium">
                🎉 Free to explore - No payment required
              </p>
              <p className="text-slate-300 text-xs mt-1">
                Browse features, see pricing, and upgrade when you're ready to book mock interviews.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:border-[#06b6d4] focus:outline-none transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:border-[#06b6d4] focus:outline-none transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:border-[#06b6d4] focus:outline-none transition-colors pr-12"
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Current Role */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Current Role
                    </label>
                    <input
                      type="text"
                      name="currentRole"
                      value={formData.currentRole}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:border-[#06b6d4] focus:outline-none transition-colors"
                      placeholder="e.g., SDE-1, Frontend Developer"
                    />
                  </div>

                  {/* Target Role */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Target Role
                    </label>
                    <input
                      type="text"
                      name="targetRole"
                      value={formData.targetRole}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:border-[#06b6d4] focus:outline-none transition-colors"
                      placeholder="e.g., Amazon SDE-2, Google L4"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 size={20} className="animate-spin" /> Creating Account...</>
                ) : (
                  <>Create Free Account <ArrowRight size={20} /></>
                )}
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-[#06b6d4] hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;