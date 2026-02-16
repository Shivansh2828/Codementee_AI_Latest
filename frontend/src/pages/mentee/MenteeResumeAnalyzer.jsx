import React, { useState, useRef } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "sonner";
import { FileText, Brain, Target, TrendingUp, AlertCircle, CheckCircle, Upload, X, FileUp } from "lucide-react";
import api from "../../utils/api";

const MenteeResumeAnalyzer = () => {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompanies, setTargetCompanies] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [industry, setIndustry] = useState('');
  const [keySkills, setKeySkills] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const industries = [
    'Technology/Software',
    'Finance/Banking',
    'Healthcare',
    'E-commerce/Retail',
    'Consulting',
    'Education/EdTech',
    'Manufacturing',
    'Telecommunications',
    'Media/Entertainment',
    'Other'
  ];

  const experienceLevels = [
    { value: '0-1', label: 'Entry Level (0-1 years)' },
    { value: '1-3', label: 'Junior (1-3 years)' },
    { value: '3-5', label: 'Mid-level (3-5 years)' },
    { value: '5-8', label: 'Senior (5-8 years)' },
    { value: '8+', label: 'Lead/Staff (8+ years)' }
  ];

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Check file type by extension (more reliable than MIME type)
    const fileName = file.name.toLowerCase();
    const isTxt = fileName.endsWith('.txt');
    const isPdf = fileName.endsWith('.pdf');
    const isDocx = fileName.endsWith('.docx');

    if (!isTxt && !isPdf && !isDocx) {
      toast.error('Please upload a TXT, PDF, or DOCX file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);

    // For text files, read content directly in browser
    if (isTxt) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setResumeText(content);
        toast.success('Resume uploaded successfully!');
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setUploadedFile(null);
      };
      reader.readAsText(file);
    } else {
      // For PDF/DOCX, send to backend for processing
      toast.info('Processing document... This may take a moment');
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post('/ai-tools/extract-resume-text', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setResumeText(response.data.text);
        toast.success(`Resume extracted successfully! (${response.data.length} characters)`);
      } catch (error) {
        toast.error('Failed to process document. Please try TXT format or paste text manually.');
        console.error('File processing error:', error);
        setUploadedFile(null);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setResumeText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || !targetRole.trim()) {
      toast.error('Please provide your resume text and target role');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        resume_text: resumeText,
        target_role: targetRole,
        target_companies: targetCompanies.split(',').map(c => c.trim()).filter(c => c)
      };

      // Add optional fields if provided
      if (yearsOfExperience) {
        requestData.years_of_experience = yearsOfExperience;
      }
      if (industry) {
        requestData.industry = industry;
      }
      if (keySkills) {
        requestData.key_skills = keySkills.split(',').map(s => s.trim()).filter(s => s);
      }

      const response = await api.post('/ai-tools/resume-analysis', requestData);
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
          <p className="text-slate-400">Get AI-powered insights to optimize your resume for your target role</p>
        </div>

        {!analysis ? (
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="w-5 h-5 text-[#06b6d4]" />
                Resume Analysis
              </CardTitle>
              <CardDescription>
                Upload your resume or paste the content, then provide details for personalized AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Section */}
              <div className="space-y-2">
                <Label className="text-white">Upload Resume</Label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
                      ? 'border-[#06b6d4] bg-[#06b6d4]/10'
                      : 'border-[#334155] hover:border-[#06b6d4]/50'
                  }`}
                >
                  {uploadedFile ? (
                    <div className="flex items-center justify-center gap-4">
                      <FileText className="w-8 h-8 text-[#06b6d4]" />
                      <div className="flex-1 text-left">
                        <p className="text-white font-medium">{uploadedFile.name}</p>
                        <p className="text-slate-400 text-sm">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        onClick={removeFile}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-white mb-2">
                        Drag and drop your resume here, or click to browse
                      </p>
                      <p className="text-slate-400 text-sm mb-4">
                        Supports TXT, PDF, DOCX (max 5MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,.docx"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="border-[#334155] text-white hover:bg-[#334155]"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#334155]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1e293b] text-slate-400">OR</span>
                </div>
              </div>

              {/* Manual Text Input */}
              <div className="space-y-2">
                <Label htmlFor="resume-text" className="text-white">Paste Resume Content</Label>
                <Textarea
                  id="resume-text"
                  placeholder="Paste your complete resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[200px] bg-[#0f172a] border-[#334155] text-white placeholder-slate-400"
                />
                <p className="text-xs text-slate-400">
                  Include work experience, education, skills, and projects for comprehensive analysis
                </p>
              </div>

              {/* Target Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-role" className="text-white">Target Role *</Label>
                  <Input
                    id="target-role"
                    placeholder="e.g., Senior Software Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-[#0f172a] border-[#334155] text-white placeholder-slate-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-companies" className="text-white">Target Companies</Label>
                  <Input
                    id="target-companies"
                    placeholder="e.g., Google, Amazon, Microsoft"
                    value={targetCompanies}
                    onChange={(e) => setTargetCompanies(e.target.value)}
                    className="bg-[#0f172a] border-[#334155] text-white placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400">Separate with commas</p>
                </div>
              </div>

              {/* Additional Options */}
              <div className="border-t border-[#334155] pt-4">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#06b6d4]" />
                  Additional Details (Optional - for better results)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-white">Years of Experience</Label>
                    <Select value={yearsOfExperience} onValueChange={setYearsOfExperience}>
                      <SelectTrigger className="bg-[#0f172a] border-[#334155] text-white">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e293b] border-[#334155]">
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value} className="text-white hover:bg-[#334155]">
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-white">Industry/Domain</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="bg-[#0f172a] border-[#334155] text-white">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1e293b] border-[#334155]">
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind} className="text-white hover:bg-[#334155]">
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="key-skills" className="text-white">Key Skills to Highlight</Label>
                    <Input
                      id="key-skills"
                      placeholder="e.g., React, Python, AWS, System Design"
                      value={keySkills}
                      onChange={(e) => setKeySkills(e.target.value)}
                      className="bg-[#0f172a] border-[#334155] text-white placeholder-slate-400"
                    />
                    <p className="text-xs text-slate-400">
                      List skills you want the AI to focus on (separate with commas)
                    </p>
                  </div>
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
                    Analyzing Resume with AI...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Resume with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overall Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-[#1e293b] border-[#334155]">
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

              <Card className="bg-[#1e293b] border-[#334155]">
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
            <Card className="bg-[#1e293b] border-[#334155]">
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
                      <span className="text-slate-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="bg-[#1e293b] border-[#334155]">
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
                      <span className="text-slate-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className="bg-[#1e293b] border-[#334155]">
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
                      <span className="text-slate-300">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Keyword Analysis */}
            <Card className="bg-[#1e293b] border-[#334155]">
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
            <Card className="bg-[#1e293b] border-[#334155]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-orange-400" />
                  Section-wise Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(analysis.section_feedback).map(([section, feedback]) => (
                    <div key={section} className="p-3 bg-[#0f172a] rounded-lg">
                      <h4 className="text-white font-medium capitalize mb-1">{section}</h4>
                      <p className="text-slate-400 text-sm">{feedback}</p>
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
                  setYearsOfExperience('');
                  setIndustry('');
                  setKeySkills('');
                  setUploadedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                variant="outline"
                className="border-[#334155] text-white hover:bg-[#334155]"
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