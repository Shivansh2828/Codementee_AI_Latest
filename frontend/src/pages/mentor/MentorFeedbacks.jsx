import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';

const MentorFeedbacks = () => {
  const { theme } = useTheme();
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fbRes, menteesRes] = await Promise.all([api.get('/mentor/feedbacks'), api.get('/mentor/mentees')]);
        setFeedbacks(fbRes.data);
        const userMap = {};
        menteesRes.data.forEach(u => userMap[u.id] = u.name);
        setUsers(userMap);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout title="My Feedbacks">
      <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme.bg.secondary}>
              <tr>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Mentee</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Overall</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Hireability</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className={`p-4 text-center ${theme.text.secondary}`}>Loading...</td></tr>
              ) : feedbacks.length === 0 ? (
                <tr><td colSpan={4} className={`p-4 text-center ${theme.text.secondary}`}>No feedbacks yet</td></tr>
              ) : feedbacks.map((fb) => (
                <tr key={fb.id} className={`border-t ${theme.border.primary}`}>
                  <td className={`p-4 ${theme.text.primary}`}>{users[fb.mentee_id] || fb.mentee_id}</td>
                  <td className={`p-4 ${theme.text.primary}`}>{fb.overall}/5</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${fb.hireability?.includes('Hire') && !fb.hireability?.includes('No') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{fb.hireability}</span></td>
                  <td className={`p-4 ${theme.text.secondary}`}>{new Date(fb.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MentorFeedbacks;
