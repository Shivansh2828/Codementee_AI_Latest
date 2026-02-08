import React from 'react';
import { Quote } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { testimonials } from '../../data/mock';

const TestimonialsSection = () => {
  const { theme } = useTheme();

  return (
    <section className={`section ${theme.bg.secondary}`}>
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className={`caption mb-4 block ${theme.text.accent}`}>Testimonials</span>
          <h2 className={`heading-1 mb-6 ${theme.text.primary}`}>
            What our members say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`p-6 md:p-8 rounded-xl ${theme.border.primary} border ${theme.glass} hover:border-[#06b6d4]/30 transition-colors duration-300`}
            >
              <Quote className="text-[#06b6d4] mb-4" size={28} />
              <p className={`${theme.text.primary} mb-6 leading-relaxed`}>
                "{testimonial.quote}"
              </p>
              <div className={`${theme.border.primary} border-t pt-4`}>
                <p className={`font-semibold ${theme.text.primary}`}>{testimonial.name}</p>
                <p className={`text-sm ${theme.text.secondary}`}>{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
