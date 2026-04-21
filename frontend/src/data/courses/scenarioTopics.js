/**
 * MAANG Scenario-Based Interview Questions
 * Each scenario is tagged with a company, role, and domain.
 * Format: situation → question → detailed walkthrough answer → follow-up questions.
 */

export const SCENARIO_TOPICS = {

  'scenario-google-outage': {
    slug: 'scenario-google-outage',
    title: 'Production Outage — 40% Error Rate at 2 AM',
    subtitle: 'Google · SRE · Incident Response',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `You are on-call for a payment service handling 500K transactions per minute. At 2:14 AM, the error rate spikes from 0.1% to 40% in under 3 minutes. Your SLA is 99.9%. You have 5 engineers available.` },
      { type: 'text', heading: 'The Question', body: `**Walk through your complete incident response. What do you do first, second, third? How do you communicate? When do you escalate?**` },
      { type: 'text', heading: 'How to Answer', body: `**Minute 0-2:** Declare incident immediately. Create #incident-YYYYMMDD-payment channel. Assign an Incident Commander (IC) and a separate Comms lead. The IC does NOT debug — the IC coordinates. This is the most important thing MAANG interviewers look for: structured response, not a lone hero.\n\n**Minute 2-5:** Preserve evidence before touching anything (snapshot metrics, export recent logs). Check blast radius — is it one region or all regions? User-facing or internal only? Identify the last change — any deploys in the last 2 hours? Config changes? Traffic spike?\n\n**Minute 5-15:** Mitigation before root cause. If a deploy caused it, rollback now. If traffic spike, enable rate limiting. Fix first, understand later — every minute of downtime has a dollar cost. Do not spend 30 minutes debugging while the service is down.\n\n**Customer comms:** Update the status page if user-facing. Keep update cadence at every 15 minutes minimum, even if the update is "still investigating."\n\n**Post-incident:** Blameless postmortem within 48 hours with 5-whys analysis. Action items to prevent recurrence. Focus on system failures, not individual blame. "Why did our canary not catch this?" not "Why did John deploy a bad build?"` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you decide rollback vs fix-forward?', a: 'Rollback if: the cause is a recent deployment and rollback is safe (no irreversible DB migrations). Fix forward if: rollback would cause data loss, or the fix is a one-line config change you are confident about. Default to rollback — it is faster and safer. You can always re-deploy the fix after investigating.' },
          { q: 'What if the rollback also fails?', a: 'This happens when the deployment included an irreversible database migration. Options: (1) Fix the migration forward (add the missing default value). (2) Restore database from backup (last resort — data loss). (3) Deploy a hotfix that works with both old and new schema. Prevention: always make migrations backward-compatible.' },
          { q: 'How do you handle communication with leadership at 2 AM?', a: 'Page the engineering manager only if: the incident is P1 (user-facing, revenue impact), MTTR exceeds 30 minutes, or you need authorization for a risky mitigation (e.g., database restore). Send a brief Slack message: "P1 incident, payment service, 40% errors, team is on it, next update in 15 min." Do not call unless you need a decision.' },
        ],
      },
    ],
  },

  'scenario-amazon-scaling': {
    slug: 'scenario-amazon-scaling',
    title: 'Design for 100x Black Friday Traffic',
    subtitle: 'Amazon · AWS · Scaling',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Your checkout service normally handles 10K requests per second. Marketing has confirmed Black Friday will bring 1M requests per second for 6 hours. You have 3 weeks to prepare.` },
      { type: 'text', heading: 'The Question', body: `**What is your capacity strategy, testing approach, and rollback plan? Walk through every decision.**` },
      { type: 'text', heading: 'How to Answer', body: `**Week 1 — Measure:** Load test at 2x, 10x, 50x current load. Find the breaking points. Check AWS service quotas (EC2 limits, ALB connection limits, RDS max connections). The database is usually the first bottleneck.\n\n**Week 2 — Harden:** Pre-scale: increase min replicas 10x before the event. Add read replicas for the database. Implement connection pooling (PgBouncer). Cache everything cacheable (ElastiCache for product data, session data). Circuit breakers for all downstream dependencies. Async everything non-critical (email confirmations, analytics events go to SQS). Feature flags to disable non-essential features under load (recommendations, reviews).\n\n**Week 3 — Rehearse:** Full load test at 110% expected peak in a staging environment using shadow traffic. Game day: simulate Black Friday 48 hours before the real event. Each failure scenario has a pre-written runbook.\n\n**Rollback plan:** Blue-green deployment — switch takes 30 seconds. Degraded mode: queue non-critical requests, fail fast on non-checkout endpoints. The checkout path is sacred — everything else can be sacrificed.\n\n**Post-event:** Retrospective on what you over-provisioned (wasted money) and under-provisioned (caused issues).` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What if the database cannot handle 100x even with read replicas?', a: 'Aggressive caching — serve most reads from Redis, only hit the database for writes and cache misses. Pre-compute and cache product pages as static HTML served from CDN. For writes: use a queue to buffer and batch database writes. Consider DynamoDB for high-write workloads (product views, cart updates).' },
          { q: 'How do you handle inventory consistency during a flash sale?', a: 'Use Redis atomic DECR for inventory count — fast, handles concurrency. Sync with database asynchronously. When Redis count hits zero, reject purchases immediately. Reconcile Redis and DB counts every 30 seconds. Accept that a small number of oversells may happen and handle them with customer communication.' },
        ],
      },
    ],
  },

  'scenario-meta-security': {
    slug: 'scenario-meta-security',
    title: 'AWS Admin Key Leaked in Public GitHub Commit',
    subtitle: 'Meta · Security · Incident Response',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `A developer committed an AWS access key with AdministratorAccess to your production account to a public GitHub repo. The commit has been live for 8 minutes.` },
      { type: 'text', heading: 'The Question', body: `**Walk through every step of your response. What do you do right now? How do you assess damage? How do you prevent this forever?**` },
      { type: 'text', heading: 'How to Answer', body: `**Right now (first 30 seconds):** Deactivate the IAM key in AWS console. Do not wait. Every second it is live is more potential damage. Automated bots scan GitHub for leaked keys and can exploit them within minutes.\n\n**Next 10 minutes:** Check CloudTrail for API calls made with that key in the past 8 minutes. Filter by the Access Key ID. Look for: new IAM users or roles created (backdoors), S3 data accessed or deleted, EC2 instances launched (cryptocurrency miners are the most common attack), Lambda functions deployed, Route53 DNS changes.\n\n**Damage assessment:** If any suspicious activity is found — isolate affected resources, preserve CloudTrail logs for forensics, escalate to the security team. Potentially call AWS Support emergency line for security incidents.\n\n**Git remediation:** Deleting the commit and force-pushing is NOT enough — the commit is cached by GitHub and already indexed by bots like GitGuardian. File a GitHub security report to purge the cache. Remove from git history with git-filter-repo.\n\n**Prevention forever:** (1) detect-secrets pre-commit hook on every repo. (2) GitHub Advanced Security secret scanning — alerts within seconds of push. (3) IAM roles instead of access keys — EC2 and Lambda should never have long-lived keys. (4) AWS Organizations SCPs to prevent creating access keys for production accounts. (5) Mandatory security training for all engineers.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How quickly can attackers exploit a leaked credential?', a: 'Within minutes. Automated bots continuously scan GitHub for patterns like AKIA (AWS key prefix). Once found, bots test the credentials and begin exploitation immediately. The most common attack: launching hundreds of EC2 instances for cryptocurrency mining. AWS bills of $50,000+ from a single leaked key are not uncommon.' },
          { q: 'What is the difference between deactivating and deleting an access key?', a: 'Deactivating: the key still exists but cannot be used. Useful during investigation — you can see the key ID in CloudTrail logs. Deleting: permanently removed. Always deactivate first, investigate, then delete after the investigation is complete.' },
        ],
      },
    ],
  },

  'scenario-netflix-latency': {
    slug: 'scenario-netflix-latency',
    title: 'API Latency Degraded from 50ms to 800ms — No Deploy',
    subtitle: 'Netflix · Engineering · Performance',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Your recommendation API P99 latency has gone from 50ms to 800ms over the last 3 hours. No deployments happened. Traffic levels are normal. Three downstream services are called per request.` },
      { type: 'text', heading: 'The Question', body: `**Describe your exact debugging methodology. What tools do you use at each step? What are your hypotheses?**` },
      { type: 'text', heading: 'How to Answer', body: `**Step 1 — Scope the problem:** Is it all endpoints or specific ones? All regions or one? All users or a specific cohort (mobile vs web, free vs paid)? Narrowing scope is 80% of debugging.\n\n**Step 2 — Distributed traces:** Pull Jaeger or X-Ray traces from the slow requests. Which of the 3 downstream calls is slow? Is it the first call (isolated issue) or does slowness compound? Is the slow span a DB query, external HTTP call, or compute?\n\n**Step 3 — Infrastructure correlations:** Check CPU, memory, GC pauses (Java services can have GC storms that cause latency spikes), thread pool exhaustion (check active thread counts), connection pool saturation (pool wait time metric).\n\n**Step 4 — Recent changes (non-deploy):** No deploys, but: did traffic patterns change (different user cohort, new feature being used more)? Did a database index get dropped or go stale? Did a cron job start running that is competing for DB resources? Did a dependency's latency change (check their dashboards)?\n\n**Step 5 — Database deep dive:** Check the slow query log. Look for lock waits and connection count approaching the limit. Common culprit: an N+1 query that used to be fast is now slow because the table grew 10x. Run EXPLAIN ANALYZE on suspicious queries.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What if traces show all 3 downstream calls are slow?', a: 'Then the problem is likely shared infrastructure: a shared database, a shared cache (Redis), or the network itself. Check if the downstream services share any common dependency. Also check: is the calling service itself slow (CPU/GC), adding latency before even making the downstream calls?' },
          { q: 'How do you distinguish between a gradual degradation and a sudden spike?', a: 'Gradual (over hours/days): usually data growth (table size, index bloat), memory leak, connection pool exhaustion, or cache eviction rate increasing. Sudden (minutes): usually a dependency failure, config change, traffic pattern change, or infrastructure event (noisy neighbor, AZ issue). The 3-hour timeline here suggests gradual — look for data growth or resource exhaustion.' },
        ],
      },
    ],
  },

  'scenario-apple-cicd': {
    slug: 'scenario-apple-cicd',
    title: 'Design CI/CD for 500 Engineers in a Monorepo',
    subtitle: 'Apple · Platform · CI/CD Design',
    duration: '25 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `You join a company with 500 engineers, a single monorepo with 15 microservices. Current state: 45-minute build times, monthly manual deployments, engineers fear releases.` },
      { type: 'text', heading: 'The Question', body: `**How do you get from this state to multiple deploys per day? What do you build first? What is your 6-month roadmap?**` },
      { type: 'text', heading: 'How to Answer', body: `**Month 1 — Fix builds:** Implement affected-change detection. Only build and test services changed by a PR. Use build graph analysis (Nx, Bazel, or a simple script checking changed file paths). Result: most PRs only trigger 1-2 service pipelines, not all 15. Add remote build caching. Target: under 10 minutes for CI.\n\n**Month 2 — Automate staging:** Auto-deploy every main branch merge to staging. Run smoke tests on staging. Engineers get confidence that staging always works and matches what they merged.\n\n**Month 3 — Automate production:** GitOps with ArgoCD. All production deploys happen via PRs to a k8s-manifests repo. Feature flags become a cultural requirement — no big-bang releases. Every feature ships behind a flag.\n\n**Month 4-5 — Safety nets:** Automated canary deployments with Flagger or Argo Rollouts. Automatic rollback if error rate or latency degrades after deploy. PagerDuty integration for on-call. Blameless postmortem culture established.\n\n**Month 6 — Culture:** Trunk-based development training. Small PRs reviewed in hours, not days. Engineers who ship frequently feel ownership. Measure and display DORA metrics on a team dashboard.\n\n**Key insight the interviewer wants to hear:** The technical changes are the easy part. The cultural change (trunk-based dev, small PRs, fearless releases) is the hard part and takes the longest.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you handle shared libraries across 15 services?', a: 'Publish shared libraries as versioned packages (npm, PyPI). Each service pins the library version. When the library is updated, services opt-in via a PR. Dependabot can automate this. Never use "latest" — a breaking change would break all 15 services simultaneously.' },
          { q: 'How do you get buy-in from 500 engineers used to manual deploys?', a: 'Start with one team and one service. Prove the value: show that automated deploys are faster, safer, and less stressful. Document the process. Offer hands-on workshops. Once one team succeeds, others will want the same. Do not mandate — demonstrate.' },
          { q: 'What are your target DORA metrics after 6 months?', a: 'Deployment frequency: daily (from monthly). Lead time: under 1 hour from merge to production (from days). Change failure rate: under 10% (from ~30%). MTTR: under 30 minutes (from hours). These are "high performer" targets per the DORA research.' },
        ],
      },
    ],
  },

  'scenario-microsoft-multiregion': {
    slug: 'scenario-microsoft-multiregion',
    title: 'Design Globally Distributed Active-Active Architecture',
    subtitle: 'Microsoft · Azure · Architecture',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Your SaaS serves 10M users globally. Currently single-region US-East. Leadership wants 99.99% availability SLA and under 100ms P99 latency globally.` },
      { type: 'text', heading: 'The Question', body: `**Design the complete multi-region architecture. How do you handle data, failover, and testing?**` },
      { type: 'text', heading: 'How to Answer', body: `**Regions:** 3 minimum (US-East, EU-West, AP-Southeast). AWS Global Accelerator or Cloudflare routes to the nearest healthy region using Anycast. Latency-based DNS routing as fallback.\n\n**The data problem (hardest part):** User data is region-pinned — a user from Germany always hits EU-West. Reference data (product catalogue, feature flags) replicates asynchronously across all regions. For features needing global consistency: CockroachDB or AWS Aurora Global Database with under 1 second replication lag.\n\n**Stateless services:** Route to nearest region. Stateful services: session data in regional Redis, or use JWT tokens (no server-side session state needed).\n\n**Failover:** Health checks every 10 seconds. DNS TTL set to 60 seconds (low enough for fast failover). Automated failover when region health drops below threshold. Manual override for planned maintenance.\n\n**Testing:** Quarterly game days — kill an entire region during business hours with engineers present. Measure RTO (recovery time objective) and RPO (recovery point objective). If you have never tested failover, you do not have failover.\n\n**CDN:** CloudFront or Cloudflare for all static assets globally. Edge caching reduces origin load and improves latency.\n\n**Monitoring:** One global Grafana dashboard showing latency from all regions. Alert when any region P99 exceeds SLO.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you handle writes in an active-active setup?', a: 'Conflict resolution is the hard problem. Options: (1) Region-pinned writes — each user writes to their home region only. Simplest, avoids conflicts. (2) Last-writer-wins — accept data loss on conflicts. OK for non-critical data. (3) CRDTs (Conflict-free Replicated Data Types) — merge conflicts automatically. Complex but correct. For most SaaS: region-pinned writes is the right answer.' },
          { q: 'What is the difference between 99.9% and 99.99% availability?', a: '99.9% = 8.7 hours downtime per year. 99.99% = 52 minutes per year. Going from 3 nines to 4 nines is an order of magnitude harder. It requires: multi-region, automated failover, no single points of failure, and extensive chaos testing. Most companies do not actually need 99.99% — the cost is enormous.' },
        ],
      },
    ],
  },

  'scenario-uber-slo': {
    slug: 'scenario-uber-slo',
    title: 'SLO Exhausted — Error Budget Fully Burned',
    subtitle: 'Uber · SRE · Reliability',
    duration: '15 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `It is the 20th of the month. Your 30-day rolling SLO is 99.9%. Current attainment is 99.85%. You have 10 days left and your error budget is fully exhausted.` },
      { type: 'text', heading: 'The Question', body: `**What do you do now? How do you communicate this to leadership? What changes to engineering practices does this trigger?**` },
      { type: 'text', heading: 'How to Answer', body: `**Immediate actions:** Error budget exhausted means feature development STOPS for this service. All engineers focus on reliability. No risky deployments (major refactors, DB migrations, new infrastructure) until the budget is restored.\n\n**Communication:** Send a reliability update to engineering leadership and product: "Our error budget for this 30-day window is exhausted. Current attainment: 99.85% vs 99.9% target. We are pausing non-critical feature work and focusing on reliability improvements until the window resets."\n\n**Investigation:** What caused the budget burn? Pull SLO dashboards and identify the time periods where budget burned fastest. Were there specific incidents? A particular endpoint? A specific user cohort?\n\n**Fixes:** Address root causes, not symptoms. If deployment-related: reduce deploy frequency temporarily, improve rollback speed, add more staging tests. If infrastructure: add redundancy. If code quality: increase test coverage for the failing paths.\n\n**Next month prevention:** Review MTTR for each incident — shorten it. Review incident triggers — add earlier alerting. Add automated rollback. Review the SLO itself — is 99.9% the right target? Sometimes teams set SLOs they cannot realistically maintain.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What if product leadership pushes back on pausing features?', a: 'This is exactly what error budgets are designed for. The error budget is an objective, data-driven framework. Show the numbers: "We have burned 100% of our allowed downtime. Shipping more features without fixing reliability will breach our SLA, which has contractual consequences." If leadership overrides, document the decision and the risk accepted.' },
          { q: 'How do you set the right SLO?', a: 'Start by measuring current reliability for 30 days. If you are at 99.95%, set the SLO at 99.9% (achievable but requires discipline). SLOs should be based on user expectations, not aspirations. A 99.99% SLO for an internal tool is wasteful. A 99.9% SLO for a payment service might be too low.' },
        ],
      },
    ],
  },

  'scenario-dropbox-db-migration': {
    slug: 'scenario-dropbox-db-migration',
    title: 'Zero-Downtime Database Migration — MySQL to PostgreSQL',
    subtitle: 'Dropbox · Storage · Data Engineering',
    duration: '25 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `You have a 10TB MySQL database with 2,000 tables, serving 50M users. The application cannot have more than 5 minutes of total downtime. You have 6 months.` },
      { type: 'text', heading: 'The Question', body: `**What is your complete migration strategy? What risks exist and how do you mitigate them?**` },
      { type: 'text', heading: 'How to Answer', body: `**Phase 1 — Setup and replication (weeks 1-8):** Set up PostgreSQL cluster. Use pgloader or AWS DMS for initial data load plus ongoing CDC (Change Data Capture) replication. MySQL stays primary, Postgres receives all writes via replication. Validate data consistency continuously with row count checks and checksum sampling.\n\n**Phase 2 — Shadow reads (weeks 9-16):** Route 1% of read traffic to Postgres. Compare query results between MySQL and Postgres. Fix data type differences, charset issues, and query behaviour differences (NULL handling, string comparison, date handling). Gradually increase shadow read percentage.\n\n**Phase 3 — Dual writes (weeks 17-20):** Deploy new code that writes to BOTH MySQL and Postgres for non-critical features first. Verify write consistency.\n\n**Phase 4 — Cutover (the 5 minutes):** Announce maintenance window. Stop writes to MySQL. Let replication drain (typically seconds). Verify Postgres is in sync. Update application connection strings via feature flag. Enable writes to Postgres. Verify application health. Keep MySQL read-only for 72 hours as fallback.\n\n**Risks:** Query behaviour differences (NULLs, string comparison, date handling differ between MySQL and Postgres), sequence vs auto-increment differences, stored procedures need manual translation, triggers behave differently. Each of these must be discovered and fixed during Phase 2.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What if you discover data inconsistencies during shadow reads?', a: 'This is expected and is exactly why you do shadow reads. Log every discrepancy with the query, MySQL result, and Postgres result. Categorize: data type differences (fix in migration), query behaviour differences (fix in application code), actual data corruption (investigate and fix). Do not proceed to Phase 3 until shadow reads show 100% consistency for at least 1 week.' },
          { q: 'How long does a 10TB initial data load take?', a: 'Depends on network bandwidth and table structure. With AWS DMS: typically 24-72 hours for 10TB. During this time, CDC captures ongoing changes. After initial load completes, CDC catches up (usually minutes). The initial load is the longest single step — plan for it and monitor progress.' },
        ],
      },
    ],
  },

  'scenario-google-toil': {
    slug: 'scenario-google-toil',
    title: 'Reduce Toil — Team Spends 40% on Repetitive Ops',
    subtitle: 'Google · SRE · Automation',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Your SRE team of 8 engineers spends 40% of their time on manual, repetitive operational tasks: rotating credentials, scaling services during peaks, restarting failed jobs, triaging the same alert types. Google SRE rule: max 50% toil — engineers must spend over 50% on engineering work.` },
      { type: 'text', heading: 'The Question', body: `**How do you measure, categorise, and eliminate toil? Provide a concrete 3-month plan.**` },
      { type: 'text', heading: 'How to Answer', body: `**Month 1 — Measure:** Have every engineer log every task for 2 weeks: what they did, how long it took, and whether it could be automated. Categorise each task: (1) Eliminate — is this task even necessary? (2) Automate — could a computer do this reliably? (3) Optimise — if automation is not possible, make it faster.\n\nTypical findings: credential rotation (4 hrs/wk) → automate with Vault. Service scaling (6 hrs/wk) → automate with HPA + Cluster Autoscaler. Job restarts (3 hrs/wk) → investigate why jobs fail, fix root cause. Alert triage (8 hrs/wk) → fix alert quality, too many noisy alerts.\n\n**Month 2 — Automate top items:** Implement Vault auto-rotation for credentials. Tune HPA to eliminate manual scaling. Write runbook-to-code for top 5 alert types (auto-remediation scripts). Use the Kubernetes operator pattern for common operations.\n\n**Month 3 — Prevent toil accumulation:** Toil review in every sprint — new toil must be matched with an automation ticket. Establish a "toil budget" — if team exceeds 30% toil, stop new projects until reduced. Each postmortem must answer: what toil did this incident create, and how do we eliminate it?` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you prioritise which toil to automate first?', a: 'Multiply frequency by time per occurrence. Credential rotation: 4 hrs/wk = 208 hrs/yr. Alert triage: 8 hrs/wk = 416 hrs/yr. Automate the highest total-time items first. Also factor in risk: manual credential rotation is error-prone and a security risk, so it gets extra priority.' },
          { q: 'What if engineers resist tracking their time?', a: 'Make it lightweight — a shared spreadsheet or Slack bot, not a time-tracking tool. Frame it as "we are building the case to get you out of toil, not monitoring your productivity." Share results transparently. When engineers see "we spend 416 hours per year on alert triage," they are motivated to fix it.' },
        ],
      },
    ],
  },

  'scenario-etsy-testing': {
    slug: 'scenario-etsy-testing',
    title: 'Design Testing Strategy for Microservices',
    subtitle: 'Etsy · Engineering · Testing',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `You have 20 microservices. Current state: only unit tests, catching bugs in production. 3 major production incidents per month caused by integration failures. Zero contract tests. End-to-end tests take 2 hours and are flaky.` },
      { type: 'text', heading: 'The Question', body: `**Design a complete testing pyramid for this architecture. What do you change first?**` },
      { type: 'text', heading: 'How to Answer', body: `**Testing pyramid for microservices:**\n\n**(1) Unit tests (70% of tests):** Fast, no external dependencies, test logic in isolation. Target: under 30 seconds total run time. Mock everything external.\n\n**(2) Integration tests (20%):** Test one service with its direct dependencies (database, cache) using real instances via Docker Compose or testcontainers. Test the service boundary, not the whole system. Run in CI on every PR, under 5 minutes.\n\n**(3) Contract tests (the missing piece — add this first):** Consumer-driven contract testing with Pact. Service A (consumer) defines what it expects from Service B's API. Service B verifies it meets those contracts in its own CI pipeline. This eliminates integration failures without needing full integration tests. This is the highest-impact change.\n\n**(4) E2E tests (10%):** Only for critical user journeys (checkout, login, core feature). Maximum 5-10 tests. Parallel execution. Retry once on failure. Target: under 10 minutes.\n\n**Fix order:** Month 1: add contract tests for your 3 most unstable service interfaces. Month 2: fix E2E flakiness — delete or fix every flaky test (a flaky test is worse than no test). Month 3: add testcontainers-based integration tests for services that lack them.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What is a flaky test and how do you handle it?', a: 'A test that passes sometimes and fails sometimes without code changes. Causes: timing issues, external dependencies, shared state between tests, non-deterministic data. Fix: quarantine flaky tests immediately (do not let them block PRs), then fix root cause (add retries for timing, mock external services, isolate test data). Track flaky test rate as a team metric.' },
          { q: 'How do contract tests work?', a: 'Service A (consumer) writes a test: "I expect GET /users/123 to return {id, name, email}." This generates a contract (JSON file). Service B (provider) runs the contract against its actual API in its own CI. If B changes its API in a way that breaks A\'s contract, B\'s CI fails. Neither service needs to be running at the same time. This catches integration failures at build time, not in production.' },
        ],
      },
    ],
  },

  'scenario-spotify-finops': {
    slug: 'scenario-spotify-finops',
    title: 'Cloud Spend Grew 300% with Only 50% User Growth',
    subtitle: 'Spotify · Platform · FinOps',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Your AWS bill is $2M per month. It was $500K a year ago. User growth was 50%. Engineering leadership wants a 30% cost reduction within 90 days without affecting reliability.` },
      { type: 'text', heading: 'The Question', body: `**How do you approach cloud cost optimisation? What do you cut first? What should never be cut?**` },
      { type: 'text', heading: 'How to Answer', body: `**Week 1 — Visibility:** Enable AWS Cost Explorer with resource-level tagging. Every EC2, RDS, and EKS node must have tags: team, environment, service, cost-center. Without tags you cannot attribute costs. Use Infracost to see cost estimates on Terraform PRs before they are applied. Find the 20% of resources causing 80% of cost.\n\n**Weeks 2-4 — Low-hanging fruit:** Right-sizing: check CPU and memory utilisation. Most teams over-provision 3-4x. A 10% average CPU on m5.4xlarge should be m5.large — savings of 40-60%. Reserved Instances or Savings Plans: commit to 1-year usage for predictable workloads (databases, baseline K8s nodes) for 30-40% discount. Spot Instances: for fault-tolerant workloads (batch jobs, stateless K8s workers) for 70-90% discount. Delete orphaned resources: unattached EBS volumes, unused Elastic IPs, old AMIs, idle load balancers.\n\n**Month 2 — Architecture optimisation:** S3 Intelligent Tiering for infrequently accessed data. Minimise cross-AZ data transfer costs. RDS to Aurora Serverless for variable-load databases. Lambda instead of always-on EC2 for event-driven workloads.\n\n**Never cut:** Monitoring and alerting, multi-AZ for production databases, backups, security tooling. These are insurance, not waste.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you make cost optimisation sustainable?', a: 'Make costs visible to every team. Show each team their monthly cloud spend on a dashboard. Add Infracost to Terraform PRs so engineers see cost impact before merging. Set per-team budgets with alerts. Include cost review in sprint retrospectives. Cost awareness becomes part of engineering culture, not a one-time project.' },
          { q: 'What caused the 300% growth with only 50% user growth?', a: 'Common causes: over-provisioned instances that were never right-sized, dev/staging environments running 24/7 at production scale, data storage growing without lifecycle policies, logging volume explosion (debug logs in production), and new services launched without cost review. The gap between user growth and cost growth is always a sign of inefficiency.' },
        ],
      },
    ],
  },

  'scenario-linkedin-chaos': {
    slug: 'scenario-linkedin-chaos',
    title: 'Design a Chaos Engineering Program from Scratch',
    subtitle: 'LinkedIn · SRE · Resilience',
    duration: '15 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Your team has never done chaos engineering. You have 30 microservices and a 99.9% SLO. Leadership approves a chaos program but is nervous about risk.` },
      { type: 'text', heading: 'The Question', body: `**How do you start, what do you test first, and how do you get organisational buy-in?**` },
      { type: 'text', heading: 'How to Answer', body: `**Principle:** Start in staging, prove safety, then move to production.\n\n**Phase 1 — Baseline (weeks 1-2):** Define steady state for each service — what does "healthy" look like? (latency P99, error rate, throughput). Without a baseline you cannot measure whether chaos caused a problem.\n\n**Phase 2 — Staging experiments (weeks 3-6):** Start with the least risky experiments: kill one pod (Kubernetes already does this — you are just doing it on purpose). Then: kill all pods in a namespace (does HPA respond? does traffic fail gracefully?). Then: inject latency to one downstream dependency (does your circuit breaker trip?). Tools: Chaos Mesh (K8s native), Gremlin (enterprise, safer guardrails).\n\n**Phase 3 — Production (weeks 7-12):** First production experiment: kill one pod during business hours with engineers watching. If nothing happens, you have proven resilience. If something breaks, you found a real weakness before users did. Gradually increase: kill a node, inject 200ms latency on a critical service, simulate AZ failure.\n\n**Buy-in:** Monthly Chaos Gameday report shared with leadership. Each experiment documented: hypothesis, result, action item. This builds confidence and proves ROI — "we found 3 critical weaknesses before they caused outages."` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What if a chaos experiment causes a real outage?', a: 'This is why you start in staging and have a kill switch. Every experiment has an abort condition and a rollback plan. If an experiment causes unexpected impact, stop immediately, restore service, and treat it as a learning opportunity. The experiment revealed a real weakness — that is the point. Document it and fix it.' },
          { q: 'How do you measure the ROI of chaos engineering?', a: 'Track: number of weaknesses found before they caused outages, MTTR improvement (teams practiced incident response), reduction in production incidents caused by known failure modes. Compare the cost of chaos engineering (engineer time) vs the cost of the outages it prevented.' },
        ],
      },
    ],
  },

  'scenario-aws-zero-trust': {
    slug: 'scenario-aws-zero-trust',
    title: 'Implement Zero Trust Networking for Kubernetes',
    subtitle: 'AWS · Security · Zero Trust',
    duration: '15 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Your Kubernetes cluster uses flat networking — any pod can talk to any pod. A security audit found this is a compliance violation. You need to implement Zero Trust without disrupting running services.` },
      { type: 'text', heading: 'The Question', body: `**Design the complete Zero Trust implementation plan. How do you avoid breaking things?**` },
      { type: 'text', heading: 'How to Answer', body: `**Start by mapping all legitimate communication.** Use network flow analysis (Cilium Hubble or VPC flow logs). This takes 2 weeks but is essential — you must know what is allowed before you can deny anything.\n\n**Tool choice:** Cilium (eBPF-based, supports L7 policies) is the modern choice. Calico for simpler L3/L4 policies if already deployed.\n\n**Phase 1:** Default deny in new namespaces only. Do not touch existing ones yet. New services deploy with network policies from day one.\n\n**Phase 2:** Add monitoring-only policies to existing namespaces. Cilium can log policy violations without enforcing. Run for 2 weeks to see what would be blocked.\n\n**Phase 3:** Enforce, one namespace at a time. Start with the lowest-risk namespace. Deploy default-deny policy. Add explicit allow rules for all observed flows. Watch for alerts.\n\n**Phase 4:** mTLS via service mesh (Istio or Linkerd). Adds automatic mutual TLS between all services. No code changes required.\n\n**Also cover:** RBAC (no wildcard permissions), pod security standards (no privileged containers), network egress policy (no pod should talk to the internet unless explicitly allowed).` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What if you miss a legitimate flow and break a service?', a: 'This is why Phase 2 (monitoring-only) exists. Run it for at least 2 weeks to capture all traffic patterns including batch jobs, cron jobs, and infrequent flows. When you enforce in Phase 3, have a fast rollback: remove the default-deny policy. Monitor error rates during enforcement. Start with non-critical namespaces.' },
          { q: 'How do you handle egress (outbound) traffic?', a: 'Default deny egress too. Explicitly allow: DNS (port 53 to kube-dns), specific external APIs by domain (use Cilium FQDN policies), package registries for builds. This prevents data exfiltration — a compromised pod cannot phone home to an attacker-controlled server.' },
        ],
      },
    ],
  },

  'scenario-github-idp': {
    slug: 'scenario-github-idp',
    title: 'Build an Internal Developer Platform for 200 Engineers',
    subtitle: 'GitHub · Platform Engineering',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `200 engineers spend too much time on infrastructure toil. Setting up a new service takes 3 days of YAML writing. Each team has slightly different, incompatible deployment pipelines. Leadership wants to reduce cognitive load.` },
      { type: 'text', heading: 'The Question', body: `**Design an IDP from scratch. What capabilities does it need? How do you avoid building "the framework nobody uses"?**` },
      { type: 'text', heading: 'How to Answer', body: `**Start with the problem, not the solution.** Interview 20 engineers from different teams. Find the top 5 friction points. Typically: creating a new service, understanding what is deployed where, debugging production issues, getting secrets, and understanding costs.\n\n**Core principle:** The IDP should make the easy path the right path. Do NOT build a restrictive platform that forces compliance — build one that is so good engineers choose it over DIY.\n\n**Capabilities to build:**\n(1) Service templates (Backstage scaffolding) — one command creates a new service with CI, Docker, K8s manifests, monitoring, and on-call rotation pre-configured.\n(2) Service catalogue (Backstage) — inventory of all services, their owners, docs, deployment status, and dependencies.\n(3) Golden paths — opinionated but flexible. "Use our GitHub Action for deploys, or justify why not."\n(4) Self-service secrets (Vault UI + CLI).\n(5) Cost visibility per service.\n\n**Technology:** Backstage (CNCF, backed by Spotify) is the standard for service catalogues and developer portals.\n\n**Avoid the "nobody uses it" trap:** Embed a platform engineer in 3 product teams for 2 months. Build what they ask for, not what you think they need. Make adoption measurable — track what percentage of services use the golden path.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you measure IDP success?', a: 'Time to create a new service (target: under 30 minutes, from 3 days). Percentage of services using the golden path (target: over 80%). Developer satisfaction surveys (quarterly). Reduction in infrastructure-related support tickets. DORA metrics improvement across teams using the platform.' },
          { q: 'What if teams want to opt out of the platform?', a: 'Let them — but make the platform so good they do not want to. If a team opts out, understand why. Maybe the platform does not support their use case. Fix it. Mandating platform usage creates resentment. Demonstrating value creates adoption.' },
        ],
      },
    ],
  },

  'scenario-cloudflare-dr': {
    slug: 'scenario-cloudflare-dr',
    title: 'Primary Database Cluster Failed — 500K Users Affected',
    subtitle: 'Cloudflare · SRE · Disaster Recovery',
    duration: '15 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `At 11:32 AM on a Tuesday, your primary PostgreSQL cluster fails completely. RDS Multi-AZ failover did not trigger — the secondary was also corrupted by a data migration 3 hours ago. Your last clean backup is from midnight — 11.5 hours ago.` },
      { type: 'text', heading: 'The Question', body: `**What are your decisions in the next 60 minutes? What is the tradeoff between RTO and RPO here?**` },
      { type: 'text', heading: 'How to Answer', body: `**First 5 minutes:** Incident declared. Confirm diagnosis — is this truly the primary AND secondary? Check RDS console, CloudWatch, application errors. Could this be a misconfiguration (wrong connection string) rather than actual data loss? Never assume worst case without confirming.\n\n**Minutes 5-15:** Assess recovery options.\nOption A: Restore from midnight backup — RTO: 45-90 min (depends on DB size). RPO: 11.5 hours of data lost.\nOption B: Check if WAL (Write-Ahead Log) archiving is enabled — can you replay transactions from midnight to now? If yes: RTO: 2-3 hours. RPO: near-zero.\nOption C: Is there a read replica that was not corrupted? Check replication lag at time of corruption.\n\n**Decision framework:** For a SaaS product, 11.5 hours of lost user data (purchases, messages, profile updates) is likely unacceptable. Pursue Option B or C if possible. If you must use Option A: customer communication is critical.\n\n**Minutes 15-60:** Begin restore. Communicate every 15 minutes.\n\n**Post-incident actions:** Enable PITR (Point-in-Time Recovery) — this exact scenario is why it exists. Test DR quarterly. The secondary being corrupted during migration means your DR test failed silently for 3 hours — that is the real failure.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What is the difference between RTO and RPO?', a: 'RTO (Recovery Time Objective): how long until the service is back. RPO (Recovery Point Objective): how much data you can afford to lose. A midnight backup has RPO of up to 24 hours. PITR with WAL archiving has RPO of seconds. RTO and RPO have different costs — near-zero RPO requires continuous WAL archiving, which costs more than daily backups.' },
          { q: 'How do you prevent this specific failure?', a: 'Enable PITR (continuous WAL archiving). Test failover quarterly — actually trigger a failover, do not just assume it works. Never run data migrations that could corrupt the standby without verifying standby health afterward. Add a monitoring check: "is the standby in sync and healthy?" Alert immediately if it falls behind.' },
        ],
      },
    ],
  },

  'scenario-twitter-rate-limiter': {
    slug: 'scenario-twitter-rate-limiter',
    title: 'Design a Rate Limiter for 10 Billion Requests per Day',
    subtitle: 'Twitter · Backend · High Scale',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Your API currently has no rate limiting. Abusive clients are causing 30% of your traffic, affecting legitimate users. You need to implement rate limiting that works across 100 API servers.` },
      { type: 'text', heading: 'The Question', body: `**Design a distributed rate limiter. What algorithm, data store, and implementation approach would you choose?**` },
      { type: 'text', heading: 'How to Answer', body: `**Algorithm choice:**\nToken bucket (most common): each client has a bucket of N tokens. Each request consumes 1 token. Tokens replenish at a fixed rate. Allows bursts up to bucket size. Simple to implement and reason about.\n\nSliding window: most accurate, avoids the fixed-window edge case (60 requests at 11:59 + 60 at 12:00 = 120 in 60 seconds).\n\n**For 10B requests/day across 100 servers:** Centralized rate limiting with Redis. Use sliding window with Redis sorted sets. Key: rate_limit:{client_id}:{window}. ZADD to add request timestamp. ZCOUNT to count requests in window. ZREMRANGEBYSCORE to remove old entries.\n\n**Atomicity:** Use a Lua script for ZADD + ZCOUNT + ZEXPIRE as an atomic operation. This prevents race conditions between the count check and the increment.\n\n**Redis cluster:** 6 nodes (3 primary, 3 replica) handles this comfortably at 10B requests/day.\n\n**Fallback:** If Redis is unreachable, fail open (allow requests), not closed. Rate limiting should never take down your API.\n\n**Response headers:** X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset. On limit: 429 Too Many Requests with Retry-After header.\n\n**Client identification:** API key (not IP — proxies and NAT make IP unreliable). For unauthenticated traffic: IP with a generous limit.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'Why Redis and not an in-memory counter on each server?', a: 'With 100 servers, each server sees only 1% of a client\'s traffic. A client sending 1000 req/s would appear as 10 req/s on each server — well under any per-server limit. Centralized counting in Redis gives a global view. The trade-off: Redis adds ~1ms latency per request. At 10B req/day, this is acceptable.' },
          { q: 'How do you handle rate limiting for different tiers?', a: 'Store rate limit configuration per API key in Redis or a database. Free tier: 100 req/min. Pro: 1000 req/min. Enterprise: 10000 req/min. The rate limiter reads the client\'s tier and applies the corresponding limit. This is also a monetization lever — "upgrade to increase your rate limit."' },
        ],
      },
    ],
  },

  'scenario-meta-arch-review': {
    slug: 'scenario-meta-arch-review',
    title: 'Walk Me Through a Production Architecture You Built',
    subtitle: 'Meta · Infrastructure · Architecture Review',
    duration: '15 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `This is an open-ended design question. The interviewer wants to see how you think about systems holistically — tradeoffs, failure modes, scaling decisions, and lessons learned.` },
      { type: 'text', heading: 'The Question', body: `**Describe a production system you designed or significantly contributed to. Explain the key architectural decisions and what you would do differently.**` },
      { type: 'text', heading: 'How to Answer', body: `**Strong answer structure:**\n\n**Context (1 min):** What problem did this solve? What was the scale? Team size? Constraints (budget, timeline, existing tech stack)?\n\n**Core architecture decisions (3-4 min):** Pick 2-3 key decisions. For each: what were the options? What did you choose? Why? What did you trade off? Example: "We chose Cassandra over MySQL for the event store because write throughput was 2M events per second and we needed linear horizontal scale. We accepted eventual consistency because late events could be reconciled."\n\n**Failure modes and mitigations (2 min):** What are the top 3 ways this system can fail? What did you build to handle each? "Single point of failure: the job queue. We added dead letter queues, idempotent job processing, and a circuit breaker for the downstream database."\n\n**Operational experience (1 min):** What did you learn in the first 3 months of production that you did not anticipate?\n\n**What to avoid:** Generic architectures with no tradeoffs ("we used microservices for scalability"). Vague answers ("we had good monitoring"). Perfect solutions with no failure modes.\n\n**What impresses:** Honest discussion of tradeoffs and failures. Specific numbers (requests per second, data volume, latency). Systems thinking (how does this fit into the larger architecture). What you would do differently with hindsight.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What would you do differently if you started over?', a: 'This is the most important follow-up. Strong answers: "I would start with a simpler architecture and add complexity only when needed — we over-engineered the event pipeline for scale we did not reach for 18 months." Weak answers: "Nothing, it was perfect." Every system has things you would change. Admitting them shows maturity and self-awareness.' },
          { q: 'How did you handle the transition from v1 to v2?', a: 'Interviewers love migration stories. Describe: how you ran both versions in parallel, how you migrated data, how you validated correctness, and how you handled rollback. The migration is often harder than the new system itself.' },
        ],
      },
    ],
  },

  'scenario-pagerduty-oncall': {
    slug: 'scenario-pagerduty-oncall',
    title: 'Design On-Call for a 40-Person Engineering Team',
    subtitle: 'PagerDuty · SRE · On-Call Design',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `You join as the first SRE. The team has no on-call process. Engineers are getting paged randomly at any hour. Burnout is high. 3 engineers have quit in 6 months citing on-call as a major factor.` },
      { type: 'text', heading: 'The Question', body: `**Design a humane, effective on-call system from scratch. How do you balance coverage with engineer wellbeing?**` },
      { type: 'text', heading: 'How to Answer', body: `**Diagnosis first:** The problem is not on-call itself — it is that on-call is unreasonable. Too many alerts, no runbooks, no escalation paths. Fix the system before fixing the rotation.\n\n**Alert quality (month 1):** Audit every alert that fired in the past month. Categorise: actionable and urgent (keep, improve MTTR), actionable but not urgent (create a ticket, do not page), not actionable (delete immediately). Target: reduce alert volume by 50% before adding more people to the rotation.\n\n**Rotation design:** Primary + secondary model. Primary is paged first. Secondary is backup if primary does not acknowledge in 10 minutes. 1-week rotations (shorter = too much context switching, longer = burnout). Different expectations for weekday vs weekend: weekday ack in 5 minutes, weekend ack in 15 minutes.\n\n**Compensation:** Every on-call week earns comp time or a bonus. No on-call during vacation. Maximum 2 incidents per night before auto-escalating to the engineering manager (this is a systemic issue, not an individual problem).\n\n**Handoff:** 15-minute sync at rotation change. Outgoing primary briefs incoming on known issues, in-progress work, and recent incidents.\n\n**Runbooks:** Every alert must have a runbook. No runbook = alert gets silenced until one is written. This forces the team to document their knowledge.\n\n**Measure:** On-call load per engineer per quarter. Goal: under 4 hours of active incident work per on-call week. If above that, it is an engineering project to reduce load.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you handle on-call for a small team (5 engineers)?', a: 'With 5 engineers, each person is on-call every 5 weeks. This is borderline sustainable. Mitigations: invest heavily in alert quality (fewer pages = less burden), automate common remediations, have a "follow the sun" arrangement if team is distributed across time zones, and consider a shared on-call pool with another team for overnight coverage.' },
          { q: 'What metrics do you track for on-call health?', a: 'Pages per on-call shift (target: under 5 per week). MTTA (mean time to acknowledge). MTTR (mean time to resolve). Percentage of pages that were actionable (target: over 90%). On-call satisfaction survey (quarterly). If any metric trends badly, it becomes a sprint priority.' },
        ],
      },
    ],
  },

  'scenario-netflix-resilience': {
    slug: 'scenario-netflix-resilience',
    title: 'Design Resilience for a Payment Microservice',
    subtitle: 'Netflix · Chaos · Resilience',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `You are designing a new payment processing microservice from scratch. It will process $50M in transactions per day. Any downtime directly loses revenue. It must integrate with 3 external payment processors, an internal fraud service, and a notification service.` },
      { type: 'text', heading: 'The Question', body: `**Design the complete resilience strategy: circuit breakers, retries, timeouts, graceful degradation, and data durability.**` },
      { type: 'text', heading: 'How to Answer', body: `**Design principle:** Fail gracefully at every integration point.\n\n**Payment processors (external):**\nCircuit breakers: open after 5 consecutive failures. Half-open test after 30 seconds. Fallback: route to the next payment processor if the primary circuit is open.\nRetries: only for idempotent operations (GET status, not POST charge). Retry with exponential backoff + jitter (avoid thundering herd). Max 3 retries: 100ms, 200ms, 400ms.\nTimeouts: 2-second timeout per attempt. Never unlimited.\nIdempotency: every payment attempt has a unique idempotency key (UUID). The processor must deduplicate — never charge twice.\n\n**Fraud service (internal):**\nCircuit breaker: if the fraud service is down, default to allow-with-logging (not deny-all — that stops all payments). Accept higher fraud risk during degraded mode.\nTimeout: 500ms max — the fraud check must be fast.\n\n**Notification service (internal):**\nAsync always. Fire-and-forget via SQS. Never block payment completion on notification success. If the notification queue is full, log and move on.\n\n**Data durability:**\nOutbox pattern — write the payment record and an outbox event atomically to the database in the same transaction. A separate worker reads the outbox and publishes events. This guarantees no lost events even if the service crashes mid-operation.\nWrite-ahead: confirm the payment is written to the database before returning success to the client.\n\n**Monitoring:** Every payment outcome (success, failure, retry, timeout) emitted as a metric. Real-time dashboard. Alert on success rate below 99.5% or P99 above 1 second.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you handle a payment that succeeded at the processor but your service crashed before recording it?', a: 'The idempotency key solves this. When the service restarts, the client retries with the same idempotency key. The processor recognises it as a duplicate and returns the original result without charging again. Your service records the result. This is why idempotency keys are non-negotiable for payment systems.' },
          { q: 'Why exponential backoff with jitter?', a: 'Exponential backoff: wait longer between each retry (100ms, 200ms, 400ms) to give the failing service time to recover. Jitter: add randomness to the delay so that 1000 clients retrying simultaneously do not all hit the service at the exact same time (thundering herd problem). Without jitter, retries can cause the same overload that caused the original failure.' },
        ],
      },
    ],
  },

  'scenario-docker-debugging': {
    slug: 'scenario-docker-debugging',
    title: 'Docker Container Restarting in a Loop After Deployment',
    subtitle: 'Docker · Containers · Debugging',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Your Docker container is restarting in a loop after deployment. Logs only show the container starting and immediately exiting. The same image worked fine in staging. Production has different environment variables and volume mounts.` },
      { type: 'text', heading: 'The Question', body: `**Walk through your complete debugging process. What do you check first, and how do you isolate the root cause?**` },
      { type: 'text', heading: 'How to Answer', body: `**Step 1 — Check container logs:**\ndocker logs <container_id>\ndocker logs --tail 50 <container_id>\nLook for application errors, missing dependencies, or configuration issues. If the container exits too fast for logs, use docker logs --follow to catch output in real-time.\n\n**Step 2 — Check the exit code:**\ndocker inspect <container_id> --format='{{.State.ExitCode}}'\nExit code 0 = normal exit (entrypoint completed). Exit code 1 = application error. Exit code 137 = OOM killed (SIGKILL). Exit code 139 = segfault. Exit code 126 = permission denied on entrypoint. Exit code 127 = entrypoint command not found.\n\n**Step 3 — Check the entrypoint and command:**\ndocker inspect <container_id> --format='{{.Config.Entrypoint}} {{.Config.Cmd}}'\nIs the entrypoint correct? A common mistake: the entrypoint script does not have execute permissions, or the shell (#!/bin/bash) is not available in Alpine images (use #!/bin/sh).\n\n**Step 4 — Check environment variables:**\ndocker inspect <container_id> --format='{{.Config.Env}}'\nCompare with staging. Missing or wrong env vars (database URL, API keys, feature flags) are the most common cause of "works in staging, fails in production."\n\n**Step 5 — Check resource limits:**\ndocker stats <container_id>\nIf the container is hitting memory limits, Docker kills it (exit code 137). Increase memory limits or investigate memory leaks.\n\n**Step 6 — Run interactively:**\ndocker run -it --entrypoint sh <image>\nThis bypasses the normal entrypoint and gives you a shell inside the container. Check if files exist, dependencies are installed, and configs are correct.\n\n**Step 7 — Check volume mounts:**\nAre volumes mounted correctly? Is the mount path overwriting critical application files? A common issue: mounting an empty host directory over /app/config wipes out the config files baked into the image.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What if the container exits with code 137?', a: 'Exit code 137 means the container was killed by SIGKILL — almost always an Out Of Memory (OOM) kill. Check docker inspect for OOMKilled: true. Solutions: increase the container memory limit, profile the application for memory leaks, or reduce memory usage (smaller heap size, fewer worker threads). In Kubernetes, this shows as OOMKilled in pod status.' },
          { q: 'How do you debug a container that exits immediately with no logs?', a: 'The container crashes before it can write any output. Try: (1) Run with --entrypoint sh to get a shell. (2) Check if the binary/script exists and has execute permissions. (3) Check if the base image has the required runtime (Alpine does not have bash, glibc, or many common tools). (4) Run docker events to see Docker-level events. (5) Check dmesg on the host for OOM kills.' },
        ],
      },
    ],
  },

  'scenario-docker-networking': {
    slug: 'scenario-docker-networking',
    title: 'Docker Container Cannot Reach External API',
    subtitle: 'Docker · Networking · Debugging',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `A service running in a Docker container cannot reach an external API (e.g., a payment gateway), but your host machine can curl the same API successfully. The container can reach other containers on the same Docker network. This started after a recent infrastructure change.` },
      { type: 'text', heading: 'The Question', body: `**How would you debug and resolve this networking issue?**` },
      { type: 'text', heading: 'How to Answer', body: `**Step 1 — Test from inside the container:**\ndocker exec -it <container> sh\ncurl -v https://api.paymentgateway.com/health\nping 8.8.8.8\nnslookup api.paymentgateway.com\n\nThis tells you: can the container reach the internet at all (ping)? Can it resolve DNS (nslookup)? Can it reach the specific API (curl)?\n\n**Step 2 — DNS resolution:**\nIf nslookup fails, the container cannot resolve domain names. Docker bridge networks use Docker's embedded DNS (127.0.0.11). Check if the DNS server is reachable. Try using an external DNS: docker run --dns 8.8.8.8 <image>. Check /etc/resolv.conf inside the container.\n\n**Step 3 — Network mode:**\nCheck the container's network mode: docker inspect <container> --format='{{.HostConfig.NetworkMode}}'\nBridge (default): container has its own network namespace. NAT is used for outbound traffic.\nHost: container shares the host's network stack — if the host can reach the API, the container should too.\nTry --network host to confirm it is a Docker networking issue.\n\n**Step 4 — Firewall and iptables:**\nDocker manipulates iptables for NAT and port forwarding. Check: sudo iptables -L -n -t nat. A recent infrastructure change may have flushed iptables rules or added rules that block Docker's outbound NAT. Restart Docker daemon to regenerate iptables rules.\n\n**Step 5 — Proxy configuration:**\nIf the host uses a corporate proxy, the container needs the same proxy settings. Pass them as environment variables: -e HTTP_PROXY=http://proxy:8080 -e HTTPS_PROXY=http://proxy:8080 -e NO_PROXY=localhost,127.0.0.1.\n\n**Step 6 — MTU issues:**\nDocker bridge default MTU is 1500. If the host network uses a smaller MTU (common in VPNs and overlay networks), packets get silently dropped. Fix: set MTU in Docker daemon config or docker network create --opt com.docker.network.driver.mtu=1400.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'Why can the container reach other containers but not external APIs?', a: 'Container-to-container communication on the same Docker network uses the bridge directly — no NAT, no iptables, no DNS resolution needed (Docker DNS handles it). External traffic requires NAT (iptables MASQUERADE rule), DNS resolution (external DNS servers), and routing through the host network stack. Any of these can fail independently.' },
          { q: 'What is the difference between bridge, host, and overlay networks?', a: 'Bridge: default, isolated network per host. Containers get private IPs, NAT for outbound. Host: container shares the host network stack — no isolation but no NAT overhead. Overlay: multi-host networking for Docker Swarm or Kubernetes. Containers on different hosts can communicate as if on the same network. Use bridge for single-host development, overlay for multi-host production.' },
        ],
      },
    ],
  },

  'scenario-k8s-zero-downtime': {
    slug: 'scenario-k8s-zero-downtime',
    title: 'Users Report Connection Resets During Kubernetes Rollout',
    subtitle: 'Kubernetes · Deployments · Zero Downtime',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `You need to deploy a new version of your app with zero downtime. After the rollout, users complain about connection resets and brief 502 errors. The rollout strategy is RollingUpdate. Readiness probes are configured. This happens on every deployment.` },
      { type: 'text', heading: 'The Question', body: `**Why are users experiencing connection resets during a rolling update, and how do you fix it?**` },
      { type: 'text', heading: 'How to Answer', body: `Connection resets during rollout usually mean in-flight connections are being dropped when pods are terminated, or new pods receive traffic before they are fully ready.\n\n**Root cause 1 — Readiness probe is wrong or missing:**\nIf the readiness probe does not accurately reflect when the app can serve traffic, Kubernetes sends requests to pods that are not ready. Fix: ensure the readiness endpoint only returns 200 when the app is truly ready (database connected, caches warmed, etc.).\n\n**Root cause 2 — No graceful shutdown:**\nWhen Kubernetes terminates a pod, it sends SIGTERM. If the app does not handle SIGTERM, it is killed immediately (SIGKILL after terminationGracePeriodSeconds), dropping in-flight requests. Fix: handle SIGTERM in your app — stop accepting new connections, finish in-flight requests, then exit cleanly.\n\n**Root cause 3 — No preStop hook:**\nEven after a pod is marked for termination, the load balancer may still send traffic to it for a few seconds (endpoint propagation delay). Fix: add a preStop hook with a sleep to allow the load balancer to remove the pod from its target list before the app shuts down.\n\n\`\`\`\nspec:\n  terminationGracePeriodSeconds: 60\n  containers:\n  - name: app\n    lifecycle:\n      preStop:\n        exec:\n          command: ["/bin/sh", "-c", "sleep 15"]\n    readinessProbe:\n      httpGet:\n        path: /health/ready\n        port: 8080\n      initialDelaySeconds: 5\n      periodSeconds: 5\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxUnavailable: 0\n      maxSurge: 1\n\`\`\`\n\n**Root cause 4 — maxUnavailable > 0:**\nIf maxUnavailable is set to 1 or higher, Kubernetes kills old pods before new ones are ready, reducing capacity. Fix: set maxUnavailable: 0 and maxSurge: 1 — Kubernetes creates a new pod first, waits for it to be ready, then terminates an old one.\n\n**For long-lived connections (WebSockets):** Rolling updates break persistent connections. Use blue-green deployments or traffic shifting via a service mesh (Istio, Linkerd) for graceful connection draining.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What is the difference between a preStop hook and terminationGracePeriodSeconds?', a: 'preStop hook runs before SIGTERM is sent — it is your chance to do cleanup (drain connections, deregister from service discovery). terminationGracePeriodSeconds is the total time Kubernetes waits after sending SIGTERM before sending SIGKILL. The preStop hook time counts against the grace period. If preStop takes 15s and grace period is 30s, the app has 15s after SIGTERM to finish.' },
          { q: 'How do you test zero-downtime deployments?', a: 'Run a load test (k6, wrk, or hey) that sends continuous requests during a rollout. Monitor for any 5xx errors or connection resets. If you see even one error, the deployment is not truly zero-downtime. Automate this test in CI — deploy to staging under load and assert zero errors.' },
        ],
      },
    ],
  },

  'scenario-k8s-autoscaling': {
    slug: 'scenario-k8s-autoscaling',
    title: 'Design Autoscaling for Sudden Traffic Spikes in Kubernetes',
    subtitle: 'Kubernetes · HPA · Cluster Autoscaler',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Your web app hosted on Kubernetes receives sudden traffic spikes — 10x normal load within minutes — due to marketing campaigns and viral content. During the last spike, pods maxed out CPU, requests queued up, and users saw timeouts. Auto-scaling was not configured.` },
      { type: 'text', heading: 'The Question', body: `**How do you design multi-layer autoscaling in Kubernetes to handle sudden, unpredictable traffic spikes?**` },
      { type: 'text', heading: 'How to Answer', body: `Autoscaling must be multi-layered: Pod level → Cluster level → Infrastructure level → External dependencies.\n\n**Layer 1 — Horizontal Pod Autoscaler (HPA):**\nScale pods based on CPU, memory, or custom metrics (requests per second, queue depth).\n\`\`\`\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: webapp-hpa\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: webapp\n  minReplicas: 3\n  maxReplicas: 30\n  metrics:\n  - type: Resource\n    resource:\n      name: cpu\n      target:\n        type: Utilization\n        averageUtilization: 60\n  behavior:\n    scaleUp:\n      stabilizationWindowSeconds: 30\n      policies:\n      - type: Percent\n        value: 100\n        periodSeconds: 60\n\`\`\`\nKey: set scaleUp aggressively (allow doubling every 60s) and scaleDown conservatively (stabilization window of 5 minutes to avoid flapping).\n\n**Layer 2 — Vertical Pod Autoscaler (VPA):**\nIf traffic spikes cause OOMKilled events, VPA adjusts memory and CPU requests automatically. Usually combined with HPA — HPA scales horizontally, VPA right-sizes each pod.\n\n**Layer 3 — Cluster Autoscaler:**\nWhen HPA creates new pods but no node has capacity, the scheduler marks pods as Pending. Cluster Autoscaler detects this and provisions new nodes from the cloud provider's autoscaling group. Latency: 3-5 minutes for a new node. Mitigation: keep a buffer of overprovisioned capacity (1-2 extra nodes always warm).\n\n**Layer 4 — KEDA (for event-driven spikes):**\nFor extremely bursty workloads, KEDA (Kubernetes Event-Driven Autoscaler) scales on external triggers: Kafka queue depth, SQS message count, Prometheus metrics, HTTP request rate. KEDA can scale from 0 to N pods, which HPA cannot.\n\n**Graceful scaling practices:**\n- Readiness probes: new pods do not receive traffic until ready\n- Pod Disruption Budget: ensure minimum pods remain during scale-down\n- Overprovisioning buffer: keep idle pods ready for instant burst absorption\n- Resource requests/limits: tune to prevent overloading nodes\n\n**Do not forget downstream:** Scaling web pods is useless if the database cannot handle the load. Ensure: DB read replicas, Redis caching, connection pooling (PgBouncer), and rate limiting to protect downstream services.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What if Cluster Autoscaler is too slow for sudden spikes?', a: 'Cluster Autoscaler takes 3-5 minutes to provision new nodes. For sudden spikes, this is too slow. Solutions: (1) Pre-scale before known events (marketing campaigns). (2) Keep warm node pools (pre-provisioned but idle nodes). (3) Set HPA minReplicas high enough to absorb the initial burst without needing new nodes. (4) Use Karpenter (AWS) instead of Cluster Autoscaler — it provisions nodes faster and more efficiently.' },
          { q: 'How do you scale based on custom metrics instead of CPU?', a: 'Install Prometheus Adapter or KEDA. Define custom metrics (requests per second, queue depth, response latency). HPA can target these via the custom.metrics.k8s.io API. Example: scale when RPS per pod exceeds 100. Custom metrics are more responsive than CPU for web workloads because CPU lags behind actual load.' },
        ],
      },
    ],
  },

  'scenario-k8s-cicd': {
    slug: 'scenario-k8s-cicd',
    title: 'New Docker Image Pushed but Kubernetes Deployment Not Updated',
    subtitle: 'Kubernetes · CI/CD · GitOps',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Your CI/CD pipeline builds a new Docker image and pushes it to the container registry. But the Kubernetes deployment does not pick up the new image. The deployment still runs the old version. The image tag is "latest" and the pipeline completes successfully.` },
      { type: 'text', heading: 'The Question', body: `**Why does Kubernetes not pick up the new image, and how do you fix this in your CI/CD pipeline?**` },
      { type: 'text', heading: 'How to Answer', body: `**Root cause:** Kubernetes uses imagePullPolicy to decide whether to pull a new image. If the image tag has not changed (still "latest"), Kubernetes sees the same tag in the deployment spec and does nothing — no rollout is triggered. Even if the underlying image changed in the registry, Kubernetes does not know.\n\n**Fix 1 — Use unique image tags (recommended):**\nTag every image with the Git commit SHA or build number: myapp:abc123f or myapp:build-456. Update the deployment manifest with the new tag. Kubernetes sees a spec change and triggers a rolling update.\n\n**Fix 2 — Force a rollout:**\nkubectl rollout restart deployment/myapp\nThis forces Kubernetes to recreate all pods, pulling the latest image. Quick fix but not a proper CI/CD solution.\n\n**Fix 3 — Set imagePullPolicy: Always:**\nThis forces Kubernetes to pull the image on every pod creation, even if the tag has not changed. Works but is slower and wastes bandwidth. Not recommended as a permanent solution.\n\n**The right CI/CD pipeline:**\n1. Build image with unique tag (git SHA): docker build -t myapp:$GIT_SHA .\n2. Push to registry: docker push myapp:$GIT_SHA\n3. Update Kubernetes manifest with new tag (sed, kustomize, or Helm --set image.tag=$GIT_SHA)\n4. Apply: kubectl apply -f deployment.yaml or helm upgrade\n5. Wait for rollout: kubectl rollout status deployment/myapp\n\n**GitOps approach (best practice):**\nUse ArgoCD or Flux. CI pushes the new image and updates the manifest in a Git repo. ArgoCD detects the Git change and syncs the cluster automatically. The Git repo is the single source of truth for what is deployed.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'Why should you never use the "latest" tag in production?', a: '"latest" is mutable — it points to whatever was pushed last. You cannot tell which version is running. Rollbacks are impossible (what do you rollback to?). Two pods might pull different versions of "latest" if the image was updated between pod creations. Always use immutable tags: git SHA, semantic version, or build number.' },
          { q: 'What is the difference between ArgoCD and Flux?', a: 'Both are GitOps tools that sync Kubernetes state from a Git repo. ArgoCD has a web UI, supports Helm/Kustomize/plain YAML, and has a richer feature set (app-of-apps, sync waves). Flux is lighter, more composable, and integrates tightly with Helm. ArgoCD is more popular for teams that want a visual dashboard. Flux is preferred by teams that want everything as code with no UI dependency.' },
        ],
      },
    ],
  },

  'scenario-docker-security': {
    slug: 'scenario-docker-security',
    title: 'API Keys Hardcoded in Docker Image — Security Incident',
    subtitle: 'Docker · Security · Secrets Management',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `A security scan reveals that developers have hardcoded API keys and database credentials directly into a Docker image that has been pushed to a public container registry. The image has been public for 2 days.` },
      { type: 'text', heading: 'The Question', body: `**What is the immediate risk, what do you do right now, and how do you prevent this permanently?**` },
      { type: 'text', heading: 'How to Answer', body: `**Immediate risk:** Anyone who pulled the image can extract the secrets. Docker images are layered — even if you delete the secret in a later layer, it exists in the image history. Run docker history <image> to see every layer. Secrets in any layer are extractable.\n\n**Right now (first 10 minutes):**\n1. Rotate all exposed credentials immediately. Change every API key, database password, and token that was in the image. Do not wait — automated bots scan public registries for secrets.\n2. Delete the image from the public registry.\n3. Check access logs for the exposed credentials — were they used by anyone other than your application?\n\n**Remediation:**\n1. Rebuild the image without secrets. Never put secrets in Dockerfiles, COPY commands, or ENV instructions.\n2. Push the clean image to the registry.\n3. Redeploy all services using the new image.\n\n**Prevention — how to handle secrets properly:**\n\n**Runtime environment variables:** Pass secrets at container start: docker run -e DB_PASSWORD=secret myapp. In Kubernetes: use Secrets mounted as env vars or files.\n\n**Docker BuildKit secrets:** For build-time secrets (e.g., npm token to install private packages):\n\`\`\`\nRUN --mount=type=secret,id=npm_token \\\\\n  NPM_TOKEN=$(cat /run/secrets/npm_token) npm ci\n\`\`\`\nBuildKit secrets are never written to image layers.\n\n**External secret managers:** HashiCorp Vault, AWS Secrets Manager, or GCP Secret Manager. The application fetches secrets at runtime — they never exist in the image or environment variables.\n\n**CI/CD pipeline:** Use pipeline secrets (GitHub Actions secrets, GitLab CI variables). Never echo secrets in build logs.\n\n**Automated scanning:** Add tools like detect-secrets (pre-commit hook), Trivy, or GitGuardian to scan images and code for leaked secrets before they reach a registry.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'Why is deleting the layer not enough?', a: 'Docker images are content-addressable. Even if you remove the secret in a later Dockerfile instruction (RUN rm /app/.env), the layer that added it still exists in the image. Anyone can docker save the image, extract the layers, and find the secret. The only fix is to rebuild the image from scratch without the secret and rotate the exposed credentials.' },
          { q: 'What is the difference between Docker secrets and Kubernetes secrets?', a: 'Docker secrets are for Docker Swarm — stored encrypted in the Swarm raft log, mounted as files in /run/secrets/ inside containers. Kubernetes secrets are base64-encoded (not encrypted by default) and stored in etcd. Enable encryption at rest for Kubernetes secrets. Both solve the same problem: injecting sensitive data into containers without baking it into images.' },
        ],
      },
    ],
  },
};
