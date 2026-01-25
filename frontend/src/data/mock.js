// Mock data for Codementee MVP

export const siteConfig = {
  name: "Codementee",
  tagline: "Real mock interviews with engineers who've cracked product companies",
  subTagline: "No AI-only feedback. No generic courses. Limited seats. Real interviewers.",
  contactEmail: "hello@codementee.com",
  founderName: "The Codementee Team"
};

export const cohortData = {
  price: 1999,
  currency: "₹",
  totalSeats: 25,
  seatsRemaining: 18,
  includes: [
    "1 mock interview per month",
    "Detailed resume review",
    "Career roadmap planning",
    "Private mentor group access",
    "Interview feedback reports"
  ],
  note: "Price increases after launch"
};

export const problemPoints = [
  {
    id: 1,
    title: "AI feedback is generic",
    description: "Automated tools can't understand context, body language, or real interview dynamics."
  },
  {
    id: 2,
    title: "Courses don't fix execution",
    description: "Watching videos doesn't prepare you for the pressure of a real interview room."
  },
  {
    id: 3,
    title: "You don't know why you're rejected",
    description: "Companies rarely give honest feedback. You keep making the same mistakes."
  }
];

export const solutionPoints = [
  {
    id: 1,
    title: "Real Mock Interviews",
    description: "Practice with engineers who've conducted 100+ interviews at top companies."
  },
  {
    id: 2,
    title: "Structured Feedback",
    description: "Get actionable insights on your communication, problem-solving, and technical depth."
  },
  {
    id: 3,
    title: "Resume & Shortlist Strategy",
    description: "We help you position your experience for the roles you actually want."
  },
  {
    id: 4,
    title: "Mentor Accountability",
    description: "Stay on track with dedicated mentor support throughout your preparation."
  }
];

export const targetAudience = [
  "Engineers with 1-8 years of experience",
  "Actively job switching or planning in next 30-60 days",
  "Targeting product-based companies",
  "Willing to invest in serious preparation",
  "Not looking for free resources or shortcuts"
];

export const howItWorks = [
  {
    step: 1,
    title: "Apply",
    description: "Fill out a short application. We want to understand your goals."
  },
  {
    step: 2,
    title: "Get Approved",
    description: "If you're a fit, you'll receive payment and onboarding details."
  },
  {
    step: 3,
    title: "Attend Mock Interviews",
    description: "Schedule sessions with experienced interviewers."
  },
  {
    step: 4,
    title: "Improve & Upgrade",
    description: "Get better with each session. Upgrade your plan as needed."
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Rahul M.",
    role: "SDE-2 at Amazon",
    quote: "The mock interviews were brutal but exactly what I needed. Got 3 offers in my next round."
  },
  {
    id: 2,
    name: "Priya S.",
    role: "Backend Engineer at Flipkart",
    quote: "Finally understood why I was getting rejected. The feedback was specific and actionable."
  },
  {
    id: 3,
    name: "Amit K.",
    role: "DevOps Lead at Razorpay",
    quote: "Worth every rupee. My resume got 5x more callbacks after the review."
  }
];

export const formFields = [
  { id: "name", label: "Full Name", type: "text", required: true },
  { id: "email", label: "Email Address", type: "email", required: true },
  { id: "currentRole", label: "Current Role & Experience (e.g., SDE-1, 3 years)", type: "text", required: true },
  { id: "targetRole", label: "Target Role & Companies", type: "text", required: true },
  { id: "timeline", label: "Interview Timeline", type: "select", required: true, options: [
    "Within 30 days",
    "30-60 days",
    "60-90 days",
    "Just exploring"
  ]},
  { id: "struggle", label: "What's your biggest interview struggle?", type: "textarea", required: true },
  { id: "willingToInvest", label: "Are you willing to invest ₹1,999/month for serious preparation?", type: "radio", required: true, options: ["Yes", "No"] }
];
