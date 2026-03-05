import React, { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { toast } from "sonner";
import { FileText, Brain, Target, TrendingUp, AlertCircle, CheckCircle, Upload, Crown, Lock } from "lucide-react";
import { Link } from 'react-router-dom';
import api from "../../utils/api";

const MenteeResumeAnalyzer = () => {
  const { user } = useAuth();
  const isFreeUser = user?.status === 'Free' || !user?.plan_id;
  
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompanies, setTargetCompanies] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Show upgrade prompt for free users
  if (isFreeUser) {
    return (
      <DashboardLayout title="Resume Analyzer">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Upgrade to Access Resume Analyzer
          </h2>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Get AI-powered feedback on your resume with ATS optimization, keyword analysis, and personalized recommendations. Available with all paid plans.
          </p>
          <Link to="/mentee/book">
            <Button className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white px-8 py-3">
              <Crown className="w-5 h-5 mr-2" />
              View Plans & Upgrade
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !targetRole.trim()) {
      toast.error('Please provide your resume text and target role');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/ai-tools/resume-analysis', {
        resume_text: resumeText,
        target_role: targetRole,
        target_companies: targetCompanies.split(',').map(c => c.trim()).filter(c => c)
      });
      setAnalysis(response.data);
      toast.success('Resume analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze resume');
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 60) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <DashboardLayout title="AI Resume Analyzer">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">AI Resume Analyzer</h1>
          <p className="text-gray-500">Get AI-powered insights to optimize your resume for your target role</p>
        </div>

        {!analysis ? (
          <Card className="bg-[#171717] border-[#404040]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="w-5 h-5 text-[#06b6d4]" />
                Resume Analysis
              </CardTitle>
              <CardDescription>
                Paste your resume content and specify your target role for personalized analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resume-text" className="text-white">Resume Content *</Label>
                <Textarea
                  id="resume-text"
                  placeholder="Paste your complete resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[200px] bg-[#0d0d0d] border-[#404040] text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-500">
                  Copy and paste your entire resume content including work experience, education, skills, and projects
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-role" className="text-white">Target Role *</Label>
                  <Input
                    id="target-role"
                    placeholder="e.g., Senior Software Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-[#0d0d0d] border-[#404040] text-white placeholder-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-companies" className="text-white">Target Companies (Optional)</Label>
                  <Input
                    id="target-companies"
                    placeholder="e.g., Google, Amazon, Microsoft"
                    value={targetCompanies}
                    onChange={(e) => setTargetCompanies(e.target.value)}
                    className="bg-[#0d0d0d] border-[#404040] text-white placeholder-gray-400"
                  />
                  <p className="text-xs text-gray-500">Separate multiple companies with commas</p>
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading || !resumeText.trim() || !targetRole.trim()}
                className="w-full bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]"
              >
                {loading ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#171717] border-[#404040]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">Overall Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-white">{analysis.overall_score}</div>
                    <div className="flex-1">
                      <Progress 
                        value={analysis.overall_score} 
                        className="h-3"
                        style={{
                          '--progress-background': getScoreBg(analysis.overall_score)
                        }}
                      />
                      <p className={`text-sm mt-1 ${getScoreColor(analysis.overall_score)}`}>
                        {analysis.overall_score >= 80 ? 'Excellent' : 
                         analysis.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#171717] border-[#404040]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">ATS Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-white">{analysis.ats_score}</div>
                    <div className="flex-1">
                      <Progress 
                        value={analysis.ats_score} 
                        className="h-3"
                        style={{
                          '--progress-background': getScoreBg(analysis.ats_score)
                        }}
                      />
                      <p className={`text-sm mt-1 ${getScoreColor(analysis.ats_score)}`}>
                        ATS Compatibility
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Strengths */}
            <Card className="bg-[#171717] border-[#404040]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-400">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="bg-[#171717] border-[#404040]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-400">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className="bg-[#171717] border-[#404040]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-[#06b6d4]" />
                  Actionable Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-6 h-6 bg-[#06b6d4]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#06b6d4] text-xs font-bold">{index + 1}</span>
                      </div>
                      <span className="text-gray-400">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Keyword Analysis */}
            <Card className="bg-[#171717] border-[#404040]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="w-5 h-5 text-purple-400" />
                  Keyword Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">Missing Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyword_analysis.missing_keywords.map((keyword, index) => (
                      <Badge key={index} variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Present Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyword_analysis.present_keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Feedback */}
            <Card className="bg-[#171717] border-[#404040]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-orange-400" />
                  Section-wise Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysis.section_feedback).map(([section, feedback]) => (
                    <div key={section} className="p-3 bg-[#0d0d0d] rounded-lg">
                      <h4 className="text-white font-medium capitalize mb-1">{section}</h4>
                      <p className="text-gray-500 text-sm">{feedback}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setAnalysis(null);
                  setResumeText('');
                  setTargetRole('');
                  setTargetCompanies('');
                }}
                variant="outline"
                className="border-[#404040] text-white hover:bg-[#334155]"
              >
                Analyze Another Resume
              </Button>
              <Button
                onClick={() => {
                  const analysisText = `Resume Analysis Report\n\nOverall Score: ${analysis.overall_score}/100\nATS Score: ${analysis.ats_score}/100\n\nStrengths:\n${analysis.strengths.map(s => `• ${s}`).join('\n')}\n\nAreas for Improvement:\n${analysis.weaknesses.map(w => `• ${w}`).join('\n')}\n\nSuggestions:\n${analysis.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
                  navigator.clipboard.writeText(analysisText);
                  toast.success('Analysis copied to clipboard!');
                }}
                className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]"
              >
                Copy Report
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenteeResumeAnalyzer;