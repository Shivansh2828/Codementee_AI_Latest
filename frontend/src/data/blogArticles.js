/**
 * Blog articles data — each article targets a specific SEO keyword cluster.
 * URL pattern: /blog/:slug
 */
export const ARTICLES = [
  {
    slug: 'how-to-crack-maang-interviews-in-india',
    title: 'How to Crack MAANG Interviews in India (2026 Complete Guide)',
    description: 'Step-by-step guide to cracking Google, Amazon, Meta, Apple, and Netflix interviews from India. Covers DSA, system design, behavioral rounds, and compensation negotiation.',
    keywords: 'MAANG interview India, crack Google interview India, Amazon interview preparation, software engineer interview India 2026',
    publishedDate: '2026-04-10',
    updatedDate: '2026-05-01',
    readTime: '12 min',
    category: 'Interview Prep',
    coverImage: null,
    excerpt: 'Getting into a MAANG company from India is achievable with the right preparation strategy. Here is everything you need to know.',
  },
  {
    slug: 'system-design-interview-questions-2025',
    title: 'Top 20 System Design Interview Questions Asked at MAANG (2026)',
    description: 'The most frequently asked system design interview questions at Google, Amazon, Meta, and Microsoft in 2026. Includes detailed answers and diagrams.',
    keywords: 'system design interview questions, system design MAANG, design URL shortener, design Twitter, design WhatsApp interview',
    publishedDate: '2026-04-15',
    updatedDate: '2026-05-01',
    readTime: '15 min',
    category: 'System Design',
    coverImage: null,
    excerpt: 'System design rounds are the biggest differentiator between junior and senior offers. These are the questions that actually get asked.',
  },
  {
    slug: 'devops-interview-questions-kubernetes-docker',
    title: 'DevOps Interview Questions: Kubernetes, Docker & CI/CD (2026)',
    description: 'Complete list of DevOps interview questions on Kubernetes, Docker, CI/CD pipelines, Terraform, and AWS asked at top tech companies in 2026.',
    keywords: 'DevOps interview questions, Kubernetes interview questions, Docker interview questions, CI/CD interview, AWS DevOps interview',
    publishedDate: '2026-04-20',
    updatedDate: '2026-05-01',
    readTime: '10 min',
    category: 'DevOps',
    coverImage: null,
    excerpt: 'DevOps roles at MAANG companies require deep knowledge of containers, orchestration, and automation. Here are the questions you will face.',
  },
  {
    slug: 'mock-interview-preparation-guide',
    title: 'How to Prepare for a Mock Interview (And Actually Benefit From It)',
    description: 'A practical guide to getting the most out of mock interviews. How to find the right interviewer, what to practice, and how to use feedback to improve fast.',
    keywords: 'mock interview preparation, how to prepare for mock interview, mock interview tips, technical mock interview, coding mock interview',
    publishedDate: '2026-04-25',
    updatedDate: '2026-05-01',
    readTime: '8 min',
    category: 'Interview Prep',
    coverImage: null,
    excerpt: 'Most engineers do mock interviews wrong. Here is how to structure your practice to get maximum improvement in minimum time.',
  },
  {
    slug: 'software-engineer-salary-india-maang-2025',
    title: 'Software Engineer Salary at MAANG Companies in India (2026)',
    description: 'Detailed breakdown of software engineer salaries at Google, Amazon, Meta, Microsoft, and other top tech companies in India for 2026. Includes base, bonus, and RSU data.',
    keywords: 'software engineer salary India 2026, Google salary India, Amazon SDE salary India, MAANG salary India, tech salary India',
    publishedDate: '2026-05-01',
    updatedDate: '2026-05-10',
    readTime: '9 min',
    category: 'Career',
    coverImage: null,
    excerpt: 'Compensation at top tech companies in India has changed significantly. Here is the most up-to-date data on what engineers actually earn.',
  },
];

export const getArticle = (slug) => ARTICLES.find(a => a.slug === slug);
