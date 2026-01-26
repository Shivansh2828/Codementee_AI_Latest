import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';

const AdminMentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/mentors').then(res => setMentors(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Mentors">
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f172a]">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Name</th>
                <th className="text-left p-4 text-slate-400 font-medium">Email</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="p-4 text-center text-slate-400">Loading...</td></tr>
              ) : mentors.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-slate-400">No mentors yet</td></tr>
              ) : mentors.map((mentor) => (
                <tr key={mentor.id} className="border-t border-[#334155]">
                  <td className="p-4 text-white">{mentor.name}</td>
                  <td className="p-4 text-slate-300">{mentor.email}</td>
                  <td className="p-4"><span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">{mentor.status || 'Active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminMentors;
