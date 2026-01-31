import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { Building2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    logo_url: '', 
    description: '', 
    category: 'product',
    interview_tracks: [],
    difficulty_levels: ['junior', 'mid', 'senior']
  });

  const categoryOptions = [
    { value: 'product', label: 'Product Company', color: 'text-blue-400' },
    { value: 'unicorn', label: 'Indian Unicorn', color: 'text-purple-400' },
    { value: 'startup', label: 'Startup', color: 'text-green-400' },
    { value: 'service', label: 'Service Company', color: 'text-orange-400' }
  ];

  const difficultyOptions = [
    { value: 'junior', label: 'Junior (0-2 years)' },
    { value: 'mid', label: 'Mid-level (2-5 years)' },
    { value: 'senior', label: 'Senior (5+ years)' },
    { value: 'staff_plus', label: 'Staff+ (8+ years)' }
  ];

  const handleTrackChange = (track) => {
    const tracks = formData.interview_tracks.includes(track)
      ? formData.interview_tracks.filter(t => t !== track)
      : [...formData.interview_tracks, track];
    setFormData({ ...formData, interview_tracks: tracks });
  };

  const handleDifficultyChange = (level) => {
    const levels = formData.difficulty_levels.includes(level)
      ? formData.difficulty_levels.filter(l => l !== level)
      : [...formData.difficulty_levels, level];
    setFormData({ ...formData, difficulty_levels: levels });
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/admin/companies');
      setCompanies(response.data);
    } catch (e) {
      console.error('Failed to fetch companies:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/companies', formData);
      toast.success('Company added successfully');
      setShowModal(false);
      setFormData({ 
        name: '', 
        logo_url: '', 
        description: '', 
        category: 'product',
        interview_tracks: [],
        difficulty_levels: ['junior', 'mid', 'senior']
      });
      fetchCompanies();
    } catch (e) {
      toast.error('Failed to add company');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await api.delete(`/admin/companies/${id}`);
      toast.success('Company deleted');
      fetchCompanies();
    } catch (e) {
      toast.error('Failed to delete company');
    }
  };

  return (
    <DashboardLayout title="Manage Companies">
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-400">Companies available for mock interviews</p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#06b6d4] text-[#0f172a] px-4 py-2 rounded-lg font-medium hover:bg-[#06b6d4]/90 transition-colors"
          data-testid="add-company-btn"
        >
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-slate-400 col-span-full text-center py-8">Loading...</p>
        ) : companies.length === 0 ? (
          <p className="text-slate-400 col-span-full text-center py-8">No companies added yet</p>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="bg-[#1e293b] rounded-xl border border-[#334155] p-5" data-testid={`company-${company.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0f172a] rounded-lg flex items-center justify-center">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name} className="w-8 h-8 object-contain" />
                    ) : (
                      <Building2 size={24} className="text-[#06b6d4]" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{company.name}</h3>
                      {company.category && (
                        <span className={`px-2 py-1 text-xs rounded ${
                          company.category === 'product' ? 'bg-blue-400/20 text-blue-400' :
                          company.category === 'unicorn' ? 'bg-purple-400/20 text-purple-400' :
                          company.category === 'startup' ? 'bg-green-400/20 text-green-400' :
                          'bg-orange-400/20 text-orange-400'
                        }`}>
                          {company.category}
                        </span>
                      )}
                    </div>
                    {company.description && <p className="text-slate-400 text-sm">{company.description}</p>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(company.id)}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1"
                  data-testid={`delete-company-${company.id}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              {/* Interview Tracks */}
              {company.interview_tracks && company.interview_tracks.length > 0 && (
                <div className="mb-3">
                  <p className="text-slate-400 text-xs mb-2">Interview Tracks:</p>
                  <div className="flex flex-wrap gap-1">
                    {company.interview_tracks.slice(0, 4).map((track) => (
                      <span key={track} className="px-2 py-1 bg-[#0f172a] text-slate-300 text-xs rounded">
                        {track.toUpperCase()}
                      </span>
                    ))}
                    {company.interview_tracks.length > 4 && (
                      <span className="px-2 py-1 bg-[#0f172a] text-slate-400 text-xs rounded">
                        +{company.interview_tracks.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Difficulty Levels */}
              {company.difficulty_levels && company.difficulty_levels.length > 0 && (
                <div>
                  <p className="text-slate-400 text-xs mb-2">Supported Levels:</p>
                  <div className="flex flex-wrap gap-1">
                    {company.difficulty_levels.map((level) => (
                      <span key={level} className="px-2 py-1 bg-[#334155] text-slate-300 text-xs rounded">
                        {level.replace('_', '+')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Company Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-[#334155]">
              <h3 className="text-lg font-semibold text-white">Add Company</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                  placeholder="e.g., Amazon"
                  data-testid="company-name-input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Logo URL (optional)</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4] resize-none"
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Interview Tracks (optional)</label>
                <p className="text-xs text-slate-400 mb-3">Add role-specific tracks like L4, SDE2, etc.</p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="e.g., sde1, l4, senior"
                    className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const track = e.target.value.trim().toLowerCase();
                        if (track && !formData.interview_tracks.includes(track)) {
                          setFormData({ 
                            ...formData, 
                            interview_tracks: [...formData.interview_tracks, track] 
                          });
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  {formData.interview_tracks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.interview_tracks.map((track) => (
                        <span
                          key={track}
                          className="px-2 py-1 bg-[#06b6d4]/20 text-[#06b6d4] text-sm rounded flex items-center gap-1"
                        >
                          {track.toUpperCase()}
                          <button
                            type="button"
                            onClick={() => handleTrackChange(track)}
                            className="text-[#06b6d4] hover:text-white"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Supported Difficulty Levels</label>
                <div className="grid grid-cols-2 gap-2">
                  {difficultyOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.difficulty_levels.includes(option.value)}
                        onChange={() => handleDifficultyChange(option.value)}
                        className="w-4 h-4 text-[#06b6d4] bg-[#0f172a] border-[#334155] rounded focus:ring-[#06b6d4]"
                      />
                      <span className="text-sm text-slate-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-[#334155] text-white rounded-lg hover:bg-[#475569] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#06b6d4] text-[#0f172a] rounded-lg font-medium hover:bg-[#06b6d4]/90 transition-colors"
                  data-testid="submit-company-btn"
                >
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminCompanies;
