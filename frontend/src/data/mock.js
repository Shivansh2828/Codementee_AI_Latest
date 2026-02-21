// Mock data for Codementee MVP

export const siteConfig = {
  name: "Codementee",
  tagline: "Real mock interviews with engineers who've cracked product based companies",
  subTagline: "No AI-only feedback. No generic courses. Limited seats. Real interviewers.",
  contactEmail: "support@codementee.com",
  whatsapp: "+91-9731842807",
  founderName: "The Codementee Team"
};

// Companies where our mentors have worked - with logo URLs
export const targetCompanies = [
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
  { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { name: "Uber", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" }
];

export const cohortData = {
  totalSeats: 25,
  seatsRemaining: 18,
  intensiveSeatsRemaining: 7,
  currency: "₹",
  launchPhase: "Limited Launch - 25 Spots Only"
};

// Pricing Plans - One-time Payment (No Subscriptions)
export const pricingPlans = [
  {
    id: "starter",
    plan_id: "starter",
    name: "Mock Starter",
    description: "Best for engineers who want a structured evaluation before real interviews",
    duration: "One-time payment",
    price: 2999,
    priceUSD: 36,
    originalPrice: null,
    perSession: 2999,
    popular: false,
    is_active: true,
    display_order: 1,
    features: [
      "1 MAANG-Level Mock Interview",
      "Detailed Feedback Report",
      "Resume Review (Email-based)",
      "Proven Resume Templates",
      "Free AI ATS Resume Checker Access"
    ],
    cta: "Get Evaluated",
    justification: "Perfect for engineers who want a structured evaluation before real interviews."
  },
  {
    id: "pro",
    plan_id: "pro",
    name: "Interview Pro",
    description: "Complete preparation cycle before product company interviews",
    duration: "One-time payment",
    price: 6999,
    priceUSD: 84,
    originalPrice: null,
    perSession: 2333,
    popular: true,
    is_active: true,
    display_order: 2,
    features: [
      "3 MAANG-Level Mock Interviews",
      "Improvement Tracking Between Mocks",
      "Resume Review by MAANG Engineer",
      "1 Strategy Call",
      "Proven Resume Templates",
      "Free AI ATS Resume Checker Access"
    ],
    cta: "Start Full Prep",
    justification: "Complete preparation cycle with improvement tracking and strategy guidance."
  },
  {
    id: "elite",
    plan_id: "elite",
    name: "Interview Elite",
    description: "High-touch preparation for Tier-1 / MAANG aspirants",
    duration: "One-time payment",
    price: 14999,
    priceUSD: 180,
    originalPrice: null,
    perSession: 2500,
    popular: false,
    is_active: true,
    display_order: 3,
    limitedSeats: 10,
    features: [
      "6 MAANG-Level Mock Interviews",
      "Live Resume Review Session",
      "Referral Guidance (Best Effort)",
      "Priority WhatsApp Support",
      "Proven Resume Templates",
      "Free AI ATS Resume Checker Access"
    ],
    cta: "Go Elite",
    justification: "High-touch preparation with dedicated support and referral guidance."
  }
];

// What you get - clear deliverables
export const deliverables = [
  {
    id: 1,
    title: "Mock Interviews",
    description: "1-on-1 video calls simulating real interviews at Amazon, Google, Netflix",
    detail: "45-60 min sessions covering DSA, System Design, or Behavioral rounds"
  },
  {
    id: 2,
    title: "Feedback Reports",
    description: "Detailed written feedback after every mock interview",
    detail: "Specific areas to improve, what went well, and actionable next steps"
  },
  {
    id: 3,
    title: "Resume Review",
    description: "Get your resume reviewed by engineers who've screened 1000+ resumes",
    detail: "Line-by-line feedback to increase your shortlist rate"
  },
  {
    id: 4,
    title: "Mentor Group",
    description: "Access to a private community of serious job seekers",
    detail: "Ask questions, share experiences, get referrals"
  }
];

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
    role: "Backend Engineer at Netflix",
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
  { id: "selectedPlan", label: "Which plan are you interested in?", type: "select", required: true, options: [
    "Foundation - ₹1,999 (1 Mock Interview)",
    "Growth - ₹4,999 (3 Mock Interviews - Best Value)",
    "Accelerator - ₹8,999 (6 Mock Interviews)"
  ]}
];
