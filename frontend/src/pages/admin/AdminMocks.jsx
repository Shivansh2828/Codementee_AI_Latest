import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { toast } from 'sonner';
import { ExternalLink, CheckCircle } from 'lucide-react';

const AdminMocks = () => {
  const [mocks, setMocks] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ mentee_id: '', mentor_id: '', scheduled_at: '', meet_link: '' });
  const [mentees, setMentees] = useState([]);
  const [mentors, setMentors] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [mocksRes, menteesRes, mentorsRes] = await Promise.all([
        api.get('/admin/mocks'),
        api.get('/admin/mentees'),
        api.get('/admin/mentors')
      ]);
      setMocks(mocksRes.data);
      setMentees(menteesRes.data);
      setMentors(mentorsRes.data);
      const userMap = {};
      [...menteesRes.data, ...mentorsRes.data].forEach(u => userMap[u.id] = u.name);
      setUsers(userMap);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const createMock = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mocks', { ...form, scheduled_at: new Date(form.scheduled_at).toISOString() });
      toast.success('Mock interview scheduled');
      setShowModal(false);
      setForm({ mentee_id: '', mentor_id: '', scheduled_at: '', meet_link: '' });
      fetchData();
    } catch (e) { toast.error('Failed to create'); }
  };

  const markComplete = async (id) => {
    try {
      await api.put(`/admin/mock/${id}/complete`);
      toast.success('Marked as completed');
      fetchData();
    } catch (e) { toast.error('Failed'); }
  };

  return (
    <DashboardLayout title="Mock Interviews">
      <div className="mb-6">
        <button onClick={() => setShowModal(true)} className="btn-primary">Schedule New Mock</button>
      </div>

      <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f172a]">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Mentee</th>
                <th className="text-left p-4 text-slate-400 font-medium">Mentor</th>
                <th className="text-left p-4 text-slate-400 font-medium">Scheduled</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-400">Loading...</td></tr>
              ) : mocks.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-slate-400">No mocks scheduled</td></tr>
              ) : mocks.map((mock) => (
                <tr key={mock.id} className="border-t border-[#334155]">
                  <td className="p-4 text-white">{users[mock.mentee_id] || mock.mentee_id}</td>
                  <td className="p-4 text-slate-300">{users[mock.mentor_id] || mock.mentor_id}</td>
                  <td className="p-4 text-slate-300">{new Date(mock.scheduled_at).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${mock.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {mock.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    {mock.meet_link && (
                      <a href={mock.meet_link} target="_blank" rel="noopener noreferrer" className="text-[#06b6d4] hover:underline flex items-center gap-1 text-sm">
                        <ExternalLink size={14} /> Join
                      </a>
                    )}
                    {mock.status !== 'completed' && (
                      <button onClick={() => markComplete(mock.id)} className="text-green-400 hover:underline flex items-center gap-1 text-sm">
                        <CheckCircle size={14} /> Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Schedule Mock Interview</h2>
            <form onSubmit={createMock} className="space-y-4">
              <select value={form.mentee_id} onChange={e => setForm({...form, mentee_id: e.target.value})} required className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white">
                <option value="">Select Mentee</option>
                {mentees.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select value={form.mentor_id} onChange={e => setForm({...form, mentor_id: e.target.value})} required className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white">
                <option value="">Select Mentor</option>
                {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({...form, scheduled_at: e.target.value})} required className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white" />
              <input type="url" placeholder="Google Meet Link" value={form.meet_link} onChange={e => setForm({...form, meet_link: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white placeholder-slate-500" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminMocks;
