import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { Calendar, Clock, CheckCircle, User, Building2, MessageSquare, ArrowRight } from "lucide-react";
import api from "../../utils/api";
import { Link } from "react-router-dom";

const MenteeMentorSelection = () => {
  const [bookingRequests, setBookingRequests] = useState([]);
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingData();
  }, []);

  const fetchBookingData = async () => {
    try {
      const [bookingsRes, mocksRes] = await Promise.all([
        api.get('/mentee/booking-requests'),
        api.get('/mentee/mocks')
      ]);
      setBookingRequests(bookingsRes.data);
      setMocks(mocksRes.data);
    } catch (error) {
      toast.error('Failed to fetch booking data');
      console.error('Fetch booking data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Your Mock Interviews">
        <div className="text-center py-12 text-slate-400">Loading your interviews...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Your Mock Interviews">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Your Mock Interviews</h1>
          <p className="text-slate-400">Track your interview requests and scheduled sessions</p>
        </div>

        {/* Info Card */}
        <Card className="bg-[#06b6d4]/10 border-[#06b6d4]/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-[#06b6d4] mt-0.5" />
              <div>
                <h3 className="text-[#06b6d4] font-medium mb-1">Mentor Assignment Process</h3>
                <p className="text-slate-300 text-sm">
                  Our team carefully assigns the best mentor for your interview based on your selected company, 
                  interview type, and experience level. You'll receive mentor details via email once confirmed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Action */}
        {bookingRequests.length === 0 && mocks.length === 0 && (
          <Card className="bg-[#1e293b] border-[#334155]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No interviews scheduled yet</h3>
              <p className="text-slate-400 text-center mb-6">
                Ready to practice? Book your first mock interview with our expert mentors.
              </p>
              <Link to="/mentee/book">
                <Button className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Mock Interview
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pending Booking Requests */}
        {bookingRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Pending Requests</h2>
            <div className="grid grid-cols-1 gap-4">
              {bookingRequests.map((request) => (
                <Card key={request.id} className="bg-[#1e293b] border-[#334155]">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-400" />
                        {request.company_name}
                      </CardTitle>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-purple-400" />
                          Interview Details
                        </h4>
                        <div className="space-y-1">
                          <p className="text-slate-300 text-sm">
                            <span className="text-slate-400">Type:</span> {request.interview_type?.replace('_', ' ')}
                          </p>
                          <p className="text-slate-300 text-sm">
                            <span className="text-slate-400">Level:</span> {request.experience_level}
                          </p>
                          {request.interview_track && request.interview_track !== 'general' && (
                            <p className="text-slate-300 text-sm">
                              <span className="text-slate-400">Track:</span> {request.interview_track}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-400" />
                          Preferred Slots
                        </h4>
                        <div className="space-y-1">
                          {request.preferred_slots?.map((slot, index) => (
                            <p key={index} className="text-slate-300 text-sm">
                              {formatDate(slot.date)} at {formatTime(slot.start_time)}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {request.specific_topics && request.specific_topics.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium text-sm mb-2">Focus Areas</h4>
                        <div className="flex flex-wrap gap-1">
                          {request.specific_topics.map((topic, index) => (
                            <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#334155]">
                      <p className="text-slate-400 text-sm">
                        <span className="text-[#06b6d4]">Status:</span> Waiting for mentor assignment. 
                        You'll receive an email with mentor details once confirmed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Confirmed Mock Interviews */}
        {mocks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Scheduled Interviews</h2>
            <div className="grid grid-cols-1 gap-4">
              {mocks.map((mock) => (
                <Card key={mock.id} className="bg-[#1e293b] border-[#334155]">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        {mock.company_name}
                      </CardTitle>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Confirmed
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          Interview Schedule
                        </h4>
                        <p className="text-slate-300 text-sm">
                          {new Date(mock.scheduled_at).toLocaleString('en-IN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-400" />
                          Mentor Assignment
                        </h4>
                        <p className="text-slate-300 text-sm">
                          Mentor details sent via email
                        </p>
                      </div>
                    </div>

                    {mock.meet_link && (
                      <div className="pt-2 border-t border-[#334155]">
                        <a 
                          href={mock.meet_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a] px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Join Interview
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="text-center">
          <Link to="/mentee/book">
            <Button className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Another Interview
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MenteeMentorSelection;