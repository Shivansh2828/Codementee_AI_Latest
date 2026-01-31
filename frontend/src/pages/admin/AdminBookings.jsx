import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { ClipboardList, Clock, CheckCircle, XCircle, Building2, User, Calendar, MessageSquare } from 'lucide-react';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { toast } from "sonner";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [assigningBooking, setAssigningBooking] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, mentorsRes] = await Promise.all([
        api.get('/admin/booking-requests'),
        api.get('/admin/mentors')
      ]);
      setBookings(bookingsRes.data);
      setMentors(mentorsRes.data);
    } catch (e) {
      console.error('Failed to fetch data:', e);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  const handleAssignMentor = async () => {
    if (!selectedMentor || !selectedSlot) {
      toast.error('Please select both mentor and slot');
      return;
    }

    setProcessing(true);
    try {
      await api.post('/admin/confirm-booking', {
        booking_request_id: assigningBooking.id,
        mentor_id: selectedMentor,
        confirmed_slot_id: selectedSlot
      });

      toast.success('Booking confirmed and mentor assigned!');
      setAssigningBooking(null);
      setSelectedMentor('');
      setSelectedSlot('');
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Failed to assign mentor:', error);
      toast.error(error.response?.data?.detail || 'Failed to assign mentor');
    }
    setProcessing(false);
  };

  const openAssignDialog = (booking) => {
    setAssigningBooking(booking);
    setSelectedMentor('');
    setSelectedSlot('');
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400"><CheckCircle size={12} /> Confirmed</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400"><Clock size={12} /> Pending</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500/20 text-red-400"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="text-slate-400 text-xs">{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <DashboardLayout title="Booking Requests">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
          <p className="text-slate-400 text-sm">Total Requests</p>
          <p className="text-2xl font-bold text-white">{bookings.length}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
          <p className="text-slate-400 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-400">{confirmedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'confirmed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-[#06b6d4] text-[#0f172a]' : 'bg-[#1e293b] text-slate-300 hover:bg-[#334155]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <p className="text-slate-400 text-center py-8">Loading...</p>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-8 text-center">
          <ClipboardList size={48} className="mx-auto text-slate-500 mb-4" />
          <p className="text-slate-400">No booking requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="bg-[#1e293b] border-[#334155]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-400" />
                    {booking.company_name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(booking.status)}
                    {booking.status === 'pending' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]"
                            onClick={() => openAssignDialog(booking)}
                          >
                            <User className="w-4 h-4 mr-1" />
                            Assign Mentor
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1e293b] border-[#334155] text-white">
                          <DialogHeader>
                            <DialogTitle>Assign Mentor & Confirm Booking</DialogTitle>
                            <DialogDescription className="text-slate-400">
                              Select a mentor and confirm the time slot for {booking.mentee_name}'s interview with {booking.company_name}.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {/* Mentor Selection */}
                            <div>
                              <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Select Mentor
                              </label>
                              <Select value={selectedMentor} onValueChange={setSelectedMentor}>
                                <SelectTrigger className="bg-[#0f172a] border-[#334155] text-white">
                                  <SelectValue placeholder="Choose a mentor" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e293b] border-[#334155]">
                                  {mentors.map((mentor) => (
                                    <SelectItem key={mentor.id} value={mentor.id} className="text-white hover:bg-[#334155]">
                                      {mentor.name} ({mentor.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Slot Selection */}
                            <div>
                              <label className="text-sm font-medium text-slate-300 mb-2 block">
                                Confirm Time Slot
                              </label>
                              <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                                <SelectTrigger className="bg-[#0f172a] border-[#334155] text-white">
                                  <SelectValue placeholder="Choose preferred slot" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e293b] border-[#334155]">
                                  {booking.preferred_slots?.map((slot) => (
                                    <SelectItem key={slot.id} value={slot.id} className="text-white hover:bg-[#334155]">
                                      {slot.date} at {slot.start_time} - {slot.end_time}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Interview Details */}
                            <div className="bg-[#0f172a] rounded-lg p-3">
                              <h4 className="text-sm font-medium text-slate-300 mb-2">Interview Details</h4>
                              <div className="space-y-1 text-sm text-slate-400">
                                <p><span className="text-slate-300">Type:</span> {booking.interview_type?.replace('_', ' ')}</p>
                                <p><span className="text-slate-300">Level:</span> {booking.experience_level}</p>
                                {booking.interview_track && booking.interview_track !== 'general' && (
                                  <p><span className="text-slate-300">Track:</span> {booking.interview_track}</p>
                                )}
                                {booking.specific_topics && booking.specific_topics.length > 0 && (
                                  <p><span className="text-slate-300">Focus:</span> {booking.specific_topics.join(', ')}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button 
                              onClick={handleAssignMentor}
                              disabled={processing || !selectedMentor || !selectedSlot}
                              className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-[#0f172a]"
                            >
                              {processing ? 'Confirming...' : 'Confirm Booking'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-400" />
                      Mentee Details
                    </h4>
                    <div className="space-y-1">
                      <p className="text-slate-300 text-sm">
                        <span className="text-slate-400">Name:</span> {booking.mentee_name}
                      </p>
                      <p className="text-slate-300 text-sm">
                        <span className="text-slate-400">Email:</span> {booking.mentee_email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-400" />
                      Interview Details
                    </h4>
                    <div className="space-y-1">
                      <p className="text-slate-300 text-sm">
                        <span className="text-slate-400">Type:</span> {booking.interview_type?.replace('_', ' ')}
                      </p>
                      <p className="text-slate-300 text-sm">
                        <span className="text-slate-400">Level:</span> {booking.experience_level}
                      </p>
                      {booking.interview_track && booking.interview_track !== 'general' && (
                        <p className="text-slate-300 text-sm">
                          <span className="text-slate-400">Track:</span> {booking.interview_track}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assigned Mentor (for confirmed bookings) */}
                {booking.status === 'confirmed' && booking.mentor_name && (
                  <div>
                    <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      Assigned Mentor
                    </h4>
                    <p className="text-slate-300 text-sm">
                      {booking.mentor_name} ({booking.mentor_email})
                    </p>
                  </div>
                )}

                {/* Preferred Slots */}
                <div>
                  <h4 className="text-white font-medium text-sm mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    {booking.status === 'confirmed' ? 'Confirmed Slot' : 'Preferred Slots'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {booking.status === 'confirmed' && booking.confirmed_slot ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {booking.confirmed_slot.date} at {booking.confirmed_slot.start_time} - {booking.confirmed_slot.end_time}
                      </Badge>
                    ) : (
                      booking.preferred_slots?.map((slot, i) => (
                        <Badge key={i} className="bg-[#0f172a] text-slate-300 border-slate-600">
                          {slot.date} at {slot.start_time} - {slot.end_time}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                {/* Focus Areas */}
                {booking.specific_topics && booking.specific_topics.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium text-sm mb-2">Focus Areas</h4>
                    <div className="flex flex-wrap gap-1">
                      {booking.specific_topics.map((topic, index) => (
                        <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                {booking.additional_notes && (
                  <div>
                    <h4 className="text-white font-medium text-sm mb-2">Additional Notes</h4>
                    <p className="text-slate-300 text-sm bg-[#0f172a] rounded p-2">
                      {booking.additional_notes}
                    </p>
                  </div>
                )}

                {/* Meeting Link (for confirmed bookings) */}
                {booking.meeting_link && (
                  <div className="pt-2 border-t border-[#334155]">
                    <a 
                      href={booking.meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#06b6d4] hover:underline text-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      Join Meeting
                    </a>
                  </div>
                )}

                <div className="pt-2 border-t border-[#334155] text-right">
                  <p className="text-slate-400 text-xs">
                    Requested: {formatDate(booking.created_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminBookings;
