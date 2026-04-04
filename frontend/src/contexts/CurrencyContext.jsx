import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR');
  const [isIndia, setIsIndia] = useState(true);
  const [loading, setLoading] = useState(true);
  const [countryCode, setCountryCode] = useState('IN');

  useEffect(() => {
    detectCurrency();
  }, []);

  const detectCurrency = async () => {
    try {
      // Determine backend URL
      const isProduction = window.location.hostname === 'codementee.io' || 
                          window.location.hostname === 'www.codementee.io';
      const backendUrl = isProduction 
        ? 'https://codementee.io' 
        : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001');
      
      const response = await axios.get(`${backendUrl}/api/detect-currency`, {
        timeout: 5000
      });
      
      setCurrency(response.data.currency);
      setIsIndia(response.data.is_india);
      setCountryCode(response.data.country);
      
      console.log('Currency detected:', response.data);
    } catch (error) {
      console.error('Currency detection failed, defaulting to INR:', error);
      // Default to INR if detection fails
      setCurrency('INR');
      setIsIndia(true);
      setCountryCode('IN');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount, curr = currency) => {
    if (curr === 'USD') {
      return `$${(amount / 100).toFixed(0)}`;
    } else {
      return `₹${(amount / 100).toLocaleString('en-IN')}`;
    }
  };

  const getCurrencySymbol = (curr = currency) => {
    return curr === 'USD' ? '$' : '₹';
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        isIndia, 
        loading, 
        countryCode,
        formatPrice,
        getCurrencySymbol,
        detectCurrency
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
