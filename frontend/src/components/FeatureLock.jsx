import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Crown } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const FeatureLock = ({ feature, children, fallback }) => {
  const { user } = useAuth();
  
  const checkAccess = () => {
    if (user?.status === 'Free' || !user?.plan_id) {
      return false;
    }
    
    const planFeatures = user?.plan_features || {};
    return planFeatures[feature] === true || planFeatures[feature] === 'full';
  };
  
  const hasAccess = checkAccess();
  
  if (!hasAccess) {
    return fallback || (
      <div className="bg-gray-800 rounded-xl p-8 text-center border-2 border-yellow-500/30">
        <Lock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-white text-xl font-bold mb-2">Feature Locked</h3>
        <p className="text-gray-400 mb-4">
          Upgrade to access {feature.replace(/_/g, ' ')}
        </p>
        <Link to="/mentee/book">
          <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </Link>
      </div>
    );
  }
  
  return children;
};

export default FeatureLock;
