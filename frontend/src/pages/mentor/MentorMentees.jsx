import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';

const MentorMentees = () => {
  const { theme } = useTheme();
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mentor/mentees').then(res => setMentees(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Mentees">
      <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={theme.bg.secondary}>
              <tr>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Name</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Email</th>
                <th className={`text-left p-4 ${theme.text.muted} font-medium`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className={`p-4 text-center ${theme.text.secondary}`}>Loading...</td></tr>
              ) : mentees.length === 0 ? (
                <tr><td colSpan={3} className={`p-4 text-center ${theme.text.secondary}`}>No mentees assigned</td></tr>
              ) : mentees.map((mentee) => (
                <tr key={mentee.id} className={`border-t ${theme.border.primary}`}>
                  <td className={`p-4 ${theme.text.primary}`}>{mentee.name}</td>
                  <td className={`p-4 ${theme.text.secondary}`}>{mentee.email}</td>
                  <td className="p-4"><span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">{mentee.status || 'Active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MentorMentees;
