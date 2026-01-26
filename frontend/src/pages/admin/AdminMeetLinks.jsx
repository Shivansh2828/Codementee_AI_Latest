import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { Video, Plus, Trash2, X, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const AdminMeetLinks = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ link: '', name: '' });

  const fetchLinks = async () => {
    try {
      const response = await api.get('/admin/meet-links');
      setLinks(response.data);
    } catch (e) {
      console.error('Failed to fetch links:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.link.includes('meet.google.com')) {
      toast.error('Please enter a valid Google Meet link');
      return;
    }
    try {
      await api.post('/admin/meet-links', formData);
      toast.success('Meet link added');
      setShowModal(false);
      setFormData({ link: '', name: '' });
      fetchLinks();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to add link');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meet link?')) return;
    try {
      await api.delete(`/admin/meet-links/${id}`);
      toast.success('Link deleted');
      fetchLinks();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to delete');
    }
  };

  const handleRelease = async (id) => {
    try {
      await api.post(`/admin/meet-links/${id}/release`);
      toast.success('Link released and available for new bookings');
      fetchLinks();
    } catch (e) {
      toast.error('Failed to release link');
    }
  };

  const availableCount = links.filter(l => l.status === 'available').length;
  const inUseCount = links.filter(l => l.status === 'in_use').length;

  return (
    <DashboardLayout title="Google Meet Links">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
          <p className="text-slate-400 text-sm">Total Links</p>
          <p className="text-2xl font-bold text-white">{links.length}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
          <p className="text-slate-400 text-sm">Available</p>
          <p className="text-2xl font-bold text-emerald-400">{availableCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
          <p className="text-slate-400 text-sm">In Use</p>
          <p className="text-2xl font-bold text-amber-400">{inUseCount}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-400">Pre-generated Google Meet links for mock interviews</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#06b6d4] text-[#0f172a] px-4 py-2 rounded-lg font-medium hover:bg-[#06b6d4]/90 transition-colors"
          data-testid="add-link-btn"
        >
          <Plus size={18} /> Add Meet Link
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
        <p className="text-blue-400 text-sm">
          <strong>How it works:</strong> Create Google Meet links in advance. When a mentor confirms a booking, the system automatically assigns an available link. After the interview is done, release the link to make it available again.
        </p>
      </div>

      {/* Links List */}
      {loading ? (
        <p className="text-slate-400 text-center py-8">Loading...</p>
      ) : links.length === 0 ? (
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-8 text-center">
          <Video size={48} className="mx-auto text-slate-500 mb-4" />
          <p className="text-slate-400">No meet links added yet</p>
          <p className="text-slate-500 text-sm mt-1">Add Google Meet links to enable auto-assignment for bookings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => (
            <div
              key={link.id}
              className={`bg-[#1e293b] rounded-xl border p-5 ${
                link.status === 'in_use' ? 'border-amber-500/50' : 'border-[#334155]'
              }`}
              data-testid={`link-${link.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    link.status === 'available' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                  }`}>
                    <Video size={20} className={link.status === 'available' ? 'text-emerald-400' : 'text-amber-400'} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{link.name}</h3>
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#06b6d4] text-sm hover:underline truncate block max-w-[250px]"
                    >
                      {link.link}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {link.status === 'available' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400">
                      <CheckCircle size={12} /> Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400">
                      <Clock size={12} /> In Use
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[#334155]">
                {link.status === 'in_use' && (
                  <button
                    onClick={() => handleRelease(link.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                    title="Release link for new bookings"
                  >
                    <RefreshCw size={14} /> Release
                  </button>
                )}
                <button
                  onClick={() => handleDelete(link.id)}
                  disabled={link.status === 'in_use'}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Link Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-[#334155]">
              <h3 className="text-lg font-semibold text-white">Add Google Meet Link</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Google Meet Link *</label>
                <input
                  type="url"
                  required
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  data-testid="meet-link-input"
                />
                <p className="text-slate-500 text-xs mt-1">
                  Create a meeting at <a href="https://meet.google.com" target="_blank" rel="noopener noreferrer" className="text-[#06b6d4]">meet.google.com</a> and paste the link here
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Label (optional)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                  placeholder="e.g., Room 1, Interview Room A"
                />
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
                  data-testid="submit-link-btn"
                >
                  Add Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminMeetLinks;
