import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
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
  X
} from "lucide-react";
import api from "../../utils/api";

const BookingModal = ({ slot, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [specificTopics, setSpecificTopics] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [availableTracks, setAvailableTracks] = useState([]);

  // Check if user is free tier
  const isFreeUser = user?.status === 'Free' || !user?.plan_id;

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const company = companies.find(c => c.id === selectedCompany);
      if (company && company.interview_tracks) {
        setAvailableTracks(company.interview_tracks);
      } else {
        setAvailableTracks([]);
      }
      setSelectedTrack(''); // Reset track when company changes
    }
  }, [selectedCompany, companies]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      // Filter companies to only those in slot's specializations
      const slotCompanyIds = slot.company_specializations.map(c => 
        typeof c === 'string' ? c : c.id
      );
      const filteredCompanies = response.data.filter(c => 
        slotCompanyIds.includes(c.id)
      );
      setCompanies(filteredCompanies);
    } catch (error) {
      toast.error('Failed to load companies');
      console.error('Fetch companies error:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleTopicToggle = (topic) => {
    setSpecificTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleBooking = async () => {
    // Validation
    if (!selectedCompany) {
      toast.error('Please select a company');
      return;
    }

    if (!selectedTrack) {
      toast.error('Please select an interview track');
      return;
    }

    // Check if free user
    if (isFreeUser) {
      toast.error('Please upgrade to a paid plan to book interviews', {
        description: 'You need an active subscription to book mock interviews.',
        action: {
          label: 'Upgrade Now',
          onClick: () => window.location.href = '/mentee/book'
        }
      });
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        slot_id: slot.id,
        company_id: selectedCompany,
        interview_track: selectedTrack,
        specific_topics: specificTopics,
        additional_notes: additionalNotes
      };

      const response = await api.post('/mentee/bookings', bookingData);
      
      toast.success('Booking confirmed!', {
        description: 'You will receive a confirmation email with mentor details shortly.'
      });
      
      onSuccess();
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.code === 'TIER_UPGRADE_REQUIRED') {
        toast.error('Upgrade required', {
          description: errorData.message,
          action: {
            label: 'Upgrade Now',
            onClick: () => window.location.href = '/mentee/book'
          }
        });
      } else if (errorData?.code === 'SLOT_ALREADY_BOOKED') {
        toast.error('Slot no longer available', {
          description: 'This slot was just booked by another user. Please select a different slot.'
        });
        onSuccess(); // Refresh the slots list
      } else if (errorData?.code === 'INTERVIEW_QUOTA_EXCEEDED') {
        toast.error('Interview quota exceeded', {
          description: 'You have used all interviews in your plan. Please upgrade to continue.'
        });
      } else if (errorData?.code === 'CANCELLATION_POLICY_VIOLATION') {
        toast.error('Booking not allowed', {
          description: errorData.message
        });
      } else {
        toast.error('Booking failed', {
          description: errorData?.message || 'An error occurred while booking the slot.'
        });
      }
      
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
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

  // Common topics by interview type
  const topicsByType = {
    coding: [
      'Arrays & Strings',
      'Linked Lists',
      'Trees & Graphs',
      'Dynamic Programming',
      'Recursion & Backtracking',
      'Sorting & Searching',
      'Hash Tables',
      'Stacks & Queues'
    ],
    system_design: [
      'Scalability',
      'Load Balancing',
      'Caching',
      'Database Design',
      'Microservices',
      'API Design',
      'Distributed Systems',
      'Message Queues'
    ],
    behavioral: [
      'Leadership',
      'Teamwork',
      'Conflict Resolution',
      'Project Management',
      'Communication',
      'Problem Solving',
      'Adaptability',
      'Time Management'
    ],
    hr_round: [
      'Career Goals',
      'Salary Negotiation',
      'Company Culture',
      'Work-Life Balance',
      'Strengths & Weaknesses',
      'Why This Company',
      'Previous Experience',
      'Future Plans'
    ]
  };

  const availableTopics = slot.interview_types.flatMap(type => 
    topicsByType[type] || []
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${theme.bg.card} ${theme.border.primary} border max-w-2xl max-h-[90vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className={`${theme.text.primary} text-2xl flex items-center gap-2`}>
            <CheckCircle className="w-6 h-6 text-[#06b6d4]" />
            Book Interview Slot
          </DialogTitle>
          <DialogDescription className={theme.text.secondary}>
            Complete the details below to confirm your booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Slot Details Summary */}
          <div className={`${theme.bg.secondary} rounded-xl p-4 ${theme.border.primary} border`}>
            <h3 className={`${theme.text.primary} font-semibold mb-3 flex items-center gap-2`}>
              <Calendar className="w-4 h-4 text-[#06b6d4]" />
              Selected Slot
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`${theme.text.muted} text-xs mb-1`}>Date</p>
                <p className={`${theme.text.primary} text-sm font-medium`}>
                  {formatDate(slot.date)}
                </p>
              </div>
              <div>
                <p className={`${theme.text.muted} text-xs mb-1`}>Time</p>
                <p className={`${theme.text.primary} text-sm font-medium flex items-center gap-1`}>
                  <Clock className="w-3 h-3" />
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {slot.interview_types.map((type) => (
                <Badge key={type} className="bg-blue-400/20 text-blue-400 border-blue-400/30 text-xs">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {type.replace('_', ' ')}
                </Badge>
              ))}
              {slot.experience_levels.map((level) => (
                <Badge key={level} className="bg-teal-400/20 text-teal-400 border-teal-400/30 text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {level.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Free User Warning */}
          {isFreeUser && (
            <div className={`${theme.bg.secondary} rounded-xl p-4 border-2 border-yellow-500/30`}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className={`${theme.text.primary} font-semibold mb-1`}>Upgrade Required</p>
                  <p className={`${theme.text.secondary} text-sm mb-3`}>
                    You need an active paid subscription to book mock interviews. 
                    Upgrade now to access this feature.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/mentee/book'}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm"
                  >
                    View Plans & Upgrade
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Company Selection */}
          <div className="space-y-2">
            <Label className={theme.text.secondary}>
              <Building2 className="w-4 h-4 inline mr-1" />
              Select Company *
            </Label>
            <Select
              value={selectedCompany}
              onValueChange={setSelectedCompany}
              disabled={loadingCompanies || isFreeUser}
            >
              <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}>
                <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Choose a company"} />
              </SelectTrigger>
              <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                {companies.map((company) => (
                  <SelectItem 
                    key={company.id} 
                    value={company.id}
                    className={theme.text.secondary}
                  >
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className={`${theme.text.muted} text-xs`}>
              Select from companies this mentor specializes in
            </p>
          </div>

          {/* Interview Track Selection */}
          {selectedCompany && (
            <div className="space-y-2">
              <Label className={theme.text.secondary}>
                Interview Track *
              </Label>
              <Select
                value={selectedTrack}
                onValueChange={setSelectedTrack}
                disabled={isFreeUser}
              >
                <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}>
                  <SelectValue placeholder="Choose interview track" />
                </SelectTrigger>
                <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                  {availableTracks.length === 0 ? (
                    <SelectItem value="general" className={theme.text.secondary}>
                      General
                    </SelectItem>
                  ) : (
                    availableTracks.map((track) => (
                      <SelectItem 
                        key={track} 
                        value={track}
                        className={theme.text.secondary}
                      >
                        {track.toUpperCase()}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className={`${theme.text.muted} text-xs`}>
                Select the specific role level you're targeting
              </p>
            </div>
          )}

          {/* Specific Topics */}
          {availableTopics.length > 0 && (
            <div className="space-y-2">
              <Label className={theme.text.secondary}>
                Specific Topics (Optional)
              </Label>
              <div className="flex flex-wrap gap-2">
                {availableTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => !isFreeUser && handleTopicToggle(topic)}
                    disabled={isFreeUser}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      specificTopics.includes(topic)
                        ? 'bg-[#06b6d4] text-white border-2 border-[#06b6d4]'
                        : `${theme.bg.secondary} ${theme.text.secondary} ${theme.border.primary} border hover:border-[#06b6d4]`
                    } ${isFreeUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <p className={`${theme.text.muted} text-xs`}>
                Select topics you want to focus on during the interview
              </p>
            </div>
          )}

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label className={theme.text.secondary}>
              Additional Notes (Optional)
            </Label>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any specific areas you want to focus on or questions you have..."
              rows={4}
              disabled={isFreeUser}
              className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary}`}
            />
            <p className={`${theme.text.muted} text-xs`}>
              Share any additional context or requirements with your mentor
            </p>
          </div>

          {/* Preparation Notes from Mentor */}
          {slot.preparation_notes && (
            <div className={`${theme.bg.secondary} rounded-xl p-4 ${theme.border.primary} border`}>
              <h4 className={`${theme.text.primary} font-semibold mb-2 text-sm`}>
                Preparation Notes from Mentor
              </h4>
              <p className={`${theme.text.secondary} text-sm`}>
                {slot.preparation_notes}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
            <Button
              onClick={onClose}
              variant="outline"
              className={`flex-1 ${theme.button.secondary}`}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBooking}
              disabled={loading || !selectedCompany || !selectedTrack || isFreeUser}
              className="flex-1 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white hover:from-[#0891b2] hover:to-[#0e7490]"
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
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
