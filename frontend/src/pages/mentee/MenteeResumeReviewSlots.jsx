import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Phone,
  ArrowLeft,
  Send
} from "lucide-react";
import api from "../../utils/api";

const MenteeResumeReviewSlots = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get('request_id');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestingSlots, setRequestingSlots] = useState(false);
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    if (!requestId) {
      toast.error('No resume request found');
      navigate('/mentee/resume-review');
      return;
    }
    fetchAvailableSlots();
  }, [requestId]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get('/mentee/available-resume-review-slots');
      setSlots(response.data);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      toast.error('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slotId) => {
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slotId));
    } else {
      if (selectedSlots.length >= 2) {
        toast.error('You can select up to 2 preferred slots');
        return;
      }
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  const handleRequestMoreSlots = async () => {
    setRequestingSlots(true);
    try {
      await api.post('/mentee/request-resume-review-slots', {
        resume_request_id: requestId,
        mentee_name: user?.name,
        mentee_email: user?.email
      });
      
      toast.success('Request sent! Admin and mentors have been notified. We will create more slots soon.');
      setTimeout(() => {
        navigate('/mentee/resume-review');
      }, 2000);
    } catch (error) {
      console.error('Failed to request slots:', error);
      toast.error('Failed to send request. Please try again or contact support.');
    } finally {
      setRequestingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedSlots.length === 0) {
      toast.error('Please select at least 1 preferred slot');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/mentee/resume-review-booking', {
        resume_request_id: requestId,
        preferred_slot_ids: selectedSlots,
        additional_notes: additionalNotes
      });

      toast.success('Booking request submitted! We will confirm your slot within 24 hours.');
      setTimeout(() => {
        navigate('/mentee/resume-review');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit booking:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  const groupSlotsByDate = () => {
    const grouped = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Select Time Slot">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6d4] mx-auto mb-4"></div>
            <p className={theme.text.secondary}>Loading available slots...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const groupedSlots = groupSlotsByDate();

  return (
    <DashboardLayout title="Select Time Slot">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/mentee/resume-review')}
            className={theme.button.secondary}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className={`${theme.text.primary} text-2xl font-bold`}>
              Select Your Preferred Time Slot
            </h2>
            <p className={theme.text.secondary}>
              Choose 1-2 preferred slots for your 30-minute resume review call
            </p>
          </div>
        </div>

        {/* Selection Info */}
        <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Phone className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className={`${theme.text.primary} font-semibold`}>30-Minute Resume Review Call</p>
                  <p className={`${theme.text.muted} text-sm`}>Live feedback with a MAANG engineer</p>
                </div>
              </div>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {selectedSlots.length} / 2 selected
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Available Slots */}
        {Object.keys(groupedSlots).length === 0 ? (
          <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
            <CardContent className="p-12 text-center">
              <Calendar className={`w-16 h-16 ${theme.text.muted} mx-auto mb-4`} />
              <h3 className={`${theme.text.primary} text-xl font-bold mb-2`}>
                No Slots Available Right Now
              </h3>
              <p className={`${theme.text.secondary} mb-6`}>
                We don't have any available slots at the moment. Request more slots and we'll notify you when they're available.
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/mentee/resume-review')}
                  className={theme.button.secondary}
                >
                  Go Back
                </Button>
                <Button
                  onClick={handleRequestMoreSlots}
                  disabled={requestingSlots}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
                  {requestingSlots ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Request More Slots
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {Object.entries(groupedSlots).sort().map(([date, dateSlots]) => (
              <Card key={date} className={`${theme.bg.card} ${theme.border.primary} border`}>
                <CardHeader>
                  <CardTitle className={theme.text.primary}>
                    <Calendar className="w-5 h-5 inline mr-2" />
                    {formatDate(date)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {dateSlots.map((slot) => {
                      const isSelected = selectedSlots.includes(slot.id);
                      return (
                        <button
                          key={slot.id}
                          onClick={() => handleSlotSelect(slot.id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-purple-500 bg-purple-500/10'
                              : `${theme.border.primary} ${theme.bg.secondary} hover:border-purple-500/50`
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className={`w-4 h-4 ${isSelected ? 'text-purple-400' : theme.text.muted}`} />
                              <span className={`font-semibold ${isSelected ? 'text-purple-400' : theme.text.primary}`}>
                                {slot.start_time}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-purple-400" />
                            )}
                          </div>
                          <p className={`text-sm ${theme.text.muted}`}>
                            30 minutes
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Additional Notes */}
            <Card className={`${theme.bg.card} ${theme.border.primary} border`}>
              <CardHeader>
                <CardTitle className={theme.text.primary}>Additional Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any specific topics you'd like to focus on during the call..."
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg ${theme.input.base} transition-colors resize-none`}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/mentee/resume-review')}
                disabled={submitting}
                className={theme.button.secondary}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || selectedSlots.length === 0}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8"
              >
                {submitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Booking Request
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenteeResumeReviewSlots;
