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
      
      // If slot has company specializations, filter to only those
      // Otherwise, show all companies (mentor can help with any company)
      const hasSpecializations = slot.company_specializations && slot.company_specializations.length > 0;
      
      const filteredCompanies = hasSpecializations
        ? response.data.filter(company => slot.company_specializations.includes(company.id))
        : response.data;
      
      setCompanies(filteredCompanies);
      
      if (filteredCompanies.length === 0) {
        toast.error('No companies available for this slot');
      }
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

      console.log('📤 Booking data being sent:', bookingData);
      console.log('📤 Data types:', {
        slot_id: typeof slot.id,
        company_id: typeof selectedCompany,
        interview_track: typeof selectedTrack,
        specific_topics: Array.isArray(specificTopics),
        additional_notes: typeof additionalNotes
      });

      const response = await api.post('/mentee/bookings', bookingData);
      
      toast.success('Booking confirmed!', {
        description: 'You will receive a confirmation email with mentor details shortly.'
      });
      
      onSuccess();
    } catch (error) {
      console.error('❌ Booking error:', error);
      console.error('❌ Error response:', error.response?.data);
      
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
            <Label className={`${theme.text.primary} font-semibold text-base`}>
              <Building2 className="w-4 h-4 inline mr-2" />
              Which company are you preparing for? *
            </Label>
            {companies.length > 0 && (
              <p className={`${theme.text.muted} text-xs mb-2`}>
                {slot.company_specializations && slot.company_specializations.length > 0
                  ? `${companies.length} ${companies.length === 1 ? 'company' : 'companies'} available for this mentor's expertise`
                  : 'This mentor can help with any company'}
              </p>
            )}
            <Select
              value={selectedCompany}
              onValueChange={setSelectedCompany}
              disabled={loadingCompanies || isFreeUser || companies.length === 0}
            >
              <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary} h-12 text-base`}>
                <SelectValue placeholder={
                  loadingCompanies ? "Loading..." : 
                  companies.length === 0 ? "No companies available" :
                  "Select company (e.g., Amazon, Google, Microsoft)"
                } />
              </SelectTrigger>
              <SelectContent className={`${theme.bg.card} ${theme.border.primary} max-h-[300px]`}>
                {companies.map((company) => (
                  <SelectItem 
                    key={company.id} 
                    value={company.id}
                    className={`${theme.text.secondary} text-base py-3`}
                  >
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interview Track Selection */}
          {selectedCompany && availableTracks.length > 0 && (
            <div className="space-y-2">
              <Label className={`${theme.text.primary} font-semibold text-base`}>
                What level are you targeting? *
              </Label>
              <Select
                value={selectedTrack}
                onValueChange={setSelectedTrack}
                disabled={isFreeUser}
              >
                <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary} h-12 text-base`}>
                  <SelectValue placeholder="Select level (e.g., SDE-2, L4, Senior)" />
                </SelectTrigger>
                <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                  {availableTracks.map((track) => (
                    <SelectItem 
                      key={track} 
                      value={track}
                      className={`${theme.text.secondary} text-base py-3`}
                    >
                      {track.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Simplified Interview Track for companies without tracks */}
          {selectedCompany && availableTracks.length === 0 && (
            <div className="space-y-2">
              <Label className={`${theme.text.primary} font-semibold text-base`}>
                Interview Level *
              </Label>
              <Select
                value={selectedTrack}
                onValueChange={setSelectedTrack}
                disabled={isFreeUser}
              >
                <SelectTrigger className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary} h-12 text-base`}>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent className={`${theme.bg.card} ${theme.border.primary}`}>
                  <SelectItem value="entry_level" className={`${theme.text.secondary} text-base py-3`}>
                    Entry Level (0-2 years)
                  </SelectItem>
                  <SelectItem value="mid_level" className={`${theme.text.secondary} text-base py-3`}>
                    Mid Level (2-5 years)
                  </SelectItem>
                  <SelectItem value="senior_level" className={`${theme.text.secondary} text-base py-3`}>
                    Senior Level (5-8 years)
                  </SelectItem>
                  <SelectItem value="staff_plus" className={`${theme.text.secondary} text-base py-3`}>
                    Staff+ Level (8+ years)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Specific Topics - Collapsed by default */}
          {availableTopics.length > 0 && (
            <details className="space-y-2">
              <summary className={`${theme.text.secondary} text-sm cursor-pointer hover:text-[#06b6d4] transition-colors`}>
                + Want to focus on specific topics? (Optional)
              </summary>
              <div className="flex flex-wrap gap-2 mt-3">
                {availableTopics.slice(0, 12).map((topic) => (
                  <button
                    key={topic}
                    onClick={() => !isFreeUser && handleTopicToggle(topic)}
                    disabled={isFreeUser}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      specificTopics.includes(topic)
                        ? 'bg-[#06b6d4] text-white'
                        : `${theme.bg.secondary} ${theme.text.secondary} hover:bg-[#06b6d4]/20`
                    } ${isFreeUser ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </details>
          )}

          {/* Additional Notes - Simplified */}
          <div className="space-y-2">
            <Label className={`${theme.text.secondary} text-sm`}>
              Any specific requests or focus areas? (Optional)
            </Label>
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Example: Focus on optimization techniques, need help with communication..."
              rows={3}
              disabled={isFreeUser}
              className={`${theme.bg.secondary} ${theme.border.primary} ${theme.text.primary} text-sm`}
            />
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
