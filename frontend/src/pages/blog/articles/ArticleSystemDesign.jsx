import React from 'react';

const P = ({ children, theme }) => <p className={`${theme.text.secondary} leading-relaxed mb-3 text-[15px]`}>{children}</p>;
const H2 = ({ children, theme }) => <h2 className={`text-2xl font-bold ${theme.text.primary} mb-4 mt-10`}>{children}</h2>;
const H3 = ({ children, theme }) => <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2 mt-6`}>{children}</h3>;
const Callout = ({ children, theme }) => (
  <div className={`border-l-4 border-[#06b6d4] pl-4 py-2 my-5 ${theme.bg.card} rounded-r-lg`}>
    <p className={`text-sm ${theme.text.secondary} italic`}>{children}</p>
  </div>
);

const Question = ({ q, answer, theme }) => (
  <div className={`mb-8 p-5 rounded-xl ${theme.bg.card} border ${theme.border.primary}`}>
    <h3 className={`text-base font-bold ${theme.text.primary} mb-3`}>{q}</h3>
    <p className={`text-sm ${theme.text.secondary} leading-relaxed`}>{answer}</p>
  </div>
);

const ArticleSystemDesign = ({ theme }) => (
  <div>
    <H2 theme={theme}>How System Design Interviews Work</H2>
    <P theme={theme}>
      System design interviews are open-ended. There is no single correct answer. The interviewer is evaluating your ability to think through tradeoffs, ask the right clarifying questions, and design a system that meets the stated requirements at scale.
    </P>
    <P theme={theme}>
      A typical system design round is 45-60 minutes. You should spend the first 5-10 minutes clarifying requirements, then design the high-level architecture, then dive into specific components the interviewer asks about.
    </P>
    <Callout theme={theme}>
      The most common failure mode: jumping straight to drawing boxes without asking about scale, consistency requirements, or what "success" looks like for the system.
    </Callout>

    <H2 theme={theme}>The 20 Most Asked System Design Questions</H2>

    <H3 theme={theme}>Foundational (Asked at Every Level)</H3>
    <Question theme={theme}
      q="1. Design a URL Shortener (like bit.ly)"
      answer="Key decisions: hash function (MD5 vs base62 encoding), database choice (SQL for simplicity, NoSQL for scale), handling collisions, custom aliases, analytics tracking, and expiry. Scale consideration: 100M URLs, 10B redirects/day requires read-heavy optimization with caching."
    />
    <Question theme={theme}
      q="2. Design a Rate Limiter"
      answer="Algorithms: token bucket (smooth bursts), leaky bucket (strict rate), fixed window counter (simple), sliding window log (accurate). Storage: Redis for distributed rate limiting. Key challenge: handling distributed systems where multiple servers need to share state."
    />
    <Question theme={theme}
      q="3. Design a Key-Value Store"
      answer="Cover: consistent hashing for distribution, replication factor, read/write quorums (CAP theorem), conflict resolution (vector clocks, last-write-wins), compaction, and bloom filters for existence checks. Reference: DynamoDB, Cassandra architecture."
    />

    <H3 theme={theme}>Social & Communication Systems</H3>
    <Question theme={theme}
      q="4. Design Twitter / X Feed"
      answer="Core challenge: fan-out on write vs fan-out on read. For celebrities with millions of followers, pre-computing feeds is expensive. Solution: hybrid approach — pre-compute for regular users, pull for celebrities. Use Redis sorted sets for timeline storage, Kafka for async fan-out."
    />
    <Question theme={theme}
      q="5. Design WhatsApp / Messaging System"
      answer="Key components: WebSocket connections for real-time delivery, message queue for offline users, end-to-end encryption, group messaging (fan-out), read receipts, media storage (S3 + CDN), and message ordering guarantees."
    />
    <Question theme={theme}
      q="6. Design Instagram / Photo Sharing"
      answer="Focus on: image upload pipeline (S3 + CDN), feed generation, follower graph storage (graph DB or adjacency list), search (Elasticsearch), and notification system. Discuss image resizing and format optimization."
    />

    <H3 theme={theme}>Infrastructure & Platform Systems</H3>
    <Question theme={theme}
      q="7. Design a Distributed Cache"
      answer="Cover: eviction policies (LRU, LFU, TTL), consistent hashing for distribution, replication for availability, cache invalidation strategies (write-through, write-behind, cache-aside), and handling hot keys."
    />
    <Question theme={theme}
      q="8. Design a Search Autocomplete System"
      answer="Data structure: Trie for prefix matching. At scale: distributed trie, top-K suggestions per prefix, personalization layer, and real-time updates from search logs. Discuss how Google handles billions of queries with sub-100ms latency."
    />
    <Question theme={theme}
      q="9. Design a Notification System"
      answer="Components: notification service, template engine, delivery channels (push, email, SMS), priority queues, rate limiting per user, retry logic with exponential backoff, and analytics tracking. Handle 10M notifications/day."
    />
    <Question theme={theme}
      q="10. Design a Web Crawler"
      answer="Key challenges: URL frontier (priority queue), politeness (robots.txt, crawl delay), deduplication (bloom filter), distributed crawling, content extraction, and handling dynamic JavaScript pages. Discuss BFS vs DFS tradeoffs."
    />

    <H3 theme={theme}>E-commerce & Booking Systems</H3>
    <Question theme={theme}
      q="11. Design Uber / Ride Sharing"
      answer="Core: geospatial indexing (quadtree or geohash), real-time driver location updates (WebSocket), matching algorithm, surge pricing, trip state machine, and payment processing. Handle 1M concurrent rides."
    />
    <Question theme={theme}
      q="12. Design Amazon / E-commerce Platform"
      answer="Focus on: product catalog (search + filtering), inventory management (distributed locks for stock), shopping cart (Redis), order processing (saga pattern for distributed transactions), and recommendation engine."
    />
    <Question theme={theme}
      q="13. Design a Hotel/Flight Booking System"
      answer="Key challenge: preventing double booking. Solutions: optimistic locking, pessimistic locking, or reservation with TTL. Discuss ACID transactions, idempotency for payment retries, and handling partial failures."
    />

    <H3 theme={theme}>Video & Content Delivery</H3>
    <Question theme={theme}
      q="14. Design YouTube / Video Streaming"
      answer="Pipeline: upload → transcoding (multiple resolutions) → CDN distribution. Streaming: adaptive bitrate (HLS/DASH). Storage: S3 for videos, metadata in MySQL, view counts in Redis. Handle 500 hours of video uploaded per minute."
    />
    <Question theme={theme}
      q="15. Design Netflix"
      answer="Focus on: content delivery (CDN with edge servers), recommendation system (collaborative filtering), A/B testing infrastructure, and chaos engineering. Netflix's Open Connect CDN is a great discussion point."
    />

    <H3 theme={theme}>Data & Analytics Systems</H3>
    <Question theme={theme}
      q="16. Design a Metrics/Monitoring System (like Datadog)"
      answer="Components: metric ingestion (Kafka), time-series storage (InfluxDB, Prometheus), aggregation pipeline, alerting engine, and dashboard rendering. Handle 1M metrics/second with sub-second query latency."
    />
    <Question theme={theme}
      q="17. Design a Distributed Message Queue (like Kafka)"
      answer="Cover: partitioning for parallelism, replication for durability, consumer groups, offset management, exactly-once semantics, and compaction. Discuss when to use Kafka vs SQS vs RabbitMQ."
    />

    <H3 theme={theme}>Advanced / Senior Level</H3>
    <Question theme={theme}
      q="18. Design Google Search"
      answer="Components: web crawler, indexing pipeline (inverted index), ranking algorithm (PageRank + ML signals), query processing, spell correction, and serving infrastructure. Focus on the indexing pipeline and how to handle 8.5B searches/day."
    />
    <Question theme={theme}
      q="19. Design a Distributed File System (like Google Drive)"
      answer="Key decisions: chunking strategy, deduplication, versioning, conflict resolution for concurrent edits, sync protocol, and offline support. Reference: Google File System paper."
    />
    <Question theme={theme}
      q="20. Design a Payment System"
      answer="Critical requirements: exactly-once processing (idempotency keys), ACID transactions, fraud detection, PCI compliance, reconciliation, and handling partial failures. Discuss the saga pattern for distributed transactions."
    />

    <H2 theme={theme}>How to Structure Your Answer</H2>
    <P theme={theme}>Follow this framework for every system design question:</P>
    <ol className="space-y-2 mb-6 ml-4">
      {[
        '1. Clarify requirements (5 min) — functional requirements, scale, constraints',
        '2. Estimate scale (2 min) — QPS, storage, bandwidth',
        '3. High-level design (10 min) — major components and data flow',
        '4. Deep dive (20 min) — focus on the hardest parts',
        '5. Identify bottlenecks (5 min) — single points of failure, scaling limits',
      ].map((item, i) => (
        <li key={i} className={`text-[15px] ${theme.text.secondary}`}>{item}</li>
      ))}
    </ol>
  </div>
);

export default ArticleSystemDesign;
