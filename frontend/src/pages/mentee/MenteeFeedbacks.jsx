import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { FileText, MessageSquare, Star, TrendingUp, CheckCircle, XCircle, Award, Download } from 'lucide-react';
import { toast } from 'sonner';

const MenteeFeedbacks = () => {
  const { theme } = useTheme();
  const [interviewFeedbacks, setInterviewFeedbacks] = useState([]);
  const [resumeFeedbacks, setResumeFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [activeTab, setActiveTab] = useState('interview'); // 'interview' or 'resume'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interviewRes, resumeRes] = await Promise.all([
          api.get('/mentee/feedbacks'),
          api.get('/mentee/resume-requests')
        ]);
        setInterviewFeedbacks(interviewRes.data);
        // Filter only completed resume requests with feedback
        const completedResumes = resumeRes.data.filter(r => 
          r.status === 'completed' && (r.feedback || r.reviewer_notes)
        );
        setResumeFeedbacks(completedResumes);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        toast.error('Failed to load feedbacks');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getHireabilityColor = (hireability) => {
    if (!hireability) return 'bg-gray-500/20 text-gray-400';
    const lower = hireability.toLowerCase();
    if (lower.includes('strong hire')) return 'bg-green-500/20 text-green-400';
    if (lower.includes('hire') && !lower.includes('no')) return 'bg-green-500/20 text-green-400';
    if (lower.includes('no hire')) return 'bg-red-500/20 text-red-400';
    return 'bg-yellow-500/20 text-yellow-400';
  };

  return (
    <DashboardLayout title="My Feedbacks">
      {/* Tab Navigation */}
      <div className={`flex gap-4 mb-6 border-b ${theme.border.primary}`}>
        <button
          onClick={() => setActiveTab('interview')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'interview'
              ? theme.text.accent
              : `${theme.text.secondary} hover:${theme.text.primary}`
          }`}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>Interview Feedback</span>
            {interviewFeedbacks.length > 0 && (
              <span className="bg-[#06b6d4]/20 text-[#06b6d4] text-xs px-2 py-0.5 rounded-full">
                {interviewFeedbacks.length}
              </span>
            )}
          </div>
          {activeTab === 'interview' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06b6d4]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`pb-3 px-4 font-medium transition-colors relative ${
            activeTab === 'resume'
              ? theme.text.accent
              : `${theme.text.secondary} hover:${theme.text.primary}`
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Resume Feedback</span>
            {resumeFeedbacks.length > 0 && (
              <span className="bg-[#06b6d4]/20 text-[#06b6d4] text-xs px-2 py-0.5 rounded-full">
                {resumeFeedbacks.length}
              </span>
            )}
          </div>
          {activeTab === 'resume' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06b6d4]" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6d4] mx-auto mb-4"></div>
            <p className={theme.text.secondary}>Loading...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Interview Feedback Section */}
          {activeTab === 'interview' && (
            <>
              {interviewFeedbacks.length === 0 ? (
                <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-8 text-center`}>
                  <MessageSquare className={`w-12 h-12 ${theme.text.muted} mx-auto mb-4`} />
                  <p className={theme.text.secondary}>No interview feedbacks yet.</p>
                  <p className={`${theme.text.muted} text-sm mt-2`}>Complete a mock interview to receive detailed feedback from your mentor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {interviewFeedbacks.map((fb) => (
                    <div key={fb.id} className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-6 hover:border-[#06b6d4]/50 transition-colors`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className={`${theme.text.primary} font-semibold flex items-center gap-2`}>
                            <Award className="w-4 h-4 text-[#06b6d4]" />
                            Mock Interview Feedback
                          </p>
                          <p className={`${theme.text.muted} text-sm mt-1`}>
                            {new Date(fb.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHireabilityColor(fb.hireability)}`}>
                          {fb.hireability || 'Pending'}
                        </span>
                      </div>

                      {/* Score Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className={`${theme.bg.secondary} rounded-lg p-3 text-center border ${theme.border.primary}`}>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Star className="w-4 h-4 text-[#06b6d4]" />
                            <p className="text-2xl font-bold text-[#06b6d4]">{fb.overall || 0}</p>
                            <span className={`${theme.text.muted} text-sm`}>/5</span>
                          </div>
                          <p className={`${theme.text.muted} text-xs`}>Overall Score</p>
                        </div>
                        <div className={`${theme.bg.secondary} rounded-lg p-3 text-center border ${theme.border.primary}`}>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="w-4 h-4 text-purple-400" />
                            <p className={`text-2xl font-bold ${theme.text.primary}`}>{fb.problem_solving || 0}</p>
                            <span className={`${theme.text.muted} text-sm`}>/5</span>
                          </div>
                          <p className={`${theme.text.muted} text-xs`}>Problem Solving</p>
                        </div>
                        <div className={`${theme.bg.secondary} rounded-lg p-3 text-center border ${theme.border.primary}`}>
                          <p className={`text-xl font-bold ${theme.text.primary}`}>{fb.communication || 0}/5</p>
                          <p className={`${theme.text.muted} text-xs`}>Communication</p>
                        </div>
                        <div className={`${theme.bg.secondary} rounded-lg p-3 text-center border ${theme.border.primary}`}>
                          <p className={`text-xl font-bold ${theme.text.primary}`}>{fb.technical_depth || 0}/5</p>
                          <p className={`${theme.text.muted} text-xs`}>Technical Depth</p>
                        </div>
                      </div>

                      <button 
                        onClick={() => setSelectedInterview(fb)} 
                        className="w-full bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-[#06b6d4] py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Detailed Feedback
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Resume Feedback Section */}
          {activeTab === 'resume' && (
            <>
              {resumeFeedbacks.length === 0 ? (
                <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-8 text-center`}>
                  <FileText className={`w-12 h-12 ${theme.text.muted} mx-auto mb-4`} />
                  <p className={theme.text.secondary}>No resume feedbacks yet.</p>
                  <p className={`${theme.text.muted} text-sm mt-2`}>Submit your resume for expert review to receive detailed feedback.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resumeFeedbacks.map((rf) => (
                    <div key={rf.id} className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-6 hover:border-[#06b6d4]/50 transition-colors`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className={`${theme.text.primary} font-semibold flex items-center gap-2`}>
                            <FileText className="w-4 h-4 text-[#06b6d4]" />
                            Resume Review
                          </p>
                          <p className={`${theme.text.muted} text-sm mt-1`}>
                            {new Date(rf.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          {rf.target_role && (
                            <p className={`${theme.text.secondary} text-sm mt-1`}>
                              Target: {rf.target_role}
                            </p>
                          )}
                        </div>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Reviewed
                        </span>
                      </div>

                      {/* Resume Scores - if available */}
                      {rf.feedback && (rf.feedback.overall_score || rf.feedback.ats_score || rf.feedback.impact_score) && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {rf.feedback.overall_score && (
                            <div className={`${theme.bg.secondary} rounded-lg p-2 text-center border ${theme.border.primary}`}>
                              <p className="text-xl font-bold text-[#06b6d4]">{rf.feedback.overall_score}</p>
                              <p className={`${theme.text.muted} text-xs`}>Overall</p>
                            </div>
                          )}
                          {rf.feedback.ats_score && (
                            <div className={`${theme.bg.secondary} rounded-lg p-2 text-center border ${theme.border.primary}`}>
                              <p className={`text-xl font-bold ${theme.text.primary}`}>{rf.feedback.ats_score}</p>
                              <p className={`${theme.text.muted} text-xs`}>ATS Score</p>
                            </div>
                          )}
                          {rf.feedback.impact_score && (
                            <div className={`${theme.bg.secondary} rounded-lg p-2 text-center border ${theme.border.primary}`}>
                              <p className={`text-xl font-bold ${theme.text.primary}`}>{rf.feedback.impact_score}</p>
                              <p className={`${theme.text.muted} text-xs`}>Impact</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Show preview of feedback */}
                      {rf.reviewer_notes && (
                        <p className={`${theme.text.secondary} text-sm mb-3 line-clamp-2`}>
                          {rf.reviewer_notes}
                        </p>
                      )}

                      <button 
                        onClick={() => setSelectedResume(rf)} 
                        className="w-full bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-[#06b6d4] py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Full Review
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Interview Feedback Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className={`${theme.text.primary} text-2xl font-bold`}>Interview Feedback Details</h2>
                <p className={`${theme.text.muted} text-sm mt-1`}>
                  {new Date(selectedInterview.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHireabilityColor(selectedInterview.hireability)}`}>
                {selectedInterview.hireability || 'Pending'}
              </span>
            </div>

            {/* Detailed Scores */}
            <div className={`${theme.bg.secondary} rounded-lg p-4 mb-6 border ${theme.border.primary}`}>
              <h3 className={`${theme.text.primary} font-semibold mb-4 flex items-center gap-2`}>
                <Star className="w-5 h-5 text-[#06b6d4]" />
                Performance Scores
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-[#06b6d4]">{selectedInterview.overall || 0}</p>
                  <p className={`${theme.text.muted} text-sm mt-1`}>Overall</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${theme.text.primary}`}>{selectedInterview.problem_solving || 0}</p>
                  <p className={`${theme.text.muted} text-sm mt-1`}>Problem Solving</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${theme.text.primary}`}>{selectedInterview.communication || 0}</p>
                  <p className={`${theme.text.muted} text-sm mt-1`}>Communication</p>
                </div>
                <div className="text-center">
                  <p className={`text-3xl font-bold ${theme.text.primary}`}>{selectedInterview.technical_depth || 0}</p>
                  <p className={`${theme.text.muted} text-sm mt-1`}>Technical Depth</p>
                </div>
              </div>
              {selectedInterview.code_quality && (
                <div className={`mt-4 pt-4 border-t ${theme.border.primary}`}>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${theme.text.primary}`}>{selectedInterview.code_quality}/5</p>
                    <p className={`${theme.text.muted} text-sm mt-1`}>Code Quality</p>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Sections */}
            <div className="space-y-4">
              {selectedInterview.strengths && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-green-400 font-semibold">Strengths</p>
                  </div>
                  <p className={`${theme.text.secondary} text-sm leading-relaxed`}>{selectedInterview.strengths}</p>
                </div>
              )}

              {selectedInterview.improvements && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    <p className="text-orange-400 font-semibold">Areas to Improve</p>
                  </div>
                  <p className={`${theme.text.secondary} text-sm leading-relaxed`}>{selectedInterview.improvements}</p>
                </div>
              )}

              {selectedInterview.action_items && (
                <div className="bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-[#06b6d4]" />
                    <p className="text-[#06b6d4] font-semibold">Action Items</p>
                  </div>
                  <p className={`${theme.text.secondary} text-sm leading-relaxed`}>{selectedInterview.action_items}</p>
                </div>
              )}

              {selectedInterview.additional_notes && (
                <div className={`${theme.bg.secondary} border ${theme.border.primary} rounded-lg p-4`}>
                  <p className={`${theme.text.secondary} font-medium mb-2`}>Additional Notes</p>
                  <p className={`${theme.text.secondary} text-sm leading-relaxed`}>{selectedInterview.additional_notes}</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedInterview(null)} 
              className={`w-full ${theme.button.secondary} py-3 rounded-lg font-medium mt-6 transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Resume Feedback Modal */}
      {selectedResume && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className={`${theme.text.primary} text-2xl font-bold`}>Resume Review Details</h2>
                <p className={`${theme.text.muted} text-sm mt-1`}>
                  {new Date(selectedResume.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                {selectedResume.target_role && (
                  <p className={`${theme.text.secondary} text-sm mt-1`}>
                    Target Role: {selectedResume.target_role}
                  </p>
                )}
              </div>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Reviewed
              </span>
            </div>

            {/* Resume Scores - if available */}
            {selectedResume.feedback && (selectedResume.feedback.overall_score || selectedResume.feedback.ats_score || selectedResume.feedback.impact_score) && (
              <div className={`${theme.bg.secondary} rounded-lg p-4 mb-6 border ${theme.border.primary}`}>
                <h3 className={`${theme.text.primary} font-semibold mb-4 flex items-center gap-2`}>
                  <Star className="w-5 h-5 text-[#06b6d4]" />
                  Resume Scores
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {selectedResume.feedback.overall_score && (
                    <div className="text-center">
                      <p className="text-3xl font-bold text-[#06b6d4]">{selectedResume.feedback.overall_score}</p>
                      <p className={`${theme.text.muted} text-sm mt-1`}>Overall Score</p>
                    </div>
                  )}
                  {selectedResume.feedback.ats_score && (
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${theme.text.primary}`}>{selectedResume.feedback.ats_score}</p>
                      <p className={`${theme.text.muted} text-sm mt-1`}>ATS Score</p>
                    </div>
                  )}
                  {selectedResume.feedback.impact_score && (
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${theme.text.primary}`}>{selectedResume.feedback.impact_score}</p>
                      <p className={`${theme.text.muted} text-sm mt-1`}>Impact Score</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Feedback Sections */}
            <div className="space-y-4">
              {/* Always show reviewer notes first if available */}
              {selectedResume.reviewer_notes && (
                <div className="bg-[#06b6d4]/10 border border-[#06b6d4]/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-[#06b6d4]" />
                    <p className="text-[#06b6d4] font-semibold text-base">Reviewer Notes</p>
                  </div>
                  <p className={`${theme.text.primary} text-sm leading-relaxed whitespace-pre-line`}>{selectedResume.reviewer_notes}</p>
                </div>
              )}

              {selectedResume.feedback?.strengths && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <p className="text-green-400 font-semibold">Strengths</p>
                  </div>
                  <p className={`${theme.text.primary} text-sm leading-relaxed whitespace-pre-line`}>{selectedResume.feedback.strengths}</p>
                </div>
              )}

              {selectedResume.feedback?.improvements && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    <p className="text-orange-400 font-semibold">Areas to Improve</p>
                  </div>
                  <p className={`${theme.text.primary} text-sm leading-relaxed whitespace-pre-line`}>{selectedResume.feedback.improvements}</p>
                </div>
              )}

              {selectedResume.feedback?.ats_recommendations && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <p className="text-blue-400 font-semibold">ATS Recommendations</p>
                  </div>
                  <p className={`${theme.text.primary} text-sm leading-relaxed whitespace-pre-line`}>{selectedResume.feedback.ats_recommendations}</p>
                </div>
              )}

              {selectedResume.feedback?.reference_resume_url && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <p className="text-purple-400 font-semibold">Reference Resume</p>
                  </div>
                  <p className={`${theme.text.primary} text-sm mb-3`}>
                    Your reviewer has shared a reference resume example for you to learn from:
                  </p>
                  <a
                    href={selectedResume.feedback.reference_resume_url.startsWith('/api') 
                      ? `${window.location.origin}${selectedResume.feedback.reference_resume_url}`
                      : selectedResume.feedback.reference_resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download Reference Resume
                  </a>
                </div>
              )}

              {/* Show message if no feedback available */}
              {!selectedResume.reviewer_notes && !selectedResume.feedback && (
                <div className={`${theme.bg.secondary} border ${theme.border.primary} rounded-lg p-6 text-center`}>
                  <FileText className={`w-12 h-12 ${theme.text.muted} mx-auto mb-3`} />
                  <p className={`${theme.text.secondary}`}>No feedback available yet</p>
                  <p className={`${theme.text.muted} text-sm mt-1`}>The reviewer will provide detailed feedback soon</p>
                </div>
              )}

              {selectedResume.specific_focus && (
                <div className={`${theme.bg.secondary} border ${theme.border.primary} rounded-lg p-4`}>
                  <p className={`${theme.text.secondary} font-medium mb-2`}>Your Focus Areas</p>
                  <p className={`${theme.text.muted} text-sm`}>{selectedResume.specific_focus}</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedResume(null)} 
              className={`w-full ${theme.button.secondary} py-3 rounded-lg font-medium mt-6 transition-colors`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MenteeFeedbacks;
