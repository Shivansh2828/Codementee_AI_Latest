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
  FileText,
  AlertCircle
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';

const MentorResumeSlots = () => {
  const { theme } = useTheme();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    meeting_link: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await api.get('/mentor/resume-review-slots');
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
      await api.delete(`/mentor/resume-review-slots/${slotId}`);
      toast.success('Slot deleted successfully');
      fetchSlots();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete slot';
      toast.error(errorMsg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate 30-minute duration
    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);
    const duration = (end - start) / (1000 * 60);
    
    if (duration !== 30) {
      toast.error('Resume review slots must be exactly 30 minutes');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/mentor/resume-review-slots', formData);
      toast.success('Resume review slot created successfully');
      setShowForm(false);
      setFormData({
        date: '',
        start_time: '',
        end_time: '',
        meeting_link: ''
      });
      fetchSlots();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create slot';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    const start = formData.start_time;
    if (start) {
      const [hours, minutes] = start.split(':');
      const startDate = new Date(2000, 0, 1, parseInt(hours), parseInt(minutes));
      startDate.setMinutes(startDate.getMinutes() + 30);
      const endTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      setFormData({ ...formData, end_time: endTime });
    }
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
      available: { className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      booked: { className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      completed: { className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
    };
    
    const config = statusConfig[status] || statusConfig.available;
    return (
      <Badge className={config.className}>
        {status}
      </Badge>
    );
  };

  const SlotCard = ({ slot }) => {
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
                <Badge variant="outline" className="text-xs ml-2">
                  30 min
                </Badge>
              </div>
            </div>
            <div>
              {getStatusBadge(slot.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
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
          {canDelete && (
            <div className="flex gap-2 pt-2 border-t border-gray-700">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(slot.id)}
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

  return (
    <DashboardLayout title="Resume Review Slots">
      <div className="space-y-6">
        {/* Info Banner */}
        <div className={`${theme.glass} rounded-xl p-4 ${theme.border.accent} border flex items-start gap-3`}>
          <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className={`${theme.text.primary} font-semibold mb-1`}>Resume Review Slots</h3>
            <p className={`${theme.text.secondary} text-sm`}>
              Create 30-minute slots for resume review calls with mentees. These are separate from mock interview slots.
            </p>
          </div>
        </div>

        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <p className={theme.text.muted}>
            Manage your availability for resume review sessions
          </p>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Slot
              </Button>
            </DialogTrigger>
            <DialogContent className={`${theme.bg.card} ${theme.border.card} border`}>
              <DialogHeader>
                <DialogTitle className={theme.text.primary}>Create Resume Review Slot</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="date" className={theme.text.primary}>Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_time" className={theme.text.primary}>Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      onBlur={handleQuickFill}
                      required
                      className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_time" className={theme.text.primary}>End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                      className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                    />
                  </div>
                </div>

                <div className={`${theme.bg.secondary} rounded-lg p-3 flex items-start gap-2`}>
                  <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-400">
                    Resume review slots must be exactly 30 minutes. End time will auto-fill when you select start time.
                  </p>
                </div>

                <div>
                  <Label htmlFor="meeting_link" className={theme.text.primary}>Meeting Link</Label>
                  <Input
                    id="meeting_link"
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    required
                    className={`${theme.bg.input} ${theme.border.input} ${theme.text.primary}`}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Slot'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className={theme.text.muted}>Loading slots...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Slots */}
            <div>
              <h2 className={`${theme.text.primary} text-xl font-semibold mb-4`}>
                Upcoming Slots ({upcomingSlots.length})
              </h2>
              {upcomingSlots.length === 0 ? (
                <Card className={`${theme.bg.cardAlt} ${theme.border.cardAlt} border`}>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className={theme.text.muted}>No upcoming slots</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Create your first resume review slot to start accepting bookings
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
            </div>

            {/* Past Slots */}
            {pastSlots.length > 0 && (
              <div>
                <h2 className={`${theme.text.primary} text-xl font-semibold mb-4`}>
                  Past Slots ({pastSlots.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastSlots.map(slot => (
                    <SlotCard key={slot.id} slot={slot} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MentorResumeSlots;
