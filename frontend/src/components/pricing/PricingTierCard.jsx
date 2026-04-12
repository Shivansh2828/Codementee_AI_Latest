import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const PricingTierCard = ({
  name,
  price,
  currencySymbol,
  features = [],
  ctaLabel = 'Get Started',
  ctaHref = '/register',
  isPopular = false,
  badge,
  subtitle,
  discountPercent,
}) => {
  const { theme } = useTheme();

  // Format price: divide by 100 (prices stored in paise/cents)
  const displayPrice = typeof price === 'number'
    ? (currencySymbol === '$'
        ? (price / 100).toFixed(0)
        : (price / 100).toLocaleString('en-IN'))
    : price;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        isPopular
          ? `${theme.bg.card} border-2 border-[#06b6d4] shadow-2xl shadow-[#06b6d4]/20 md:scale-105 md:-mt-4 md:mb-4`
          : `${theme.bg.card} ${theme.border.primary} border hover:border-[#06b6d4]/50`
      }`}
    >
      {/* Popular / Discount Badge */}
      {(badge || (discountPercent > 0)) && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg">
          {badge || `Save ${discountPercent}%`}
        </div>
      )}

      <div className="p-8">
        {/* Plan Name */}
        <h3 className={`text-2xl font-bold mb-2 ${theme.text.primary}`}>
          {name}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className={`text-sm ${theme.text.secondary} mb-4`}>
            {subtitle}
          </p>
        )}

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className={`text-lg ${theme.text.secondary}`}>{currencySymbol}</span>
            <span className={`text-5xl font-bold ${theme.text.primary}`}>
              {displayPrice}
            </span>
          </div>
          <p className={`text-sm ${theme.text.muted} mt-2`}>One-Time Payment</p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  isPopular ? 'bg-[#06b6d4]' : theme.bg.secondary
                }`}
              >
                <Check
                  size={12}
                  className={isPopular ? 'text-white' : 'text-[#06b6d4]'}
                  strokeWidth={3}
                />
              </div>
              <span className={`text-sm ${theme.text.secondary}`}>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link
          to={ctaHref}
          className={`w-full py-3.5 px-6 rounded-xl font-semibold text-center transition-all duration-200 flex items-center justify-center gap-2 ${
            isPopular
              ? 'bg-[#06b6d4] hover:bg-[#0891b2] text-white shadow-lg shadow-[#06b6d4]/30'
              : `${theme.bg.secondary} ${theme.text.primary} hover:bg-[#06b6d4] hover:text-white border ${theme.border.primary}`
          }`}
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
};

export default PricingTierCard;
