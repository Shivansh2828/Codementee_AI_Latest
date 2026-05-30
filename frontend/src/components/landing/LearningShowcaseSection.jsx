import React from 'react';
import { BookOpen } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { learningCategories } from '../../data/learningContent';
import ContentCard from '../shared/ContentCard';
import api from '../../utils/api';

const LearningShowcaseSection = () => {
  const { theme } = useTheme();
  const [coursePrices, setCoursePrices] = React.useState({});

  // Fetch course pricing dynamically
  React.useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await api.get('/pricing-plans?service_type=course');
        const plans = response.data;
        const priceMap = {};
        plans.forEach(plan => {
          priceMap[plan.plan_id] = plan;
        });
        setCoursePrices(priceMap);
        console.log('✅ Homepage course pricing loaded:', priceMap);
      } catch (error) {
        console.error('❌ Failed to fetch homepage pricing:', error);
      }
    };
    fetchPricing();
  }, []);

  // Get display price for a category
  const getDisplayPrice = (category) => {
    if (category.isFree) return category.access;
    if (category.planId && coursePrices[category.planId]) {
      const price = coursePrices[category.planId].price;
      return `₹${(price / 100).toLocaleString()}`;
    }
    return category.access || 'Loading...';
  };

  return (
    <section className={`py-20 md:py-28 ${theme.bg.secondary}`}>
      <div className="container mx-auto px-4">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2
            className={`text-3xl md:text-5xl font-bold mb-4 ${theme.text.primary} leading-tight`}
          >
            What You'll <span className="text-[#06b6d4]">Learn</span>
          </h2>
          <p className={`text-lg ${theme.text.secondary} max-w-2xl mx-auto`}>
            Everything you need to crack product-based company interviews — from
            system design to behavioral prep.
          </p>
        </div>

        {/* Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {learningCategories.map((category) => (
            <ContentCard
              key={category.id}
              icon={category.icon}
              title={category.title}
              description={category.description}
              topicCount={category.topicCount}
              href={category.href}
              isFree={category.isFree}
              access={getDisplayPrice(category)}
              gradient={category.gradient}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningShowcaseSection;
