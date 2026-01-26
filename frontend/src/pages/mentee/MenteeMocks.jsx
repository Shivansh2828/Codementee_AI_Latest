import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { ExternalLink } from 'lucide-react';

const MenteeMocks = () => {
  const [mocks, setMocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mocks').then(res => setMocks(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Mock Interviews">
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f172a]">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Scheduled</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="p-4 text-center text-slate-400">Loading...</td></tr>
              ) : mocks.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-slate-400">No mocks scheduled yet</td></tr>
              ) : mocks.map((mock) => (
                <tr key={mock.id} className="border-t border-[#334155]">
                  <td className="p-4 text-white">{new Date(mock.scheduled_at).toLocaleString()}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${mock.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{mock.status}</span></td>
                  <td className="p-4">
                    {mock.meet_link && mock.status === 'scheduled' && (
                      <a href={mock.meet_link} target="_blank" rel="noopener noreferrer" className="text-[#06b6d4] hover:underline flex items-center gap-1 text-sm"><ExternalLink size={14} /> Join Mock</a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MenteeMocks;
