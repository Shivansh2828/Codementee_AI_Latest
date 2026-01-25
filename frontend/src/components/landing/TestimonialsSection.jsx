import React from 'react';
import { Quote } from 'lucide-react';
import { testimonials } from '../../data/mock';

const TestimonialsSection = () => {
  return (
    <section className="section bg-[#302f2c]">
      <div className="container">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span className="caption text-[#d9fb06] mb-4 block">Testimonials</span>
          <h2 className="heading-1 text-white mb-6">
            What our members say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="p-8 rounded-lg border border-[#3f4816] bg-[#1a1c1b] hover:border-[#d9fb06]/50 transition-colors duration-300"
            >
              <Quote className="text-[#d9fb06] mb-4" size={32} />
              <p className="text-white/90 mb-6 text-lg leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="border-t border-[#3f4816] pt-4">
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-[#888680]">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
