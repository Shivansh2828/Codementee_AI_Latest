import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
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
  BookOpen,
  ExternalLink,
  Lightbulb,
  Target,
  Clock,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const MenteeInterviewChecklist = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);
  const [upcomingMocks, setUpcomingMocks] = useState([]);
  const [selectedMock, setSelectedMock] = useState(null);
  const [interviewType, setInterviewType] = useState('coding');
  const [resources, setResources] = useState(null);

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
    fetchResources();
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

  const fetchResources = async () => {
    try {
      const response = await api.get('/prep-resources');
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
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

        {/* Resources Section */}
        {resources && (
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-500" />
                <CardTitle className="text-slate-100">Preparation Resources</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Curated resources to help you prepare
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="coding" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                  <TabsTrigger value="coding">Coding</TabsTrigger>
                  <TabsTrigger value="system_design">System Design</TabsTrigger>
                  <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                </TabsList>

                {Object.entries(resources).map(([key, resource]) => (
                  <TabsContent key={key} value={key} className="space-y-4 mt-4">
                    {/* Websites */}
                    {resource.websites && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Websites</h4>
                        <div className="space-y-2">
                          {resource.websites.map((site, index) => (
                            <a
                              key={index}
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group"
                            >
                              <div>
                                <p className="text-slate-200 font-medium">{site.name}</p>
                                <p className="text-xs text-slate-400">{site.description}</p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Books */}
                    {resource.books && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Recommended Books</h4>
                        <div className="space-y-2">
                          {resource.books.map((book, index) => (
                            <div key={index} className="p-3 bg-slate-800/50 rounded-lg">
                              <p className="text-slate-200 font-medium">{book.title}</p>
                              <p className="text-xs text-slate-400">by {book.author}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* YouTube Channels */}
                    {resource.youtube && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">YouTube Channels</h4>
                        <div className="space-y-2">
                          {resource.youtube.map((channel, index) => (
                            <a
                              key={index}
                              href={channel.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group"
                            >
                              <p className="text-slate-200">{channel.channel}</p>
                              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-500" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Frameworks */}
                    {resource.frameworks && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-300 mb-3">Frameworks</h4>
                        <div className="space-y-2">
                          {resource.frameworks.map((framework, index) => (
                            <div key={index} className="p-3 bg-slate-800/50 rounded-lg">
                              <p className="text-slate-200 font-medium">{framework.name}</p>
                              <p className="text-xs text-slate-400">{framework.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenteeInterviewChecklist;
