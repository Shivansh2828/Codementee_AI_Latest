import React, { useState } from 'react';
import { Tag, X, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../utils/api';

const CouponCodeInput = ({
  serviceType,
  orderAmount,
  currency,
  onCouponApplied,
  onCouponRemoved,
}) => {
  const { theme } = useTheme();
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const currencySymbol = currency === 'USD' ? '$' : '₹';

  const formatPrice = (amountInSmallestUnit) => {
    const value = amountInSmallestUnit / 100;
    return currency === 'USD'
      ? `${currencySymbol}${value.toFixed(0)}`
      : `${currencySymbol}${value.toLocaleString('en-IN')}`;
  };

  const handleApply = async () => {
    if (!code.trim()) return;

    setValidating(true);
    setError('');
    setResult(null);

    try {
      const response = await api.post('/validate-coupon', {
        code: code.trim(),
        service_type: serviceType,
        order_amount: orderAmount,
        currency,
      });

      const data = response.data;

      if (data.valid) {
        setResult(data);
        onCouponApplied?.({
          code: data.code,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
          discounted_amount: data.discounted_amount,
        });
      } else {
        setError(data.message || 'Invalid coupon code');
      }
    } catch (err) {
      setError('Unable to validate coupon. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setResult(null);
    setError('');
    onCouponRemoved?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleApply();
    }
  };

  // Coupon applied successfully — show discount summary
  if (result) {
    return (
      <div className={`rounded-xl border ${theme.border.primary} ${theme.bg.card} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-green-500" />
            <span className={`text-sm font-semibold text-green-500`}>
              Coupon "{result.code}" applied
            </span>
          </div>
          <button
            onClick={handleRemove}
            className={`p-1 rounded-md ${theme.button.ghost} transition-colors`}
            aria-label="Remove coupon"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className={`flex justify-between ${theme.text.secondary}`}>
            <span>Original price</span>
            <span>{formatPrice(orderAmount)}</span>
          </div>
          <div className="flex justify-between text-green-500">
            <span>Discount</span>
            <span>-{formatPrice(result.discount_amount)}</span>
          </div>
          <div className={`flex justify-between font-semibold pt-1.5 border-t ${theme.border.primary} ${theme.text.primary}`}>
            <span>Final price</span>
            <span>{formatPrice(result.discounted_amount)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Default state — input field with Apply button
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.text.muted}`} />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter coupon code"
            disabled={validating}
            className={`w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[#06b6d4] ${theme.input.base} disabled:opacity-50`}
          />
        </div>
        <button
          onClick={handleApply}
          disabled={validating || !code.trim()}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${theme.button.primary} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
        >
          {validating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Validating</span>
            </>
          ) : (
            'Apply'
          )}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500 pl-1">{error}</p>
      )}
    </div>
  );
};

export default CouponCodeInput;
