// System Design Course — Full structured content
// Mirrors hellointerview.com structure

import { IN_A_HURRY_TOPICS } from './courses/inAHurry';
import { QUESTION_BREAKDOWN_TOPICS } from './courses/questionBreakdowns';

export const COURSE_META = {
  title: 'System Design',
  subtitle: 'From zero to designing systems at scale',
  description: 'A complete, free system design course. Learn concepts, patterns, technologies, and walk through real interview questions.',
  totalTopics: 50,
  estimatedHours: 20,
};

// ─── SECTION DEFINITIONS ────────────────────────────────────────────────────
export const SECTIONS = [
  {
    id: 'in-a-hurry',
    title: 'In a Hurry',
    description: 'The essentials — get interview-ready fast',
    color: 'cyan',
    access: 'free',  // free for everyone
    topics: ['introduction', 'how-to-prep', 'delivery-framework', 'core-concepts-overview', 'key-technologies-overview', 'common-patterns-overview'],
  },
  {
    id: 'core-concepts',
    title: 'Core Concepts',
    description: 'Foundational knowledge every engineer needs',
    color: 'blue',
    access: 'pro',  // pro + elite
    freeTopics: ['networking-essentials', 'caching', 'numbers-to-know'], // these 3 free as preview
    topics: [
      'networking-essentials', 'api-design', 'data-modeling',
      'caching', 'sharding', 'consistent-hashing',
      'cap-theorem', 'database-indexing', 'numbers-to-know',
    ],
  },
  {
    id: 'question-breakdowns',
    title: 'Question Breakdowns',
    description: 'End-to-end walkthroughs of real interview questions',
    color: 'purple',
    access: 'elite',  // elite only
    freeTopics: ['design-bitly', 'design-rate-limiter'], // 2 free as preview
    proTopics: ['design-bitly', 'design-dropbox', 'design-ticketmaster', 'design-fb-news-feed', 'design-rate-limiter'], // pro gets 5
    topics: [
      'design-bitly', 'design-dropbox', 'design-ticketmaster',
      'design-fb-news-feed', 'design-tinder', 'design-whatsapp',
      'design-rate-limiter', 'design-youtube', 'design-uber',
      'design-web-crawler', 'design-instagram', 'design-google-docs',
      'design-distributed-cache', 'design-payment-system',
    ],
  },
  {
    id: 'patterns',
    title: 'Patterns',
    description: 'Reusable solutions to common system design problems',
    color: 'green',
    access: 'pro',
    freeTopics: ['pattern-realtime-updates'],
    topics: [
      'pattern-realtime-updates', 'pattern-scaling-reads',
      'pattern-scaling-writes', 'pattern-large-blobs',
      'pattern-long-running-tasks', 'pattern-multi-step-processes',
    ],
  },
  {
    id: 'key-technologies',
    title: 'Key Technologies',
    description: 'Deep dives into the tools that power modern systems',
    color: 'orange',
    access: 'pro',
    freeTopics: ['tech-redis'],
    topics: [
      'tech-redis', 'tech-kafka', 'tech-elasticsearch',
      'tech-postgresql', 'tech-cassandra', 'tech-dynamodb',
      'tech-api-gateway', 'tech-zookeeper',
    ],
  },
  {
    id: 'advanced',
    title: 'Advanced Topics',
    description: 'For senior engineers and staff-level interviews',
    color: 'red',
    access: 'elite',
    freeTopics: [],
    topics: ['advanced-time-series', 'advanced-data-structures', 'advanced-vector-db'],
  },
];

// ─── TOPIC CONTENT ──────────────────────────────────────────────────────────
export const TOPICS = {
  ...IN_A_HURRY_TOPICS,
  ...QUESTION_BREAKDOWN_TOPICS,

  // ── CORE CONCEPTS ──────────────────────────────────────────────────────────
  'networking-essentials': {
    slug: 'networking-essentials',
    title: 'Networking Essentials',
    subtitle: 'DNS, TCP/IP, HTTP, WebSockets — what every engineer needs to know',
    duration: '20 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'What Happens When You Type a URL', body: `1. **DNS Lookup** — Browser resolves domain to IP address\n2. **TCP Handshake** — 3-way handshake establishes connection\n3. **TLS Handshake** — Encrypts the connection (HTTPS)\n4. **HTTP Request** — Browser sends GET request\n5. **Server Response** — Server returns HTML/JSON\n6. **Rendering** — Browser renders the page` },
      { type: 'text', heading: 'DNS (Domain Name System)', body: `DNS translates human-readable domains (google.com) to IP addresses (142.250.80.46).\n\n**DNS Resolution:**\n1. Check browser cache\n2. Check OS cache\n3. Query recursive resolver (your ISP)\n4. Query root nameserver → TLD nameserver → authoritative nameserver\n\n**TTL** — How long DNS records are cached. Lower TTL = faster propagation but more DNS queries.` },
      { type: 'text', heading: 'TCP vs UDP', body: `**TCP (Transmission Control Protocol)**\n- Reliable, ordered delivery\n- Connection-oriented (3-way handshake)\n- Error checking and retransmission\n- Use for: HTTP, email, file transfer\n\n**UDP (User Datagram Protocol)**\n- No guarantee of delivery or order\n- No connection setup\n- Faster, lower overhead\n- Use for: video streaming, gaming, DNS, VoIP` },
      { type: 'text', heading: 'HTTP/1.1 vs HTTP/2 vs HTTP/3', body: `**HTTP/1.1** — One request per connection. Head-of-line blocking.\n\n**HTTP/2** — Multiplexing (multiple requests over one connection). Header compression. Server push. ~2x faster.\n\n**HTTP/3** — Built on QUIC (UDP-based). Eliminates TCP head-of-line blocking. Better on lossy networks (mobile).` },
      { type: 'text', heading: 'WebSockets vs Long Polling vs SSE', body: `**WebSockets** — Full-duplex, persistent connection. Best for real-time bidirectional (chat, gaming, live collaboration).\n\n**Long Polling** — Client holds request open until server has data. Simple but inefficient.\n\n**Server-Sent Events (SSE)** — Server pushes to client over HTTP. One-directional. Good for live feeds, notifications.` },
      { type: 'callout', variant: 'info', heading: 'CDN (Content Delivery Network)', body: 'CDNs cache static assets (images, JS, CSS) at edge servers close to users. Reduces latency from 200ms to <10ms for static content. Examples: Cloudflare, AWS CloudFront, Fastly.' },
    ],
  },

  'api-design': {
    slug: 'api-design',
    title: 'API Design',
    subtitle: 'REST, GraphQL, gRPC — designing clean, scalable APIs',
    duration: '20 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'REST API Design Principles', body: `**Resources are nouns:** /users, /posts, /orders\n**HTTP verbs define actions:**\n- GET — read\n- POST — create\n- PUT/PATCH — update\n- DELETE — remove\n\n**Stateless** — each request contains all needed info\n**Use HTTP status codes:** 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error` },
      { type: 'text', heading: 'REST URL Design', body: `**Good:**\n- GET /users/{id}\n- POST /users\n- GET /users/{id}/posts\n- PATCH /posts/{id}\n\n**Bad:**\n- GET /getUser?id=123\n- POST /createNewUser\n- GET /user_posts/{userId}\n\nRule: Use nouns, not verbs. Use plural for collections. Nest resources to show relationships.` },
      { type: 'text', heading: 'GraphQL', body: `Clients request exactly the data they need — no over-fetching or under-fetching.\n\n**Pros:** Flexible queries, single endpoint, strongly typed schema, great for complex UIs\n**Cons:** Complex caching, N+1 query problem, overkill for simple APIs\n\n**Use when:** Mobile apps (bandwidth sensitive), complex nested data, multiple clients with different data needs` },
      { type: 'text', heading: 'gRPC', body: `Uses Protocol Buffers (binary) over HTTP/2. Much faster than REST for internal service communication.\n\n**Pros:** 5-10x faster than REST, strongly typed, streaming support, auto-generated clients\n**Cons:** Not human-readable, harder to debug, limited browser support\n\n**Use when:** Internal microservice communication, real-time streaming, performance-critical paths` },
      { type: 'text', heading: 'Rate Limiting', body: `**Token Bucket** — Tokens refill at fixed rate. Allows bursts.\n**Leaky Bucket** — Requests processed at fixed rate. Smooths traffic.\n**Fixed Window** — Count requests per time window (100/minute)\n**Sliding Window** — More accurate, prevents edge-case bursts\n\nStore counters in Redis for distributed rate limiting.` },
      { type: 'callout', variant: 'tip', heading: 'API Versioning', body: 'Always version your APIs. URL versioning (/v1/users) is most visible and easiest to use. Never break existing clients.' },
    ],
  },

  'data-modeling': {
    slug: 'data-modeling',
    title: 'Data Modeling',
    subtitle: 'SQL vs NoSQL, schema design, and choosing the right database',
    duration: '25 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'SQL vs NoSQL', body: `**SQL (Relational)** — Structured data, ACID transactions, complex queries.\nUse for: financial data, user accounts, orders, anything requiring joins.\n\n**NoSQL** — Flexible schema, horizontal scale, eventual consistency.\nUse for: user activity feeds, product catalogs, real-time analytics, unstructured data.\n\nThe choice isn't SQL vs NoSQL — it's about picking the right tool for the data model.` },
      { type: 'text', heading: 'NoSQL Types', body: `**Document (MongoDB, Firestore)** — JSON-like documents. Good for hierarchical data.\n\n**Key-Value (Redis, DynamoDB)** — Simple lookups by key. Extremely fast.\n\n**Wide-Column (Cassandra, HBase)** — Rows with dynamic columns. Good for time-series, write-heavy workloads.\n\n**Graph (Neo4j)** — Nodes and edges. Good for social networks, recommendation engines.` },
      { type: 'animation', id: 'db-replication', heading: 'Database Replication', body: 'Primary handles writes. Replicas handle reads. Replication lag is the trade-off.' },
      { type: 'text', heading: 'Schema Design Tips', body: `**Normalization** — Eliminate redundancy. Good for consistency, bad for read performance.\n\n**Denormalization** — Duplicate data for faster reads. Good for read-heavy systems.\n\n**Rule of thumb:** Normalize first, denormalize when you have a proven performance problem.\n\n**For NoSQL:** Design your schema around your access patterns, not your data relationships.` },
      { type: 'callout', variant: 'info', heading: 'ACID vs BASE', body: 'SQL databases are ACID (Atomic, Consistent, Isolated, Durable). NoSQL databases are often BASE (Basically Available, Soft state, Eventually consistent). Choose based on your consistency requirements.' },
    ],
  },

  'caching': {
    slug: 'caching',
    title: 'Caching',
    subtitle: 'Speed up reads and reduce database load with caching',
    duration: '25 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'Why Cache?', body: `Caching stores frequently accessed data in fast storage (memory) to avoid expensive recomputation or database queries.\n\n**Cache hit** — Data found in cache → fast response (~1ms)\n**Cache miss** — Data not in cache → fetch from DB (~100ms), store in cache\n\nTypical cache hit rates in production: 80-99%` },
      { type: 'animation', id: 'cache-flow', heading: 'Cache Hit vs Cache Miss', body: 'Cache hit returns data instantly. Cache miss fetches from DB and populates the cache.' },
      { type: 'text', heading: 'Cache Strategies', body: `**Cache-Aside (Lazy Loading)** — App checks cache first. On miss, loads from DB and writes to cache. Most common.\n\n**Write-Through** — Write to cache and DB simultaneously. Cache always fresh, but slower writes.\n\n**Write-Behind (Write-Back)** — Write to cache, async write to DB. Fast writes, risk of data loss.\n\n**Read-Through** — Cache sits in front of DB, handles misses automatically.` },
      { type: 'text', heading: 'Cache Eviction Policies', body: `**LRU (Least Recently Used)** — Remove the item not accessed for the longest time. Most common.\n**LFU (Least Frequently Used)** — Remove the item accessed least often.\n**FIFO** — Remove the oldest item.\n**TTL (Time To Live)** — Items expire after a set time.` },
      { type: 'callout', variant: 'warning', heading: 'Cache Invalidation is Hard', body: '"There are only two hard things in Computer Science: cache invalidation and naming things." When data changes in DB, you must invalidate or update the cache. Stale data is a common bug.' },
      { type: 'text', heading: 'Cache Stampede (Thundering Herd)', body: `When a popular cache key expires, many requests simultaneously hit the DB.\n\n**Solutions:**\n- **Mutex/Lock** — Only one request fetches from DB, others wait\n- **Probabilistic early expiration** — Randomly refresh before TTL expires\n- **Background refresh** — Async refresh before expiry\n- **Jitter** — Add random offset to TTL to spread expirations` },
    ],
  },

  'sharding': {
    slug: 'sharding',
    title: 'Sharding',
    subtitle: 'Horizontal partitioning to scale databases beyond a single machine',
    duration: '20 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'What is Sharding?', body: `Sharding splits data across multiple databases. Each shard holds a subset of data.\n\nWhen to shard:\n- Single DB can't handle the write load\n- Dataset is too large for one machine\n- You need geographic distribution` },
      { type: 'text', heading: 'Sharding Strategies', body: `**Range-based** — Users A-M on shard 1, N-Z on shard 2\n- Pro: Simple, range queries easy\n- Con: Hotspots (all new users go to last shard)\n\n**Hash-based** — hash(user_id) % num_shards\n- Pro: Even distribution\n- Con: Range queries require all shards, resharding is painful\n\n**Directory-based** — Lookup table maps keys to shards\n- Pro: Flexible, easy to move data\n- Con: Lookup table is a bottleneck/SPOF` },
      { type: 'text', heading: 'Challenges', body: `**Cross-shard queries** — JOINs across shards are expensive or impossible\n**Rebalancing** — Adding shards requires moving data\n**Hotspots** — Some shards get more traffic (celebrity problem)\n**Transactions** — Distributed transactions are complex\n\n**Mitigation:** Use consistent hashing to minimize data movement when resharding.` },
      { type: 'callout', variant: 'warning', heading: 'Avoid Premature Sharding', body: 'Sharding adds enormous complexity. Most systems don\'t need it until they have millions of users. Start with vertical scaling, then read replicas, then sharding as a last resort.' },
    ],
  },

  'consistent-hashing': {
    slug: 'consistent-hashing',
    title: 'Consistent Hashing',
    subtitle: 'Minimize data movement when adding or removing nodes',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Problem with Simple Hashing', body: `With simple hash(key) % N:\n- Adding a node changes N\n- Almost all keys remap to different nodes\n- Massive data movement, cache invalidation\n\nExample: 1M keys, add 1 server to 10 → ~91% of keys move` },
      { type: 'text', heading: 'How Consistent Hashing Works', body: `Imagine a ring (0 to 2^32). Both servers and keys are hashed onto this ring.\n\nA key is assigned to the first server clockwise from its position on the ring.\n\n**Adding a server:** Only keys between the new server and its predecessor move.\n**Removing a server:** Only that server's keys move to the next server.\n\nResult: Only K/N keys move on average (K = keys, N = nodes).` },
      { type: 'text', heading: 'Virtual Nodes', body: `Problem: With few servers, distribution is uneven.\n\nSolution: Each physical server gets multiple positions on the ring (virtual nodes).\n\nWith 150 virtual nodes per server, distribution becomes very even.\n\nUsed by: Amazon DynamoDB, Apache Cassandra, Memcached` },
      { type: 'callout', variant: 'info', heading: 'Where It\'s Used', body: 'Consistent hashing is used in distributed caches (Memcached, Redis Cluster), distributed databases (Cassandra, DynamoDB), and load balancers for session affinity.' },
    ],
  },

  'cap-theorem': {
    slug: 'cap-theorem',
    title: 'CAP Theorem',
    subtitle: 'Consistency, Availability, Partition Tolerance — pick two',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The CAP Theorem', body: `A distributed system can only guarantee **2 of 3** properties:\n\n**Consistency (C)** — Every read receives the most recent write or an error\n**Availability (A)** — Every request receives a response (not necessarily the latest data)\n**Partition Tolerance (P)** — System continues operating despite network partitions\n\nSince network partitions always happen in distributed systems, you must choose between **CP** or **AP**.` },
      { type: 'text', heading: 'CP Systems', body: `**CP (Consistent + Partition Tolerant)**\nWhen a partition occurs, the system returns an error rather than stale data.\n\nExamples: HBase, Zookeeper, MongoDB (with strong consistency)\n\nUse when: Financial transactions, inventory management, anything where stale data causes real harm.` },
      { type: 'text', heading: 'AP Systems', body: `**AP (Available + Partition Tolerant)**\nWhen a partition occurs, the system returns potentially stale data rather than an error.\n\nExamples: Cassandra, DynamoDB, CouchDB\n\nUse when: Social media feeds, product catalogs, DNS — where availability matters more than perfect consistency.` },
      { type: 'callout', variant: 'info', heading: 'PACELC Extension', body: 'CAP only considers behavior during partitions. PACELC extends it: even without partitions, there\'s a trade-off between Latency and Consistency. Most real systems optimize for low latency, accepting eventual consistency.' },
      { type: 'text', heading: 'Eventual Consistency', body: `Most AP systems use eventual consistency: given enough time without new updates, all replicas will converge to the same value.\n\n**Conflict resolution strategies:**\n- **Last Write Wins (LWW)** — Timestamp-based, simple but can lose data\n- **Vector Clocks** — Track causality, detect conflicts\n- **CRDTs** — Data structures that merge automatically (used in collaborative editing)` },
    ],
  },

  'database-indexing': {
    slug: 'database-indexing',
    title: 'Database Indexing',
    subtitle: 'Speed up queries with the right indexes',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'What is an Index?', body: `An index is a data structure that speeds up data retrieval at the cost of additional storage and slower writes.\n\nWithout index: Full table scan O(N)\nWith index: O(log N) for B-tree, O(1) for hash` },
      { type: 'text', heading: 'Index Types', body: `**B-Tree Index** — Default in most SQL DBs. Balanced tree structure. Good for range queries (>, <, BETWEEN), equality, ORDER BY.\n\n**Hash Index** — O(1) lookups. Only for equality queries (=). Not for ranges.\n\n**Composite Index** — Index on multiple columns. Column order matters — leftmost prefix rule.\n\n**Covering Index** — Index includes all columns needed by a query. No table lookup needed.\n\n**Full-Text Index** — For text search (LIKE '%word%'). Used in Elasticsearch, MySQL FULLTEXT.` },
      { type: 'text', heading: 'When to Index', body: `**Index these:**\n- Primary keys (automatic)\n- Foreign keys\n- Columns in WHERE clauses\n- Columns in ORDER BY / GROUP BY\n- Columns in JOIN conditions\n\n**Don't over-index:**\n- Every write must update all indexes\n- Indexes consume storage\n- Too many indexes slow down writes more than they help reads` },
      { type: 'callout', variant: 'tip', heading: 'EXPLAIN / Query Plans', body: 'Use EXPLAIN (MySQL/PostgreSQL) to see if your query is using an index. If you see "Full Table Scan" on a large table, you need an index.' },
    ],
  },

  'numbers-to-know': {
    slug: 'numbers-to-know',
    title: 'Numbers to Know',
    subtitle: 'Latency numbers, storage sizes, and back-of-envelope math',
    duration: '10 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'Latency Numbers (2024)', body: `**L1 cache reference:** 1 ns\n**L2 cache reference:** 4 ns\n**RAM access:** 100 ns\n**SSD random read:** 100 μs (100,000 ns)\n**HDD seek:** 10 ms (10,000,000 ns)\n**Network: same datacenter:** 0.5 ms\n**Network: cross-region:** 150 ms\n**Network: cross-continent:** 300 ms\n\nKey insight: Memory is 1000x faster than SSD. SSD is 100x faster than HDD.` },
      { type: 'text', heading: 'Storage Sizes', body: `**1 KB** = 1,000 bytes ≈ a short email\n**1 MB** = 1,000 KB ≈ a photo thumbnail\n**1 GB** = 1,000 MB ≈ a movie\n**1 TB** = 1,000 GB ≈ 1000 movies\n**1 PB** = 1,000 TB ≈ Facebook stores ~100 PB of photos\n\n**Common sizes:**\n- Tweet: ~280 bytes\n- User profile: ~1 KB\n- Profile photo: ~200 KB\n- HD video: ~1 GB/hour` },
      { type: 'text', heading: 'Back-of-Envelope Formulas', body: `**QPS from DAU:**\nQPS = DAU × actions_per_day ÷ 86,400\n\n**Storage per year:**\nStorage = writes_per_day × record_size × 365\n\n**Bandwidth:**\nBandwidth = QPS × average_response_size\n\n**Example — Twitter:**\n- 300M DAU, 20% post = 60M tweets/day\n- Write QPS = 60M ÷ 86,400 ≈ 700/sec\n- Read QPS (100:1 ratio) = 70,000/sec\n- Storage = 60M × 1KB × 365 = 21.9 TB/year` },
      { type: 'callout', variant: 'tip', heading: 'Powers of 2', body: '2^10 = 1,024 ≈ 1K | 2^20 ≈ 1M | 2^30 ≈ 1B | 2^40 ≈ 1T. Memorize these for quick mental math.' },
    ],
  },
};

// ── PATTERNS ───────────────────────────────────────────────────────────────
Object.assign(TOPICS, {

  'pattern-realtime-updates': {
    slug: 'pattern-realtime-updates', title: 'Real-time Updates', subtitle: 'WebSockets, SSE, long polling — when to use what', duration: '20 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Problem', body: `HTTP is request-response. The client must ask for data. But many features need the server to push data to clients:\n- Chat messages\n- Live sports scores\n- Stock prices\n- Collaborative editing\n- Notifications` },
      { type: 'text', heading: 'Long Polling', body: `Client sends request. Server holds it open until data is available (or timeout).\nClient immediately sends another request after receiving response.\n\n**Pros:** Works everywhere, simple\n**Cons:** High server connections, latency (one round trip per message)\n\n**Use when:** Simple notifications, low-frequency updates, broad browser support needed` },
      { type: 'text', heading: 'Server-Sent Events (SSE)', body: `Server pushes data to client over a persistent HTTP connection. One-directional (server → client only).\n\n**Pros:** Simple, built-in reconnection, works over HTTP/2\n**Cons:** One-directional only, limited to text\n\n**Use when:** Live feeds, notifications, dashboards where client doesn't need to send data` },
      { type: 'text', heading: 'WebSockets', body: `Full-duplex, persistent connection. Both sides can send messages anytime.\n\n**Pros:** Low latency, bidirectional, efficient\n**Cons:** More complex, stateful (harder to scale), not HTTP\n\n**Use when:** Chat, collaborative editing, gaming, anything requiring bidirectional real-time communication` },
      { type: 'callout', variant: 'tip', heading: 'Scaling WebSockets', body: 'WebSocket connections are stateful — a user is connected to a specific server. Use a pub/sub system (Redis Pub/Sub, Kafka) so any server can publish messages to any connected client.' },
    ],
  },

  'pattern-scaling-reads': {
    slug: 'pattern-scaling-reads', title: 'Scaling Reads', subtitle: 'Read replicas, caching, CDN, and CQRS', duration: '20 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'Read-Heavy Systems', body: `Most web applications have 10:1 to 100:1 read:write ratios. Scaling reads is usually the first bottleneck.\n\n**Techniques in order of complexity:**\n1. Caching (Redis, Memcached)\n2. Read replicas\n3. CDN for static content\n4. CQRS (separate read/write models)\n5. Denormalization` },
      { type: 'text', heading: 'Read Replicas', body: `Add replica databases that receive a copy of all writes from the primary.\nRoute all read queries to replicas.\n\n**Benefits:**\n- Scale reads horizontally\n- Replicas can be in different regions\n- Failover if primary dies\n\n**Trade-off:**\nReplication lag — replicas may be slightly behind primary (usually <1 second)\nNot suitable for reads that must see the latest write` },
      { type: 'text', heading: 'CQRS Pattern', body: `**Command Query Responsibility Segregation:**\nSeparate the write model (commands) from the read model (queries).\n\nWrite side: normalized DB optimized for writes\nRead side: denormalized, pre-computed views optimized for reads\n\n**Example:** E-commerce\nWrite: orders table, products table (normalized)\nRead: pre-computed "product page" document with all info (denormalized)\n\nSync via event streaming (Kafka)` },
    ],
  },

  'pattern-scaling-writes': {
    slug: 'pattern-scaling-writes', title: 'Scaling Writes', subtitle: 'Sharding, write-ahead logs, and async processing', duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'Write Bottlenecks', body: `Writes are harder to scale than reads because:\n- Must be consistent\n- Can't serve stale data\n- Require coordination\n\n**Common write bottlenecks:**\n- Single primary DB\n- Synchronous writes to multiple systems\n- Hot partitions (all writes to one shard)` },
      { type: 'text', heading: 'Async Write Processing', body: `Don't make users wait for slow operations.\n\n**Pattern:**\n1. Write to fast store (Redis, Kafka)\n2. Return success to user immediately\n3. Background worker processes and writes to DB\n\n**Examples:**\n- Like/view counts: increment Redis counter, batch write to DB every minute\n- Email sending: queue message, return success, send async\n- Analytics events: write to Kafka, process in batch` },
      { type: 'text', heading: 'Write-Ahead Log (WAL)', body: `Before writing to the main data structure, write to an append-only log.\n\n**Benefits:**\n- Fast writes (sequential append)\n- Crash recovery (replay log)\n- Replication (send log to replicas)\n\nUsed by: PostgreSQL, MySQL, Kafka, RocksDB\n\n**LSM Trees (Log-Structured Merge):**\nWrites go to in-memory buffer (memtable)\nPeriodically flushed to disk as sorted files (SSTables)\nUsed by: Cassandra, RocksDB, LevelDB` },
    ],
  },

  'pattern-large-blobs': {
    slug: 'pattern-large-blobs', title: 'Handling Large Blobs', subtitle: 'Storing and serving images, videos, and files', duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'Never Store Blobs in Your DB', body: `Storing large files in a relational DB:\n- Bloats DB size\n- Slows down backups\n- Can't use CDN\n- Expensive\n\n**Always use object storage:** S3, GCS, Azure Blob Storage\nStore only the URL/key in your DB.` },
      { type: 'text', heading: 'Upload Pattern', body: `**Direct upload to S3 (best):**\n1. Client requests pre-signed URL from your server\n2. Server generates pre-signed URL (valid for 15 min)\n3. Client uploads directly to S3 (bypasses your servers)\n4. S3 notifies your server on completion\n5. Server saves metadata to DB\n\n**Benefits:** Your servers don't handle large file transfers. S3 handles bandwidth.` },
      { type: 'text', heading: 'CDN for Serving', body: `After upload, serve files through CDN:\n- Edge nodes cache files close to users\n- Reduces latency from 200ms to <10ms\n- Reduces origin bandwidth costs\n\n**Cache-Control headers:**\nImmutable files (images with hash in URL): max-age=31536000 (1 year)\nMutable files: max-age=3600 (1 hour) + ETag for validation` },
    ],
  },

  'pattern-long-running-tasks': {
    slug: 'pattern-long-running-tasks', title: 'Managing Long Running Tasks', subtitle: 'Async job processing, progress tracking, and retries', duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Problem', body: `Some operations take too long for a synchronous HTTP request:\n- Video transcoding (minutes)\n- Report generation (seconds to minutes)\n- Sending bulk emails\n- ML model inference\n- Data exports\n\nHTTP timeout is typically 30-60 seconds. Don't make users wait.` },
      { type: 'text', heading: 'Async Job Pattern', body: `1. Client submits job → server returns job_id immediately (202 Accepted)\n2. Job added to queue (Kafka, SQS, Redis)\n3. Worker picks up job, processes it\n4. Worker updates job status in DB\n5. Client polls GET /jobs/{job_id} for status\n   OR server pushes update via WebSocket/SSE\n\n**Job states:** PENDING → RUNNING → COMPLETED / FAILED` },
      { type: 'text', heading: 'Retry Logic', body: `Jobs fail. Design for retries:\n\n**Exponential backoff:**\nRetry after 1s, 2s, 4s, 8s, 16s...\nAdd jitter to prevent thundering herd\n\n**Dead letter queue:**\nAfter N retries, move to DLQ for manual inspection\n\n**Idempotency:**\nJobs must be safe to run multiple times\nUse unique job IDs to detect duplicates` },
    ],
  },

  'pattern-multi-step-processes': {
    slug: 'pattern-multi-step-processes', title: 'Multi-step Processes', subtitle: 'Sagas, distributed transactions, and workflow orchestration', duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Problem', body: `Some operations span multiple services:\n- Order: reserve inventory → charge payment → send confirmation\n- User signup: create account → send email → create profile\n\nIf step 2 fails, how do you undo step 1?\nDistributed transactions (2PC) are slow and fragile.` },
      { type: 'text', heading: 'Saga Pattern', body: `Break the transaction into a sequence of local transactions.\nEach step publishes an event that triggers the next step.\nIf a step fails, execute compensating transactions to undo previous steps.\n\n**Choreography:** Each service listens for events and reacts\n**Orchestration:** Central coordinator tells each service what to do\n\n**Example — Order Saga:**\n1. Create order (PENDING)\n2. Reserve inventory → success → continue / fail → cancel order\n3. Charge payment → success → continue / fail → release inventory\n4. Send confirmation → mark order COMPLETED` },
      { type: 'callout', variant: 'warning', heading: 'Eventual Consistency', body: 'Sagas are eventually consistent, not immediately consistent. There\'s a window where the system is in an intermediate state. Design your UI to handle this (show "processing" states).' },
    ],
  },
});

// ── KEY TECHNOLOGIES ───────────────────────────────────────────────────────
Object.assign(TOPICS, {

  'tech-redis': {
    slug: 'tech-redis', title: 'Redis', subtitle: 'In-memory data store — caching, queues, pub/sub, and more', duration: '20 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'What is Redis?', body: `Redis is an in-memory data structure store. It's used as a cache, message broker, and database.\n\n**Key properties:**\n- Sub-millisecond latency\n- Rich data structures\n- Optional persistence\n- Pub/Sub messaging\n- Lua scripting\n- Atomic operations` },
      { type: 'text', heading: 'Data Structures', body: `**String** — Simple key-value. Counters, sessions, cached objects.\n**List** — Ordered list. Message queues, activity feeds.\n**Set** — Unique values. Tags, unique visitors.\n**Sorted Set** — Set with scores. Leaderboards, rate limiting.\n**Hash** — Field-value pairs. User profiles, objects.\n**Bitmap** — Bit array. Feature flags, daily active users.\n**HyperLogLog** — Approximate cardinality. Unique visitor counts.` },
      { type: 'text', heading: 'Common Use Cases', body: `**Caching:** Store DB query results, API responses\n**Sessions:** Store user session data (TTL-based)\n**Rate Limiting:** INCR + EXPIRE per user/IP\n**Leaderboards:** Sorted sets with scores\n**Pub/Sub:** Real-time notifications\n**Distributed Locks:** SETNX (set if not exists)\n**Job Queues:** List-based queues (LPUSH/BRPOP)` },
      { type: 'callout', variant: 'info', heading: 'Redis Persistence', body: 'RDB (snapshots): periodic point-in-time snapshots. Fast recovery, some data loss. AOF (append-only file): log every write operation. Slower but no data loss. Use both for production.' },
    ],
  },

  'tech-kafka': {
    slug: 'tech-kafka', title: 'Kafka', subtitle: 'Distributed event streaming for high-throughput pipelines', duration: '25 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'What is Kafka?', body: `Kafka is a distributed event streaming platform. It's a durable, ordered, append-only log.\n\n**Core concepts:**\n- **Topic** — Named stream of events\n- **Partition** — Topic split into ordered partitions for parallelism\n- **Producer** — Writes events to topics\n- **Consumer** — Reads events from topics\n- **Consumer Group** — Multiple consumers sharing work` },
      { type: 'animation', id: 'message-queue', heading: 'Kafka Architecture', body: 'Producers write to topics. Consumers read at their own pace. Messages persist for configurable retention.' },
      { type: 'text', heading: 'Why Kafka over a Simple Queue?', body: `**Durability:** Messages persist on disk (configurable retention, e.g., 7 days)\n**Replay:** Consumers can re-read old messages\n**Multiple consumers:** Many consumer groups can read the same topic independently\n**High throughput:** Millions of messages/second\n**Ordering:** Guaranteed within a partition\n\n**Use Kafka when:** You need durability, replay, multiple consumers, or very high throughput.` },
      { type: 'text', heading: 'Partitioning Strategy', body: `Partitions enable parallelism. More partitions = more throughput.\n\n**Partition key:** Determines which partition a message goes to\n- Same key → same partition → ordered for that key\n- No key → round-robin across partitions\n\n**Example:** For user events, use user_id as partition key\nAll events for a user go to the same partition → ordered per user` },
      { type: 'callout', variant: 'tip', heading: 'Kafka vs RabbitMQ', body: 'Use Kafka for: event streaming, audit logs, analytics pipelines, replay needed. Use RabbitMQ for: task queues, complex routing, RPC patterns, when you need message acknowledgment and routing flexibility.' },
    ],
  },

  'tech-elasticsearch': {
    slug: 'tech-elasticsearch', title: 'Elasticsearch', subtitle: 'Full-text search and analytics at scale', duration: '20 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'What is Elasticsearch?', body: `Elasticsearch is a distributed search and analytics engine built on Apache Lucene.\n\n**Use cases:**\n- Full-text search (product search, document search)\n- Log analytics (ELK stack)\n- Geospatial search\n- Time-series analytics\n- Autocomplete` },
      { type: 'text', heading: 'How It Works', body: `**Inverted Index:**\nFor each word, store a list of documents containing it.\n"apple" → [doc1, doc3, doc7]\n"banana" → [doc2, doc3]\n\nSearch "apple banana" → find intersection → [doc3]\n\n**Relevance Scoring:**\nTF-IDF (term frequency × inverse document frequency)\nBM25 (improved TF-IDF, default in modern ES)` },
      { type: 'text', heading: 'Architecture', body: `**Index** — Collection of documents (like a DB table)\n**Shard** — Index split into shards for distribution\n**Replica** — Copy of a shard for redundancy\n\n**Write path:** Document → primary shard → replica shards\n**Read path:** Query → any shard (primary or replica)\n\n**Near real-time:** New documents searchable within ~1 second (refresh interval)` },
      { type: 'callout', variant: 'warning', heading: 'ES is Not a Primary DB', body: 'Elasticsearch is eventually consistent and doesn\'t support transactions. Use it as a search layer on top of your primary DB. Sync data from DB to ES via CDC (Change Data Capture) or event streaming.' },
    ],
  },

  'tech-postgresql': {
    slug: 'tech-postgresql', title: 'PostgreSQL', subtitle: 'The world\'s most advanced open-source relational database', duration: '20 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'Why PostgreSQL?', body: `PostgreSQL is the go-to relational database for most applications.\n\n**Strengths:**\n- Full ACID compliance\n- Rich data types (JSON, arrays, UUID, geometric)\n- Advanced indexing (B-tree, Hash, GiST, GIN, BRIN)\n- Full-text search built-in\n- PostGIS for geospatial\n- Excellent performance\n- Open source, no licensing costs` },
      { type: 'text', heading: 'Key Features for System Design', body: `**JSONB:** Store and query JSON documents. Indexed. Good for semi-structured data.\n\n**Partitioning:** Range, list, or hash partitioning. Built-in table partitioning.\n\n**Logical Replication:** Stream changes to replicas or external systems (CDC).\n\n**Connection Pooling:** Use PgBouncer. PostgreSQL has high per-connection overhead.\n\n**VACUUM:** Background process that reclaims space from deleted rows. Important for write-heavy tables.` },
      { type: 'callout', variant: 'tip', heading: 'When to Use PostgreSQL', body: 'Default choice for most applications. Use when you need ACID transactions, complex queries, or relational data. Switch to NoSQL only when you have a specific reason (scale, schema flexibility, specific data model).' },
    ],
  },

  'tech-cassandra': {
    slug: 'tech-cassandra', title: 'Cassandra', subtitle: 'Wide-column store for write-heavy, time-series workloads', duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'What is Cassandra?', body: `Cassandra is a distributed wide-column store designed for:\n- Write-heavy workloads\n- Time-series data\n- High availability (no single point of failure)\n- Linear horizontal scalability\n\n**Used by:** Netflix, Apple, Instagram, Discord` },
      { type: 'text', heading: 'Data Model', body: `**Keyspace** → **Table** → **Row**\n\nRows identified by **partition key** (determines which node stores the data)\nWithin a partition, rows sorted by **clustering key**\n\n**Design principle:** Model your data around your queries, not your relationships.\nDenormalize aggressively. Joins don't exist.\n\n**Example — Messages:**\nPartition key: conversation_id\nClustering key: timestamp DESC\nQuery: "Get last 50 messages in conversation X" → single partition read` },
      { type: 'text', heading: 'Consistency Levels', body: `Cassandra lets you choose consistency per query:\n\n**ONE** — Fastest, least consistent. One replica responds.\n**QUORUM** — Majority of replicas respond. Good balance.\n**ALL** — All replicas respond. Slowest, most consistent.\n\n**Tunable consistency:** Write QUORUM + Read QUORUM = strong consistency\nWrite ONE + Read ONE = eventual consistency (fastest)` },
      { type: 'callout', variant: 'warning', heading: 'Cassandra Anti-patterns', body: 'No JOINs, no transactions, no secondary indexes at scale. Don\'t use Cassandra if you need complex queries or ACID. Use it for: time-series, event logs, message storage, IoT data.' },
    ],
  },

  'tech-dynamodb': {
    slug: 'tech-dynamodb', title: 'DynamoDB', subtitle: 'AWS managed NoSQL — serverless, scalable key-value store', duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'What is DynamoDB?', body: `DynamoDB is AWS's fully managed NoSQL database.\n\n**Key features:**\n- Single-digit millisecond latency at any scale\n- Serverless (no capacity planning)\n- Auto-scaling\n- Global tables (multi-region)\n- Streams (CDC)\n- On-demand or provisioned capacity` },
      { type: 'text', heading: 'Data Model', body: `**Table** → **Item** (row) → **Attributes** (columns)\n\n**Primary key:**\n- Simple: Partition key only\n- Composite: Partition key + Sort key\n\n**Access patterns:**\nDesign your table around your access patterns.\nUse GSI (Global Secondary Index) for alternate access patterns.\n\n**Single-table design:**\nStore multiple entity types in one table\nUse PK/SK patterns to model relationships` },
      { type: 'callout', variant: 'tip', heading: 'When to Use DynamoDB', body: 'Use when: you\'re on AWS, need serverless scaling, simple key-value or document access patterns, or need global distribution. Avoid for: complex queries, ad-hoc analytics, or when you need SQL.' },
    ],
  },

  'tech-api-gateway': {
    slug: 'tech-api-gateway', title: 'API Gateway', subtitle: 'Single entry point for all client requests', duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'What is an API Gateway?', body: `An API Gateway is a server that acts as the single entry point for all client requests.\n\n**Functions:**\n- Request routing\n- Authentication/Authorization\n- Rate limiting\n- SSL termination\n- Request/response transformation\n- Logging and monitoring\n- Load balancing` },
      { type: 'text', heading: 'Benefits', body: `**Decoupling:** Clients don't know about internal service structure\n**Cross-cutting concerns:** Auth, rate limiting, logging in one place\n**Protocol translation:** REST → gRPC, HTTP/1.1 → HTTP/2\n**Versioning:** Route /v1 and /v2 to different services\n\n**Examples:** AWS API Gateway, Kong, Nginx, Envoy, Traefik` },
      { type: 'callout', variant: 'warning', heading: 'API Gateway as SPOF', body: 'The API Gateway is a critical component. Run multiple instances behind a load balancer. Use circuit breakers to prevent cascade failures when backend services are down.' },
    ],
  },

  'tech-zookeeper': {
    slug: 'tech-zookeeper', title: 'ZooKeeper', subtitle: 'Distributed coordination service', duration: '15 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'What is ZooKeeper?', body: `ZooKeeper is a distributed coordination service. It provides:\n- Distributed configuration management\n- Service discovery\n- Leader election\n- Distributed locks\n- Naming registry` },
      { type: 'text', heading: 'How It Works', body: `ZooKeeper maintains a hierarchical namespace (like a filesystem).\nNodes (znodes) can store small amounts of data.\n\n**Ephemeral nodes:** Deleted when client disconnects. Used for service registration.\n**Persistent nodes:** Survive client disconnects. Used for configuration.\n**Watches:** Clients can watch znodes for changes. Enables event-driven coordination.` },
      { type: 'text', heading: 'Use Cases', body: `**Leader Election:** All nodes create ephemeral sequential znodes. Node with lowest sequence number is leader. Others watch the node just before them.\n\n**Service Discovery:** Services register themselves as ephemeral znodes. Clients watch the directory for changes.\n\n**Distributed Locks:** Create ephemeral znode to acquire lock. Delete to release.\n\n**Used by:** Kafka (for broker coordination), HBase, Hadoop` },
    ],
  },
});

// ── ADVANCED TOPICS ────────────────────────────────────────────────────────
Object.assign(TOPICS, {

  'advanced-time-series': {
    slug: 'advanced-time-series', title: 'Time Series Databases', subtitle: 'Storing and querying time-stamped data at scale', duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'What is Time Series Data?', body: `Time series data is a sequence of data points indexed by time.\n\n**Examples:**\n- Server metrics (CPU, memory, requests/sec)\n- IoT sensor readings\n- Financial tick data\n- Application logs\n- User activity events\n\n**Characteristics:**\n- Write-heavy (continuous stream of data)\n- Rarely updated (append-only)\n- Queried by time range\n- Old data can be downsampled or deleted` },
      { type: 'text', heading: 'Why Not Use a Regular DB?', body: `Regular databases struggle with time series because:\n- Massive write throughput (millions of points/sec)\n- Queries are always time-range based\n- Data compression is critical (timestamps are sequential)\n- Retention policies (auto-delete old data)\n- Downsampling (aggregate old data to save space)\n\nTime series DBs are optimized for all of these.` },
      { type: 'text', heading: 'Popular Time Series Databases', body: `**InfluxDB** — Most popular. SQL-like query language (Flux). Good for metrics and events.\n\n**TimescaleDB** — PostgreSQL extension. Full SQL support. Best if you already use Postgres.\n\n**Prometheus** — Pull-based metrics collection. Built-in alerting. Standard for Kubernetes monitoring.\n\n**Apache Druid** — Real-time analytics. Sub-second queries on billions of rows.\n\n**Cassandra** — Can work for time series with proper data modeling (partition by time bucket).` },
      { type: 'callout', variant: 'tip', heading: 'Data Retention Strategy', body: 'Keep raw data for 7 days, 1-minute aggregates for 30 days, 1-hour aggregates for 1 year, daily aggregates forever. This reduces storage by 99% while preserving long-term trends.' },
    ],
  },

  'advanced-data-structures': {
    slug: 'advanced-data-structures', title: 'Data Structures for Big Data', subtitle: 'Bloom filters, HyperLogLog, Count-Min Sketch', duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'Probabilistic Data Structures', body: `When exact answers are too expensive, use probabilistic data structures.\nThey trade a small error rate for massive memory savings.\n\n**Use cases:**\n- "Has this URL been crawled?" (Bloom filter)\n- "How many unique visitors today?" (HyperLogLog)\n- "What are the most frequent search terms?" (Count-Min Sketch)` },
      { type: 'text', heading: 'Bloom Filter', body: `A space-efficient probabilistic set.\n\n**Operations:** Add element, Check if element exists\n**False positives:** Possible (says "yes" when answer is "no")\n**False negatives:** Impossible (never says "no" when answer is "yes")\n\n**How it works:** Multiple hash functions map element to bit array positions. Set those bits to 1.\nTo check: if all positions are 1, element "probably" exists.\n\n**Use cases:** Web crawlers (skip already-crawled URLs), DB query optimization (skip disk reads for non-existent keys), spam filters` },
      { type: 'text', heading: 'HyperLogLog', body: `Estimates cardinality (count of unique elements) using very little memory.\n\n**Accuracy:** ~2% error rate\n**Memory:** ~12KB regardless of dataset size (vs GBs for exact counting)\n\n**How it works:** Hash each element. Track the maximum number of leading zeros seen. More leading zeros → more unique elements.\n\n**Use cases:** Unique visitor counts, unique search queries, A/B test unique users\n\nRedis has built-in HyperLogLog: PFADD, PFCOUNT` },
      { type: 'text', heading: 'Count-Min Sketch', body: `Estimates frequency of elements in a stream.\n\n**Use cases:** Top-K frequent items, heavy hitters detection\n\n**How it works:** Multiple hash functions map elements to counters in a 2D array. Increment all mapped counters on each occurrence. Estimate frequency = minimum of all mapped counters.\n\n**Error:** Overestimates (never underestimates)\n\n**Use cases:** Finding trending topics, detecting DDoS sources, frequency capping in ads` },
    ],
  },

  'advanced-vector-db': {
    slug: 'advanced-vector-db', title: 'Vector Databases', subtitle: 'Semantic search and AI-powered similarity matching', duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'What is a Vector Database?', body: `A vector database stores and queries high-dimensional vectors (embeddings).\n\n**What are embeddings?**\nML models convert text, images, audio into dense numerical vectors.\nSimilar items have similar vectors (close in vector space).\n\n**Example:**\n"cat" → [0.2, 0.8, 0.1, ...] (1536 dimensions)\n"kitten" → [0.21, 0.79, 0.11, ...] (very similar)\n"car" → [0.9, 0.1, 0.7, ...] (very different)` },
      { type: 'text', heading: 'Use Cases', body: `**Semantic Search:** Find documents by meaning, not keywords\n"Show me articles about machine learning" → finds articles about "AI", "neural networks", "deep learning"\n\n**Recommendation Systems:** Find similar products/content\n"Users who liked X also liked Y" based on embedding similarity\n\n**RAG (Retrieval Augmented Generation):** Give LLMs access to your data\nStore your docs as embeddings, retrieve relevant ones for each query\n\n**Image Search:** Find visually similar images\n**Anomaly Detection:** Find unusual patterns` },
      { type: 'text', heading: 'How Vector Search Works', body: `**Exact search:** Compare query vector to all stored vectors. O(N×D). Too slow for large datasets.\n\n**Approximate Nearest Neighbor (ANN):**\nTrade small accuracy loss for massive speed gain.\n\n**HNSW (Hierarchical Navigable Small World):**\nGraph-based index. Navigate from coarse to fine layers.\nO(log N) search. Used by most vector DBs.\n\n**Popular vector DBs:** Pinecone, Weaviate, Qdrant, Milvus, pgvector (PostgreSQL extension)` },
      { type: 'callout', variant: 'info', heading: 'Vector DBs in System Design Interviews', body: 'Mention vector databases when designing: search systems (semantic search), recommendation engines, or any AI-powered feature. Shows awareness of modern ML infrastructure.' },
    ],
  },
});

// ── HELPERS ────────────────────────────────────────────────────────────────
export const getTopicBySlug = (slug) => TOPICS[slug] || null;

export const getSectionForTopic = (slug) =>
  SECTIONS.find(s => s.topics.includes(slug)) || null;

/**
 * Check if a user can access a topic.
 * planId: null | 'starter' | 'pro' | 'elite' | 'agent_*'
 * role: 'mentee' | 'agent_user' | 'admin' | 'mentor'
 * Returns: 'full' | 'locked' | 'preview'
 */
export const getTopicAccess = (slug, user) => {
  const section = getSectionForTopic(slug);
  if (!section) return 'full';

  const planId = user?.plan_id || null;
  const role = user?.role || null;

  // Admins and mentors always get full access
  if (role === 'admin' || role === 'mentor') return 'full';

  // Elite plan or elite plan_id → full access to everything
  if (planId === 'elite') return 'full';

  // Free section — always accessible
  if (section.access === 'free') return 'full';

  // Check if this specific topic is in the free preview list
  const isFreePreview = section.freeTopics?.includes(slug);
  if (isFreePreview && !planId) return 'preview'; // show content but with upgrade CTA at bottom

  // Pro plan gets pro-level access
  if (planId === 'pro' || planId === 'starter') {
    if (section.access === 'pro') return 'full';
    if (section.access === 'elite') {
      // Pro gets proTopics for elite sections
      if (section.proTopics?.includes(slug)) return 'full';
      return 'locked';
    }
  }

  // No plan or agent plan — only free previews
  if (!planId || planId?.startsWith('agent_')) {
    if (isFreePreview) return 'preview';
    return 'locked';
  }

  return 'locked';
};

export const getNextTopic = (slug) => {
  const allSlugs = SECTIONS.flatMap(s => s.topics);
  const idx = allSlugs.indexOf(slug);
  return idx >= 0 && idx < allSlugs.length - 1 ? TOPICS[allSlugs[idx + 1]] : null;
};

export const getPrevTopic = (slug) => {
  const allSlugs = SECTIONS.flatMap(s => s.topics);
  const idx = allSlugs.indexOf(slug);
  return idx > 0 ? TOPICS[allSlugs[idx - 1]] : null;
};

export const getAllTopics = () => SECTIONS.flatMap(s => s.topics.map(slug => TOPICS[slug]).filter(Boolean));
