import React from 'react';

const P = ({ children, theme }) => <p className={`${theme.text.secondary} leading-relaxed mb-3 text-[15px]`}>{children}</p>;
const H2 = ({ children, theme }) => <h2 className={`text-2xl font-bold ${theme.text.primary} mb-4 mt-10`}>{children}</h2>;
const H3 = ({ children, theme }) => <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2 mt-6`}>{children}</h3>;
const Callout = ({ children, theme }) => (
  <div className={`border-l-4 border-orange-400 pl-4 py-2 my-5 ${theme.bg.card} rounded-r-lg`}>
    <p className={`text-sm ${theme.text.secondary} italic`}>{children}</p>
  </div>
);
const QA = ({ q, a, theme }) => (
  <div className={`mb-6 p-5 rounded-xl ${theme.bg.card} border ${theme.border.primary}`}>
    <p className={`text-sm font-bold ${theme.text.primary} mb-2`}>Q: {q}</p>
    <p className={`text-sm ${theme.text.secondary} leading-relaxed`}>{a}</p>
  </div>
);

const ArticleDevOps = ({ theme }) => (
  <div>
    <H2 theme={theme}>What DevOps Interviews Actually Test</H2>
    <P theme={theme}>
      DevOps interviews at top tech companies test three things: depth of knowledge in core tools (Docker, Kubernetes, CI/CD), ability to troubleshoot real production scenarios, and understanding of the "why" behind architectural decisions.
    </P>
    <Callout theme={theme}>
      The biggest mistake candidates make is memorizing commands without understanding concepts. Interviewers will always follow up with "why" and "what happens if this fails."
    </Callout>

    <H2 theme={theme}>Docker Interview Questions</H2>
    <QA theme={theme}
      q="What is the difference between a Docker image and a container?"
      a="An image is a read-only template — a snapshot of a filesystem and configuration. A container is a running instance of an image. Multiple containers can run from the same image. Images are built in layers; each Dockerfile instruction creates a new layer, which enables caching and efficient storage."
    />
    <QA theme={theme}
      q="What is a multi-stage Docker build and why use it?"
      a="Multi-stage builds use multiple FROM instructions in a single Dockerfile. The first stage compiles/builds the application (with all build tools), and the final stage copies only the compiled artifact into a minimal base image. This dramatically reduces image size — a Go binary that needs a 1GB build environment can ship in a 10MB Alpine image."
    />
    <QA theme={theme}
      q="How does Docker networking work?"
      a="Docker has four network modes: bridge (default, containers on same host can communicate), host (container shares host network stack), none (no networking), and overlay (multi-host networking for Swarm/Kubernetes). Containers communicate by name on user-defined bridge networks. Port mapping (-p 8080:80) exposes container ports to the host."
    />
    <QA theme={theme}
      q="What is the difference between CMD and ENTRYPOINT?"
      a="ENTRYPOINT defines the executable that always runs. CMD provides default arguments that can be overridden. When both are used, CMD arguments are passed to ENTRYPOINT. Example: ENTRYPOINT ['nginx'] CMD ['-g', 'daemon off;'] — you can override the nginx flags but not the nginx binary itself."
    />

    <H2 theme={theme}>Kubernetes Interview Questions</H2>
    <QA theme={theme}
      q="Explain the Kubernetes architecture."
      a="Control plane: API server (single source of truth), etcd (distributed key-value store for cluster state), scheduler (assigns pods to nodes), controller manager (runs controllers for deployments, services, etc.). Worker nodes: kubelet (ensures containers are running), kube-proxy (handles networking rules), container runtime (Docker, containerd)."
    />
    <QA theme={theme}
      q="What is the difference between a Deployment and a StatefulSet?"
      a="Deployments are for stateless applications — pods are interchangeable, can be scaled up/down freely, and have random names. StatefulSets are for stateful applications (databases, Kafka) — pods have stable network identities (pod-0, pod-1), stable persistent storage, and ordered deployment/scaling. Use StatefulSets when pod identity matters."
    />
    <QA theme={theme}
      q="A pod is in CrashLoopBackOff. How do you debug it?"
      a="Step 1: kubectl describe pod <name> — check Events section for error messages. Step 2: kubectl logs <pod> --previous — check logs from the crashed container. Step 3: Check resource limits (OOMKilled means out of memory). Step 4: Check liveness probe configuration — misconfigured probes cause restart loops. Step 5: kubectl exec into a running container to inspect the filesystem."
    />
    <QA theme={theme}
      q="What is a Kubernetes Service and what are the types?"
      a="A Service provides a stable network endpoint for a set of pods (pods are ephemeral, their IPs change). Types: ClusterIP (internal only, default), NodePort (exposes on each node's IP at a static port), LoadBalancer (provisions a cloud load balancer), ExternalName (maps to a DNS name). Ingress is not a Service type but an L7 HTTP router."
    />
    <QA theme={theme}
      q="How does Kubernetes handle rolling updates?"
      a="Deployments use a rolling update strategy by default. maxSurge controls how many extra pods can exist during the update. maxUnavailable controls how many pods can be unavailable. Kubernetes creates new pods with the new image, waits for them to be ready, then terminates old pods. If the new pods fail readiness checks, the rollout pauses automatically."
    />

    <H2 theme={theme}>CI/CD Interview Questions</H2>
    <QA theme={theme}
      q="What is the difference between continuous integration, delivery, and deployment?"
      a="CI: automatically build and test every code change. CD (Delivery): automatically prepare a release for deployment — the deployment itself is manual. CD (Deployment): automatically deploy every change that passes tests to production. Most companies practice CI + Continuous Delivery, with manual approval gates before production."
    />
    <QA theme={theme}
      q="How do you handle secrets in a CI/CD pipeline?"
      a="Never store secrets in code or CI configuration files. Use: environment variables injected by the CI system (GitHub Actions secrets, Jenkins credentials), a secrets manager (HashiCorp Vault, AWS Secrets Manager), or Kubernetes secrets (base64 encoded, ideally with external-secrets-operator for rotation). Rotate secrets regularly and audit access."
    />
    <QA theme={theme}
      q="What is a blue-green deployment?"
      a="Blue-green maintains two identical production environments. Blue is live. You deploy to green, run tests, then switch the load balancer to point to green. Blue becomes the standby. Rollback is instant — just switch back to blue. Downside: requires double the infrastructure. Alternative: canary deployment (gradually shift traffic to new version)."
    />

    <H2 theme={theme}>AWS / Cloud Interview Questions</H2>
    <QA theme={theme}
      q="What is the difference between horizontal and vertical scaling?"
      a="Vertical scaling (scale up): add more CPU/RAM to existing servers. Simple but has limits and causes downtime. Horizontal scaling (scale out): add more servers. Requires stateless application design and a load balancer. Cloud-native applications are designed for horizontal scaling — it's cheaper and more resilient."
    />
    <QA theme={theme}
      q="Explain the difference between SQS and SNS."
      a="SQS is a message queue — one consumer processes each message, messages persist until consumed, supports retry logic. SNS is a pub/sub system — one message is delivered to all subscribers simultaneously. Common pattern: SNS fan-out to multiple SQS queues, so multiple services can process the same event independently."
    />

    <H3 theme={theme}>Scenario Questions (Most Important)</H3>
    <P theme={theme}>
      Interviewers love scenario questions because they reveal how you think under pressure. Common scenarios:
    </P>
    <ul className="space-y-3 mb-6 ml-4">
      {[
        '"Production is down. CPU is at 100%. Walk me through your investigation." — Start with monitoring (Datadog/CloudWatch), check recent deployments, identify the process, check for memory leaks or infinite loops.',
        '"A deployment caused a 500% increase in error rate. What do you do?" — Rollback immediately, then investigate. Never debug in production under pressure.',
        '"Your Kubernetes cluster is running out of nodes. How do you handle it?" — Cluster autoscaler, check for resource requests vs limits, identify resource-hungry pods.',
        '"A microservice is timing out intermittently. How do you debug?" — Check service dependencies, look for slow database queries, check for connection pool exhaustion, review timeout configurations.',
      ].map((item, i) => (
        <li key={i} className={`text-[15px] ${theme.text.secondary} flex items-start gap-2`}>
          <span className="text-orange-400 mt-1 shrink-0">→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ArticleDevOps;
