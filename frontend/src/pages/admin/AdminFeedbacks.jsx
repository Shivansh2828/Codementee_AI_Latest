import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';

const AdminFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fbRes, menteesRes, mentorsRes] = await Promise.all([
          api.get('/admin/feedbacks'),
          api.get('/admin/mentees'),
          api.get('/admin/mentors')
        ]);
        setFeedbacks(fbRes.data);
        const userMap = {};
        [...menteesRes.data, ...mentorsRes.data].forEach(u => userMap[u.id] = u.name);
        setUsers(userMap);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout title="All Feedbacks">
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f172a]">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Mentee</th>
                <th className="text-left p-4 text-slate-400 font-medium">Mentor</th>
                <th className="text-left p-4 text-slate-400 font-medium">Overall</th>
                <th className="text-left p-4 text-slate-400 font-medium">Hireability</th>
                <th className="text-left p-4 text-slate-400 font-medium">Date</th>
                <th className="text-left p-4 text-slate-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-400">Loading...</td></tr>
              ) : feedbacks.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-400">No feedbacks yet</td></tr>
              ) : feedbacks.map((fb) => (
                <tr key={fb.id} className="border-t border-[#334155]">
                  <td className="p-4 text-white">{users[fb.mentee_id] || fb.mentee_id}</td>
                  <td className="p-4 text-slate-300">{users[fb.mentor_id] || fb.mentor_id}</td>
                  <td className="p-4 text-white">{fb.overall}/5</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${fb.hireability?.includes('Hire') && !fb.hireability?.includes('No') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{fb.hireability}</span></td>
                  <td className="p-4 text-slate-300">{new Date(fb.created_at).toLocaleDateString()}</td>
                  <td className="p-4"><button onClick={() => setSelected(fb)} className="text-[#06b6d4] hover:underline text-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Feedback Details</h2>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-400">Problem Solving:</span> <span className="text-white ml-2">{selected.problem_solving}/5</span></div>
                <div><span className="text-slate-400">Communication:</span> <span className="text-white ml-2">{selected.communication}/5</span></div>
                <div><span className="text-slate-400">Technical Depth:</span> <span className="text-white ml-2">{selected.technical_depth}/5</span></div>
                <div><span className="text-slate-400">Code Quality:</span> <span className="text-white ml-2">{selected.code_quality}/5</span></div>
              </div>
              <div><span className="text-slate-400">Strengths:</span><p className="text-white mt-1">{selected.strengths}</p></div>
              <div><span className="text-slate-400">Areas to Improve:</span><p className="text-white mt-1">{selected.improvements}</p></div>
              <div><span className="text-slate-400">Action Items:</span><p className="text-white mt-1">{selected.action_items}</p></div>
            </div>
            <button onClick={() => setSelected(null)} className="btn-secondary w-full mt-6">Close</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminFeedbacks;
