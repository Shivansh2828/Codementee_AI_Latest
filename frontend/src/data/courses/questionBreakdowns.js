export const QUESTION_BREAKDOWN_TOPICS = {

// ── BIT.LY ─────────────────────────────────────────────────────────────────
'design-bitly': {
  slug: 'design-bitly', title: 'Design Bit.ly', subtitle: 'URL shortening service at scale',
  duration: '40 min', difficulty: 'Easy',
  sections: [
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `Bit.ly is a URL shortening service that converts long URLs into shorter, manageable links. It also provides analytics for the shortened URLs. This is one of the most common beginner system design interview questions because the core functionality is simple to understand, but the depth comes from handling scale, uniqueness, and performance.\n\nBefore jumping into the design, take a moment to think about what makes this problem interesting. On the surface, it is just a key-value mapping — short code maps to long URL. But at scale, you need to think about how to generate unique short codes without collisions, how to make redirects blazing fast (users expect instant), and how to handle analytics without slowing down the critical redirect path.`,
    },
    {
      type: 'requirements', heading: 'Requirements',
      functional: [
        'Given a long URL, generate a unique short URL (e.g., bit.ly/abc1234)',
        'Redirect a short URL to its original long URL',
        'Optionally support custom aliases (e.g., bit.ly/my-link)',
        'Optionally support link expiration',
      ],
      functionalOutOfScope: ['User accounts and link management dashboards', 'Click analytics (count, location, device) — can discuss if time permits', 'Spam/malicious URL detection'],
      nonFunctional: [
        'The system should ensure uniqueness for short codes (each short code maps to exactly one long URL)',
        'Redirect latency < 100ms (users expect instant)',
        'The system should be highly available (availability > consistency)',
        'Scale to support 1B shortened URLs and 100M DAU',
        'Read-heavy: ~1000:1 read-to-write ratio (many clicks per URL created)',
      ],
      nonFunctionalOutOfScope: ['Real-time analytics dashboard', 'A/B testing on links'],
    },
    {
      type: 'text', heading: 'Scale Estimation',
      body: `Let us work through the numbers. This is important because it tells us whether a single database can handle the load or if we need to think about caching and sharding.\n\nAssume 100M new URLs created per day. That gives us:\n\n**Write QPS:** 100M ÷ 86,400 ≈ 1,160 writes/sec. This is very manageable for a single database.\n\n**Read QPS:** With a 1000:1 read-to-write ratio, we get about 1.16M reads/sec at peak. This is significant — a single database cannot handle this. We will need caching.\n\n**Storage:** Each URL record is roughly 500 bytes (short key + long URL + metadata). Over 5 years: 100M/day × 365 × 5 = 182.5B records × 500 bytes ≈ 91 TB. This is large but manageable with modern storage. A single PostgreSQL instance can handle this with proper indexing, though we may eventually need to shard.\n\n**Bandwidth:** 1,160 writes/sec × 500B = 580 KB/s for writes. 1.16M reads/sec × 500B = 580 MB/s for reads. The read bandwidth is significant but CDN and caching will handle most of it.\n\nThe key takeaway: this is a massively read-heavy system. The redirect path is the hot path and must be optimized with caching.`,
    },
    {
      type: 'text', heading: 'Core Entities',
      body: `Before designing APIs, identify the core entities in the system. Keep it simple — you can always add more later.\n\n**ShortURL** — The mapping record. Contains the short code, the original long URL, creation time, and optional expiration.\n\n**User** — Optional. If you support authenticated link management, users can view and manage their links.\n\n**ClickEvent** — Analytics data per redirect. Contains timestamp, country (from IP geolocation), device type, and referrer. This is out of scope for the core design but worth mentioning.`,
    },
    {
      type: 'api', heading: 'API Design',
      description: 'Go through each functional requirement and define the API endpoint that satisfies it. For a URL shortener, this maps almost 1:1.',
      endpoints: [
        { method: 'POST', path: '/urls', label: 'Create short URL', request: '{\n  long_url: string,\n  custom_alias?: string,\n  expires_at?: timestamp\n}', response: '{\n  short_url: "https://bit.ly/abc1234",\n  short_key: "abc1234"\n}', note: 'We use POST because we are creating a new resource. Returns 201 Created.' },
        { method: 'GET', path: '/{shortKey}', label: 'Redirect (302)', response: 'HTTP 302 Found\nLocation: <long_url>', note: 'This is the hot path. Must be < 100ms. Use 302 (not 301) so browsers always call our server — this lets us track analytics and handle expiration.' },
        { method: 'DELETE', path: '/urls/{shortKey}', label: 'Delete a link', note: 'Returns 204 No Content. Must also invalidate the cache entry.' },
      ],
    },
    {
      type: 'callout', variant: 'tip', heading: '301 vs 302 — This Comes Up in Every Interview',
      body: `301 (Permanent Redirect) tells the browser "this URL has permanently moved." The browser caches the redirect and never calls your server again for that short URL. You lose all analytics and cannot update or expire the link.\n\n302 (Found/Temporary Redirect) tells the browser "this URL is temporarily at a different location." The browser always calls your server first, giving you control over every redirect. You can track clicks, update the destination, and handle expiration.\n\nFor a URL shortener, always use 302. The interviewer will likely ask about this — it shows you understand HTTP semantics.`,
    },
    {
      type: 'schema', heading: 'Data Schema',
      description: 'Keep the schema simple. One primary table for URL mappings, optionally a second for analytics.',
      entities: [
        {
          name: 'urls',
          note: 'Primary table — read-heavy, cache aggressively',
          fields: [
            { name: 'short_key', type: 'VARCHAR(7)', notes: 'Primary key — e.g. "abc1234". Indexed.' },
            { name: 'long_url', type: 'TEXT', notes: 'The original URL (up to 2048 chars)' },
            { name: 'user_id', type: 'UUID', notes: 'Nullable — anonymous links allowed' },
            { name: 'created_at', type: 'TIMESTAMP', notes: 'For cleanup and analytics' },
            { name: 'expires_at', type: 'TIMESTAMP', notes: 'Nullable — for link expiration' },
          ],
        },
      ],
    },
    {
      type: 'text', heading: 'High-Level Design',
      body: `Now let us put the pieces together. We need two paths: one for creating short URLs (write path) and one for redirecting (read path). The diagram below shows the complete architecture.`,
    },
    {
      type: 'architecture', heading: 'System Architecture — High-Level Design',
      caption: 'Write path (create) flows top-down. Read path (redirect) flows left-to-right through cache.',
      config: {
        width: 820, height: 480,
        nodes: [
          { id: 'client', label: 'Client', sublabel: 'Browser / Mobile', icon: '🌐', color: 'blue', x: 20, y: 20, w: 110, h: 60 },
          { id: 'lb', label: 'Load Balancer', sublabel: 'Nginx / ALB', icon: '⚖️', color: 'cyan', x: 200, y: 20, w: 130, h: 60 },
          { id: 'write-svc', label: 'Write Service', sublabel: 'Create URLs', icon: '✏️', color: 'green', x: 420, y: 20, w: 130, h: 60 },
          { id: 'read-svc', label: 'Read Service', sublabel: 'Redirect (hot path)', icon: '🔀', color: 'orange', x: 420, y: 120, w: 130, h: 60 },
          { id: 'key-svc', label: 'Key Service', sublabel: 'Pre-generated keys', icon: '🔑', color: 'purple', x: 640, y: 20, w: 130, h: 60 },
          { id: 'cache', label: 'Redis Cache', sublabel: '~1ms lookups', icon: '⚡', color: 'red', x: 640, y: 120, w: 130, h: 60 },
          { id: 'db', label: 'PostgreSQL', sublabel: 'URL mappings', icon: '🗄️', color: 'blue', x: 640, y: 220, w: 130, h: 60 },
          { id: 'kafka', label: 'Kafka', sublabel: 'Click events', icon: '📨', color: 'yellow', x: 420, y: 220, w: 130, h: 60 },
          { id: 'analytics', label: 'Analytics DB', sublabel: 'ClickHouse / Cassandra', icon: '📊', color: 'purple', x: 420, y: 340, w: 130, h: 60 },
          { id: 'cdn', label: 'CDN', sublabel: 'Edge caching (optional)', icon: '🌍', color: 'cyan', x: 200, y: 120, w: 130, h: 60 },
        ],
        edges: [
          { from: 'client', to: 'lb', label: 'HTTPS' },
          { from: 'lb', to: 'write-svc', label: 'POST /urls' },
          { from: 'lb', to: 'cdn', label: 'GET /{key}' },
          { from: 'cdn', to: 'read-svc', label: 'cache miss', dashed: true },
          { from: 'write-svc', to: 'key-svc', label: 'get key', color: 'accent' },
          { from: 'write-svc', to: 'db', label: 'INSERT' },
          { from: 'read-svc', to: 'cache', label: '1. check cache', color: 'accent' },
          { from: 'cache', to: 'db', label: '2. miss → query DB', dashed: true },
          { from: 'read-svc', to: 'kafka', label: '3. async click event' },
          { from: 'kafka', to: 'analytics', label: 'batch write' },
        ],
      },
    },
    {
      type: 'text', heading: 'Write Path — Creating a Short URL',
      body: `When a user wants to shorten a URL, the flow is straightforward:\n\n1. The client sends a POST /urls request to the Load Balancer, which routes it to the Write Service.\n2. The Write Service requests a pre-generated unique key from the Key Service. The Key Service maintains a pool of millions of random base62 keys that have been pre-validated as unique.\n3. If the user specified a custom alias, the Write Service checks the database to ensure it is not already taken. If it is, return 409 Conflict.\n4. The Write Service inserts the mapping (short_key → long_url) into PostgreSQL.\n5. The short URL is returned to the client.\n\nThis path handles ~1,160 writes/sec — well within a single PostgreSQL instance's capacity. The Key Service eliminates collision checking from the hot path.`,
    },
    {
      type: 'text', heading: 'Read Path — Redirecting a Short URL',
      body: `This is the hot path — it handles 1000x more traffic than writes and must be fast. When a user clicks a short URL:\n\n1. The request hits the CDN edge first. If the CDN has cached the 302 redirect for this short code, it responds immediately (~5ms). This is optional but powerful for popular links.\n2. On CDN miss, the request goes to the Load Balancer → Read Service.\n3. The Read Service checks Redis cache first. Cache hit → return 302 redirect immediately (~1ms).\n4. On cache miss, query PostgreSQL (~5-10ms). Store the result in Redis with a 24-hour TTL.\n5. If the short code does not exist, return 404. If expired, return 410 Gone.\n6. Asynchronously, the Read Service publishes a click event to Kafka. A consumer batch-writes these events to the Analytics DB (ClickHouse or Cassandra).\n\nThe key insight: analytics are decoupled from the redirect path. The user never waits for analytics to be recorded. This keeps the redirect latency under 100ms even at massive scale.`,
    },
    {
      type: 'deepdive', heading: 'Deep Dive: How Do We Generate Unique Short Codes?',
      subtitle: 'This is the core algorithmic challenge and the most common follow-up question from interviewers.',
      content: [
        {
          type: 'text', heading: 'The Constraints',
          body: `We need short codes that are:\n- **Unique** — no two URLs should get the same code\n- **Short** — the whole point is to shorten URLs (7 characters is standard)\n- **Efficiently generated** — we are creating 1,160 URLs/sec\n\nWith base62 encoding (a-z, A-Z, 0-9), a 7-character code gives us 62^7 = 3.5 trillion possible codes. At 100M/day, that is 95,000 years of codes. We will never run out.`,
        },
        {
          type: 'text', heading: 'Option 1: Hash the URL',
          body: `Take the MD5 or SHA-256 hash of the long URL, then take the first 7 characters and base62 encode them.\n\nThis is deterministic — the same long URL always produces the same short code, which gives you natural deduplication. But it has a critical flaw: different long URLs can produce the same 7-character prefix (collision). You must check the database for collisions and retry with a different hash (e.g., append a counter and re-hash).\n\nThe collision probability is low with 3.5 trillion possible codes, but at scale (billions of URLs), it becomes non-trivial. Each collision requires an extra database read, which adds latency.`,
        },
        {
          type: 'text', heading: 'Option 2: Auto-Increment Counter + Base62',
          body: `Use a global counter (starting at 1) and convert each number to base62. Counter 1 becomes "1", counter 62 becomes "10", counter 100000 becomes "q0U".\n\nThis guarantees uniqueness — every counter value is different. It is simple and fast. But it has two problems:\n\n1. **Predictability** — Short codes are sequential. Users can guess other URLs by incrementing the code. This may be a security concern.\n2. **Single point of failure** — The counter must be globally unique. If you have multiple servers, they all need to agree on the next counter value. A centralized Redis counter with atomic INCR works, but it becomes a bottleneck and SPOF.\n\nTo solve the bottleneck, use **counter batching**: each server pre-fetches a batch of 1000 counter values from Redis. It uses them locally until exhausted, then fetches another batch. This reduces Redis calls from 1 per request to 1 per 1000 requests.`,
        },
        {
          type: 'text', heading: 'Option 3: Pre-Generated Key Service (Recommended)',
          body: `Generate millions of random 7-character base62 keys in advance and store them in a dedicated key database with two tables: unused_keys and used_keys.\n\nWhen the app server needs a new short code, it requests one from the Key Service. The Key Service atomically moves a key from unused to used and returns it. The app server uses this key without any collision checking.\n\nThis approach has the best properties:\n- **No collisions** — keys are pre-validated as unique\n- **No coordination** — no global counter needed\n- **Random** — codes are not predictable\n- **Fast** — just a database read, no hashing or collision retry\n\nFor availability, run multiple Key Service instances. Each pre-fetches a batch of keys (e.g., 10,000) into memory. If an instance crashes, those in-memory keys are lost — but with 3.5 trillion total keys, losing 10,000 is negligible.`,
        },
        {
          type: 'architecture', heading: 'Key Service Architecture',
          caption: 'Multiple Key Service instances pre-fetch batches of keys for high availability',
          config: {
            width: 700, height: 260,
            nodes: [
              { id: 'ws1', label: 'Write Server 1', color: 'green', x: 20, y: 20, w: 120, h: 50 },
              { id: 'ws2', label: 'Write Server 2', color: 'green', x: 20, y: 90, w: 120, h: 50 },
              { id: 'ws3', label: 'Write Server N', color: 'green', x: 20, y: 160, w: 120, h: 50 },
              { id: 'ks1', label: 'Key Service 1', sublabel: 'batch: 10K keys', color: 'purple', x: 250, y: 20, w: 140, h: 50 },
              { id: 'ks2', label: 'Key Service 2', sublabel: 'batch: 10K keys', color: 'purple', x: 250, y: 90, w: 140, h: 50 },
              { id: 'keydb', label: 'Key Database', sublabel: 'unused_keys / used_keys', icon: '🗄️', color: 'blue', x: 500, y: 50, w: 160, h: 70 },
              { id: 'gen', label: 'Key Generator', sublabel: 'offline batch job', color: 'orange', x: 500, y: 170, w: 160, h: 50 },
            ],
            edges: [
              { from: 'ws1', to: 'ks1', label: 'get key' },
              { from: 'ws2', to: 'ks2', label: 'get key' },
              { from: 'ws3', to: 'ks1', label: 'get key', dashed: true },
              { from: 'ks1', to: 'keydb', label: 'fetch batch', color: 'accent' },
              { from: 'ks2', to: 'keydb', label: 'fetch batch', color: 'accent' },
              { from: 'gen', to: 'keydb', label: 'pre-generate millions', dashed: true },
            ],
          },
        },
      ],
    },
    {
      type: 'deepdive', heading: 'Deep Dive: How Do We Make Redirects Fast?',
      subtitle: 'The redirect path handles 1000x more traffic than the write path. It must be optimized.',
      content: [
        {
          type: 'architecture', heading: 'Read Path — Cache-First Architecture',
          caption: 'Every redirect checks Redis first. Only cache misses hit the database.',
          config: {
            width: 700, height: 220,
            nodes: [
              { id: 'user', label: 'User Click', icon: '👆', color: 'blue', x: 20, y: 70, w: 110, h: 56 },
              { id: 'svc', label: 'Read Service', color: 'orange', x: 190, y: 70, w: 120, h: 56 },
              { id: 'redis', label: 'Redis', sublabel: '~1ms', icon: '⚡', color: 'red', x: 380, y: 20, w: 120, h: 56 },
              { id: 'pg', label: 'PostgreSQL', sublabel: '~5-10ms', icon: '🗄️', color: 'blue', x: 380, y: 130, w: 120, h: 56 },
              { id: 'resp', label: '302 Redirect', icon: '↩️', color: 'green', x: 560, y: 70, w: 120, h: 56 },
            ],
            edges: [
              { from: 'user', to: 'svc', label: 'GET /{key}' },
              { from: 'svc', to: 'redis', label: '1. check cache', color: 'accent' },
              { from: 'redis', to: 'resp', label: 'hit → redirect' },
              { from: 'svc', to: 'pg', label: '2. miss → query', dashed: true },
              { from: 'pg', to: 'resp', label: 'found → cache + redirect', dashed: true },
            ],
          },
        },
        {
          type: 'text', heading: 'Caching Strategy',
          body: `The most impactful optimization is caching the short_key → long_url mapping in Redis. Redis serves reads in ~1ms compared to ~5-10ms for a database query.\n\nWith a 1000:1 read-to-write ratio and a good cache hit rate (90%+), we reduce database load by 90%. The remaining 10% of requests (cache misses) hit the database, and the result is cached for subsequent requests.\n\n**Cache sizing:** If we cache the most recent 30 days of URLs (the "hot" set), that is 100M/day × 30 = 3B entries × 500 bytes = 1.5 TB. Too much for a single Redis node. Options:\n- Cache only the top 1% most accessed URLs (30M entries = 15GB) — fits in a single Redis node\n- Use Redis Cluster to distribute across multiple nodes\n- Use LRU eviction — Redis automatically evicts the least recently used keys when memory is full\n\n**TTL:** Set a 24-hour TTL on cached entries. This ensures that deleted or expired URLs are eventually evicted from the cache. For explicit deletes, also delete the cache entry immediately.\n\n**Eviction policy:** LRU (Least Recently Used). The most popular URLs stay in cache naturally because they are accessed frequently. Cold URLs get evicted to make room.`,
        },
      ],
    },
    {
      type: 'deepdive', heading: 'Deep Dive: How Do We Scale?',
      subtitle: 'Scaling reads, scaling writes, and handling the growth from 0 to 1B URLs.',
      content: [
        {
          type: 'architecture', heading: 'Scaled Architecture',
          caption: 'Separate read/write services, Redis cluster, read replicas, and async analytics pipeline',
          config: {
            width: 820, height: 420,
            nodes: [
              { id: 'clients', label: 'Clients', icon: '🌐', color: 'blue', x: 20, y: 160, w: 100, h: 56 },
              { id: 'cdn', label: 'CDN Edge', sublabel: 'Popular URLs', icon: '🌍', color: 'cyan', x: 170, y: 60, w: 120, h: 56 },
              { id: 'lb', label: 'Load Balancer', color: 'cyan', x: 170, y: 160, w: 120, h: 56 },
              { id: 'read1', label: 'Read Svc ×N', sublabel: 'Stateless', color: 'orange', x: 360, y: 60, w: 120, h: 56 },
              { id: 'write1', label: 'Write Svc ×M', sublabel: 'Stateless', color: 'green', x: 360, y: 160, w: 120, h: 56 },
              { id: 'redis', label: 'Redis Cluster', sublabel: '3 nodes', icon: '⚡', color: 'red', x: 550, y: 60, w: 130, h: 56 },
              { id: 'primary', label: 'DB Primary', sublabel: 'Writes only', color: 'blue', x: 550, y: 160, w: 130, h: 56 },
              { id: 'replica', label: 'DB Replicas', sublabel: 'Reads (cache miss)', color: 'blue', x: 550, y: 260, w: 130, h: 56 },
              { id: 'kafka', label: 'Kafka', icon: '📨', color: 'yellow', x: 360, y: 300, w: 120, h: 56 },
              { id: 'analytics', label: 'ClickHouse', sublabel: 'Analytics', color: 'purple', x: 170, y: 300, w: 120, h: 56 },
            ],
            edges: [
              { from: 'clients', to: 'cdn', label: 'GET (popular)' },
              { from: 'clients', to: 'lb', label: 'all requests' },
              { from: 'lb', to: 'read1', label: 'GET /{key}' },
              { from: 'lb', to: 'write1', label: 'POST /urls' },
              { from: 'read1', to: 'redis', label: 'cache lookup', color: 'accent' },
              { from: 'read1', to: 'replica', label: 'cache miss', dashed: true },
              { from: 'write1', to: 'primary', label: 'INSERT' },
              { from: 'primary', to: 'replica', label: 'replication', dashed: true },
              { from: 'read1', to: 'kafka', label: 'click event' },
              { from: 'kafka', to: 'analytics', label: 'batch consume' },
            ],
          },
        },
        {
          type: 'text', heading: 'Scaling the Read Path',
          body: `The read path (redirects) is the bottleneck. Here is the scaling progression:\n\n1. **Add Redis cache** — Handles 90%+ of reads. A single Redis node can do 100K ops/sec. For higher throughput, use Redis Cluster with 3+ nodes.\n2. **Add read replicas** — For the remaining cache misses, add PostgreSQL read replicas. Route all SELECT queries to replicas, keeping the primary for writes only.\n3. **Separate read and write services** — Create a dedicated Read Service (stateless, horizontally scalable) and a separate Write Service. Scale them independently based on traffic patterns.\n4. **CDN caching** — For the most popular URLs, the CDN can cache the 302 redirect response at the edge. This reduces latency for global users from 150ms (cross-continent) to <10ms (nearest edge). Set a short Cache-Control TTL (e.g., 5 minutes) so expired/deleted URLs are not served for too long.`,
        },
        {
          type: 'text', heading: 'Scaling the Write Path',
          body: `Write QPS is only 1,160/sec — a single PostgreSQL instance handles this easily. But if you need to scale writes:\n\n1. **Shard the database** — Shard by short_key hash using consistent hashing. Each shard handles a portion of writes. Since every query is a point lookup by short_key, every query hits exactly one shard.\n2. **Use the Key Service with batching** — Each Write Service instance pre-fetches 10K keys, eliminating the Key Service as a bottleneck.\n3. **Async analytics** — Click events go to Kafka, not directly to the database. A consumer batch-writes to ClickHouse (optimized for analytical queries on time-series data). This completely decouples analytics from the redirect hot path.`,
        },
      ],
    },
    {
      type: 'levels', heading: 'What Interviewers Expect at Each Level',
      levels: [
        { title: 'Mid-level', body: `Define the API (POST to create, GET to redirect). Understand why 302 is preferred over 301. Design a basic schema with short_key as primary key. Explain why caching is needed for the read-heavy workload. Should be able to reason through collision handling when asked about key generation, even if they do not know the Key Service pattern upfront.` },
        { title: 'Senior', body: `Proactively discuss multiple key generation options (hash, counter, Key Service) and their trade-offs. Design the caching layer with appropriate TTL and eviction policy. Separate the analytics write path from the redirect hot path using async processing (Kafka). Discuss the Key Service pattern including batch pre-fetching and availability. Should mention database indexing and when sharding becomes necessary.` },
        { title: 'Staff+', body: `Go deep on the Key Service design — batch pre-fetching, multi-instance availability, what happens on crash. Discuss consistent hashing for cache distribution and database sharding. Proactively design the Kafka pipeline for analytics. May discuss geo-distribution with CDN caching of 302 responses for global low-latency redirects. Should discuss monitoring, alerting, and graceful degradation (what happens when Redis goes down — fall back to DB with circuit breakers).` },
      ],
    },
  ],
},

// ── TICKETMASTER ───────────────────────────────────────────────────────────
'design-ticketmaster': {
  slug: 'design-ticketmaster', title: 'Design Ticketmaster', subtitle: 'Event ticketing with high-concurrency seat selection',
  duration: '45 min', difficulty: 'Hard',
  sections: [
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `Ticketmaster is an event ticketing platform where users browse events, select seats from a venue map, and purchase tickets. What makes this problem fascinating for system design interviews is the extreme concurrency challenge: when a popular artist announces a tour, millions of users simultaneously compete for a limited number of seats.\n\nThe core tension is between availability and consistency. For browsing events, you want high availability — show the page even if seat counts are slightly stale. But for the actual booking, you need strong consistency — two users absolutely cannot purchase the same seat. This CP vs AP split within a single system is what interviewers are looking for you to identify and design around.`,
    },
    {
      type: 'requirements', heading: 'Requirements',
      functional: [
        'Browse and search events by location, date, and category',
        'View a seat map for an event and see available seats',
        'Reserve a seat temporarily while completing checkout',
        'Purchase tickets — seat is confirmed on payment',
        'View booking history',
      ],
      functionalOutOfScope: ['Resale/secondary market', 'Waitlists', 'Season tickets'],
      nonFunctional: [
        'High availability — system must stay up during popular on-sales',
        'No double-booking — two users cannot book the same seat',
        'Seat reservation must be consistent (CP over AP for booking)',
        'Read-heavy: browsing >> booking (100:1 ratio)',
        'Traffic spikes: 10x normal traffic when popular events go on sale',
      ],
      nonFunctionalOutOfScope: ['Fraud detection', 'Dynamic pricing'],
    },
    {
      type: 'text', heading: 'Scale Estimation',
      body: `**Normal traffic:**\n- 50M DAU browsing events\n- 500K tickets sold/day\n- Read QPS: 50M × 10 page views ÷ 86,400 ≈ 5,800/sec\n- Write QPS: 500K ÷ 86,400 ≈ 6/sec (very low normally)\n\n**Spike traffic (Taylor Swift on-sale):**\n- 10M users simultaneously trying to buy tickets\n- Write QPS spikes to 10,000+/sec for a few minutes\n- This is the hard problem\n\n**Storage:**\n- 100K events/year × 50K seats = 5B seat records\n- Each seat record ≈ 200 bytes → 1TB`,
    },
    {
      type: 'text', heading: 'Core Entities',
      body: `**Event** — Concert, sports game, etc. with venue, date, artist\n**Venue** — Physical location with seat map\n**Seat** — Individual seat with section, row, number, status\n**Booking** — A confirmed purchase linking user to seats\n**Reservation** — Temporary hold on a seat during checkout`,
    },
    {
      type: 'api', heading: 'API Design',
      endpoints: [
        { method: 'GET', path: '/events?location=&date=&category=', label: 'Search events', response: 'Event[]' },
        { method: 'GET', path: '/events/{eventId}/seats', label: 'Get seat map', response: 'Seat[] with status (available/held/sold)' },
        { method: 'POST', path: '/events/{eventId}/reservations', label: 'Reserve seats (temporary hold)', request: '{ seat_ids: string[] }', response: '{ reservation_id, expires_at (10 min) }' },
        { method: 'POST', path: '/reservations/{reservationId}/confirm', label: 'Confirm purchase', request: '{ payment_token }', response: '{ booking_id, confirmation_number }' },
        { method: 'DELETE', path: '/reservations/{reservationId}', label: 'Release reservation' },
        { method: 'GET', path: '/users/{userId}/bookings', label: 'Booking history' },
      ],
    },
    {
      type: 'schema', heading: 'Data Schema',
      entities: [
        {
          name: 'seats',
          note: 'Core table — must handle concurrent updates safely',
          fields: [
            { name: 'id', type: 'UUID', notes: 'Primary key' },
            { name: 'event_id', type: 'UUID', notes: 'Foreign key' },
            { name: 'section', type: 'VARCHAR', notes: 'e.g. "A", "Floor"' },
            { name: 'row', type: 'VARCHAR', notes: '' },
            { name: 'number', type: 'INT', notes: '' },
            { name: 'status', type: 'ENUM', notes: 'available | held | sold' },
            { name: 'held_by', type: 'UUID', notes: 'User ID if held' },
            { name: 'held_until', type: 'TIMESTAMP', notes: 'Expiry of hold' },
            { name: 'price', type: 'DECIMAL', notes: '' },
          ],
        },
        {
          name: 'bookings',
          note: 'Confirmed purchases',
          fields: [
            { name: 'id', type: 'UUID', notes: 'Primary key' },
            { name: 'user_id', type: 'UUID', notes: '' },
            { name: 'event_id', type: 'UUID', notes: '' },
            { name: 'seat_ids', type: 'UUID[]', notes: 'Array of booked seats' },
            { name: 'total_price', type: 'DECIMAL', notes: '' },
            { name: 'status', type: 'ENUM', notes: 'confirmed | cancelled | refunded' },
            { name: 'created_at', type: 'TIMESTAMP', notes: '' },
          ],
        },
      ],
    },
    {
      type: 'text', heading: 'High-Level Design',
      body: `The architecture splits into two distinct paths with very different requirements:\n\n**Browse path (read-heavy, AP):** Users searching events and viewing seat maps. This is 99% of traffic. Availability matters more than perfect consistency — showing a seat as "available" when it was just booked 2 seconds ago is acceptable. Cache aggressively with CDN and Redis.\n\n**Booking path (write-heavy during spikes, CP):** Users reserving and purchasing seats. This is 1% of traffic but the hardest part. Consistency is critical — double-booking is unacceptable. Use Redis SETNX for temporary holds and PostgreSQL transactions for confirmed purchases.`,
    },
    {
      type: 'architecture', heading: 'System Architecture',
      caption: 'Browse path (cached, AP) vs Booking path (consistent, CP) with virtual waiting room for spikes',
      config: {
        width: 850, height: 480,
        nodes: [
          { id: 'users', label: 'Users', icon: '👥', color: 'blue', x: 20, y: 180, w: 100, h: 56 },
          { id: 'cdn', label: 'CDN', sublabel: 'Event pages', icon: '🌍', color: 'cyan', x: 170, y: 40, w: 120, h: 56 },
          { id: 'lb', label: 'Load Balancer', color: 'cyan', x: 170, y: 180, w: 120, h: 56 },
          { id: 'queue', label: 'Waiting Room', sublabel: 'Redis sorted set', icon: '🚦', color: 'yellow', x: 170, y: 320, w: 120, h: 56 },
          { id: 'browse', label: 'Browse Service', sublabel: 'Search + seat maps', color: 'green', x: 370, y: 40, w: 130, h: 56 },
          { id: 'booking', label: 'Booking Service', sublabel: 'Reserve + confirm', color: 'orange', x: 370, y: 180, w: 130, h: 56 },
          { id: 'payment', label: 'Payment Svc', sublabel: 'Stripe / Razorpay', color: 'purple', x: 370, y: 320, w: 130, h: 56 },
          { id: 'redis', label: 'Redis', sublabel: 'Seat holds (SETNX)', icon: '⚡', color: 'red', x: 580, y: 110, w: 120, h: 56 },
          { id: 'db', label: 'PostgreSQL', sublabel: 'Seats + bookings', icon: '🗄️', color: 'blue', x: 580, y: 250, w: 120, h: 56 },
          { id: 'search', label: 'Elasticsearch', sublabel: 'Event search', color: 'cyan', x: 730, y: 40, w: 110, h: 56 },
          { id: 'notif', label: 'Notifications', icon: '📧', color: 'purple', x: 580, y: 390, w: 120, h: 56 },
        ],
        edges: [
          { from: 'users', to: 'cdn', label: 'static content' },
          { from: 'users', to: 'lb', label: 'API requests' },
          { from: 'users', to: 'queue', label: 'on-sale spike', dashed: true },
          { from: 'queue', to: 'booking', label: 'metered access', color: 'accent' },
          { from: 'lb', to: 'browse', label: 'GET /events' },
          { from: 'lb', to: 'booking', label: 'POST /reservations' },
          { from: 'browse', to: 'search', label: 'search query' },
          { from: 'browse', to: 'redis', label: 'cached seats' },
          { from: 'booking', to: 'redis', label: 'SETNX hold', color: 'accent' },
          { from: 'booking', to: 'db', label: 'confirm booking' },
          { from: 'booking', to: 'payment', label: 'charge' },
          { from: 'payment', to: 'notif', label: 'on success' },
        ],
      },
    },
    {
      type: 'deepdive', heading: 'Deep Dive: Preventing Double-Booking',
      subtitle: 'The core challenge — two users cannot book the same seat',
      content: [
        {
          type: 'text', heading: 'Approach 1: Optimistic Locking',
          body: `Read the seat with a version number. When updating, check that the version hasn't changed.\n\n\`\`\`sql\nUPDATE seats\nSET status = 'held', held_by = $userId, held_until = NOW() + INTERVAL '10 min', version = version + 1\nWHERE id = $seatId AND status = 'available' AND version = $expectedVersion\n\`\`\`\n\nIf 0 rows updated → someone else got it first → return error to user.\n\n**Pros:** No locks held, high throughput for low-contention scenarios\n**Cons:** High retry rate during spikes (many users competing for same seat)`,
        },
        {
          type: 'text', heading: 'Approach 2: Pessimistic Locking (SELECT FOR UPDATE)',
          body: `Lock the seat row for the duration of the transaction.\n\n\`\`\`sql\nBEGIN;\nSELECT * FROM seats WHERE id = $seatId FOR UPDATE;\n-- Check status, update if available\nUPDATE seats SET status = 'held' ...;\nCOMMIT;\n\`\`\`\n\n**Pros:** Simple, guaranteed no double-booking\n**Cons:** Locks held during transaction → low throughput under high concurrency. Can cause deadlocks if users select multiple seats.`,
        },
        {
          type: 'text', heading: 'Approach 3: Redis-based Temporary Hold (Best)',
          body: `Use Redis SETNX (set if not exists) with TTL for the hold phase. Only write to DB on confirmed purchase.\n\n**Flow:**\n1. User selects seat → SETNX seat:{seatId} userId EX 600 (10 min TTL)\n2. If SETNX returns 1 → seat is yours, show checkout\n3. If SETNX returns 0 → seat already held, show error\n4. On payment success → write to DB (seats table + bookings table) in a transaction\n5. On timeout or cancellation → Redis TTL expires automatically, seat becomes available\n\n**Pros:** Sub-millisecond hold operation, no DB locks, automatic expiry\n**Cons:** Redis is not the source of truth — must reconcile with DB on payment. Need to handle Redis failure gracefully (fall back to DB locking).`,
        },
        {
          type: 'callout', variant: 'tip', heading: 'The Recommended Approach',
          body: 'Use Redis for the temporary hold (fast, no DB load) and PostgreSQL with optimistic locking for the final purchase confirmation. This gives you speed for the common case and correctness for the critical case.',
        },
      ],
    },
    {
      type: 'deepdive', heading: 'Deep Dive: Handling Traffic Spikes',
      subtitle: 'When Taylor Swift tickets go on sale, 10M users hit the system simultaneously',
      content: [
        {
          type: 'text', heading: 'The Problem',
          body: `A popular event on-sale creates a massive, sudden traffic spike. 10M users simultaneously:\n- Loading the event page\n- Hitting "Buy" at exactly the same time\n- All competing for the same 50,000 seats\n\nYour normal infrastructure handles 5,800 reads/sec. Suddenly you need 100,000+/sec.`,
        },
        {
          type: 'text', heading: 'Solution: Virtual Waiting Room',
          body: `Instead of letting all users hit the booking system simultaneously, put them in a queue.\n\n**Flow:**\n1. User clicks "Buy" → gets a queue position token (UUID + position number)\n2. Frontend polls "what's my position?" every few seconds\n3. When it's their turn, they get a time-limited access token (valid 10 min)\n4. They use the access token to enter the booking flow\n5. If they don't complete in 10 min, token expires and next user gets in\n\n**Implementation:**\n- Queue stored in Redis sorted set (score = join timestamp)\n- Worker processes N users per second into the booking flow\n- N = what your booking infrastructure can handle (e.g., 1,000/sec)\n\n**User experience:** "You are #45,231 in line. Estimated wait: 45 minutes." Much better than a crash or error page.`,
        },
        {
          type: 'architecture', heading: 'Virtual Waiting Room Flow',
          caption: 'Users enter a queue and are metered into the booking system at a controlled rate',
          config: {
            width: 750, height: 200,
            nodes: [
              { id: 'users', label: '10M Users', icon: '👥', color: 'blue', x: 20, y: 60, w: 110, h: 56 },
              { id: 'queue', label: 'Waiting Room', sublabel: 'Redis sorted set', icon: '🚦', color: 'yellow', x: 200, y: 60, w: 140, h: 56 },
              { id: 'gate', label: 'Rate Gate', sublabel: '1,000 users/sec', color: 'orange', x: 410, y: 60, w: 130, h: 56 },
              { id: 'booking', label: 'Booking Flow', sublabel: '10-min token', color: 'green', x: 610, y: 60, w: 120, h: 56 },
            ],
            edges: [
              { from: 'users', to: 'queue', label: 'join queue' },
              { from: 'queue', to: 'gate', label: 'FIFO order', color: 'accent' },
              { from: 'gate', to: 'booking', label: 'access token' },
            ],
          },
        },
        {
          type: 'callout', variant: 'warning', heading: 'Don\'t Let All Users Hit the DB',
          body: 'The most common mistake: no rate limiting or queuing, all 10M users hit the booking DB simultaneously. The DB crashes, the site goes down, users are furious. Always meter traffic into your booking system.',
        },
      ],
    },
    {
      type: 'levels', heading: 'What\'s Expected at Each Level',
      levels: [
        { title: 'Mid-level', body: `Should define the API, basic schema, and high-level design. Should understand that double-booking is the core challenge and propose a solution (optimistic or pessimistic locking).\n\nNot expected to know the Redis-based hold pattern upfront, but should reason through it when asked about performance.` },
        { title: 'Senior', body: `Should proactively identify the double-booking problem and propose the Redis + DB approach. Should design the read path with CDN and caching. Should discuss the traffic spike problem and propose a waiting room solution.\n\nShould articulate trade-offs between optimistic and pessimistic locking.` },
        { title: 'Staff+', body: `Should go deep on the waiting room implementation — Redis sorted set, token expiry, what happens when a user's token expires mid-checkout. Should discuss database sharding strategy for events (shard by event_id). Should proactively identify the seat map caching challenge and design a solution that balances freshness with performance.` },
      ],
    },
  ],
},

// ── FB NEWS FEED ───────────────────────────────────────────────────────────
'design-fb-news-feed': {
  slug: 'design-fb-news-feed', title: 'Design FB News Feed', subtitle: 'Personalized social media feed at scale',
  duration: '40 min', difficulty: 'Hard',
  sections: [
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `Facebook's News Feed is the personalized stream of posts, photos, and updates that users see when they open the app. What makes this one of the hardest system design problems is the combination of scale (2B users, 500M DAU), personalization (every user sees a different feed), and real-time updates (new posts should appear within seconds).\n\nThe core challenge is the fan-out problem: when a user with 5,000 friends posts something, that post needs to appear in 5,000 different feeds. Do you compute each feed on-the-fly (fan-out on read) or pre-compute and push to all followers (fan-out on write)? The answer depends on the user — and that trade-off is what interviewers want you to reason through.`,
    },
    {
      type: 'requirements', heading: 'Requirements',
      functional: [
        'User sees a personalized feed of posts from friends and followed pages',
        'Posts support text, images, and videos',
        'Feed is ranked by relevance (not just chronological)',
        'User can create posts (text, photo, video)',
        'User can like and comment on posts',
        'Feed updates in near-real-time when friends post',
      ],
      functionalOutOfScope: ['Stories (separate system)', 'Ads (separate ranking system)', 'Groups'],
      nonFunctional: [
        '2B users, 500M DAU',
        'Feed load time < 2 seconds (p99)',
        'New posts appear in friends\' feeds within seconds',
        'High availability — feed must always load (can show slightly stale data)',
        'Average user follows 200 friends/pages',
      ],
    },
    {
      type: 'text', heading: 'Scale Estimation',
      body: `**Posts:**\n- 500M DAU × 10% post daily = 50M posts/day ≈ 580 posts/sec\n\n**Feed reads:**\n- 500M DAU × 5 feed loads/day = 2.5B feed loads/day ≈ 29,000/sec\n- Each feed load fetches ~20 posts\n- Total post fetches: 29,000 × 20 = 580,000 post reads/sec\n\n**Fan-out writes (the hard part):**\n- 580 posts/sec × 200 avg followers = 116,000 feed writes/sec\n- But celebrities have 100M followers → 1 post = 100M writes\n\n**Storage:**\n- 50M posts/day × 1KB = 50GB/day text\n- Photos/videos stored separately in object storage`,
    },
    {
      type: 'text', heading: 'Core Entities',
      body: `**User** — Profile, friend list, followed pages\n**Post** — Content (text/photo/video), author, timestamp, engagement counts\n**FeedItem** — A post in a user's feed with ranking score\n**Like / Comment** — Engagement on posts\n**Follow** — Directed relationship (user → user or user → page)`,
    },
    {
      type: 'api', heading: 'API Design',
      endpoints: [
        { method: 'GET', path: '/feed?cursor=&limit=20', label: 'Get news feed (paginated)', response: '{ posts: Post[], next_cursor: string }', note: 'Cursor-based pagination — don\'t use offset (items shift as new posts are added)' },
        { method: 'POST', path: '/posts', label: 'Create a post', request: '{ content, media_urls?, visibility }', response: '{ post_id }' },
        { method: 'POST', path: '/posts/{postId}/likes', label: 'Like a post' },
        { method: 'POST', path: '/posts/{postId}/comments', label: 'Add a comment', request: '{ text }' },
        { method: 'POST', path: '/users/{userId}/follow', label: 'Follow a user/page' },
      ],
    },
    {
      type: 'schema', heading: 'Data Schema',
      entities: [
        {
          name: 'posts',
          note: 'Write once, read many times',
          fields: [
            { name: 'id', type: 'UUID', notes: 'Primary key' },
            { name: 'author_id', type: 'UUID', notes: 'Indexed' },
            { name: 'content', type: 'TEXT', notes: '' },
            { name: 'media_urls', type: 'TEXT[]', notes: 'S3 URLs' },
            { name: 'like_count', type: 'INT', notes: 'Denormalized for fast reads' },
            { name: 'comment_count', type: 'INT', notes: 'Denormalized' },
            { name: 'created_at', type: 'TIMESTAMP', notes: 'Indexed for time-range queries' },
          ],
        },
        {
          name: 'user_feed (Redis)',
          note: 'Pre-computed feed cache per user — sorted set by score',
          fields: [
            { name: 'key', type: 'STRING', notes: 'feed:{userId}' },
            { name: 'member', type: 'STRING', notes: 'post_id' },
            { name: 'score', type: 'FLOAT', notes: 'Ranking score (recency + engagement)' },
          ],
        },
        {
          name: 'follows',
          note: 'Social graph — can also use a graph DB',
          fields: [
            { name: 'follower_id', type: 'UUID', notes: 'Composite PK' },
            { name: 'followee_id', type: 'UUID', notes: 'Composite PK' },
            { name: 'created_at', type: 'TIMESTAMP', notes: '' },
          ],
        },
      ],
    },
    {
      type: 'architecture', heading: 'News Feed Architecture',
      caption: 'Hybrid fan-out: push for normal users, pull for celebrities. Feed served from Redis cache.',
      config: {
        width: 850, height: 420,
        nodes: [
          { id: 'user', label: 'User', icon: '👤', color: 'blue', x: 20, y: 160, w: 100, h: 56 },
          { id: 'lb', label: 'Load Balancer', color: 'cyan', x: 170, y: 160, w: 120, h: 56 },
          { id: 'post-svc', label: 'Post Service', sublabel: 'Create posts', color: 'green', x: 370, y: 40, w: 130, h: 56 },
          { id: 'feed-svc', label: 'Feed Service', sublabel: 'Read feeds', color: 'orange', x: 370, y: 160, w: 130, h: 56 },
          { id: 'fanout', label: 'Fan-out Service', sublabel: 'Push to followers', color: 'purple', x: 370, y: 290, w: 130, h: 56 },
          { id: 'feed-cache', label: 'Feed Cache', sublabel: 'Redis sorted sets', icon: '⚡', color: 'red', x: 580, y: 160, w: 130, h: 56 },
          { id: 'post-db', label: 'Post DB', sublabel: 'PostgreSQL', icon: '🗄️', color: 'blue', x: 580, y: 40, w: 130, h: 56 },
          { id: 'graph', label: 'Social Graph', sublabel: 'Followers list', color: 'cyan', x: 580, y: 290, w: 130, h: 56 },
          { id: 'rank', label: 'Ranking Service', sublabel: 'ML scoring', color: 'yellow', x: 740, y: 160, w: 110, h: 56 },
        ],
        edges: [
          { from: 'user', to: 'lb', label: 'request' },
          { from: 'lb', to: 'post-svc', label: 'POST /posts' },
          { from: 'lb', to: 'feed-svc', label: 'GET /feed' },
          { from: 'post-svc', to: 'post-db', label: 'store post' },
          { from: 'post-svc', to: 'fanout', label: 'trigger fan-out' },
          { from: 'fanout', to: 'graph', label: 'get followers' },
          { from: 'fanout', to: 'feed-cache', label: 'push to feeds', color: 'accent' },
          { from: 'feed-svc', to: 'feed-cache', label: 'read feed', color: 'accent' },
          { from: 'feed-svc', to: 'rank', label: 'rank posts' },
        ],
      },
    },
    {
      type: 'deepdive', heading: 'Deep Dive: Fan-out — The Core Design Decision',
      subtitle: 'How do you get a post into all followers\' feeds efficiently?',
      content: [
        {
          type: 'text', heading: 'Fan-out on Write (Push Model)',
          body: `When a user posts, immediately write the post to all followers' feed caches.\n\n**Flow:**\n1. User creates post\n2. Fetch all followers (could be millions)\n3. For each follower, add post_id to their feed cache (Redis sorted set)\n4. Done — feed reads are instant (just read from cache)\n\n**Pros:** Feed reads are O(1) — just read from Redis\n**Cons:**\n- Celebrities with 100M followers → 100M Redis writes per post\n- High write amplification\n- Wasted work for inactive users (their feed is pre-computed but never read)`,
        },
        {
          type: 'text', heading: 'Fan-out on Read (Pull Model)',
          body: `When a user opens their feed, fetch recent posts from all followed users.\n\n**Flow:**\n1. User opens feed\n2. Fetch list of all followed users\n3. For each followed user, fetch their recent posts\n4. Merge, rank, return top N\n\n**Pros:** No write amplification, no wasted work for inactive users\n**Cons:**\n- Feed load is slow — must query N users' posts and merge\n- For a user following 1,000 people: 1,000 DB queries per feed load\n- Doesn't scale`,
        },
        {
          type: 'text', heading: 'Hybrid Approach (Facebook\'s Actual Approach)',
          body: `**Regular users (< 10K followers):** Fan-out on write\n- Pre-compute feed in Redis on every post\n- Feed reads are instant\n\n**Celebrities (> 10K followers):** Fan-out on read\n- Don't pre-compute — too expensive\n- When a user opens their feed, merge pre-computed feed with recent celebrity posts\n- Cache celebrity posts separately\n\n**Inactive users:** Don't pre-compute\n- If a user hasn't opened the app in 7 days, don't maintain their feed cache\n- On next open, rebuild from scratch (one-time cost)\n\n**Implementation:**\n- Post service publishes to Kafka on every post\n- Fan-out workers consume from Kafka, write to Redis\n- Workers check follower count: if > threshold, skip fan-out\n- Feed service merges pre-computed feed + celebrity posts at read time`,
        },
        {
          type: 'callout', variant: 'info', heading: 'The Celebrity Problem',
          body: 'A user with 100M followers posting creates 100M write operations. This is called the "celebrity problem" or "hot key problem." The hybrid approach solves it by treating celebrities differently — their posts are fetched at read time rather than pushed to all followers.',
        },
      ],
    },
    {
      type: 'deepdive', heading: 'Deep Dive: Feed Ranking',
      subtitle: 'Why chronological doesn\'t work and how ML ranking works',
      content: [
        {
          type: 'text', heading: 'Why Not Chronological?',
          body: `A user following 500 people generates 500+ posts/day. Showing them all chronologically means:\n- Important posts from close friends get buried by noise\n- User misses content they actually care about\n- Engagement drops → users leave\n\nFacebook found that ML ranking increased engagement by 2-3x over chronological.`,
        },
        {
          type: 'text', heading: 'Ranking Signals',
          body: `**Recency** — Newer posts score higher (time decay function)\n**Relationship strength** — How often do you interact with this person? (likes, comments, messages)\n**Post engagement** — How many likes/comments/shares has this post gotten from others?\n**Content type preference** — Does this user engage more with videos or text?\n**Post quality** — Is this spam? Clickbait? Low-quality content?\n\n**Simplified scoring formula:**\nscore = recency_score × relationship_weight × engagement_score × quality_score\n\nIn practice, Facebook uses a deep learning model with hundreds of features.`,
        },
        {
          type: 'text', heading: 'Two-Stage Ranking',
          body: `**Stage 1: Candidate Generation**\nFrom the user's feed cache (potentially 1,000+ posts), select top 500 candidates using a fast, simple model.\n\n**Stage 2: Ranking**\nRun the full ML model on the 500 candidates to produce the final ranked list of 20 posts.\n\nThis two-stage approach is used by almost every large-scale recommendation system (YouTube, TikTok, Twitter). The first stage is fast and cheap; the second stage is accurate but expensive.`,
        },
      ],
    },
    {
      type: 'levels', heading: 'What\'s Expected at Each Level',
      levels: [
        { title: 'Mid-level', body: `Should define the API, basic schema, and understand the fan-out problem. Should be able to explain fan-out on write vs read and their trade-offs.\n\nNot expected to know the hybrid approach upfront, but should reason through it when asked "what happens when a celebrity with 100M followers posts?"` },
        { title: 'Senior', body: `Should proactively identify the celebrity problem and propose the hybrid approach. Should design the Kafka-based fan-out pipeline. Should discuss feed ranking at a high level (recency + engagement signals).\n\nShould design the Redis feed cache with appropriate data structures (sorted set by score).` },
        { title: 'Staff+', body: `Should go deep on the ML ranking pipeline — two-stage ranking, feature engineering, model serving latency. Should discuss how to handle feed consistency (what if a post is deleted after being fanned out?). Should design the notification system for real-time feed updates. May discuss the social graph storage (graph DB vs adjacency list in relational DB).` },
      ],
    },
  ],
},

// ── RATE LIMITER ───────────────────────────────────────────────────────────
'design-rate-limiter': {
  slug: 'design-rate-limiter', title: 'Design a Rate Limiter', subtitle: 'Protect APIs from abuse and ensure fair usage',
  duration: '30 min', difficulty: 'Medium',
  sections: [
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `A rate limiter controls how many requests a client can make to your API within a given time window. Without one, a single misbehaving client or attacker can overwhelm your servers and degrade the experience for everyone. Every production API has rate limiting — it is table stakes.\n\nWhat makes this a great interview question is that it tests your understanding of distributed systems fundamentals: where do you store the counters (Redis), how do you handle multiple servers (distributed counting), and what algorithm do you use (token bucket vs sliding window). The interviewer expects you to discuss trade-offs, not just pick one approach.`,
    },
    {
      type: 'requirements', heading: 'Requirements',
      functional: [
        'Limit the number of requests a client can make in a time window',
        'Return HTTP 429 (Too Many Requests) when limit is exceeded',
        'Support different rate limits for different APIs and user tiers',
        'Support multiple limit dimensions: per user, per IP, per API key',
      ],
      functionalOutOfScope: ['Billing based on usage', 'Allowlisting specific IPs'],
      nonFunctional: [
        'Low latency — rate limiting check must add < 1ms to request latency',
        'Distributed — must work correctly across multiple app servers',
        'Accurate — no race conditions that allow bursting past the limit',
        'Highly available — if rate limiter fails, fail open (allow requests) rather than blocking all traffic',
        '10M requests/sec across the system',
      ],
    },
    {
      type: 'text', heading: 'Where to Place the Rate Limiter',
      body: `**Client-side:** Easily bypassed. Never rely on this alone.\n\n**API Gateway:** Best for most cases. Centralized, language-agnostic, no code changes needed in services. Examples: AWS API Gateway, Kong, Nginx.\n\n**Application middleware:** More flexible (can access business logic), but must be implemented in every service.\n\n**Recommendation:** API Gateway for global limits, application middleware for business-logic-aware limits (e.g., "free tier users can only call /search 10 times/day").`,
    },
    {
      type: 'architecture', heading: 'Rate Limiter Architecture',
      caption: 'Rate limiter sits in the API Gateway. Counters stored in Redis for distributed accuracy.',
      config: {
        width: 820, height: 340,
        nodes: [
          { id: 'client', label: 'Client', icon: '🌐', color: 'blue', x: 20, y: 120, w: 100, h: 56 },
          { id: 'gateway', label: 'API Gateway', sublabel: 'Rate limit check', color: 'cyan', x: 190, y: 120, w: 140, h: 56 },
          { id: 'redis', label: 'Redis', sublabel: 'Counters + TTL', icon: '⚡', color: 'red', x: 190, y: 250, w: 130, h: 56 },
          { id: 'rules', label: 'Rules DB', sublabel: 'Limit configs', icon: '📋', color: 'purple', x: 400, y: 250, w: 130, h: 56 },
          { id: 'svc1', label: 'Service A', color: 'green', x: 420, y: 40, w: 120, h: 50 },
          { id: 'svc2', label: 'Service B', color: 'green', x: 420, y: 120, w: 120, h: 50 },
          { id: 'svc3', label: 'Service C', color: 'green', x: 420, y: 200, w: 120, h: 50 },
          { id: 'resp429', label: '429 Too Many', sublabel: 'Retry-After header', color: 'red', x: 620, y: 120, w: 130, h: 56 },
        ],
        edges: [
          { from: 'client', to: 'gateway', label: 'request' },
          { from: 'gateway', to: 'redis', label: 'INCR counter', color: 'accent' },
          { from: 'gateway', to: 'rules', label: 'load rules (cached)', dashed: true },
          { from: 'gateway', to: 'svc1', label: 'allowed → forward' },
          { from: 'gateway', to: 'svc2', label: '' },
          { from: 'gateway', to: 'resp429', label: 'over limit → reject', dashed: true },
        ],
      },
    },
    {
      type: 'text', heading: 'Core Entities',
      body: `**RateLimitRule** — Defines the limit (e.g., 100 requests/minute for /api/search)\n**RateLimitCounter** — Current count for a client in the current window\n**Client** — Identified by user_id, API key, or IP address`,
    },
    {
      type: 'api', heading: 'API Design',
      description: 'The rate limiter is middleware, not a standalone API. But it exposes a check interface:',
      endpoints: [
        { method: 'POST', path: '/ratelimit/check', label: 'Check if request is allowed', request: '{ client_id, api_endpoint, timestamp }', response: '{ allowed: bool, remaining: int, reset_at: timestamp }', note: 'Internal API called by API Gateway before forwarding requests' },
        { method: 'GET', path: '/ratelimit/rules', label: 'Get rate limit rules (admin)' },
        { method: 'PUT', path: '/ratelimit/rules/{ruleId}', label: 'Update a rule (admin)' },
      ],
    },
    {
      type: 'deepdive', heading: 'Deep Dive: Rate Limiting Algorithms',
      subtitle: 'Four algorithms — each with different trade-offs',
      content: [
        {
          type: 'text', heading: 'Fixed Window Counter',
          body: `Divide time into fixed windows (e.g., each minute). Count requests per window.\n\n\`\`\`\nWindow: 12:00:00 - 12:00:59\nCount: 95/100\n\nWindow: 12:01:00 - 12:01:59\nCount: 0/100 (reset)\n\`\`\`\n\n**Pros:** Simple, O(1) space and time\n**Cons:** Edge case — a client can make 100 requests at 12:00:59 and 100 more at 12:01:00, effectively 200 requests in 2 seconds. This is the "boundary burst" problem.`,
        },
        {
          type: 'text', heading: 'Sliding Window Log',
          body: `Store the timestamp of every request. Count requests in the last N seconds.\n\n\`\`\`\nOn each request:\n1. Remove timestamps older than (now - window_size)\n2. Count remaining timestamps\n3. If count < limit: allow, add current timestamp\n4. Else: reject\n\`\`\`\n\n**Pros:** Perfectly accurate, no boundary burst\n**Cons:** Memory-intensive — must store every request timestamp. At 10M req/sec, that's a lot of data.`,
        },
        {
          type: 'text', heading: 'Sliding Window Counter (Best Balance)',
          body: `Combine fixed window counts with a weighted overlap calculation.\n\n\`\`\`\ncurrent_count = prev_window_count × (1 - elapsed/window_size) + curr_window_count\n\`\`\`\n\n**Example:** Window = 1 minute, limit = 100\n- Previous window: 80 requests\n- Current window: 30 seconds elapsed, 40 requests so far\n- Estimated count = 80 × (1 - 30/60) + 40 = 40 + 40 = 80 → allow\n\n**Pros:** Good accuracy, O(1) space (only store 2 counters per client)\n**Cons:** Approximate (not perfectly accurate, but close enough for most use cases)`,
        },
        {
          type: 'text', heading: 'Token Bucket',
          body: `A bucket holds N tokens. Tokens refill at rate R per second. Each request consumes 1 token.\n\n\`\`\`\nBucket capacity: 100 tokens\nRefill rate: 10 tokens/second\n\nRequest arrives:\n  tokens_available = min(capacity, last_tokens + (now - last_refill) × rate)\n  if tokens_available >= 1: allow, tokens_available -= 1\n  else: reject\n\`\`\`\n\n**Pros:** Allows controlled bursting (up to bucket capacity), smooth traffic\n**Cons:** Two parameters to tune (capacity + refill rate), slightly more complex\n\n**Used by:** AWS API Gateway, Stripe, most production rate limiters`,
        },
      ],
    },
    {
      type: 'deepdive', heading: 'Deep Dive: Distributed Rate Limiting with Redis',
      subtitle: 'How to make rate limiting work correctly across multiple servers',
      content: [
        {
          type: 'text', heading: 'The Problem with Local Counters',
          body: `If each app server maintains its own counter, a client can bypass the limit by sending requests to different servers.\n\n**Example:** Limit = 100/min, 10 servers\n- Client sends 10 requests to each server\n- Each server sees 10 requests (under limit)\n- Total: 100 requests — at the limit\n- But client could send 99 to each server = 990 requests total\n\nSolution: Centralized counter in Redis.`,
        },
        {
          type: 'text', heading: 'Redis INCR + EXPIRE',
          body: `\`\`\`\nkey = "ratelimit:{clientId}:{windowStart}"\n\ncount = INCR key\nif count == 1:\n    EXPIRE key 60  # Set TTL on first request\nif count > limit:\n    return 429\nreturn 200\n\`\`\`\n\n**Problem:** Race condition between INCR and EXPIRE — if server crashes between them, key never expires.\n\n**Fix:** Use a Lua script to make it atomic:\n\`\`\`lua\nlocal count = redis.call('INCR', KEYS[1])\nif count == 1 then\n    redis.call('EXPIRE', KEYS[1], ARGV[1])\nend\nreturn count\n\`\`\`\n\nLua scripts in Redis are atomic — no other commands execute between them.`,
        },
        {
          type: 'text', heading: 'Redis Sliding Window with Sorted Sets',
          body: `For sliding window log approach:\n\n\`\`\`\nkey = "ratelimit:{clientId}"\nnow = current_timestamp_ms\nwindow_start = now - 60000  # 60 seconds ago\n\n# Atomic pipeline:\nZREMRANGEBYSCORE key 0 window_start  # Remove old entries\nZADD key now now                       # Add current request\ncount = ZCARD key                      # Count entries\nEXPIRE key 60                         # Auto-cleanup\n\nif count > limit: return 429\n\`\`\`\n\n**Trade-off:** More accurate but uses more memory (stores every timestamp).`,
        },
        {
          type: 'callout', variant: 'warning', heading: 'Fail Open vs Fail Closed',
          body: 'If Redis goes down, should you allow all requests (fail open) or block all requests (fail closed)? For most APIs, fail open is better — a brief period of no rate limiting is better than blocking all legitimate traffic. For security-critical APIs (login, payment), fail closed may be appropriate.',
        },
      ],
    },
    {
      type: 'levels', heading: 'What\'s Expected at Each Level',
      levels: [
        { title: 'Mid-level', body: `Should understand the problem, propose a basic algorithm (fixed window or token bucket), and identify that a centralized store (Redis) is needed for distributed rate limiting.\n\nShould know the basic Redis INCR + EXPIRE pattern.` },
        { title: 'Senior', body: `Should compare multiple algorithms and explain trade-offs. Should design the full Redis-based solution with atomic Lua scripts. Should discuss where to place the rate limiter (API Gateway vs middleware) and the trade-offs.\n\nShould handle the fail-open vs fail-closed question.` },
        { title: 'Staff+', body: `Should go deep on the sliding window counter algorithm and its approximation accuracy. Should discuss how to handle rate limiting across multiple data centers (eventual consistency of counters). Should design the rule management system — how do you update rate limit rules without redeploying? Should discuss rate limiting for distributed denial of service (DDoS) scenarios.` },
      ],
    },
  ],
},

// ── DROPBOX ────────────────────────────────────────────────────────────────
'design-dropbox': {
  slug: 'design-dropbox', title: 'Design Dropbox', subtitle: 'Cloud file storage and sync',
  duration: '45 min', difficulty: 'Hard',
  sections: [
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `Dropbox is a cloud file storage and synchronization service. Users upload files from one device and access them from any other device. Files shared with collaborators appear in their Dropbox automatically. Changes sync across all devices in near-real-time.\n\nWhat makes this problem interesting for system design interviews is the combination of challenges: you need to handle files up to 50GB (which cannot be uploaded in a single HTTP request), you need efficient sync (only transfer what changed, not the entire file), and you need to do all of this reliably across unreliable networks where uploads can be interrupted at any point.\n\nThe interviewer is looking for you to identify that the naive approach (upload entire files through your API servers) does not work at scale, and to design a system that uses pre-signed URLs for direct-to-storage uploads, chunked multipart uploads for large files, and content-defined chunking for efficient delta sync.`,
    },
    {
      type: 'requirements', heading: 'Requirements',
      functional: [
        'Upload a file from any device',
        'Download a file from any device',
        'Share a file with other users',
        'Automatic sync across all devices — changes on one device appear on others',
      ],
      functionalOutOfScope: ['Edit files in-browser (Google Docs territory)', 'File versioning / history', 'Virus/malware scanning'],
      nonFunctional: [
        'Highly available — prioritize availability over consistency (AP)',
        'Support files as large as 50GB',
        'Reliable — never lose a file, even during failures',
        'Fast upload, download, and sync (low latency for small files, resumability for large files)',
        'Efficient bandwidth — only transfer changed portions of files (delta sync)',
      ],
      nonFunctionalOutOfScope: ['Per-user storage quotas', 'Offline editing conflict resolution'],
    },
    { type: 'callout', variant: 'tip', heading: 'CAP Trade-off', body: `Dropbox prioritizes availability over consistency. If a user in Germany uploads a file, it is OK if a user in the US cannot see it for a few seconds. The system is eventually consistent — all devices will converge. Compare this to a payment system where you need strong consistency and cannot tolerate stale reads.` },
    { type: 'text', heading: 'Core Entities', body: `**File** — The raw bytes stored in object storage (S3). Never stored in a database.\n\n**FileMetadata** — Name, size, MIME type, uploader, S3 key, chunk list, fingerprint. Stored in the database. This is the source of truth for what files exist and where they are.\n\n**User** — Account with authentication credentials and device list.\n\n**SharedFiles** — Access control mapping: which users can access which files.` },
    {
      type: 'api', heading: 'API Design',
      description: 'Notice that upload and download do not go through our servers — they use pre-signed URLs to talk directly to S3.',
      endpoints: [
        { method: 'POST', path: '/files/upload/initiate', label: 'Start upload', request: '{\n  filename: string,\n  size: number,\n  fingerprint: string,\n  chunks: [{ index, fingerprint, size }]\n}', response: '{\n  file_id: string,\n  upload_urls: [pre-signed S3 URLs per chunk]\n}', note: 'Server generates pre-signed S3 URLs. Client uploads directly to S3.' },
        { method: 'POST', path: '/files/{fileId}/upload/complete', label: 'Finalize upload', request: '{ chunk_etags: string[] }', note: 'Server calls S3 CompleteMultipartUpload. Updates metadata status to "uploaded".' },
        { method: 'GET', path: '/files/{fileId}/download', label: 'Get download URL', response: '{ download_url: pre-signed CDN URL }', note: 'Short-lived signed URL (15 min). Client downloads from CDN, not our servers.' },
        { method: 'POST', path: '/files/{fileId}/share', label: 'Share with users', request: '{ user_ids: string[] }' },
        { method: 'GET', path: '/files/changes?since={timestamp}', label: 'Sync — get changes since last sync', response: 'ChangeEvent[]', note: 'Used by the desktop sync agent. Also pushed via WebSocket for real-time.' },
      ],
    },
    {
      type: 'schema', heading: 'Data Schema',
      entities: [
        { name: 'file_metadata', note: 'PostgreSQL — source of truth for file existence and location', fields: [
          { name: 'id', type: 'UUID', notes: 'Primary key' },
          { name: 'name', type: 'VARCHAR', notes: 'Original filename' },
          { name: 'size', type: 'BIGINT', notes: 'Total size in bytes' },
          { name: 'mime_type', type: 'VARCHAR', notes: 'e.g. application/pdf' },
          { name: 'uploaded_by', type: 'UUID', notes: 'User ID' },
          { name: 'status', type: 'ENUM', notes: 'uploading | uploaded | failed' },
          { name: 's3_key', type: 'VARCHAR', notes: 'S3 object key' },
          { name: 'fingerprint', type: 'VARCHAR(64)', notes: 'SHA-256 of entire file — for dedup and resume' },
          { name: 'chunk_count', type: 'INT', notes: 'Number of chunks' },
          { name: 'created_at', type: 'TIMESTAMP', notes: '' },
          { name: 'updated_at', type: 'TIMESTAMP', notes: 'For sync — "what changed since X?"' },
        ]},
        { name: 'shared_files', note: 'Access control — composite key', fields: [
          { name: 'user_id', type: 'UUID', notes: 'Who has access' },
          { name: 'file_id', type: 'UUID', notes: 'Which file' },
          { name: 'permission', type: 'ENUM', notes: 'read | write' },
          { name: 'shared_by', type: 'UUID', notes: 'Who granted access' },
        ]},
      ],
    },
    {
      type: 'text', heading: 'High-Level Design',
      body: `The key architectural insight is that file bytes never flow through your application servers. Your servers only handle metadata and coordination. The actual file data flows directly between the client and object storage (S3) via pre-signed URLs.\n\nThis is critical because a 50GB file upload would consume your server's bandwidth, memory, and CPU for over an hour. With pre-signed URLs, your server does a quick cryptographic signature (microseconds), hands the URL to the client, and the client uploads directly to S3. Your server is free to handle other requests.`,
    },
    {
      type: 'architecture', heading: 'Upload Architecture',
      caption: 'Files go directly to S3 via pre-signed URLs. Your servers only handle metadata.',
      config: {
        width: 820, height: 380,
        nodes: [
          { id: 'client', label: 'Desktop Client', sublabel: 'Sync agent', icon: '💻', color: 'blue', x: 20, y: 140, w: 120, h: 60 },
          { id: 'lb', label: 'Load Balancer', color: 'cyan', x: 200, y: 140, w: 120, h: 56 },
          { id: 'api', label: 'API Server', sublabel: 'Metadata only', color: 'green', x: 390, y: 40, w: 130, h: 56 },
          { id: 'db', label: 'PostgreSQL', sublabel: 'File metadata', icon: '🗄️', color: 'blue', x: 600, y: 40, w: 130, h: 56 },
          { id: 's3', label: 'S3', sublabel: 'File storage', icon: '📦', color: 'orange', x: 390, y: 240, w: 130, h: 56 },
          { id: 'cdn', label: 'CDN', sublabel: 'Downloads', icon: '🌍', color: 'cyan', x: 600, y: 240, w: 130, h: 56 },
          { id: 'notify', label: 'Notification Svc', sublabel: 'WebSocket push', icon: '🔔', color: 'purple', x: 600, y: 140, w: 130, h: 56 },
        ],
        edges: [
          { from: 'client', to: 'lb', label: '1. initiate upload' },
          { from: 'lb', to: 'api', label: 'metadata request' },
          { from: 'api', to: 'db', label: 'save metadata' },
          { from: 'api', to: 'client', label: '2. pre-signed URLs', dashed: true },
          { from: 'client', to: 's3', label: '3. upload chunks directly', color: 'accent' },
          { from: 's3', to: 'cdn', label: 'origin for downloads' },
          { from: 'api', to: 'notify', label: '4. notify other devices' },
        ],
      },
    },
    {
      type: 'text', heading: 'Upload Flow — Step by Step',
      body: `1. The desktop sync agent detects a new or changed file in the Dropbox folder (using OS file system events).\n2. The client chunks the file into 5-10MB pieces and computes a SHA-256 fingerprint for each chunk and for the entire file.\n3. The client calls POST /files/upload/initiate with the file metadata and chunk fingerprints. The server checks if a file with this fingerprint already exists (deduplication). If the file was partially uploaded before (status = "uploading"), the server returns pre-signed URLs only for the missing chunks (resumability).\n4. The server calls S3 CreateMultipartUpload and generates a pre-signed URL for each chunk. These URLs are valid for 15 minutes and allow the client to upload directly to S3 without going through our servers.\n5. The client uploads each chunk to S3 in parallel (typically 4-8 concurrent uploads). Progress is tracked per-chunk, giving the user a smooth progress bar.\n6. After all chunks are uploaded, the client calls POST /files/{fileId}/upload/complete. The server calls S3 CompleteMultipartUpload, which assembles the chunks into a single S3 object. The metadata status is updated to "uploaded".\n7. The Notification Service pushes a sync event to all of the user's other devices via WebSocket, so they can download the new file.`,
    },
    {
      type: 'text', heading: 'Sync Architecture',
      body: `Sync is the mechanism that keeps all devices up to date. It has two directions:\n\n**Local → Remote:** The desktop sync agent monitors the Dropbox folder using OS file system events (inotify on Linux, FSEvents on macOS, ReadDirectoryChangesW on Windows). When a file changes, the agent uploads it using the upload flow above.\n\n**Remote → Local:** When another device uploads a file, this device needs to know about it. We use a hybrid approach:\n\n1. **WebSocket push** — Each device maintains a persistent WebSocket connection to the Notification Service. When a file changes, the server pushes a lightweight event (file_id, change_type, timestamp). The client then fetches the updated metadata and downloads the file.\n2. **Polling as safety net** — WebSocket connections can drop silently. Every 5 minutes, the client calls GET /files/changes?since={lastSyncTimestamp} to catch any missed events.\n3. **On reconnect** — When a device comes online after being offline, it always does a full sync from its last known timestamp.\n\nThis hybrid approach gives real-time updates (WebSocket) with guaranteed eventual consistency (polling).`,
    },
    {
      type: 'deepdive', heading: 'Deep Dive: Handling Large Files (up to 50GB)',
      subtitle: 'The core challenge — chunked uploads, resumability, and delta sync',
      content: [
        { type: 'text', heading: 'Why Single-Request Upload Fails', body: `A 50GB file at 100Mbps takes about 1.1 hours to upload. During that time, any network interruption means starting over from scratch. API gateways typically have a 10MB request body limit. And the file would consume your server's memory and bandwidth for the entire duration.\n\nChunked multipart upload solves all of these problems: each chunk is a separate HTTP request (5-10MB), chunks can be uploaded in parallel, and if the upload is interrupted, only the incomplete chunks need to be retried.` },
        { type: 'text', heading: 'Content-Defined Chunking (CDC) for Delta Sync', body: `With fixed-size chunks (e.g., every 8MB), inserting a single byte near the beginning of a file shifts all subsequent chunk boundaries. Every chunk after the insertion point has a different fingerprint, so the entire file must be re-uploaded.\n\nContent-Defined Chunking (CDC) uses a rolling hash (Rabin fingerprinting) to determine chunk boundaries based on the file content itself. The algorithm slides a window over the file and creates a boundary whenever the hash matches a certain pattern. This means a small edit only affects the chunks immediately surrounding the change — all other chunks remain identical.\n\nWhen the user edits a 1GB file and changes 100 bytes in the middle, CDC ensures that only 1-2 chunks (10-20MB) need to be re-uploaded instead of the entire 1GB. This is how Dropbox achieves efficient delta sync and is the key insight interviewers are looking for at the senior level.` },
        { type: 'callout', variant: 'info', heading: 'Deduplication Across Users', body: `If two users upload the same file (same SHA-256 fingerprint), the system can store it only once in S3 and point both metadata records to the same S3 key. This is called cross-user deduplication and can save significant storage. Dropbox reportedly saves 60%+ storage through deduplication. However, this has privacy implications — you are implicitly revealing that another user has the same file. Some systems skip cross-user dedup for this reason.` },
      ],
    },
    {
      type: 'deepdive', heading: 'Deep Dive: Security and Access Control',
      subtitle: 'Encryption, signed URLs, and permission management',
      content: [
        { type: 'text', heading: 'Encryption', body: `**In transit:** All communication uses HTTPS/TLS. The client-to-S3 upload also uses HTTPS (pre-signed URLs include the https:// scheme).\n\n**At rest:** Enable S3 server-side encryption (SSE-S3 or SSE-KMS). Each object is encrypted with a unique data key, and the data keys are encrypted with a master key managed by AWS KMS. This means even if someone gains physical access to the S3 storage disks, they cannot read the files.\n\nFor extra security, the client can encrypt files before uploading (client-side encryption). This means even Dropbox (or AWS) cannot read the file contents. The trade-off is that server-side features like search and preview become impossible.` },
        { type: 'text', heading: 'Pre-Signed URL Security', body: `Pre-signed URLs are bearer tokens — anyone with a valid, unexpired URL can access the file. This is why short expiry times are critical:\n\n- Upload URLs: 15-minute expiry (enough time to upload a chunk)\n- Download URLs: 5-15 minute expiry\n\nFor downloads, route through CDN with signed URLs. The CDN validates the signature and serves the file from the nearest edge. If a URL is accidentally shared, it expires quickly and cannot be reused.\n\nThe server always checks the shared_files table before generating a signed URL. No authorization check = no URL = no access.` },
      ],
    },
    {
      type: 'architecture', heading: 'Scaled Architecture',
      caption: 'Metadata servers, S3 for storage, CDN for downloads, WebSocket for real-time sync',
      config: {
        width: 820, height: 380,
        nodes: [
          { id: 'devices', label: 'User Devices', icon: '📱💻', color: 'blue', x: 20, y: 140, w: 110, h: 56 },
          { id: 'lb', label: 'Load Balancer', color: 'cyan', x: 180, y: 140, w: 120, h: 56 },
          { id: 'meta', label: 'Metadata Svc', sublabel: 'Stateless ×N', color: 'green', x: 370, y: 40, w: 130, h: 56 },
          { id: 'sync', label: 'Sync Service', sublabel: 'WebSocket ×N', color: 'purple', x: 370, y: 140, w: 130, h: 56 },
          { id: 'db', label: 'PostgreSQL', sublabel: 'Metadata + sharing', icon: '🗄️', color: 'blue', x: 570, y: 40, w: 130, h: 56 },
          { id: 'redis', label: 'Redis', sublabel: 'Sync pub/sub', icon: '⚡', color: 'red', x: 570, y: 140, w: 130, h: 56 },
          { id: 's3', label: 'S3', sublabel: 'File storage', icon: '📦', color: 'orange', x: 370, y: 270, w: 130, h: 56 },
          { id: 'cdn', label: 'CDN', sublabel: 'Downloads', icon: '🌍', color: 'cyan', x: 570, y: 270, w: 130, h: 56 },
        ],
        edges: [
          { from: 'devices', to: 'lb', label: 'API + WebSocket' },
          { from: 'lb', to: 'meta', label: 'metadata ops' },
          { from: 'lb', to: 'sync', label: 'WebSocket' },
          { from: 'meta', to: 'db', label: 'read/write' },
          { from: 'sync', to: 'redis', label: 'pub/sub events' },
          { from: 'devices', to: 's3', label: 'upload chunks', color: 'accent' },
          { from: 's3', to: 'cdn', label: 'origin' },
          { from: 'devices', to: 'cdn', label: 'download', dashed: true },
        ],
      },
    },
    {
      type: 'levels', heading: 'What Interviewers Expect at Each Level',
      levels: [
        { title: 'Mid-level', body: `Define the API for upload, download, share, and sync. Understand that files should be stored in object storage (S3), not in a database. Should be able to reason through why pre-signed URLs are better than proxying through your servers when asked. Basic sync design with polling.` },
        { title: 'Senior', body: `Proactively design the pre-signed URL flow for both uploads and downloads. Explain chunked multipart upload for large files with resumability. Design the hybrid sync protocol (WebSocket + polling). Discuss content-defined chunking for delta sync. Should mention encryption at rest and in transit.` },
        { title: 'Staff+', body: `Deep knowledge of CDC (Rabin fingerprinting), cross-user deduplication and its privacy trade-offs, S3 multipart upload internals. Should design the notification fan-out for shared files. May discuss geo-distributed storage (S3 cross-region replication), conflict resolution for concurrent edits, and compression strategies for bandwidth optimization.` },
      ],
    },
  ],
},

}; // end QUESTION_BREAKDOWN_TOPICS

// ── COMING SOON PLACEHOLDERS ───────────────────────────────────────────────
// These will be expanded with full content in future updates

Object.assign(QUESTION_BREAKDOWN_TOPICS, {

  'design-tinder': {
    slug: 'design-tinder', title: 'Design Tinder', subtitle: 'Location-based matching with swipe mechanics',
    duration: '40 min', difficulty: 'Hard',
    sections: [
      
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `Tinder is a location-based dating app where users swipe right (like) or left (pass) on profiles. When two users both swipe right on each other, it is a match and they can chat. The interesting system design challenges are geospatial queries (finding users nearby), the recommendation engine (who to show next), and handling the massive read-heavy workload (millions of swipe decisions per minute).`,
    },
    {
        type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Users create a profile with photos, bio, and preferences', 'Users see nearby profiles and swipe left (pass) or right (like)', 'When two users both swipe right, it\'s a match', 'Matched users can chat', 'Users can set distance, age, and gender preferences'],
        functionalOutOfScope: ['Super likes', 'Boost/premium features', 'Video profiles'],
        nonFunctional: ['100M users, 50M DAU', 'Low latency profile loading (<200ms)', 'Location-based — show users within configurable radius (1-100km)', 'Never show the same profile twice', '1.6B swipes per day'],
        nonFunctionalOutOfScope: ['Content moderation', 'Fraud/bot detection'],
      },
      { type: 'text', heading: 'Scale Estimation', body: `**Swipes:** 1.6B/day ÷ 86,400 = ~18,500 swipes/sec\n**Profile loads:** Each swipe loads a profile card. 18,500 profile reads/sec.\n**Matches:** ~26M matches/day (1.6% match rate)\n**Location updates:** 50M DAU updating location when app opens = ~50M updates/day\n**Storage:** 100M users × 5KB profile = 500GB. Photos in S3.` },
      { type: 'text', heading: 'Core Entities', body: `**User** — Profile, photos, bio, preferences (age range, distance, gender)\n**Swipe** — Swiper, swiped_on, direction (left/right), timestamp\n**Match** — Two users who both swiped right\n**Message** — Text between matched users` },
      {
        type: 'api', heading: 'API Design',
        endpoints: [
          { method: 'GET', path: '/recommendations?limit=20', label: 'Get profile cards to swipe on', response: 'User[] (pre-filtered by preferences + location)' },
          { method: 'POST', path: '/swipes', label: 'Record a swipe', request: '{ target_user_id, direction: "left" | "right" }', response: '{ match: bool, match_id?: string }' },
          { method: 'GET', path: '/matches', label: 'List matches' },
          { method: 'PUT', path: '/users/me/location', label: 'Update location', request: '{ lat, lng }' },
          { method: 'PUT', path: '/users/me/preferences', label: 'Update preferences', request: '{ min_age, max_age, max_distance_km, gender }' },
        ],
      },
      {
        type: 'schema', heading: 'Data Schema',
        entities: [
          { name: 'users', note: 'PostgreSQL + Redis for geo', fields: [
            { name: 'id', type: 'UUID', notes: 'Primary key' },
            { name: 'name', type: 'VARCHAR', notes: '' },
            { name: 'age', type: 'INT', notes: 'Indexed' },
            { name: 'gender', type: 'ENUM', notes: 'Indexed' },
            { name: 'bio', type: 'TEXT', notes: '' },
            { name: 'photo_urls', type: 'TEXT[]', notes: 'S3 URLs' },
            { name: 'location', type: 'POINT', notes: 'PostGIS or Redis Geo' },
            { name: 'preferences', type: 'JSONB', notes: 'age range, distance, gender' },
          ]},
          { name: 'swipes', note: 'Cassandra — write-heavy, time-series', fields: [
            { name: 'swiper_id', type: 'UUID', notes: 'Partition key' },
            { name: 'swiped_id', type: 'UUID', notes: 'Clustering key' },
            { name: 'direction', type: 'ENUM', notes: 'left | right' },
            { name: 'created_at', type: 'TIMESTAMP', notes: '' },
          ]},
        ],
      },
      { type: 'text', heading: 'High-Level Design', body: `**Recommendation flow:**\n1. User opens app → location updated in Redis Geo\n2. Client requests recommendations\n3. **Recommendation Service** queries:\n   a. Redis Geo: users within distance preference\n   b. Filter by age, gender preferences\n   c. Exclude already-swiped users (check swipes table or Bloom filter)\n   d. Rank by "desirability score" (profile completeness, activity, ELO-like rating)\n4. Return top 20 profiles\n\n**Swipe flow:**\n1. User swipes right on profile B\n2. Write swipe to DB\n3. Check: "Did B already swipe right on me?" → query swipes table for (B, A, right)\n4. If yes → it's a match! Create match record, notify both users\n5. If no → done, wait for B to swipe` },
      {
        type: 'deepdive', heading: 'Deep Dive: Recommendation Engine',
        subtitle: 'Who to show next — the core product challenge',
        content: [
          { type: 'text', heading: 'The "Already Seen" Problem', body: `Never show the same profile twice. With 50M DAU swiping 30+ times/day, you need fast "have I seen this person?" lookups.\n\n**Option 1: Query swipes table** — SELECT WHERE swiper_id = me AND swiped_id = candidate. Too slow for filtering 1000s of candidates.\n\n**Option 2: Bloom filter per user** — Store a Bloom filter of all swiped user_ids. O(1) lookup, small memory footprint. False positives (skip a user you haven't seen) are acceptable — better than showing duplicates.\n\n**Option 3: Pre-computed "unseen" queue** — Background job pre-computes a queue of eligible profiles for each active user. Client pulls from the queue. Refill when queue runs low.` },
          { type: 'text', heading: 'Ranking & Fairness', body: `If you always show the most popular profiles first, less popular users never get seen.\n\n**ELO-like scoring:**\n- Each user has a "desirability score" based on right-swipe rate\n- Show users profiles with similar scores (attractive people see attractive people)\n- New users get a temporary boost to collect initial data\n- Inactive users get deprioritized\n\n**Diversity:** Mix in profiles from different score ranges to avoid echo chambers and give everyone visibility.` },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Match Detection',
        subtitle: 'O(1) mutual like detection',
        content: [
          { type: 'text', heading: 'Redis-based Approach', body: `For each user, maintain a Redis SET of user_ids who have liked them.\n\n**When A swipes right on B:**\n1. SISMEMBER likes:{A} B → "Has B already liked A?"\n2. If yes → MATCH! Remove from both sets, create match record\n3. If no → SADD likes:{B} A → "A likes B, waiting for B"\n\nBoth operations are O(1). Redis SETs handle this at 18,500 swipes/sec easily.\n\n**Memory:** 50M users × avg 100 pending likes × 16 bytes (UUID) = ~80GB. Fits in a Redis Cluster.` },
        ],
      },
      {
        type: 'levels', heading: 'What\'s Expected at Each Level',
        levels: [
          { title: 'Mid-level', body: `Should define the API, basic swipe flow, and understand that geospatial queries are needed. Should propose a solution for match detection. Not expected to know the recommendation ranking algorithm.` },
          { title: 'Senior', body: `Should design the full recommendation pipeline with geo filtering, preference filtering, and deduplication. Should use Redis for match detection. Should discuss the "already seen" problem and propose Bloom filters or pre-computed queues.` },
          { title: 'Staff+', body: `Should go deep on the recommendation ranking algorithm (ELO scoring, fairness, cold start for new users). Should discuss how to handle the pre-computation pipeline at scale. May discuss A/B testing the ranking algorithm and measuring match quality metrics.` },
        ],
      },
    ],
  },

  'design-whatsapp': {
    slug: 'design-whatsapp', title: 'Design WhatsApp', subtitle: 'Real-time messaging at scale',
    duration: '40 min', difficulty: 'Hard',
    sections: [
      
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `WhatsApp is a real-time messaging platform handling 100B+ messages per day. The core challenges are maintaining persistent WebSocket connections for 2B users, ensuring message delivery even when recipients are offline, supporting group chats with fan-out, and end-to-end encryption. The interviewer wants to see how you handle the stateful nature of WebSocket connections across a distributed system.`,
    },
    {
        type: 'requirements', heading: 'Understanding the Problem',
        functional: ['1:1 messaging between users', 'Group messaging (up to 256 members)', 'Message delivery receipts — sent, delivered, read', 'Media sharing (images, videos, documents)', 'Online/last seen status'],
        functionalOutOfScope: ['Voice/video calls', 'Status/stories', 'Payment'],
        nonFunctional: ['2B users, 100M DAU', '100B messages/day (~1.15M messages/sec)', 'Low latency — messages delivered in < 100ms when both users online', 'Messages must never be lost (durability)', 'Eventual consistency acceptable — message order within conversation must be preserved'],
        nonFunctionalOutOfScope: ['End-to-end encryption implementation details', 'Spam detection'],
      },
      { type: 'text', heading: 'Scale Estimation', body: `**Messages:** 100B/day ÷ 86,400 = ~1.15M messages/sec\n**Connections:** 100M DAU = 100M concurrent WebSocket connections\n**Storage:** 100B messages × 100 bytes avg = 10TB/day text. Media stored separately in S3.\n**Bandwidth:** 1.15M msg/sec × 100 bytes = 115 MB/sec for text alone` },
      { type: 'text', heading: 'Core Entities', body: `**User** — Profile, phone number, online status, last seen\n**Message** — Content, sender, receiver/group, timestamp, status (sent/delivered/read)\n**Conversation** — 1:1 or group, list of participants, last message\n**Group** — Name, members (max 256), admin` },
      {
        type: 'api', heading: 'API Design',
        description: 'Most communication happens over WebSocket, but REST endpoints for non-real-time operations.',
        endpoints: [
          { method: 'POST', path: '/messages', label: 'Send a message', request: '{\n  conversation_id: string,\n  content: string,\n  media_url?: string,\n  type: "text" | "image" | "video"\n}', response: '{ message_id, timestamp, status: "sent" }' },
          { method: 'GET', path: '/conversations', label: 'List conversations', response: 'Conversation[] with last message preview' },
          { method: 'GET', path: '/conversations/{id}/messages?before={cursor}', label: 'Message history (paginated)' },
          { method: 'POST', path: '/groups', label: 'Create a group', request: '{ name, member_ids[] }' },
          { method: 'PUT', path: '/messages/{id}/status', label: 'Update delivery status', request: '{ status: "delivered" | "read" }' },
        ],
      },
      {
        type: 'schema', heading: 'Data Schema',
        entities: [
          { name: 'messages', note: 'Cassandra — write-heavy, time-series access pattern', fields: [
            { name: 'conversation_id', type: 'UUID', notes: 'Partition key' },
            { name: 'message_id', type: 'TIMEUUID', notes: 'Clustering key (sorted by time)' },
            { name: 'sender_id', type: 'UUID', notes: '' },
            { name: 'content', type: 'TEXT', notes: 'Encrypted' },
            { name: 'type', type: 'ENUM', notes: 'text | image | video' },
            { name: 'media_url', type: 'TEXT', notes: 'S3 URL if media' },
            { name: 'status', type: 'ENUM', notes: 'sent | delivered | read' },
          ]},
          { name: 'conversations', note: 'PostgreSQL or DynamoDB', fields: [
            { name: 'id', type: 'UUID', notes: 'Primary key' },
            { name: 'type', type: 'ENUM', notes: '1:1 | group' },
            { name: 'participant_ids', type: 'UUID[]', notes: '' },
            { name: 'last_message_preview', type: 'TEXT', notes: 'Denormalized' },
            { name: 'last_message_at', type: 'TIMESTAMP', notes: 'Indexed for sorting' },
          ]},
        ],
      },
      { type: 'text', heading: 'High-Level Design', body: `The architecture centers around stateful Chat Servers that maintain WebSocket connections. The key challenge is routing: when User A sends a message to User B, A's Chat Server needs to know which Chat Server B is connected to. A Redis session store maps user_id → chat_server_id for this purpose.` },
      {
        type: 'architecture', heading: 'WhatsApp Messaging Architecture',
        caption: 'WebSocket connections on Chat Servers, Redis for session routing, Cassandra for message persistence.',
        config: {
          width: 850, height: 440,
          nodes: [
            { id: 'sender', label: 'Sender', icon: '📱', color: 'blue', x: 20, y: 60, w: 100, h: 56 },
            { id: 'receiver', label: 'Receiver', icon: '📱', color: 'blue', x: 20, y: 300, w: 100, h: 56 },
            { id: 'chat1', label: 'Chat Server 1', sublabel: 'WebSocket ×N', color: 'green', x: 200, y: 60, w: 140, h: 56 },
            { id: 'chat2', label: 'Chat Server 2', sublabel: 'WebSocket ×N', color: 'green', x: 200, y: 300, w: 140, h: 56 },
            { id: 'session', label: 'Session Store', sublabel: 'Redis — user→server', icon: '⚡', color: 'red', x: 430, y: 60, w: 140, h: 56 },
            { id: 'msgdb', label: 'Message DB', sublabel: 'Cassandra', icon: '🗄️', color: 'blue', x: 430, y: 180, w: 140, h: 56 },
            { id: 'pending', label: 'Pending Queue', sublabel: 'Kafka / Redis', icon: '📨', color: 'yellow', x: 430, y: 300, w: 140, h: 56 },
            { id: 's3', label: 'S3 + CDN', sublabel: 'Media files', icon: '📦', color: 'orange', x: 650, y: 60, w: 120, h: 56 },
            { id: 'push', label: 'Push Notification', sublabel: 'FCM / APNs', icon: '🔔', color: 'purple', x: 650, y: 300, w: 120, h: 56 },
          ],
          edges: [
            { from: 'sender', to: 'chat1', label: 'WebSocket' },
            { from: 'receiver', to: 'chat2', label: 'WebSocket' },
            { from: 'chat1', to: 'session', label: '1. lookup receiver', color: 'accent' },
            { from: 'chat1', to: 'msgdb', label: '2. persist message' },
            { from: 'chat1', to: 'chat2', label: '3. route to receiver', color: 'accent' },
            { from: 'chat1', to: 'pending', label: 'if offline', dashed: true },
            { from: 'pending', to: 'chat2', label: 'on reconnect', dashed: true },
            { from: 'chat2', to: 'push', label: 'if app backgrounded' },
            { from: 'chat1', to: 's3', label: 'media upload' },
          ],
        },
      },
      {
        type: 'text', heading: 'Message Flow — Both Users Online',
        body: `1. Sender types a message and sends it via WebSocket to Chat Server 1 (the server they are connected to).\n\n2. Chat Server 1 writes the message to Cassandra (partitioned by conversation_id, clustered by timestamp). This ensures durability — the message is persisted before any delivery attempt.\n\n3. Chat Server 1 looks up the recipient's connected Chat Server in the Redis session store: GET session:{recipient_id} → "chat-server-2".\n\n4. Chat Server 1 routes the message to Chat Server 2 (via internal gRPC or message bus).\n\n5. Chat Server 2 pushes the message to the recipient via their WebSocket connection.\n\n6. The recipient's device sends a "delivered" acknowledgment back through the same path. The sender sees the double checkmark.\n\n**When the recipient is offline:** Step 3 finds no session entry. The message goes to the Pending Queue (Kafka or Redis list). When the recipient reconnects, their Chat Server drains the pending queue and delivers all missed messages in order. A push notification (FCM/APNs) is also sent to wake the app.`,
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Message Delivery & Receipts',
        subtitle: 'The three ticks — sent, delivered, read',
        content: [
          { type: 'text', heading: 'Delivery Receipt Flow', body: `**✓ Sent** — Server received and persisted the message. Server sends ack to sender immediately after DB write.\n\n**✓✓ Delivered** — Recipient's device received the message. Recipient's device sends a "delivered" status update back to server. Server forwards to sender.\n\n**✓✓ (blue) Read** — Recipient opened the conversation. Recipient's app sends "read" status when the conversation is opened. Server forwards to sender.\n\nEach status update is a lightweight message sent over the same WebSocket connection.` },
          { type: 'text', heading: 'Handling Offline Delivery', body: `When a user comes online:\n1. Device connects via WebSocket\n2. Server checks pending messages queue\n3. Delivers all pending messages in order\n4. For each delivered message, sends "delivered" receipt to original sender\n5. Clears pending queue\n\n**What if the server crashes before delivery?**\nPending messages are in Kafka/Redis with persistence. On server restart, pending messages are still there. Use consumer groups so another server can pick up.` },
          { type: 'callout', variant: 'tip', heading: 'Message Ordering', body: 'Messages within a conversation must be ordered. Use TIMEUUID as the clustering key in Cassandra — messages are automatically sorted by time within each conversation partition.' },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Group Messaging',
        subtitle: 'Fan-out to up to 256 members',
        content: [
          { type: 'text', heading: 'Fan-out on Write', body: `When a user sends a message to a group:\n1. Write message to the group's conversation in Cassandra (one write)\n2. For each group member: check if online → push via WebSocket\n3. For offline members: add to their pending queue\n\nWith max 256 members, fan-out is manageable. This is NOT the celebrity problem.` },
          { type: 'text', heading: 'Optimization: Don\'t Store Per-User Copies', body: `Store one copy of the message in the group conversation. Each member reads from the same partition.\n\nFor "unread count" per user: maintain a per-user pointer (last_read_message_id) in a separate table. Unread count = messages after that pointer.` },
        ],
      },
      {
        type: 'levels', heading: 'What\'s Expected at Each Level',
        levels: [
          { title: 'Mid-level', body: `Should define the API, basic schema, and understand that WebSocket is needed for real-time. Should design the basic message flow for online users. Not expected to know Cassandra specifics, but should reason about why a write-heavy DB is needed.` },
          { title: 'Senior', body: `Should proactively design the offline delivery mechanism, delivery receipts, and group messaging. Should choose Cassandra with clear reasoning. Should design the session service for routing messages between chat servers. Should discuss message ordering guarantees.` },
          { title: 'Staff+', body: `Should go deep on exactly-once delivery semantics, handling network partitions, and message ordering across multiple chat servers. Should discuss end-to-end encryption at a high level (Signal Protocol). May discuss how to handle "last seen" efficiently at scale.` },
        ],
      },
    ],
  },

  'design-youtube': {
    slug: 'design-youtube', title: 'Design YouTube', subtitle: 'Video upload, processing, and streaming at scale',
    duration: '45 min', difficulty: 'Hard',
    sections: [
      
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `YouTube handles 500+ hours of video uploaded every minute and serves 1B+ hours of video watched per day. The key challenges are the video processing pipeline (transcoding to multiple resolutions), efficient streaming via CDN, and the recommendation engine. Unlike text-based systems, video involves massive binary data — a single 10-minute 1080p video is ~1GB. Your architecture must handle this without your servers becoming the bottleneck.`,
    },
    {
        type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Upload videos (up to 256GB)', 'Stream videos with adaptive quality', 'Search videos by title, description, tags', 'View count, likes, comments', 'Subscribe to channels'],
        functionalOutOfScope: ['Live streaming', 'Shorts/reels', 'Monetization/ads'],
        nonFunctional: ['2B users, 500M DAU', '500 hours of video uploaded per minute', '1B hours watched per day', 'Low latency streaming globally (<200ms start time)', 'High availability — video playback must never fail'],
        nonFunctionalOutOfScope: ['Content moderation', 'Copyright detection'],
      },
      { type: 'text', heading: 'Scale Estimation', body: `**Upload:** 500 hours/min = 8.3 hours/sec. At ~1GB/hour raw = 8.3 GB/sec upload bandwidth.\n**Storage:** 500 hours/min × 60 × 24 = 720K hours/day. Multiple resolutions (360p, 720p, 1080p, 4K) = ~3-5 PB/day.\n**Streaming:** 1B hours/day ÷ 86,400 = 11,574 hours/sec. At ~500MB/hour (720p) = 5.8 TB/sec bandwidth.\n**Metadata:** 500M DAU × 20 video views = 10B metadata reads/day.` },
      { type: 'text', heading: 'Core Entities', body: `**Video** — Raw file + processed versions at multiple resolutions\n**VideoMetadata** — Title, description, tags, uploader, view count, duration, thumbnail URLs\n**User** — Profile, subscriptions, watch history\n**Comment** — Text, author, video, timestamp, likes` },
      {
        type: 'api', heading: 'API Design',
        endpoints: [
          { method: 'POST', path: '/videos/upload-url', label: 'Get pre-signed upload URL', response: '{ upload_url, video_id }', note: 'Client uploads directly to S3, not through our servers' },
          { method: 'POST', path: '/videos/{id}/metadata', label: 'Set video metadata', request: '{ title, description, tags, visibility }' },
          { method: 'GET', path: '/videos/{id}', label: 'Get video metadata + stream URLs', response: '{ metadata, stream_urls: { 360p, 720p, 1080p } }' },
          { method: 'GET', path: '/videos/{id}/stream/{quality}', label: 'Get HLS/DASH manifest', response: 'M3U8 playlist with segment URLs' },
          { method: 'GET', path: '/search?q=&page=', label: 'Search videos', response: 'VideoMetadata[]' },
          { method: 'POST', path: '/videos/{id}/views', label: 'Record a view' },
        ],
      },
      { type: 'text', heading: 'High-Level Design', body: `**Upload path:**\n1. Client requests pre-signed S3 URL\n2. Client uploads raw video directly to S3\n3. S3 triggers event → message to Kafka "video uploaded"\n4. **Transcoding Service** picks up: converts to 360p, 720p, 1080p, 4K\n5. **Thumbnail Service** extracts frames, generates thumbnails\n6. Processed videos pushed to CDN origin\n7. Metadata updated: status = "ready", stream URLs populated\n8. User notified: "Your video is ready"\n\n**Streaming path:**\n1. Client requests video → gets HLS/DASH manifest URL\n2. Manifest lists all segments at all quality levels\n3. Client player downloads segments from CDN\n4. Player monitors bandwidth, switches quality adaptively\n5. CDN serves from edge node (cache hit) or fetches from origin (cache miss)` },
      {
        type: 'deepdive', heading: 'Deep Dive: Video Processing Pipeline',
        subtitle: 'The most compute-intensive part of the system',
        content: [
          { type: 'text', heading: 'Transcoding', body: `Raw video must be converted to multiple formats and resolutions.\n\n**Why multiple resolutions?** Users on 4G get 360p, WiFi gets 1080p. Adaptive bitrate streaming switches quality mid-stream based on bandwidth.\n\n**Pipeline:**\nRaw video → Split into segments (10 sec each) → Transcode each segment in parallel → Reassemble per quality level → Generate HLS/DASH manifests\n\n**Parallelism:** A 1-hour video = 360 segments. Each segment transcoded independently across a fleet of workers. Total transcode time: ~5-10 minutes instead of hours.\n\n**Tools:** FFmpeg for transcoding, Kafka for job queue, S3 for storage at each stage.` },
          { type: 'text', heading: 'Adaptive Bitrate Streaming (ABR)', body: `**HLS (HTTP Live Streaming):**\n- Video split into 2-10 second segments (.ts files)\n- Master playlist (.m3u8) lists all quality levels\n- Quality-specific playlists list segments for that quality\n- Client downloads master playlist → picks quality → downloads segments sequentially\n- If bandwidth drops, client switches to lower quality playlist\n\n**Why segments?** Small files cache well in CDN. Client can start playing after downloading just 1 segment (low startup latency). Quality switching happens at segment boundaries — seamless to user.` },
          { type: 'callout', variant: 'info', heading: 'CDN Cost Optimization', body: 'CDN is the biggest cost. Popular videos (top 20%) get 80% of views — cache them aggressively at edge. Long-tail videos: serve from regional CDN or origin. Use tiered caching: edge → regional → origin.' },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: View Counting at Scale',
        subtitle: 'Counting billions of views accurately without killing the DB',
        content: [
          { type: 'text', heading: 'The Problem', body: `A viral video gets millions of views per hour. You can't UPDATE view_count = view_count + 1 on every view — the DB row becomes a hot key.\n\n**Solution: Async counting**\n1. On each view: publish event to Kafka topic "video-views"\n2. Consumer aggregates views in memory (batch of 1000 or every 5 seconds)\n3. Batch UPDATE to DB: view_count = view_count + 1000\n4. For real-time display: use Redis counter (INCR), sync to DB periodically\n\nThis reduces DB writes from millions/hour to thousands/hour.` },
          { type: 'text', heading: 'Deduplication', body: `Same user refreshing the page shouldn't count as multiple views.\n\n**Approach:** For each view event, check if (user_id, video_id) was seen in the last N minutes. Use a Bloom filter or Redis SET with TTL. Not perfectly accurate, but good enough — YouTube's view count is approximate anyway.` },
        ],
      },
      {
        type: 'levels', heading: 'What\'s Expected at Each Level',
        levels: [
          { title: 'Mid-level', body: `Should define the upload and streaming paths at a high level. Should understand why CDN is critical. Should know that videos need to be transcoded to multiple resolutions. Not expected to know HLS/DASH details.` },
          { title: 'Senior', body: `Should design the full transcoding pipeline with Kafka. Should explain adaptive bitrate streaming. Should discuss CDN caching strategy and cost optimization. Should handle the view counting problem.` },
          { title: 'Staff+', body: `Should go deep on the transcoding pipeline parallelism, segment-level processing, and fault tolerance (what if a transcode worker dies mid-segment). Should discuss CDN tiered caching, origin shielding, and cache warming for viral videos. May discuss the recommendation system at a high level.` },
        ],
      },
    ],
  },

  'design-uber': {
    slug: 'design-uber', title: 'Design Uber', subtitle: 'Real-time ride matching and location tracking',
    duration: '50 min', difficulty: 'Hard',
    sections: [
      {
        type: 'text', heading: 'Understanding the Problem',
        body: `Uber is a ride-sharing platform that connects passengers with nearby drivers. Users open the app, enter a destination, see a fare estimate, and request a ride. The system finds a nearby available driver, the driver accepts, picks up the rider, and completes the trip.\n\nWhat makes this a challenging system design problem is the real-time nature of everything. Drivers are constantly moving — their locations change every few seconds. When a rider requests a ride, the system needs to find the best available driver within seconds, not minutes. And during the ride, both the rider and driver need to see live location updates.\n\nThe numbers are what make it hard: 10 million active drivers sending GPS updates every 4 seconds means 2.5 million location writes per second. No traditional database can handle that. This is where the interesting design decisions happen.`,
      },
      {
        type: 'requirements', heading: 'Requirements',
        functional: [
          'Riders should be able to enter a destination and get a fare estimate',
          'Riders should be able to request a ride based on the estimated fare',
          'The system should match riders with a nearby, available driver',
          'Drivers should be able to accept or decline ride requests',
          'Both rider and driver should see live location during the ride',
        ],
        functionalOutOfScope: ['Driver onboarding and background checks', 'Ride scheduling in advance', 'Ride sharing / carpooling', 'Driver and rider ratings'],
        nonFunctional: [
          'Match rider to driver in under 1 minute (ideally < 10 seconds)',
          'Strong consistency in matching — a driver cannot be assigned to two rides simultaneously',
          'Handle 2.5M location updates per second (10M drivers × 1 update/4 sec)',
          'Handle traffic spikes during events (100K requests from the same area)',
          'High availability — ride requests must never fail',
        ],
        nonFunctionalOutOfScope: ['Fraud detection', 'GDPR compliance details'],
      },
      {
        type: 'text', heading: 'Scale Estimation',
        body: `Before designing anything, let us understand the scale we are dealing with.\n\n**Location updates:** 10M active drivers, each sending GPS coordinates every 4 seconds = 2.5M writes/sec. This is the hardest scaling challenge in the entire system.\n\n**Ride requests:** 10M rides/day ÷ 86,400 = ~116 rides/sec. This is surprisingly low — a single server could handle this.\n\n**Storage:** Driver locations are ephemeral — we only care about the current position, not history. Ride records: 10M/day × 1KB = 10GB/day, very manageable.\n\nThe key insight: the bottleneck is not ride requests (116/sec) — it is location updates (2.5M/sec). Your design must handle this write throughput while still supporting fast geospatial queries ("find drivers within 3km").`,
      },
      {
        type: 'text', heading: 'Core Entities',
        body: `Let us identify the key entities before designing APIs. Keep it simple — you can always add fields later.\n\n**Rider** — The person requesting a ride. Has a profile, payment method, and current location.\n\n**Driver** — The person providing the ride. Has a profile, vehicle info, current GPS location, and an availability status (available / on-trip / offline).\n\n**Fare** — An estimated price for a trip. Created when the rider enters a destination. Contains pickup location, destination, estimated price, and ETA.\n\n**Ride** — Represents the full lifecycle of a trip, from request to completion. Links a rider to a driver, tracks status (matching → accepted → in-progress → completed), and records the actual fare.\n\n**Location** — A driver's GPS coordinates at a point in time. Stored ephemerally — we only need the latest position.`,
      },
      {
        type: 'api', heading: 'API Design',
        description: 'One endpoint per functional requirement. Notice that driver location updates are the highest-frequency call.',
        endpoints: [
          { method: 'POST', path: '/fares', label: 'Get fare estimate', request: '{\n  pickup: { lat, lng },\n  destination: { lat, lng }\n}', response: '{ fare_id, estimated_price, eta }', note: 'Creates a Fare record. Uses a mapping API (Google Maps) to calculate distance and ETA.' },
          { method: 'POST', path: '/rides', label: 'Request a ride', request: '{ fare_id }', response: '{ ride_id, status: "matching" }', note: 'Triggers the matching flow. Rider waits for a driver to accept.' },
          { method: 'PATCH', path: '/rides/{id}', label: 'Driver accepts/declines', request: '{ action: "accept" | "decline" }', note: 'On accept: ride status → "accepted", driver navigates to pickup.' },
          { method: 'POST', path: '/drivers/location', label: 'Update driver location', request: '{ lat, lng }', note: 'Called every 4 seconds by the driver app. Driver ID from auth token, not request body (security).' },
          { method: 'GET', path: '/rides/{id}', label: 'Get ride status + live location', response: '{ status, driver_location, eta }' },
        ],
      },
      {
        type: 'callout', variant: 'warning', heading: 'Security: Never Trust the Client',
        body: `Notice that the driver location endpoint takes lat/lng in the body but the driver ID comes from the auth token (JWT/session). Never pass user IDs, timestamps, or fare amounts from the client — they can be manipulated. The server should always derive these from the authenticated session or database.`,
      },
      {
        type: 'text', heading: 'Building the Design — Step by Step',
        body: `Instead of showing one big architecture diagram, let us build the system incrementally, one requirement at a time. This is exactly how you should approach it in an interview — start simple and add complexity as needed.`,
      },
      {
        type: 'text', heading: 'Step 1: Fare Estimation',
        body: `The simplest flow. The rider enters a destination, and we return a price estimate.\n\nWe need three components: a Rider Client (mobile app), an API Gateway (handles auth, rate limiting, routing), and a Ride Service (calculates the fare using a third-party mapping API like Google Maps).\n\nThe flow is straightforward:\n1. Rider enters pickup and destination in the app\n2. App sends POST /fares to the API Gateway\n3. Gateway authenticates and forwards to the Ride Service\n4. Ride Service calls Google Maps API to get distance and travel time\n5. Ride Service applies the pricing model (base fare + per-km + per-minute + surge multiplier)\n6. Ride Service creates a Fare record in the database and returns it to the rider\n\nAt this point, our architecture is just: Client → API Gateway → Ride Service → Database. Simple.`,
      },
      {
        type: 'text', heading: 'Step 2: Requesting a Ride and Matching with a Driver',
        body: `Now the rider confirms the fare and requests a ride. This is where it gets interesting — we need to find a nearby available driver.\n\nWe need two new components: a Location Service (knows where every driver is) and a Matching Service (finds the best driver for a ride).\n\nBut before we can match, we need to know where drivers are. This means drivers must be continuously sending their GPS coordinates to our system. The Driver Client app calls POST /drivers/location every 4 seconds. The Location Service receives these updates and stores them.\n\nThe matching flow:\n1. Rider confirms fare → POST /rides with the fare_id\n2. Ride Service creates a Ride record (status: MATCHING) and asks the Matching Service to find a driver\n3. Matching Service asks the Location Service: "give me available drivers within 3km of this pickup location"\n4. Location Service queries its geospatial index and returns a ranked list of nearby drivers\n5. Matching Service sends a push notification to the top driver\n6. Driver has 15 seconds to accept or decline\n7. If accepted → ride status changes to ACCEPTED, rider is notified\n8. If declined or timeout → try the next driver on the list`,
      },
      {
        type: 'architecture', heading: 'Uber System Architecture',
        caption: 'Progressive design: Ride Service for fare/ride lifecycle, Location Service for driver GPS, Matching Service for pairing.',
        config: {
          width: 850, height: 480,
          nodes: [
            { id: 'rider', label: 'Rider App', icon: '📱', color: 'blue', x: 20, y: 60, w: 100, h: 56 },
            { id: 'driver', label: 'Driver App', icon: '🚗', color: 'green', x: 20, y: 300, w: 100, h: 56 },
            { id: 'gateway', label: 'API Gateway', sublabel: 'Auth + rate limit', color: 'cyan', x: 180, y: 160, w: 130, h: 56 },
            { id: 'ride-svc', label: 'Ride Service', sublabel: 'Fare + ride lifecycle', color: 'orange', x: 380, y: 60, w: 140, h: 56 },
            { id: 'match-svc', label: 'Matching Service', sublabel: 'Find best driver', color: 'purple', x: 380, y: 180, w: 140, h: 56 },
            { id: 'loc-svc', label: 'Location Service', sublabel: '2.5M updates/sec', color: 'red', x: 380, y: 300, w: 140, h: 56 },
            { id: 'redis', label: 'Redis Geo', sublabel: 'Driver locations', icon: '⚡', color: 'red', x: 600, y: 300, w: 120, h: 56 },
            { id: 'db', label: 'PostgreSQL', sublabel: 'Rides, fares, users', icon: '🗄️', color: 'blue', x: 600, y: 60, w: 120, h: 56 },
            { id: 'maps', label: 'Maps API', sublabel: 'Google Maps', icon: '🗺️', color: 'cyan', x: 600, y: 160, w: 120, h: 56 },
            { id: 'notif', label: 'Push Notifications', sublabel: 'FCM / APNs', icon: '🔔', color: 'yellow', x: 180, y: 380, w: 130, h: 56 },
          ],
          edges: [
            { from: 'rider', to: 'gateway', label: 'request ride' },
            { from: 'driver', to: 'gateway', label: 'location updates' },
            { from: 'gateway', to: 'ride-svc', label: 'fare + ride ops' },
            { from: 'gateway', to: 'loc-svc', label: 'GPS updates' },
            { from: 'ride-svc', to: 'match-svc', label: 'find driver', color: 'accent' },
            { from: 'match-svc', to: 'loc-svc', label: 'nearby drivers', color: 'accent' },
            { from: 'loc-svc', to: 'redis', label: 'GEOADD / GEORADIUS' },
            { from: 'ride-svc', to: 'db', label: 'rides + fares' },
            { from: 'ride-svc', to: 'maps', label: 'distance + ETA' },
            { from: 'match-svc', to: 'notif', label: 'notify driver' },
          ],
        },
      },
      {
        type: 'text', heading: 'Step 3: Live Tracking During the Ride',
        body: `Once the driver accepts, both the rider and driver need to see live location updates.\n\nThe driver app continues sending GPS updates every 4 seconds to the Location Service. The rider app can either poll GET /rides/{id} every 5 seconds to get the latest driver location, or we can use WebSocket/SSE for real-time push.\n\nFor an MVP, polling every 5 seconds is fine — the rider does not need millisecond-accurate tracking. For a production system, WebSocket gives a smoother experience.\n\nThe ETA is recalculated on each location update using the Maps API. When the driver arrives at the pickup, the ride status changes to IN_PROGRESS. When they arrive at the destination, it changes to COMPLETED and the final fare is calculated.`,
      },
      {
        type: 'deepdive', heading: 'Deep Dive: How Do We Handle 2.5M Location Updates Per Second?',
        subtitle: 'This is the hardest scaling challenge in the system — and the most common interview follow-up.',
        content: [
          { type: 'text', heading: 'Why Traditional Databases Fail', body: `10M drivers sending GPS coordinates every 4 seconds = 2.5M writes/sec. PostgreSQL maxes out at ~50K writes/sec on a single instance. Even DynamoDB at on-demand pricing would cost $200K+ per day for this write volume.\n\nWe need an in-memory store that can handle millions of writes per second and also supports geospatial queries. Redis is the answer.` },
          { type: 'text', heading: 'Redis Geospatial Commands', body: `Redis has built-in geospatial support:\n\n**GEOADD** drivers {longitude} {latitude} {driver_id} — Store or update a driver's location. O(log N).\n\n**GEORADIUS** drivers {longitude} {latitude} 3 km — Find all drivers within 3km of a point. Returns results sorted by distance.\n\nBoth operations are in-memory and extremely fast. A single Redis instance handles ~100K geo operations/sec. With a Redis Cluster sharded by geographic region, we can handle 2.5M/sec.\n\nInternally, Redis uses geohashing — it converts lat/lng into a single integer that preserves spatial locality. Nearby locations have similar geohash values, making range queries efficient.` },
          { type: 'text', heading: 'Sharding by Geographic Region', body: `A single Redis instance cannot hold all 10M drivers globally. We shard by city or region:\n\n- Redis cluster for New York handles NYC drivers only\n- Redis cluster for London handles London drivers only\n- Redis cluster for Mumbai handles Mumbai drivers only\n\nThe Location Service routes each update to the correct cluster based on the driver's coordinates. This also makes GEORADIUS faster — fewer entries per cluster means faster queries.\n\nFor cities that span multiple regions (like Los Angeles), use overlapping geohash cells at the boundaries so drivers near the edge are visible from both clusters.` },
          { type: 'text', heading: 'Reducing Update Frequency', body: `Do we really need updates every 4 seconds? Not always.\n\nThe driver app can be smart about when to send updates:\n- **Stationary:** If the driver has not moved more than 10 meters, skip the update\n- **On a highway:** GPS is stable, reduce to every 10 seconds\n- **In a city:** Keep at 4 seconds for accuracy\n- **Offline/parked:** Stop sending entirely\n\nThis client-side optimization can reduce write volume by 30-50% without affecting accuracy. Do not neglect the client in your design — many candidates draw a small client box and move on, but client-side logic is critical for efficiency.` },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: How Do We Prevent a Driver from Being Assigned Two Rides?',
        subtitle: 'Strong consistency in matching — the Ticketmaster problem for rides.',
        content: [
          { type: 'text', heading: 'The Problem', body: `Two ride requests come in simultaneously, both near the same driver. Without locking, both Matching Service instances could assign the same driver to both rides. The driver gets two notifications and chaos ensues.\n\nThis is the same problem as double-booking a seat in Ticketmaster — we need a distributed lock.` },
          { type: 'text', heading: 'Solution: Redis Lock per Driver', body: `When the Matching Service wants to assign a driver, it first acquires a lock:\n\n\`\`\`\nSETNX driver_lock:{driver_id} {ride_id} EX 30\n\`\`\`\n\nIf SETNX returns 1 (success) — this driver is now reserved for this ride. Send the notification.\nIf SETNX returns 0 (key exists) — another ride already claimed this driver. Skip to the next candidate.\n\nThe 30-second TTL ensures the lock auto-releases if the driver does not respond. When the driver accepts, the lock is extended. When they decline or timeout, the lock is deleted and the driver becomes available for other rides.\n\nThis is the same SETNX pattern we used in Ticketmaster for seat holds — it works perfectly for any "reserve a scarce resource temporarily" problem.` },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Surge Pricing',
        subtitle: 'Dynamic pricing based on supply and demand',
        content: [
          { type: 'text', heading: 'How It Works', body: `Every 2 minutes, a background job calculates the surge multiplier for each geographic cell:\n\n1. Count ride requests in the cell in the last 5 minutes (demand)\n2. Count available drivers in the cell (supply)\n3. surge_multiplier = demand / supply, capped at 3x-5x\n\nIf surge > 1.0, the rider sees the multiplier before confirming: "Prices are 2.3x higher due to high demand."\n\nSurge pricing serves two purposes: it attracts more drivers to high-demand areas (they earn more), and it reduces demand (some riders wait or take alternatives). The market balances itself.\n\nSurge multipliers are stored in Redis with a 2-minute TTL, keyed by geohash cell. The Fare Service reads the surge for the rider's pickup location when calculating the estimate.` },
        ],
      },
      {
        type: 'levels', heading: 'What Interviewers Expect at Each Level',
        levels: [
          { title: 'Mid-level', body: `Should define the API endpoints and core entities clearly. Should design the basic ride request flow — rider requests, system finds a nearby driver, driver accepts. Should understand that geospatial queries are needed and propose Redis or a geo-capable database. Not expected to know geohashing details, but should reason about why a traditional database cannot handle 2.5M writes/sec when asked.` },
          { title: 'Senior', body: `Should build the design progressively, explaining each component as it is added. Should design the full matching flow with ETA-based ranking (not just closest driver). Should explain Redis Geospatial and why it is chosen over PostGIS for this workload. Should discuss sharding by region and the driver locking problem (SETNX). Should handle at least 2 deep dives in detail.` },
          { title: 'Staff+', body: `Should proactively identify all the hard problems (location write throughput, driver locking, surge pricing, what happens when a driver goes offline mid-match) without being prompted. Should discuss batch dispatch optimization (collecting requests in a 2-second window and solving the bipartite matching problem for globally optimal assignments). Should discuss client-side optimizations for reducing location update frequency. May discuss ETA prediction using ML models with live traffic data, and multi-region deployment for a global service.` },
        ],
      },
    ],
  },

  'design-web-crawler': {
    slug: 'design-web-crawler', title: 'Design a Web Crawler', subtitle: 'Systematically browse and index the web',
    duration: '35 min', difficulty: 'Hard',
    sections: [
      
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `A web crawler systematically browses the internet, downloading pages and extracting links to discover new pages. Google's crawler indexes billions of pages. The challenges are scale (billions of URLs), politeness (not overwhelming any single website), deduplication (not crawling the same page twice), and prioritization (crawling important pages first). This question tests your ability to design a distributed pipeline.`,
    },
    {
        type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Start from a set of seed URLs', 'Download web pages and extract content', 'Extract links from pages and add to crawl queue', 'Store page content for indexing', 'Revisit pages periodically to detect changes'],
        functionalOutOfScope: ['Rendering JavaScript (headless browser)', 'Full-text search indexing', 'PageRank computation'],
        nonFunctional: ['Crawl 1B pages per month (~400 pages/sec)', 'Politeness — don\'t overwhelm any single server', 'Handle duplicate URLs and content', 'Distributed and fault-tolerant', 'Respect robots.txt'],
      },
      { type: 'text', heading: 'Scale Estimation', body: `**Crawl rate:** 1B pages/month ÷ 30 ÷ 86,400 = ~400 pages/sec\n**Storage:** Average page = 100KB HTML. 1B × 100KB = 100TB/month.\n**URLs discovered:** Each page has ~50 links. 1B × 50 = 50B URLs to process (most are duplicates).\n**Bandwidth:** 400 pages/sec × 100KB = 40 MB/sec download bandwidth.` },
      { type: 'text', heading: 'Core Entities', body: `**URL** — The address to crawl, with priority and last-crawled timestamp\n**Page** — Downloaded HTML content, metadata, extracted links\n**Domain** — Rate limit tracking per domain (politeness)` },
      {
        type: 'api', heading: 'System Interface',
        description: 'A web crawler is not a user-facing API — it\'s an internal system. But it has clear interfaces between components.',
        endpoints: [
          { method: 'INTERNAL', path: 'URL Frontier → Fetcher', label: 'Dequeue next URL to crawl', response: '{ url, priority, domain }' },
          { method: 'INTERNAL', path: 'Fetcher → Parser', label: 'Downloaded page', response: '{ url, html, status_code, headers }' },
          { method: 'INTERNAL', path: 'Parser → URL Frontier', label: 'Extracted links', response: 'URL[] (new URLs to crawl)' },
          { method: 'INTERNAL', path: 'Parser → Storage', label: 'Store page content', request: '{ url, content, metadata }' },
        ],
      },
      { type: 'text', heading: 'High-Level Design', body: `**Crawl loop:**\n1. **URL Frontier** (priority queue) dequeues the next URL\n2. **Politeness checker** ensures we're not hitting this domain too fast\n3. **Fetcher** downloads the page (HTTP GET with timeout)\n4. **Parser** extracts text content + all links from HTML\n5. **URL deduplicator** (Bloom filter) checks if each extracted URL was already crawled\n6. New URLs added to URL Frontier with priority\n7. Page content stored in object storage (S3) for indexing\n8. Metadata stored in DB (URL, crawl time, content hash)\n\n**Key components:**\n- **URL Frontier** — Redis sorted set (priority queue). Priority based on PageRank, freshness, domain importance.\n- **Fetcher workers** — Distributed fleet of workers. Each worker handles one domain at a time (politeness).\n- **Bloom filter** — Checks if URL was already seen. 50B URLs × 10 bits/element = ~60GB. Distributed across nodes.\n- **robots.txt cache** — Cache robots.txt per domain in Redis. Respect Crawl-Delay directive.` },
      {
        type: 'deepdive', heading: 'Deep Dive: URL Frontier & Prioritization',
        subtitle: 'Not all URLs are equal — crawl important pages first',
        content: [
          { type: 'text', heading: 'Priority Queue Design', body: `The URL Frontier is a priority queue with two dimensions:\n\n**1. Priority (what to crawl):**\n- PageRank or domain authority\n- Freshness — pages that change frequently get higher priority\n- Depth — pages closer to the homepage are usually more important\n\n**2. Politeness (when to crawl):**\n- Per-domain rate limit (max 1 request/second per domain)\n- Separate queue per domain\n- Worker picks from the domain queue whose "next allowed crawl time" has passed\n\n**Implementation:** Two-level queue system.\n- Front queue: prioritized by importance (multiple priority levels)\n- Back queue: one queue per domain, rate-limited\n- Selector picks from back queues in round-robin, respecting rate limits` },
          { type: 'text', heading: 'Handling Spider Traps', body: `Some sites generate infinite URLs:\n- Calendars: /calendar/2024/01/01, /calendar/2024/01/02, ...\n- Session IDs in URLs: /page?sid=abc123, /page?sid=def456\n- Infinite pagination: /page/1, /page/2, ... /page/999999\n\n**Defenses:**\n- URL depth limit (max 15 levels deep from seed)\n- Per-domain page limit (max 10,000 pages per domain)\n- URL pattern detection (regex to identify calendar/session patterns)\n- Content hash deduplication (same content = stop crawling that pattern)` },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Distributed Crawling',
        subtitle: 'Scaling to 400 pages/sec across multiple machines',
        content: [
          { type: 'text', heading: 'Partitioning by Domain', body: `Assign each domain to a specific crawler node using consistent hashing.\n\n**Benefits:**\n- Each node handles politeness for its assigned domains\n- No coordination needed for rate limiting\n- robots.txt cached locally per node\n\n**Failure handling:** If a node dies, its domains are reassigned to other nodes via consistent hashing. URLs in its queue are re-enqueued.` },
          { type: 'callout', variant: 'info', heading: 'DNS Resolution Caching', body: 'DNS lookups add 10-100ms per request. Cache DNS results locally with TTL. For 1B pages across millions of domains, DNS caching saves enormous time.' },
        ],
      },
      {
        type: 'levels', heading: 'What\'s Expected at Each Level',
        levels: [
          { title: 'Mid-level', body: `Should describe the basic crawl loop (fetch → parse → extract links → store). Should understand why a priority queue is needed and why politeness matters. Should mention Bloom filters for deduplication.` },
          { title: 'Senior', body: `Should design the two-level URL Frontier with priority and politeness queues. Should discuss distributed crawling with domain-based partitioning. Should handle spider traps and content deduplication.` },
          { title: 'Staff+', body: `Should go deep on the URL prioritization algorithm, incremental crawling (detecting page changes via content hashing), and handling JavaScript-rendered pages. Should discuss how to scale to 10B pages/month and the storage/bandwidth implications.` },
        ],
      },
    ],
  },

  'design-instagram': {
    slug: 'design-instagram', title: 'Design Instagram', subtitle: 'Photo sharing with feed, stories, and explore',
    duration: '40 min', difficulty: 'Medium',
    sections: [
      
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `Instagram is a photo and video sharing platform with a personalized feed, stories, and explore page. It combines elements of several other system design problems: media upload and storage (like Dropbox), a personalized feed (like Facebook), and real-time notifications. The key insight is that photos are stored in object storage (S3) with CDN delivery, while the feed is a separate system that references photo metadata.`,
    },
    {
        type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Upload photos and short videos', 'Follow/unfollow users', 'View a personalized feed of posts from followed users', 'Like and comment on posts', 'Explore/discover page with trending content'],
        functionalOutOfScope: ['Stories (24-hour expiry)', 'Reels', 'Direct messaging', 'Shopping'],
        nonFunctional: ['2B users, 500M DAU', '100M photos uploaded per day', 'Feed load time < 2 seconds (p99)', 'High availability — feed must always load', 'Average user follows 200 accounts'],
        nonFunctionalOutOfScope: ['Content moderation', 'Ad serving'],
      },
      { type: 'text', heading: 'Scale Estimation', body: `**Uploads:** 100M photos/day ÷ 86,400 = ~1,160 uploads/sec\n**Photo size:** Average 2MB raw → 200KB after compression + multiple sizes\n**Storage:** 100M × 200KB × 4 sizes = 80TB/day for photos alone\n**Feed reads:** 500M DAU × 5 feed loads/day = 2.5B feed loads/day = 29,000/sec\n**Fan-out:** 1,160 posts/sec × 200 avg followers = 232,000 feed writes/sec` },
      { type: 'text', heading: 'Core Entities', body: `**User** — Profile, bio, follower/following counts\n**Post** — Photo/video URL, caption, author, like count, comment count, timestamp\n**Follow** — Directed relationship (follower → followee)\n**Like** — User + Post\n**Comment** — User + Post + text` },
      {
        type: 'api', heading: 'API Design',
        endpoints: [
          { method: 'POST', path: '/posts', label: 'Create a post', request: '{ media_url, caption, tags[] }', note: 'Media uploaded to S3 via pre-signed URL first' },
          { method: 'GET', path: '/feed?cursor=&limit=20', label: 'Get personalized feed', response: '{ posts: Post[], next_cursor }' },
          { method: 'GET', path: '/explore?cursor=', label: 'Explore/discover page' },
          { method: 'POST', path: '/posts/{id}/likes', label: 'Like a post' },
          { method: 'POST', path: '/users/{id}/follow', label: 'Follow a user' },
          { method: 'GET', path: '/users/{id}/posts?cursor=', label: 'User profile posts' },
        ],
      },
      { type: 'text', heading: 'High-Level Design: Photo Upload', body: `**Direct upload to S3 (bypass app servers):**\n1. Client requests pre-signed S3 URL from API\n2. Client uploads photo directly to S3\n3. S3 event triggers image processing pipeline (via Kafka)\n4. **Processing pipeline:** resize to 4 sizes (thumbnail, small, medium, large), compress, strip EXIF data\n5. Processed images pushed to CDN origin\n6. Post metadata saved to DB\n\n**Storage tiers:**\n- **Hot (0-7 days):** CDN edge + fast S3 storage. Most views happen in first 48 hours.\n- **Warm (7 days - 6 months):** Standard S3. Still accessible but not cached at edge.\n- **Cold (6+ months):** S3 Glacier. Cheap storage, slow retrieval. Rarely accessed.` },
      { type: 'text', heading: 'High-Level Design: Feed Generation', body: `Same fan-out problem as Facebook News Feed.\n\n**Hybrid approach:**\n- **Regular users (< 10K followers):** Fan-out on write. When they post, write post_id to all followers' feed caches (Redis sorted set).\n- **Celebrities (> 10K followers):** Fan-out on read. Don't pre-compute. Merge their posts at read time.\n- **Inactive users:** Don't maintain feed cache. Rebuild on next login.\n\n**Feed read flow:**\n1. Fetch pre-computed feed from Redis (post_ids sorted by score)\n2. Merge with recent posts from followed celebrities\n3. Fetch full post data for top 20 post_ids\n4. Return to client\n\n**Ranking:** recency × engagement × relationship strength. ML model scores each candidate.` },
      {
        type: 'deepdive', heading: 'Deep Dive: Like Counting at Scale',
        subtitle: 'A viral post gets millions of likes — don\'t UPDATE on every like',
        content: [
          { type: 'text', heading: 'The Problem', body: `A post by a celebrity gets 1M likes in an hour. If each like does UPDATE posts SET like_count = like_count + 1, the row becomes a hot key and the DB melts.\n\n**Solution: Async counting (same pattern as YouTube views)**\n1. Like event → Kafka topic\n2. Consumer batches likes (every 5 seconds or every 1000 likes)\n3. Batch UPDATE to DB\n4. For real-time display: Redis counter (INCR) per post, sync to DB periodically\n\n**"Has this user liked this post?"**\nStore (user_id, post_id) in a Redis SET or Bloom filter for fast O(1) lookup. Don't query the likes table on every feed load.` },
        ],
      },
      {
        type: 'levels', heading: 'What\'s Expected at Each Level',
        levels: [
          { title: 'Mid-level', body: `Should design the upload flow with S3 and the basic feed with fan-out. Should understand why CDN is needed for photo serving. Not expected to know the hybrid fan-out approach upfront.` },
          { title: 'Senior', body: `Should proactively discuss the hybrid fan-out approach for celebrities. Should design the image processing pipeline. Should handle the like counting problem. Should discuss storage tiers for cost optimization.` },
          { title: 'Staff+', body: `Should go deep on feed ranking (ML model, feature engineering), CDN cost optimization, and the explore/discover algorithm. Should discuss how to handle the "following" social graph at scale (graph DB vs adjacency list). May discuss content-based image deduplication.` },
        ],
      },
    ],
  },

  'design-google-docs': {
    slug: 'design-google-docs', title: 'Design Google Docs', subtitle: 'Real-time collaborative document editing',
    duration: '45 min', difficulty: 'Hard',
    sections: [
      
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `Google Docs allows multiple users to edit the same document simultaneously, with changes appearing in real-time for all editors. The fundamental challenge is conflict resolution — when two users type at the same position at the same time, how do you merge their changes without losing either? This is solved by Operational Transformation (OT) or CRDTs, and understanding these algorithms is what separates a good answer from a great one.`,
    },
    {
        type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Create and edit text documents', 'Real-time collaboration — multiple users editing simultaneously', 'See other users\' cursors and selections in real-time', 'Version history — view and restore previous versions', 'Comments and suggestions'],
        functionalOutOfScope: ['Rich formatting (bold, italic, etc.)', 'Spreadsheets/presentations', 'Offline editing'],
        nonFunctional: ['Changes appear on other users\' screens in < 100ms', 'No data loss — every keystroke must be persisted', 'Conflict resolution — concurrent edits must converge to the same state', 'Support 50 concurrent editors per document', 'High availability'],
      },
      { type: 'text', heading: 'Core Entities', body: `**Document** — ID, title, owner, current content, version number\n**Operation** — An edit action (insert char at position X, delete char at position Y)\n**Session** — A user connected to a document via WebSocket\n**Version** — A snapshot of the document at a point in time` },
      {
        type: 'api', heading: 'API Design',
        endpoints: [
          { method: 'POST', path: '/documents', label: 'Create a document', response: '{ doc_id }' },
          { method: 'GET', path: '/documents/{id}', label: 'Load document content + metadata' },
          { method: 'WS', path: '/documents/{id}/collaborate', label: 'WebSocket for real-time editing', note: 'All operations sent/received over this connection' },
          { method: 'GET', path: '/documents/{id}/versions', label: 'List version history' },
          { method: 'GET', path: '/documents/{id}/versions/{versionId}', label: 'Get a specific version' },
        ],
      },
      { type: 'text', heading: 'High-Level Design', body: `**Architecture:**\n- **WebSocket Gateway** — Manages persistent connections. Each document is a "room."\n- **Collaboration Service** — Receives operations, transforms them, broadcasts to all editors\n- **Document Store** — Persistent storage (PostgreSQL for metadata, S3 for content snapshots)\n- **Operation Log** — Append-only log of all operations (for replay and version history)\n\n**Edit flow:**\n1. User types a character → client generates an operation: {type: "insert", char: "a", position: 42}\n2. Operation sent to server via WebSocket\n3. Server transforms the operation against any concurrent operations (OT)\n4. Server applies operation to the authoritative document state\n5. Server broadcasts the transformed operation to all other connected clients\n6. Other clients apply the operation to their local state\n7. Operation appended to the operation log` },
      {
        type: 'deepdive', heading: 'Deep Dive: Operational Transformation (OT)',
        subtitle: 'The core algorithm that makes collaborative editing work',
        content: [
          { type: 'text', heading: 'The Problem', body: `Two users edit the same document simultaneously:\n\n**Document:** "Hello"\n**User A:** Insert "!" at position 5 → "Hello!"\n**User B:** Insert " World" at position 5 → "Hello World"\n\nIf both operations are applied naively, the result depends on order:\n- A then B: "Hello! World" (wrong — "!" should be at the end)\n- B then A: "Hello World!" (correct)\n\n**OT transforms operations** so they produce the correct result regardless of order.` },
          { type: 'text', heading: 'How OT Works', body: `**Transform function:** Given two concurrent operations A and B, produce A' and B' such that:\n- Applying A then B' = Applying B then A' (same final state)\n\n**Example:**\nA = insert("!", 5), B = insert(" World", 5)\nSince B inserts 6 characters before position 5... wait, both are at position 5.\nTransform: A' = insert("!", 11) — shift A's position by B's length\nResult: "Hello World!" ✓\n\n**The server is the authority.** All operations go through the server, which maintains a single operation order. Clients may have slightly different states temporarily, but they converge after receiving the server's transformed operations.` },
          { type: 'text', heading: 'CRDTs (Alternative to OT)', body: `**Conflict-free Replicated Data Types** — data structures that merge automatically without a central server.\n\nFor text: assign each character a unique, ordered ID. Insertions create new IDs between existing ones. Deletions mark characters as "tombstoned."\n\n**Pros over OT:** No central server needed, works offline, simpler correctness proof\n**Cons:** Higher storage (tombstones), more complex implementation, harder to implement rich text\n\n**Used by:** Figma, Notion, Linear, Apple Notes` },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Cursor Sharing & Presence',
        subtitle: 'Showing other users\' cursors in real-time',
        content: [
          { type: 'text', heading: 'Implementation', body: `Each client broadcasts cursor position on every keystroke/click:\n{ type: "cursor", user_id: "abc", position: 42, selection: [42, 50] }\n\nServer broadcasts to all other clients in the room.\n\n**Throttling:** Don't send on every keystroke — batch to max 10 updates/sec per user. Interpolate on the client side for smooth cursor movement.\n\n**Color coding:** Each user gets a unique color. Show their name label next to their cursor.` },
        ],
      },
      {
        type: 'levels', heading: 'What\'s Expected at Each Level',
        levels: [
          { title: 'Mid-level', body: `Should understand that WebSocket is needed for real-time. Should describe the basic edit flow. Should know that concurrent edits need conflict resolution. Not expected to explain OT in detail.` },
          { title: 'Senior', body: `Should explain OT at a conceptual level with an example. Should design the WebSocket room architecture. Should discuss the operation log for version history. Should handle cursor sharing.` },
          { title: 'Staff+', body: `Should compare OT vs CRDTs with trade-offs. Should discuss how to handle document persistence (periodic snapshots + operation replay). Should design for 50 concurrent editors with low latency. May discuss how to handle rich text formatting operations.` },
        ],
      },
    ],
  },

  'design-distributed-cache': {
    slug: 'design-distributed-cache', title: 'Design a Distributed Cache', subtitle: 'Build a Redis-like distributed caching system',
    duration: '40 min', difficulty: 'Hard',
    sections: [
      
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `A distributed cache stores frequently accessed data in memory across multiple servers, providing sub-millisecond reads. Think Redis Cluster or Memcached. The core challenges are data distribution (consistent hashing), fault tolerance (what happens when a node dies), eviction policies (LRU, LFU), and cache coherence. This question tests your understanding of distributed systems fundamentals.`,
    },
    {
        type: 'requirements', heading: 'Understanding the Problem',
        functional: ['GET key → value (or null if not found)', 'SET key value [TTL] — store a key-value pair with optional expiry', 'DELETE key — remove a key', 'Support various data types (strings, lists, sets, hashes)'],
        functionalOutOfScope: ['Pub/Sub messaging', 'Lua scripting', 'Transactions'],
        nonFunctional: ['Sub-millisecond latency for GET/SET (p99 < 1ms)', 'High availability — cache should survive node failures', 'Horizontally scalable — add nodes to increase capacity', '1M+ QPS across the cluster', 'Configurable memory limit per node with eviction'],
      },
      { type: 'text', heading: 'Scale Estimation', body: `**QPS:** 1M requests/sec across the cluster\n**Data size:** 100GB total cached data\n**Key size:** Average 50 bytes. Value size: average 1KB.\n**Nodes:** At 16GB RAM per node, need ~7 nodes for data + replication overhead.\n**Network:** 1M × 1KB = 1GB/sec bandwidth across the cluster.` },
      { type: 'text', heading: 'Core Entities', body: `**CacheNode** — A single server holding a portion of the data in memory\n**CacheEntry** — Key, value, TTL, last accessed timestamp\n**HashRing** — Consistent hash ring mapping keys to nodes\n**Replica** — Copy of data on another node for fault tolerance` },
      { type: 'text', heading: 'High-Level Design', body: `**Client request flow:**\n1. Client computes hash(key) to determine which node owns this key\n2. Client sends GET/SET directly to that node (no proxy — client-side routing)\n3. Node looks up key in its in-memory hash table\n4. Returns value (GET) or stores value (SET)\n\n**Key components:**\n- **Consistent Hash Ring** — Maps keys to nodes. Virtual nodes for even distribution.\n- **Cache Nodes** — In-memory hash table + LRU eviction\n- **Replication** — Each key stored on N nodes (primary + N-1 replicas)\n- **Cluster Manager** — Tracks node health, manages ring membership\n- **Client Library** — Handles routing, connection pooling, failover` },
      {
        type: 'architecture', heading: 'Distributed Cache Architecture',
        caption: 'Client-side routing via consistent hash ring. Each key replicated to N nodes for fault tolerance.',
        config: {
          width: 820, height: 400,
          nodes: [
            { id: 'app1', label: 'App Server 1', icon: '💻', color: 'blue', x: 20, y: 60, w: 120, h: 56 },
            { id: 'app2', label: 'App Server 2', icon: '💻', color: 'blue', x: 20, y: 160, w: 120, h: 56 },
            { id: 'app3', label: 'App Server N', icon: '💻', color: 'blue', x: 20, y: 260, w: 120, h: 56 },
            { id: 'lib', label: 'Client Library', sublabel: 'Hash ring + routing', color: 'cyan', x: 210, y: 140, w: 140, h: 60 },
            { id: 'node1', label: 'Cache Node 1', sublabel: '16GB RAM', icon: '⚡', color: 'red', x: 430, y: 20, w: 130, h: 56 },
            { id: 'node2', label: 'Cache Node 2', sublabel: '16GB RAM', icon: '⚡', color: 'red', x: 430, y: 120, w: 130, h: 56 },
            { id: 'node3', label: 'Cache Node 3', sublabel: '16GB RAM', icon: '⚡', color: 'red', x: 430, y: 220, w: 130, h: 56 },
            { id: 'node4', label: 'Cache Node N', sublabel: '16GB RAM', icon: '⚡', color: 'red', x: 430, y: 320, w: 130, h: 56 },
            { id: 'mgr', label: 'Cluster Manager', sublabel: 'Health + membership', color: 'purple', x: 640, y: 60, w: 140, h: 56 },
            { id: 'db', label: 'Source DB', sublabel: 'PostgreSQL', icon: '🗄️', color: 'blue', x: 640, y: 220, w: 140, h: 56 },
          ],
          edges: [
            { from: 'app1', to: 'lib', label: 'GET/SET' },
            { from: 'app2', to: 'lib', label: 'GET/SET' },
            { from: 'app3', to: 'lib', label: 'GET/SET' },
            { from: 'lib', to: 'node1', label: 'hash → node', dashed: true },
            { from: 'lib', to: 'node2', label: '', dashed: true },
            { from: 'lib', to: 'node3', label: '', dashed: true },
            { from: 'node1', to: 'node2', label: 'replicate', dashed: true },
            { from: 'node2', to: 'node3', label: 'replicate', dashed: true },
            { from: 'mgr', to: 'node1', label: 'heartbeat', dashed: true },
            { from: 'node3', to: 'db', label: 'cache miss → query', color: 'accent' },
          ],
        },
      },
      {
        type: 'text', heading: 'Read and Write Paths',
        body: `**Read path (GET):**\n1. Client library hashes the key and looks up the consistent hash ring to find the owning node.\n2. Client sends GET directly to that node — no proxy, no coordinator. This is what makes it fast.\n3. The node looks up the key in its in-memory hash table. If found (cache hit), return the value in <1ms.\n4. If not found (cache miss), the application fetches from the source database, then calls SET to populate the cache for next time.\n\n**Write path (SET):**\n1. Client library routes to the primary node for this key.\n2. Primary stores the key-value pair in memory with the specified TTL.\n3. Primary asynchronously replicates to N-1 replica nodes (next nodes clockwise on the ring).\n4. Returns success to the client after the primary write (not waiting for replicas — this is eventual consistency).\n\n**Node failure:**\nThe cluster manager detects a dead node via heartbeat timeout. It updates the hash ring, and the dead node's keys are now owned by the next node clockwise. If replication was configured, the replica already has the data. If not, those keys are cache misses until re-populated from the database.`,
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Consistent Hashing',
        subtitle: 'Minimize data movement when adding/removing nodes',
        content: [
          { type: 'text', heading: 'Why Not Simple Hashing?', body: `hash(key) % N assigns keys to N nodes. But when you add a node (N → N+1), almost all keys remap to different nodes. With 1M keys, ~91% of keys move. Massive cache miss storm.\n\n**Consistent hashing:** Only K/N keys move on average (K = total keys, N = nodes). Adding 1 node to 10 moves only ~10% of keys.` },
          { type: 'text', heading: 'Virtual Nodes', body: `With few physical nodes, distribution is uneven on the hash ring.\n\n**Solution:** Each physical node gets 150+ virtual nodes (positions) on the ring. This ensures even distribution even with heterogeneous hardware.\n\n**Weighted virtual nodes:** A node with 32GB RAM gets 2x more virtual nodes than a 16GB node → handles 2x more keys.` },
          { type: 'text', heading: 'Replication', body: `For each key, store on the primary node + next N-1 nodes clockwise on the ring.\n\n**Write path:** Write to primary → async replicate to replicas\n**Read path:** Read from any replica (eventual consistency) or primary only (strong consistency)\n\n**Failure:** If primary dies, next replica becomes primary. Consistent hashing ensures minimal disruption.` },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: LRU Eviction',
        subtitle: 'What to remove when memory is full',
        content: [
          { type: 'text', heading: 'Exact LRU', body: `**Data structure:** Doubly-linked list + hash map\n- Hash map: key → node in linked list (O(1) lookup)\n- Linked list: ordered by access time (most recent at head)\n- On GET: move node to head (O(1))\n- On SET (full): remove tail node (O(1)), insert new at head\n- On SET (not full): insert at head\n\nBoth GET and SET are O(1). Memory overhead: 2 pointers per entry (~16 bytes).` },
          { type: 'text', heading: 'Approximate LRU (Redis Approach)', body: `Exact LRU requires maintaining the linked list on every access — expensive at 1M QPS.\n\n**Redis's approach:** Sample 5 random keys, evict the least recently used among them. Repeat until enough memory is freed.\n\n**Why it works:** With random sampling, the approximation is very close to exact LRU. Much cheaper — no linked list maintenance on every GET.\n\n**Other policies:** LFU (least frequently used), random eviction, TTL-based (evict keys closest to expiry).` },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Cache Warming & Thundering Herd',
        subtitle: 'What happens when a cache node restarts',
        content: [
          { type: 'text', heading: 'The Problem', body: `When a cache node restarts, all its keys are gone. Suddenly all requests for those keys hit the database. If the node held popular keys, the DB gets overwhelmed.\n\n**Solutions:**\n1. **Persistent cache (Redis AOF/RDB):** Write operations to disk. On restart, reload from disk. Recovery time: seconds to minutes depending on data size.\n2. **Cache warming:** On startup, pre-load popular keys from DB before accepting traffic.\n3. **Circuit breaker:** If cache miss rate exceeds threshold, reject requests instead of flooding DB.\n4. **Gradual traffic shift:** Don't route 100% of traffic to the new node immediately. Ramp up over minutes.` },
        ],
      },
      {
        type: 'levels', heading: 'What\'s Expected at Each Level',
        levels: [
          { title: 'Mid-level', body: `Should describe the basic GET/SET flow with client-side routing. Should understand why consistent hashing is needed. Should know LRU eviction at a conceptual level.` },
          { title: 'Senior', body: `Should design consistent hashing with virtual nodes. Should explain replication strategy and failure handling. Should compare exact LRU vs approximate LRU. Should discuss cache warming.` },
          { title: 'Staff+', body: `Should go deep on the consistency model (eventual vs strong), handling network partitions, and split-brain scenarios. Should discuss memory management (jemalloc, slab allocation). May discuss the gossip protocol for cluster membership and failure detection.` },
        ],
      },
    ],
  },

  'design-payment-system': {
    slug: 'design-payment-system', title: 'Design a Payment System', subtitle: 'Reliable, consistent payment processing',
    duration: '40 min', difficulty: 'Hard',
    sections: [
      
    {
      type: 'text', heading: 'Understanding the Problem',
      body: `A payment system processes financial transactions — charging credit cards, transferring money, handling refunds. The non-negotiable requirement is correctness: a user must never be charged twice, and money must never be lost. This means idempotency, ACID transactions, and careful handling of distributed failures. Payment systems prioritize consistency over availability — the opposite of most web applications.`,
    },
    {
        type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Process payments (credit card, debit card, UPI, wallet)', 'Handle refunds (full and partial)', 'Payment history and receipts', 'Support multiple currencies', 'Webhook notifications to merchants on payment status changes'],
        functionalOutOfScope: ['Fraud detection', 'Subscription/recurring billing', 'Multi-party payments (marketplace splits)'],
        nonFunctional: ['Exactly-once processing — never charge a customer twice', 'High availability — payment processing must never go down', 'Complete audit trail — every state change logged', 'PCI DSS compliance for card data', 'Latency < 2 seconds for payment confirmation'],
      },
      { type: 'text', heading: 'Scale Estimation', body: `**Transactions:** 10M payments/day ÷ 86,400 = ~116 payments/sec\n**Peak:** 10x during sales events = 1,160/sec\n**Storage:** 10M × 2KB per transaction = 20GB/day. Audit logs: 10x = 200GB/day.\n**Key insight:** Payment volume is moderate. The hard part is correctness, not scale.` },
      { type: 'text', heading: 'Core Entities', body: `**Payment** — Amount, currency, status, payer, payee, payment method, idempotency key\n**PaymentMethod** — Card token, UPI ID, wallet ID (never store raw card numbers)\n**Refund** — Original payment reference, amount, reason, status\n**Ledger Entry** — Double-entry bookkeeping record for every money movement` },
      {
        type: 'api', heading: 'API Design',
        endpoints: [
          { method: 'POST', path: '/payments', label: 'Create a payment', request: '{\n  amount: 1000,\n  currency: "INR",\n  payment_method_id: "pm_xxx",\n  idempotency_key: "uuid-xxx",\n  metadata: { order_id: "ord_123" }\n}', response: '{ payment_id, status: "processing" }', note: 'Idempotency key is REQUIRED — prevents double charges on retry' },
          { method: 'GET', path: '/payments/{id}', label: 'Get payment status', response: '{ status: "succeeded" | "failed" | "processing" }' },
          { method: 'POST', path: '/payments/{id}/refund', label: 'Refund a payment', request: '{ amount?: number, reason: string }' },
          { method: 'GET', path: '/payments?merchant_id=&from=&to=', label: 'Payment history' },
          { method: 'POST', path: '/webhooks/configure', label: 'Set webhook URL for status updates' },
        ],
      },
      {
        type: 'schema', heading: 'Data Schema',
        entities: [
          { name: 'payments', note: 'PostgreSQL — ACID required', fields: [
            { name: 'id', type: 'UUID', notes: 'Primary key' },
            { name: 'idempotency_key', type: 'VARCHAR', notes: 'UNIQUE index — prevents duplicates' },
            { name: 'amount', type: 'BIGINT', notes: 'In smallest currency unit (paise/cents)' },
            { name: 'currency', type: 'VARCHAR(3)', notes: 'ISO 4217 (INR, USD)' },
            { name: 'status', type: 'ENUM', notes: 'pending → processing → succeeded/failed' },
            { name: 'payment_method_id', type: 'VARCHAR', notes: 'Tokenized reference' },
            { name: 'gateway_reference', type: 'VARCHAR', notes: 'ID from Razorpay/Stripe' },
            { name: 'created_at', type: 'TIMESTAMP', notes: '' },
            { name: 'updated_at', type: 'TIMESTAMP', notes: '' },
          ]},
          { name: 'ledger_entries', note: 'Append-only — never update or delete', fields: [
            { name: 'id', type: 'UUID', notes: 'Primary key' },
            { name: 'payment_id', type: 'UUID', notes: 'Foreign key' },
            { name: 'type', type: 'ENUM', notes: 'debit | credit' },
            { name: 'account', type: 'VARCHAR', notes: 'merchant_xxx, platform_fees, etc.' },
            { name: 'amount', type: 'BIGINT', notes: '' },
            { name: 'created_at', type: 'TIMESTAMP', notes: '' },
          ]},
        ],
      },
      { type: 'text', heading: 'High-Level Design', body: `The payment flow must be designed for correctness above all else. Every step must be idempotent, every state change must be logged, and every failure must be recoverable.\n\nThe flow has three critical phases: validation (check idempotency, validate input), execution (call the payment gateway), and reconciliation (update our records to match the gateway's). The idempotency key is the linchpin — it prevents double charges when clients retry after timeouts.` },
      {
        type: 'architecture', heading: 'Payment System Architecture',
        caption: 'Idempotency check in Redis, ACID transactions in PostgreSQL, async webhooks for merchant notification.',
        config: {
          width: 850, height: 440,
          nodes: [
            { id: 'client', label: 'Client / App', icon: '📱', color: 'blue', x: 20, y: 160, w: 110, h: 56 },
            { id: 'lb', label: 'Load Balancer', color: 'cyan', x: 180, y: 160, w: 120, h: 56 },
            { id: 'pay-svc', label: 'Payment Service', sublabel: 'Idempotency + orchestration', color: 'green', x: 370, y: 60, w: 150, h: 60 },
            { id: 'redis', label: 'Redis', sublabel: 'Idempotency keys', icon: '⚡', color: 'red', x: 370, y: 180, w: 130, h: 56 },
            { id: 'db', label: 'PostgreSQL', sublabel: 'Payments + Ledger', icon: '🗄️', color: 'blue', x: 370, y: 300, w: 130, h: 56 },
            { id: 'gateway', label: 'Payment Gateway', sublabel: 'Razorpay / Stripe', icon: '💳', color: 'purple', x: 600, y: 60, w: 150, h: 60 },
            { id: 'webhook', label: 'Webhook Service', sublabel: 'Notify merchants', icon: '🔔', color: 'orange', x: 600, y: 180, w: 150, h: 56 },
            { id: 'recon', label: 'Reconciliation', sublabel: 'Cron job', icon: '🔄', color: 'yellow', x: 600, y: 300, w: 150, h: 56 },
          ],
          edges: [
            { from: 'client', to: 'lb', label: 'POST /payments' },
            { from: 'lb', to: 'pay-svc', label: 'with idempotency key' },
            { from: 'pay-svc', to: 'redis', label: '1. check idempotency', color: 'accent' },
            { from: 'pay-svc', to: 'db', label: '2. create PENDING record' },
            { from: 'pay-svc', to: 'gateway', label: '3. charge card', color: 'accent' },
            { from: 'gateway', to: 'pay-svc', label: '4. success/failure', dashed: true },
            { from: 'pay-svc', to: 'db', label: '5. update status + ledger' },
            { from: 'pay-svc', to: 'webhook', label: '6. notify merchant' },
            { from: 'recon', to: 'gateway', label: 'compare records', dashed: true },
            { from: 'recon', to: 'db', label: 'fix discrepancies', dashed: true },
          ],
        },
      },
      {
        type: 'text', heading: 'Payment Flow — Step by Step',
        body: `1. Client sends POST /payments with an idempotency key (UUID generated client-side). This key is mandatory.\n\n2. Payment Service checks Redis: SETNX idempotency:{key} "processing" EX 86400. If the key already exists, it means this payment was already attempted — return the stored result immediately. No duplicate charge.\n\n3. If the key is new, create a payment record in PostgreSQL with status PENDING. This is done in a transaction.\n\n4. Call the Payment Gateway (Razorpay, Stripe) to process the charge. This is the external call that can fail or timeout.\n\n5. Gateway returns success or failure. Update the payment status in PostgreSQL (SUCCEEDED or FAILED) and write ledger entries (double-entry bookkeeping) in the same transaction.\n\n6. Store the result in Redis: SET idempotency:{key} {result_json} EX 86400. Now any retry with the same key returns this result.\n\n7. Send a webhook notification to the merchant with the payment status.\n\n**The critical failure scenario:** What if step 4 times out? You do not know if the gateway charged the card or not. Never retry blindly. Instead: query the gateway for the payment status. If the gateway has no record, it is safe to retry. If the gateway shows success, update your DB to match. The reconciliation service runs every hour to catch any discrepancies between your records and the gateway's.`,
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Idempotency',
        subtitle: 'The most critical requirement — never charge twice',
        content: [
          { type: 'text', heading: 'How It Works', body: `**Client generates a unique idempotency key** for each payment attempt (UUID). If the client retries (network timeout, app crash), it sends the same key.\n\n**Server flow:**\n1. SETNX idempotency:{key} "processing" EX 86400 (Redis, atomic)\n2. If key already exists → fetch stored result → return it\n3. If key is new → process payment\n4. After processing → SET idempotency:{key} {result_json} EX 86400\n\n**Edge case:** What if server crashes between step 3 and 4?\n- Key exists with value "processing" but no result\n- On retry: detect "processing" state → query gateway for status → update accordingly\n- Use a background job to clean up stale "processing" keys after 5 minutes` },
          { type: 'callout', variant: 'warning', heading: 'Idempotency Key Scope', body: 'The idempotency key should be scoped to the merchant + payment intent. Two different merchants can use the same key. The key should be unique per payment attempt, not per API call.' },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Double-Entry Bookkeeping',
        subtitle: 'Every money movement has two sides — debit and credit',
        content: [
          { type: 'text', heading: 'Why Double-Entry?', body: `For every payment, record both sides:\n\n**Customer pays ₹1000 for an order:**\n- DEBIT customer_wallet ₹1000 (money leaves customer)\n- CREDIT merchant_account ₹970 (merchant receives)\n- CREDIT platform_fees ₹30 (platform takes 3% fee)\n\n**Sum of all debits = Sum of all credits.** Always. If they don't balance, something is wrong.\n\n**Benefits:**\n- Complete audit trail\n- Easy reconciliation\n- Detect discrepancies automatically\n- Required for financial compliance` },
          { type: 'text', heading: 'Ledger is Append-Only', body: `Never update or delete ledger entries. To reverse a payment, create new entries:\n\n**Refund ₹1000:**\n- DEBIT merchant_account ₹970\n- DEBIT platform_fees ₹30\n- CREDIT customer_wallet ₹1000\n\nThe original entries remain. The refund entries cancel them out. Full history preserved.` },
        ],
      },
      {
        type: 'levels', heading: 'What\'s Expected at Each Level',
        levels: [
          { title: 'Mid-level', body: `Should define the API with idempotency key. Should describe the basic payment flow. Should understand why exactly-once processing matters. Not expected to know double-entry bookkeeping.` },
          { title: 'Senior', body: `Should design the full idempotency mechanism with Redis. Should handle the gateway timeout scenario. Should discuss the webhook notification system. Should mention PCI DSS compliance (tokenization, never store raw card numbers).` },
          { title: 'Staff+', body: `Should design the double-entry ledger system. Should discuss distributed transactions (what if DB write succeeds but gateway call fails). Should handle reconciliation — how to detect and fix discrepancies between your records and the gateway's. May discuss multi-currency support and exchange rate handling.` },
        ],
      },
    ],
  },

});
