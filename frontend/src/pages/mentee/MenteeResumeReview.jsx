import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  Calendar,
  Mail,
  Phone,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  Send
} from "lucide-react";
import api from "../../utils/api";

const MenteeResumeReview = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    target_role: user?.target_role || '',
    target_companies: '',
    specific_focus: '',
    additional_notes: ''
  });

  const reviewQuota = user?.plan_features?.resume_reviews || 0;
  const usedReviews = requests.filter(r => r.status !== 'cancelled').length;
  const remainingReviews = Math.max(0, reviewQuota - usedReviews);

  const getReviewType = () => {
    if (user?.plan_id === 'starter') return 'Email Review';
    if (user?.plan_id === 'pro') return 'Call with MAANG Engineer';
    if (user?.plan_id === 'elite') return 'Live Call Session';
    return 'Not Available';
  };

  useEffect(() => {
    fetchResumeRequests();
  }, []);

  const fetchResumeRequests = async () => {
    try {
      const response = await api.get('/mentee/resume-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch resume requests:', error);
      toast.error('Failed to load resume requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF or Word document');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      toast.success('Resume selected successfully');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a resume file');
      return;
    }

    if (remainingReviews <= 0) {
      toast.error('You have used all your resume reviews. Please upgrade your plan.');
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('resume', selectedFile);
      formDataToSend.append('target_role', formData.target_role);
      formDataToSend.append('target_companies', formData.target_companies);
      formDataToSend.append('specific_focus', formData.specific_focus);
      formDataToSend.append('additional_notes', formData.additional_notes);

      const response = await api.post('/mentee/resume-request', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Resume review request submitted successfully!');
      
      // Reset form
      setSelectedFile(null);
      setFormData({
        target_role: user?.target_role || '',
        target_companies: '',
        specific_focus: '',
        additional_notes: ''
      });
      
      // Clear file input
      document.getElementById('resume-upload').value = '';
      
      // Refresh requests
      fetchResumeRequests();
    } catch (error) {
      console.error('Failed to submit resume request:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit resume request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'Pending' },
      in_review: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Eye, label: 'In Review' },
      completed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle, label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border px-3 py-1`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Resume Review">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6d4] mx-auto mb-4"></div>
            <p className={theme.text.secondary}>Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Resume Review">
      <div className="space-y-6">
        {/* Header with Quota */}
        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`${theme.text.primary} text-2xl font-bold mb-2`}>
                Resume Review Service
              </h2>
              <p className={theme.text.secondary}>
                Get expert feedback on your resume from industry professionals
              </p>
            </div>
            <div className="text-right">
              <div className={`${theme.text.primary} text-3xl font-bold`}>
                {remainingReviews}
              </div>
              <p className={theme.text.muted}>Reviews Remaining</p>
              <Badge className="mt-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
                {getReviewType()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className={`${theme.text.primary} font-semibold`}>Format</p>
                  <p className={`${theme.text.muted} text-sm`}>PDF or Word</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className={`${theme.text.primary} font-semibold`}>Turnaround</p>
                  <p className={`${theme.text.muted} text-sm`}>2-3 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  {user?.plan_id === 'starter' ? <Mail className="w-5 h-5 text-purple-400" /> : <Phone className="w-5 h-5 text-purple-400" />}
                </div>
                <div>
                  <p className={`${theme.text.primary} font-semibold`}>Delivery</p>
                  <p className={`${theme.text.muted} text-sm`}>{getReviewType()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit New Request */}
        {remainingReviews > 0 ? (
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardHeader>
              <CardTitle className={theme.text.primary}>Submit Resume for Review</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
                    Upload Resume *
                  </label>
                  <div className={`border-2 border-dashed ${theme.border.primary} rounded-lg p-6 text-center`}>
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload className={`w-12 h-12 ${theme.text.muted} mx-auto mb-3`} />
                      {selectedFile ? (
                        <div>
                          <p className={`${theme.text.primary} font-medium`}>{selectedFile.name}</p>
                          <p className={`${theme.text.muted} text-sm`}>
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className={`${theme.text.primary} font-medium mb-1`}>
                            Click to upload or drag and drop
                          </p>
                          <p className={`${theme.text.muted} text-sm`}>
                            PDF or Word (Max 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Target Role */}
                <div>
                  <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
                    Target Role *
                  </label>
                  <input
                    type="text"
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    placeholder="e.g., Amazon SDE-2, Google L4"
                    required
                    className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors`}
                  />
                </div>

                {/* Target Companies */}
                <div>
                  <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
                    Target Companies
                  </label>
                  <input
                    type="text"
                    value={formData.target_companies}
                    onChange={(e) => setFormData({ ...formData, target_companies: e.target.value })}
                    placeholder="e.g., Amazon, Google, Microsoft"
                    className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors`}
                  />
                </div>

                {/* Specific Focus */}
                <div>
                  <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
                    Specific Focus Areas
                  </label>
                  <input
                    type="text"
                    value={formData.specific_focus}
                    onChange={(e) => setFormData({ ...formData, specific_focus: e.target.value })}
                    placeholder="e.g., Technical skills, Project descriptions, ATS optimization"
                    className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors`}
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.additional_notes}
                    onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                    placeholder="Any specific concerns or questions about your resume..."
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors resize-none`}
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting || !selectedFile}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-8 text-center">
              <AlertCircle className={`w-16 h-16 ${theme.text.muted} mx-auto mb-4`} />
              <h3 className={`${theme.text.primary} text-xl font-bold mb-2`}>
                No Reviews Remaining
              </h3>
              <p className={`${theme.text.secondary} mb-4`}>
                You've used all your resume reviews for this plan period.
              </p>
              <Button
                onClick={() => window.location.href = '/mentee/pricing'}
                className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white"
              >
                Upgrade Plan
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Previous Requests */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardHeader>
            <CardTitle className={theme.text.primary}>Your Resume Review Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className={`w-16 h-16 ${theme.text.muted} mx-auto mb-4`} />
                <p className={`${theme.text.secondary} mb-2`}>No resume reviews yet</p>
                <p className={theme.text.muted}>Submit your first resume for expert feedback</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className={`${theme.bg.secondary} rounded-lg p-4 ${theme.border.primary} border`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className={`${theme.text.primary} font-semibold`}>
                            {request.target_role}
                          </h4>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={theme.text.muted}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(request.created_at)}
                          </span>
                          {request.target_companies && (
                            <span className={theme.text.muted}>
                              Companies: {request.target_companies}
                            </span>
                          )}
                        </div>
                      </div>
                      {request.status === 'completed' && request.feedback_file && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(request.feedback_file, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Feedback
                        </Button>
                      )}
                    </div>
                    
                    {request.specific_focus && (
                      <div className={`${theme.bg.tertiary} rounded-lg p-3 mb-3`}>
                        <p className={`${theme.text.muted} text-xs mb-1`}>Focus Areas</p>
                        <p className={`${theme.text.secondary} text-sm`}>{request.specific_focus}</p>
                      </div>
                    )}
                    
                    {request.additional_notes && (
                      <div className={`${theme.bg.tertiary} rounded-lg p-3 mb-3`}>
                        <p className={`${theme.text.muted} text-xs mb-1`}>Your Notes</p>
                        <p className={`${theme.text.secondary} text-sm`}>{request.additional_notes}</p>
                      </div>
                    )}
                    
                    {request.status === 'completed' && (request.reviewer_notes || request.feedback) && (
                      <div className="mt-4 space-y-3">
                        {/* Scores Display */}
                        {request.feedback && (request.feedback.overall_score || request.feedback.ats_score || request.feedback.impact_score) && (
                          <div className="grid grid-cols-3 gap-2">
                            {request.feedback.overall_score && (
                              <div className="bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-lg p-3 text-center">
                                <p className="text-2xl font-bold text-[#06b6d4]">{request.feedback.overall_score}</p>
                                <p className={`${theme.text.muted} text-xs mt-1`}>Overall</p>
                              </div>
                            )}
                            {request.feedback.ats_score && (
                              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                                <p className={`text-2xl font-bold ${theme.text.primary}`}>{request.feedback.ats_score}</p>
                                <p className={`${theme.text.muted} text-xs mt-1`}>ATS</p>
                              </div>
                            )}
                            {request.feedback.impact_score && (
                              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                                <p className={`text-2xl font-bold ${theme.text.primary}`}>{request.feedback.impact_score}</p>
                                <p className={`${theme.text.muted} text-xs mt-1`}>Impact</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Feedback Preview */}
                        {request.reviewer_notes && (
                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <p className="text-green-400 font-semibold text-sm">Expert Feedback</p>
                            </div>
                            <p className={`${theme.text.primary} text-sm line-clamp-3`}>{request.reviewer_notes}</p>
                          </div>
                        )}
                        
                        {/* View Full Feedback Button */}
                        <Button
                          size="sm"
                          className="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                          onClick={() => window.location.href = '/mentee/feedbacks'}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Complete Feedback
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MenteeResumeReview;
