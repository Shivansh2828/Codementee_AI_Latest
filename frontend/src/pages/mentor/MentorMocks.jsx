import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';
import { ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const MentorMocks = () => {
  const { theme } = useTheme();
  const [mocks, setMocks] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedMock, setSelectedMock] = useState(null);
  const [feedback, setFeedback] = useState({
    problem_solving: 3, communication: 3, technical_depth: 3, code_quality: 3, overall: 3,
    strengths: '', improvements: '', hireability: 'Hire', action_items: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mocksRes, menteesRes] = await Promise.all([api.get('/mocks'), api.get('/mentor/mentees')]);
        setMocks(mocksRes.data);
        const userMap = {};
        menteesRes.data.forEach(u => userMap[u.id] = u.name);
        setUsers(userMap);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const openFeedback = (mock) => {
    setSelectedMock(mock);
    setShowFeedbackModal(true);
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mentor/feedback', { ...feedback, mock_id: selectedMock.id, mentee_id: selectedMock.mentee_id });
      toast.success('Feedback submitted');
      setShowFeedbackModal(false);
      setFeedback({ problem_solving: 3, communication: 3, technical_depth: 3, code_quality: 3, overall: 3, strengths: '', improvements: '', hireability: 'Hire', action_items: '' });
      const res = await api.get('/mocks');
      setMocks(res.data);
    } catch (e) { toast.error('Failed to submit'); }
  };

  return (
    <DashboardLayout title="Mock Interviews">
      <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme.bg.secondary}>
              <tr>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Mentee</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Scheduled</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Status</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className={`p-4 text-center ${theme.text.secondary}`}>Loading...</td></tr>
              ) : mocks.length === 0 ? (
                <tr><td colSpan={4} className={`p-4 text-center ${theme.text.secondary}`}>No mocks scheduled</td></tr>
              ) : mocks.map((mock) => (
                <tr key={mock.id} className={`border-t ${theme.border.primary}`}>
                  <td className={`p-4 ${theme.text.primary}`}>{users[mock.mentee_id] || mock.mentee_id}</td>
                  <td className={`p-4 ${theme.text.secondary}`}>{new Date(mock.scheduled_at).toLocaleString()}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${mock.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{mock.status}</span></td>
                  <td className="p-4 flex gap-3">
                    {mock.meet_link && <a href={mock.meet_link} target="_blank" rel="noopener noreferrer" className="text-[#06b6d4] hover:underline flex items-center gap-1 text-sm"><ExternalLink size={14} /> Join</a>}
                    {mock.status !== 'completed' && <button onClick={() => openFeedback(mock)} className="text-green-400 hover:underline text-sm">Submit Feedback</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto`}>
            <h2 className={`text-xl font-bold ${theme.text.primary} mb-4`}>Submit Feedback</h2>
            <form onSubmit={submitFeedback} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {['problem_solving', 'communication', 'technical_depth', 'code_quality', 'overall'].map(field => (
                  <div key={field}>
                    <label className={`${theme.text.secondary} text-sm capitalize`}>{field.replace('_', ' ')}</label>
                    <input type="number" min="0" max="5" value={feedback[field]} onChange={e => setFeedback({...feedback, [field]: parseInt(e.target.value)})} className={`w-full px-3 py-2 rounded ${theme.input.base}`} />
                  </div>
                ))}
              </div>
              <div>
                <label className={`${theme.text.secondary} text-sm`}>Hireability</label>
                <select value={feedback.hireability} onChange={e => setFeedback({...feedback, hireability: e.target.value})} className={`w-full px-3 py-2 rounded ${theme.input.base}`}>
                  {['Strong Hire', 'Hire', 'Lean No Hire', 'No Hire'].map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div><label className={`${theme.text.secondary} text-sm`}>Strengths</label><textarea value={feedback.strengths} onChange={e => setFeedback({...feedback, strengths: e.target.value})} required rows={2} className={`w-full px-3 py-2 rounded ${theme.input.base}`} /></div>
              <div><label className={`${theme.text.secondary} text-sm`}>Areas to Improve</label><textarea value={feedback.improvements} onChange={e => setFeedback({...feedback, improvements: e.target.value})} required rows={2} className={`w-full px-3 py-2 rounded ${theme.input.base}`} /></div>
              <div><label className={`${theme.text.secondary} text-sm`}>Action Items</label><textarea value={feedback.action_items} onChange={e => setFeedback({...feedback, action_items: e.target.value})} required rows={2} className={`w-full px-3 py-2 rounded ${theme.input.base}`} /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setShowFeedbackModal(false)} className={`${theme.button.secondary} flex-1 py-2 rounded-lg`}>Cancel</button><button type="submit" className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white flex-1 py-2 rounded-lg">Submit</button></div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MentorMocks;
