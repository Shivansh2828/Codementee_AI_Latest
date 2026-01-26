import React from 'react';
import { Quote } from 'lucide-react';
import { testimonials } from '../../data/mock';

const TestimonialsSection = () => {
  return (
    <section className="section bg-[#0f172a]">
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="caption mb-4 block">Testimonials</span>
          <h2 className="heading-1 mb-6">
            What our members say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-6 md:p-8 rounded-xl border border-[#334155] bg-[#1e293b]/30 hover:border-[#06b6d4]/30 transition-colors duration-300"
            >
              <Quote className="text-[#06b6d4] mb-4" size={28} />
              <p className="text-slate-200 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="border-t border-[#334155] pt-4">
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-slate-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
