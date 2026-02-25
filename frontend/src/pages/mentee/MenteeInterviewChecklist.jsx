import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Checkbox } from '../../components/ui/checkbox';
import { 
  CheckCircle2, 
  Circle, 
  Monitor, 
  Home, 
  FileText, 
  Code, 
  Layout, 
  Users, 
  Briefcase,
  Lightbulb,
  Target,
  Clock,
  Award,
  MessageSquare,
  CalendarPlus
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';

const MenteeInterviewChecklist = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);
  const [upcomingMocks, setUpcomingMocks] = useState([]);
  const [selectedMock, setSelectedMock] = useState(null);
  const [interviewType, setInterviewType] = useState('coding');

  const iconMap = {
    monitor: Monitor,
    home: Home,
    'file-text': FileText,
    code: Code,
    layout: Layout,
    users: Users,
    briefcase: Briefcase
  };

  useEffect(() => {
    fetchUpcomingMocks();
  }, []);

  useEffect(() => {
    if (selectedMock) {
      fetchChecklistProgress();
    }
    fetchChecklist();
  }, [selectedMock, interviewType]);

  const fetchUpcomingMocks = async () => {
    try {
      const response = await api.get('/mocks');
      const upcoming = response.data.filter(m => m.status === 'scheduled');
      setUpcomingMocks(upcoming);
      if (upcoming.length > 0) {
        setSelectedMock(upcoming[0]);
      }
    } catch (error) {
      console.error('Error fetching mocks:', error);
    }
  };

  const fetchChecklist = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        interview_type: interviewType
      });
      
      if (selectedMock?.company_name) {
        params.append('company', selectedMock.company_name);
      }

      const response = await api.get(`/mentee/prep-checklist?${params}`);
      setChecklist(response.data);
    } catch (error) {
      toast.error('Failed to load checklist');
    } finally {
      setLoading(false);
    }
  };

  const fetchChecklistProgress = async () => {
    if (!selectedMock) return;
    
    try {
      const response = await api.get(`/mentee/prep-checklist/${selectedMock.id}/progress`);
      setCompletedItems(response.data.completed_items || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleToggleItem = async (itemId) => {
    const newCompletedItems = completedItems.includes(itemId)
      ? completedItems.filter(id => id !== itemId)
      : [...completedItems, itemId];

    setCompletedItems(newCompletedItems);

    if (selectedMock) {
      try {
        await api.post(`/mentee/prep-checklist/${selectedMock.id}/progress`, {
          mock_id: selectedMock.id,
          completed_items: newCompletedItems
        });
      } catch (error) {
        toast.error('Failed to save progress');
      }
    }
  };

  const calculateProgress = () => {
    if (!checklist) return 0;
    
    let totalItems = 0;
    checklist.sections.forEach(section => {
      totalItems += section.items.length;
    });

    return totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0;
  };

  const getRequiredItemsCount = () => {
    if (!checklist) return { completed: 0, total: 0 };
    
    let totalRequired = 0;
    let completedRequired = 0;

    checklist.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.required) {
          totalRequired++;
          if (completedItems.includes(item.id)) {
            completedRequired++;
          }
        }
      });
    });

    return { completed: completedRequired, total: totalRequired };
  };

  const renderChecklistSection = (section) => {
    const IconComponent = iconMap[section.icon] || Circle;
    const sectionCompleted = section.items.filter(item => 
      completedItems.includes(item.id)
    ).length;

    return (
      <Card key={section.title} className="bg-[#1e293b] border-[#334155]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-lg">
                <IconComponent className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <CardTitle className="text-lg text-slate-100">{section.title}</CardTitle>
                <CardDescription className="text-slate-400">
                  {sectionCompleted} of {section.items.length} completed
                </CardDescription>
              </div>
            </div>
            <Badge variant={sectionCompleted === section.items.length ? "default" : "secondary"}>
              {Math.round((sectionCompleted / section.items.length) * 100)}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {section.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <Checkbox
                id={item.id}
                checked={completedItems.includes(item.id)}
                onCheckedChange={() => handleToggleItem(item.id)}
                className="mt-1"
              />
              <label
                htmlFor={item.id}
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${
                    completedItems.includes(item.id) 
                      ? 'text-slate-400 line-through' 
                      : 'text-slate-200'
                  }`}>
                    {item.text}
                  </span>
                  {item.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </div>
              </label>
              {completedItems.includes(item.id) && (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="Interview Preparation Checklist">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const progress = calculateProgress();
  const requiredItems = getRequiredItemsCount();
  const isReadyForInterview = requiredItems.completed === requiredItems.total;

  return (
    <DashboardLayout title="Interview Preparation Checklist">
      <div className="space-y-6">
        {/* Header with Progress */}
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">
                  Get Ready for Your Interview
                </h2>
                <p className="text-slate-400">
                  Complete this checklist to ensure you're fully prepared
                </p>
              </div>
              {isReadyForInterview && (
                <Badge className="bg-green-500 text-white">
                  <Award className="w-4 h-4 mr-1" />
                  Ready!
                </Badge>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Overall Progress</span>
                <span className="text-cyan-400 font-semibold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{completedItems.length} items completed</span>
                <span>
                  {requiredItems.completed}/{requiredItems.total} required items
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mock Interview Selector */}
        {upcomingMocks.length > 0 && (
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <CardTitle className="text-slate-100">Upcoming Interview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-cyan-500" />
                <div className="flex-1">
                  <p className="text-slate-200 font-medium">
                    {selectedMock?.company_name || 'Mock Interview'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {selectedMock?.scheduled_at ? new Date(selectedMock.scheduled_at).toLocaleString() : 'Not scheduled'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview Type Selector */}
        <Card className="bg-[#1e293b] border-[#334155]">
          <CardHeader>
            <CardTitle className="text-slate-100">Interview Type</CardTitle>
            <CardDescription className="text-slate-400">
              Select the type of interview you're preparing for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: 'coding', label: 'Coding', icon: Code },
                { value: 'system_design', label: 'System Design', icon: Layout },
                { value: 'behavioral', label: 'Behavioral', icon: Users },
                { value: 'hr_round', label: 'HR Round', icon: Briefcase }
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={interviewType === value ? 'default' : 'outline'}
                  className={`h-auto py-4 ${
                    interviewType === value
                      ? 'bg-cyan-500 hover:bg-cyan-600'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                  onClick={() => setInterviewType(value)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Checklist Sections */}
        {checklist && (
          <div className="space-y-4">
            {checklist.sections.map(section => renderChecklistSection(section))}
          </div>
        )}

        {/* Company-Specific Tips */}
        {checklist?.company_tips && checklist.company_tips.length > 0 && (
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-500" />
                <CardTitle className="text-slate-100">
                  {selectedMock?.company_name} Specific Tips
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {checklist.company_tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-300">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* General Tips */}
        {checklist?.general_tips && (
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-slate-100">General Interview Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {checklist.general_tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-slate-800/50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-300">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform Features - Keep Users Engaged */}
        <Card className="bg-[#1e293b] border-[#334155]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-500" />
              <CardTitle className="text-slate-100">Continue Your Preparation</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Use our platform tools to prepare effectively
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* AI Resume Analyzer */}
              <Link 
                to="/mentee/resume-analyzer"
                className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg hover:border-purple-500/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-slate-100 font-semibold mb-1 group-hover:text-purple-400 transition-colors">
                      AI Resume Analyzer
                    </h4>
                    <p className="text-sm text-slate-400">
                      Get instant feedback on your resume with AI-powered analysis
                    </p>
                  </div>
                </div>
              </Link>

              {/* Interview Prep Tool */}
              <Link 
                to="/mentee/interview-prep"
                className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg hover:border-green-500/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Award className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-slate-100 font-semibold mb-1 group-hover:text-green-400 transition-colors">
                      AI Interview Prep
                    </h4>
                    <p className="text-sm text-slate-400">
                      Practice with AI-generated questions tailored to your target company
                    </p>
                  </div>
                </div>
              </Link>

              {/* Community */}
              <Link 
                to="/mentee/community"
                className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/30 rounded-lg hover:border-orange-500/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-slate-100 font-semibold mb-1 group-hover:text-orange-400 transition-colors">
                      Community Forum
                    </h4>
                    <p className="text-sm text-slate-400">
                      Connect with peers, share experiences, and get advice
                    </p>
                  </div>
                </div>
              </Link>

              {/* Book Another Mock */}
              <Link 
                to="/mentee/book"
                className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/30 rounded-lg hover:border-cyan-500/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <CalendarPlus className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-slate-100 font-semibold mb-1 group-hover:text-cyan-400 transition-colors">
                      Schedule More Mocks
                    </h4>
                    <p className="text-sm text-slate-400">
                      Book additional mock interviews to practice more
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MenteeInterviewChecklist;
