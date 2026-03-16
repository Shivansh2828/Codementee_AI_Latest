import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Plus,
  Video,
  Copy,
  ExternalLink,
  Edit,
  CheckSquare,
  Square
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Checkbox } from '../../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

const MentorSlotsUnified = () => {
  const { theme } = useTheme();
  const [mockSlots, setMockSlots] = useState([]);
  const [resumeSlots, setResumeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mock');
  
  // Selection for bulk operations
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkMeetingLink, setBulkMeetingLink] = useState('');
  
  // Individual edit
  const [editingSlot, setEditingSlot] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    start_time: '',
    end_time: '',
    meeting_link: ''
  });
  
  // Creation mode: 'single', 'multiple_days', 'recurring'
  const [creationMode, setCreationMode] = useState('single');
  
  // Quick create form
  const [quickForm, setQuickForm] = useState({
    // Single day
    date: '',
    // Multiple days
    start_date: '',
    end_date: '',
    // Recurring
    recurring_days: [], // ['monday', 'tuesday', etc]
    recurring_weeks: 4,
    // Common
    time_slots: ['10:00'], // Array of start times
    meeting_link: '',
    interview_types: ['coding', 'system_design', 'behavioral', 'hr_round'],
    experience_levels: ['junior', 'mid', 'senior', 'staff_plus']
  });
  const [creating, setCreating] = useState(false);

  // Quick date helpers
  const getQuickDate = (type) => {
    const today = new Date();
    switch(type) {
      case 'today':
        return today.toISOString().split('T')[0];
      case 'tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      case 'week':
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return nextWeek.toISOString().split('T')[0];
      default:
        return '';
    }
  };

  // Common time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', 
    '14:00', '15:00', '16:00', '17:00', 
    '18:00', '19:00', '20:00', '21:00'
  ];

  const weekDays = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  const toggleTimeSlot = (time) => {
    if (quickForm.time_slots.includes(time)) {
      setQuickForm({
        ...quickForm,
        time_slots: quickForm.time_slots.filter(t => t !== time)
      });
    } else {
      setQuickForm({
        ...quickForm,
        time_slots: [...quickForm.time_slots, time].sort()
      });
    }
  };

  const toggleRecurringDay = (day) => {
    if (quickForm.recurring_days.includes(day)) {
      setQuickForm({
        ...quickForm,
        recurring_days: quickForm.recurring_days.filter(d => d !== day)
      });
    } else {
      setQuickForm({
        ...quickForm,
        recurring_days: [...quickForm.recurring_days, day]
      });
    }
  };

  useEffect(() => {
    fetchAllSlots();
  }, []);

  const fetchAllSlots = async () => {
    try {
      const [mockRes, resumeRes] = await Promise.all([
        api.get('/mentor/slots'),
        api.get('/mentor/resume-review-slots')
      ]);
      setMockSlots(mockRes.data || []);
      setResumeSlots(resumeRes.data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreate = async () => {
    if (!quickForm.meeting_link || quickForm.time_slots.length === 0) {
      toast.error('Please provide meeting link and select at least one time slot');
      return;
    }

    // Validate based on mode
    if (creationMode === 'single' && !quickForm.date) {
      toast.error('Please select a date');
      return;
    }
    if (creationMode === 'multiple_days' && (!quickForm.start_date || !quickForm.end_date)) {
      toast.error('Please select start and end dates');
      return;
    }
    if (creationMode === 'recurring' && quickForm.recurring_days.length === 0) {
      toast.error('Please select at least one day of the week');
      return;
    }

    setCreating(true);
    try {
      const isMock = activeTab === 'mock';
      const duration = isMock ? 60 : 30;
      const promises = [];

      // Generate dates based on mode
      let datesToCreate = [];
      
      if (creationMode === 'single') {
        datesToCreate = [quickForm.date];
      } else if (creationMode === 'multiple_days') {
        const start = new Date(quickForm.start_date);
        const end = new Date(quickForm.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          datesToCreate.push(new Date(d).toISOString().split('T')[0]);
        }
      } else if (creationMode === 'recurring') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dayMap = { 
          'monday': 1, 
          'tuesday': 2, 
          'wednesday': 3, 
          'thursday': 4, 
          'friday': 5, 
          'saturday': 6, 
          'sunday': 0 
        };
        
        for (let week = 0; week < quickForm.recurring_weeks; week++) {
          for (const day of quickForm.recurring_days) {
            const targetDay = dayMap[day];
            const currentDay = today.getDay();
            
            // Calculate days until target day
            let daysUntilTarget = targetDay - currentDay;
            if (daysUntilTarget < 0) {
              daysUntilTarget += 7;
            }
            
            // Add weeks offset
            const totalDays = daysUntilTarget + (week * 7);
            
            const date = new Date(today);
            date.setDate(date.getDate() + totalDays);
            
            // Only add if date is today or in the future
            if (date >= today) {
              datesToCreate.push(date.toISOString().split('T')[0]);
            }
          }
        }
      }

      // Create slots for each date and time
      for (const date of datesToCreate) {
        for (const start_time of quickForm.time_slots) {
          const [hours, minutes] = start_time.split(':');
          const startDate = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
          const endDate = new Date(startDate);
          endDate.setMinutes(endDate.getMinutes() + duration);
          
          const end_time = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
          
          if (isMock) {
            promises.push(
              api.post('/mentor/slots', {
                date,
                start_time,
                end_time,
                meeting_link: quickForm.meeting_link,
                interview_types: quickForm.interview_types,
                experience_levels: quickForm.experience_levels,
                company_specializations: [] // Empty array for now, can be enhanced later
              })
            );
          } else {
            promises.push(
              api.post('/mentor/resume-review-slots', {
                date,
                start_time,
                end_time,
                meeting_link: quickForm.meeting_link
              })
            );
          }
        }
      }
      
      await Promise.all(promises);
      const totalSlots = datesToCreate.length * quickForm.time_slots.length;
      toast.success(`${totalSlots} slot(s) created successfully!`);
      fetchAllSlots();
      
      // Reset form but keep meeting link and mode
      setQuickForm({
        ...quickForm,
        date: '',
        start_date: '',
        end_date: '',
        time_slots: ['10:00']
      });
    } catch (error) {
      console.error('Error creating slots:', error);
      
      // Handle different error types
      let errorMsg = 'Failed to create slots';
      
      if (error.response?.data?.detail) {
        // Backend validation error
        if (Array.isArray(error.response.data.detail)) {
          errorMsg = error.response.data.detail.map(e => e.msg || e).join(', ');
        } else if (typeof error.response.data.detail === 'string') {
          errorMsg = error.response.data.detail;
        } else if (typeof error.response.data.detail === 'object') {
          errorMsg = JSON.stringify(error.response.data.detail);
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      toast.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (slotId, isMock) => {
    if (!window.confirm('Delete this slot?')) return;
    
    try {
      if (isMock) {
        await api.delete(`/mentor/slots/${slotId}`);
      } else {
        await api.delete(`/mentor/resume-review-slots/${slotId}`);
      }
      toast.success('Slot deleted');
      fetchAllSlots();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete');
    }
  };

  const toggleSlotSelection = (slotId) => {
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slotId));
    } else {
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  const handleBulkUpdateMeetingLink = async () => {
    if (!bulkMeetingLink || selectedSlots.length === 0) {
      toast.error('Please enter a meeting link and select slots');
      return;
    }

    try {
      const isMock = activeTab === 'mock';
      const promises = selectedSlots.map(slotId => {
        if (isMock) {
          return api.patch(`/mentor/slots/${slotId}`, { meeting_link: bulkMeetingLink });
        } else {
          return api.patch(`/mentor/resume-review-slots/${slotId}`, { meeting_link: bulkMeetingLink });
        }
      });
      
      await Promise.all(promises);
      toast.success(`Updated ${selectedSlots.length} slot(s)`);
      setSelectedSlots([]);
      setBulkEditMode(false);
      setBulkMeetingLink('');
      fetchAllSlots();
    } catch (error) {
      toast.error('Failed to update slots');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedSlots.length} selected slot(s)?`)) return;
    
    try {
      const isMock = activeTab === 'mock';
      const promises = selectedSlots.map(slotId => {
        if (isMock) {
          return api.delete(`/mentor/slots/${slotId}`);
        } else {
          return api.delete(`/mentor/resume-review-slots/${slotId}`);
        }
      });
      
      await Promise.all(promises);
      toast.success(`Deleted ${selectedSlots.length} slot(s)`);
      setSelectedSlots([]);
      setBulkEditMode(false);
      fetchAllSlots();
    } catch (error) {
      toast.error('Failed to delete slots');
    }
  };

  const handleEditSlot = (slot, isMock) => {
    setEditingSlot({ ...slot, isMock });
    setEditForm({
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      meeting_link: slot.meeting_link
    });
  };

  const handleUpdateSlot = async () => {
    if (!editForm.date || !editForm.start_time || !editForm.end_time || !editForm.meeting_link) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const isMock = editingSlot.isMock;
      if (isMock) {
        await api.patch(`/mentor/slots/${editingSlot.id}`, editForm);
      } else {
        await api.patch(`/mentor/resume-review-slots/${editingSlot.id}`, editForm);
      }
      toast.success('Slot updated successfully');
      setEditingSlot(null);
      fetchAllSlots();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update slot');
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied!');
  };

  const getStatusBadge = (status) => {
    const config = {
      available: 'bg-green-500/20 text-green-400 border-green-500/30',
      booked: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      unavailable: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return <Badge className={config[status] || config.available}>{status}</Badge>;
  };

  const SlotCard = ({ slot, isMock }) => {
    const canDelete = slot.status === 'available';
    const duration = isMock ? '60 min' : '30 min';
    const isSelected = selectedSlots.includes(slot.id);

    return (
      <Card 
        className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border hover:border-cyan-500/50 transition-colors cursor-pointer ${
          isSelected ? 'ring-2 ring-cyan-500' : ''
        }`}
        onClick={() => bulkEditMode && canDelete && toggleSlotSelection(slot.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Type Badge */}
              <Badge className={`mb-2 ${isMock ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}`}>
                {isMock ? 'Mock Interview' : 'Resume Review'}
              </Badge>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className={`font-semibold ${theme.text.primary} text-sm`}>
                  {new Date(slot.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className={`${theme.text.muted} text-sm`}>
                  {slot.start_time} - {slot.end_time}
                </span>
                <Badge variant="outline" className="text-xs">{duration}</Badge>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getStatusBadge(slot.status)}
              {bulkEditMode && canDelete && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleSlotSelection(slot.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Meeting Link */}
          {slot.meeting_link && (
            <div className="flex items-center gap-2">
              <Video className="w-3 h-3 text-gray-500 flex-shrink-0" />
              <a 
                href={slot.meeting_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:underline truncate flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                {slot.meeting_link.replace('https://', '')}
              </a>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  copyLink(slot.meeting_link);
                }}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(slot.meeting_link, '_blank');
                }}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Actions */}
          {canDelete && !bulkEditMode && (
            <div className="flex gap-2 pt-2 border-t border-gray-700">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditSlot(slot, isMock);
                }}
                className="flex-1"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(slot.id, isMock);
                }}
                className="flex-1 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSlots = (slots, isMock) => {
    const now = new Date();
    const upcoming = slots.filter(s => new Date(`${s.date}T${s.start_time}`) >= now)
      .sort((a, b) => new Date(`${a.date}T${a.start_time}`) - new Date(`${b.date}T${b.start_time}`));

    if (upcoming.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className={theme.text.muted}>No upcoming slots</p>
          <p className="text-sm text-gray-600 mt-2">Create your first slot using the form</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {upcoming.map(slot => (
          <SlotCard key={slot.id} slot={slot} isMock={isMock} />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout title="Manage Availability">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Slot List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Bulk Edit Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant={bulkEditMode ? "default" : "outline"}
                onClick={() => {
                  setBulkEditMode(!bulkEditMode);
                  setSelectedSlots([]);
                }}
                className={bulkEditMode ? "bg-cyan-500" : ""}
              >
                {bulkEditMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                {bulkEditMode ? 'Cancel Selection' : 'Bulk Edit'}
              </Button>
              {bulkEditMode && selectedSlots.length > 0 && (
                <>
                  <Badge className="bg-cyan-500/20 text-cyan-400">
                    {selectedSlots.length} selected
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentSlots = activeTab === 'mock' ? mockSlots : resumeSlots;
                      const availableSlots = currentSlots.filter(s => s.status === 'available' && new Date(`${s.date}T${s.start_time}`) >= new Date());
                      setSelectedSlots(availableSlots.map(s => s.id));
                    }}
                  >
                    Select All Available
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {bulkEditMode && selectedSlots.length > 0 && (
            <div className={`${theme.glass} rounded-lg p-4 ${theme.border.accent} border space-y-3`}>
              <p className={`${theme.text.primary} font-medium`}>Bulk Actions</p>
              <div className="flex gap-3">
                <Input
                  type="url"
                  placeholder="New meeting link for all selected slots"
                  value={bulkMeetingLink}
                  onChange={(e) => setBulkMeetingLink(e.target.value)}
                  className={`flex-1 ${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                />
                <Button
                  onClick={handleBulkUpdateMeetingLink}
                  disabled={!bulkMeetingLink}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  Update Links
                </Button>
                <Button
                  onClick={handleBulkDelete}
                  variant="outline"
                  className="text-red-400 hover:text-red-300"
                >
                  Delete Selected
                </Button>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            setSelectedSlots([]);
            setBulkEditMode(false);
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="mock"
                className={activeTab === 'mock' ? 'bg-blue-500/20 text-blue-400 data-[state=active]:bg-blue-500/30' : ''}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${activeTab === 'mock' ? 'bg-blue-400' : 'bg-gray-500'}`} />
                  Mock Interviews ({mockSlots.filter(s => new Date(`${s.date}T${s.start_time}`) >= new Date()).length})
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="resume"
                className={activeTab === 'resume' ? 'bg-purple-500/20 text-purple-400 data-[state=active]:bg-purple-500/30' : ''}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${activeTab === 'resume' ? 'bg-purple-400' : 'bg-gray-500'}`} />
                  Resume Reviews ({resumeSlots.filter(s => new Date(`${s.date}T${s.start_time}`) >= new Date()).length})
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mock" className="mt-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p className={theme.text.muted}>Loading...</p>
                </div>
              ) : (
                renderSlots(mockSlots, true)
              )}
            </TabsContent>

            <TabsContent value="resume" className="mt-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                  <p className={theme.text.muted}>Loading...</p>
                </div>
              ) : (
                renderSlots(resumeSlots, false)
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Quick Create Form */}
        <div className="lg:col-span-1">
          <div className={`${theme.glass} rounded-xl p-6 ${theme.border.primary} border sticky top-6 space-y-6`}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className={`${theme.text.primary} text-lg font-semibold`}>
                Create Slots
              </h3>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                {activeTab === 'mock' ? '60 min' : '30 min'} each
              </Badge>
            </div>

            {/* Creation Mode Selection */}
            <div>
              <Label className={`${theme.text.primary} text-sm font-medium mb-3 block`}>
                How do you want to create slots?
              </Label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setCreationMode('single')}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    creationMode === 'single'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      creationMode === 'single' ? 'border-cyan-500' : 'border-slate-600'
                    }`}>
                      {creationMode === 'single' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${theme.text.primary}`}>Single Day</p>
                      <p className="text-xs text-gray-400">Create slots for one specific date</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCreationMode('multiple_days')}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    creationMode === 'multiple_days'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      creationMode === 'multiple_days' ? 'border-cyan-500' : 'border-slate-600'
                    }`}>
                      {creationMode === 'multiple_days' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${theme.text.primary}`}>Date Range</p>
                      <p className="text-xs text-gray-400">Create slots for multiple consecutive days</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCreationMode('recurring')}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    creationMode === 'recurring'
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      creationMode === 'recurring' ? 'border-cyan-500' : 'border-slate-600'
                    }`}>
                      {creationMode === 'recurring' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${theme.text.primary}`}>Recurring Weekly</p>
                      <p className="text-xs text-gray-400">Repeat same days each week</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Date Selection based on mode */}
            {creationMode === 'single' && (
              <div>
                <Label className={`${theme.text.primary} text-sm font-medium mb-2 block`}>
                  Select Date
                </Label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickForm({ ...quickForm, date: getQuickDate('today') })}
                    className={quickForm.date === getQuickDate('today') ? 'bg-cyan-500/20 border-cyan-500' : ''}
                  >
                    Today
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickForm({ ...quickForm, date: getQuickDate('tomorrow') })}
                    className={quickForm.date === getQuickDate('tomorrow') ? 'bg-cyan-500/20 border-cyan-500' : ''}
                  >
                    Tomorrow
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickForm({ ...quickForm, date: getQuickDate('week') })}
                    className={quickForm.date === getQuickDate('week') ? 'bg-cyan-500/20 border-cyan-500' : ''}
                  >
                    +7 Days
                  </Button>
                </div>
                <Input
                  type="date"
                  value={quickForm.date}
                  onChange={(e) => setQuickForm({ ...quickForm, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                />
              </div>
            )}

            {creationMode === 'multiple_days' && (
              <div className="space-y-3">
                <Label className={`${theme.text.primary} text-sm font-medium block`}>
                  Select Date Range
                </Label>
                <div>
                  <Label className="text-xs text-gray-400 mb-1 block">Start Date</Label>
                  <Input
                    type="date"
                    value={quickForm.start_date}
                    onChange={(e) => setQuickForm({ ...quickForm, start_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-400 mb-1 block">End Date</Label>
                  <Input
                    type="date"
                    value={quickForm.end_date}
                    onChange={(e) => setQuickForm({ ...quickForm, end_date: e.target.value })}
                    min={quickForm.start_date || new Date().toISOString().split('T')[0]}
                    className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                  />
                </div>
                {quickForm.start_date && quickForm.end_date && (
                  <p className="text-xs text-cyan-400">
                    {Math.ceil((new Date(quickForm.end_date) - new Date(quickForm.start_date)) / (1000 * 60 * 60 * 24)) + 1} days selected
                  </p>
                )}
              </div>
            )}

            {creationMode === 'recurring' && (
              <div className="space-y-3">
                <Label className={`${theme.text.primary} text-sm font-medium block`}>
                  Select Days of Week
                </Label>
                <div className="grid grid-cols-7 gap-1">
                  {weekDays.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleRecurringDay(day.value)}
                      className={`p-2 rounded text-xs font-medium transition-all ${
                        quickForm.recurring_days.includes(day.value)
                          ? 'bg-cyan-500 text-white'
                          : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <div>
                  <Label className="text-xs text-gray-400 mb-1 block">Repeat for how many weeks?</Label>
                  <select
                    value={quickForm.recurring_weeks}
                    onChange={(e) => setQuickForm({ ...quickForm, recurring_weeks: parseInt(e.target.value) })}
                    className="w-full h-10 px-3 rounded-md border text-sm bg-slate-800 border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="1">1 week</option>
                    <option value="2">2 weeks</option>
                    <option value="4">4 weeks (1 month)</option>
                    <option value="8">8 weeks (2 months)</option>
                    <option value="12">12 weeks (3 months)</option>
                  </select>
                </div>
                {quickForm.recurring_days.length > 0 && (
                  <p className="text-xs text-cyan-400">
                    {quickForm.recurring_days.length} day(s) × {quickForm.recurring_weeks} week(s) = ~{quickForm.recurring_days.length * quickForm.recurring_weeks} dates
                  </p>
                )}
              </div>
            )}

            {/* Time Selection */}
            <div>
              <Label className={`${theme.text.primary} text-sm font-medium mb-2 block`}>
                Select Time Slots (you can select multiple)
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleTimeSlot(time)}
                    className={`p-2 rounded text-xs font-medium transition-all ${
                      quickForm.time_slots.includes(time)
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              {quickForm.time_slots.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {quickForm.time_slots.length} time slot(s) selected
                </p>
              )}
            </div>

            {/* Meeting Link */}
            <div>
              <Label className={`${theme.text.primary} text-sm font-medium mb-2 block`}>
                Meeting Link
              </Label>
              <Input
                type="url"
                placeholder="https://meet.google.com/..."
                value={quickForm.meeting_link}
                onChange={(e) => setQuickForm({ ...quickForm, meeting_link: e.target.value })}
                className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              />
            </div>

            {/* Summary */}
            {quickForm.time_slots.length > 0 && quickForm.meeting_link && (
              <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <p className="text-xs text-cyan-400 font-medium mb-1">Summary:</p>
                <p className="text-xs text-gray-300">
                  {creationMode === 'single' && quickForm.date && `${quickForm.time_slots.length} slot(s) on ${new Date(quickForm.date).toLocaleDateString()}`}
                  {creationMode === 'multiple_days' && quickForm.start_date && quickForm.end_date && 
                    `${quickForm.time_slots.length} slot(s) × ${Math.ceil((new Date(quickForm.end_date) - new Date(quickForm.start_date)) / (1000 * 60 * 60 * 24)) + 1} days = ${quickForm.time_slots.length * (Math.ceil((new Date(quickForm.end_date) - new Date(quickForm.start_date)) / (1000 * 60 * 60 * 24)) + 1)} total slots`}
                  {creationMode === 'recurring' && quickForm.recurring_days.length > 0 &&
                    `${quickForm.time_slots.length} slot(s) × ~${quickForm.recurring_days.length * quickForm.recurring_weeks} dates = ~${quickForm.time_slots.length * quickForm.recurring_days.length * quickForm.recurring_weeks} total slots`}
                </p>
              </div>
            )}

            {/* Create Button */}
            <Button
              onClick={handleQuickCreate}
              disabled={creating || !quickForm.meeting_link || quickForm.time_slots.length === 0}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 h-12 text-base font-semibold"
            >
              {creating ? (
                <>Creating...</>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Create Slots
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Slot Dialog */}
      <Dialog open={!!editingSlot} onOpenChange={() => setEditingSlot(null)}>
        <DialogContent className={`${theme.bg.card} ${theme.border.card} border`}>
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className={theme.text.primary}>Edit Slot</DialogTitle>
              {editingSlot && (
                <Badge className={editingSlot.isMock ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}>
                  {editingSlot.isMock ? 'Mock Interview' : 'Resume Review'}
                </Badge>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className={theme.text.primary}>Date</Label>
              <Input
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={theme.text.primary}>Start Time</Label>
                <Input
                  type="time"
                  value={editForm.start_time}
                  onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                  className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                />
              </div>
              <div>
                <Label className={theme.text.primary}>End Time</Label>
                <Input
                  type="time"
                  value={editForm.end_time}
                  onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                  className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                />
              </div>
            </div>
            <div>
              <Label className={theme.text.primary}>Meeting Link</Label>
              <Input
                type="url"
                value={editForm.meeting_link}
                onChange={(e) => setEditForm({ ...editForm, meeting_link: e.target.value })}
                className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setEditingSlot(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSlot}
                className="flex-1 bg-cyan-500 hover:bg-cyan-600"
              >
                Update Slot
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MentorSlotsUnified;
