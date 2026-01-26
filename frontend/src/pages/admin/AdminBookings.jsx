import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { ClipboardList, Clock, CheckCircle, XCircle, Building2 } from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/admin/booking-requests');
        setBookings(response.data);
      } catch (e) {
        console.error('Failed to fetch bookings:', e);
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400"><CheckCircle size={12} /> Confirmed</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400"><Clock size={12} /> Pending</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500/20 text-red-400"><XCircle size={12} /> Cancelled</span>;
      default:
        return <span className="text-slate-400 text-xs">{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

  return (
    <DashboardLayout title="Booking Requests">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
          <p className="text-slate-400 text-sm">Total Requests</p>
          <p className="text-2xl font-bold text-white">{bookings.length}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-5">
          <p className="text-slate-400 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-400">{confirmedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'confirmed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? 'bg-[#06b6d4] text-[#0f172a]' : 'bg-[#1e293b] text-slate-300 hover:bg-[#334155]'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <p className="text-slate-400 text-center py-8">Loading...</p>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-8 text-center">
          <ClipboardList size={48} className="mx-auto text-slate-500 mb-4" />
          <p className="text-slate-400">No booking requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-[#1e293b] rounded-xl border border-[#334155] p-5" data-testid={`booking-${booking.id}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#06b6d4]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 size={20} className="text-[#06b6d4]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">{booking.company_name}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    <p className="text-slate-400 text-sm">
                      <strong>Mentee:</strong> {booking.mentee_name} ({booking.mentee_email})
                    </p>
                    <p className="text-slate-400 text-sm">
                      <strong>Mentor:</strong> {booking.mentor_name}
                    </p>
                    <div className="mt-2">
                      <p className="text-slate-500 text-xs mb-1">Preferred Slots:</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.preferred_slots?.map((slot, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded ${
                            booking.confirmed_slot?.id === slot.id 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-[#0f172a] text-slate-300'
                          }`}>
                            {slot.date} {slot.start_time}-{slot.end_time}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right text-slate-400 text-sm">
                  <p>Requested: {formatDate(booking.created_at)}</p>
                  {booking.meeting_link && (
                    <a href={booking.meeting_link} target="_blank" rel="noopener noreferrer" className="text-[#06b6d4] hover:underline">
                      Meeting Link
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminBookings;
