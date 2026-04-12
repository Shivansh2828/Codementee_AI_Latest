// Learning content categories for the "What You'll Learn" showcase section
// Each category maps to a ContentCard on the landing page

export const learningCategories = [
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Learn to design scalable distributed systems — from URL shorteners to Netflix-scale architectures.',
    icon: 'Server',
    topicCount: 25,
    href: '/learn/system-design',
    isFree: false,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'dsa-patterns',
    title: 'DSA Patterns',
    description: 'Master the most frequently asked coding patterns — sliding window, two pointers, dynamic programming, and more.',
    icon: 'Code',
    topicCount: 40,
    href: '/learn/dsa-patterns',
    isFree: true,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'behavioral',
    title: 'Behavioral Interview Prep',
    description: 'Craft compelling stories using the STAR framework for leadership, teamwork, and conflict-resolution questions.',
    icon: 'MessageSquare',
    topicCount: 20,
    href: '/learn/behavioral',
    isFree: true,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'lld',
    title: 'Low Level Design',
    description: 'Build clean, extensible object-oriented designs — parking lots, elevators, and real-world OOP problems.',
    icon: 'Layers',
    topicCount: 15,
    href: '/learn/lld',
    isFree: false,
    gradient: 'from-emerald-500 to-teal-500',
  },
];
