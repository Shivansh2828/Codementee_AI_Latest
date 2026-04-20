// Top Navigation Config
export const topNavConfig = [
  {
    label: 'Interview Prep',
    type: 'dropdown',
    items: [
      { label: 'Mock Interviews', href: '/mock-interviews', icon: 'Calendar' },
      { label: '1:1 Mentorship', href: '/mentorship', icon: 'Users' },
      { label: 'Resume Review', href: '/resume-review', icon: 'FileText' },
    ],
  },
  {
    label: 'Learn',
    type: 'dropdown',
    items: [
      { label: 'System Design', href: '/learn/system-design', icon: 'Server' },
      { label: 'DSA Patterns', href: '/learn/dsa-patterns', icon: 'Code' },
      { label: 'Behavioral', href: '/learn/behavioral', icon: 'MessageSquare' },
    ],
  },
  {
    label: 'AI Agents',
    type: 'link',
    href: '/ai-agents',
  },
  {
    label: 'Pricing',
    type: 'scroll',
    href: '/#pricing',
  },
];

// Dashboard Sidebar Config (mentee role)
// Admin and mentor sidebar configs remain as-is in DashboardLayout
export const sidebarConfig = {
  mentee: [
    { path: '/mentee', label: 'Dashboard', icon: 'LayoutDashboard', section: null },
    {
      label: 'AI Tools',
      icon: 'Bot',
      section: 'ai-tools',
      collapsible: true,
      items: [
        { path: '/mentee/job-search', label: 'AI Job Search', icon: 'Briefcase' },
        { path: '/mentee/referral-finder', label: 'Referral Finder', icon: 'Target' },
      ],
    },
    {
      label: 'Learn',
      icon: 'GraduationCap',
      section: 'learn',
      collapsible: true,
      items: [
        { path: '/learn/system-design', label: 'System Design', icon: 'Server' },
        { path: '/learn/dsa-patterns', label: 'DSA Patterns', icon: 'Code' },
        { path: '/learn/behavioral', label: 'Behavioral', icon: 'MessageSquare' },
      ],
    },
    {
      label: 'Interview Coaching',
      icon: 'Headphones',
      section: 'coaching',
      collapsible: true,
      items: [
        { path: '/mentee/slots', label: 'Book Interview', icon: 'CalendarPlus' },
        { path: '/mentee/mocks', label: 'My Interviews', icon: 'Calendar' },
        { path: '/mentee/feedbacks', label: 'My Feedbacks', icon: 'MessageSquare' },
        { path: '/mentee/resume-review', label: 'Resume Review', icon: 'FileText' },
        { path: '/mentee/mentorship', label: '1:1 Mentorship', icon: 'Users' },
        { path: '/mentee/transactions', label: 'Transactions', icon: 'CreditCard' },
      ],
    },
    {
      label: 'Community',
      icon: 'Users',
      section: 'community',
      collapsible: true,
      items: [
        { path: '/mentee/community', label: 'Forum', icon: 'MessageCircle' },
      ],
    },
    { path: '/mentee/bug-reports', label: 'Support & Help', icon: 'Headphones', section: null },
  ],
};
