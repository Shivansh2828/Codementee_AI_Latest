import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  XCircle,
  Upload,
  Send,
  Calendar,
  User,
  Mail,
  Briefcase,
  Target,
  AlertCircle
} from "lucide-react";
import api from "../../utils/api";

const AdminResumeReviews = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    overall_score: '',
    ats_score: '',
    impact_score: '',
    strengths: '',
    improvements: '',
    ats_recommendations: '',
    reviewer_notes: '',
    reference_resume_url: '',
    status: 'completed'
  });
  const [referenceFile, setReferenceFile] = useState(null);
  const [uploadingReference, setUploadingReference] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchResumeRequests();
  }, []);

  const fetchResumeRequests = async () => {
    try {
      const response = await api.get('/admin/resume-requests');
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch resume requests:', error);
      toast.error('Failed to load resume requests');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async (requestId, filename) => {
    try {
      const response = await api.get(`/admin/resume-requests/${requestId}/download`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Resume downloaded successfully');
    } catch (error) {
      console.error('Failed to download resume:', error);
      toast.error('Failed to download resume');
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const response = await api.put(`/admin/resume-requests/${requestId}/status`, { status: newStatus });
      toast.success('Status updated successfully');
      fetchResumeRequests();
    } catch (error) {
      console.error('Failed to update status:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to update status';
      toast.error(errorMessage);
    }
  };

  const handleReferenceFileSelect = (e) => {
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
      
      setReferenceFile(file);
      toast.success('Reference resume selected');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedRequest) return;
    
    if (!feedbackData.reviewer_notes.trim()) {
      toast.error('Please provide reviewer notes');
      return;
    }

    setSubmitting(true);

    try {
      let referenceUrl = feedbackData.reference_resume_url;
      
      // Upload reference file if selected
      if (referenceFile) {
        setUploadingReference(true);
        const formData = new FormData();
        formData.append('file', referenceFile);
        formData.append('request_id', selectedRequest.id);
        
        try {
          const uploadResponse = await api.post('/admin/upload-reference-resume', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          referenceUrl = uploadResponse.data.file_url;
          toast.success('Reference resume uploaded');
        } catch (uploadError) {
          console.error('Failed to upload reference resume:', uploadError);
          toast.error('Failed to upload reference resume, but feedback will still be submitted');
        }
        setUploadingReference(false);
      }
      
      const feedbackPayload = {
        ...feedbackData,
        reference_resume_url: referenceUrl
      };
      
      const response = await api.post(`/admin/resume-requests/${selectedRequest.id}/feedback`, feedbackPayload);
      const isUpdate = selectedRequest.status === 'completed';
      toast.success(isUpdate ? 'Feedback updated successfully!' : 'Feedback submitted successfully!');
      setShowFeedbackModal(false);
      setSelectedRequest(null);
      setReferenceFile(null);
      setFeedbackData({
        overall_score: '',
        ats_score: '',
        impact_score: '',
        strengths: '',
        improvements: '',
        ats_recommendations: '',
        reviewer_notes: '',
        reference_resume_url: '',
        status: 'completed'
      });
      fetchResumeRequests();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to submit feedback';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
      setUploadingReference(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'Pending' },
      in_review: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Eye, label: 'In Review' },
      completed: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Cancelled' }
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

  const getPlanBadge = (planId) => {
    const planColors = {
      starter: 'bg-green-500/20 text-green-400 border-green-500/30',
      pro: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      elite: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };

    return (
      <Badge className={`${planColors[planId] || planColors.starter} border px-2 py-1 text-xs`}>
        {planId?.toUpperCase() || 'N/A'}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredRequests = requests.filter(req => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    in_review: requests.filter(r => r.status === 'in_review').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  if (loading) {
    return (
      <DashboardLayout title="Resume Reviews">
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
    <DashboardLayout title="Resume Reviews">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm`}>Total Requests</p>
                  <p className={`${theme.text.primary} text-3xl font-bold mt-1`}>{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm`}>Pending</p>
                  <p className={`${theme.text.primary} text-3xl font-bold mt-1`}>{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm`}>In Review</p>
                  <p className={`${theme.text.primary} text-3xl font-bold mt-1`}>{stats.in_review}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${theme.text.muted} text-sm`}>Completed</p>
                  <p className={`${theme.text.primary} text-3xl font-bold mt-1`}>{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className={`${theme.text.secondary} text-sm font-medium`}>Filter:</span>
              {['all', 'pending', 'in_review', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardHeader>
            <CardTitle className={theme.text.primary}>Resume Review Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className={`w-16 h-16 ${theme.text.muted} mx-auto mb-4`} />
                <p className={`${theme.text.secondary} mb-2`}>No resume requests found</p>
                <p className={theme.text.muted}>
                  {filterStatus !== 'all' ? `No ${filterStatus.replace('_', ' ')} requests` : 'Requests will appear here when mentees submit their resumes'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className={`${theme.bg.secondary} rounded-lg p-6 ${theme.border.primary} border hover:border-[#06b6d4] transition-colors`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`${theme.text.primary} text-lg font-semibold`}>
                            {request.mentee_name}
                          </h3>
                          {getStatusBadge(request.status)}
                          {getPlanBadge(request.plan_id)}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={theme.text.muted}>
                            <Mail className="w-4 h-4 inline mr-1" />
                            {request.mentee_email}
                          </span>
                          <span className={theme.text.muted}>
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(request.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadResume(request.id, request.resume_filename)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Resume
                        </Button>
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(request.id, 'in_review')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Start Review
                          </Button>
                        )}
                        {request.status === 'in_review' && (
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowFeedbackModal(true);
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit Feedback
                          </Button>
                        )}
                        {request.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10"
                            onClick={() => {
                              setSelectedRequest(request);
                              // Pre-populate feedback data
                              setFeedbackData({
                                overall_score: request.feedback?.overall_score || '',
                                ats_score: request.feedback?.ats_score || '',
                                impact_score: request.feedback?.impact_score || '',
                                strengths: request.feedback?.strengths || '',
                                improvements: request.feedback?.improvements || '',
                                ats_recommendations: request.feedback?.ats_recommendations || '',
                                reviewer_notes: request.reviewer_notes || '',
                                reference_resume_url: request.feedback?.reference_resume_url || '',
                                status: 'completed'
                              });
                              setShowFeedbackModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View/Edit Feedback
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className={`${theme.bg.tertiary} rounded-lg p-3`}>
                        <p className={`${theme.text.muted} text-xs mb-1`}>Target Role</p>
                        <p className={`${theme.text.primary} font-medium flex items-center gap-2`}>
                          <Target className="w-4 h-4 text-[#06b6d4]" />
                          {request.target_role}
                        </p>
                      </div>

                      {request.target_companies && (
                        <div className={`${theme.bg.tertiary} rounded-lg p-3`}>
                          <p className={`${theme.text.muted} text-xs mb-1`}>Target Companies</p>
                          <p className={`${theme.text.primary} font-medium flex items-center gap-2`}>
                            <Briefcase className="w-4 h-4 text-[#06b6d4]" />
                            {request.target_companies}
                          </p>
                        </div>
                      )}
                    </div>

                    {request.specific_focus && (
                      <div className={`${theme.bg.tertiary} rounded-lg p-3 mb-4`}>
                        <p className={`${theme.text.muted} text-xs mb-1`}>Specific Focus</p>
                        <p className={`${theme.text.secondary} text-sm`}>{request.specific_focus}</p>
                      </div>
                    )}

                    {request.additional_notes && (
                      <div className={`${theme.bg.tertiary} rounded-lg p-3 mb-4`}>
                        <p className={`${theme.text.muted} text-xs mb-1`}>Additional Notes</p>
                        <p className={`${theme.text.secondary} text-sm`}>{request.additional_notes}</p>
                      </div>
                    )}

                    {request.reviewer_notes && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className={`${theme.text.primary} text-sm font-medium mb-1 flex items-center gap-2`}>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Feedback Provided
                        </p>
                        <p className={`${theme.text.secondary} text-sm line-clamp-2`}>{request.reviewer_notes}</p>
                        {request.feedback && (
                          <div className="flex gap-2 mt-2">
                            {request.feedback.overall_score && (
                              <span className="text-xs bg-[#06b6d4]/20 text-[#06b6d4] px-2 py-1 rounded">
                                Overall: {request.feedback.overall_score}
                              </span>
                            )}
                            {request.feedback.ats_score && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                                ATS: {request.feedback.ats_score}
                              </span>
                            )}
                            {request.feedback.reference_resume_url && (
                              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                                Reference Attached
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${theme.bg.card} rounded-xl ${theme.border.primary} border max-w-3xl w-full my-8 ${theme.shadow}`}>
            <div className={`flex items-center justify-between p-6 border-b ${theme.border.primary}`}>
              <div>
                <h2 className={`text-xl font-bold ${theme.text.primary}`}>
                  {selectedRequest.status === 'completed' ? 'Edit Feedback' : 'Submit Detailed Feedback'}
                </h2>
                <p className={`text-sm ${theme.text.secondary}`}>
                  For {selectedRequest.mentee_name} - {selectedRequest.target_role}
                </p>
                {selectedRequest.status === 'completed' && (
                  <p className={`text-xs ${theme.text.muted} mt-1`}>
                    Last updated: {new Date(selectedRequest.updated_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedRequest(null);
                  setFeedbackData({
                    overall_score: '',
                    ats_score: '',
                    impact_score: '',
                    strengths: '',
                    improvements: '',
                    ats_recommendations: '',
                    reviewer_notes: '',
                    reference_resume_url: '',
                    status: 'completed'
                  });
                }}
                className={`${theme.text.secondary} hover:${theme.text.primary} transition-colors`}
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Scores Section */}
              <div>
                <h3 className={`${theme.text.primary} font-semibold mb-3 flex items-center gap-2`}>
                  <CheckCircle className="w-5 h-5 text-[#06b6d4]" />
                  Resume Scores (Optional)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block ${theme.text.secondary} text-sm font-medium mb-2`}>
                      Overall Score
                    </label>
                    <input
                      type="text"
                      value={feedbackData.overall_score}
                      onChange={(e) => setFeedbackData({ ...feedbackData, overall_score: e.target.value })}
                      placeholder="e.g., 8/10 or B+"
                      className={`w-full px-4 py-2 rounded-lg ${theme.input.base} transition-colors`}
                    />
                  </div>
                  <div>
                    <label className={`block ${theme.text.secondary} text-sm font-medium mb-2`}>
                      ATS Score
                    </label>
                    <input
                      type="text"
                      value={feedbackData.ats_score}
                      onChange={(e) => setFeedbackData({ ...feedbackData, ats_score: e.target.value })}
                      placeholder="e.g., 85% or Good"
                      className={`w-full px-4 py-2 rounded-lg ${theme.input.base} transition-colors`}
                    />
                  </div>
                  <div>
                    <label className={`block ${theme.text.secondary} text-sm font-medium mb-2`}>
                      Impact Score
                    </label>
                    <input
                      type="text"
                      value={feedbackData.impact_score}
                      onChange={(e) => setFeedbackData({ ...feedbackData, impact_score: e.target.value })}
                      placeholder="e.g., 7/10 or Strong"
                      className={`w-full px-4 py-2 rounded-lg ${theme.input.base} transition-colors`}
                    />
                  </div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
                  Strengths
                </label>
                <textarea
                  value={feedbackData.strengths}
                  onChange={(e) => setFeedbackData({ ...feedbackData, strengths: e.target.value })}
                  placeholder="What are the strong points of this resume? (e.g., clear formatting, strong technical skills, quantified achievements)"
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors resize-none`}
                />
              </div>

              {/* Areas to Improve */}
              <div>
                <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
                  Areas to Improve
                </label>
                <textarea
                  value={feedbackData.improvements}
                  onChange={(e) => setFeedbackData({ ...feedbackData, improvements: e.target.value })}
                  placeholder="What needs improvement? (e.g., add more metrics, improve project descriptions, better keyword optimization)"
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors resize-none`}
                />
              </div>

              {/* ATS Recommendations */}
              <div>
                <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
                  ATS Optimization Recommendations
                </label>
                <textarea
                  value={feedbackData.ats_recommendations}
                  onChange={(e) => setFeedbackData({ ...feedbackData, ats_recommendations: e.target.value })}
                  placeholder="Specific recommendations for ATS optimization (e.g., add keywords, format improvements, section organization)"
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors resize-none`}
                />
              </div>

              {/* Reviewer Notes */}
              <div>
                <label className={`block ${theme.text.primary} text-sm font-medium mb-2`}>
                  Overall Reviewer Notes *
                </label>
                <textarea
                  value={feedbackData.reviewer_notes}
                  onChange={(e) => setFeedbackData({ ...feedbackData, reviewer_notes: e.target.value })}
                  placeholder="Provide comprehensive feedback summary and any additional notes..."
                  required
                  rows={5}
                  className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors resize-none`}
                />
              </div>

              {/* Reference Resume URL or File Upload */}
              <div>
                <label className={`block ${theme.text.primary} text-sm font-medium mb-2 flex items-center gap-2`}>
                  <Upload className="w-4 h-4 text-[#06b6d4]" />
                  Reference Resume (Optional)
                </label>
                
                {/* File Upload Option */}
                <div className={`border-2 border-dashed ${theme.border.primary} rounded-lg p-4 mb-3`}>
                  <input
                    type="file"
                    id="reference-resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleReferenceFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="reference-resume-upload" className="cursor-pointer">
                    <div className="text-center">
                      <Upload className={`w-8 h-8 ${theme.text.muted} mx-auto mb-2`} />
                      {referenceFile ? (
                        <div>
                          <p className={`${theme.text.primary} font-medium`}>{referenceFile.name}</p>
                          <p className={`${theme.text.muted} text-sm`}>
                            {(referenceFile.size / 1024).toFixed(2)} KB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setReferenceFile(null);
                              document.getElementById('reference-resume-upload').value = '';
                            }}
                            className="text-red-400 text-sm mt-2 hover:underline"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className={`${theme.text.primary} font-medium mb-1`}>
                            Click to upload reference resume
                          </p>
                          <p className={`${theme.text.muted} text-sm`}>
                            PDF or Word (Max 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
                
                {/* OR divider */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex-1 h-px ${theme.bg.secondary}`}></div>
                  <span className={`${theme.text.muted} text-xs`}>OR</span>
                  <div className={`flex-1 h-px ${theme.bg.secondary}`}></div>
                </div>
                
                {/* URL Input Option */}
                <input
                  type="url"
                  value={feedbackData.reference_resume_url}
                  onChange={(e) => setFeedbackData({ ...feedbackData, reference_resume_url: e.target.value })}
                  placeholder="https://example.com/reference-resume.pdf or Google Drive link"
                  className={`w-full px-4 py-2 rounded-lg ${theme.input.base} transition-colors`}
                  disabled={!!referenceFile}
                />
                <p className={`${theme.text.muted} text-xs mt-1`}>
                  {referenceFile 
                    ? 'File upload selected. Remove file to use URL instead.' 
                    : 'Provide a URL to a reference resume example'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setSelectedRequest(null);
                    setFeedbackData({
                      overall_score: '',
                      ats_score: '',
                      impact_score: '',
                      strengths: '',
                      improvements: '',
                      ats_recommendations: '',
                      reviewer_notes: '',
                      reference_resume_url: '',
                      status: 'completed'
                    });
                  }}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitFeedback}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                  disabled={submitting || uploadingReference}
                >
                  {uploadingReference ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Uploading Reference...
                    </>
                  ) : submitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      {selectedRequest.status === 'completed' ? 'Updating...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {selectedRequest.status === 'completed' ? 'Update Feedback' : 'Submit Feedback'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminResumeReviews;
