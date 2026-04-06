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
    duration: '40 min', difficulty: 'Advanced',
    sections: [
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
    duration: '40 min', difficulty: 'Advanced',
    sections: [
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
      { type: 'text', heading: 'High-Level Design', body: `**Message flow (both users online):**\n1. Sender sends message via WebSocket to Chat Server\n2. Chat Server writes to message DB (Cassandra)\n3. Chat Server looks up recipient's connected Chat Server (via Redis session store)\n4. Routes message to recipient's Chat Server\n5. Recipient's Chat Server pushes via WebSocket\n6. Recipient's device sends "delivered" ack\n\n**Message flow (recipient offline):**\n1-2 same as above\n3. Recipient not connected — message stored in pending queue\n4. When recipient connects, Chat Server fetches pending messages and delivers\n5. Pending messages cleared after delivery confirmation\n\n**Key components:**\n- **Chat Servers** — Handle WebSocket connections, route messages\n- **Session Service (Redis)** — Maps user_id → chat_server_id for routing\n- **Message DB (Cassandra)** — Persistent message storage\n- **Pending Queue (Redis/Kafka)** — Buffer for offline users\n- **S3** — Media file storage, **CDN** — Media delivery` },
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
    duration: '45 min', difficulty: 'Advanced',
    sections: [
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
    duration: '45 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'requirements', heading: 'Understanding the Problem',
        functional: ['Rider requests a ride from current location', 'System matches rider with a nearby available driver', 'Real-time location tracking during the ride', 'ETA calculation before and during ride', 'Fare calculation and payment'],
        functionalOutOfScope: ['Driver onboarding', 'Ride scheduling', 'Ride sharing/pooling'],
        nonFunctional: ['100M users, 10M active drivers', 'Match rider to driver within 1 second', 'Driver location updates every 4 seconds', 'High availability — ride requests must never fail', 'Low latency location queries'],
        nonFunctionalOutOfScope: ['Fraud detection', 'Driver ratings system'],
      },
      { type: 'text', heading: 'Scale Estimation', body: `**Location updates:** 10M drivers × 1 update/4sec = 2.5M updates/sec\n**Ride requests:** 10M rides/day ÷ 86,400 = ~116 rides/sec\n**Storage:** Location data is ephemeral (only current location matters). Ride history: 10M rides/day × 1KB = 10GB/day.\n**Key insight:** Location updates (2.5M/sec) is the hardest scaling challenge, not ride requests (116/sec).` },
      { type: 'text', heading: 'Core Entities', body: `**Rider** — Profile, payment method, current location\n**Driver** — Profile, vehicle info, current location, availability status\n**Ride** — Rider, driver, pickup/dropoff locations, status, fare\n**Location** — Latitude, longitude, timestamp, driver_id` },
      {
        type: 'api', heading: 'API Design',
        endpoints: [
          { method: 'POST', path: '/rides', label: 'Request a ride', request: '{\n  pickup: { lat, lng },\n  dropoff: { lat, lng },\n  ride_type: "standard" | "premium"\n}', response: '{ ride_id, estimated_fare, eta }' },
          { method: 'PUT', path: '/rides/{id}/accept', label: 'Driver accepts ride' },
          { method: 'GET', path: '/rides/{id}', label: 'Get ride status + live location' },
          { method: 'PUT', path: '/drivers/{id}/location', label: 'Update driver location', request: '{ lat, lng }', note: 'Called every 4 seconds by driver app' },
          { method: 'PUT', path: '/drivers/{id}/availability', label: 'Toggle availability', request: '{ available: bool }' },
        ],
      },
      { type: 'text', heading: 'High-Level Design', body: `**Ride request flow:**\n1. Rider requests ride → Ride Service creates ride (status: MATCHING)\n2. Ride Service queries Location Service: "find available drivers within 3km of pickup"\n3. Location Service queries Redis Geospatial → returns list of nearby drivers\n4. Matching Service ranks drivers by ETA (not just distance — considers traffic, route)\n5. Send ride request to top 3 drivers simultaneously\n6. First driver to accept → ride confirmed, others notified\n7. If no acceptance in 15 seconds → expand radius, try next batch\n\n**During ride:**\n- Driver app sends location every 4 seconds → Location Service → Redis\n- Rider app polls ride status every 5 seconds (or WebSocket push)\n- ETA recalculated based on live location\n\n**Key components:**\n- **Location Service** — Handles 2.5M location updates/sec, stores in Redis Geospatial\n- **Matching Service** — Finds and ranks nearby drivers\n- **Ride Service** — Manages ride lifecycle\n- **ETA Service** — Calculates estimated time using map data + traffic\n- **Fare Service** — Calculates fare based on distance, time, surge` },
      {
        type: 'deepdive', heading: 'Deep Dive: Location Storage & Geospatial Queries',
        subtitle: 'Handling 2.5M location updates per second',
        content: [
          { type: 'text', heading: 'Redis Geospatial', body: `Redis has built-in geospatial commands:\n- **GEOADD** drivers {lng} {lat} {driver_id} — store/update location\n- **GEORADIUS** drivers {lng} {lat} 3 km — find all drivers within 3km\n\nRedis handles this in-memory with O(log N) for both operations. At 2.5M updates/sec, you need a Redis Cluster (shard by geographic region).\n\n**Why not PostGIS?** PostGIS is great for complex geo queries but can't handle 2.5M writes/sec. Redis is 100x faster for simple proximity queries.` },
          { type: 'text', heading: 'Geohashing', body: `Divide the world into grid cells. Each cell has a hash string. Nearby locations share a common prefix.\n\n**Example:** Geohash "tdr1w" covers a ~5km² area. All drivers in that area have geohashes starting with "tdr1w".\n\n**For finding nearby drivers:**\n1. Compute geohash of rider's location\n2. Query drivers in the same cell + 8 neighboring cells\n3. Filter by exact distance\n\nThis is how Redis GEORADIUS works internally.` },
          { type: 'text', heading: 'Sharding by Region', body: `A single Redis instance can't handle all 10M drivers globally.\n\n**Shard by city/region:**\n- Redis cluster for NYC handles NYC drivers only\n- Redis cluster for London handles London drivers only\n- Ride Service routes to the correct cluster based on rider's location\n\nThis also reduces the dataset size per cluster — GEORADIUS is faster with fewer entries.` },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Matching Algorithm',
        subtitle: 'Finding the best driver, not just the closest',
        content: [
          { type: 'text', heading: 'Beyond Simple Distance', body: `Closest driver ≠ best driver. A driver 1km away but stuck in traffic has a higher ETA than a driver 2km away on an open road.\n\n**Ranking factors:**\n1. **ETA** (primary) — Estimated time to reach pickup, using map routing + live traffic\n2. **Driver rating** — Higher-rated drivers preferred\n3. **Vehicle type match** — If rider requested premium, only match premium vehicles\n4. **Driver acceptance rate** — Drivers who frequently decline get lower priority\n5. **Fairness** — Don't always send rides to the same drivers` },
          { type: 'text', heading: 'Dispatch Strategy', body: `**Batch dispatch (Uber's approach):**\n1. Collect all ride requests in a 2-second window\n2. Collect all available drivers\n3. Run a matching algorithm that optimizes total ETA across all rides\n4. This is a bipartite matching problem — solved with the Hungarian algorithm or greedy approximation\n\n**Why batch?** Individual matching is greedy — you might assign a driver to ride A when they'd be a better match for ride B that comes in 1 second later. Batching gives a globally better assignment.` },
        ],
      },
      {
        type: 'deepdive', heading: 'Deep Dive: Surge Pricing',
        subtitle: 'Dynamic pricing based on supply and demand',
        content: [
          { type: 'text', heading: 'How It Works', body: `**For each geohash cell, every 2 minutes:**\n1. Count ride requests in the cell (demand)\n2. Count available drivers in the cell (supply)\n3. surge_multiplier = demand / supply (capped at 3x-5x)\n4. If surge > 1.0, show surge pricing to rider before they confirm\n\n**Why surge?**\n- Attracts more drivers to high-demand areas (they earn more)\n- Reduces demand (some riders wait or take alternatives)\n- Balances supply and demand naturally\n\n**Storage:** Surge multipliers per geohash cell in Redis with 2-minute TTL. Recalculated by a background job.` },
        ],
      },
      {
        type: 'levels', heading: 'What\'s Expected at Each Level',
        levels: [
          { title: 'Mid-level', body: `Should define the API, basic ride flow, and understand that geospatial queries are needed. Should propose using Redis or a geo-capable database. Not expected to know geohashing details.` },
          { title: 'Senior', body: `Should design the full matching flow with ETA-based ranking. Should explain Redis Geospatial and why it's chosen over PostGIS. Should discuss sharding by region. Should handle the location update scale (2.5M/sec).` },
          { title: 'Staff+', body: `Should go deep on batch dispatch optimization, surge pricing algorithm, and how to handle edge cases (driver goes offline mid-match, rider cancels). Should discuss ETA prediction using ML models and live traffic data. May discuss multi-region deployment for global service.` },
        ],
      },
    ],
  },

  'design-web-crawler': {
    slug: 'design-web-crawler', title: 'Design a Web Crawler', subtitle: 'Systematically browse and index the web',
    duration: '35 min', difficulty: 'Advanced',
    sections: [
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
    duration: '40 min', difficulty: 'Advanced',
    sections: [
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
    duration: '45 min', difficulty: 'Advanced',
    sections: [
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
    duration: '40 min', difficulty: 'Advanced',
    sections: [
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
    duration: '40 min', difficulty: 'Advanced',
    sections: [
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
      { type: 'text', heading: 'High-Level Design', body: `**Payment flow:**\n1. Client sends payment request with idempotency key\n2. **Payment Service** checks idempotency key in Redis\n   - If found → return stored result (no duplicate charge)\n   - If not found → continue\n3. Create payment record in DB (status: PENDING)\n4. Call **Payment Gateway** (Razorpay, Stripe) to process the charge\n5. Gateway returns success/failure\n6. Update payment status in DB (SUCCEEDED or FAILED)\n7. Store idempotency key → result in Redis (TTL: 24h)\n8. Write ledger entries (double-entry bookkeeping)\n9. Send webhook notification to merchant\n10. Return result to client\n\n**What if step 4 times out?**\n- Don't retry blindly — you might double-charge\n- Query the gateway for payment status\n- If gateway has no record → safe to retry\n- If gateway shows success → update our DB to match\n- Use webhook callbacks as a backup notification channel` },
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
