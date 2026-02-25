import React, { useState } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import { Brain, Building2, Code, Users, MessageSquare, Calendar, Target, Lightbulb, BookOpen, Clock } from "lucide-react";
import api from "../../utils/api";

const MenteeInterviewPrep = () => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [prepData, setPrepData] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const companies = [
    'Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Netflix', 'Uber', 'Airbnb', 
    'Spotify', 'Stripe', 'Flipkart', 'Zomato', 'Swiggy', 'Paytm', 'BYJU\'S'
  ];

  const roles = [
    'Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Principal Engineer',
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer',
    'Data Engineer', 'Machine Learning Engineer', 'Product Manager', 'Engineering Manager'
  ];

  const interviewTypes = [
    { id: 'technical', name: 'Technical Interview', icon: Code },
    { id: 'system_design', name: 'System Design', icon: Brain },
    { id: 'behavioral', name: 'Behavioral Interview', icon: MessageSquare }
  ];

  const experienceLevels = [
    { id: 'junior', name: 'Junior (0-2 years)' },
    { id: 'mid', name: 'Mid-level (2-5 years)' },
    { id: 'senior', name: 'Senior (5+ years)' }
  ];

  const handleGetPrep = async () => {
    if (!company || !role || !interviewType || !experienceLevel) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/ai-tools/interview-prep', {
        company,
        role,
        interview_type: interviewType,
        experience_level: experienceLevel
      });
      setPrepData(response.data);
      toast.success('Interview prep guide generated!');
    } catch (error) {
      toast.error('Failed to generate prep guide');
      console.error('Prep error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetQuestions = async () => {
    if (!company || !role || !interviewType) {
      toast.error('Please select company, role, and interview type');
      return;
    }

    setQuestionsLoading(true);
    try {
      const response = await api.get('/ai-tools/interview-questions', {
        params: {
          company,
          role,
          interview_type: interviewType
        }
      });
      setQuestions(response.data);
      toast.success('Interview questions generated!');
    } catch (error) {
      toast.error('Failed to generate questions');
      console.error('Questions error:', error);
    } finally {
      setQuestionsLoading(false);
    }
  };

  return (
    <DashboardLayout title="AI Interview Prep">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">AI Interview Prep Assistant</h1>
          <p className="text-slate-400">Get personalized interview preparation based on your target company and role</p>
        </div>

        {/* Input Form */}
        <Card className="bg-[#1e293b] border-[#334155]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-[#06b6d4]" />
              Interview Details
            </CardTitle>
            <CardDescription>
              Specify your target company, role, and interview type for personalized preparation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Target Company</Label>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger className="bg-[#0f172a] border-[#334155] text-white">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-[#334155]">
                    {companies.map((comp) => (
                      <SelectItem key={comp} value={comp} className="text-white hover:bg-[#334155]">
                        {comp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Target Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-[#0f172a] border-[#334155] text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-[#334155]">
                    {roles.map((r) => (
                      <SelectItem key={r} value={r} className="text-white hover:bg-[#334155]">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Interview Type</Label>
                <Select value={interviewType} onValueChange={setInterviewType}>
                  <SelectTrigger className="bg-[#0f172a] border-[#334155] text-white">
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-[#334155]">
                    {interviewTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id} className="text-white hover:bg-[#334155]">
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger className="bg-[#0f172a] border-[#334155] text-white">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e293b] border-[#334155]">
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.id} value={level.id} className="text-white hover:bg-[#334155]">
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleGetPrep}
                disabled={loading}
                className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]"
              >
                {loading ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Generating Prep Guide...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Get Prep Guide
                  </>
                )}
              </Button>

              <Button
                onClick={handleGetQuestions}
                disabled={questionsLoading}
                variant="outline"
                className="border-[#334155] text-white hover:bg-[#334155]"
              >
                {questionsLoading ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Get Practice Questions
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {(prepData || questions) && (
          <Tabs defaultValue="prep" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#1e293b] border border-[#334155]">
              <TabsTrigger value="prep" className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-[#0f172a]">
                Prep Guide
              </TabsTrigger>
              <TabsTrigger 
                value="questions" 
                disabled={!questions}
                className="data-[state=active]:bg-[#06b6d4] data-[state=active]:text-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Practice Questions {!questions && '(Generate first)'}
              </TabsTrigger>
            </TabsList>

            {/* Prep Guide Tab */}
            <TabsContent value="prep" className="space-y-6">
              {prepData && (
                <>
                  {/* Company Insights */}
                  <Card className="bg-[#1e293b] border-[#334155]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Building2 className="w-5 h-5 text-blue-400" />
                        Company Insights - {company}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Culture & Values</h4>
                        <p className="text-slate-300">{prepData.company_insights.culture}</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">Interview Process</h4>
                        <p className="text-slate-300">{prepData.company_insights.interview_process}</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">Common Questions</h4>
                        <ul className="space-y-1">
                          {prepData.company_insights.common_questions.map((question, index) => (
                            <li key={index} className="text-slate-300 flex items-start gap-2">
                              <span className="text-[#06b6d4] mt-1">•</span>
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Technical Topics */}
                  <Card className="bg-[#1e293b] border-[#334155]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Code className="w-5 h-5 text-green-400" />
                        Key Technical Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {prepData.technical_topics.map((topic, index) => (
                          <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/30">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Behavioral Framework */}
                  <Card className="bg-[#1e293b] border-[#334155]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Users className="w-5 h-5 text-purple-400" />
                        Behavioral Interview Framework
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Recommended Method</h4>
                        <p className="text-slate-300">{prepData.behavioral_framework.method}</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">Key Areas to Prepare</h4>
                        <div className="flex flex-wrap gap-2">
                          {prepData.behavioral_framework.key_areas.map((area, index) => (
                            <Badge key={index} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Practice Problems */}
                  <Card className="bg-[#1e293b] border-[#334155]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Recommended Practice Problems
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {prepData.practice_problems.map((problem, index) => (
                          <li key={index} className="text-slate-300 flex items-start gap-2">
                            <span className="text-[#06b6d4] mt-1">•</span>
                            {problem}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Timeline */}
                  <Card className="bg-[#1e293b] border-[#334155]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        4-Week Preparation Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(prepData.timeline).map(([week, plan]) => (
                          <div key={week} className="flex gap-4">
                            <div className="w-16 h-16 bg-[#06b6d4]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-[#06b6d4] font-bold">{week.replace('_', ' ').toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                              {typeof plan === 'string' ? (
                                <p className="text-slate-300">{plan}</p>
                              ) : (
                                <div className="space-y-2">
                                  {plan.focus && (
                                    <p className="text-white font-medium">{plan.focus}</p>
                                  )}
                                  {plan.tasks && Array.isArray(plan.tasks) && (
                                    <ul className="space-y-1">
                                      {plan.tasks.map((task, idx) => (
                                        <li key={idx} className="text-slate-300 flex items-start gap-2">
                                          <span className="text-[#06b6d4] mt-1">•</span>
                                          {task}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Prompt to generate questions */}
                  {!questions && (
                    <Card className="bg-[#06b6d4]/10 border-[#06b6d4]/30">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <MessageSquare className="w-12 h-12 text-[#06b6d4] mx-auto mb-3" />
                          <h3 className="text-white font-medium mb-2">Ready for Practice Questions?</h3>
                          <p className="text-slate-300 mb-4">
                            Click the "Get Practice Questions" button above to generate company-specific interview questions
                          </p>
                          <Button
                            onClick={handleGetQuestions}
                            disabled={questionsLoading || !company || !role || !interviewType}
                            className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]"
                          >
                            {questionsLoading ? (
                              <>
                                <Brain className="w-4 h-4 mr-2 animate-spin" />
                                Generating Questions...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Generate Practice Questions
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-6">
              {questions ? (
                <>
                  <Card className="bg-[#1e293b] border-[#334155]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <MessageSquare className="w-5 h-5 text-[#06b6d4]" />
                        Practice Questions - {interviewTypes.find(t => t.id === interviewType)?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {questions.questions.map((question, index) => (
                          <div key={index} className="p-4 bg-[#0f172a] rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-[#06b6d4]/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-[#06b6d4] text-sm font-bold">{index + 1}</span>
                              </div>
                              <p className="text-white">{question}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#1e293b] border-[#334155]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Interview Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {questions.tips.map((tip, index) => (
                          <li key={index} className="text-slate-300 flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">💡</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="bg-[#1e293b] border-[#334155]">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-white font-medium mb-2">No Questions Generated Yet</h3>
                      <p className="text-slate-400">
                        Please click "Get Practice Questions" button to generate interview questions
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenteeInterviewPrep;