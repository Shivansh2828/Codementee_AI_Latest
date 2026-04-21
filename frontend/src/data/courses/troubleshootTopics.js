/**
 * Troubleshooting Scenarios — Hands-on debugging questions
 * Finding root cause of customer-facing issues.
 * Each scenario: situation → question → step-by-step debugging approach → follow-ups.
 */

export const TROUBLESHOOT_TOPICS = {

  'troubleshoot-cpu-spike': {
    slug: 'troubleshoot-cpu-spike',
    title: 'CPU Spike on Production Server',
    subtitle: 'Diagnose and resolve unexpected CPU utilisation',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `You are the DevOps engineer responsible for maintaining the production environment of a web application. Suddenly, the CPU usage on one of the critical servers spikes unexpectedly. Users are experiencing degraded performance, and it is affecting the overall availability of the application.` },
      { type: 'text', heading: 'The Question', body: `**You receive an alert notifying you of a significant spike in CPU usage on one of your production servers. What steps would you take to investigate and identify the root cause?**` },
      { type: 'text', heading: 'How to Debug This', body: `Start with monitoring dashboards to get the big picture — look for unusual patterns in CPU, memory, and other metrics. Then narrow down systematically.\n\n**Check recent changes first.** Were there any deployments, updates, or config changes in the last few hours? This is the most common cause of sudden spikes. If yes, correlate the timing with the spike.\n\n**Identify the offending process.** SSH into the server and run top or htop. Sort by CPU usage. Is it one process consuming 100% of a core, or is it system-wide? If it is a single process, you have your suspect — check what that process is doing (strace -p PID for system calls, or application-level profiling).\n\n**Analyse logs.** Review application logs, system logs (/var/log/syslog), and service logs for errors or warnings that correlate with the spike. A tight error-retry loop can easily peg a CPU.\n\n**Check for runaway queries.** If the application uses a database, check for long-running or locked queries. A missing index on a table that just grew past a threshold can turn a 10ms query into a 10-second full table scan.\n\n**Look at network activity.** Use ss -tlnp and iftop to check if there is unusual network traffic — a DDoS or a misconfigured service making thousands of outbound connections can spike CPU.\n\n**Profile the application.** If the process is your application, use language-specific profilers (py-spy for Python, async-profiler for Java, perf for system-level). Identify which function or code path is consuming the most CPU cycles.\n\n**Temporary mitigation.** While investigating, consider scaling up the instance (vertical scaling) or adding instances behind the load balancer to absorb the load. Kill the runaway process if it is non-critical. Restart the service if the issue appears to be a memory leak or resource exhaustion causing CPU thrashing.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What if top shows high CPU but no single process is responsible?', a: 'Check for high system time (sy% in top) vs user time (us%). High system time suggests kernel-level activity — could be excessive context switching, disk I/O wait (check with iostat), or network interrupts. Also check for zombie processes (Z state) and high interrupt rates (check /proc/interrupts).' },
          { q: 'How do you prevent this from happening again?', a: 'Set up CPU usage alerts with appropriate thresholds (warning at 70%, critical at 90%). Add application-level metrics (request latency, queue depth) that often spike before CPU does. Implement auto-scaling so additional instances absorb load automatically. Add load testing to your CI/CD pipeline to catch performance regressions before production.' },
        ],
      },
    ],
  },

  'troubleshoot-post-deploy': {
    slug: 'troubleshoot-post-deploy',
    title: 'Errors After Deployment',
    subtitle: 'Users report failures after a recent release — debug and decide on rollback',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `You are the DevOps engineer overseeing the deployment process of a mission-critical e-commerce application. After a recent deployment, users begin reporting errors when trying to place orders, impacting the revenue-generating functionality of the platform.` },
      { type: 'text', heading: 'The Question', body: `**You receive multiple reports from users indicating errors in the e-commerce application shortly after a recent deployment. What steps would you take to troubleshoot the reported errors and, if necessary, initiate a rollback?**` },
      { type: 'text', heading: 'How to Debug This', body: `**Verify the alerts are real.** Confirm the reports align with monitoring data. Check error rate dashboards — is this a widespread issue or isolated to specific users or endpoints? Correlate the timing with the deployment.\n\n**Check deployment logs.** Review the CI/CD pipeline logs for the recent deployment. Look for failed steps, configuration issues, or warnings that were ignored. Check if all pods/instances are running the new version (a partial rollout can cause inconsistent behaviour).\n\n**Isolate the change.** If you have feature flags, disable the new features one by one to identify which change caused the issue. If not, compare the diff between the current and previous version — focus on database migrations, API changes, and configuration changes.\n\n**Check the database.** Did the deployment include a migration? Verify it ran successfully. Check for data inconsistencies or schema issues. A common failure: a migration adds a NOT NULL column without a default value, causing INSERT failures for existing code paths.\n\n**Evaluate the rollback plan.** Before rolling back, assess: are there irreversible changes (database migrations that dropped columns, data transformations)? If the rollback is safe, execute it immediately — revert the codebase to the previous version, roll back any reversible schema changes, and revert configuration changes.\n\n**After rollback:** Verify the errors are resolved. Monitor closely for 30 minutes. Communicate with stakeholders — inform the development team, product owners, and customer support about the rollback and expected timeline for a fix.\n\n**Document everything.** Write up the incident: what was deployed, what broke, how it was detected, how long it took to rollback, and what the root cause was. This becomes the basis for preventing the same class of failure.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you prevent bad deployments from reaching users?', a: 'Canary deployments (route 5% of traffic to the new version, monitor, then increase). Automated rollback triggers (if error rate exceeds threshold within 10 minutes of deploy, auto-rollback). Better staging environments that mirror production data. Database migration testing against production-like data in CI.' },
          { q: 'What if the rollback itself causes issues?', a: 'This happens when the deployment included a forward-only database migration. Prevention: always make migrations backward-compatible. The old code should work with the new schema. If you are stuck: deploy a hotfix that works with the current schema state, rather than trying to reverse the migration.' },
        ],
      },
    ],
  },

  'troubleshoot-traffic-spike': {
    slug: 'troubleshoot-traffic-spike',
    title: 'Traffic Surge Causing Degradation',
    subtitle: 'Live event causes infrastructure to buckle under load',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `You manage the infrastructure of an online streaming platform. A popular live event has caused a surge in user traffic. The infrastructure is struggling to handle the increased load. Users are experiencing slow response times, and the risk of downtime is imminent.` },
      { type: 'text', heading: 'The Question', body: `**Your platform is experiencing a significant increase in user traffic, leading to performance issues and potential downtime. Outline the steps you would take to scale the system and ensure it can handle the surge effectively.**` },
      { type: 'text', heading: 'How to Debug This', body: `**Identify the bottleneck first.** Do not blindly scale everything. Check monitoring dashboards: is it the application layer (high CPU on app servers), the database (connection count maxed, slow queries), the network (bandwidth saturation), or a downstream dependency (payment gateway, CDN)? The bottleneck determines your response.\n\n**Immediate mitigation — scale what is saturated.** If app servers are the bottleneck: scale horizontally by adding more instances behind the load balancer. If you are on Kubernetes, increase replica count immediately (kubectl scale deployment/api --replicas=20). If the database is the bottleneck: enable read replicas for read-heavy queries, implement connection pooling (PgBouncer), and cache frequently accessed data in Redis.\n\n**Offload static content.** Ensure all static assets (images, videos, CSS, JS) are served from a CDN (CloudFront, Cloudflare). This reduces load on your origin servers dramatically. If the CDN is not configured, this is the single highest-impact change.\n\n**Enable caching aggressively.** Cache API responses for data that does not change frequently (event listings, user profiles). Even a 30-second cache TTL can reduce database load by 90% during a traffic spike.\n\n**Queue non-critical work.** Email notifications, analytics events, and logging can be queued (SQS, Kafka) and processed after the spike passes. Keep the critical path (streaming, checkout) as lean as possible.\n\n**Implement rate limiting.** If bot traffic or abusive clients are contributing to the spike, enable rate limiting at the load balancer or API gateway level. Protect your infrastructure from non-legitimate traffic.\n\n**Communicate.** If degradation is user-visible, update the status page. Set expectations: "We are experiencing high demand due to [event]. Some users may experience slower load times. We are actively scaling our infrastructure."` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you prepare for known traffic spikes in advance?', a: 'Pre-scale 24 hours before the event. Load test at 110% of expected peak in staging. Pre-warm caches and CDN. Prepare runbooks with specific scaling commands. Have the team on standby during the event. Disable non-essential features proactively to reserve capacity for the critical path.' },
          { q: 'What if auto-scaling is too slow to respond?', a: 'Auto-scaling typically takes 3-5 minutes to provision new instances. For sudden spikes, this is too slow. Solution: pre-scale to handle expected peak before the event. Set HPA minReplicas high enough to absorb the initial burst. Use warm pools (pre-provisioned but idle instances) that can be activated in seconds.' },
        ],
      },
    ],
  },

  'troubleshoot-http-errors': {
    slug: 'troubleshoot-http-errors',
    title: 'HTTP 5xx and 3xx Errors',
    subtitle: 'Customers seeing server errors and unexpected redirects',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Customers have reported encountering 5xx and 3xx error codes when accessing certain pages on your web application. This is affecting the user experience, and you need to investigate and resolve it promptly.` },
      { type: 'text', heading: 'The Question', body: `**Several customers are reporting 5xx and 3xx error codes on specific pages. Describe the steps you would take to troubleshoot this issue and ensure a resolution.**` },
      { type: 'text', heading: 'Understanding the Error Codes', body: `Before debugging, understand what the codes mean:\n\n**5xx errors (server-side):** The server failed to fulfil a valid request.\n500 Internal Server Error — generic server bug, unhandled exception\n502 Bad Gateway — the reverse proxy (Nginx) cannot reach the upstream app server\n503 Service Unavailable — server is overloaded or in maintenance\n504 Gateway Timeout — the upstream app server took too long to respond\n\n**3xx errors (redirects):** The resource has moved.\n301 Moved Permanently — URL changed permanently (SEO-safe redirect)\n302 Found — temporary redirect\n307/308 — preserve the HTTP method during redirect\n\nA 3xx is not always a problem — redirects are normal (HTTP→HTTPS, www→non-www). It becomes a problem when there is a redirect loop (A→B→A→B...) or when a redirect points to a non-existent page (3xx followed by 404).` },
      { type: 'text', heading: 'How to Debug This', body: `**For 5xx errors:**\n\nCheck server logs first — the error message is almost always in the application log or Nginx error log. For 502: is the app server running? (systemctl status myapp, docker ps). Check if the app crashed or ran out of memory. For 503: is the server overloaded? Check CPU, memory, and connection counts. For 504: the app is too slow — check for slow database queries, external API timeouts, or resource exhaustion.\n\n**For 3xx errors:**\n\nUse curl -v or browser DevTools Network tab to trace the redirect chain. Check Nginx config for rewrite rules and return 301 directives. Check application code for redirect logic. Look for redirect loops — these often happen when HTTP→HTTPS redirect conflicts with application-level redirects.\n\n**Common root causes:**\nRecent deployment changed routing or redirect rules. SSL certificate expired (causes 502 or redirect issues). Load balancer health check failing (removes healthy instances). Database connection pool exhausted (causes 500 on DB-dependent pages). Third-party API timeout (causes 504 on pages that call external services).\n\n**Resolution:** Fix the root cause, verify the fix, monitor for 30 minutes. If the issue started after a deployment, rollback first, investigate later.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you differentiate between a 502 and a 504?', a: '502 Bad Gateway: the upstream server is unreachable or returned an invalid response. Usually means the app crashed or is not running. 504 Gateway Timeout: the upstream server is reachable but did not respond in time. Usually means the app is running but too slow (long query, external API timeout). Check Nginx error log — it will say "upstream prematurely closed connection" (502) or "upstream timed out" (504).' },
          { q: 'How do you debug a redirect loop?', a: 'Use curl -L -v URL to follow redirects with verbose output. You will see each redirect hop. Common cause: Nginx redirects HTTP→HTTPS, but the app also redirects HTTP→HTTPS, creating a loop. Or: the app redirects /login→/dashboard, but /dashboard redirects back to /login because the session is not being preserved across redirects (cookie domain mismatch).' },
        ],
      },
    ],
  },

  'troubleshoot-k8s-pods': {
    slug: 'troubleshoot-k8s-pods',
    title: 'Kubernetes Pods Failing to Start',
    subtitle: 'Containers crashing across multiple pods in a microservices cluster',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `You manage a Kubernetes cluster for a microservices-based application. You receive alerts indicating that containers are failing to start across multiple pods. This is impacting the availability of critical services.` },
      { type: 'text', heading: 'The Question', body: `**Containers in your Kubernetes cluster are failing to start, affecting multiple pods. Outline the steps you would take to troubleshoot and resolve this issue.**` },
      { type: 'text', heading: 'How to Debug This', body: `**Step 1 — Get the big picture.** Run kubectl get pods --all-namespaces and look at the STATUS column. The status tells you exactly what is wrong:\n\n**CrashLoopBackOff** — the container starts, crashes, Kubernetes restarts it, it crashes again. This is an application error. Check logs: kubectl logs <pod> --previous (shows logs from the crashed container).\n\n**ImagePullBackOff** — Kubernetes cannot pull the container image. Wrong image name, wrong tag, or registry authentication failure. Check: kubectl describe pod <pod> and look at the Events section for the exact error.\n\n**Pending** — the pod cannot be scheduled. Either there are not enough resources on any node (CPU/memory requests exceed available capacity), or node selectors/affinity rules do not match any node. Check: kubectl describe pod <pod> — the Events section will say "Insufficient cpu" or "no nodes match".\n\n**CreateContainerConfigError** — a ConfigMap or Secret referenced by the pod does not exist. Check: kubectl describe pod <pod> for the missing reference.\n\n**Step 2 — For CrashLoopBackOff (most common):** Read the logs (kubectl logs <pod>). The application is crashing on startup. Common causes: missing environment variable, database connection refused (wrong host/port/credentials), missing config file, port already in use, out of memory (check resource limits).\n\n**Step 3 — For ImagePullBackOff:** Verify the image exists: docker pull <image> from your local machine. Check registry credentials: is the imagePullSecret configured correctly? Is the secret in the same namespace as the pod?\n\n**Step 4 — For Pending:** Check node capacity: kubectl describe nodes | grep -A 5 "Allocated resources". If nodes are full, either scale up the cluster (add nodes) or reduce resource requests on pods. Check if a PersistentVolumeClaim is pending (storage not available).\n\n**Step 5 — Check cluster-level events:** kubectl get events --sort-by=.metadata.creationTimestamp shows recent cluster events. Look for node failures, resource pressure, or controller errors.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What is the difference between a liveness probe failure and a CrashLoopBackOff?', a: 'CrashLoopBackOff: the container process exits (crashes) on its own. Liveness probe failure: the container is running but not responding to health checks, so Kubernetes kills and restarts it. Both result in restarts, but the cause is different. For liveness failures: check if the health endpoint is correct, if the initialDelaySeconds is long enough for the app to start, and if the app is deadlocked.' },
          { q: 'How do you debug a pod that crashes immediately with no logs?', a: 'If kubectl logs shows nothing, the container is crashing before it can write logs. Try: kubectl describe pod <pod> for events. Check if the entrypoint/command is correct. Try running the image locally: docker run -it <image> /bin/sh to see if it starts. Check if resource limits are too low (OOMKilled appears in describe output). Check if a required volume mount is missing.' },
        ],
      },
    ],
  },

  'troubleshoot-connectivity': {
    slug: 'troubleshoot-connectivity',
    title: 'Intermittent Network Connectivity Issues',
    subtitle: 'Users experience random connection drops and timeouts',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Users have reported experiencing intermittent connectivity issues when accessing certain features of your web application. The issues are affecting user experience and need to be addressed promptly.` },
      { type: 'text', heading: 'The Question', body: `**Users are reporting intermittent connectivity issues with your web application. Describe the steps you would take to troubleshoot and resolve network-related problems impacting user access.**` },
      { type: 'text', heading: 'How to Debug This', body: `Intermittent issues are the hardest to debug because they are not consistently reproducible. The key is to gather data during the failure window.\n\n**Correlate with monitoring data.** Check network metrics: latency, packet loss, bandwidth usage, connection counts. Look for patterns — does it happen at specific times (peak hours), from specific regions, or for specific user types (mobile vs desktop)?\n\n**Check DNS resolution.** Run dig yourdomain.com from multiple locations. Incorrect or slow DNS resolution causes intermittent failures. Check TTL values — very low TTLs cause frequent re-resolution which can fail under load. Verify the DNS provider's status page.\n\n**Check the load balancer.** Is it healthy? Are all backend targets passing health checks? An unhealthy target that flaps (passes, fails, passes, fails) causes intermittent errors for users routed to it. Check ALB access logs for 5xx errors and which target they came from.\n\n**Check SSL/TLS.** Expired or misconfigured certificates cause intermittent failures depending on the client. Some clients cache the old cert, others do not. Verify certificates are valid and correctly installed. Check for mixed content issues (HTTP resources on an HTTPS page).\n\n**Check for network equipment issues.** If you manage your own infrastructure: check routers, switches, and firewalls for packet drops, high CPU, or error counters. In cloud: check VPC flow logs for rejected traffic, security group rules that might be too restrictive, and NAT gateway throughput limits.\n\n**Check external dependencies.** Is a third-party API or CDN having issues? Check their status pages. Use tools like curl with timing (-w "time_total: %{time_total}") to measure response times to each dependency.\n\n**Packet capture as last resort.** If nothing else reveals the issue, run tcpdump or Wireshark to capture traffic during a failure window. Look for TCP retransmissions, RST packets, or connection timeouts. This is time-consuming but definitive.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'How do you debug an issue that only affects some users?', a: 'Check if affected users share something in common: same region (DNS or CDN issue), same ISP (routing issue), same browser (client-side bug), same feature (application bug). Use request IDs to trace specific failing requests through your infrastructure. Check if a specific backend instance is unhealthy — users routed to that instance fail, others do not.' },
          { q: 'What tools do you use for network debugging?', a: 'ping (basic connectivity), traceroute/mtr (path analysis, find where packets are lost), dig/nslookup (DNS), curl -v (HTTP with timing), ss/netstat (connection state), tcpdump (packet capture), Wireshark (packet analysis), VPC flow logs (cloud network traffic). For ongoing monitoring: Prometheus blackbox exporter (probe endpoints from multiple locations).' },
        ],
      },
    ],
  },

  'troubleshoot-slow-db': {
    slug: 'troubleshoot-slow-db',
    title: 'Slow Database Queries',
    subtitle: 'Application response times degraded due to database performance',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Users have reported that certain features of your web application are experiencing slow response times. Upon investigation, you observe that database queries are taking significantly longer than usual.` },
      { type: 'text', heading: 'The Question', body: `**Users are reporting slow response times, and you have identified that database queries are the bottleneck. Describe the steps you would take to troubleshoot and optimise the slow-performing queries.**` },
      { type: 'text', heading: 'How to Debug This', body: `**Identify the slow queries.** Enable the slow query log (PostgreSQL: log_min_duration_statement = 500 for queries over 500ms). Or check your APM tool (Datadog, New Relic) for the slowest database calls. Focus on the queries that are both slow AND frequent — a 2-second query running 1000 times per minute is worse than a 10-second query running once per hour.\n\n**Analyse execution plans.** Run EXPLAIN ANALYZE on the slow queries. Look for: sequential scans on large tables (missing index), nested loop joins on large datasets (should be hash join), high row estimates vs actual rows (stale statistics). The execution plan tells you exactly where the database is spending time.\n\n**Check indexing.** The most common cause of slow queries is a missing index. If EXPLAIN shows a Seq Scan on a table with millions of rows, add an index on the WHERE clause columns. But do not over-index — every index slows down writes. Use pg_stat_user_indexes to find unused indexes that can be removed.\n\n**Check for locking.** Run SELECT * FROM pg_stat_activity WHERE wait_event_type = 'Lock' to find queries waiting on locks. Long-running transactions holding locks can block other queries. A common pattern: a batch job holds a lock on a table while web requests queue up waiting for it.\n\n**Check connection count.** If the database is at max connections, new queries queue up waiting for a connection. Check: SELECT count(*) FROM pg_stat_activity. If it is near max_connections, implement connection pooling (PgBouncer) in front of the database.\n\n**Update statistics.** Run ANALYZE on tables with stale statistics. The query planner uses statistics to choose execution plans — stale stats lead to bad plans. PostgreSQL auto-analyzes, but after large data loads you should run it manually.\n\n**Consider caching.** If the same query runs thousands of times with the same parameters, cache the result in Redis with a short TTL (30-60 seconds). This is often the fastest fix for read-heavy workloads.\n\n**Consider read replicas.** If the database is CPU-bound from read queries, route read traffic to a read replica. This is especially effective for reporting queries and dashboard data that do not need real-time consistency.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What is an N+1 query and how do you fix it?', a: 'An N+1 query: you fetch a list of 100 orders (1 query), then for each order you fetch the user (100 queries) = 101 queries total. Fix: use a JOIN to fetch orders and users in one query, or use an IN clause (SELECT * FROM users WHERE id IN (1,2,3...)). ORMs often cause N+1 problems — use eager loading (include/prefetch_related) instead of lazy loading.' },
          { q: 'When should you add an index vs rewrite the query?', a: 'Add an index when: the query is correct but the database is doing a full table scan. Rewrite the query when: the query itself is inefficient (N+1, unnecessary subqueries, SELECT * when you only need 2 columns, missing LIMIT on large result sets). Often you need both — rewrite the query AND add an index.' },
        ],
      },
    ],
  },

  'troubleshoot-disk-space': {
    slug: 'troubleshoot-disk-space',
    title: 'Server Running Out of Disk Space',
    subtitle: 'File uploads failing and services degrading due to full disk',
    duration: '15 min', difficulty: 'Beginner',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Users have reported errors when uploading files, and system monitoring alerts indicate that the server is running out of disk space. Your task is to identify the directories consuming the most space and free up disk space to ensure smooth operation.` },
      { type: 'text', heading: 'The Question', body: `**Users are reporting errors related to disk space limitations. Describe the steps you would take to identify the directories consuming the most space and free up disk space.**` },
      { type: 'text', heading: 'How to Debug This', body: `**Get the overview first.** Run df -h to see disk usage across all filesystems. Identify which mount point is full (usually / or /var). Note the percentage — at 100%, the system cannot write anything, including logs, which makes debugging harder.\n\n**Find the biggest directories.** Run du -h --max-depth=1 / | sort -rh | head -20 to find the largest top-level directories. Then drill down: du -h --max-depth=1 /var | sort -rh | head -20. Keep drilling until you find the specific directory consuming space.\n\n**Common culprits:**\n\n/var/log — Log files that were never rotated. A single application writing debug logs to production can fill a disk in hours. Fix: truncate the log (> /var/log/bigfile.log), then set up logrotate to prevent recurrence.\n\n/tmp — Temporary files from builds, uploads, or crashed processes. Safe to clean: rm -rf /tmp/* (but check if any running process is using files there).\n\nDocker — Docker images, containers, and volumes can consume enormous space. Run docker system df to see usage. docker system prune -a removes all unused images, containers, and networks.\n\nOld deployments — Previous application versions that were never cleaned up. Check /var/www, /opt, or wherever your app is deployed.\n\nDatabase WAL/binlogs — PostgreSQL WAL files or MySQL binary logs can grow if replication is lagging or archiving is misconfigured.\n\nCore dumps — Check /var/core or /var/crash for core dump files from crashed processes.\n\n**After cleanup:** Verify with df -h that space is freed. Set up monitoring alerts for disk usage (warning at 80%, critical at 90%). Implement automated cleanup: logrotate for logs, docker system prune on a cron schedule, lifecycle policies for old deployments.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What if df shows the disk is full but du shows plenty of free space?', a: 'This happens when a process has deleted a file but still holds it open. The space is not freed until the process releases the file handle. Find it with: lsof +L1 (lists deleted files still held open). Restart the offending process to release the file handles and reclaim the space.' },
          { q: 'How do you prevent disk space issues proactively?', a: 'Monitoring alerts at 80% and 90% thresholds. Logrotate configured for all log files. Docker prune on a weekly cron. Separate mount points for /var/log and application data so a log explosion does not fill the root filesystem. S3 or object storage for user uploads instead of local disk.' },
        ],
      },
    ],
  },

  'troubleshoot-disk-extreme': {
    slug: 'troubleshoot-disk-extreme',
    title: 'Server Completely Unresponsive — Disk 100% Full',
    subtitle: 'Cannot even run commands due to zero free space',
    duration: '10 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `A critical Linux server is completely unresponsive. Users cannot log in, and attempts to SSH result in errors. You suspect extreme disk space utilisation. You find yourself unable to run any commands because the system has zero free space — even basic commands fail because they need to write temporary files.` },
      { type: 'text', heading: 'The Question', body: `**The server is at 100% disk utilisation and you cannot run any commands. How do you recover?**` },
      { type: 'text', heading: 'How to Recover', body: `This is a critical situation because at 0% free space, the system cannot write anything — not even temporary files needed by basic commands. SSH may fail because it needs to write to /var/log. Here is the recovery process:\n\n**If SSH fails:** Access the server through the cloud provider's console (AWS EC2 Serial Console, GCP Serial Console) or a virtual console (KVM, IPMI). If physical: connect a monitor and keyboard directly.\n\n**If you can get a shell but commands fail:** The trick is to free space without needing to write anything. These commands work even at 0% free space:\n\n\`\`\`\n# Truncate large log files (does not create new files)\necho '' > /var/log/syslog\necho '' > /var/log/app.log\n\n# Remove known safe targets\nrm -f /var/core/*\nrm -f /tmp/*\nrm -rf /var/cache/apt/archives/*\n\`\`\`\n\nOnce you have freed even 1% of space, normal commands start working again. Then follow the standard disk space troubleshooting process: du -h --max-depth=1 / to find the biggest directories and clean them up.\n\n**If nothing works:** Reboot into recovery mode (single-user mode). Mount the filesystem and clean up from there. As a last resort: attach the disk to another instance as a secondary volume, clean it up, then reattach.\n\n**After recovery:** Implement disk space monitoring with alerts at 80% and 90%. Set up automated log rotation. Add a reserved space buffer (tune2fs -m 5 reserves 5% of disk for root user — this prevents non-root processes from filling the disk completely while still allowing root to log in and clean up).` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What is the reserved block percentage and why does it matter?', a: 'By default, ext4 reserves 5% of disk space for the root user (tune2fs -m). This means when a non-root process fills the disk to 95%, it gets "disk full" errors, but root can still log in and clean up using the reserved 5%. If this was set to 0%, even root cannot write when the disk is full. Always keep at least 2-5% reserved on production servers.' },
          { q: 'How do you prevent this from ever happening?', a: 'Monitoring alerts at 80% (warning) and 90% (critical). Separate mount points: /var/log on its own partition so log explosion cannot fill root. Logrotate for all applications. Docker prune on a schedule. Automated cleanup scripts. And the reserved block percentage as a last line of defense.' },
        ],
      },
    ],
  },

  'troubleshoot-ssh-failure': {
    slug: 'troubleshoot-ssh-failure',
    title: 'Unable to SSH into Server',
    subtitle: 'Engineers locked out of a production server',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `Users report that they are unable to SSH into a critical production server. The server was functioning correctly until recently, and you need to troubleshoot and restore SSH connectivity promptly.` },
      { type: 'text', heading: 'The Question', body: `**Users are reporting an inability to SSH into the server. Describe the steps you would take to troubleshoot and restore SSH connectivity.**` },
      { type: 'text', heading: 'How to Debug This', body: `**Step 1 — Is it a network issue or an SSH issue?** Try ping <server_ip>. If ping fails, the problem is network-level (firewall, routing, server down). If ping succeeds but SSH fails, the problem is SSH-specific.\n\n**Step 2 — Try SSH with verbose mode.** Run ssh -v user@server_ip. The verbose output shows exactly where the connection fails: DNS resolution, TCP connection, key exchange, authentication. This is the single most useful debugging step.\n\n**Step 3 — Check from the server side.** Access the server through an alternative method (cloud console, serial console, another bastion host). Then check:\n\nIs SSH running? systemctl status sshd. If not: systemctl start sshd.\n\nIs it listening on the right port? ss -tlnp | grep 22. If SSH was reconfigured to a different port, you are connecting to the wrong port.\n\nCheck SSH config: cat /etc/ssh/sshd_config. Look for: Port (is it 22?), PermitRootLogin (is root login disabled?), AllowUsers or AllowGroups (is your user allowed?), PasswordAuthentication (is it disabled when you do not have a key?).\n\n**Step 4 — Check firewall.** On the server: sudo ufw status or sudo iptables -L -n. Is port 22 allowed? In cloud: check the security group attached to the instance — is inbound TCP 22 allowed from your IP?\n\n**Step 5 — Check disk space.** df -h. If the disk is full, SSH may fail because it cannot write to /var/log or create temporary files. Free up space.\n\n**Step 6 — Check SSH keys.** Verify that your public key is in ~/.ssh/authorized_keys on the server. Check permissions: ~/.ssh should be 700, authorized_keys should be 600. Wrong permissions cause SSH to silently reject key authentication.\n\n**Step 7 — Check auth logs.** tail -50 /var/log/auth.log (Ubuntu) or /var/log/secure (CentOS). The exact rejection reason is logged here: "Authentication refused: bad ownership or modes," "User not allowed," "Connection closed by authenticating user."` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What if you are completely locked out with no alternative access?', a: 'In AWS: stop the instance, detach the root volume, attach it to another instance, fix the SSH config or authorized_keys, reattach, and start. In GCP: use the serial console or reset SSH keys via metadata. This is why you should always have an alternative access method configured (cloud console, bastion host, SSM Session Manager) before you need it.' },
          { q: 'How do you prevent SSH lockouts?', a: 'Always test SSH config changes before disconnecting (sshd -t to test config syntax). Keep a second SSH session open while making changes. Use AWS SSM Session Manager as a backup access method (no SSH needed). Set up SSH key rotation. Never change firewall rules that affect SSH without a rollback plan (cloud security groups can be reverted from the console).' },
        ],
      },
    ],
  },

  'troubleshoot-docker-restart-loop': {
    slug: 'troubleshoot-docker-restart-loop',
    title: 'Docker Container Restart Loop',
    subtitle: 'Container keeps restarting — isolate the root cause',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `A Docker container running a critical microservice keeps restarting. Docker shows the container status as "Restarting" with an increasing restart count. The same image runs fine on a developer's laptop. The production host has different resource constraints and environment variables.` },
      { type: 'text', heading: 'The Question', body: `**Your Docker container is in a restart loop. Walk through your debugging process from first command to resolution.**` },
      { type: 'text', heading: 'How to Debug This', body: `**Check the restart count and exit code first.** Run docker ps -a to see the container status and restart count. Then docker inspect <container> --format='{{.State.ExitCode}} {{.State.OOMKilled}}' to get the exit code and whether it was OOM killed.\n\nExit code meanings:\n- 0: normal exit (entrypoint script completed — maybe it should be a long-running process?)\n- 1: application error (unhandled exception, missing config)\n- 126: permission denied on entrypoint\n- 127: entrypoint command not found\n- 137: OOM killed (SIGKILL) or docker kill\n- 139: segmentation fault\n- 143: SIGTERM (graceful shutdown)\n\n**Check logs.** docker logs <container> --tail 100. If the container restarts too fast, logs may be lost. Use docker logs --since 5m to get recent logs. If using a logging driver that sends logs elsewhere, check that destination.\n\n**Check resource limits.** docker stats <container> shows live CPU and memory usage. If the container hits its memory limit, Docker kills it (exit 137). Compare the memory limit with what the application actually needs. Java apps are notorious for this — the JVM heap + metaspace + native memory can exceed the container limit.\n\n**Check environment variables.** docker inspect <container> --format='{{json .Config.Env}}' | python -m json.tool. Compare with the working environment. Missing DATABASE_URL, wrong API endpoint, or a typo in a feature flag can crash the app on startup.\n\n**Check volume mounts.** docker inspect <container> --format='{{json .Mounts}}'. Is a volume mount overwriting application files? An empty host directory mounted over /app/config removes all config files from the image.\n\n**Check the entrypoint.** docker inspect <container> --format='{{.Config.Entrypoint}} {{.Config.Cmd}}'. Is the entrypoint script correct? Does it have execute permissions? Alpine images do not have bash — use /bin/sh.\n\n**Run interactively to debug.** docker run -it --entrypoint sh <image>. This gives you a shell inside the container without running the application. Check if files exist, dependencies are installed, and the application can start manually.\n\n**Check Docker daemon logs.** journalctl -u docker -f on the host. Docker-level issues (storage driver problems, network issues) appear here, not in container logs.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'Why does the same image work on a developer laptop but not in production?', a: 'Different environment variables (missing or wrong values), different resource limits (laptop has 16GB RAM, production container limited to 512MB), different volume mounts (production mounts override image files), different network configuration (production may not have internet access for downloading dependencies at startup), or different Docker version/storage driver.' },
          { q: 'How do you prevent restart loops from consuming resources?', a: 'Use restart policies wisely. restart: unless-stopped is good for production but can cause rapid restart loops. Add --restart-delay or use restart: on-failure with max-retry to limit restarts. In Kubernetes, the exponential backoff (CrashLoopBackOff) handles this automatically. Monitor restart counts and alert when they exceed a threshold.' },
        ],
      },
    ],
  },

  'troubleshoot-k8s-pv-pending': {
    slug: 'troubleshoot-k8s-pv-pending',
    title: 'Kubernetes Pod Stuck in Pending — PersistentVolume Issue',
    subtitle: 'Pod cannot mount storage and will not start',
    duration: '15 min', difficulty: 'Intermediate',
    sections: [
      { type: 'text', heading: 'The Situation', body: `A new pod for your database service is stuck in Pending state. kubectl describe pod shows "pod has unbound immediate PersistentVolumeClaims." The PVC status shows Pending. Other pods in the cluster are running fine. This is blocking a critical database deployment.` },
      { type: 'text', heading: 'The Question', body: `**Your pod is stuck in Pending because it cannot mount a PersistentVolume. Walk through the debugging process.**` },
      { type: 'text', heading: 'How to Debug This', body: `**Step 1 — Check the PVC status:**\nkubectl get pvc -n <namespace>\nIf the PVC is Pending, it has not been bound to a PV. This is the root cause — the pod cannot start without its storage.\n\n**Step 2 — Check PVC events:**\nkubectl describe pvc <pvc-name> -n <namespace>\nLook at the Events section. Common messages:\n- "no persistent volumes available for this claim" — no PV matches the PVC requirements\n- "waiting for first consumer to be created" — WaitForFirstConsumer StorageClass (normal, will bind when pod is scheduled)\n- "provisioning failed" — dynamic provisioning failed (check cloud provider)\n\n**Step 3 — Check StorageClass:**\nkubectl get storageclass\nDoes the StorageClass referenced by the PVC exist? If the PVC requests storageClassName: gp3 but only gp2 exists, it will never bind. Check if the StorageClass has a provisioner configured.\n\n**Step 4 — Check capacity and access modes:**\nThe PVC requests a specific size and access mode. If you are using static provisioning, the PV must match: same or larger size, compatible access mode (ReadWriteOnce, ReadOnlyMany, ReadWriteMany), and same StorageClass.\n\n**Step 5 — Check availability zone:**\nEBS volumes (AWS) are AZ-specific. If the PV is in us-east-1a but the pod is scheduled on a node in us-east-1b, it cannot mount. Fix: use volumeBindingMode: WaitForFirstConsumer in the StorageClass so the PV is created in the same AZ as the pod.\n\n**Step 6 — Check cloud provider quotas:**\nCloud providers have limits on the number of volumes per account or per node. AWS limits EBS volumes per EC2 instance (typically 28). If the node has too many volumes attached, new ones fail. Check: kubectl describe node <node> and look at "Allocatable" vs "Allocated" for attachable volumes.\n\n**Step 7 — Check provisioner logs:**\nIf using a CSI driver (EBS CSI, EFS CSI), check its logs: kubectl logs -n kube-system -l app=ebs-csi-controller. Provisioning errors (IAM permissions, quota exceeded, invalid parameters) appear here.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'What is the difference between static and dynamic provisioning?', a: 'Static: an admin pre-creates PVs manually. PVCs bind to existing PVs that match their requirements. Dynamic: a StorageClass with a provisioner automatically creates PVs when PVCs are created. Dynamic is the standard approach in cloud environments — you do not want to manually create EBS volumes for every database pod.' },
          { q: 'What happens to the PV when the pod or PVC is deleted?', a: 'Depends on the reclaimPolicy of the StorageClass. Retain: PV and data are kept (manual cleanup needed). Delete: PV and underlying storage (EBS volume) are deleted. Retain is safer for databases — you do not want to accidentally delete production data. Delete is fine for temporary or reproducible data.' },
        ],
      },
    ],
  },

  'troubleshoot-k8s-node-cpu': {
    slug: 'troubleshoot-k8s-node-cpu',
    title: 'Kubernetes Node at 100% CPU — Pods Look Normal',
    subtitle: 'Node is overloaded but pod metrics do not explain it',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      { type: 'text', heading: 'The Situation', body: `A Kubernetes node is showing 100% CPU utilisation in your monitoring dashboard. However, when you check pod-level metrics with kubectl top pods, the total CPU usage of all pods on that node is only 40%. Something outside of pods is consuming the remaining 60% of CPU. Pods on this node are experiencing increased latency.` },
      { type: 'text', heading: 'The Question', body: `**The node is at 100% CPU but pods only account for 40%. How do you find and fix the root cause?**` },
      { type: 'text', heading: 'How to Debug This', body: `**Step 1 — Confirm the discrepancy:**\nkubectl top node <node-name>\nkubectl top pods --all-namespaces --field-selector spec.nodeName=<node-name>\nIf node CPU is 100% but pod CPU totals 40%, something outside pods is consuming CPU.\n\n**Step 2 — SSH into the node and check processes:**\ntop -o %CPU (or htop for a better view)\nSort by CPU usage. Look for processes that are NOT container processes. Common culprits:\n\n- **kubelet** — If kubelet is consuming high CPU, it may be stuck in a loop (excessive pod churn, failing health checks, volume mount issues). Check: journalctl -u kubelet -f\n- **containerd / dockerd** — Container runtime issues. Stuck containers, image pulls, or garbage collection. Check: journalctl -u containerd -f\n- **kube-proxy** — Regenerating iptables rules on a cluster with thousands of services can spike CPU. Check: journalctl -u kube-proxy\n- **CNI plugin (calico-node, flannel, cilium)** — Network plugin processing. Check DaemonSet logs: kubectl logs -n kube-system <cni-pod>\n- **Logging agents (Fluentd, Vector, Filebeat)** — Log collectors running as DaemonSets can consume significant CPU if log volume is high or if they are stuck processing.\n- **Node-level monitoring agents** — Prometheus node-exporter, Datadog agent, or cloud provider agents.\n\n**Step 3 — Check for rogue processes:**\nLook for processes that should not be there. A compromised node might run cryptocurrency miners or other malicious software. Check: ps aux | grep -v containerd | grep -v kubelet to filter out known processes.\n\n**Step 4 — Check system-level issues:**\n- High iowait (wa% in top): disk I/O is saturated. Check with iostat -x 1. Could be a pod doing heavy disk writes, or the node's disk is failing.\n- High system time (sy% in top): kernel-level activity. Excessive context switching, network interrupts, or iptables processing.\n- Zombie processes: ps aux | grep Z. Zombie processes do not consume CPU but indicate a parent process issue.\n\n**Step 5 — Check DaemonSet resource usage:**\nkubectl top pods -n kube-system --field-selector spec.nodeName=<node-name>\nDaemonSet pods (logging, monitoring, CNI) run on every node. If one is misbehaving, it affects that specific node.\n\n**Step 6 — Resolution:**\nIf kubelet/containerd: restart the service (systemctl restart kubelet). If a DaemonSet: check its configuration, reduce log verbosity, or increase its resource limits. If a rogue process: kill it, investigate how it got there, and patch the vulnerability. If iowait: identify the I/O-heavy workload and move it or add faster storage.` },
      {
        type: 'faq', heading: 'Follow-Up Questions',
        questions: [
          { q: 'Why does kubectl top pods not show system processes?', a: 'kubectl top pods only shows CPU usage of containers managed by Kubernetes. System processes (kubelet, containerd, kube-proxy, OS daemons) run directly on the node, outside of any pod. To see total node usage including system processes, use kubectl top node or SSH into the node and use top/htop. The gap between node CPU and pod CPU total is the system overhead.' },
          { q: 'How do you prevent this from happening?', a: 'Reserve CPU for system processes using kubelet --system-reserved and --kube-reserved flags. This tells the scheduler that not all node CPU is available for pods. Monitor node-level metrics (not just pod metrics) with Prometheus node-exporter. Alert when system CPU (non-pod) exceeds 30%. Regularly audit DaemonSets for resource usage — they run on every node and can have outsized impact.' },
        ],
      },
    ],
  },
};
