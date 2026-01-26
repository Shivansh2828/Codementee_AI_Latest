import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { Building2, Calendar, Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const MenteeBooking = () => {
  const [step, setStep] = useState(1);
  const [companies, setCompanies] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, slotsRes] = await Promise.all([
          api.get('/companies'),
          api.get('/available-slots')
        ]);
        setCompanies(companiesRes.data);
        setSlots(slotsRes.data);
      } catch (e) {
        console.error('Failed to fetch data:', e);
        toast.error('Failed to load data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSlotToggle = (slotId) => {
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter(id => id !== slotId));
    } else if (selectedSlots.length < 2) {
      setSelectedSlots([...selectedSlots, slotId]);
    } else {
      toast.error('You can only select up to 2 slots');
    }
  };

  const handleSubmit = async () => {
    if (!selectedCompany || selectedSlots.length === 0) {
      toast.error('Please select a company and at least one slot');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.post('/mentee/booking-request', {
        company_id: selectedCompany.id,
        slot_ids: selectedSlots
      });
      toast.success('Booking request submitted! Your mentor will confirm soon.');
      // Reset form
      setStep(1);
      setSelectedCompany(null);
      setSelectedSlots([]);
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to submit booking request');
    }
    setSubmitting(false);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <DashboardLayout title="Schedule Mock Interview">
        <div className="text-center py-12 text-slate-400">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Schedule Mock Interview">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#06b6d4]' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 1 ? 'bg-[#06b6d4] text-[#0f172a]' : 'bg-[#334155] text-slate-400'}`}>1</div>
          <span className="hidden sm:inline font-medium">Select Company</span>
        </div>
        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-[#06b6d4]' : 'bg-[#334155]'}`} />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#06b6d4]' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 2 ? 'bg-[#06b6d4] text-[#0f172a]' : 'bg-[#334155] text-slate-400'}`}>2</div>
          <span className="hidden sm:inline font-medium">Choose Slots</span>
        </div>
        <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-[#06b6d4]' : 'bg-[#334155]'}`} />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#06b6d4]' : 'text-slate-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${step >= 3 ? 'bg-[#06b6d4] text-[#0f172a]' : 'bg-[#334155] text-slate-400'}`}>3</div>
          <span className="hidden sm:inline font-medium">Confirm</span>
        </div>
      </div>

      {/* Step 1: Select Company */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Which company are you preparing for?</h2>
          <p className="text-slate-400 mb-6">Select the company you want to practice your mock interview for</p>
          
          {companies.length === 0 ? (
            <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-8 text-center">
              <Building2 size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">No companies available yet</p>
              <p className="text-slate-500 text-sm">Please contact support or wait for admin to add companies</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => setSelectedCompany(company)}
                  className={`p-5 rounded-xl border text-left transition-all ${
                    selectedCompany?.id === company.id
                      ? 'bg-[#06b6d4]/10 border-[#06b6d4]'
                      : 'bg-[#1e293b] border-[#334155] hover:border-[#06b6d4]/50'
                  }`}
                  data-testid={`company-select-${company.id}`}
                >
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
                    {selectedCompany?.id === company.id && (
                      <CheckCircle size={20} className="text-[#06b6d4] ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {selectedCompany && (
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 bg-[#06b6d4] text-[#0f172a] px-6 py-2.5 rounded-lg font-medium hover:bg-[#06b6d4]/90 transition-colors"
                data-testid="next-step-btn"
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Choose Slots */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Select your preferred time slots</h2>
          <p className="text-slate-400 mb-6">Choose up to 2 slots that work for you. Your mentor will confirm one.</p>
          
          {Object.keys(groupedSlots).length === 0 ? (
            <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-8 text-center">
              <Calendar size={48} className="mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">No available slots at the moment</p>
              <p className="text-slate-500 text-sm">Please check back later or contact support</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSlots).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, dateSlots]) => (
                <div key={date} className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
                  <div className="bg-[#0f172a] px-5 py-3 border-b border-[#334155]">
                    <span className="text-white font-medium">{formatDate(date)}</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {dateSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSlotToggle(slot.id)}
                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                          selectedSlots.includes(slot.id)
                            ? 'bg-[#06b6d4]/10 border-[#06b6d4] text-[#06b6d4]'
                            : 'bg-[#0f172a] border-[#334155] text-slate-300 hover:border-[#06b6d4]/50'
                        }`}
                        data-testid={`slot-select-${slot.id}`}
                      >
                        <Clock size={16} />
                        <span className="font-medium">{slot.start_time} - {slot.end_time}</span>
                        {selectedSlots.includes(slot.id) && <CheckCircle size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">{selectedSlots.length}/2 slots selected</span>
              <button
                onClick={() => setStep(3)}
                disabled={selectedSlots.length === 0}
                className="flex items-center gap-2 bg-[#06b6d4] text-[#0f172a] px-6 py-2.5 rounded-lg font-medium hover:bg-[#06b6d4]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="next-step-btn"
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Review your booking request</h2>
          <p className="text-slate-400 mb-6">Please confirm the details below. Your mentor will receive a notification.</p>
          
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-[#334155]">
                <div className="w-12 h-12 bg-[#0f172a] rounded-lg flex items-center justify-center">
                  <Building2 size={24} className="text-[#06b6d4]" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Company</p>
                  <p className="text-white font-medium text-lg">{selectedCompany?.name}</p>
                </div>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm mb-3">Preferred Time Slots</p>
                <div className="space-y-2">
                  {selectedSlots.map((slotId) => {
                    const slot = slots.find(s => s.id === slotId);
                    return slot ? (
                      <div key={slotId} className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-lg">
                        <Calendar size={18} className="text-[#06b6d4]" />
                        <span className="text-white">{formatDate(slot.date)}</span>
                        <Clock size={18} className="text-slate-400 ml-4" />
                        <span className="text-white">{slot.start_time} - {slot.end_time}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm">
              <strong>Note:</strong> After submitting, your mentor will review and confirm one of your preferred slots. You'll receive an email notification once confirmed.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-[#10b981] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-[#10b981]/90 transition-colors disabled:opacity-50"
              data-testid="submit-booking-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MenteeBooking;
