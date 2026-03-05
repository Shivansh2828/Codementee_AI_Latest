import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { X, Bug, Send } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';

const BugReportModal = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    page: window.location.pathname
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Try to submit via API
      try {
        await api.post('/bug-reports', {
          ...formData,
          user_id: user?.id,
          user_name: user?.name,
          user_email: user?.email,
          user_role: user?.role
        });
        toast.success('Bug report submitted successfully! We\'ll look into it.');
      } catch (apiError) {
        // Fallback to email if API fails
        console.log('API failed, using email fallback');
        const email = 'support@codementee.com';
        const subject = `Bug Report: ${formData.title}`;
        const body = `Bug Report Details:
        
Title: ${formData.title}
Severity: ${formData.severity}
Page: ${formData.page}

Description:
${formData.description}

Reporter Information:
Name: ${user?.name}
Email: ${user?.email}
Role: ${user?.role}

Submitted at: ${new Date().toLocaleString()}`;
        
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        toast.success('Opening email client to submit bug report...');
      }
      
      onClose();
      setFormData({ title: '', description: '', severity: 'medium', page: window.location.pathname });
    } catch (error) {
      toast.error('Failed to submit bug report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className={`${theme.bg.card} rounded-xl ${theme.border.primary} border max-w-lg w-full ${theme.shadow}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${theme.border.primary}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <Bug className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>Report a Bug</h2>
              <p className={`text-sm ${theme.text.secondary}`}>Help us improve the platform</p>
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
          {/* Title */}
          <div>
            <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
              Bug Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief description of the issue"
              required
              className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors`}
            />
          </div>

          {/* Description */}
          <div>
            <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of what happened, steps to reproduce, expected vs actual behavior..."
              required
              rows={5}
              className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors resize-none`}
            />
          </div>

          {/* Severity */}
          <div>
            <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
              Severity
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors`}
            >
              <option value="low">Low - Minor issue</option>
              <option value="medium">Medium - Affects functionality</option>
              <option value="high">High - Blocks important features</option>
              <option value="critical">Critical - System unusable</option>
            </select>
          </div>

          {/* Page Info */}
          <div>
            <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
              Page
            </label>
            <input
              type="text"
              value={formData.page}
              onChange={(e) => setFormData({ ...formData, page: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors`}
              readOnly
            />
          </div>

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
              variant="destructive"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send size={18} />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BugReportModal;
