import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { Badge } from '../../components/ui/badge';
import { Receipt, Loader2, CreditCard, Tag, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../utils/api';

const MenteeTransactions = () => {
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/mentee/transactions');
        setTransactions(response.data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const formatAmount = (amount, cur) => {
    const value = amount / 100;
    const symbol = cur === 'USD' ? '$' : '\u20B9';
    const locale = cur === 'USD' ? 'en-US' : 'en-IN';
    return symbol + value.toLocaleString(locale);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status] || styles.pending;
  };

  const getGatewayLabel = (gateway) => {
    if (gateway === 'razorpay') return 'Razorpay';
    if (gateway === 'cashfree') return 'Cashfree';
    return gateway || 'N/A';
  };

  if (loading) {
    return (
      <DashboardLayout title="Transaction History">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#06b6d4] mx-auto mb-4" />
            <p className={theme.text.secondary}>Loading transactions...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Transaction History">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Receipt className={`w-12 h-12 ${theme.text.muted} mx-auto mb-4`} />
            <p className={theme.text.secondary}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 text-[#06b6d4] rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Transaction History">
      <div className="space-y-6">
        {/* Transaction List */}
        {transactions.length === 0 ? (
          <div className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-8 text-center`}>
            <Receipt className={`w-12 h-12 ${theme.text.muted} mx-auto mb-4`} />
            <p className={theme.text.secondary}>No transactions yet.</p>
            <p className={`${theme.text.muted} text-sm mt-2`}>
              Your purchase history will appear here once you make a payment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => {
              const hasCoupon = !!txn.coupon_code && txn.original_amount && txn.original_amount !== txn.amount;
              return (
                <div
                  key={txn.id}
                  className={`${theme.bg.card} rounded-xl border ${theme.border.primary} p-5 hover:border-[#06b6d4]/50 transition-colors`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Plan info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`${theme.text.primary} font-semibold`}>{txn.plan_name}</p>
                        {txn.is_upgrade && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                            Upgrade
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`${theme.text.muted} text-sm flex items-center gap-1`}>
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(txn.created_at)}
                        </span>
                        <span className={`${theme.text.muted} text-sm flex items-center gap-1`}>
                          <CreditCard className="w-3.5 h-3.5" />
                          {getGatewayLabel(txn.payment_gateway)}
                        </span>
                        {txn.coupon_code && (
                          <span className="text-xs flex items-center gap-1 bg-[#06b6d4]/10 text-[#06b6d4] px-2 py-0.5 rounded-full">
                            <Tag className="w-3 h-3" />
                            {txn.coupon_code}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: Amount + Status */}
                    <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                      <div className="text-right">
                        {hasCoupon && (
                          <p className={`${theme.text.muted} text-sm line-through`}>
                            {formatAmount(txn.original_amount, txn.currency)}
                          </p>
                        )}
                        <p className={`${theme.text.primary} font-bold text-lg`}>
                          {formatAmount(txn.amount, txn.currency)}
                        </p>
                      </div>
                      <Badge className={`${getStatusBadge(txn.status)} border text-xs capitalize`}>
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MenteeTransactions;
