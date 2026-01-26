// Mock data for Codementee MVP

export const siteConfig = {
  name: "Codementee",
  tagline: "Real mock interviews with engineers who've cracked product based companies",
  subTagline: "No AI-only feedback. No generic courses. Limited seats. Real interviewers.",
  contactEmail: "hello@codementee.com",
  founderName: "The Codementee Team"
};

// Companies where our mentors have worked - with logo URLs
export const targetCompanies = [
  { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "Meta", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg" },
  { name: "Flipkart", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Flipkart_logo_2023.svg" },
  { name: "Uber", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" }
];

export const cohortData = {
  totalSeats: 25,
  seatsRemaining: 18,
  currency: "₹"
};

// Pricing Plans
export const pricingPlans = [
  {
    id: "monthly",
    name: "Monthly",
    duration: "1 Month",
    price: 1999,
    originalPrice: null,
    perMonth: 1999,
    popular: false,
    features: [
      "1 mock interview",
      "Detailed feedback report",
      "Resume review",
      "Private mentor group access",
      "Email support"
    ],
    cta: "Start Monthly"
  },
  {
    id: "quarterly",
    name: "3 Months",
    duration: "3 Months",
    price: 4999,
    originalPrice: 5997,
    perMonth: 1666,
    popular: true,
    savings: "Save ₹998",
    features: [
      "3 mock interviews (1/month)",
      "Detailed feedback reports",
      "Resume review + optimization",
      "Private mentor group access",
      "Priority scheduling",
      "1 system design session"
    ],
    cta: "Best Value"
  },
  {
    id: "biannual",
    name: "6 Months",
    duration: "6 Months",
    price: 8999,
    originalPrice: 11994,
    perMonth: 1500,
    popular: false,
    savings: "Save ₹2,995",
    features: [
      "6 mock interviews (1/month)",
      "Detailed feedback reports",
      "Complete resume overhaul",
      "Private mentor group access",
      "Priority scheduling",
      "2 system design sessions",
      "Salary negotiation guidance",
      "Direct mentor WhatsApp access"
    ],
    cta: "Maximum Prep"
  }
];

// What you get - clear deliverables
export const deliverables = [
  {
    id: 1,
    title: "Mock Interviews",
    description: "1-on-1 video calls simulating real interviews at Amazon, Google, Flipkart",
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
  { id: "selectedPlan", label: "Which plan are you interested in?", type: "select", required: true, options: [
    "Monthly - ₹1,999",
    "3 Months - ₹4,999 (Best Value)",
    "6 Months - ₹8,999"
  ]}
];
