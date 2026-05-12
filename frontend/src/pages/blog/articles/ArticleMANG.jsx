import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children, theme }) => (
  <section className="mb-10">
    <h2 className={`text-2xl font-bold ${theme.text.primary} mb-4 mt-8`}>{title}</h2>
    {children}
  </section>
);

const H3 = ({ children, theme }) => (
  <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2 mt-5`}>{children}</h3>
);

const P = ({ children, theme }) => (
  <p className={`${theme.text.secondary} leading-relaxed mb-3 text-[15px]`}>{children}</p>
);

const Ul = ({ items, theme }) => (
  <ul className="space-y-2 mb-4 ml-4">
    {items.map((item, i) => (
      <li key={i} className={`flex items-start gap-2 text-[15px] ${theme.text.secondary}`}>
        <span className="text-[#06b6d4] mt-1 shrink-0">→</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Callout = ({ children, theme }) => (
  <div className={`border-l-4 border-[#06b6d4] pl-4 py-2 my-5 ${theme.bg.card} rounded-r-lg`}>
    <p className={`text-sm ${theme.text.secondary} italic`}>{children}</p>
  </div>
);

const ArticleMANG = ({ theme }) => (
  <div>
    <Section title="What Does 'MAANG' Mean?" theme={theme}>
      <P theme={theme}>
        MAANG stands for Meta, Apple, Amazon, Netflix, and Google — the five companies that set the benchmark for software engineering compensation and technical rigor in the industry. In India, the term is often used more broadly to include Microsoft, Flipkart, Swiggy, Zomato, and other top-tier tech companies.
      </P>
      <P theme={theme}>
        Getting into one of these companies from India is absolutely achievable. Thousands of engineers do it every year. The difference between those who succeed and those who don't is almost always preparation quality, not raw intelligence.
      </P>
    </Section>

    <Section title="The Interview Process" theme={theme}>
      <P theme={theme}>Most MAANG companies follow a similar interview structure for software engineering roles:</P>
      <Ul theme={theme} items={[
        'Online Assessment (OA) — 2-3 DSA problems, 60-90 minutes, automated',
        'Phone Screen — 1 DSA problem with a recruiter or engineer, 45 minutes',
        'Virtual Onsite — 4-6 rounds covering DSA, system design, and behavioral',
        'Hiring Committee Review — your performance is reviewed by a panel',
        'Offer & Negotiation — compensation discussion with the recruiter',
      ]} />
      <Callout theme={theme}>
        Amazon has an additional "Bar Raiser" round — a senior engineer from a different team who evaluates whether you raise the overall bar of the company.
      </Callout>
    </Section>

    <Section title="Phase 1: DSA Preparation (8-12 Weeks)" theme={theme}>
      <P theme={theme}>
        Data Structures and Algorithms is the foundation. Every MAANG interview will have at least 2-3 DSA rounds. The goal is not to memorize solutions but to recognize patterns.
      </P>
      <H3 theme={theme}>The 15 Patterns That Cover 90% of Problems</H3>
      <Ul theme={theme} items={[
        'Two Pointers — sorted arrays, palindromes, pair sums',
        'Sliding Window — subarray problems, string problems',
        'Binary Search — sorted arrays, search space reduction',
        'BFS/DFS — trees, graphs, connected components',
        'Dynamic Programming — optimization, counting, decision problems',
        'Backtracking — permutations, combinations, constraint satisfaction',
        'Heap/Priority Queue — top-K problems, merge K sorted lists',
        'Monotonic Stack — next greater element, histogram problems',
        'Union Find — connected components, cycle detection',
        'Trie — prefix matching, word search',
      ]} />
      <H3 theme={theme}>Recommended Practice Plan</H3>
      <Ul theme={theme} items={[
        'Weeks 1-2: Arrays, strings, hashmaps — 30 problems',
        'Weeks 3-4: Trees, graphs, BFS/DFS — 25 problems',
        'Weeks 5-6: Dynamic programming — 20 problems',
        'Weeks 7-8: Heaps, tries, advanced graphs — 20 problems',
        'Weeks 9-12: Mock interviews + company-specific problems',
      ]} />
    </Section>

    <Section title="Phase 2: System Design (4-6 Weeks)" theme={theme}>
      <P theme={theme}>
        System design rounds are where senior engineers are evaluated. Even for SDE-2 roles, a strong system design performance can significantly improve your offer level.
      </P>
      <H3 theme={theme}>Core Concepts to Master</H3>
      <Ul theme={theme} items={[
        'Horizontal vs vertical scaling — when to use each',
        'Load balancers — L4 vs L7, consistent hashing',
        'Databases — SQL vs NoSQL, sharding, replication, indexing',
        'Caching — Redis, CDN, cache invalidation strategies',
        'Message queues — Kafka, RabbitMQ, async processing',
        'API design — REST vs GraphQL, rate limiting, pagination',
        'CAP theorem — consistency vs availability tradeoffs',
      ]} />
      <Callout theme={theme}>
        The most common mistake in system design interviews is jumping to solutions before clarifying requirements. Always spend the first 5 minutes asking questions about scale, consistency requirements, and constraints.
      </Callout>
      <P theme={theme}>
        Practice designing these systems end-to-end: URL shortener, Twitter feed, WhatsApp, Uber, YouTube, Google Search, and a distributed cache.
      </P>
    </Section>

    <Section title="Phase 3: Behavioral Interviews" theme={theme}>
      <P theme={theme}>
        Amazon's Leadership Principles are the most structured behavioral framework. Even if you're not interviewing at Amazon, preparing for LP questions will prepare you for any behavioral round.
      </P>
      <H3 theme={theme}>The STAR Method</H3>
      <P theme={theme}>
        Every behavioral answer should follow: Situation → Task → Action → Result. Keep answers to 2-3 minutes. The result should be quantified whenever possible.
      </P>
      <Ul theme={theme} items={[
        'Prepare 8-10 strong stories from your work experience',
        'Each story should be adaptable to multiple questions',
        'Focus on your individual contribution, not the team',
        'Include metrics: "reduced latency by 40%", "saved 20 hours/week"',
        'Have a failure story ready — interviewers always ask about mistakes',
      ]} />
    </Section>

    <Section title="The Mock Interview Advantage" theme={theme}>
      <P theme={theme}>
        The single biggest predictor of interview success is the number of mock interviews you do. Reading solutions and watching videos is passive learning. Mock interviews force you to think under pressure, communicate clearly, and handle hints — exactly what the real interview requires.
      </P>
      <P theme={theme}>
        Aim for at least 5-10 mock interviews before your actual interviews. Ideally with engineers from the companies you're targeting, who know exactly what the bar looks like.
      </P>
      <div className={`p-5 rounded-xl border border-[#06b6d4]/30 bg-[#06b6d4]/5 mt-4`}>
        <p className={`text-sm font-semibold text-[#06b6d4] mb-1`}>Practice with MAANG Engineers</p>
        <p className={`text-sm ${theme.text.secondary} mb-3`}>
          Codementee connects you with engineers from Google, Amazon, and Meta for live mock interviews with detailed feedback.
        </p>
        <Link to="/mock-interviews" className="text-sm font-semibold text-[#06b6d4] hover:underline">
          View mock interview plans →
        </Link>
      </div>
    </Section>

    <Section title="Timeline: 3-Month Preparation Plan" theme={theme}>
      <Ul theme={theme} items={[
        'Month 1: DSA foundations — arrays, trees, graphs, DP. 2-3 problems/day.',
        'Month 2: System design + advanced DSA. 1 system design per week. Start mock interviews.',
        'Month 3: Company-specific prep + behavioral. 5+ mock interviews. Apply aggressively.',
      ]} />
      <P theme={theme}>
        Most engineers who crack MAANG interviews prepare for 3-6 months. Consistency matters more than intensity — 2 hours every day beats 14 hours on weekends.
      </P>
    </Section>
  </div>
);

export default ArticleMANG;
