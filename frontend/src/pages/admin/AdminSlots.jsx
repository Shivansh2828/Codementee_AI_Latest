import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import { 
  Calendar, 
  Clock, 
  Edit, 
  RefreshCw,
  Video,
  User,
  Briefcase,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp
} from "lucide-react";
import api from "../../utils/api";

const AdminSlots = () => {
  const { theme } = useTheme();
  const [mockSlots, setMockSlots] = useState([]);
  const [resumeSlots, setResumeSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [createForm, setCreateForm] = useState({
    mentor_id: '',
    slot_type: 'mock', // mock or resume
    date: '',
    start_time: '',
    end_time: '',
    meeting_link: '',
    interview_types: [],
    experience_levels: [],
    company_specializations: []
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [mentorFilter, setMentorFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [mentors, setMentors] = useState([]);
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching admin slots data...');
      
      const [mockRes, resumeRes, mentorsRes, companiesRes] = await Promise.all([
        api.get('/admin/all-slots'),
        api.get('/admin/all-resume-slots'),
        api.get('/admin/mentors'),
        api.get('/companies')
      ]);
      
      console.log('✅ Mock slots:', mockRes.data?.length || 0);
      console.log('✅ Resume slots:', resumeRes.data?.length || 0);
      console.log('✅ Mentors:', mentorsRes.data?.length || 0);
      
      setMockSlots(mockRes.data || []);
      setResumeSlots(resumeRes.data || []);
      setMentors(mentorsRes.data || []);
      setCompanies(companiesRes.data || []);
      
      // Fetch bookings separately to avoid blocking if it fails
      try {
        const bookingsRes = await api.get('/admin/bookings');
        console.log('✅ Bookings:', bookingsRes.data?.length || 0);
        setBookings(bookingsRes.data || []);
      } catch (err) {
        console.log('⚠️ Could not fetch bookings:', err);
        setBookings([]);
      }
    } catch (error) {
      console.error('❌ Failed to load slots:', error);
      toast.error('Failed to load slots: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const allSlots = [...mockSlots.map(s => ({...s, type: 'mock'})), ...resumeSlots.map(s => ({...s, type: 'resume'}))];

  const stats = {
    total: allSlots.length,
    available: allSlots.filter(s => s.status === 'available').length,
    booked: allSlots.filter(s => s.status === 'booked').length,
    completed: allSlots.filter(s => s.status === 'completed').length
  };

  // Mentor activity stats
  const mentorStats = mentors.map(mentor => {
    const mentorSlots = allSlots.filter(s => s.mentor_id === mentor.id);
    const bookedSlots = mentorSlots.filter(s => s.status === 'booked' || s.status === 'completed');
    return {
      ...mentor,
      totalSlots: mentorSlots.length,
      bookedSlots: bookedSlots.length,
      utilizationRate: mentorSlots.length > 0 ? ((bookedSlots.length / mentorSlots.length) * 100).toFixed(1) : 0
    };
  }).sort((a, b) => b.totalSlots - a.totalSlots);

  // Recent slot activity (last 10 slots created)
  const recentSlots = [...allSlots]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  const handleCreateSlot = async () => {
    try {
      await api.post('/admin/create-slot', createForm);
      toast.success('Slot created successfully');
      setCreateDialog(false);
      setCreateForm({
        mentor_id: '',
        slot_type: 'mock',
        date: '',
        start_time: '',
        end_time: '',
        meeting_link: '',
        interview_types: [],
        experience_levels: [],
        company_specializations: []
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create slot');
    }
  };

  const handleEditSlot = (slot) => {
    setEditDialog(slot);
    setEditForm({
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      meeting_link: slot.meeting_link,
      status: slot.status,
      interview_types: slot.interview_types || [],
      experience_levels: slot.experience_levels || [],
      company_specializations: slot.company_specializations || [],
      preparation_notes: slot.preparation_notes || ''
    });
  };

  const handleUpdateSlot = async () => {
    try {
      const endpoint = editDialog.type === 'resume' 
        ? `/admin/resume-slots/${editDialog.id}`
        : `/admin/slots/${editDialog.id}`;
      
      await api.patch(endpoint, editForm);
      toast.success('Slot updated successfully');
      setEditDialog(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to update slot');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      available: 'bg-green-400/20 text-green-400 border-green-400/30',
      booked: 'bg-blue-400/20 text-blue-400 border-blue-400/30',
      completed: 'bg-gray-400/20 text-gray-400 border-gray-400/30',
      cancelled: 'bg-red-400/20 text-red-400 border-red-400/30'
    };
    return colors[status] || colors.available;
  };

  const filterSlots = (slots) => {
    return slots.filter(slot => {
      if (statusFilter !== 'all' && slot.status !== statusFilter) return false;
      if (mentorFilter !== 'all' && slot.mentor_id !== mentorFilter) return false;
      if (typeFilter !== 'all' && slot.type !== typeFilter) return false;
      return true;
    });
  };

  const getBookingForSlot = (slotId) => {
    return bookings.find(b => b.slot_id === slotId);
  };

  const renderSlotCard = (slot) => {
    const booking = getBookingForSlot(slot.id);
    
    return (
      <div key={slot.id} className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-[#06b6d4]" />
            <div>
              <p className={`${theme.text.primary} font-semibold`}>{slot.mentor_name}</p>
              <p className={`${theme.text.muted} text-sm`}>{slot.mentor_email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={slot.type === 'mock' ? 'bg-blue-400/20 text-blue-400' : 'bg-purple-400/20 text-purple-400'}>
              {slot.type === 'mock' ? 'Mock Interview' : 'Resume Review'}
            </Badge>
            <Badge className={getStatusBadge(slot.status)}>
              {slot.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={theme.text.secondary}>{slot.date}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className={theme.text.secondary}>{slot.start_time} - {slot.end_time}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-gray-400" />
            <span className={`${theme.text.secondary} text-sm truncate`}>{slot.meeting_link}</span>
          </div>

          {slot.type === 'mock' && slot.interview_types && slot.interview_types.length > 0 && (
            <div className="flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-gray-400 mt-1" />
              <div className="flex flex-wrap gap-1">
                {slot.interview_types.map(type => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {booking && (
            <div className={`mt-4 p-3 rounded-lg ${theme.bg.secondary} border ${theme.border.primary}`}>
              <p className={`${theme.text.primary} text-sm font-semibold mb-1`}>Booked by:</p>
              <p className={`${theme.text.secondary} text-sm`}>{booking.mentee_name}</p>
              <p className={`${theme.text.muted} text-xs`}>{booking.mentee_email}</p>
              <p className={`${theme.text.secondary} text-sm mt-2`}>Company: {booking.company_name}</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <Button
            onClick={() => handleEditSlot(slot)}
            size="sm"
            className="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Slot
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout title="Slot Management">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-[#06b6d4]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Slot Management">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border`}>
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-400" />
              <div>
                <p className={`${theme.text.muted} text-sm`}>Total Slots</p>
                <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border`}>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div>
                <p className={`${theme.text.muted} text-sm`}>Available</p>
                <p className="text-2xl font-bold text-green-400">{stats.available}</p>
              </div>
            </div>
          </div>
          
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border`}>
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-cyan-400" />
              <div>
                <p className={`${theme.text.muted} text-sm`}>Booked</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.booked}</p>
              </div>
            </div>
          </div>
          
          <div className={`${theme.glass} rounded-xl p-4 ${theme.border.primary} border`}>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div>
                <p className={`${theme.text.muted} text-sm`}>Completed</p>
                <p className="text-2xl font-bold text-purple-400">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Create Button */}
        <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#06b6d4]" />
              <h3 className={`${theme.text.primary} font-semibold`}>Filters</h3>
            </div>
            <Button
              onClick={() => setCreateDialog(true)}
              className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Slot
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className={theme.text.primary}>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={`${theme.input} mt-2`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={theme.bg.card}>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className={theme.text.primary}>Mentor</Label>
              <Select value={mentorFilter} onValueChange={setMentorFilter}>
                <SelectTrigger className={`${theme.input} mt-2`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={theme.bg.card}>
                  <SelectItem value="all">All Mentors</SelectItem>
                  {mentors.map(mentor => (
                    <SelectItem key={mentor.id} value={mentor.id}>
                      {mentor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={theme.text.primary}>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className={`${theme.input} mt-2`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={theme.bg.card}>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mock">Mock Interview</SelectItem>
                  <SelectItem value="resume">Resume Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Slots Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Slots List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className={`${theme.text.primary} font-semibold text-lg mb-4`}>
              All Slots ({filterSlots(allSlots).length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterSlots(allSlots).map(slot => renderSlotCard(slot))}
            </div>
            {filterSlots(allSlots).length === 0 && (
              <div className={`${theme.glass} rounded-xl p-12 ${theme.border.primary} border text-center`}>
                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className={theme.text.muted}>No slots found</p>
              </div>
            )}
          </div>

          {/* Sidebar - Mentor Activity & Recent Slots */}
          <div className="space-y-6">
            {/* Mentor Activity */}
            <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
              <h3 className={`${theme.text.primary} font-semibold mb-4`}>Mentor Activity</h3>
              <div className="space-y-3">
                {mentorStats.slice(0, 5).map(mentor => (
                  <div key={mentor.id} className={`p-3 rounded-lg ${theme.bg.secondary}`}>
                    <div className="flex justify-between items-start mb-2">
                      <p className={`${theme.text.primary} font-medium text-sm`}>{mentor.name}</p>
                      <Badge className="bg-[#06b6d4]/20 text-[#06b6d4] text-xs">
                        {mentor.utilizationRate}% booked
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={theme.text.muted}>Total: {mentor.totalSlots}</span>
                      <span className={theme.text.muted}>Booked: {mentor.bookedSlots}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Slot Activity */}
            <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border`}>
              <h3 className={`${theme.text.primary} font-semibold mb-4`}>Recent Activity</h3>
              <div className="space-y-3">
                {recentSlots.map(slot => (
                  <div key={slot.id} className={`p-3 rounded-lg ${theme.bg.secondary} border-l-2 ${
                    slot.type === 'mock' ? 'border-blue-400' : 'border-purple-400'
                  }`}>
                    <div className="flex items-start justify-between mb-1">
                      <p className={`${theme.text.primary} text-sm font-medium`}>{slot.mentor_name}</p>
                      <Badge className={getStatusBadge(slot.status)} style={{fontSize: '10px', padding: '2px 6px'}}>
                        {slot.status}
                      </Badge>
                    </div>
                    <p className={`${theme.text.muted} text-xs`}>
                      {slot.type === 'mock' ? '🎯 Mock' : '📄 Resume'} • {slot.date} • {slot.start_time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create Slot Dialog */}
        {createDialog && (
          <Dialog open={createDialog} onOpenChange={setCreateDialog}>
            <DialogContent className={`${theme.glass} ${theme.border.primary} border max-w-2xl`}>
              <DialogHeader>
                <DialogTitle className={theme.text.primary}>Create New Slot</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className={theme.text.primary}>Mentor</Label>
                    <Select value={createForm.mentor_id} onValueChange={(val) => setCreateForm({...createForm, mentor_id: val})}>
                      <SelectTrigger className={`${theme.input} mt-2`}>
                        <SelectValue placeholder="Select mentor" />
                      </SelectTrigger>
                      <SelectContent className={theme.bg.card}>
                        {mentors.map(mentor => (
                          <SelectItem key={mentor.id} value={mentor.id}>
                            {mentor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className={theme.text.primary}>Slot Type</Label>
                    <Select value={createForm.slot_type} onValueChange={(val) => setCreateForm({...createForm, slot_type: val})}>
                      <SelectTrigger className={`${theme.input} mt-2`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={theme.bg.card}>
                        <SelectItem value="mock">Mock Interview (60 min)</SelectItem>
                        <SelectItem value="resume">Resume Review (30 min)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className={theme.text.primary}>Date</Label>
                    <Input
                      type="date"
                      value={createForm.date}
                      onChange={(e) => setCreateForm({...createForm, date: e.target.value})}
                      className={`${theme.input} mt-2`}
                    />
                  </div>
                  
                  <div>
                    <Label className={theme.text.primary}>Start Time</Label>
                    <Input
                      type="time"
                      value={createForm.start_time}
                      onChange={(e) => setCreateForm({...createForm, start_time: e.target.value})}
                      className={`${theme.input} mt-2`}
                    />
                  </div>
                  
                  <div>
                    <Label className={theme.text.primary}>End Time</Label>
                    <Input
                      type="time"
                      value={createForm.end_time}
                      onChange={(e) => setCreateForm({...createForm, end_time: e.target.value})}
                      className={`${theme.input} mt-2`}
                    />
                  </div>
                </div>

                <div>
                  <Label className={theme.text.primary}>Meeting Link</Label>
                  <Input
                    value={createForm.meeting_link}
                    onChange={(e) => setCreateForm({...createForm, meeting_link: e.target.value})}
                    className={`${theme.input} mt-2`}
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialog(false)}
                    className={theme.button.secondary}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSlot}
                    className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                  >
                    Create Slot
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Slot Dialog */}
        {editDialog && (
          <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
            <DialogContent className={`${theme.glass} ${theme.border.primary} border max-w-2xl`}>
              <DialogHeader>
                <DialogTitle className={theme.text.primary}>
                  Edit {editDialog.type === 'resume' ? 'Resume Review' : 'Mock Interview'} Slot
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className={theme.text.primary}>Date</Label>
                    <Input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                      className={`${theme.input} mt-2`}
                    />
                  </div>
                  
                  <div>
                    <Label className={theme.text.primary}>Start Time</Label>
                    <Input
                      type="time"
                      value={editForm.start_time}
                      onChange={(e) => setEditForm({...editForm, start_time: e.target.value})}
                      className={`${theme.input} mt-2`}
                    />
                  </div>
                  
                  <div>
                    <Label className={theme.text.primary}>End Time</Label>
                    <Input
                      type="time"
                      value={editForm.end_time}
                      onChange={(e) => setEditForm({...editForm, end_time: e.target.value})}
                      className={`${theme.input} mt-2`}
                    />
                  </div>
                </div>

                <div>
                  <Label className={theme.text.primary}>Meeting Link</Label>
                  <Input
                    value={editForm.meeting_link}
                    onChange={(e) => setEditForm({...editForm, meeting_link: e.target.value})}
                    className={`${theme.input} mt-2`}
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                <div>
                  <Label className={theme.text.primary}>Status</Label>
                  <Select value={editForm.status} onValueChange={(val) => setEditForm({...editForm, status: val})}>
                    <SelectTrigger className={`${theme.input} mt-2`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={theme.bg.card}>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {editDialog.type === 'mock' && (
                  <div>
                    <Label className={theme.text.primary}>Preparation Notes</Label>
                    <Input
                      value={editForm.preparation_notes}
                      onChange={(e) => setEditForm({...editForm, preparation_notes: e.target.value})}
                      className={`${theme.input} mt-2`}
                      placeholder="Any special notes..."
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setEditDialog(null)}
                    className={theme.button.secondary}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateSlot}
                    className="bg-[#06b6d4] hover:bg-[#0891b2] text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSlots;
