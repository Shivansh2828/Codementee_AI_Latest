import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';

const MenteeFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/mentee/feedbacks').then(res => setFeedbacks(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Feedbacks">
      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : feedbacks.length === 0 ? (
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-8 text-center">
          <p className="text-slate-400">No feedbacks yet. Complete a mock interview to receive feedback.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-white font-semibold">Mock Interview Feedback</p>
                  <p className="text-slate-400 text-sm">{new Date(fb.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${fb.hireability?.includes('Hire') && !fb.hireability?.includes('No') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{fb.hireability}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center"><p className="text-2xl font-bold text-[#06b6d4]">{fb.overall}/5</p><p className="text-slate-400 text-xs">Overall</p></div>
                <div className="text-center"><p className="text-2xl font-bold text-white">{fb.problem_solving}/5</p><p className="text-slate-400 text-xs">Problem Solving</p></div>
                <div className="text-center"><p className="text-2xl font-bold text-white">{fb.communication}/5</p><p className="text-slate-400 text-xs">Communication</p></div>
              </div>
              <button onClick={() => setSelected(fb)} className="text-[#06b6d4] hover:underline text-sm">View Full Feedback</button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Feedback Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">Problem Solving:</span><span className="text-white ml-2">{selected.problem_solving}/5</span></div>
                <div><span className="text-slate-400">Communication:</span><span className="text-white ml-2">{selected.communication}/5</span></div>
                <div><span className="text-slate-400">Technical Depth:</span><span className="text-white ml-2">{selected.technical_depth}/5</span></div>
                <div><span className="text-slate-400">Code Quality:</span><span className="text-white ml-2">{selected.code_quality}/5</span></div>
              </div>
              <div><p className="text-[#06b6d4] font-medium mb-1">Strengths</p><p className="text-slate-300 text-sm">{selected.strengths}</p></div>
              <div><p className="text-orange-400 font-medium mb-1">Areas to Improve</p><p className="text-slate-300 text-sm">{selected.improvements}</p></div>
              <div><p className="text-green-400 font-medium mb-1">Action Items</p><p className="text-slate-300 text-sm">{selected.action_items}</p></div>
            </div>
            <button onClick={() => setSelected(null)} className="btn-secondary w-full mt-6">Close</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MenteeFeedbacks;
