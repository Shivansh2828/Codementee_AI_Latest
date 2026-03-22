import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Search, Copy, Loader2, Crown, Lock } from 'lucide-react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';

const REFERRAL_MESSAGES = [
  { text: 'Searching LinkedIn profiles via Google...', icon: '🔍' },
  { text: 'Finding engineers and managers...', icon: '👥' },
  { text: 'Identifying hiring managers...', icon: '🎯' },
  { text: 'Checking recruiters and talent teams...', icon: '📬' },
  { text: 'AI is analyzing referral potential...', icon: '🤖' },
  { text: 'Drafting personalized messages...', icon: '✍️' },
  { text: 'Almost done, preparing your results...', icon: '✨' },
];

function ReferralSearchLoader({ company }) {
  const [msgIndex, setMsgIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % REFERRAL_MESSAGES.length);
    }, 2500);
    const progTimer = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 8 + 2, 95));
    }, 800);
    return () => { clearInterval(msgTimer); clearInterval(progTimer); };
  }, []);

  const current = REFERRAL_MESSAGES[msgIndex];

  return (
    <Card className="border-cyan-500/30 overflow-hidden">
      <CardContent className="py-14 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-cyan-500/5 animate-pulse" />
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <span className="text-4xl animate-bounce">{current.icon}</span>
          </div>
          <p className="text-xl font-semibold mb-1">
            Finding contacts at {company || 'the company'}...
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 h-5 transition-all duration-500">
            {current.text}
          </p>
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

function EliteGate() {
  return (
    <DashboardLayout title="🤝 AI Referral Finder">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-2 border-amber-500/30">
          <CardContent className="p-8 text-center">
            <Lock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Elite Feature</h2>
            <p className="text-gray-500 dark:text-slate-400 mb-6">
              AI Referral Finder is available exclusively for Elite plan members. Upgrade to find employees at target companies and get AI-drafted referral messages.
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

export default function MenteeReferralFinder() {
  const { user } = useAuth();
  const isElite = user?.plan_id === 'elite' || user?.role === 'agent_user' || user?.plan_id?.startsWith('agent_');
  const [searchCompany, setSearchCompany] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [messages, setMessages] = useState(null);
  const [messageVisible, setMessageVisible] = useState(false);
  const [draftingFor, setDraftingFor] = useState(null);
  const messageSectionRef = useRef(null);

  const handleFindReferrals = async (e) => {
    e.preventDefault();
    if (!searchCompany.trim()) {
      toast.error('Please enter a company name');
      return;
    }

    if (!roleFilter.trim()) {
      toast.error('Please enter a role filter (e.g., Software Engineer, Manager)');
      return;
    }

    setLoading(true);
    setMessages(null);
    setSelectedEmployee(null);
    try {
      const response = await api.post('/ai-agents/find-referrals', {
        company: searchCompany,
        role_filter: roleFilter || null,
        limit: 20
      });

      setEmployees(response.data.employees || []);
      toast.success(`Found ${response.data.total_found} employees at ${searchCompany}`);
    } catch (error) {
      toast.error('Failed to find referrals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToMessages = () => {
    setTimeout(() => {
      messageSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  const handleDraftMessage = async (employee) => {
    if (employee.messages) {
      setSelectedEmployee(employee.employee);
      setMessages(employee.messages);
      setMessageVisible(false);
      requestAnimationFrame(() => {
        setMessageVisible(true);
        scrollToMessages();
      });
      return;
    }

    setSelectedEmployee(employee.employee);
    setDraftingFor(employee.employee.id);
    setMessages(null);
    setMessageVisible(false);

    try {
      const response = await api.post('/ai-agents/draft-message', {
        employee_id: employee.employee.id,
        job_url: null
      });

      setMessages(response.data.messages);
      requestAnimationFrame(() => {
        setMessageVisible(true);
        scrollToMessages();
      });
    } catch (error) {
      toast.error('Failed to draft message');
      console.error(error);
    } finally {
      setDraftingFor(null);
    }
  };

  const handleCopyMessage = (message) => {
    navigator.clipboard.writeText(message);
    toast.success('Message copied to clipboard!');
  };

  if (!isElite) return <EliteGate />;

  return (
    <DashboardLayout title="🤝 AI Referral Finder">
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-slate-400">
          Find employees at target companies and get AI-drafted referral messages.
        </p>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Search for Employees</CardTitle>
            <CardDescription>
              Find LinkedIn profiles at your target company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFindReferrals} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={searchCompany}
                    onChange={(e) => setSearchCompany(e.target.value)}
                    placeholder="e.g., Amazon, Google, Microsoft"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role Filter</Label>
                  <Input
                    id="role"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    placeholder="e.g., Software Engineer, Manager"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                {loading ? 'Finding employees...' : 'Find Referrals'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Searching indicator */}
        {loading && !selectedEmployee && <ReferralSearchLoader company={searchCompany} />}

        {/* Employee Results */}
        {!loading && employees.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Found {employees.length} Employee Profiles
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              💡 Profiles sourced from public LinkedIn data via Google. Click "View on LinkedIn" to visit their profile.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map((emp) => (
                <Card key={emp.employee.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {emp.employee.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {emp.employee.name}
                          </h3>
                          <Badge variant="outline" className={`text-xs ${
                            emp.employee.source === 'LinkedIn (via Google)'
                              ? 'text-green-600 border-green-500/30'
                              : 'text-amber-600 border-amber-500/30'
                          }`}>
                            {emp.employee.source === 'LinkedIn (via Google)' ? '✅ Profile' : '🤖 AI Suggested'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                          {emp.employee.role} at {emp.employee.company}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{emp.employee.seniority}</Badge>
                          <Badge variant="outline">{emp.employee.department}</Badge>
                        </div>
                        {emp.employee.best_approach && (
                          <p className="text-xs text-gray-500 dark:text-slate-500 mb-3 italic">💡 {emp.employee.best_approach}</p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleDraftMessage(emp)}
                            size="sm"
                            className="flex-1"
                            disabled={draftingFor === emp.employee.id}
                          >
                            {draftingFor === emp.employee.id
                              ? <><Loader2 className="w-4 h-4 animate-spin mr-1" /> Drafting...</>
                              : emp.messages ? '✉️ View Messages' : 'Draft Message'}
                          </Button>
                          {emp.employee.linkedin_url && (
                            <Button
                              onClick={() => window.open(emp.employee.linkedin_url, '_blank')}
                              size="sm"
                              variant="outline"
                              className="text-blue-600"
                            >
                              {emp.employee.source === 'LinkedIn (via Google)' ? 'View on LinkedIn' : 'Search LinkedIn'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Drafting indicator */}
        {draftingFor && !messages && (
          <Card className="border-cyan-500/30 overflow-hidden">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-slate-400">
                ✍️ AI is drafting personalized messages for {selectedEmployee?.name}...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Message Drafts */}
        {messages && selectedEmployee && (
          <div
            ref={messageSectionRef}
            className="transition-all duration-500 ease-out"
            style={{
              opacity: messageVisible ? 1 : 0,
              transform: messageVisible ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
          <Card className="border-2 border-cyan-500">
            <CardHeader>
              <CardTitle>Draft Messages for {selectedEmployee.name}</CardTitle>
              <CardDescription>
                Choose a message variant, copy it, and send via LinkedIn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['formal', 'friendly', 'concise'].map((variant) => (
                <div key={variant} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold capitalize">{variant} Version</h4>
                    {messages.recommended === variant && (
                      <Badge variant="default">Recommended</Badge>
                    )}
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded mb-3 whitespace-pre-wrap text-sm">
                    {messages[variant]}
                  </div>
                  <Button
                    onClick={() => handleCopyMessage(messages[variant])}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Message
                  </Button>
                </div>
              ))}

              {messages.tips && messages.tips.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">💡 Tips</p>
                  <ul className="text-xs text-amber-600 dark:text-amber-300 space-y-0.5">
                    {messages.tips.map((tip, i) => <li key={i}>• {tip}</li>)}
                  </ul>
                </div>
              )}

              <Button
                onClick={() => { setMessages(null); setSelectedEmployee(null); setMessageVisible(false); }}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}