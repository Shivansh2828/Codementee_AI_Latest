import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import api from '../../utils/api';
import { CheckCircle, Clock, XCircle, Search, Calendar } from 'lucide-react';

const AdminPayments = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/admin/orders').then(res => setOrders(res.data)).finally(() => setLoading(false));
  }, []);

  const planNames = {
    monthly: 'Monthly',
    quarterly: '3 Months',
    biannual: '6 Months'
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.razorpay_payment_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || order.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.amount || 0), 0) / 100;
  const paidCount = orders.filter(o => o.status === 'paid').length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <DashboardLayout title="Payments & Orders">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <p className="text-slate-400 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <p className="text-slate-400 text-sm">Successful Payments</p>
          <p className="text-3xl font-bold text-[#06b6d4] mt-1">{paidCount}</p>
        </div>
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <p className="text-slate-400 text-sm">Pending Orders</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{pendingCount}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06b6d4]"
            data-testid="search-orders-input"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'paid', 'pending'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-[#06b6d4] text-[#0f172a]' : 'bg-[#1e293b] text-slate-300 hover:bg-[#334155]'
              }`}
              data-testid={`filter-${f}-btn`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${orders.length})` : f === 'paid' ? `(${paidCount})` : `(${pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="orders-table">
            <thead className="bg-[#0f172a]">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium">Customer</th>
                <th className="text-left p-4 text-slate-400 font-medium">Plan</th>
                <th className="text-left p-4 text-slate-400 font-medium">Amount</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Payment ID</th>
                <th className="text-left p-4 text-slate-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-400">Loading...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-slate-400">{searchTerm ? 'No orders match your search' : 'No orders found'}</td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="border-t border-[#334155] hover:bg-[#334155]/30 transition-colors" data-testid={`order-row-${order.id}`}>
                  <td className="p-4">
                    <p className="text-white font-medium">{order.name}</p>
                    <p className="text-slate-400 text-sm">{order.email}</p>
                  </td>
                  <td className="p-4 text-slate-300">{planNames[order.plan_id] || order.plan_id}</td>
                  <td className="p-4 text-[#06b6d4] font-semibold">₹{((order.amount || 0) / 100).toLocaleString()}</td>
                  <td className="p-4">
                    {order.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400">
                        <CheckCircle size={12} /> Paid
                      </span>
                    ) : order.status === 'pending' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-400">
                        <Clock size={12} /> Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                        <XCircle size={12} /> {order.status}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 text-sm font-mono">
                    {order.razorpay_payment_id || '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                      <Calendar size={14} />
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </div>
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

export default AdminPayments;
