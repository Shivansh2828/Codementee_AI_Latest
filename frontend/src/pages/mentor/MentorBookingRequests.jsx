import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { ClipboardList, Building2, Calendar, Clock, CheckCircle, X, Video } from 'lucide-react';
import { toast } from 'sonner';

const MentorBookingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/mentor/booking-requests');
      setRequests(response.data);
    } catch (e) {
      console.error('Failed to fetch requests:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleConfirm = async (requestId) => {
    if (!selectedSlotId) {
      toast.error('Please select a slot');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await api.post('/mentor/confirm-booking', {
        booking_request_id: requestId,
        confirmed_slot_id: selectedSlotId
      });
      toast.success(`Booking confirmed! Meeting link: ${response.data.meeting_link}`);
      setConfirmingId(null);
      setSelectedSlotId('');
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to confirm booking');
    }
    setSubmitting(false);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Booking Requests">
        <div className="text-center py-12 text-slate-400">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Booking Requests">
      {requests.length === 0 ? (
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-8 text-center">
          <ClipboardList size={48} className="mx-auto text-slate-500 mb-4" />
          <p className="text-slate-400">No pending booking requests</p>
          <p className="text-slate-500 text-sm mt-1">When mentees request mock interviews, they'll appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden" data-testid={`request-${request.id}`}>
              <div className="p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#06b6d4]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 size={24} className="text-[#06b6d4]" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-lg">{request.company_name}</h3>
                      <p className="text-slate-400">
                        Requested by <span className="text-white">{request.mentee_name}</span>
                      </p>
                      <p className="text-slate-500 text-sm">{request.mentee_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-amber-500/20 text-amber-400">
                      <Clock size={14} /> Pending
                    </span>
                    <p className="text-slate-500 text-xs mt-2">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#334155]">
                  <p className="text-slate-400 text-sm mb-3">Mentee's Preferred Slots:</p>
                  <div className="flex flex-wrap gap-3">
                    {request.preferred_slots?.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] rounded-lg border border-[#334155]"
                      >
                        <Calendar size={16} className="text-[#06b6d4]" />
                        <span className="text-white">{formatDate(slot.date)}</span>
                        <Clock size={16} className="text-slate-400 ml-2" />
                        <span className="text-white">{slot.start_time} - {slot.end_time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {confirmingId !== request.id ? (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setConfirmingId(request.id)}
                      className="flex items-center gap-2 bg-[#10b981] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#10b981]/90 transition-colors"
                      data-testid={`confirm-btn-${request.id}`}
                    >
                      <CheckCircle size={18} /> Confirm Booking
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-[#334155] space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Select a slot to confirm *</label>
                      <div className="flex flex-wrap gap-2">
                        {request.preferred_slots?.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                              selectedSlotId === slot.id
                                ? 'bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]'
                                : 'bg-[#0f172a] border-[#334155] text-slate-300 hover:border-[#06b6d4]/50'
                            }`}
                            data-testid={`select-slot-${slot.id}`}
                          >
                            <span>{slot.date}</span>
                            <span>{slot.start_time} - {slot.end_time}</span>
                            {selectedSlotId === slot.id && <CheckCircle size={16} />}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-400 text-sm flex items-center gap-2">
                        <Video size={16} />
                        A Google Meet link will be automatically assigned from the pool
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => {
                          setConfirmingId(null);
                          setSelectedSlotId('');
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                      >
                        <X size={18} /> Cancel
                      </button>
                      <button
                        onClick={() => handleConfirm(request.id)}
                        disabled={submitting || !selectedSlotId}
                        className="flex items-center gap-2 bg-[#10b981] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#10b981]/90 transition-colors disabled:opacity-50"
                        data-testid="submit-confirm-btn"
                      >
                        <CheckCircle size={18} /> {submitting ? 'Confirming...' : 'Confirm & Send Invite'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MentorBookingRequests;
