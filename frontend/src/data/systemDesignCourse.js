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
    subtitle: 'DNS, TCP/IP, HTTP, WebSockets — the foundation of every system you will ever design',
    duration: '30 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'Why Networking Matters', body: `Every system design interview involves data moving between machines. When someone says "the app is slow," understanding networking is how you figure out whether the problem is your server or the road to get there.\n\nYou will not be asked to implement TCP from scratch. But you will be asked things like "how does the client connect to the server?" or "should we use WebSockets or polling here?" or "why is this request taking 500ms?" Networking gives you the vocabulary and mental model to answer these confidently.` },
      { type: 'text', heading: 'The Networking Stack: OSI Model in 60 Seconds', body: `Networks are built in layers, each handling a different concern. You do not need to memorize all seven OSI layers, but understanding three of them is essential for system design.\n\nThe Network Layer (Layer 3) is where IP lives. It handles addressing and routing — getting packets from one machine to another across the internet. Every device gets an IP address, and routers use these addresses to forward packets toward their destination.\n\nThe Transport Layer (Layer 4) is where TCP and UDP live. This layer provides end-to-end communication between applications. TCP adds reliability and ordering on top of IP. UDP skips those guarantees for speed.\n\nThe Application Layer (Layer 7) is where HTTP, DNS, WebSockets, and gRPC live. These are the protocols your application code actually interacts with. When you hear "Layer 7 load balancer," it means the load balancer understands HTTP and can make routing decisions based on URLs, headers, and cookies. A "Layer 4 load balancer" only sees TCP connections and IP addresses — faster but less intelligent.\n\nWhy does this matter? When you draw a load balancer in your system design, knowing whether it operates at L4 or L7 determines what it can do. When you choose between TCP and UDP for a feature, you are making a Layer 4 decision. When you pick between REST and WebSockets, that is a Layer 7 decision.` },
      { type: 'diagram', variant: 'osi-layers', heading: 'The OSI Model', caption: 'Seven layers — but only three matter for system design interviews (highlighted in color).' },
      { type: 'text', heading: 'IP Addressing: Public, Private, and NAT', body: `Every device on a network has an IP address. There are two types that matter for system design.\n\nPublic IP addresses are routable on the internet. When you deploy a server on AWS, it gets a public IP that anyone in the world can reach. These are scarce (IPv4 has only about 4.3 billion addresses) and expensive.\n\nPrivate IP addresses (like 10.x.x.x or 192.168.x.x) are only reachable within a private network. Your application servers, databases, and caches should all live on private IPs inside a Virtual Private Cloud (VPC). They cannot be reached from the internet directly — which is exactly what you want for security.\n\nNAT (Network Address Translation) bridges the gap. It allows devices with private IPs to access the internet by translating their private address to a public one. This is how your home router works — all your devices share one public IP.\n\nIn system design, the key principle is: only load balancers and API gateways need public IPs. Everything else — application servers, databases, caches, message queues — should be on private networks. This is a basic security practice that interviewers expect you to know.` },
      { type: 'animation', id: 'vpc-architecture', heading: 'VPC Architecture: Public vs Private', body: 'Only the load balancer is exposed to the internet. Everything else lives in a private network with no direct internet access.' },
      { type: 'text', heading: 'The Networking Stack: Layers That Matter', body: `Networks are built in layers, each one abstracting away the complexity below it. The full OSI model has 7 layers, but for system design interviews, you only need to care about three:\n\nThe Network Layer (Layer 3) is where IP lives. It handles addressing and routing — given a destination IP address, the network figures out how to get your data there by hopping through routers across the internet. Every device on the internet has an IP address. IPv4 addresses look like 192.168.1.1 (32 bits, about 4.3 billion possible addresses — we are running out). IPv6 addresses are much longer and provide essentially unlimited addresses, but adoption is still gradual. In system design, you will encounter public IPs (routable on the internet) and private IPs (used inside your network, like 10.x.x.x or 192.168.x.x). Your application servers typically have private IPs, and only your load balancer has a public IP.\n\nThe Transport Layer (Layer 4) is where TCP and UDP live. This layer provides end-to-end communication between applications. TCP gives you reliable, ordered delivery. UDP gives you speed without guarantees. When you hear "Layer 4 load balancer," it means the load balancer makes routing decisions based on IP and port without looking at the HTTP content.\n\nThe Application Layer (Layer 7) is where HTTP, DNS, WebSockets, and gRPC live. This is where most developers spend their time. When you hear "Layer 7 load balancer," it means the load balancer can inspect HTTP headers, URLs, and cookies to make smarter routing decisions.\n\nThese layers work together like nesting dolls. Your HTTP request (Layer 7) is wrapped in a TCP segment (Layer 4), which is wrapped in an IP packet (Layer 3), which is wrapped in an Ethernet frame (Layer 2) and sent as electrical signals or light pulses over a wire or fiber (Layer 1). At the other end, each layer is unwrapped in reverse order until the server gets your HTTP request.` },
      { type: 'animation', id: 'http-request', heading: 'The Journey of a Request', body: 'When you type a URL, a chain of events happens before you see a single pixel. Each step can fail. Each step can be slow.' },
      { type: 'text', heading: 'What Actually Happens When You Visit a Website', body: `When you type "google.com" into your browser, here is what happens behind the scenes:\n\nFirst, your browser needs to figure out where google.com actually lives. It asks DNS — the internet\'s address book — to translate "google.com" into an IP address like 142.250.80.46. This is like looking up a contact in your phone instead of memorizing their number.\n\nOnce the browser has the IP address, it opens a TCP connection. Think of this as a polite introduction — your browser says "Hey, want to talk?" (SYN), the server says "Sure, let\'s talk" (SYN-ACK), and your browser says "Great, here we go" (ACK). This three-way handshake guarantees both sides are ready, but it costs one full round trip before any actual data flows.\n\nIf the site uses HTTPS (and it should), there is an additional TLS handshake to set up encryption. TLS 1.3 does this in just one round trip. TLS 1.2 takes two.\n\nFinally, the browser sends the actual HTTP request — "GET /search?q=cats" — and the server responds with the page content. The browser parses the HTML, discovers it needs CSS, JavaScript, and images, and fires off more requests for those.\n\nFor a server in the same datacenter, this whole process takes a few milliseconds. For a server across the world? Each round trip adds 150-300ms. That is why understanding where latency comes from matters so much.` },
      { type: 'diagram', variant: 'url-journey', heading: 'What Happens When You Type a URL', caption: 'The complete journey from keystroke to rendered page — 8 steps, each adding latency.' },
      { type: 'animation', id: 'dns-resolution', heading: 'DNS: The Internet\'s Address Book', body: 'DNS translates human-readable domain names into IP addresses through a chain of nameservers. Results are cached at every level.' },
      { type: 'text', heading: 'DNS Deep Dive', body: `Think of DNS as the contact list on your phone. You do not memorize phone numbers — you save "Mom" and your phone knows to dial the right number. DNS works the same way. Humans remember names (google.com). Computers need numbers (142.250.80.46). DNS translates between them.\n\nWhen your browser needs to resolve a domain, it checks several caches first: the browser cache, then the operating system cache, then your ISP\'s recursive resolver. If none of them have the answer, the resolver walks up the DNS hierarchy — asking the root nameserver, then the TLD nameserver (.com), then the authoritative nameserver for that domain — until it gets the IP address.\n\nA fresh DNS lookup typically takes 10-100ms, but cached lookups are nearly instant. This is why TTL (Time To Live) matters. A high TTL (24 hours) means fewer DNS queries but slower propagation when you change your IP. A low TTL (60 seconds) means faster failover but more DNS traffic. For critical services, 1-5 minute TTLs give you the ability to redirect traffic quickly when things break.\n\nDNS also plays a role in system design beyond simple lookups. GeoDNS returns different IP addresses based on where the user is located — a user in India gets routed to your Mumbai datacenter, while a user in the US gets your Virginia datacenter. This reduces latency by keeping users close to their servers. However, DNS-based load balancing has serious limitations: it cannot do health checks (it will happily return the IP of a dead server), and caching means changes take minutes to propagate.` },
      { type: 'animation', id: 'tcp-handshake', heading: 'TCP: The Reliable Handshake', body: 'TCP\'s three-way handshake ensures both sides are ready before data flows. It costs one round trip of latency.' },
      { type: 'text', heading: 'IP Addressing, NAT, and Private Networks', body: `Every device on the internet needs an address. IPv4 gives us about 4.3 billion addresses (32-bit numbers like 192.168.1.1), which sounds like a lot until you realize there are far more devices than that. IPv6 solves this with 128-bit addresses, but adoption is slow.\n\nTo work around the IPv4 shortage, most networks use NAT (Network Address Translation). Your home router has one public IP address visible to the internet, but all your devices (phone, laptop, smart TV) have private IP addresses (like 192.168.x.x) that only exist inside your home network. When your laptop sends a request to google.com, the router translates the private IP to its public IP before sending it out, and translates back when the response comes in.\n\nIn system design, the same pattern applies at a larger scale. Your application servers, databases, and caches all sit in a private network (a VPC in AWS terms) with private IPs. Only your load balancer has a public IP. This is a fundamental security practice — your database should never be directly accessible from the internet. Traffic flows: Internet → Load Balancer (public IP) → App Servers (private IP) → Database (private IP, no internet access at all).` },
      { type: 'text', heading: 'TCP vs UDP: Reliability vs Speed', body: `TCP is like a phone call. Before you can talk, there is a ritual — you say hello, they say hello back, you confirm you can hear each other. Only then does the actual conversation begin. TCP guarantees that every piece of data arrives, in order, without corruption. If a packet gets lost, TCP detects it and resends it. This reliability comes at a cost: the three-way handshake adds one round trip of latency before any data flows, and retransmissions add more if the network is lossy.\n\nUDP is the rude alternative. No handshake, no guarantees. It just starts sending data and hopes for the best. Packets can arrive out of order, get duplicated, or not arrive at all. But it is significantly faster because there is no setup overhead and no waiting for acknowledgments.\n\nSo when do you use which? TCP is the default for almost everything on the web — HTTP, email, file transfers, database connections. You want reliability. UDP is for situations where speed matters more than perfection: video calls (a dropped frame is better than a delayed one), online gaming (you want the latest position, not a retransmission of an old one), and DNS queries (small, single-packet requests where the overhead of TCP setup is not worth it).\n\nThe key insight for system design: TCP trades latency for reliability. UDP trades reliability for speed. Most of the systems you will design use TCP (via HTTP). Real-time features like live video or gaming might use UDP.` },
      { type: 'text', heading: 'Latency vs Bandwidth', body: `These two concepts confuse people constantly, so let us make it simple with an analogy.\n\nLatency is how long it takes for data to travel from point A to point B. Think of it as the length of a highway. A 100-kilometer highway takes time to drive, no matter how many lanes it has.\n\nBandwidth is how much data can flow at once. Think of it as how many lanes the highway has. More lanes means more cars at the same time, but each car still takes the same time to reach the destination.\n\nSome numbers to internalize: same datacenter is about 0.5ms, same region is 5-20ms, cross-continent (New York to London) is about 50-100ms, and around the world (New York to Tokyo) is 150-300ms. Light in fiber travels roughly 200km per millisecond. New York to London is about 5,500km, which means 27ms one way, 55ms round trip. No amount of money or engineering beats physics.\n\nThe critical insight: more bandwidth does not reduce latency. They are different problems with different solutions. If your users in India are experiencing 300ms latency to your Virginia server, buying a bigger pipe will not help. You need to put a server closer to them (CDN, multi-region deployment).` },
      { type: 'text', heading: 'HTTP: How Browsers Talk to Servers', body: `HTTP is the language your browser uses to talk to servers. Think of it as a formal letter exchange. The browser sends a request ("I would like the user profile for user 123") and the server sends a response ("Here it is, along with a 200 OK status code").\n\nHTTP has evolved significantly over the years. HTTP/1.1, released in 1997, allows only one request at a time per connection. Browsers work around this by opening 6 parallel connections, but it is still a bottleneck. HTTP/2, released in 2015, introduced multiplexing — multiple requests can fly over a single connection simultaneously. It also compresses headers (which were surprisingly large in HTTP/1.1) and is roughly 2x faster for most workloads. HTTP/3, released in 2022, replaces TCP with QUIC (a UDP-based protocol) to eliminate a subtle problem called head-of-line blocking and reduce connection setup time. It is especially good on lossy networks like mobile.\n\nIn system design interviews, you do not need to go deep on HTTP versions. But mentioning that your system uses HTTP/2 for performance, or that HTTP/3 helps mobile clients, shows awareness.` },
      { type: 'text', heading: 'Real-Time Communication: When HTTP Is Not Enough', body: `Standard HTTP is request-response: the client asks, the server answers. But many features need the server to push data to clients without being asked — chat messages, live scores, stock prices, collaborative editing.\n\nThere are three main approaches, and knowing when to use each is a common interview question.\n\nWebSockets create a persistent, full-duplex connection. Once established, both the client and server can send messages at any time. Latency is very low (around 10ms) and the protocol is efficient for frequent messages. The trade-off is complexity: WebSocket connections are stateful, meaning a user is connected to a specific server. If that server goes down, the connection is lost. Scaling WebSockets requires sticky sessions or a pub/sub layer (like Redis Pub/Sub) so any server can route messages to any connected client. Use WebSockets for chat, collaborative editing, gaming, and live dashboards.\n\nServer-Sent Events (SSE) are simpler. The server pushes data to the client over a persistent HTTP connection, but only in one direction (server to client). The browser API handles reconnection automatically. SSE is perfect when you only need server-to-client updates: live feeds, notifications, stock tickers. It is much simpler to implement and scale than WebSockets.\n\nLong Polling is the simplest approach. The client sends a request, and the server holds it open until there is data to send (or a timeout). The client immediately sends another request after receiving a response. It works everywhere and requires no special infrastructure, but it is inefficient — each message costs a full HTTP round trip, and the server must hold many open connections.\n\nThe decision tree is straightforward: if you need bidirectional real-time communication, use WebSockets. If you only need server-to-client updates, use SSE. If you need broad compatibility with minimal infrastructure, use Long Polling.` },
      { type: 'text', heading: 'CDN: Bringing Content Closer to Users', body: `A CDN (Content Delivery Network) is a geographically distributed network of servers that caches content close to users. Without a CDN, every request for an image travels all the way to your origin server. If your server is in Virginia and the user is in India, that adds 250-300ms of latency per request. With a CDN, the same image is served from a nearby edge server in 20-40ms.\n\nHere is how it works: a user requests an image from your app. The request goes to the nearest CDN edge server. If the image is cached there, it is returned immediately (cache hit). If not, the CDN fetches it from your origin server, stores a copy, and returns it. Future users in that region get the image instantly.\n\nModern CDNs like Cloudflare, CloudFront, and Fastly can cache more than just static files — they can also cache API responses and even run edge logic. But the most common and most impactful use is still media delivery: images, videos, JavaScript, CSS, and fonts.\n\nIn system design interviews, introduce a CDN whenever your system serves static media at scale. It is almost always the right answer for images and videos. For dynamic content, caching at the CDN layer is trickier (you need short TTLs and careful invalidation), so mention it only if the problem specifically calls for it.` },
      { type: 'callout', variant: 'tip', heading: 'Latency Numbers to Memorize', body: 'DNS lookup: ~10ms. TCP handshake: ~1 round trip. TLS handshake: ~1-2 round trips. Same datacenter: 0.5ms. Cross-region: 50-100ms. Cross-continent: 150-300ms. Redis read: ~1ms. Database read: ~30-50ms. These numbers help you reason about where latency comes from and whether caching or CDN will help.' },
      { type: 'text', heading: 'HTTPS and TLS: Encryption Is Not Optional', body: `Without HTTPS, anyone on the network can read your data, modify it in transit, or impersonate your server. Every production system must use HTTPS.\n\nHTTPS is simply HTTP wrapped in TLS encryption. When a client connects, a TLS handshake happens after the TCP handshake. During this handshake, the server proves its identity with a certificate, and both sides agree on encryption keys. TLS 1.2 requires two round trips for this, while TLS 1.3 cuts it to one (and can even do zero round trips for returning connections). For a server 100ms away, TLS 1.2 adds 200ms of overhead. TLS 1.3 halves that.\n\nIn most architectures, TLS is terminated at the load balancer. This means the load balancer handles the encryption and decryption, and traffic between the load balancer and your backend servers is unencrypted (but within your private network). This simplifies backend code and reduces CPU usage on application servers. If you need true end-to-end encryption (for compliance reasons, for example), you can terminate TLS at the application level instead, but it costs more CPU.` },
      { type: 'text', heading: 'HTTP Methods and Status Codes', body: `HTTP methods tell the server what action you want to perform. GET retrieves data. POST creates something new. PUT replaces a resource entirely. PATCH updates part of a resource. DELETE removes it. In system design, you will define API endpoints using these methods, so knowing the conventions matters.\n\nStatus codes tell the client what happened. The 2xx range means success: 200 OK (here is your data), 201 Created (the new resource was created), 204 No Content (done, nothing to return). The 3xx range means redirection: 301 Moved Permanently, 302 Found (temporary redirect). The 4xx range means the client made an error: 400 Bad Request (malformed input), 401 Unauthorized (not logged in), 403 Forbidden (logged in but not allowed), 404 Not Found, 429 Too Many Requests (rate limited). The 5xx range means the server failed: 500 Internal Server Error, 502 Bad Gateway (upstream server is broken), 503 Service Unavailable (overloaded or in maintenance).\n\nA common interview detail: for URL shorteners, use 302 (temporary redirect) instead of 301 (permanent). With 301, browsers cache the redirect and never call your server again, which means you lose all analytics tracking.` },
      { type: 'text', heading: 'Connection Pooling: Stop Rebuilding the Road Every Trip', body: `Remember all those steps to establish a connection? DNS lookup, TCP handshake, TLS handshake. For a server 50ms away, that is 150-200ms before any actual data flows. Now imagine doing that for every single request. User clicks a button? 200ms of handshaking. Loads an image? Another 200ms. Your app feels sluggish even though your server responds in 5ms.\n\nThe solution is connection reuse. HTTP/1.1 introduced keep-alive connections: instead of closing the connection after each request, the browser keeps it open and sends multiple requests over the same connection. One handshake, many requests.\n\nFor server-to-server communication, connection pooling takes this further. Instead of opening a new connection for each request to your database or another service, you maintain a pool of pre-established connections. When your code needs a connection, it borrows one from the pool. When it is done, it returns it. This eliminates the handshake overhead entirely for most requests.\n\nWatch out for connection leaks: if your code borrows a connection but forgets to return it (because of an exception, for example), the pool slowly drains until nothing works. Always use try/finally patterns to ensure connections are returned.\n\nAlso be aware of server-side connection limits. PostgreSQL defaults to 100 max connections. MySQL defaults to 151. If your connection pool is too large, or you have too many application servers each with their own pool, you can exhaust the database connection limit. This is a surprisingly common cause of production outages.` },
      { type: 'text', heading: 'Timeouts: Every Network Call Needs One', body: `Without a timeout, a stuck dependency blocks your service forever. A database that hangs, an external API that never responds, a DNS server that is unreachable — without timeouts, your application threads pile up waiting, and eventually your entire service becomes unresponsive.\n\nReasonable timeout values depend on the call: database queries should timeout in 5-30 seconds, internal API calls in 1-5 seconds, external API calls in 5-10 seconds, and user-facing requests should have a total budget of about 30 seconds.\n\nCascading timeouts are critical to get right. If Service A calls Service B, which calls Service C, then A\'s timeout to B must be longer than B\'s timeout to C. Otherwise, A gives up before B even finishes its work. A common pattern is to set each downstream timeout shorter than the upstream one, leaving room for retries.\n\nIn system design interviews, mentioning timeouts shows operational maturity. When you draw a connection between two services, the interviewer appreciates hearing "and this call has a 3-second timeout with one retry."` },
      { type: 'text', heading: 'Retries, Backoff, and Idempotency', body: `When a network call fails, the natural instinct is to try again. Retries are indeed one of the most effective strategies for handling transient failures — a server that was momentarily overloaded, a network blip, a brief DNS hiccup. But naive retries can make things worse.\n\nImagine a server that is struggling under load. If every client immediately retries its failed request, the server now has twice the traffic. The retries fail too, so clients retry again. The server is drowning. This is why retries should always use exponential backoff: wait 1 second, then 2, then 4, then 8. Adding random jitter (a small random delay) prevents all clients from retrying at exactly the same time, which would create a synchronized thundering herd.\n\nBut retries introduce another problem: what if the original request actually succeeded, but the response was lost? If you are retrying a payment request, you might charge the customer twice. This is where idempotency comes in. An idempotent operation produces the same result no matter how many times you execute it. GET requests are naturally idempotent. For non-idempotent operations like payments, the client generates a unique idempotency key for each logical operation. The server checks whether it has already processed a request with that key, and if so, returns the cached result instead of processing it again.\n\nIn interviews, the magic phrase is "retry with exponential backoff and jitter." For senior-level discussions, mentioning idempotency keys for write operations shows real-world experience.` },
      { type: 'text', heading: 'Circuit Breakers: Preventing Cascading Failures', body: `Sometimes a dependency does not just have a transient failure — it is genuinely down and will stay down for a while. If your service keeps retrying requests to a dead database, those retries consume threads, connections, and time. Meanwhile, your own service becomes slow and unresponsive, which causes the services that depend on you to also become slow. This is a cascading failure, and it is one of the most dangerous failure modes in distributed systems.\n\nA circuit breaker is a pattern inspired by electrical circuit breakers. It monitors the failure rate of calls to a dependency. When failures exceed a threshold (say, 50% of requests in the last 30 seconds), the circuit "trips" to an open state. While open, all requests to that dependency immediately fail without even attempting the call. This is called "failing fast" — it is much better to return an error in 1ms than to wait 30 seconds for a timeout.\n\nAfter a cooldown period, the circuit moves to a "half-open" state and allows a single test request through. If it succeeds, the circuit closes and normal traffic resumes. If it fails, the circuit stays open for another cooldown period.\n\nCircuit breakers are especially valuable when an interviewer asks "what happens when this service goes down?" Being able to describe the circuit breaker pattern and where you would apply it — database connections, external API calls, service-to-service communication — demonstrates the kind of operational thinking that comes from real production experience.` },
      { type: 'animation', id: 'circuit-breaker', heading: 'Circuit Breaker: Interactive Demo', body: 'Click to simulate failures and see how the circuit breaker transitions between Closed → Open → Half-Open states.' },
      { type: 'text', heading: 'Load Balancing Basics', body: `When you have multiple servers, you need something to decide which server handles each request. That is a load balancer. In system design, load balancers appear in almost every architecture diagram, sitting between clients and your application servers.\n\nThere are two types that matter for interviews. Layer 4 (L4) load balancers operate at the TCP level. They look at IP addresses and ports but do not inspect the actual content of requests. They are fast and efficient, and they maintain the TCP connection between client and server. This makes them ideal for WebSocket connections and other protocols that need persistent connections.\n\nLayer 7 (L7) load balancers operate at the HTTP level. They can inspect request content — URLs, headers, cookies — and make smarter routing decisions. For example, an L7 load balancer can route /api requests to API servers and /static requests to a CDN. The trade-off is that L7 load balancers terminate the client connection and create a new one to the backend, which adds a small amount of overhead.\n\nFor most HTTP-based systems, use an L7 load balancer. For WebSocket connections, use an L4 load balancer (or an L7 that explicitly supports WebSocket upgrades).\n\nCommon load balancing algorithms include round-robin (requests go to servers in rotation), least connections (send to the server with fewest active connections — good for WebSockets), and IP hash (same client always goes to the same server — useful for session affinity).\n\nLoad balancers also perform health checks, periodically pinging backend servers to verify they are alive. If a server fails its health check, the load balancer stops sending traffic to it until it recovers. This automatic failover is what makes load balancers essential for high availability.` },
      { type: 'animation', id: 'load-balancer-types', heading: 'L4 vs L7 Load Balancers', body: 'Toggle between Layer 4 and Layer 7 to see how they route traffic differently.' },
      { type: 'diagram', variant: 'lb-algorithms', heading: 'Load Balancing Algorithms', caption: 'Five common algorithms — each suited for different workloads.' },
      { type: 'text', heading: 'Vertical vs Horizontal Scaling', body: `When your system needs to handle more traffic, you have two fundamental options.\n\nVertical scaling (scaling up) means getting a bigger machine — more CPU, more RAM, faster disks. It is simple because your code does not change. There is no distributed system complexity, no data consistency issues, no need for load balancers. The downside is that hardware has limits. The biggest server money can buy still has a ceiling, and it is a single point of failure. If it goes down, everything goes down.\n\nHorizontal scaling (scaling out) means adding more machines and distributing the work across them. This is theoretically unlimited — you can always add another server. It also gives you high availability because if one server dies, the others keep running. The downside is complexity: you need load balancers to distribute traffic, you need to handle data consistency across machines, and your application must be designed to be stateless (or use shared state stores like Redis).\n\nIn practice, most systems use both. You vertically scale each individual server to a reasonable size (modern cloud instances are very powerful), and then horizontally scale by adding more of them behind a load balancer. The interview answer is almost always horizontal scaling, because interviewers want to see that you can design distributed systems. But mentioning that you would start with vertical scaling for simplicity and switch to horizontal when needed shows pragmatism.` },
      { type: 'diagram', variant: 'scaling-types', heading: 'Vertical vs Horizontal Scaling', caption: 'One big machine vs many small machines — most production systems use both.' },
      { type: 'text', heading: 'How a Packet Actually Travels', body: `Understanding the full journey of a packet helps you reason about where things can go wrong. When your browser sends a request to a server across the world, here is what happens at each layer:\n\nYour application creates an HTTP request (Layer 7). The operating system wraps it in a TCP segment with source and destination ports (Layer 4). Then it wraps that in an IP packet with source and destination IP addresses (Layer 3). Finally, it wraps that in an Ethernet frame with MAC addresses for the next hop (Layer 2) and sends it as electrical signals over your network cable or WiFi (Layer 1).\n\nThe packet hits your home router, which uses NAT to replace your private IP with its public IP. The router then forwards the packet to your ISP. From there, the packet hops through multiple routers on the internet backbone — each router looks at the destination IP and forwards the packet one hop closer to its destination. This is like a relay race where each runner passes the baton to the next.\n\nWhen the packet arrives at the destination network, it goes through the reverse process: the load balancer receives it, unwraps the layers, reads the HTTP request, and forwards it to the appropriate backend server. The server processes the request and sends a response back through the same chain in reverse.\n\nEach hop adds a small amount of latency. A packet from New York to Mumbai might pass through 15-20 routers, each adding a fraction of a millisecond. Combined with the speed-of-light delay over thousands of kilometers of fiber, this is why cross-continent requests take 150-300ms.` },
      { type: 'text', heading: 'Network Security Essentials', body: `Security is not optional in modern systems. Here are the networking security concepts that come up in system design interviews.\n\nFirewalls filter traffic based on rules. In cloud environments, security groups act as virtual firewalls — you define which ports and IP ranges can access each server. A common setup: your load balancer accepts traffic on ports 80 (HTTP) and 443 (HTTPS) from anywhere, your app servers accept traffic only from the load balancer, and your database accepts traffic only from app servers. This layered approach means even if an attacker compromises your load balancer, they cannot directly access your database.\n\nDDoS (Distributed Denial of Service) attacks flood your servers with so much traffic that legitimate users cannot get through. Defenses include rate limiting at the load balancer or API gateway, using a CDN like Cloudflare that absorbs attack traffic at the edge, and auto-scaling to handle traffic spikes (though this can get expensive).\n\nSSL/TLS certificates prove your server is who it claims to be. Without them, an attacker could set up a fake server and intercept traffic (a man-in-the-middle attack). Certificate management is a real operational concern — expired certificates cause outages. Use automated renewal services like Let\'s Encrypt or AWS Certificate Manager.\n\nIn interviews, you do not need to go deep on security unless asked. But mentioning "HTTPS everywhere, database in a private subnet, security groups restricting access" shows you think about security as part of the design, not as an afterthought.` },
      { type: 'text', heading: 'Reverse Proxy and API Gateway', body: `A reverse proxy is a server that sits in front of your backend servers and forwards client requests to them. From the client's perspective, it looks like they are talking directly to the backend — they have no idea a proxy is involved. This is different from a forward proxy (like a VPN), which sits in front of clients.\n\nReverse proxies serve several purposes in system design. They can distribute load across multiple servers (acting as a load balancer), cache responses to reduce backend load, terminate SSL/TLS so backends do not need to handle encryption, compress responses to save bandwidth, and protect backend servers by hiding their IP addresses from the internet.\n\nAn API Gateway is a specialized reverse proxy designed specifically for APIs. In addition to everything a reverse proxy does, an API Gateway handles authentication and authorization (verifying API keys or JWT tokens), rate limiting (preventing abuse), request transformation (converting between protocols or formats), routing (directing requests to the correct microservice based on the URL path), and analytics (logging and monitoring API usage).\n\nIn system design interviews, you will often draw a load balancer or API gateway at the entry point of your system. Knowing the difference matters: a load balancer distributes traffic, a reverse proxy adds features like caching and SSL termination, and an API gateway adds API-specific features like auth and rate limiting. In practice, tools like Nginx and Kong can serve all three roles.` },
      { type: 'text', heading: 'Rate Limiting', body: `Rate limiting controls how many requests a client can make to your API within a given time window. It protects your system from abuse, prevents denial-of-service attacks, and ensures fair usage across all clients.\n\nThe most common approach is to track requests per client (identified by API key, user ID, or IP address) and reject requests that exceed the limit with a 429 Too Many Requests status code. The response typically includes headers telling the client how many requests they have remaining and when the limit resets.\n\nThere are several algorithms for implementing rate limiting. The token bucket algorithm is the most popular — imagine a bucket that holds N tokens and refills at a steady rate. Each request consumes one token. If the bucket is empty, the request is rejected. This naturally allows short bursts (up to the bucket size) while enforcing an average rate.\n\nIn distributed systems, rate limiting counters need to be shared across all your servers. Redis is the standard choice for this — its atomic INCR command with EXPIRE provides a simple and fast way to track request counts per client per time window.\n\nRate limiting is typically implemented at the API Gateway or load balancer level, not in your application code. This centralizes the logic and applies it consistently across all endpoints.` },
      { type: 'text', heading: 'Throughput vs Latency', body: `Throughput and latency are both measures of system performance, but they measure different things and optimizing for one does not necessarily improve the other.\n\nLatency is the time it takes for a single request to complete — from the moment the client sends it to the moment the response arrives. It is measured in milliseconds. Low latency means fast individual responses.\n\nThroughput is the total number of requests your system can handle per unit of time — typically measured in requests per second (RPS) or queries per second (QPS). High throughput means your system can serve many users simultaneously.\n\nA system can have low latency but low throughput (a single fast server that can only handle one request at a time), or high throughput but high latency (a batch processing system that handles millions of records but takes minutes per batch). The goal in system design is usually to optimize both — fast individual responses AND the ability to handle many concurrent users.\n\nWhen an interviewer asks about performance, clarify whether they mean latency (how fast) or throughput (how many). The solutions are often different: caching and CDNs reduce latency, while horizontal scaling and load balancing increase throughput.` },
      { type: 'text', heading: 'Network Congestion', body: `Network congestion occurs when the volume of data traffic exceeds the network's capacity to handle it. Think of it like a traffic jam on a highway — when too many cars try to use the same road at the same time, everyone slows down.\n\nCongestion manifests as increased latency, packet loss (the network drops packets it cannot handle), and connection timeouts. In severe cases, it can cause a congestive collapse where the network becomes essentially unusable.\n\nTCP has built-in congestion control mechanisms. When TCP detects packet loss (which it interprets as a sign of congestion), it reduces its sending rate. It then gradually increases the rate again until it finds the maximum sustainable throughput. This is called the TCP congestion window and it uses algorithms like slow start and congestion avoidance.\n\nIn system design, congestion is relevant when you are designing systems that generate a lot of network traffic — video streaming, large file transfers, or services with millions of concurrent connections. Solutions include using CDNs to distribute traffic geographically, implementing backpressure mechanisms (where downstream services signal upstream services to slow down), and using message queues to buffer traffic spikes instead of letting them hit your servers directly.` },
      {
        type: 'quiz',
        heading: 'Test Your Knowledge: Networking',
        description: 'See how well you understood the networking concepts above.',
        questions: [
          {
            question: 'What does DNS do?',
            options: ['Encrypts HTTP traffic', 'Translates domain names to IP addresses', 'Compresses HTTP headers', 'Manages TCP connections'],
            correct: 1,
            explanation: 'DNS translates human-readable domain names like google.com into IP addresses like 142.250.80.46 that computers use to find each other.',
          },
          {
            question: 'Which protocol would you choose for a real-time chat application?',
            options: ['HTTP Long Polling', 'Server-Sent Events (SSE)', 'WebSockets', 'UDP'],
            correct: 2,
            explanation: 'WebSockets provide full-duplex, bidirectional communication over a persistent connection — ideal for chat where both client and server need to send messages at any time.',
          },
          {
            question: 'What is the main advantage of HTTP/2 over HTTP/1.1?',
            options: ['Uses UDP instead of TCP', 'Multiplexing — multiple requests over one connection', 'End-to-end encryption', 'Smaller response bodies'],
            correct: 1,
            explanation: 'HTTP/2 multiplexes multiple requests over a single TCP connection, eliminating the head-of-line blocking problem that limited HTTP/1.1 to one request at a time.',
          },
          {
            question: 'A user in India experiences 300ms latency to your Virginia server. What is the best solution?',
            options: ['Increase server bandwidth', 'Add a CDN or deploy a server closer to India', 'Switch from TCP to UDP', 'Use HTTP/3'],
            correct: 1,
            explanation: 'The 300ms latency is caused by physical distance. No amount of bandwidth fixes this. You need to put content or servers closer to the user — either via CDN for static content or a regional deployment for dynamic content.',
          },
          {
            question: 'Why does TCP require a three-way handshake before sending data?',
            options: ['To encrypt the connection', 'To compress the data', 'To ensure both sides are ready and can communicate reliably', 'To resolve the domain name'],
            correct: 2,
            explanation: 'The three-way handshake (SYN, SYN-ACK, ACK) ensures both the client and server are ready to communicate and establishes the parameters for a reliable, ordered connection.',
          },
          {
            question: 'What is the difference between a reverse proxy and a load balancer?',
            options: ['They are the same thing', 'A reverse proxy hides backend servers and adds features like caching/SSL; a load balancer distributes traffic', 'A load balancer encrypts traffic; a reverse proxy does not', 'A reverse proxy is client-side; a load balancer is server-side'],
            correct: 1,
            explanation: 'A reverse proxy sits in front of backends and can cache, terminate SSL, and compress responses. A load balancer specifically distributes traffic across servers. In practice, tools like Nginx do both.',
          },
          {
            question: 'A client sends 150 requests in one minute but the rate limit is 100/min. What HTTP status code should the server return?',
            options: ['403 Forbidden', '429 Too Many Requests', '503 Service Unavailable', '408 Request Timeout'],
            correct: 1,
            explanation: '429 Too Many Requests is the standard status code for rate limiting. It tells the client they have exceeded the allowed request rate and should slow down.',
          },
          {
            question: 'Which load balancing algorithm is best for WebSocket connections?',
            options: ['Round Robin', 'Least Connections', 'Random', 'IP Hash'],
            correct: 1,
            explanation: 'Least Connections routes new requests to the server with fewest active connections. Since WebSocket connections are long-lived, this prevents one server from accumulating all connections over time.',
          },
          {
            question: 'Your service calls a database that is down. After 10 failed requests, all subsequent calls immediately return an error without even trying the database. What pattern is this?',
            options: ['Rate Limiting', 'Circuit Breaker', 'Retry with Backoff', 'Load Balancing'],
            correct: 1,
            explanation: 'A circuit breaker monitors failure rates and "trips open" after a threshold, causing all subsequent calls to fail fast without attempting the actual call. This prevents cascading failures.',
          },
          {
            question: 'What is the key difference between latency and throughput?',
            options: ['They are the same metric measured differently', 'Latency is time per request; throughput is requests per second', 'Latency is for reads; throughput is for writes', 'Throughput is always higher than latency'],
            correct: 1,
            explanation: 'Latency measures how long a single request takes (milliseconds). Throughput measures how many requests the system handles per unit time (requests/second). Optimizing one does not necessarily improve the other.',
          },
          {
            question: 'Why should databases never have public IP addresses?',
            options: ['Public IPs are too expensive', 'Databases cannot use public IPs', 'It exposes the database directly to the internet, creating a security risk', 'Public IPs cause higher latency'],
            correct: 2,
            explanation: 'Databases should sit in a private subnet with no internet access. Only load balancers need public IPs. Traffic flows: Internet → Load Balancer (public) → App Servers (private) → Database (private).',
          },
          {
            question: 'What happens when a popular cache key expires and thousands of requests simultaneously hit the database?',
            options: ['Rate limiting', 'Cache stampede (thundering herd)', 'Circuit breaker trip', 'DNS resolution failure'],
            correct: 1,
            explanation: 'A cache stampede (or thundering herd) occurs when a hot cache key expires and many requests simultaneously miss the cache and flood the database. Solutions include request coalescing and probabilistic early expiration.',
          },
        ],
      },
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
      { type: 'text', heading: 'How to Choose a Database', body: `**Default choice:** PostgreSQL. It handles 90% of use cases well.\n\n**Choose NoSQL when:**\n- You need horizontal write scalability beyond what a single primary can handle\n- Your data is naturally document-shaped (nested JSON)\n- You have simple access patterns (key-value lookups)\n- You need very low latency at massive scale\n\n**Choose SQL when:**\n- You need ACID transactions (financial data, inventory)\n- You have complex queries with JOINs\n- Your data has strong relationships\n- You need ad-hoc querying and reporting\n\n**In interviews:** Don't overthink the DB choice. Pick one, explain why, and move on. The interviewer cares more about your reasoning than the specific choice.` },
    ],
  },

  'caching': {
    slug: 'caching',
    title: 'Caching',
    subtitle: 'Speed up reads and reduce database load with caching',
    duration: '30 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'Why Cache?', body: `In system design interviews, caching comes up almost every time you need to handle high read traffic. Your database becomes the bottleneck, latency starts creeping up, and the interviewer is waiting for you to say the word: cache.\n\nReading a user profile from PostgreSQL may take 30-50ms, but reading from Redis takes just 1ms. That's a 30-50x improvement. Databases store data on disk; caches store data in memory, which sits much closer to the CPU.\n\n**Cache hit** — Data found in cache → fast response (~1ms)\n**Cache miss** — Data not in cache → fetch from DB (~50ms), store in cache\n\nTypical cache hit rates in production: 80-99%` },
      { type: 'animation', id: 'cache-flow', heading: 'Cache Hit vs Cache Miss', body: 'Cache hit returns data instantly. Cache miss fetches from DB and populates the cache.' },
      { type: 'text', heading: 'Where to Cache', body: `Caching shows up at multiple layers. In interviews, external caching (Redis) is the default, but knowing the other layers shows depth.\n\n**External Cache (Redis/Memcached)** — Standalone cache service between your app and DB. Every app server shares the same cache. This is what interviewers expect you to discuss first.\n\n**CDN (Content Delivery Network)** — Geographically distributed edge servers that cache static content (images, JS, CSS) close to users. Without CDN: 250-300ms latency from Virginia to India. With CDN: 20-40ms from nearest edge. Introduce CDN when your system serves static media at scale.\n\n**Client-Side Cache** — Browser cache (HTTP cache, localStorage), mobile app local storage. You have limited control from the backend. Data can go stale. Useful for reducing network calls.\n\n**In-Process Cache** — Data cached directly in the application's memory. Even faster than Redis (no network call). Good for small, frequently accessed data that rarely changes: config values, feature flags, hot keys. Each server has its own copy — not shared across instances.` },
      { type: 'text', heading: 'Cache Architectures', body: `**Cache-Aside (Lazy Loading)** — The most common pattern. Default to this in interviews.\n1. App checks cache\n2. If hit → return data\n3. If miss → fetch from DB, store in cache, return\n\nOnly caches data when needed, keeping the cache lean. Downside: first request for any key always hits DB.\n\n**Write-Through** — App writes to cache, cache synchronously writes to DB. Cache is always fresh, but writes are slower (must wait for both). Still has dual-write consistency issues.\n\n**Write-Behind (Write-Back)** — App writes to cache, cache batches and writes to DB asynchronously. Very fast writes, but risk of data loss if cache crashes before flushing. Good for analytics/metrics.\n\n**Read-Through** — Cache acts as a proxy. On miss, cache itself fetches from DB. CDNs are a form of read-through cache. Rarely used for application-level caching.\n\nIf you only remember one pattern: **cache-aside**.` },
      { type: 'text', heading: 'Cache Eviction Policies', body: `Caches have limited memory. When full, they need a strategy for what to remove.\n\n**LRU (Least Recently Used)** — Evict the item not accessed for the longest time. Default in most systems. Adapts well to workloads where recently used data is likely to be used again.\n\n**LFU (Least Frequently Used)** — Evict the item accessed least often. Works well when certain keys are consistently popular (trending videos, top playlists).\n\n**FIFO (First In First Out)** — Evict the oldest item. Ignores usage patterns. Rarely used in real systems.\n\n**TTL (Time To Live)** — Not an eviction policy by itself. Sets an expiration time per key. Often combined with LRU. Essential when data must eventually refresh (API responses, sessions).` },
      { type: 'text', heading: 'Common Caching Problems', body: `Caching makes systems faster but introduces new failure modes. Interviewers use these to test whether you understand the trade-offs.\n\n**Cache Stampede (Thundering Herd)**\nA popular cache entry expires and hundreds of requests simultaneously try to rebuild it, overwhelming the DB.\nSolutions: Request coalescing (only one request rebuilds, others wait), cache warming (refresh before expiry), probabilistic early expiration.\n\n**Cache Consistency**\nCache and DB return different values. Happens because you write to DB first but cache still holds old data.\nSolutions: Invalidate cache on writes (delete the key after DB update), short TTLs for stale tolerance, accept eventual consistency for feeds/metrics.\n\n**Hot Keys**\nOne cache key gets millions of requests/sec (e.g., Taylor Swift's profile on Twitter). Even with caching, that one key can overload a single Redis node.\nSolutions: Replicate hot keys across multiple cache nodes, add in-process cache as fallback, rate limit abusive patterns.` },
      { type: 'text', heading: 'Redis vs Memcached', body: `**Redis:**\n- Rich data structures (strings, lists, sets, sorted sets, hashes)\n- Persistence (RDB snapshots + AOF append-only file)\n- Pub/Sub messaging, Lua scripting\n- Single-threaded but ~100K ops/sec\n- Use for: sessions, leaderboards, rate limiting, queues, distributed locks\n\n**Memcached:**\n- Simple key-value only\n- Multi-threaded (better raw throughput for simple gets/sets)\n- No persistence — pure cache\n- Use for: simple object caching\n\n**Default choice:** Redis. It does everything Memcached does and more.` },
      { type: 'text', heading: 'How to Talk About Caching in Interviews', body: `Don't jump straight to caching. Establish why it's necessary first.\n\n**1. Identify the bottleneck**\n"User profile queries are hitting the DB 500 times/sec during peak. Each query takes 30ms. That's our bottleneck."\n\n**2. Decide what to cache**\nFocus on data that is read frequently, doesn't change often, and is expensive to fetch.\n"We'll cache user profiles — read on every page load, only updated when users edit settings."\n\n**3. Choose your architecture**\n"I'll use cache-aside with Redis. On read: check Redis first. If miss, query DB, store in Redis, return."\n\n**4. Set eviction policy**\n"LRU eviction with 10-minute TTL. If a user updates their profile, we invalidate the cache entry immediately."\n\n**5. Address the downsides**\nPick 1-2 relevant problems:\n- "On write, we delete the cache key so next read gets fresh data."\n- "If Redis goes down, requests fall back to DB with circuit breakers."\n- "For hot keys, we can use request coalescing."` },
      { type: 'callout', variant: 'tip', heading: 'Don\'t Cache Everything', body: 'Show you understand when caching is worth the complexity and when a well-indexed database is enough. Not every read needs a cache. If your DB handles the load fine, adding a cache just adds complexity for no benefit.' },
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
