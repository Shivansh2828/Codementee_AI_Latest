# System Design Interview Prep — Codementee

**URL:** https://codementee.io/learn/system-design  
**Type:** Free + Premium Course  
**Level:** Beginner to Advanced  
**Topics:** 50+  
**Time:** ~20 hours

## What You'll Learn

A complete system design course for software engineers preparing for MAANG interviews. Covers everything from networking fundamentals to designing real systems like YouTube, Uber, and WhatsApp.

## Course Sections

### Quick Start (Free)
- Introduction to System Design
- How to Prepare for System Design Interviews
- The Interview Playbook (delivery framework)
- Core Concepts Overview
- Key Technologies Overview
- Common Patterns Overview

### Fundamentals (Pro/Elite)
- Networking Essentials — DNS, TCP/IP, HTTP, WebSockets
- API Design — REST, GraphQL, gRPC
- Data Modeling — SQL vs NoSQL, schema design
- Caching — Redis, CDN, cache invalidation strategies
- Sharding — horizontal partitioning, shard keys
- Consistent Hashing — minimize data movement
- CAP Theorem — consistency vs availability tradeoffs
- Database Indexing — B-trees, composite indexes, query optimization
- Scale & Estimation — latency numbers, back-of-envelope calculations

### Interview Questions (Elite)
- Design Bit.ly (URL shortener)
- Design Dropbox (cloud file storage)
- Design Ticketmaster (event ticketing)
- Design FB News Feed (social media feed)
- Design Tinder (location-based matching)
- Design WhatsApp (real-time messaging)
- Design a Rate Limiter
- Design YouTube (video streaming)
- Design Uber (ride matching)
- Design a Web Crawler
- Design Instagram (photo sharing)
- Design Google Docs (collaborative editing)
- Design a Distributed Cache
- Design a Payment System

### Design Patterns (Pro/Elite)
- Real-time Updates (WebSockets, SSE, polling)
- Event-Driven Architecture
- CQRS and Event Sourcing
- Saga Pattern for distributed transactions

### Tech Deep Dives (Pro/Elite)
- Redis — caching, pub/sub, data structures
- Kafka — event streaming, partitions, consumer groups
- Elasticsearch — full-text search, inverted index
- PostgreSQL — ACID, indexing, replication

### Advanced Topics (Elite)
- Time Series Databases
- Advanced Data Structures (Bloom filters, HyperLogLog)
- Vector Databases
- Distributed Transactions

## Interview FAQ

**Q: How do I start a system design interview?**  
Start by clarifying requirements (functional and non-functional), estimate scale (users, requests/second, storage), then design the high-level architecture before diving into components.

**Q: How do I estimate scale?**  
Use back-of-envelope calculations: 1M DAU × 10 requests/day = 10M requests/day = ~115 requests/second. Know key numbers: 1 byte = 8 bits, 1KB = 1,000 bytes, 1MB = 1,000KB, 1GB = 1,000MB.

**Q: Should I use SQL or NoSQL?**  
SQL for: ACID transactions, complex queries, strong consistency. NoSQL for: horizontal scale, flexible schema, high write throughput. Default to PostgreSQL unless you have a specific reason for NoSQL.

**Q: When should I introduce caching?**  
When read traffic is high and data doesn't change frequently. Cache at the application layer (Redis) for database query results, at the CDN layer for static assets, and at the browser layer for API responses.

---
*Codementee — MAANG Interview Prep Platform*  
*https://codementee.io*
