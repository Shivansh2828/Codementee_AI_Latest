import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  Building2, 
  Briefcase, 
  TrendingUp, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Crown,
  Filter,
  X
} from "lucide-react";
import api from "../../utils/api";
import { Link } from "react-router-dom";

const ImprovedBookingFlow = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Data states
  const [slots, setSlots] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // Form states
  const [filters, setFilters] = useState({
    interviewType: '',
    experienceLevel: '',
    dateFrom: '',
    dateTo: '',
    companyId: ''
  });
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [specificTopics, setSpecificTopics] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [availableTracks, setAvailableTracks] = useState([]);

  const isFreeUser = user?.status === 'Free' || !user?.plan_id;
  const quotaRemaining = user?.interview_quota_remaining || 0;

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (currentStep === 1) {
      fetchSlots();
    }
  }, [currentStep, filters]);

  useEffect(() => {
    if (selectedCompany) {
      const company = companies.find(c => c.id === selectedCompany);
      if (company && company.interview_tracks) {
        setAvailableTracks(company.interview_tracks);
      } else {
        setAvailableTracks([]);
      }
      setSelectedTrack('');
    }
  }, [selectedCompany, companies]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      toast.error('Failed to load companies');
    }
  };

  const fetchSlots = async () => {
    setLoadingSlots(true);
    try {
      const params = new URLSearchParams();
      if (filters.interviewType) params.append('interview_type', filters.interviewType);
      if (filters.experienceLevel) params.append('experience_level', filters.experienceLevel);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);
      if (filters.companyId) params.append('company_id', filters.companyId);

      const response = await api.get(`/mentee/slots/browse?${params.toString()}`);
      setSlots(response.data);
    } catch (error) {
      toast.error('Failed to load slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot) => {
    if (isFreeUser) {
      toast.error('Please upgrade to book interviews', {
        action: {
          label: 'Upgrade',
          onClick: () => window.location.href = '/mentee/book'
        }
      });
      return;
    }

    if (quotaRemaining === 0) {
      toast.error('Interview quota exceeded', {
        description: 'You have used all interviews in your plan.'
      });
      return;
    }

    setSelectedSlot(slot);
    // Filter companies to only those in slot's specializations
    const slotCompanyIds = slot.company_specializations.map(c => 
      typeof c === 'string' ? c : c.id
    );
    const filteredCompanies = companies.filter(c => 
      slotCompanyIds.includes(c.id)
    );
    setCompanies(filteredCompanies);
    setCurrentStep(2);
  };

  const handleBooking = async () => {
    if (!selectedCompany) {
      toast.error('Please select a company');
      return;
    }

    if (!selectedTrack) {
      toast.error('Please select an interview track');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        slot_id: selectedSlot.id,
        company_id: selectedCompany,
        interview_track: selectedTrack,
        specific_topics: specificTopics,
        additional_notes: additionalNotes
      };

      await api.post('/mentee/bookings', bookingData);
      
      toast.success('Booking confirmed!', {
        description: 'You will receive a confirmation email with mentor details shortly.'
      });
      
      // Reset and go back to step 1
      setCurrentStep(1);
      setSelectedSlot(null);
      setSelectedCompany('');
      setSelectedTrack('');
      setSpecificTopics([]);
      setAdditionalNotes('');
      fetchSlots();
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.code === 'SLOT_ALREADY_BOOKED') {
        toast.error('Slot no longer available', {
          description: 'This slot was just booked. Please select another slot.'
        });
        setCurrentStep(1);
        setSelectedSlot(null);
        fetchSlots();
      } else if (errorData?.code === 'INTERVIEW_QUOTA_EXCEEDED') {
        toast.error('Interview quota exceeded', {
          description: 'You have used all interviews in your plan.'
        });
      } else {
        toast.error('Booking failed', {
          description: errorData?.message || 'An error occurred.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
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

  const topicsByType = {
    coding: ['Arrays & Strings', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming', 'Recursion & Backtracking', 'Sorting & Searching', 'Hash Tables', 'Stacks & Queues'],
    system_design: ['Scalability', 'Load Balancing', 'Caching', 'Database Design', 'Microservices', 'API Design', 'Distributed Systems', 'Message Queues'],
    behavioral: ['Leadership', 'Teamwork', 'Conflict Resolution', 'Project Management', 'Communication', 'Problem Solving', 'Adaptability', 'Time Management'],
    hr_round: ['Career Goals', 'Salary Negotiation', 'Company Culture', 'Work-Life Balance', 'Strengths & Weaknesses', 'Why This Company', 'Previous Experience', 'Future Plans']
  };

  const availableTopics = selectedSlot ? selectedSlot.interview_types.flatMap(type => topicsByType[type] || []) : [];

  const clearFilters = () => {
    setFilters({
      interviewType: '',
      experienceLevel: '',
      dateFrom: '',
      dateTo: '',
      companyId: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  return (
    <DashboardLayout title="Book Mock Interview">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Progress */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${theme.text.primary} mb-2`}>
            Book Your Mock Interview
          </h1>
          <p className={theme.text.secondary}>
            {currentStep === 1 ? 'Select an available slot' : 'Complete your booking details'}
          </p>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-[#06b6d4] text-white' : `${theme.bg.secondary} ${theme.text.muted}`}`}>
                1
              </div>
              <span className={currentStep >= 1 ? theme.text.primary : theme.text.muted}>Select Slot</span>
            </div>
            <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-[#06b6d4]' : theme.bg.secondary}`} />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-[#06b6d4] text-white' : `${theme.bg.secondary} ${theme.text.muted}`}`}>
                2
              </div>
              <span className={currentStep >= 2 ? theme.text.primary : theme.text.muted}>Booking Details</span>
            </div>
          </div>
        </div>

        {/* Quota Warning */}
        {!isFreeUser && quotaRemaining <= 2 && (
          <div className={`${theme.bg.secondary} rounded-xl p-4 border-2 ${quotaRemaining === 0 ? 'border-red-500/30' : 'border-yellow-500/30'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 ${quotaRemaining === 0 ? 'text-red-400' : 'text-yellow-400'} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`${theme.text.primary} font-semibold mb-1`}>
                  {quotaRemaining === 0 ? 'Interview Quota Exhausted' : 'Low Interview Quota'}
                </p>
                <p className={`${theme.text.secondary} text-sm`}>
                  {quotaRemaining === 0 
                    ? 'You have used all interviews in your plan. Upgrade to continue booking.'
                    : `You have only ${quotaRemaining} interview${quotaRemaining !== 1 ? 's' : ''} remaining in your plan.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Free User Warning */}
        {isFreeUser && (
          <div className={`${theme.bg.secondary} rounded-xl p-6 border-2 border-yellow-500/30`}>
            <div className="flex items-start gap-4">
              <Crown className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className={`${theme.text.primary} font-semibold mb-2 text-lg`}>Upgrade Required</p>
                <p className={`${theme.text.secondary} mb-4`}>
                  You need an active paid subscription to book mock interviews. 
                  Upgrade now to access expert mentors from top companies.
                </p>
                <Link to="/mentee/book">
                  <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <Crown className="w-4 h-4 mr-2" />
                    View Plans & Upgrade
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Slot Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
              <CardHeader>
                <CardTitle className={`${theme.text.primary} flex items-center gap-2`}>
                  <Filter className="w-5 h-5" />
                  Filter Slots
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="ml-auto text-[#06b6d4]"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className={theme.text.secondary}>Interview Type</Label>
                    <Select value={filters.interviewType} onValueChange={(v) => setFilters({...filters, interviewType: v})}>
                      <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary}`}>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                        <SelectItem value="">All types</SelectItem>
                        <SelectItem value="coding">Coding</SelectItem>
                        <SelectItem value="system_design">System Design</SelectItem>
                        <SelectItem value="behavioral">Behavioral</SelectItem>
                        <SelectItem value="hr_round">HR Round</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={theme.text.secondary}>Experience Level</Label>
                    <Select value={filters.experienceLevel} onValueChange={(v) => setFilters({...filters, experienceLevel: v})}>
                      <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary}`}>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                        <SelectItem value="">All levels</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="staff_plus">Staff+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={theme.text.secondary}>Company</Label>
                    <Select value={filters.companyId} onValueChange={(v) => setFilters({...filters, companyId: v})}>
                      <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary}`}>
                        <SelectValue placeholder="All companies" />
                      </SelectTrigger>
                      <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                        <SelectItem value="">All companies</SelectItem>
                        {companies.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Slots Grid */}
            {loadingSlots ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#06b6d4]" />
                <p className={theme.text.secondary}>Loading available slots...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className={`${theme.glass} rounded-xl p-12 text-center ${theme.border.primary} border`}>
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className={`${theme.text.primary} text-xl font-semibold mb-2`}>No slots available</h3>
                <p className={theme.text.secondary}>
                  {hasActiveFilters 
                    ? 'Try adjusting your filters to see more slots.'
                    : 'No interview slots are currently available. Please check back later.'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border ${theme.shadow} transition-all hover:scale-105 hover:border-[#06b6d4] cursor-pointer`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#06b6d4]" />
                        <span className={`${theme.text.primary} font-semibold`}>
                          {formatDate(slot.date)}
                        </span>
                      </div>
                      <Badge className="bg-green-400/20 text-green-400 border-green-400/30 text-xs">
                        Available
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className={theme.text.secondary}>
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex flex-wrap gap-1">
                        {slot.interview_types.slice(0, 2).map((type) => (
                          <Badge key={type} className="bg-blue-400/20 text-blue-400 border-blue-400/30 text-xs">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                        {slot.interview_types.length > 2 && (
                          <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30 text-xs">
                            +{slot.interview_types.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {slot.experience_levels.slice(0, 2).map((level) => (
                          <Badge key={level} className="bg-teal-400/20 text-teal-400 border-teal-400/30 text-xs">
                            {level}
                          </Badge>
                        ))}
                        {slot.experience_levels.length > 2 && (
                          <Badge className="bg-teal-400/20 text-teal-400 border-teal-400/30 text-xs">
                            +{slot.experience_levels.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white"
                      disabled={isFreeUser || quotaRemaining === 0}
                    >
                      {isFreeUser ? (
                        <>
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Book
                        </>
                      ) : quotaRemaining === 0 ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Quota Exceeded
                        </>
                      ) : (
                        <>
                          Select Slot
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Booking Details */}
        {currentStep === 2 && selectedSlot && (
          <div className="space-y-6">
            {/* Selected Slot Summary */}
            <Card className={`${theme.bg.card} ${theme.border.accent} border-2`}>
              <CardHeader>
                <CardTitle className={`${theme.text.primary} flex items-center gap-2`}>
                  <CheckCircle className="w-5 h-5 text-[#06b6d4]" />
                  Selected Slot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`${theme.text.muted} text-sm mb-1`}>Date</p>
                    <p className={`${theme.text.primary} font-semibold`}>{formatDate(selectedSlot.date)}</p>
                  </div>
                  <div>
                    <p className={`${theme.text.muted} text-sm mb-1`}>Time</p>
                    <p className={`${theme.text.primary} font-semibold`}>
                      {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Form */}
            <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
              <CardHeader>
                <CardTitle className={theme.text.primary}>Complete Your Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Selection */}
                <div>
                  <Label className={theme.text.secondary}>
                    <Building2 className="w-4 h-4 inline mr-1" />
                    Select Company *
                  </Label>
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} mt-2`}>
                      <SelectValue placeholder="Choose a company" />
                    </SelectTrigger>
                    <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Interview Track */}
                {selectedCompany && (
                  <div>
                    <Label className={theme.text.secondary}>Interview Track *</Label>
                    <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                      <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} mt-2`}>
                        <SelectValue placeholder="Choose interview track" />
                      </SelectTrigger>
                      <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                        {availableTracks.length === 0 ? (
                          <SelectItem value="general">General</SelectItem>
                        ) : (
                          availableTracks.map((track) => (
                            <SelectItem key={track} value={track}>
                              {track.toUpperCase()}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Topics */}
                {availableTopics.length > 0 && (
                  <div>
                    <Label className={theme.text.secondary}>Specific Topics (Optional)</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableTopics.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => {
                            setSpecificTopics(prev =>
                              prev.includes(topic)
                                ? prev.filter(t => t !== topic)
                                : [...prev, topic]
                            );
                          }}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            specificTopics.includes(topic)
                              ? 'bg-[#06b6d4] text-white'
                              : `${theme.bg.secondary} ${theme.text.secondary} hover:border-[#06b6d4]`
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                <div>
                  <Label className={theme.text.secondary}>Additional Notes (Optional)</Label>
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any specific areas you want to focus on..."
                    rows={4}
                    className={`${theme.bg.secondary} ${theme.border.primary} mt-2`}
                  />
                </div>

                {/* Preparation Notes */}
                {selectedSlot.preparation_notes && (
                  <div className={`${theme.bg.secondary} rounded-xl p-4`}>
                    <h4 className={`${theme.text.primary} font-semibold mb-2 text-sm`}>
                      Preparation Notes from Mentor
                    </h4>
                    <p className={`${theme.text.secondary} text-sm`}>
                      {selectedSlot.preparation_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedSlot(null);
                  setSelectedCompany('');
                  setSelectedTrack('');
                  setSpecificTopics([]);
                  setAdditionalNotes('');
                }}
                variant="outline"
                className={`flex-1 ${theme.button.secondary}`}
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Slots
              </Button>
              <Button
                onClick={handleBooking}
                disabled={loading || !selectedCompany || !selectedTrack}
                className="flex-1 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ImprovedBookingFlow;
