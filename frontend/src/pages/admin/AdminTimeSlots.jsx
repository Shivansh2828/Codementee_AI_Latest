import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { Clock, Plus, Trash2, X, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const AdminTimeSlots = () => {
  const [slots, setSlots] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    mentor_id: ''
  });

  const fetchData = async () => {
    try {
      const [slotsRes, mentorsRes] = await Promise.all([
        api.get('/admin/time-slots'),
        api.get('/admin/mentors')
      ]);
      setSlots(slotsRes.data);
      setMentors(mentorsRes.data);
    } catch (e) {
      console.error('Failed to fetch data:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/time-slots', {
        ...formData,
        mentor_id: formData.mentor_id || null
      });
      toast.success('Time slot created');
      setShowModal(false);
      setFormData({ date: '', start_time: '', end_time: '', mentor_id: '' });
      fetchData();
    } catch (e) {
      toast.error('Failed to create time slot');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this time slot?')) return;
    try {
      await api.delete(`/admin/time-slots/${id}`);
      toast.success('Time slot deleted');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const getMentorName = (mentorId) => {
    const mentor = mentors.find(m => m.id === mentorId);
    return mentor ? mentor.name : 'Any Mentor';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <DashboardLayout title="Manage Time Slots">
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-400">Available slots for mentees to book mock interviews</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#06b6d4] text-[#0f172a] px-4 py-2 rounded-lg font-medium hover:bg-[#06b6d4]/90 transition-colors"
          data-testid="add-slot-btn"
        >
          <Plus size={18} /> Add Slot
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-8">Loading...</p>
      ) : Object.keys(groupedSlots).length === 0 ? (
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-8 text-center">
          <Clock size={48} className="mx-auto text-slate-500 mb-4" />
          <p className="text-slate-400">No time slots created yet</p>
          <p className="text-slate-500 text-sm mt-1">Add slots for mentees to book their mock interviews</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSlots).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, dateSlots]) => (
            <div key={date} className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
              <div className="bg-[#0f172a] px-5 py-3 border-b border-[#334155] flex items-center gap-2">
                <Calendar size={18} className="text-[#06b6d4]" />
                <span className="text-white font-medium">{formatDate(date)}</span>
                <span className="text-slate-400 text-sm">({dateSlots.length} slots)</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dateSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      slot.status === 'booked'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-[#0f172a] border-[#334155]'
                    }`}
                    data-testid={`slot-${slot.id}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-[#06b6d4]" />
                        <span className="text-white font-medium">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{getMentorName(slot.mentor_id)}</p>
                      {slot.status === 'booked' && (
                        <span className="inline-block mt-1 text-xs text-amber-400">Booked</span>
                      )}
                    </div>
                    {slot.status !== 'booked' && (
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Slot Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-[#334155]">
              <h3 className="text-lg font-semibold text-white">Add Time Slot</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                  data-testid="slot-date-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                    data-testid="slot-start-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                    data-testid="slot-end-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Assign Mentor (optional)</label>
                <select
                  value={formData.mentor_id}
                  onChange={(e) => setFormData({ ...formData, mentor_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                >
                  <option value="">Any available mentor</option>
                  {mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#06b6d4] text-[#0f172a] rounded-lg font-medium hover:bg-[#06b6d4]/90 transition-colors"
                  data-testid="submit-slot-btn"
                >
                  Add Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminTimeSlots;
