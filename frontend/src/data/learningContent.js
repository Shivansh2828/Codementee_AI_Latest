// Learning content categories for the "What You'll Learn" showcase section
// Each category maps to a ContentCard on the landing page
// Prices for paid courses are fetched dynamically from the API

export const learningCategories = [
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Design scalable distributed systems — URL shorteners, Netflix-scale architectures, databases, caching, and real MAANG interview questions.',
    icon: 'Server',
    topicCount: 50,
    href: '/learn/system-design',
    isFree: true,
    access: 'Free + Premium',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'dsa-patterns',
    title: 'DSA Patterns',
    description: 'Master 180+ LeetCode problems organized by 22 patterns — sliding window, two pointers, dynamic programming, trees, and graphs.',
    icon: 'Code',
    topicCount: 180,
    href: '/learn/dsa-patterns',
    isFree: true,
    access: 'Free',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'devops',
    title: 'DevOps',
    description: 'Docker, Kubernetes, CI/CD, Terraform, Ansible, AWS — from basics to production. Includes a 30-day MAANG-ready roadmap and real scenario questions.',
    icon: 'Terminal',
    topicCount: 64,
    href: '/learn/devops',
    isFree: false,
    access: null, // Fetched dynamically from API
    planId: 'devops_course',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'aws',
    title: 'AWS',
    description: 'IAM, EC2, S3, VPC, RDS, Lambda, ECS/EKS, CloudFront, and system design on AWS. Animated diagrams for every key service.',
    icon: 'Cloud',
    topicCount: 36,
    href: '/learn/aws',
    isFree: false,
    access: null, // Fetched dynamically from API
    planId: 'aws_course',
    gradient: 'from-orange-400 to-yellow-500',
  },
  {
    id: 'linux',
    title: 'Linux',
    description: 'Master the command line — grep, awk, sed, permissions, networking, shell scripting, and real production debugging scenarios.',
    icon: 'Cpu',
    topicCount: 33,
    href: '/learn/linux',
    isFree: true,
    access: 'Free',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'behavioral',
    title: 'Behavioral Prep',
    description: 'STAR method, leadership stories, Amazon LPs, Meta values, and 80+ common behavioral questions with structured answer frameworks.',
    icon: 'MessageSquare',
    topicCount: 80,
    href: '/learn/behavioral',
    isFree: true,
    access: 'Free',
    gradient: 'from-violet-500 to-purple-500',
  },
];
