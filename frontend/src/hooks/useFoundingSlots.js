import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

export const useFoundingSlots = (pollingInterval = 30000) => {
  const [slotsData, setSlotsData] = useState({
    total: 25,
    filled: 0,
    remaining: 25,
    sold_out: false,
    loading: true,
    error: null
  });

  const fetchSlots = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/founding-slots`);
      setSlotsData({
        ...response.data,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching founding slots:', error);
      setSlotsData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load slot data'
      }));
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchSlots();

    // Set up polling if interval is provided
    if (pollingInterval > 0) {
      const interval = setInterval(fetchSlots, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [pollingInterval]);

  return { ...slotsData, refetch: fetchSlots };
};
