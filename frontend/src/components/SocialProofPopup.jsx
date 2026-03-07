import React, { useState, useEffect, useRef } from 'react';
import { User, X } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

// Indian cities for fallback
const INDIAN_CITIES = [
  'Bangalore', 'Delhi', 'Mumbai', 'Hyderabad', 'Pune', 
  'Chennai', 'Kolkata', 'Ahmedabad', 'Noida', 'Gurgaon'
];

const SocialProofPopup = () => {
  const { theme } = useTheme();
  const [bookings, setBookings] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  // Fetch recent bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/recent-bookings`);
        if (response.data && response.data.length > 0) {
          setBookings(response.data);
        }
      } catch (error) {
        console.error('Error fetching recent bookings:', error);
      }
    };

    fetchBookings();
    // Refresh bookings every 5 minutes
    const interval = setInterval(fetchBookings, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Show popup at random intervals
  useEffect(() => {
    if (bookings.length === 0 || isVisible) return;

    const scheduleNextPopup = () => {
      // Random delay between 20-40 seconds
      const delay = Math.random() * 20000 + 20000;
      
      console.log(`📢 Scheduling next popup in ${Math.round(delay/1000)} seconds`);

      timeoutRef.current = setTimeout(() => {
        const booking = bookings[currentIndex];
        console.log('📢 Showing popup for booking:', booking);
        setCurrentBooking(booking);
        setIsVisible(true);

        // Auto hide after 6 seconds
        hideTimeoutRef.current = setTimeout(() => {
          console.log('📢 Auto-hiding popup');
          setIsVisible(false);
          // Move to next booking after hiding
          setCurrentIndex((prev) => (prev + 1) % bookings.length);
        }, 6000);
      }, delay);
    };

    // Schedule the next popup
    scheduleNextPopup();

    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [bookings, currentIndex, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    // Clear hide timeout if user manually closes
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    // Move to next booking
    setCurrentIndex((prev) => (prev + 1) % bookings.length);
  };

  if (!currentBooking || !isVisible) return null;

  // Get random city for display
  const city = INDIAN_CITIES[Math.floor(Math.random() * INDIAN_CITIES.length)];

  // Format message
  const getMessage = () => {
    const { first_name, interview_type, company_name } = currentBooking;
    
    if (company_name && interview_type) {
      return `${first_name} from ${city} just booked a ${company_name} ${interview_type} mock`;
    } else if (interview_type) {
      return `${first_name} from ${city} just booked a ${interview_type} mock`;
    } else {
      return `${first_name} from ${city} just booked a mock interview`;
    }
  };

  return (
    <div
      className={`fixed bottom-6 left-6 z-[9998] transition-all duration-500 ease-out ${
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className="rounded-xl shadow-2xl p-4 pr-12 max-w-sm backdrop-blur-sm"
        style={{
          backgroundColor: theme.bg.card,
          borderColor: theme.border.primary,
          borderWidth: '1px'
        }}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p 
              className="text-sm font-medium leading-relaxed"
              style={{ color: theme.text.primary }}
            >
              👨‍💻 {getMessage()}
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: theme.text.secondary }}
            >
              Just now
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 transition-colors"
          style={{ color: theme.text.secondary }}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Subtle pulse indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </div>
      </div>
    </div>
  );
};

export default SocialProofPopup;
