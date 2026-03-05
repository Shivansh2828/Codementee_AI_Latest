import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, AlertCircle } from 'lucide-react';
import { Progress } from './ui/progress';

const QuotaDisplay = ({ showProgress = false, className = '' }) => {
  const { user } = useAuth();
  
  const remaining = user?.interview_quota_remaining || 0;
  const total = user?.interview_quota_total || 0;
  const percentage = total > 0 ? (remaining / total) * 100 : 0;
  
  if (user?.status === 'Free' || !user?.plan_id) {
    return null;
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {remaining === 0 ? (
        <AlertCircle className="w-4 h-4 text-red-400" />
      ) : (
        <Calendar className="w-4 h-4 text-[#06b6d4]" />
      )}
      <span className={remaining === 0 ? 'text-red-400' : 'text-gray-300'}>
        {remaining}/{total} interviews left
      </span>
      {showProgress && (
        <Progress value={percentage} className="w-24 h-2" />
      )}
    </div>
  );
};

export default QuotaDisplay;
