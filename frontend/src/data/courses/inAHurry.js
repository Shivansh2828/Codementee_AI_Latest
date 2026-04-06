export const IN_A_HURRY_TOPICS = {
  'introduction': {
    slug: 'introduction', title: 'Introduction',
    subtitle: 'What system design interviews are, why they matter, and how this course works',
    duration: '15 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'What Are System Design Interviews?', body: 'System design interviews assess your ability to take an ambiguously defined, high-level problem and break it down into the infrastructure needed to solve it. These are practical interviews, not academic ones.\n\nThere is no single right answer. Your interviewer is assessing:\n- Navigate a complex, open-ended problem\n- Reason about trade-offs between approaches\n- Communicate your thinking clearly\n- Demonstrate breadth across distributed systems\n\nAt mid-level, they become common. At senior+, they carry disproportionate weight.' },
      { type: 'text', heading: 'Types of Interviews', body: '**Product Design** — "Design Uber" or "Design Instagram." Full system: services, databases, caches, queues, CDN.\n\n**Infrastructure Design** — "Design a rate limiter" or "Design a distributed cache." A specific component.\n\nBoth types are covered in this course.' },
      { type: 'callout', variant: 'info', heading: 'Who Is This For?', body: 'Engineers preparing for system design interviews at FAANG and top product companies. The "In a Hurry" section gives you essentials fast. Deeper sections let you go as deep as you need.' },
      { type: 'text', heading: 'What Interviewers Actually Evaluate', body: '**Requirements Gathering (10%)** — Can you scope the problem?\n**High-Level Design (30%)** — Coherent architecture with the right building blocks?\n**Deep Dive (40%)** — Go deep on 2-3 components with trade-offs?\n**Communication (20%)** — Structured, clear, driving the conversation?\n\nDeep dive is 40%. This is where interviews are won or lost.' },
      { type: 'text', heading: 'The Building Blocks', body: 'Every large-scale system uses these components:\n\n**Load Balancer** — Distributes traffic across servers\n**API Gateway** — Single entry point. Auth, rate limiting, routing\n**Application Servers** — Business logic. Stateless, horizontally scalable\n**Database** — SQL (PostgreSQL) or NoSQL (MongoDB, Cassandra, DynamoDB)\n**Cache** — In-memory (Redis, Memcached). Reduces DB load\n**CDN** — Static content from edge nodes near users\n**Message Queue** — Async processing (Kafka, SQS). Decouples services\n**Object Storage** — Large files (S3). Cheap, durable\n**Search Engine** — Full-text search (Elasticsearch)\n\nMost problems are about combining these in the right way.' },
      { type: 'animation', id: 'client-server', heading: 'The Client-Server Model', body: 'Every system starts here. Client sends request, server processes and responds.' },
      { type: 'text', heading: 'How to Use This Course', body: '**1 week:** Read "In a Hurry" (6 topics). Do 3-4 Question Breakdowns. Practice out loud.\n**2-4 weeks:** + all Core Concepts. 6-8 Breakdowns. Patterns. 1-2 mock interviews.\n**1-2 months:** Everything. All Breakdowns. Technologies. 3-4 mocks with feedback.\n\n**Most important: practice explaining designs out loud.** Reading is not enough.' },
    ],
  },
  'how-to-prep': {
    slug: 'how-to-prep', title: 'How to Prepare',
    subtitle: 'A structured study plan with timelines, resources, and common mistakes',
    duration: '12 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'The Study Plan', body: '**Week 1: Foundations** — Read "In a Hurry" completely. Learn building blocks: DNS, load balancers, databases (SQL vs NoSQL), caching, CDN, queues. Read "Numbers to Know."\n\n**Week 2: Core Concepts** — Networking, API Design, Data Modeling, Caching, Sharding, Consistent Hashing, CAP Theorem, Indexing. For each: what it is, when to use it, trade-offs.\n\n**Week 3: Question Practice** — Design 2-3 systems/day. Start simple (URL shortener, rate limiter), progress to harder (YouTube, Uber). Set 45-min timer. Compare with Breakdowns.\n\n**Week 4: Mock Interviews** — Practice under real conditions. 45 minutes, whiteboard, talking out loud. Get feedback on communication, not just technical design.' },
      { type: 'callout', variant: 'tip', heading: 'Quality Over Quantity', body: 'Deeply understanding 10 systems beats superficially knowing 30. For each: explain requirements, high-level design, 2 deep dives, and key trade-offs.' },
      { type: 'text', heading: 'Common Mistakes', body: '**1. Jumping to solutions** without clarifying requirements — #1 reason mid-level candidates fail\n**2. Ignoring scale** — "Works for 100 users" is not a system design answer\n**3. No trade-offs** — Every decision has pros/cons. Say them.\n**4. Too much detail too early** — High-level first, then deep dive\n**5. Silence** — Think out loud. Interviewers cannot evaluate silent thinking.\n**6. Perfectionism** — No perfect design exists. Decide, explain trade-off, move on.\n**7. Not driving** — At senior+, you should drive. Do not wait for prompts.' },
      { type: 'text', heading: 'Resources', body: '[System Design Course](/learn/system-design) — You are here. Free, structured, with detailed breakdowns and animations.\n[DSA Patterns](/learn/dsa-patterns) — 25 patterns, 210+ problems organized by pattern with company tags.\n[Behavioral Prep](/learn/behavioral) — 80+ questions with STAR examples across 12 categories.\n[Mock Interviews](/register) — Book a 1-on-1 mock interview with a MAANG engineer for personalized feedback. The single highest-ROI activity for interview prep.' },
    ],
  },
  'delivery-framework': {
    slug: 'delivery-framework', title: 'Delivery Framework',
    subtitle: 'The step-by-step structure to deliver a complete system design in 45 minutes',
    duration: '15 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'Why You Need a Framework', body: 'The easiest way to fail is to not deliver a working system. Without structure, candidates get lost in details, spend too long on one component, or forget key requirements.\n\nFollow this framework and you will stay focused, have a fallback if stuck, and leave time for the deep dives that differentiate you.' },
      { type: 'text', heading: 'The 5 Steps', body: '**Step 1: Requirements (5 min)**\n**Step 2: Core Entities (2 min)**\n**Step 3: API Design (3 min)**\n**Step 4: High-Level Design (10 min)**\n**Step 5: Deep Dives (20 min)**\n\nTotal: ~40 min of a 45-min interview.' },
      { type: 'text', heading: 'Step 1: Requirements (5 min)', body: '**Functional Requirements** — "Users should be able to..." Core features only. Keep to 3-4.\n\nExample (Twitter): Post tweets, follow users, see feed.\n\n**Non-Functional Requirements** — System qualities. Quantify where possible.\n\nExample: Highly available (AP over CP), 300M+ DAU, feed < 200ms latency.\n\nAsk: "Read/write ratio?" "Real-time needed?" "Geographic constraints?"' },
      { type: 'text', heading: 'Step 2: Core Entities (2 min)', body: 'Identify primary data entities. Grounds your thinking.\n\nExample (Twitter): User (profile, followers), Tweet (content, author, timestamp), Follow (directed relationship).\n\nKeep simple — refine during deep dive.' },
      { type: 'text', heading: 'Step 3: API Design (3 min)', body: 'One endpoint per functional requirement.\n\nExample: POST /tweets, GET /feed, POST /users/{id}/follow\n\nTell interviewer: "These may evolve as we go deeper."' },
      { type: 'text', heading: 'Step 4: High-Level Design (10 min)', body: 'Draw the architecture. Walk through each requirement.\n\nStart: Client → LB → App Servers → DB\nAdd as needed: Cache, CDN, Queue, Object Storage, Search\n\nFor each component: briefly explain why. "Redis here to cache feeds, avoid DB on every load."\n\nBy end: diagram satisfying all functional requirements.' },
      { type: 'callout', variant: 'warning', heading: 'The #1 Mistake', body: 'Spending 25 min on high-level design, leaving no time for deep dives. A good-enough HLD + 2 strong deep dives beats a perfect HLD with no deep dives. Move on after 10 minutes.' },
      { type: 'text', heading: 'Step 5: Deep Dives (20 min)', body: 'Pick 2-3 areas. Let interviewer guide or proactively identify challenges.\n\n**Good topics:** DB schema, caching strategy, handling bottlenecks, consistency trade-offs, specific algorithms, scaling components.\n\n**Structure each:** State problem → Explore options → Analyze trade-offs → Decide → Discuss edge cases.\n\nAt senior+: drive deep dives proactively.' },
      { type: 'text', heading: 'Level Expectations', body: '**Mid-level:** 80% breadth, 20% depth. Deliver functional HLD. OK to need hints.\n**Senior:** 60/40. Proactively identify bottlenecks. Discuss trade-offs unprompted. Drive 1-2 deep dives.\n**Staff+:** 40/60. Breeze through HLD. Drive entire conversation. Very deep on 2-3 areas.' },
    ],
  },
  'core-concepts-overview': {
    slug: 'core-concepts-overview', title: 'Core Concepts Overview',
    subtitle: 'A quick tour of the 9 foundational concepts you need to know',
    duration: '20 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'The 9 Core Concepts', body: '**1. Networking** — DNS, TCP/UDP, HTTP versions, WebSockets vs SSE vs Long Polling.\n\n**2. API Design** — REST (resources + verbs), GraphQL (flexible queries), gRPC (fast internal). Version your APIs.\n\n**3. Data Modeling** — SQL vs NoSQL. Normalization vs denormalization. Choose based on access patterns.\n\n**4. Caching** — Cache-aside, write-through, write-behind. LRU eviction. Cache invalidation is hard. Redis vs Memcached.\n\n**5. Sharding** — Split data across DBs. Range, hash, or directory-based. Avoid premature sharding.\n\n**6. Consistent Hashing** — Minimize data movement when adding/removing nodes. Virtual nodes for even distribution.\n\n**7. CAP Theorem** — Consistency, Availability, Partition Tolerance — pick 2. Choose CP or AP.\n\n**8. Database Indexing** — B-tree (range), Hash (equality), Composite (multi-column). Do not over-index.\n\n**9. Numbers to Know** — RAM: 100ns. SSD: 100us. Network same DC: 0.5ms. Cross-region: 150ms.' },
      { type: 'callout', variant: 'tip', heading: 'How Deep to Go', body: 'These summaries are enough for "In a Hurry." For more depth, read each Core Concept topic individually.' },
    ],
  },
  'key-technologies-overview': {
    slug: 'key-technologies-overview', title: 'Key Technologies Overview',
    subtitle: 'The tools that power modern systems — when to use each',
    duration: '15 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'Technologies You Should Know', body: '**Redis** — In-memory store. Caching, sessions, rate limiting, leaderboards, pub/sub, locks. Sub-ms latency.\n\n**Kafka** — Event streaming. Durable, ordered log. Analytics pipelines, async processing, log aggregation.\n\n**Elasticsearch** — Full-text search. Inverted index. Product search, log analytics, autocomplete.\n\n**PostgreSQL** — Go-to relational DB. ACID, JSONB, PostGIS, advanced indexing. Default choice.\n\n**Cassandra** — Wide-column for write-heavy workloads. Linear scalability, no SPOF. No JOINs.\n\n**DynamoDB** — AWS managed NoSQL. Serverless, auto-scaling. Simple key-value patterns.\n\n**API Gateway** — Entry point. Auth, rate limiting, routing.\n\n**ZooKeeper** — Coordination. Leader election, service discovery, distributed locks.' },
      { type: 'text', heading: 'How to Choose', body: '**Caching?** → Redis\n**Async processing?** → Kafka (high throughput) or SQS (simple)\n**Search?** → Elasticsearch\n**Relational DB?** → PostgreSQL\n**Write-heavy NoSQL?** → Cassandra or DynamoDB\n**Coordination?** → ZooKeeper\n\nIn interviews: explain why you chose it over alternatives.' },
    ],
  },
  'common-patterns-overview': {
    slug: 'common-patterns-overview', title: 'Common Patterns Overview',
    subtitle: 'Reusable solutions to problems in every system design interview',
    duration: '15 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: '6 Patterns You Will Use Everywhere', body: '**1. Real-time Updates** — Server pushes to clients. WebSockets (bidirectional), SSE (server to client), Long Polling (fallback).\n\n**2. Scaling Reads** — 10:1+ read:write ratio. Caching → Read Replicas → CDN → CQRS → Denormalization.\n\n**3. Scaling Writes** — Write-heavy systems. Sharding, WAL, async processing (queue then batch to DB), LSM Trees.\n\n**4. Handling Large Blobs** — Images, videos, files. Object storage (S3), pre-signed URLs, CDN for serving, chunked upload. Never store blobs in DB.\n\n**5. Long Running Tasks** — Video transcoding, reports. Async job queue. Return job_id (202 Accepted). Poll or WebSocket for status.\n\n**6. Multi-step Processes** — Operations across services. Saga pattern with compensating transactions. Eventually consistent.' },
      { type: 'callout', variant: 'tip', heading: 'Pattern Recognition', body: '"Real-time updates needed" → Pattern 1. "100M reads/day" → Pattern 2. "Upload 50GB files" → Pattern 4. "Send email after order" → Pattern 5. Recognize the pattern, apply the solution, explain trade-offs.' },
    ],
  },
};
