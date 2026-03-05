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
      <div className="bg-[#171717] rounded-xl border border-[#404040] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0d0d0d]">
              <tr>
                <th className="text-left p-4 text-gray-500 font-medium">Scheduled</th>
                <th className="text-left p-4 text-gray-500 font-medium">Status</th>
                <th className="text-left p-4 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500">Loading...</td></tr>
              ) : mocks.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-500">No mocks scheduled yet</td></tr>
              ) : mocks.map((mock) => (
                <tr key={mock.id} className="border-t border-[#404040]">
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
