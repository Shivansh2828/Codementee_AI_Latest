export const QUESTION_BREAKDOWN_TOPICS = {

// ── BIT.LY ─────────────────────────────────────────────────────────────────
'design-bitly': {
  slug: 'design-bitly', title: 'Design Bit.ly', subtitle: 'URL shortening service at scale',
  duration: '35 min', difficulty: 'Intermediate',
  sections: [
    {
      type: 'requirements', heading: 'Understanding the Problem',
      functional: [
        'Given a long URL, generate a unique short URL',
        'Redirect a short URL to its original long URL',
        'Support custom aliases (e.g., bit.ly/my-link)',
        'Track click analytics (count, location, device)',
      ],
      functionalOutOfScope: ['User accounts and link management dashboards', 'Link expiry (can be added later)'],
      nonFunctional: [
        '100M URLs created per day (~1,160 writes/sec)',
        '10:1 read:write ratio → 1B redirects/day (~11,600 reads/sec)',
        'Redirect latency < 10ms (users expect instant)',
        'URLs should be available for years',
        'No two short URLs should map to the same long URL (or handle gracefully)',
      ],
      nonFunctionalOutOfScope: ['Real-time analytics dashboard', 'A/B testing on links'],
    },
    {
      type: 'text', heading: 'Scale Estimation',
      body: `**Writes:** 100M/day ÷ 86,400 = ~1,160 URLs/sec\n**Reads:** 1B/day ÷ 86,400 = ~11,600 redirects/sec\n\n**Storage:**\n- Each URL record ≈ 500 bytes (short key + long URL + metadata)\n- 100M/day × 365 × 5 years = 182.5B records\n- 182.5B × 500 bytes ≈ **91 TB** over 5 years\n\n**Bandwidth:**\n- Write: 1,160 × 500B = 580 KB/s (trivial)\n- Read: 11,600 × 500B = 5.8 MB/s (trivial)\n\n**Key insight:** This is a read-heavy system (10:1). The redirect path must be extremely fast. Caching is critical.`,
    },
    {
      type: 'text', heading: 'Core Entities',
      body: `**ShortURL** — The mapping record\n**User** — Optional, for authenticated link management\n**ClickEvent** — Analytics data per redirect`,
    },
    {
      type: 'api', heading: 'API Design',
      description: 'Simple REST API — one endpoint per functional requirement.',
      endpoints: [
        { method: 'POST', path: '/urls', label: 'Create short URL', request: '{\n  long_url: string,\n  custom_alias?: string,\n  expires_at?: timestamp\n}', response: '{\n  short_url: "https://bit.ly/abc1234",\n  short_key: "abc1234"\n}' },
        { method: 'GET', path: '/{shortKey}', label: 'Redirect (302)', response: 'HTTP 302 → Location: <long_url>', note: 'This is the hot path. Must be < 10ms. Use 302 (not 301) so browsers don\'t cache and we can track analytics.' },
        { method: 'GET', path: '/urls/{shortKey}/analytics', label: 'Get click stats', response: '{ clicks: 1234, top_countries: [...] }' },
        { method: 'DELETE', path: '/urls/{shortKey}', label: 'Delete a link' },
      ],
    },
    {
      type: 'callout', variant: 'tip', heading: '301 vs 302 Redirect',
      body: '301 is permanent — browsers cache it and never call your server again. You lose all analytics. 302 is temporary — browser always calls your server, you can track every click. Always use 302 for URL shorteners.',
    },
    {
      type: 'schema', heading: 'Data Schema',
      entities: [
        {
          name: 'urls',
          note: 'Primary table — read-heavy, cache aggressively',
          fields: [
            { name: 'short_key', type: 'VARCHAR(7)', notes: 'Primary key — e.g. "abc1234"' },
            { name: 'long_url', type: 'TEXT', notes: 'The original URL' },
            { name: 'user_id', type: 'UUID', notes: 'Nullable — anonymous links allowed' },
            { name: 'custom_alias', type: 'BOOLEAN', notes: 'Was this a custom alias?' },
            { name: 'click_count', type: 'BIGINT', notes: 'Approximate, updated async' },
            { name: 'created_at', type: 'TIMESTAMP', notes: '' },
            { name: 'expires_at', type: 'TIMESTAMP', notes: 'Nullable' },
          ],
        },
        {
          name: 'click_events',
          note: 'Analytics — write-heavy, can be async',
          fields: [
            { name: 'id', type: 'UUID', notes: 'Primary key' },
            { name: 'short_key', type: 'VARCHAR(7)', notes: 'Foreign key' },
            { name: 'clicked_at', type: 'TIMESTAMP', notes: 'Indexed for time-range queries' },
            { name: 'country', type: 'VARCHAR(2)', notes: 'From IP geolocation' },
            { name: 'device', type: 'VARCHAR', notes: 'mobile/desktop/tablet' },
            { name: 'referrer', type: 'TEXT', notes: 'HTTP Referer header' },
          ],
        },
      ],
    },
    {
      type: 'text', heading: 'High-Level Design',
      body: `**Write path (create short URL):**\n1. Client POSTs long URL to API server\n2. Generate a unique short key (see below)\n3. Check for collision in DB\n4. Write to DB\n5. Return short URL\n\n**Read path (redirect):**\n1. Client hits GET /{shortKey}\n2. Check Redis cache → if hit, return long URL immediately\n3. If miss, query DB → cache result with TTL\n4. Return 302 redirect\n5. Async: write click event to Kafka → analytics consumer updates stats\n\n**Why async analytics?** Writing to the analytics DB on every redirect would add latency to the hot path. Instead, publish to Kafka and let a consumer batch-write to the analytics DB.`,
    },
    {
      type: 'deepdive', heading: 'Deep Dive: Short Key Generation',
      subtitle: 'The core algorithmic challenge — how do you generate unique, short, non-predictable keys?',
      content: [
        {
          type: 'text', heading: 'Option 1: Hash + Truncate',
          body: `MD5(long_url) → take first 7 characters → base62 encode\n\n**Pros:** Deterministic — same URL always gets same key (natural deduplication)\n**Cons:**\n- Collisions: different URLs can produce the same 7-char prefix\n- Must handle collisions with retry logic\n- Predictable pattern\n\n**Collision probability:** With 62^7 = 3.5 trillion possible keys and 182.5B URLs over 5 years, collision probability is low but non-zero. Need collision detection.`,
        },
        {
          type: 'text', heading: 'Option 2: Auto-increment ID + Base62',
          body: `Use a database auto-increment ID, convert to base62.\n\nID 1 → "1", ID 62 → "10", ID 3844 → "100"\n\n**Pros:** No collisions, simple\n**Cons:**\n- Sequential and predictable (security concern)\n- Single DB counter is a bottleneck at scale\n- Distributed ID generation is complex (need coordination)`,
        },
        {
          type: 'text', heading: 'Option 3: Pre-generated Key Service (Best)',
          body: `Generate random 7-character base62 keys in advance. Store in a "key DB" with two tables: unused_keys and used_keys.\n\n**Flow:**\n1. Key Generation Service pre-generates millions of random keys\n2. App server requests a key from Key Service\n3. Key Service moves key from unused → used atomically\n4. App server uses the key\n\n**Pros:**\n- No collisions (keys are pre-validated as unique)\n- No coordination needed at request time\n- Fast — just a DB read\n- Keys are random (not predictable)\n\n**Cons:**\n- Key Service is a new component to maintain\n- Need to pre-generate enough keys\n\n**Capacity:** 62^7 = 3.5 trillion keys. At 1,160/sec, that's 95,000 years of keys. Pre-generate 1B keys upfront (~7GB storage) and you're set for years.`,
        },
        {
          type: 'callout', variant: 'info', heading: 'Key Service Availability',
          body: 'The Key Service is a critical component. Run multiple instances. Each instance pre-fetches a batch of keys (e.g., 1000 at a time) into memory to avoid DB calls on every request. If an instance crashes, those in-memory keys are lost — acceptable since we have 3.5 trillion total.',
        },
      ],
    },
    {
      type: 'deepdive', heading: 'Deep Dive: Caching Strategy',
      subtitle: '80% of traffic goes to 20% of URLs — cache aggressively',
      content: [
        {
          type: 'text', heading: 'What to Cache',
          body: `Cache the short_key → long_url mapping in Redis.\n\n**Cache size estimation:**\n- 11,600 reads/sec, 80% cache hit rate → 2,320 DB reads/sec\n- Hot URLs: 20% of URLs get 80% of traffic\n- 182.5B total URLs × 20% = 36.5B hot URLs\n- But only recently-created URLs are hot\n- Cache last 30 days of hot URLs: 100M/day × 30 × 20% = 600M entries\n- 600M × 500 bytes = 300GB — too much for a single Redis node\n- Use Redis Cluster or only cache the top 1% (6M entries = 3GB) ✓`,
        },
        {
          type: 'text', heading: 'Cache Eviction & TTL',
          body: `**Eviction policy:** LRU (Least Recently Used) — evict the least recently accessed keys when memory is full.\n\n**TTL:** 24 hours for most URLs. Shorter TTL for URLs that might be deleted or updated.\n\n**Cache invalidation:** When a URL is deleted, explicitly delete from cache. When click_count is updated, don't invalidate — it's OK for the cached version to be slightly stale.`,
        },
      ],
    },
    {
      type: 'levels', heading: 'What\'s Expected at Each Level',
      levels: [
        { title: 'Mid-level', body: `Should define the API, basic schema, and high-level design covering creation and redirect. Should understand why caching is needed.\n\nNot expected to know the Key Service pattern upfront, but should be able to reason through collision handling when asked. Should understand 301 vs 302.` },
        { title: 'Senior', body: `Should proactively discuss key generation options and their trade-offs. Should design the caching layer with appropriate TTL and eviction policy. Should separate the analytics write path from the redirect hot path.\n\nShould discuss the Key Service pattern and its availability considerations.` },
        { title: 'Staff+', body: `Should go deep on the Key Service design — batch pre-fetching, availability, what happens on crash. Should discuss consistent hashing for distributing the cache. Should proactively identify that analytics writes must be async and design the Kafka pipeline. May discuss geo-distribution for global low-latency redirects.` },
      ],
    },
  ],
},

// ── TICKETMASTER ───────────────────────────────────────────────────────────
'design-ticketmaster': {
  slug: 'design-ticketmaster', title: 'Design Ticketmaster', subtitle: 'Event ticketing with high-concurrency seat selection',
  duration: '40 min', difficulty: 'Advanced',
  sections: [
    {
      type: 'requirements', heading: 'Understanding the Problem',
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
      body: `**Browse path (read-heavy):**\nClient → CDN (event pages, seat maps) → Load Balancer → App Servers → Read Replicas\n\nEvent pages and seat maps are mostly static — cache aggressively in CDN and Redis. Seat availability updates every few seconds, not milliseconds.\n\n**Booking path (write, consistency-critical):**\nClient → Load Balancer → Booking Service → PostgreSQL (with row-level locking)\n\nThe booking service handles reservations and confirmations. It must prevent double-booking.`,
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
          type: 'text', heading: 'CDN for Static Content',
          body: `Event pages, seat maps, artist images → serve from CDN. These don't change during the on-sale.\n\nFor the seat map specifically: serve a static version from CDN, update availability via WebSocket or polling every 5 seconds. Users don't need millisecond-accurate availability — they just need to know roughly which sections are available.`,
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
  duration: '40 min', difficulty: 'Advanced',
  sections: [
    {
      type: 'requirements', heading: 'Understanding the Problem',
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
  duration: '30 min', difficulty: 'Intermediate',
  sections: [
    {
      type: 'requirements', heading: 'Understanding the Problem',
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
  duration: '45 min', difficulty: 'Advanced',
  sections: [
    {
      type: 'requirements', heading: 'Understanding the Problem',
      functional: [
        'Users should be able to upload a file from any device',
        'Users should be able to download a file from any device',
        'Users should be able to share a file with other users and view files shared with them',
        'Files should automatically sync across devices',
      ],
      functionalOutOfScope: ['Edit files in-browser', 'File versioning', 'Virus/malware scanning'],
      nonFunctional: [
        'Highly available — prioritize availability over consistency',
        'Support files as large as 50GB',
        'Secure and reliable — recover files if lost or corrupted',
        'Fast upload, download, and sync (low latency)',
      ],
      nonFunctionalOutOfScope: ['Storage limit per user', 'File versioning'],
    },
    { type: 'callout', variant: 'tip', heading: 'CAP Trade-off for Dropbox', body: 'Prioritize availability over consistency. If a user in Germany uploads a file, it\'s OK if a user in the US can\'t see it for a few seconds. Compare this to a stock trading app where you need strong consistency.' },
    { type: 'text', heading: 'Core Entities', body: `**File** — The raw bytes that users upload, download, and share.\n**FileMetadata** — Name, size, MIME type, uploader, chunk list, status.\n**User** — The user of the system.\n**SharedFiles** — Maps files to users who have access.` },
    {
      type: 'api', heading: 'API Design',
      description: 'One endpoint per functional requirement. These will evolve as we go deeper.',
      endpoints: [
        { method: 'POST', path: '/files', label: 'Upload a file', request: '{\n  file: <binary>,\n  metadata: FileMetadata\n}', note: 'Will evolve to use pre-signed S3 URLs — see deep dive.' },
        { method: 'GET', path: '/files/{fileId}', label: 'Download a file', response: 'File + FileMetadata' },
        { method: 'POST', path: '/files/{fileId}/share', label: 'Share with users', request: '{ users: User[] }' },
        { method: 'GET', path: '/files/changes?since={timestamp}', label: 'Sync — get changes', response: 'ChangeEvent[] (fileId, type, metadata)' },
      ],
    },
    {
      type: 'schema', heading: 'Data Schema',
      entities: [
        { name: 'FileMetadata', note: 'DynamoDB or PostgreSQL', fields: [
          { name: 'id', type: 'UUID', notes: 'Primary key' },
          { name: 'name', type: 'VARCHAR', notes: 'Original filename' },
          { name: 'size', type: 'BIGINT', notes: 'Bytes' },
          { name: 'mimeType', type: 'VARCHAR', notes: 'e.g. text/plain' },
          { name: 'uploadedBy', type: 'UUID', notes: 'User ID' },
          { name: 'status', type: 'ENUM', notes: 'uploading | uploaded | failed' },
          { name: 's3Key', type: 'VARCHAR', notes: 'S3 object key' },
          { name: 'fingerprint', type: 'VARCHAR', notes: 'SHA-256 of file content' },
          { name: 'chunks', type: 'JSON[]', notes: 'For large file uploads' },
        ]},
        { name: 'SharedFiles', note: 'Composite key: userId + fileId', fields: [
          { name: 'userId', type: 'UUID', notes: 'Partition key' },
          { name: 'fileId', type: 'UUID', notes: 'Sort key' },
          { name: 'sharedBy', type: 'UUID', notes: 'Who shared it' },
        ]},
      ],
    },
    { type: 'text', heading: 'High-Level Design: Upload', body: `**Naive approach:** Client → API Server → S3. Problem: file travels twice, API servers become bottleneck.\n\n**Better: Pre-signed URLs**\n1. Client requests a pre-signed upload URL from your server\n2. Server generates a signed S3 URL (valid 15 min) — no S3 call, just a cryptographic signature\n3. Client uploads directly to S3 — bypasses your servers entirely\n4. S3 notifies your server on completion\n5. Server saves metadata to DB` },
    { type: 'text', heading: 'High-Level Design: Sync', body: `**Local → Remote:** Client-side sync agent monitors the local folder using OS file system events. On change, uploads via the upload API.\n\n**Remote → Local (Hybrid approach):**\n- WebSocket connection per device for real-time push notifications\n- Poll every few minutes as safety net (WebSockets can drop)\n- On reconnect, always fetch changes since last sync timestamp\n\nThis gives real-time updates with guaranteed eventual consistency.` },
    {
      type: 'deepdive', heading: 'Deep Dive: Supporting Large Files (up to 50GB)',
      subtitle: 'The core challenge — and where most interview time is spent',
      content: [
        { type: 'text', heading: 'Why Single-Request Upload Fails', body: `A 50GB file at 100Mbps takes **1.1 hours**. Problems:\n- **Timeouts** — API Gateway hard limit: 10MB\n- **No progress** — User stares at a spinner\n- **No resumability** — Any interruption means starting over` },
        { type: 'text', heading: 'Solution: Chunked Multipart Upload', body: `Break the file into **5-10MB chunks** on the client. Upload each chunk independently.\n\n**Benefits:** Progress indicator, resumability, parallelism, works within API Gateway limits.\n\n**Important:** Chunking must happen on the client. Chunking on the server defeats the purpose.` },
        { type: 'text', heading: 'Fingerprinting for Resumability', body: `**File fingerprint:** SHA-256 hash of entire file content. Unique identifier regardless of filename.\n**Chunk fingerprints:** SHA-256 of each chunk. Identifies exactly which chunks are done.\n\n**Upload flow:**\n1. Client chunks file, computes fingerprints\n2. Check: "Does a file with this fingerprint exist?" → if yes and status=uploading, resume\n3. POST /files/initiate-upload → server calls S3 CreateMultipartUpload, returns pre-signed URLs per chunk\n4. Client uploads each chunk to S3\n5. After all chunks: server calls S3 CompleteMultipartUpload → S3 assembles into single object` },
        { type: 'text', heading: 'Content-Defined Chunking (CDC)', body: `With fixed-size chunks, inserting one byte near the start shifts all subsequent chunk boundaries — delta sync becomes useless.\n\n**Solution:** Use a rolling hash (Rabin fingerprinting) to determine chunk boundaries based on file content. A small edit only affects chunks immediately surrounding the change. This is how Dropbox achieves efficient delta sync.` },
        { type: 'callout', variant: 'info', heading: 'S3 Multipart Upload', body: 'This is exactly what AWS S3 Multipart Upload does. In practice you\'d use the S3 SDK. But you must explain how it works — just saying "I\'d use S3 multipart" without understanding it won\'t pass.' },
      ],
    },
    {
      type: 'deepdive', heading: 'Deep Dive: Security',
      subtitle: 'Encryption, access control, and signed URLs',
      content: [
        { type: 'text', heading: 'Encryption', body: `**In transit:** HTTPS everywhere.\n**At rest:** Enable S3 server-side encryption (SSE-S3 or SSE-KMS). Each object encrypted with a unique key.` },
        { type: 'text', heading: 'Access Control with Signed URLs', body: `Pre-signed URLs are **bearer tokens** — anyone with a valid, unexpired URL can access the file.\n\n**Flow:**\n1. User requests download\n2. Server checks SharedFiles — is this user authorized?\n3. If yes, generate short-lived CDN signed URL (5-15 min expiry)\n4. Client downloads directly from CDN\n\nShort expiry limits exposure if a URL is accidentally shared.` },
      ],
    },
    {
      type: 'levels', heading: 'What\'s Expected at Each Level',
      levels: [
        { title: 'Mid-level', body: `Should define API, basic schema, functional high-level design for upload/download/sharing/sync. Not expected to know pre-signed URLs upfront, but should reason through it when asked "you're uploading the file twice, how do you fix that?"` },
        { title: 'Senior', body: `Should proactively discuss pre-signed URLs, CDN for downloads, chunked uploads. Should design the sync protocol with hybrid WebSocket + polling approach. Should articulate trade-offs.` },
        { title: 'Staff+', body: `Deep knowledge of multipart upload, CDC for delta sync, compression strategies, security model. Should drive the conversation proactively. May discuss deduplication across users, exact S3 multipart API, or geo-distributed storage.` },
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
    duration: '40 min', difficulty: 'Advanced', comingSoon: true,
    sections: [
      { type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Users can create a profile with photos and bio', 'Users see nearby profiles and swipe left (pass) or right (like)', 'When two users both swipe right, it\'s a match', 'Matched users can chat'],
        nonFunctional: ['100M users, 50M DAU', 'Low latency profile loading (<200ms)', 'Location-based — show users within configurable radius', 'High availability'] },
      { type: 'text', heading: 'Key Challenges', body: `**Geospatial matching** — Efficiently find users within a radius using geohashing or PostGIS.\n\n**Recommendation engine** — Who to show next? Balance between showing popular profiles and giving everyone visibility.\n\n**Swipe deduplication** — Never show the same profile twice. Track seen profiles per user.\n\n**Match detection** — When user A likes user B, check if B already liked A. Use Redis sets for O(1) lookup.\n\n**Full content coming soon — check back for the complete breakdown with API design, schema, deep dives, and level expectations.**` },
    ],
  },

  'design-whatsapp': {
    slug: 'design-whatsapp', title: 'Design WhatsApp', subtitle: 'Real-time messaging at scale',
    duration: '40 min', difficulty: 'Advanced', comingSoon: true,
    sections: [
      { type: 'requirements', heading: 'Understanding the Problem',
        functional: ['1:1 messaging', 'Group messaging (up to 256 members)', 'Message delivery receipts (sent, delivered, read)', 'Media sharing', 'Online/last seen status'],
        nonFunctional: ['2B users, 100M DAU', '100B messages/day', 'Low latency (<100ms)', 'Messages never lost'] },
      { type: 'animation', id: 'message-queue', heading: 'Message Flow', body: 'Sender → Server → Queue → Recipient. Queue ensures delivery even when recipient is offline.' },
      { type: 'text', heading: 'Key Challenges', body: `**Online delivery** — WebSocket for real-time push.\n**Offline delivery** — Store in DB, push when recipient reconnects.\n**Delivery receipts** — ✓ Sent (server received), ✓✓ Delivered (device received), ✓✓ blue (read).\n**Group fan-out** — For groups up to 256, fan-out on write to each member's queue.\n**End-to-end encryption** — Signal Protocol. Server only sees encrypted blobs.\n\n**Full content coming soon — check back for the complete breakdown with API design, schema, deep dives, and level expectations.**` },
    ],
  },

  'design-youtube': {
    slug: 'design-youtube', title: 'Design YouTube', subtitle: 'Video upload, processing, and streaming at scale',
    duration: '45 min', difficulty: 'Advanced', comingSoon: true,
    sections: [
      { type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Upload videos', 'Stream videos', 'Search videos', 'Recommendations', 'Comments, likes'],
        nonFunctional: ['2B users, 500M DAU', '500 hours of video uploaded per minute', '1B hours watched per day', 'Low latency streaming globally'] },
      { type: 'text', heading: 'Key Challenges', body: `**Video processing pipeline** — Upload → Transcoding (multiple resolutions) → Thumbnail generation → CDN distribution. Use Kafka between steps.\n\n**Adaptive bitrate streaming** — Split video into 2-10 second segments at multiple qualities. Client switches quality based on bandwidth (HLS/DASH).\n\n**CDN** — Store popular video segments at edge nodes. Cache hit rate is critical for cost.\n\n**Storage** — 500 hours/min × 60 × 24 = 720K hours/day. At 1GB/hour compressed, ~720TB/day. Multiple resolutions = 3-5 PB/day.\n\n**Full content coming soon.**` },
    ],
  },

  'design-uber': {
    slug: 'design-uber', title: 'Design Uber', subtitle: 'Real-time ride matching and location tracking',
    duration: '45 min', difficulty: 'Advanced', comingSoon: true,
    sections: [
      { type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Rider requests a ride', 'Match rider with nearby driver', 'Real-time location tracking', 'ETA calculation', 'Pricing'],
        nonFunctional: ['100M users, 10M drivers', 'Match within 1 second', 'Location updates every 4 seconds', 'High availability'] },
      { type: 'text', heading: 'Key Challenges', body: `**Location storage** — 10M drivers × 1 update/4sec = 2.5M updates/sec. Use Redis Geospatial (GEOADD, GEORADIUS) for real-time.\n\n**Matching algorithm** — Find available drivers within radius, filter by rating/car type, rank by ETA, send to top N simultaneously.\n\n**Geohashing** — Divide world into grid cells. Nearby locations share prefix. Efficient spatial queries.\n\n**Surge pricing** — Supply/demand ratio per geohash cell. Update every few minutes.\n\n**Full content coming soon.**` },
    ],
  },

  'design-web-crawler': {
    slug: 'design-web-crawler', title: 'Design a Web Crawler', subtitle: 'Systematically browse and index the web',
    duration: '35 min', difficulty: 'Advanced', comingSoon: true,
    sections: [
      { type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Start from seed URLs', 'Download web pages', 'Extract links from pages', 'Store page content', 'Revisit pages periodically'],
        nonFunctional: ['Crawl 1B pages/month', 'Politeness (don\'t overwhelm servers)', 'Handle duplicates', 'Distributed, fault-tolerant'] },
      { type: 'text', heading: 'Key Challenges', body: `**URL Frontier** — Priority queue of URLs to crawl. Prioritize by PageRank, freshness.\n**Politeness** — Max 1 request/second per domain. Respect robots.txt.\n**Deduplication** — Bloom filter to check if URL already crawled.\n**Spider traps** — Infinite URL generators (calendars, infinite scroll). Detect by URL depth limit.\n**Scale** — 1B pages/month = 400 pages/sec. Partition by domain hash across crawler nodes.\n\n**Full content coming soon.**` },
    ],
  },

  'design-instagram': {
    slug: 'design-instagram', title: 'Design Instagram', subtitle: 'Photo sharing with feed, stories, and explore',
    duration: '40 min', difficulty: 'Advanced', comingSoon: true,
    sections: [
      { type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Upload photos/videos', 'Follow users', 'View feed (posts from followed users)', 'Stories (24-hour expiry)', 'Explore/discover', 'Likes, comments'],
        nonFunctional: ['2B users, 500M DAU', '100M photos uploaded/day', 'Feed load < 2 seconds'] },
      { type: 'text', heading: 'Key Challenges', body: `**Photo storage** — Direct upload to S3 via pre-signed URLs. Processing pipeline: resize, compress, thumbnails. CDN for serving.\n**Storage tiers** — Hot (recent, CDN), Warm (1-6 months, standard S3), Cold (older, Glacier).\n**Feed generation** — Same fan-out problem as FB News Feed. Hybrid push/pull for celebrities.\n**Stories** — TTL in Redis/Cassandra. Background cleanup of expired stories.\n\n**Full content coming soon.**` },
    ],
  },

  'design-google-docs': {
    slug: 'design-google-docs', title: 'Design Google Docs', subtitle: 'Real-time collaborative document editing',
    duration: '45 min', difficulty: 'Advanced', comingSoon: true,
    sections: [
      { type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Create/edit documents', 'Real-time collaboration (multiple users simultaneously)', 'See other users\' cursors', 'Version history', 'Comments'],
        nonFunctional: ['Changes appear in < 100ms', 'No data loss', 'Conflict resolution'] },
      { type: 'text', heading: 'Key Challenges', body: `**Operational Transformation (OT)** — Transform concurrent operations so they converge to the same state.\n**CRDTs** — Conflict-free Replicated Data Types. Data structures that merge automatically. Used by Figma, Notion.\n**WebSocket rooms** — All editors of a document connected to same server.\n**Operation log** — Store all operations in order. New clients replay log.\n**Cursor sharing** — Broadcast cursor position via WebSocket. Throttle to 10 updates/sec.\n\n**Full content coming soon.**` },
    ],
  },

  'design-distributed-cache': {
    slug: 'design-distributed-cache', title: 'Design a Distributed Cache', subtitle: 'Build a Redis-like distributed caching system',
    duration: '40 min', difficulty: 'Advanced', comingSoon: true,
    sections: [
      { type: 'requirements', heading: 'Understanding the Problem',
        functional: ['GET/SET/DELETE key-value pairs', 'TTL (time-to-live) support', 'Eviction when memory full'],
        nonFunctional: ['Sub-millisecond latency', 'High availability', 'Horizontal scalability', '1M QPS'] },
      { type: 'text', heading: 'Key Challenges', body: `**Consistent hashing** — Distribute keys across nodes. Virtual nodes for even distribution.\n**Replication** — Each key on N nodes (typically 3). Write to primary, async replicate.\n**LRU eviction** — Doubly-linked list + hash map for O(1) get/put. Redis uses approximate LRU (sample N random keys).\n**Thundering herd on restart** — Warm up cache gradually, use circuit breakers, or persistent cache (Redis AOF/RDB).\n\n**Full content coming soon.**` },
    ],
  },

  'design-payment-system': {
    slug: 'design-payment-system', title: 'Design a Payment System', subtitle: 'Reliable, consistent payment processing',
    duration: '40 min', difficulty: 'Advanced', comingSoon: true,
    sections: [
      { type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Process payments (credit card, UPI, wallet)', 'Handle refunds', 'Payment history', 'Idempotent operations'],
        nonFunctional: ['Exactly-once processing (no double charges)', 'High availability', 'Audit trail', 'PCI DSS compliance'] },
      { type: 'text', heading: 'Key Challenges', body: `**Idempotency** — Client generates unique key per payment attempt. Server stores key + result. Same key = return stored result.\n**Payment flow** — Create record (PENDING) → Call gateway → Update (COMPLETED/FAILED). Handle timeouts with webhook callbacks.\n**Double-spend prevention** — SELECT FOR UPDATE to lock balance row during debit. Optimistic locking as alternative.\n\n**Full content coming soon.**` },
    ],
  },

});
