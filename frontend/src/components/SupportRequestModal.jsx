import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { X, MessageSquare, Send, Bug, HelpCircle, Calendar, CreditCard, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const SupportRequestModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: 'general',
    title: '',
    description: '',
    priority: 'medium',
    page: window.location.pathname
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'red' },
    { value: 'general', label: 'General Query', icon: HelpCircle, color: 'blue' },
    { value: 'booking', label: 'Booking Help', icon: Calendar, color: 'green' },
    { value: 'payment', label: 'Payment Issue', icon: CreditCard, color: 'yellow' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'purple' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);

    try {
      // Try to submit via API
      try {
        const response = await api.post('/support-requests', {
          title: formData.title,
          description: formData.description,
          severity: formData.priority, // Backend expects 'severity'
          priority: formData.priority,
          category: formData.category,
          page: formData.page,
          user_id: user?.id,
          user_name: user?.name,
          user_email: user?.email,
          user_role: user?.role
        });
        
        console.log('Support request submitted:', response.data);
        toast.success('Support request submitted successfully! We\'ll get back to you soon.');
        onClose();
        setFormData({ category: 'general', title: '', description: '', priority: 'medium', page: window.location.pathname });
      } catch (apiError) {
        // Fallback to email if API fails
        console.error('API failed, using email fallback:', apiError);
        toast.error('API submission failed. Opening email client...');
        
        const email = 'support@codementee.com';
        const subject = `[${formData.category.toUpperCase()}] ${formData.title}`;
        const body = `Support Request Details:
        
Category: ${formData.category}
Title: ${formData.title}
Priority: ${formData.priority}
Page: ${formData.page}

Description:
${formData.description}

User Information:
Name: ${user?.name}
Email: ${user?.email}
Role: ${user?.role}
Plan: ${user?.plan_name || 'Free'}

Submitted at: ${new Date().toLocaleString()}`;
        
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        onClose();
        setFormData({ category: 'general', title: '', description: '', priority: 'medium', page: window.location.pathname });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit support request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedCategory = categories.find(c => c.value === formData.category);
  const CategoryIcon = selectedCategory?.icon || MessageSquare;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`${theme.bg.card} rounded-xl ${theme.border.primary} border max-w-lg w-full ${theme.shadow}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme.border.primary}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              selectedCategory?.color === 'red' ? 'bg-red-500/20' :
              selectedCategory?.color === 'blue' ? 'bg-blue-500/20' :
              selectedCategory?.color === 'green' ? 'bg-green-500/20' :
              selectedCategory?.color === 'yellow' ? 'bg-yellow-500/20' :
              'bg-purple-500/20'
            }`}>
              <CategoryIcon className={`w-5 h-5 ${
                selectedCategory?.color === 'red' ? 'text-red-500' :
                selectedCategory?.color === 'blue' ? 'text-blue-500' :
                selectedCategory?.color === 'green' ? 'text-green-500' :
                selectedCategory?.color === 'yellow' ? 'text-yellow-500' :
                'text-purple-500'
              }`} />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>Contact Support</h2>
              <p className={`text-sm ${theme.text.secondary}`}>We're here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`${theme.text.secondary} hover:${theme.text.primary} transition-colors`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Selection */}
          <div>
            <label className={`block ${theme.text.primary} text-sm font-medium mb-3`}>
              What can we help you with? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = formData.category === cat.value;
                const borderColor = isSelected ? (
                  cat.color === 'red' ? 'border-red-500' :
                  cat.color === 'blue' ? 'border-blue-500' :
                  cat.color === 'green' ? 'border-green-500' :
                  cat.color === 'yellow' ? 'border-yellow-500' :
                  'border-purple-500'
                ) : theme.border.primary;
                const bgColor = isSelected ? (
                  cat.color === 'red' ? 'bg-red-500/10' :
                  cat.color === 'blue' ? 'bg-blue-500/10' :
                  cat.color === 'green' ? 'bg-green-500/10' :
                  cat.color === 'yellow' ? 'bg-yellow-500/10' :
                  'bg-purple-500/10'
                ) : theme.bg.secondary;
                const textColor = isSelected ? (
                  cat.color === 'red' ? 'text-red-500' :
                  cat.color === 'blue' ? 'text-blue-500' :
                  cat.color === 'green' ? 'text-green-500' :
                  cat.color === 'yellow' ? 'text-yellow-500' :
                  'text-purple-500'
                ) : theme.text.secondary;
                
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`p-3 rounded-lg border-2 transition-all ${borderColor} ${bgColor} ${
                      !isSelected ? `hover:border-opacity-50` : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${textColor}`} />
                    <p className={`text-xs font-medium ${textColor}`}>
                      {cat.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
              Subject *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of your request"
              required
              className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
              Details *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide as much detail as possible..."
              required
              rows={5}
              className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors resize-none`}
            />
          </div>

          {/* Priority (only for bugs and issues) */}
          {(formData.category === 'bug' || formData.category === 'payment') && (
            <div>
              <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors`}
              >
                <option value="low">Low - Minor issue</option>
                <option value="medium">Medium - Affects functionality</option>
                <option value="high">High - Blocks important features</option>
                <option value="critical">Critical - Urgent attention needed</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#06b6d4] hover:bg-[#0891b2] text-white"
              disabled={submitting}
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupportRequestModal;
