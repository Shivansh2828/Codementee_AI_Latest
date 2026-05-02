import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import api from '../utils/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const [message, setMessage] = useState('Verifying your payment...');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 10; // Stop polling after ~30 seconds
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      verifyPayment();
    } else {
      setStatus('failed');
      setMessage('No order ID found. Please contact support.');
    }
  }, [orderId]);

  const verifyPayment = async () => {
    try {
      const response = await api.get(`/payment/cashfree-status/${orderId}`);
      const data = response.data;

      if (data.status === 'paid') {
        setStatus('success');
        setMessage('Payment successful! Your account has been activated.');
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
        }
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate('/mentee');
        }, 3000);
      } else if (data.status === 'pending') {
        setRetryCount(prev => {
          const next = prev + 1;
          if (next >= maxRetries) {
            setStatus('failed');
            setMessage('Payment verification is taking longer than expected. If you were charged, your account will be activated shortly. Please check your email or contact support.');
            return next;
          }
          setMessage(`Payment is being processed... (attempt ${next}/${maxRetries})`);
          setTimeout(verifyPayment, 3000);
          return next;
        });
      } else {
        setStatus('failed');
        setMessage(data.message || 'Payment could not be verified. Please contact support.');
      }
    } catch (error) {
      setStatus('failed');
      setMessage('Unable to verify payment. If you were charged, please contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header />
      <main className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container">
          <div className="max-w-md mx-auto text-center">
            {status === 'verifying' && (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-[#06b6d4] mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-white mb-3">{message}</h1>
                <p className="text-gray-500">Please don't close this page.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-white mb-3">{message}</h1>
                <p className="text-gray-500 mb-8">You can now access all your features.</p>
                <Link
                  to="/mentee"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#06b6d4] text-white font-semibold rounded-xl hover:bg-[#0891b2] transition-colors"
                >
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              </>
            )}

            {status === 'failed' && (
              <>
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-white mb-3">Payment Verification Issue</h1>
                <p className="text-gray-500 mb-8">{message}</p>
                <div className="space-y-3">
                  <Link
                    to="/mentee"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#06b6d4] text-white font-semibold rounded-xl hover:bg-[#0891b2] transition-colors"
                  >
                    Go to Dashboard <ArrowRight size={18} />
                  </Link>
                  <p className="text-gray-600 text-sm">
                    Need help?{' '}
                    <a href="mailto:support@codementee.com" className="text-[#06b6d4] hover:underline">
                      Contact Support
                    </a>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
