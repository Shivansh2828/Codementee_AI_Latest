import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Briefcase, MapPin, DollarSign, TrendingUp, Search, Settings, ExternalLink, Loader2, FileText, Crown, Lock, CheckCircle, X } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const JOB_SEARCH_MESSAGES = [
  { text: 'Scanning Google Jobs for your role...', icon: '🔍' },
  { text: 'Checking RemoteOK for remote opportunities...', icon: '🌍' },
  { text: 'Searching Jobicy for matching positions...', icon: '📋' },
  { text: 'AI is reading job descriptions...', icon: '🤖' },
  { text: 'Scoring each job against your resume...', icon: '📊' },
  { text: 'Ranking your best matches...', icon: '🏆' },
  { text: 'Almost there, finalizing results...', icon: '✨' },
];

function AnimatedLoader({ messages, title }) {
  const [msgIndex, setMsgIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 2500);
    const progTimer = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 8 + 2, 95));
    }, 800);
    return () => { clearInterval(msgTimer); clearInterval(progTimer); };
  }, [messages.length]);

  const current = messages[msgIndex];

  return (
    <Card className="border-cyan-500/30 overflow-hidden">
      <CardContent className="py-14 text-center relative">
        {/* Animated background pulse */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 animate-pulse" />

        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <span className="text-4xl animate-bounce">{current.icon}</span>
          </div>

          <p className="text-xl font-semibold mb-2">{title}</p>

          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 h-5 transition-all duration-500">
            {current.text}
          </p>

          {/* Progress bar */}
          <div className="max-w-xs mx-auto">
            <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-4">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-cyan-500"
                style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function JobSearchLoader() {
  return <AnimatedLoader messages={JOB_SEARCH_MESSAGES} title="Finding jobs for you..." />;
}

function EliteGate() {
  return (
    <DashboardLayout title="🎯 AI Job Search Agent">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-2 border-amber-500/30">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Elite Feature</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6">
              AI Job Search Agent is available exclusively for Elite plan members. Upgrade to get daily AI-powered job matches delivered to your inbox.
            </p>
            <Link to="/mentee/book">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white w-full">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Elite
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function MenteeJobSearch() {
  const { user } = useAuth();
  const isElite = user?.plan_id === 'elite';
  const [preferences, setPreferences] = useState(null);
  const [jobMatches, setJobMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'applied'
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  const [formData, setFormData] = useState({
    job_title: '',
    location: '',
    skills: '',
    experience_years: 0,
    expected_salary: '',
    preferred_companies: '',
    telegram_id: '',
    enable_sheets_logging: false
  });

  const [resumeText, setResumeText] = useState('');

  useEffect(() => {
    loadPreferences();
    loadJobMatches();
    loadAppliedJobs();
  }, []);

  const loadAppliedJobs = async () => {
    try {
      const res = await api.get('/ai-agents/applied-jobs');
      const keys = (res.data.applied || []).map(a => `${a.job_title}::${a.company}`);
      setAppliedJobs(new Set(keys));
    } catch (error) {
      console.error('Failed to load applied jobs:', error);
    }
  };

  const handleMarkApplied = async (job) => {
    try {
      await api.post('/ai-agents/mark-applied', {
        job_title: job.title,
        company: job.company,
        job_url: job.url || ''
      });
      setAppliedJobs(prev => new Set([...prev, `${job.title}::${job.company}`]));
      toast.success(`Marked "${job.title}" at ${job.company} as applied`);
    } catch (error) {
      toast.error('Failed to mark as applied');
    }
  };

  const isApplied = (job) => appliedJobs.has(`${job.title}::${job.company}`);

  const loadPreferences = async () => {
    try {
      const res = await api.get('/ai-agents/job-preferences');
      if (res.data.preferences) {
        setPreferences(res.data.preferences);
        setFormData({
          job_title: res.data.preferences.job_title || '',
          location: res.data.preferences.location || '',
          skills: res.data.preferences.skills?.join(', ') || '',
          experience_years: res.data.preferences.experience_years || 0,
          expected_salary: res.data.preferences.expected_salary || '',
          preferred_companies: res.data.preferences.preferred_companies?.join(', ') || '',
          telegram_id: res.data.preferences.telegram_id || '',
          enable_sheets_logging: res.data.preferences.enable_sheets_logging || false
        });
      } else {
        setShowSettings(true);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const loadJobMatches = async () => {
    try {
      const res = await api.get('/ai-agents/job-matches?limit=50&min_score=0');
      setJobMatches(res.data.matches || []);
    } catch (error) {
      console.error('Failed to load job matches:', error);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        job_title: formData.job_title,
        location: formData.location,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience_years: parseInt(formData.experience_years) || 0,
        expected_salary: parseInt(formData.expected_salary) || null,
        preferred_companies: formData.preferred_companies.split(',').map(c => c.trim()).filter(Boolean),
        telegram_id: formData.telegram_id || null,
        enable_sheets_logging: formData.enable_sheets_logging
      };
      await api.post('/ai-agents/job-preferences', payload);
      toast.success('Preferences saved!');
      setShowSettings(false);
      loadPreferences();
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchJobs = async () => {
    if (!preferences) {
      toast.error('Please set your job preferences first');
      setShowSettings(true);
      return;
    }
    setSearching(true);
    try {
      const res = await api.post('/ai-agents/search-jobs', {
        job_title: preferences.job_title,
        location: preferences.location,
        max_results: 30
      });
      toast.success(`Found ${res.data.total_found || 0} jobs!`);
      await loadJobMatches();
      setActiveTab('jobs');
    } catch (error) {
      toast.error('Job search failed. Please try again.');
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleResetPreferences = async () => {
    if (!window.confirm('Reset all preferences and saved matches?')) return;
    try {
      await api.delete('/ai-agents/job-preferences');
      setPreferences(null);
      setJobMatches([]);
      setFormData({
        job_title: '', location: '', skills: '', experience_years: 0,
        expected_salary: '', preferred_companies: '', telegram_id: '', enable_sheets_logging: false
      });
      setShowSettings(true);
      toast.success('Preferences reset!');
    } catch (error) {
      toast.error('Failed to reset preferences');
    }
  };

  const handleResetRecommendations = async () => {
    if (!window.confirm('This will clear all your saved job matches and applied history. Continue?')) return;
    try {
      await api.delete('/ai-agents/reset-recommendations');
      setJobMatches([]);
      setAppliedJobs(new Set());
      setActiveTab('jobs');
      toast.success('All recommendations cleared! Search again to get fresh results.');
    } catch (error) {
      toast.error('Failed to reset recommendations');
    }
  };

  const handleDeleteJob = async (job) => {
    try {
      await api.delete(`/ai-agents/job-match/${job.id}`);
      setJobMatches(prev => prev.filter(j => j.id !== job.id));
      setAppliedJobs(prev => {
        const next = new Set(prev);
        next.delete(`${job.title}::${job.company}`);
        return next;
      });
      toast.success('Job removed');
    } catch (error) {
      toast.error('Failed to remove job');
    }
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) {
      toast.error('Please paste your resume text');
      return;
    }
    setParsing(true);
    try {
      const res = await api.post('/ai-agents/parse-resume', { resume_text: resumeText });
      const parsed = res.data.data;

      // Auto-fill form with parsed data
      const newFormData = {
        ...formData,
        skills: parsed.skills?.length ? parsed.skills.join(', ') : formData.skills,
        experience_years: parsed.total_years || formData.experience_years,
      };
      // If current_role was parsed and job_title is empty, fill it
      if (parsed.current_role && !formData.job_title) {
        newFormData.job_title = parsed.current_role;
      }
      setFormData(newFormData);
      setResumeText('');

      // If job_title and location are set, auto-save preferences and search
      if (newFormData.job_title && newFormData.location) {
        toast.success('Resume parsed! Saving preferences and searching...');
        const payload = {
          job_title: newFormData.job_title,
          location: newFormData.location,
          skills: newFormData.skills.split(',').map(s => s.trim()).filter(Boolean),
          experience_years: parseInt(newFormData.experience_years) || 0,
          expected_salary: parseInt(newFormData.expected_salary) || null,
          preferred_companies: newFormData.preferred_companies ? newFormData.preferred_companies.split(',').map(c => c.trim()).filter(Boolean) : [],
          telegram_id: newFormData.telegram_id || null,
          enable_sheets_logging: newFormData.enable_sheets_logging
        };
        await api.post('/ai-agents/job-preferences', payload);
        await loadPreferences();
        setShowSettings(false);
        setParsing(false);
        // Auto-trigger search
        handleSearchWithData(newFormData.job_title, newFormData.location);
      } else {
        toast.success('Resume parsed! Now fill in Job Title & Location, then save.');
        setShowSettings(true);
        setParsing(false);
      }
    } catch (error) {
      toast.error('Failed to parse resume');
      setParsing(false);
    }
  };

  const handleSearchWithData = async (jobTitle, location) => {
    setSearching(true);
    try {
      const res = await api.post('/ai-agents/search-jobs', {
        job_title: jobTitle,
        location: location,
        max_results: 30
      });
      toast.success(`Found ${res.data.total_found || 0} jobs!`);
      await loadJobMatches();
      setActiveTab('jobs');
    } catch (error) {
      toast.error('Job search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getScoreBorder = (score) => {
    if (score >= 80) return 'border-green-500/30';
    if (score >= 60) return 'border-blue-500/30';
    if (score >= 40) return 'border-yellow-500/30';
    return 'border-gray-500/30';
  };

  const appliedJobsList = jobMatches
    .filter(job => isApplied(job))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const displayJobs = activeTab === 'applied'
    ? appliedJobsList
    : jobMatches.filter(job => !isApplied(job)).sort((a, b) => (b.score || 0) - (a.score || 0));

  if (!isElite) return <EliteGate />;

  return (
    <DashboardLayout title="🎯 AI Job Search Agent">
      <div className="space-y-6">
        {/* Description */}
        <p className="text-gray-600 dark:text-slate-400">
          Paste your resume → AI extracts skills → finds matching jobs in your city. Or set preferences manually.
        </p>

        {/* Resume Upload — Always Visible */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Step 1: Paste Your Resume</span>
              <Badge variant="secondary" className="text-xs">AI Powered</Badge>
            </div>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here... AI will extract your skills, experience, and role to find the best matching jobs."
              className="w-full h-28 p-3 rounded-md border bg-white dark:bg-slate-800 text-sm resize-none mb-3"
            />
            <div className="flex items-center gap-3">
              <Button onClick={handleParseResume} disabled={parsing || !resumeText.trim()} className="flex items-center gap-2">
                {parsing ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing &amp; Searching...</> : <><FileText className="w-4 h-4" /> Parse Resume &amp; Find Jobs</>}
              </Button>
              {!formData.job_title && !formData.location && (
                <span className="text-xs text-gray-500">Fill Job Title &amp; Location below if not in resume</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setShowSettings(!showSettings)} variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {showSettings ? 'Hide Settings' : 'Preferences'}
          </Button>
          <Button onClick={handleSearchJobs} disabled={searching || !preferences} className="flex items-center gap-2">
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {searching ? 'Searching jobs...' : 'Search Jobs Now'}
          </Button>
          {preferences && (
            <Button onClick={handleResetPreferences} variant="outline" className="flex items-center gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10">
              Reset Preferences
            </Button>
          )}
          {jobMatches.length > 0 && (
            <Button onClick={handleResetRecommendations} variant="outline" className="flex items-center gap-2 text-orange-500 border-orange-500/30 hover:bg-orange-500/10">
              Clear All Jobs
            </Button>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card>
            <CardHeader>
              <CardTitle>Job Search Preferences</CardTitle>
              <CardDescription>Configure your criteria for AI-powered job matching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSavePreferences} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="job_title">Job Title *</Label>
                    <Input id="job_title" value={formData.job_title} onChange={(e) => setFormData({...formData, job_title: e.target.value})} placeholder="e.g., Software Engineer" required />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} placeholder="e.g., Bangalore, Remote" required />
                  </div>
                  <div>
                    <Label htmlFor="skills">Skills (comma-separated) *</Label>
                    <Input id="skills" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="e.g., Python, React, AWS" required />
                  </div>
                  <div>
                    <Label htmlFor="experience_years">Years of Experience</Label>
                    <Input id="experience_years" type="number" value={formData.experience_years} onChange={(e) => setFormData({...formData, experience_years: e.target.value})} min="0" required />
                  </div>
                  <div>
                    <Label htmlFor="expected_salary">Expected Salary (₹/year)</Label>
                    <Input id="expected_salary" type="number" value={formData.expected_salary} onChange={(e) => setFormData({...formData, expected_salary: e.target.value})} placeholder="e.g., 1500000" />
                  </div>
                  <div>
                    <Label htmlFor="preferred_companies">Preferred Companies</Label>
                    <Input id="preferred_companies" value={formData.preferred_companies} onChange={(e) => setFormData({...formData, preferred_companies: e.target.value})} placeholder="e.g., Google, Amazon" />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Searching indicator */}
        {searching && <JobSearchLoader />}

        {/* Results */}
        {!searching && (
          <div>
            {/* Tab toggle */}
            {(jobMatches.length > 0 || appliedJobs.size > 0) && (
              <div className="mb-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => { setActiveTab('jobs'); loadJobMatches(); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'jobs'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    📬 Jobs For You ({jobMatches.filter(j => !isApplied(j)).length})
                  </button>
                  <button
                    onClick={() => setActiveTab('applied')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'applied'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                    }`}
                  >
                    ✅ Applied ({appliedJobs.size})
                  </button>
                </div>
                {activeTab === 'jobs' && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                    Jobs curated by your AI agent based on your preferences (updated daily + on search)
                  </p>
                )}
                {activeTab === 'applied' && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                    Jobs you've marked as applied — these won't appear in Jobs For You
                  </p>
                )}
              </div>
            )}

            {displayJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-slate-300 mb-2">
                    {activeTab === 'applied'
                      ? 'No applied jobs yet. Mark jobs as applied to track them here.'
                      : 'No jobs yet. Click "Search Jobs Now" or wait for your daily AI recommendations.'}
                  </p>
                  {!preferences && (
                    <Button onClick={() => setShowSettings(true)} className="mt-4">Set Preferences First</Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {displayJobs.map((job, idx) => (
                  <Card key={job.id || idx} className={`hover:shadow-lg transition-shadow border ${getScoreBorder(job.score)}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0 mr-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{job.title}</h3>
                          <p className="text-gray-700 dark:text-slate-300">{job.company}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <MapPin className="w-3 h-3" /> {job.location || 'Remote'}
                            </Badge>
                            {job.salary && job.salary !== 'Not disclosed' && (
                              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                <DollarSign className="w-3 h-3" /> {job.salary}
                              </Badge>
                            )}
                            {job.source && (
                              <Badge variant="secondary" className="text-xs">
                                {job.source === 'AI Curated' ? '🤖 AI Suggested' : `✅ ${job.source}`}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-start gap-2">
                          <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-sm font-bold ${getScoreColor(job.score)}`}>
                            <TrendingUp className="w-3 h-3" />
                            {job.score}/100
                          </div>
                          <button
                            onClick={() => handleDeleteJob(job)}
                            className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Remove job"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {job.reasoning && job.reasoning.length > 0 && (
                        <div className="mb-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1 uppercase">AI Analysis</p>
                          <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-0.5">
                            {job.reasoning.slice(0, 4).map((reason, i) => (
                              <li key={i}>• {reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap">
                        {job.url && (
                          <Button size="sm" onClick={() => window.open(job.url, '_blank')} className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> {job.source === 'AI Curated' ? 'Find & Apply' : 'Apply'}
                          </Button>
                        )}
                        {isApplied(job) ? (
                          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Applied
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => handleMarkApplied(job)} className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                            <CheckCircle className="w-3 h-3" /> Mark Applied
                          </Button>
                        )}
                        {job.recommendation && (
                          <span className="text-xs text-gray-500 dark:text-slate-400 italic">{job.recommendation}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
