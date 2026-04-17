/**
 * System Design Interview FAQ
 * Common questions interviewers ask and how to answer them.
 * These appear at the bottom of the System Design course index page.
 */

export const INTERVIEW_FAQ = [
  {
    q: 'How do I start a system design interview?',
    a: `Start by clarifying requirements. Ask: "What are the top 3 features we need to support?" and "What scale are we designing for?" Then outline functional requirements (what the system does) and non-functional requirements (how it performs — latency, availability, consistency). Spend 3-5 minutes here. This shows the interviewer you think before you code.`,
  },
  {
    q: 'How do I estimate scale in an interview?',
    a: `Use back-of-envelope math. Start with DAU (daily active users), estimate actions per user per day, divide by 86,400 to get QPS. For storage: multiply daily writes by record size by 365 days. Round aggressively — the interviewer cares about order of magnitude, not exact numbers. Example: 100M DAU × 10 actions/day ÷ 86,400 ≈ 12,000 QPS.`,
  },
  {
    q: 'Should I use SQL or NoSQL?',
    a: `Default to PostgreSQL unless you have a specific reason not to. Choose NoSQL when you need: massive write throughput (Cassandra), flexible schema (MongoDB), simple key-value lookups (Redis/DynamoDB), or graph traversals (Neo4j). In interviews, explain your reasoning: "I am choosing PostgreSQL because we need ACID transactions for payments and complex JOINs for reporting."`,
  },
  {
    q: 'When should I introduce caching?',
    a: `When your read QPS exceeds what your database can handle, or when the same data is read repeatedly. The pattern: check cache first (Redis), if miss then query DB and populate cache. Do not cache everything — cache data that is read frequently, changes infrequently, and is expensive to compute. Mention TTL and eviction policy (LRU).`,
  },
  {
    q: 'When should I shard the database?',
    a: `Sharding is a last resort. First try: optimize queries, add indexes, vertical scaling, read replicas, caching. Only shard when write throughput exceeds what a single primary can handle. Choose a shard key with high cardinality that aligns with your query patterns. Mention consistent hashing to minimize data movement when adding shards.`,
  },
  {
    q: 'How do I handle a "celebrity problem" or hot partition?',
    a: `When one entity gets disproportionate traffic (a celebrity's profile, a viral post), it overloads a single shard or cache node. Solutions: replicate hot data across multiple nodes, add an in-process cache as a first layer, use request coalescing (only one request rebuilds the cache, others wait), or pre-compute and push to CDN.`,
  },
  {
    q: 'What is the difference between CP and AP systems?',
    a: `CP (Consistency + Partition tolerance): returns an error rather than stale data during a network partition. Use for payments, inventory. Examples: PostgreSQL, ZooKeeper. AP (Availability + Partition tolerance): returns potentially stale data rather than an error. Use for feeds, recommendations. Examples: Cassandra, DynamoDB. Most systems use CP for critical paths and AP for non-critical paths.`,
  },
  {
    q: 'How do I handle failures in distributed systems?',
    a: `Design for failure at every layer. Use retries with exponential backoff and jitter. Add circuit breakers to stop calling a failing service. Use dead letter queues for messages that fail processing. Make operations idempotent so retries are safe. Have health checks and auto-scaling. Always discuss: "What happens if X goes down?" in your interview.`,
  },
  {
    q: 'How deep should I go in a 45-minute interview?',
    a: `Spend 5 minutes on requirements, 5 on estimation, 5 on API/schema, 15 on high-level design, and 15 on 2-3 deep dives. Do not try to cover everything — pick the most interesting challenges and go deep. The interviewer would rather see depth on 2 topics than surface-level coverage of 10. Ask: "Should I dive deeper into X or move on to Y?"`,
  },
  {
    q: 'What if I do not know the answer to a follow-up question?',
    a: `Be honest: "I have not worked with that specific technology, but here is how I would reason about it..." Then apply first principles. Interviewers value problem-solving over memorization. If you can reason through an unfamiliar problem using fundamentals (latency, throughput, consistency, availability), you will do well.`,
  },
  {
    q: 'How do I practice system design?',
    a: `Pick a system you use daily (Instagram, Uber, WhatsApp). Set a 45-minute timer. Talk through the design out loud — requirements, estimation, API, schema, HLD, deep dives. Record yourself. The biggest gap for most people is not knowledge but delivery — practicing out loud is the highest-ROI activity. Then do 2-3 mock interviews with feedback.`,
  },
  {
    q: 'What are the most commonly asked system design questions?',
    a: `The top 10 most frequently asked: URL Shortener (Bit.ly), Chat System (WhatsApp), Social Feed (Facebook/Twitter), Video Streaming (YouTube/Netflix), Ride Sharing (Uber), File Storage (Dropbox/Google Drive), Ticket Booking (Ticketmaster), Rate Limiter, Web Crawler, and Payment System. Master these and you can handle most variations.`,
  },
];
