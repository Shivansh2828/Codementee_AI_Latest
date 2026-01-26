import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { Building2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', logo_url: '', description: '' });

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
      setFormData({ name: '', logo_url: '', description: '' });
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
            <div key={company.id} className="bg-[#1e293b] rounded-xl border border-[#334155] p-5 flex items-start justify-between" data-testid={`company-${company.id}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0f172a] rounded-lg flex items-center justify-center">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <Building2 size={24} className="text-[#06b6d4]" />
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium">{company.name}</h3>
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
