import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Plus,
  Video,
  Briefcase,
  TrendingUp
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import MentorSlotForm from '../../components/mentor/MentorSlotForm';

const MentorSlots = () => {
  const { theme } = useTheme();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await api.get('/mentor/slots');
      setSlots(response.data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      await api.delete(`/mentor/slots/${slotId}`);
      toast.success('Slot deleted successfully');
      fetchSlots();
    } catch (error) {
      const errorMsg = error.response?.data?.detail?.message || error.response?.data?.detail || 'Failed to delete slot';
      toast.error(errorMsg);
    }
  };

  const handleToggleAvailability = async (slotId, currentStatus) => {
    try {
      const newAvailable = currentStatus !== 'available';
      await api.patch(`/mentor/slots/${slotId}/availability`, { available: newAvailable });
      toast.success(`Slot ${newAvailable ? 'made available' : 'hidden'}`);
      fetchSlots();
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingSlot(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSlot(null);
    fetchSlots();
  };

  // Separate slots into upcoming and past
  const now = new Date();
  const upcomingSlots = slots.filter(slot => {
    const slotDate = new Date(`${slot.date}T${slot.start_time}`);
    return slotDate >= now;
  }).sort((a, b) => new Date(`${a.date}T${a.start_time}`) - new Date(`${b.date}T${b.start_time}`));

  const pastSlots = slots.filter(slot => {
    const slotDate = new Date(`${slot.date}T${slot.start_time}`);
    return slotDate < now;
  }).sort((a, b) => new Date(`${b.date}T${b.start_time}`) - new Date(`${a.date}T${a.start_time}`));

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { variant: 'default', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      booked: { variant: 'default', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      unavailable: { variant: 'default', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
      completed: { variant: 'default', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
    };
    
    const config = statusConfig[status] || statusConfig.available;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  const SlotCard = ({ slot }) => {
    const slotDateTime = new Date(`${slot.date}T${slot.start_time}`);
    const isBooked = slot.status === 'booked';
    const canEdit = slot.status === 'available' || slot.status === 'unavailable';
    const canDelete = slot.status === 'available';

    return (
      <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className={`font-semibold ${theme.text.primary}`}>
                  {new Date(slot.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className={theme.text.muted}>
                  {slot.start_time} - {slot.end_time}
                </span>
              </div>
            </div>
            <div>
              {getStatusBadge(slot.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Interview Types */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Interview Types</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {slot.interview_types?.map(type => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Experience Levels */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Experience Levels</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {slot.experience_levels?.map(level => (
                <Badge key={level} variant="outline" className="text-xs">
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          {/* Meeting Link */}
          {slot.meeting_link && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Video className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">Meeting Link</span>
              </div>
              <a 
                href={slot.meeting_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:underline truncate block"
              >
                {slot.meeting_link}
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-700">
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(slot)}
                className="flex-1"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(slot.id)}
                className="flex-1 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            )}
            {!isBooked && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleAvailability(slot.id, slot.status)}
                className="flex-1"
              >
                {slot.status === 'available' ? (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Show
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (showForm) {
    return (
      <MentorSlotForm
        slot={editingSlot}
        onClose={handleFormClose}
        onSuccess={handleFormClose}
      />
    );
  }

  return (
    <DashboardLayout title="My Availability Slots">
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <p className={theme.text.muted}>
            Manage your availability slots for mock interviews
          </p>
          <Button onClick={handleCreate} className="bg-cyan-500 hover:bg-cyan-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Slot
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className={theme.text.muted}>Loading slots...</p>
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingSlots.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past ({pastSlots.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-6">
              {upcomingSlots.length === 0 ? (
                <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border`}>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className={theme.text.muted}>No upcoming slots</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Create your first availability slot to start accepting bookings
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingSlots.map(slot => (
                    <SlotCard key={slot.id} slot={slot} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-6">
              {pastSlots.length === 0 ? (
                <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border`}>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className={theme.text.muted}>No past slots</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastSlots.map(slot => (
                    <SlotCard key={slot.id} slot={slot} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MentorSlots;
