import React, { useState, useEffect, useRef } from 'react';
import { X, Flame, ShoppingCart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useFoundingSlots } from '../hooks/useFoundingSlots';

const UrgencyNotification = () => {
  const { theme } = useTheme();
  const { remaining, total, sold_out, loading } = useFoundingSlots(30000);
  const [isVisible, setIsVisible] = useState(false);
  const [showPurchaseMessage, setShowPurchaseMessage] = useState(false);
  const previousRemainingRef = useRef(null);
  const intervalRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const showNotification = (isPurchase = false) => {
    console.log('🔥 SHOWING NOTIFICATION', isPurchase ? '(PURCHASE DETECTED)' : '');
    setShowPurchaseMessage(isPurchase);
    setIsVisible(true);
    
    // Clear any existing hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // Auto-hide after 10 seconds
    hideTimeoutRef.current = setTimeout(() => {
      console.log('🔥 Auto-hiding notification');
      setIsVisible(false);
      setShowPurchaseMessage(false);
    }, 10000);
  };

  // Monitor slot count changes
  useEffect(() => {
    if (loading || sold_out || remaining <= 0) return;

    // Check if slot count decreased (someone purchased)
    if (previousRemainingRef.current !== null && remaining < previousRemainingRef.current) {
      console.log('🔥 SLOT DECREASED! Someone purchased!');
      showNotification(true); // Show with purchase message
    }

    previousRemainingRef.current = remaining;
  }, [remaining, loading, sold_out]);

  // Show notification on load and every 1 minute
  useEffect(() => {
    if (loading || sold_out || remaining <= 0) {
      console.log('🔥 Skipping notification setup:', { loading, sold_out, remaining });
      return;
    }

    console.log('🔥 Setting up notifications - show immediately and every 1 minute');

    // Show immediately on load
    showNotification(false);

    // Then show every 1 minute (60 seconds)
    intervalRef.current = setInterval(() => {
      console.log('🔥 1-minute interval triggered - showing notification');
      showNotification(false);
    }, 60000); // 60 seconds

    return () => {
      console.log('🔥 Cleaning up interval');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loading, sold_out, remaining]); // Add dependencies so it reacts to changes

  // Separate effect for cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleClose = () => {
    console.log('🔥 User closed notification');
    setIsVisible(false);
    setShowPurchaseMessage(false);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };

  console.log('🔥 Render - isVisible:', isVisible, 'showPurchase:', showPurchaseMessage);

  if (!isVisible) {
    return null;
  }

  // Determine urgency level
  const getUrgencyLevel = () => {
    if (remaining <= 5) return 'critical';
    if (remaining <= 10) return 'high';
    return 'medium';
  };

  const urgencyLevel = getUrgencyLevel();

  return (
    <div
      className="fixed bottom-6 left-6 z-[9999] transition-all duration-700 ease-out"
      style={{
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: isVisible ? 1 : 0
      }}
    >
      <div 
        className="rounded-xl shadow-2xl p-4 pr-12 max-w-sm backdrop-blur-sm animate-bounce-in"
        style={{
          background: showPurchaseMessage
            ? 'linear-gradient(135deg, #10b981, #059669)' // Green for purchase
            : urgencyLevel === 'critical' 
            ? 'linear-gradient(135deg, #dc2626, #ea580c)'
            : urgencyLevel === 'high'
            ? 'linear-gradient(135deg, #f97316, #ef4444)'
            : 'linear-gradient(135deg, #f97316, #eab308)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="flex items-start gap-3">
          {/* Icon - Fire or Shopping Cart */}
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm animate-pulse">
            {showPurchaseMessage ? (
              <ShoppingCart className="w-5 h-5 text-white" />
            ) : (
              <Flame className="w-5 h-5 text-white" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {showPurchaseMessage ? (
              <>
                <p className="text-sm font-bold text-white leading-relaxed mb-1">
                  🎉 Someone just purchased a plan!
                </p>
                <p className="text-xs text-white/90">
                  Only {remaining}/{total} founding slots remaining!
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-white leading-relaxed mb-1">
                  🔥 Only {remaining}/{total} founding slots left!
                </p>
                <p className="text-xs text-white/90">
                  {urgencyLevel === 'critical' 
                    ? 'Almost sold out! Secure your spot now.'
                    : urgencyLevel === 'high'
                    ? 'Hurry! Limited spots remaining.'
                    : 'Join the founding batch before it\'s too late.'
                  }
                </p>
              </>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer pointer-events-none" />
      </div>
    </div>
  );
};

export default UrgencyNotification;
