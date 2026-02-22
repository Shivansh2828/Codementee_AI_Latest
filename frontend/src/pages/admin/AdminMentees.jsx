import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { toast } from 'sonner';

const statusColors = {
  Applied: 'bg-yellow-500/20 text-yellow-400',
  Active: 'bg-green-500/20 text-green-400',
  Interviewed: 'bg-blue-500/20 text-blue-400',
  Upgraded: 'bg-purple-500/20 text-purple-400',
  Paused: 'bg-red-500/20 text-red-400',
  active: 'bg-green-500/20 text-green-400'
};

const AdminMentees = () => {
  const { theme } = useTheme();
  const [mentees, setMentees] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menteesRes, mentorsRes] = await Promise.all([
        api.get('/admin/mentees'),
        api.get('/admin/mentors')
      ]);
      setMentees(menteesRes.data);
      setMentors(mentorsRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const assignMentor = async (menteeId, mentorId) => {
    try {
      await api.post('/admin/assign-mentor', { mentee_id: menteeId, mentor_id: mentorId });
      toast.success('Mentor assigned');
      fetchData();
    } catch (e) { toast.error('Failed to assign'); }
  };

  const updateStatus = async (menteeId, status) => {
    try {
      await api.put(`/admin/mentee/${menteeId}/status`, { status });
      toast.success('Status updated');
      fetchData();
    } catch (e) { toast.error('Failed to update'); }
  };

  const getMentorName = (mentorId) => mentors.find(m => m.id === mentorId)?.name || '-';

  return (
    <DashboardLayout title="Mentees">
      <div className={`${theme.bg.cardAlt} rounded-xl ${theme.border.cardAlt} border overflow-hidden ${theme.shadowMd}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme.bg.secondary}>
              <tr>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Name</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Email</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Status</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Mentor</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className={`p-4 text-center ${theme.text.muted}`}>Loading...</td></tr>
              ) : mentees.length === 0 ? (
                <tr><td colSpan={5} className={`p-4 text-center ${theme.text.muted}`}>No mentees yet</td></tr>
              ) : mentees.map((mentee) => (
                <tr key={mentee.id} className={`${theme.border.cardAlt} border-t`}>
                  <td className={`p-4 ${theme.text.primary}`}>{mentee.name}</td>
                  <td className={`p-4 ${theme.text.secondary}`}>{mentee.email}</td>
                  <td className="p-4">
                    <select
                      value={mentee.status || 'active'}
                      onChange={(e) => updateStatus(mentee.id, e.target.value)}
                      className={`${theme.input.base} rounded px-2 py-1 text-sm`}
                    >
                      {['Applied', 'Active', 'Interviewed', 'Upgraded', 'Paused'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      value={mentee.mentor_id || ''}
                      onChange={(e) => assignMentor(mentee.id, e.target.value)}
                      className={`${theme.input.base} rounded px-2 py-1 text-sm`}
                    >
                      <option value="">Assign Mentor</option>
                      {mentors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </td>
                  <td className={`p-4 ${theme.text.muted} text-sm`}>{getMentorName(mentee.mentor_id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminMentees;
