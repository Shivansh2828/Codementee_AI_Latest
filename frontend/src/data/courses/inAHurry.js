export const IN_A_HURRY_TOPICS = {
  'introduction': {
    slug: 'introduction', title: 'Introduction',
    subtitle: 'What system design interviews are, why they matter, and how this course works',
    duration: '20 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'What Are System Design Interviews?', body: `System design interviews assess your ability to take a vague, open-ended problem — "Design Instagram" or "Design a rate limiter" — and break it down into the infrastructure needed to solve it at scale. There is no single right answer. The interviewer is evaluating how you think, not what you memorize.\n\nThese interviews test four things:\n\nCan you navigate ambiguity? The problem is intentionally vague. You must ask clarifying questions, define scope, and make reasonable assumptions.\n\nCan you reason about trade-offs? Every design decision has pros and cons. Choosing Redis over Memcached, SQL over NoSQL, push over pull — the interviewer wants to hear your reasoning, not just your choice.\n\nCan you communicate clearly? You are designing a system on a whiteboard while explaining your thinking out loud. If the interviewer cannot follow your reasoning, it does not matter how good your design is.\n\nDo you have breadth across distributed systems? You need working knowledge of databases, caching, queues, load balancers, CDNs, and how they fit together. You do not need to be an expert in all of them — but you need to know when to use each one.` },

      { type: 'text', heading: 'Types of System Design Interviews', body: `There are two main types, and the approach differs:\n\n**Product Design** — "Design Uber", "Design Instagram", "Design WhatsApp." You are designing a full system: user-facing APIs, backend services, databases, caches, queues, CDN. The focus is on the end-to-end architecture and how components interact. Most common at product companies (Meta, Google, Amazon, Uber).\n\n**Infrastructure Design** — "Design a rate limiter", "Design a distributed cache", "Design a URL shortener." You are designing a specific component or service. The focus is on the algorithm, data structures, and scaling strategy for that one thing. Common at infrastructure companies and for senior+ roles.\n\nBoth types follow the same framework: requirements → entities → API → high-level design → deep dives. This course covers both.` },

      { type: 'text', heading: 'What Interviewers Actually Evaluate', body: `Understanding the scoring rubric helps you allocate your time correctly.\n\n**Requirements Gathering (10%)** — Did you scope the problem? Did you identify the top 3-4 functional requirements and key non-functional requirements (scale, latency, consistency)? Did you explicitly mark things as out of scope?\n\n**High-Level Design (30%)** — Does your architecture satisfy all functional requirements? Are the right building blocks in place (load balancer, cache, queue, etc.)? Is the data flow clear?\n\n**Deep Dives (40%)** — This is where interviews are won or lost. Can you go deep on 2-3 specific challenges? Database schema design, caching strategy, handling race conditions, scaling bottlenecks, consistency trade-offs. The interviewer wants to see that you have real engineering depth, not just surface-level knowledge.\n\n**Communication (20%)** — Are you structured and clear? Are you driving the conversation (especially at senior+)? Do you check in with the interviewer? Do you explain trade-offs without being asked?\n\nNotice: deep dives are 40% of the score. A good-enough high-level design with two strong deep dives beats a perfect high-level design with no deep dives.` },

      { type: 'text', heading: 'The Building Blocks of Every System', body: `Almost every system design uses the same set of components. Learning what each one does and when to use it is the foundation of everything else in this course.\n\n**Load Balancer** — Distributes incoming traffic across multiple servers. Prevents any single server from being overwhelmed. Examples: Nginx, AWS ALB.\n\n**API Gateway** — Single entry point for all client requests. Handles authentication, rate limiting, routing, and SSL termination. Examples: Kong, AWS API Gateway.\n\n**Application Servers** — Where your business logic runs. Stateless (no user data stored on the server), so you can scale horizontally by adding more instances.\n\n**Database** — Persistent data storage. SQL (PostgreSQL, MySQL) for relational data with transactions. NoSQL (MongoDB, Cassandra, DynamoDB) for flexible schemas or massive scale.\n\n**Cache** — In-memory store (Redis, Memcached) that sits between your app and database. Reduces DB load by 80-95%. Sub-millisecond reads.\n\n**CDN** — Content Delivery Network. Caches static content (images, CSS, JS) at edge servers close to users worldwide. Reduces latency from 300ms to 20ms.\n\n**Message Queue** — Asynchronous processing. Decouples services. Examples: Kafka (event streaming), SQS (job queues). "Process this later, do not make the user wait."\n\n**Object Storage** — Cheap, durable storage for large files (images, videos). S3, GCS. Never store blobs in your database.\n\n**Search Engine** — Full-text search with relevance ranking. Elasticsearch. Used for product search, log analytics, autocomplete.` },

      { type: 'animation', id: 'client-server', heading: 'The Client-Server Model', body: 'Every system starts here. Client sends a request, server processes it and responds. Everything else is about making this fast, reliable, and scalable.' },

      {
        type: 'architecture', heading: 'Typical Web Application Architecture',
        caption: 'The building blocks of most systems. Start simple, add components as needed.',
        config: {
          width: 800, height: 350,
          nodes: [
            { id: 'client', label: 'Client', sublabel: 'Browser / Mobile', icon: '📱', color: 'blue', x: 20, y: 130, w: 100, h: 56 },
            { id: 'cdn', label: 'CDN', sublabel: 'Static content', icon: '🌍', color: 'cyan', x: 170, y: 30, w: 110, h: 50 },
            { id: 'lb', label: 'Load Balancer', color: 'cyan', x: 170, y: 130, w: 120, h: 56 },
            { id: 'app', label: 'App Servers', sublabel: 'Stateless ×N', color: 'green', x: 360, y: 130, w: 120, h: 56 },
            { id: 'cache', label: 'Redis Cache', icon: '⚡', color: 'red', x: 360, y: 30, w: 110, h: 50 },
            { id: 'db', label: 'PostgreSQL', icon: '🗄️', color: 'blue', x: 360, y: 250, w: 120, h: 50 },
            { id: 'queue', label: 'Kafka / SQS', sublabel: 'Async jobs', icon: '📨', color: 'yellow', x: 550, y: 130, w: 120, h: 56 },
            { id: 'worker', label: 'Workers', sublabel: 'Background jobs', color: 'purple', x: 550, y: 250, w: 120, h: 50 },
            { id: 's3', label: 'S3', sublabel: 'Files / media', icon: '📦', color: 'orange', x: 700, y: 130, w: 80, h: 50 },
          ],
          edges: [
            { from: 'client', to: 'cdn', label: 'static' },
            { from: 'client', to: 'lb', label: 'API requests' },
            { from: 'lb', to: 'app', label: 'route' },
            { from: 'app', to: 'cache', label: 'check cache', color: 'accent' },
            { from: 'app', to: 'db', label: 'query' },
            { from: 'app', to: 'queue', label: 'async' },
            { from: 'queue', to: 'worker', label: 'process' },
            { from: 'app', to: 's3', label: 'files' },
          ],
        },
      },

      { type: 'text', heading: 'How to Use This Course', body: `This course is structured in layers. Start with "In a Hurry" for the essentials, then go deeper as needed.\n\n**1 week prep (minimum viable):** Read all 6 "In a Hurry" topics. Do 3-4 Question Breakdowns (start with Bit.ly and Rate Limiter). Practice explaining designs out loud — set a 45-minute timer and talk through each design as if you are in an interview.\n\n**2-4 weeks prep (recommended):** Add all 9 Core Concepts. Do 6-8 Question Breakdowns. Read the Patterns section. Do 1-2 mock interviews with a friend or mentor.\n\n**1-2 months prep (comprehensive):** Everything above plus Key Technologies, Advanced Topics, and all 14 Question Breakdowns. Do 3-4 mock interviews with feedback.\n\nThe single highest-ROI activity is practicing out loud. Reading is not enough — you need to practice the delivery. Record yourself explaining a design and listen back. You will immediately hear where you are unclear or rambling.` },

      {
        type: 'faq', heading: 'Frequently Asked Questions',
        questions: [
          { q: 'How many system design questions should I prepare?', a: 'Deeply understand 8-10 systems. The top ones: URL Shortener, Chat (WhatsApp), Social Feed (Facebook), Video Streaming (YouTube), Ride Sharing (Uber), File Storage (Dropbox), Ticket Booking (Ticketmaster), Rate Limiter, Web Crawler, Payment System. If you can design these from scratch, you can handle most variations.' },
          { q: 'I am a junior engineer — do I need system design?', a: 'Most companies start asking system design at mid-level (L4/E4). For junior roles, focus on coding interviews. But learning system design early gives you a huge advantage — you will write better code, make better architecture decisions, and be ready when the time comes.' },
          { q: 'How long should I prepare for system design interviews?', a: '2-4 weeks of focused study is enough for most candidates. 1 week if you are experienced and just need to refresh. The key is practice, not just reading — do mock interviews and practice explaining designs out loud.' },
        ],
      },
    ],
  },
  'how-to-prep': {
    slug: 'how-to-prep', title: 'How to Prepare',
    subtitle: 'A structured study plan with timelines, resources, and common mistakes',
    duration: '15 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'The Study Plan', body: `Here is a week-by-week plan that works for most candidates. Adjust based on your experience level and timeline.\n\n**Week 1: Foundations**\nRead the entire "In a Hurry" section (you are doing this now). Learn the building blocks: what is a load balancer, what is a cache, when do you use SQL vs NoSQL. Read "Numbers to Know" — memorize the key latency numbers (RAM: 100ns, SSD: 100μs, network same DC: 0.5ms). These numbers come up in every estimation question.\n\n**Week 2: Core Concepts**\nGo through all 9 Core Concepts: Networking, API Design, Data Modeling, Caching, Sharding, Consistent Hashing, CAP Theorem, Database Indexing, Numbers to Know. For each one, understand: what it is, when to use it, what the trade-offs are, and how to explain it in 2 minutes.\n\n**Week 3: Question Practice**\nDesign 2-3 systems per day. Start with easier ones (URL shortener, rate limiter) and progress to harder ones (YouTube, Uber, WhatsApp). Set a 45-minute timer for each. Talk out loud as if you are in an interview. After each attempt, read the Question Breakdown and compare.\n\n**Week 4: Mock Interviews**\nPractice under real conditions. Find a study partner, use a whiteboard or shared doc, and do full 45-minute mock interviews. Get feedback on both your technical design and your communication. This is the single highest-ROI activity — reading alone is not enough.` },

      { type: 'text', heading: 'Common Mistakes That Fail Candidates', body: `These are the patterns I see repeatedly in failed system design interviews. Avoid them and you are already ahead of most candidates.\n\n**1. Jumping to solutions without clarifying requirements.** This is the number one reason mid-level candidates fail. You start drawing boxes before understanding what you are building. Always spend 3-5 minutes on requirements first.\n\n**2. Ignoring scale.** "I would use a PostgreSQL database" is not a system design answer. How many users? How many requests per second? How much data? The scale determines the architecture.\n\n**3. No trade-offs.** Every decision has pros and cons. "I chose Redis for caching because it provides sub-millisecond reads, but the trade-off is that data can be lost on restart if persistence is not configured." Saying trade-offs unprompted shows engineering maturity.\n\n**4. Too much detail too early.** Do not spend 10 minutes designing the database schema before you have a high-level architecture. Get the big picture right first, then dive deep.\n\n**5. Silence.** The interviewer cannot evaluate what they cannot hear. Think out loud. "I am considering two options here... Option A has the advantage of... but Option B would be better for..." Even if you are unsure, verbalizing your thought process shows how you reason.\n\n**6. Not driving the conversation.** At senior+ levels, you are expected to drive. Do not wait for the interviewer to ask "what about caching?" Proactively identify challenges and address them.` },

      { type: 'callout', variant: 'tip', heading: 'The #1 Prep Activity', body: `Practice explaining designs out loud. Set a 45-minute timer, pick a system (e.g., "Design WhatsApp"), and talk through the entire design as if you are in an interview. Record yourself if possible. Listen back and notice where you ramble, where you are unclear, and where you skip important details. This single activity will improve your performance more than reading 10 more articles.` },

      { type: 'text', heading: 'Resources on This Platform', body: `[System Design Course](/learn/system-design) — You are here. Free, structured, with detailed breakdowns, animations, and diagrams.\n[DSA Patterns](/learn/dsa-patterns) — 25 patterns, 210+ problems organized by pattern with company tags and progress tracking.\n[Behavioral Prep](/learn/behavioral) — 80+ questions with STAR examples across 12 categories.\n[Mock Interviews](/apply) — Book a 1-on-1 mock interview with a MAANG engineer for personalized feedback.` },

      {
        type: 'faq', heading: 'Frequently Asked Questions',
        questions: [
          { q: 'How many hours per day should I study?', a: '2-3 hours of focused study per day is optimal. More than that leads to diminishing returns. Split between reading (1 hour) and practice (1-2 hours of designing systems out loud). Consistency over intensity — 2 hours daily for 4 weeks beats 8 hours daily for 1 week.' },
          { q: 'Should I memorize system designs?', a: 'No. Memorizing designs is fragile — the interviewer will ask a variation you have not seen. Instead, learn the patterns and building blocks. If you understand caching, sharding, and async processing, you can design any system from first principles.' },
          { q: 'What if I get a question I have never seen before?', a: 'This is expected and fine. Apply the delivery framework: clarify requirements, identify entities, design APIs, draw the high-level architecture using building blocks you know, then dive deep on the interesting challenges. The framework works for any question.' },
        ],
      },
    ],
  },
  'delivery-framework': {
    slug: 'delivery-framework', title: 'Delivery Framework',
    subtitle: 'The step-by-step structure to deliver a complete system design in 45 minutes',
    duration: '20 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'Why You Need a Framework', body: `The easiest way to fail a system design interview is to not deliver a working system. Without structure, candidates get lost in details, spend too long on one component, or forget key requirements. They run out of time with an incomplete design and no deep dives.\n\nA framework gives you a repeatable structure that works for any question. It ensures you cover all the bases, allocate time correctly, and leave room for the deep dives that differentiate you. Think of it as a checklist — even experienced pilots use checklists because they prevent mistakes under pressure.` },

      { type: 'text', heading: 'The 5-Step Framework', body: `Here is the framework, with time allocations for a 45-minute interview:\n\n**Step 1: Requirements (5 min)** — Scope the problem. What are we building?\n**Step 2: Core Entities (2 min)** — What data does the system manage?\n**Step 3: API Design (3 min)** — How do clients interact with the system?\n**Step 4: High-Level Design (10 min)** — Draw the architecture.\n**Step 5: Deep Dives (20 min)** — Go deep on 2-3 challenges.\n\nTotal: ~40 minutes, leaving 5 minutes for questions and wrap-up. The remaining time is buffer — you will need it.` },

      { type: 'text', heading: 'Step 1: Requirements (5 min)', body: `This is the most important step. Getting requirements wrong means designing the wrong system.\n\n**Functional Requirements** — "Users should be able to..." statements. Identify the top 3-4 core features. Everything else is "below the line" (out of scope). Check with the interviewer: "I am going to focus on these 3 features. Does that sound right, or would you like me to include anything else?"\n\nExample (Twitter): Users should be able to post tweets. Users should be able to follow other users. Users should see a personalized feed of tweets from people they follow.\n\n**Non-Functional Requirements** — System qualities with numbers. "The system should handle 300M DAU." "Feed load time should be under 200ms." "The system should be highly available (AP over CP for the feed)."\n\nKey questions to ask: What is the expected scale (DAU, QPS)? What is the read/write ratio? Do we need real-time updates? What are the latency requirements? Is consistency or availability more important?` },

      { type: 'text', heading: 'Step 2: Core Entities (2 min)', body: `Before designing APIs or architecture, identify the primary data entities. This grounds your thinking and ensures you and the interviewer are on the same page.\n\nExample (Twitter): User (profile, followers), Tweet (content, author, timestamp, media), Follow (directed relationship: follower → followee).\n\nKeep it simple — 3-5 entities. You will refine the schema during deep dives. The goal here is alignment, not completeness.` },

      { type: 'text', heading: 'Step 3: API Design (3 min)', body: `Define one REST endpoint per functional requirement. This creates a contract between the client and server.\n\nExample (Twitter):\nPOST /tweets — Create a tweet\nGET /feed?cursor=&limit=20 — Get personalized feed (cursor-based pagination)\nPOST /users/{id}/follow — Follow a user\n\nTell the interviewer: "These APIs may evolve as we go deeper into the design." This shows flexibility.\n\nUse the right HTTP verbs: POST for create, GET for read, PUT/PATCH for update, DELETE for delete. Mention pagination for list endpoints (cursor-based, not offset-based).` },

      { type: 'text', heading: 'Step 4: High-Level Design (10 min)', body: `Draw the architecture on the whiteboard. Walk through each functional requirement and show how the system satisfies it.\n\nStart simple: Client → Load Balancer → App Servers → Database.\n\nThen add components as needed: "We need caching here because the feed is read 100x more than it is written." "We need a message queue here because sending notifications should not block the API response." "We need a CDN here because images are served globally."\n\nFor each component you add, briefly explain why. Do not just draw boxes — explain the reasoning.\n\nBy the end of this step, you should have a diagram that satisfies all functional requirements. It does not need to be perfect — it needs to be functional.` },

      { type: 'callout', variant: 'warning', heading: 'The #1 Time Management Mistake', body: `Spending 25 minutes on the high-level design, leaving only 15 minutes for deep dives. Deep dives are 40% of the score. A good-enough HLD with two strong deep dives beats a perfect HLD with no deep dives. Set a mental alarm: after 10 minutes on HLD, move to deep dives even if the design is not perfect.` },

      { type: 'text', heading: 'Step 5: Deep Dives (20 min)', body: `This is where you differentiate yourself. Pick 2-3 areas to go deep on. Either the interviewer will guide you ("Tell me more about how you would handle the feed") or you should proactively identify the hardest challenges ("The most interesting challenge here is the fan-out problem — let me dive into that").\n\nGood deep dive topics: database schema design, caching strategy (what to cache, TTL, invalidation), handling race conditions (double-booking, duplicate payments), scaling bottlenecks (how to handle 10x traffic), consistency trade-offs (CP vs AP for different parts of the system), specific algorithms (consistent hashing, geohashing, ranking).\n\nStructure each deep dive: State the problem → Explore 2-3 options → Analyze trade-offs → Make a decision → Discuss edge cases.\n\nAt senior+ levels, you should drive deep dives proactively. Do not wait for the interviewer to ask. "The most challenging part of this system is X. Let me walk through how I would handle it."` },

      { type: 'text', heading: 'What is Expected at Each Level', body: `**Mid-level (L4/E4):** 80% breadth, 20% depth. Deliver a functional high-level design that satisfies requirements. It is OK to need hints from the interviewer for deep dives. Should understand basic building blocks and when to use them.\n\n**Senior (L5/E5):** 60% breadth, 40% depth. Speed through the HLD to leave time for deep dives. Proactively identify bottlenecks and trade-offs. Drive 1-2 deep dives without prompting. Articulate why you chose one approach over another.\n\n**Staff+ (L6+/E6+):** 40% breadth, 60% depth. Breeze through the HLD in 5-7 minutes. Drive the entire conversation. Go very deep on 2-3 areas with real-world experience. The interviewer should learn something from you.` },

      {
        type: 'faq', heading: 'Frequently Asked Questions',
        questions: [
          { q: 'What if the interviewer interrupts my framework?', a: 'Go with it. The framework is a guide, not a script. If the interviewer wants to skip to deep dives, skip. If they want to spend more time on requirements, spend more time. Adaptability is part of the evaluation.' },
          { q: 'Should I draw on a whiteboard or use a shared doc?', a: 'Use whatever the interviewer provides. For virtual interviews, tools like Excalidraw or a shared Google Doc work well. The key is that the interviewer can see your architecture diagram. Practice drawing clean, readable diagrams — messy diagrams hurt communication.' },
          { q: 'How do I know when to stop the HLD and start deep dives?', a: 'When your diagram satisfies all functional requirements at a high level. You do not need every detail — just the major components and data flow. If you have been drawing for 10 minutes, stop and ask: "I think this covers the core requirements. Should I dive deeper into any specific area?"' },
        ],
      },
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
