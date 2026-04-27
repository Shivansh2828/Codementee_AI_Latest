/**
 * AWS Interview Prep Course
 * Amazon Web Services — from basics to MAANG-level architecture
 */

export const AWS_META = {
  title: 'AWS',
  subtitle: 'Amazon Web Services — from basics to MAANG-level architecture',
  description: 'A complete AWS course for DevOps, SRE, and Cloud Engineering interviews. Covers IAM, EC2, S3, VPC, RDS, DynamoDB, Lambda, ECS/EKS, CloudWatch, and real-world system design on AWS.',
  totalTopics: 36,
};

export const AWS_SECTIONS = [
  { id: 'aws-fundamentals', title: 'Fundamentals', color: 'orange', topics: ['aws-intro', 'aws-roadmap', 'aws-iam', 'aws-regions-az'] },
  { id: 'aws-compute', title: 'Compute', color: 'blue', topics: ['aws-ec2', 'aws-lambda', 'aws-ecs-eks', 'aws-fargate', 'aws-autoscaling'] },
  { id: 'aws-storage', title: 'Storage', color: 'green', topics: ['aws-s3', 'aws-ebs-efs'] },
  { id: 'aws-databases', title: 'Databases', color: 'purple', topics: ['aws-rds', 'aws-dynamodb', 'aws-elasticache', 'aws-redshift'] },
  { id: 'aws-networking', title: 'Networking & CDN', color: 'cyan', topics: ['aws-vpc', 'aws-load-balancers', 'aws-cloudfront', 'aws-route53'] },
  { id: 'aws-devops', title: 'DevOps & Monitoring', color: 'red', topics: ['aws-cloudwatch', 'aws-codepipeline', 'aws-cloudformation', 'aws-ecr'] },
  { id: 'aws-serverless', title: 'Serverless & Messaging', color: 'pink', topics: ['aws-api-gateway', 'aws-sqs-sns', 'aws-dlq', 'aws-eventbridge', 'aws-serverless-patterns'] },
  { id: 'aws-system-design', title: 'System Design on AWS', color: 'orange', topics: ['aws-design-url-shortener', 'aws-design-image-upload', 'aws-design-ecommerce', 'aws-design-video-streaming', 'aws-design-notification', 'aws-design-log-processing'] },
  { id: 'aws-scenarios', title: 'Production Scenarios', color: 'red', topics: ['aws-scenario-high-traffic', 'aws-scenario-disaster-recovery', 'aws-scenario-cost-optimization', 'aws-scenario-lambda-timeout', 'aws-scenario-ec2-500-errors', 'aws-scenario-multi-region', 'aws-scenario-serverless-migration'] },
];

export const AWS_TOPICS = {

  // ── FUNDAMENTALS ──────────────────────────────────────────────────────────
  'aws-intro': {
    slug: 'aws-intro', title: 'What is AWS?', subtitle: 'Cloud computing, the pay-as-you-go model, and the Well-Architected Framework',
    duration: '25 min', difficulty: 'Beginner',
    sections: [
      {
        type: 'text', heading: 'AWS — The Cloud Platform That Runs the Internet',
        body: `Amazon Web Services (AWS) is the world's most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally. Launched in 2006 with just three services (S3, EC2, and SQS), AWS now powers millions of customers — from startups to Fortune 500 companies, government agencies, and universities. Netflix, Airbnb, NASA, the CIA, and most of the apps on your phone run on AWS infrastructure.\n\nAt its core, AWS is a collection of on-demand computing resources — servers, storage, databases, networking, machine learning, analytics — that you can provision in minutes and pay for only what you use. Before cloud computing, companies had to buy physical servers, rack them in data centers, hire staff to maintain them, and over-provision capacity to handle peak traffic. AWS eliminated all of that. You can launch a server in 30 seconds, scale to millions of users, and shut it down when you are done.\n\nFor DevOps engineers, SREs, and cloud architects, AWS is not optional — it is the environment where your code runs. Understanding AWS deeply means understanding how to build systems that are reliable, scalable, secure, and cost-efficient. This course covers every service you need for MAANG-level interviews and real production work.`
      },
      {
        type: 'text', heading: 'The Pay-As-You-Go Model',
        body: `AWS operates on a pay-as-you-go pricing model — you pay only for the resources you consume, with no upfront costs and no long-term contracts (unless you choose reserved pricing for discounts). This fundamentally changes how companies think about infrastructure.\n\nTraditional on-premises infrastructure required capital expenditure (CapEx): buy servers, buy networking equipment, lease data center space, hire operations staff. You had to predict your capacity needs 3-5 years in advance. If you over-provisioned, you wasted money on idle hardware. If you under-provisioned, your application crashed under load.\n\nAWS converts infrastructure to operational expenditure (OpEx): pay per hour for EC2 instances, per GB for S3 storage, per request for Lambda functions. You can scale up in minutes when traffic spikes and scale down immediately when it drops. A startup can launch with $50/month and scale to millions of users without changing their architecture.\n\nKey pricing models you need to know: On-Demand (pay per hour/second, no commitment), Reserved Instances (1 or 3 year commitment, up to 72% discount), Spot Instances (bid on unused capacity, up to 90% discount but can be interrupted), and Savings Plans (flexible commitment to a spend level, up to 66% discount). Choosing the right pricing model is a real cost optimization skill that interviewers ask about.`
      },
      {
        type: 'text', heading: 'The Shared Responsibility Model',
        body: `One of the most important concepts in AWS security is the Shared Responsibility Model. AWS and the customer share responsibility for security, but the division depends on the service type.\n\n**AWS is responsible for "Security OF the Cloud":** The physical infrastructure — data centers, hardware, networking equipment, hypervisors, and the managed services layer. AWS ensures the physical servers are secure, the network is protected, and the underlying infrastructure is patched and maintained. You never need to worry about someone physically stealing your server.\n\n**You are responsible for "Security IN the Cloud":** Everything you put on top of AWS infrastructure. This includes: your operating system patches (for EC2), your application code, your data encryption, your IAM policies and access controls, your network configuration (security groups, NACLs), and your compliance requirements.\n\nThe boundary shifts based on the service. For EC2 (IaaS), you manage the OS, runtime, and application. For RDS (PaaS), AWS manages the OS and database engine — you manage the data and access. For Lambda (FaaS/Serverless), AWS manages everything except your code and IAM permissions.\n\nIn interviews, when asked about AWS security, always start with the Shared Responsibility Model. It shows you understand the fundamental security architecture and know where your responsibilities begin.`
      },
      {
        type: 'diagram', variant: 'comparison', heading: 'AWS vs GCP vs Azure',
        items: [
          { title: 'AWS', color: 'orange', points: ['🏆 Market leader (~33% share)', '200+ services, most mature', 'Best for: general workloads, startups, enterprises', 'Strongest ecosystem and community', 'EC2, S3, Lambda, RDS, DynamoDB', 'Best documentation and third-party support'] },
          { title: 'Google Cloud (GCP)', color: 'blue', points: ['🔬 Best for: data, ML, Kubernetes', 'Invented Kubernetes (donated to CNCF)', 'BigQuery for analytics is unmatched', 'Compute Engine, Cloud Storage, GKE', 'Strong in AI/ML (Vertex AI, TPUs)', 'Smaller ecosystem than AWS'] },
          { title: 'Azure', color: 'cyan', points: ['🏢 Best for: enterprise, Microsoft shops', 'Deep Active Directory integration', 'Best for hybrid cloud (on-prem + cloud)', 'Azure DevOps, AKS, Cosmos DB', 'Strong compliance certifications', 'Preferred by banks and governments'] },
        ]
      },
      {
        type: 'text', heading: 'The AWS Well-Architected Framework',
        body: `The AWS Well-Architected Framework is a set of best practices for building cloud systems. It is organized into five pillars, and interviewers frequently ask about it. Every architectural decision you make should be evaluated against these pillars.\n\n**1. Operational Excellence:** The ability to run and monitor systems to deliver business value and continually improve processes. Key practices: infrastructure as code (CloudFormation, CDK), automated deployments, runbooks for operations, post-incident reviews, and observability (metrics, logs, traces).\n\n**2. Security:** Protecting information, systems, and assets. Key practices: implement a strong identity foundation (IAM least privilege), enable traceability (CloudTrail, CloudWatch), apply security at all layers (VPC, security groups, WAF), automate security best practices, protect data in transit and at rest (KMS, TLS), and prepare for security events.\n\n**3. Reliability:** The ability to recover from failures and meet demand. Key practices: test recovery procedures, automatically recover from failure (Auto Scaling, multi-AZ), scale horizontally, stop guessing capacity, and manage change through automation.\n\n**4. Performance Efficiency:** Using computing resources efficiently. Key practices: democratize advanced technologies (use managed services), go global in minutes (CloudFront, multi-region), use serverless architectures, experiment more often, and consider mechanical sympathy (use the right tool for the job).\n\n**5. Cost Optimization:** Avoiding unnecessary costs. Key practices: implement cloud financial management, adopt a consumption model (pay for what you use), measure overall efficiency, stop spending money on undifferentiated heavy lifting (use managed services), and analyze and attribute expenditure (cost allocation tags).`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the AWS Shared Responsibility Model?', a: 'AWS is responsible for security OF the cloud — the physical infrastructure, hardware, networking, and managed service layers. The customer is responsible for security IN the cloud — OS patches, application code, data encryption, IAM policies, network configuration, and compliance. The boundary shifts based on service type: EC2 (you manage OS), RDS (AWS manages OS/DB engine), Lambda (AWS manages everything except your code).' },
          { q: 'What are the five pillars of the AWS Well-Architected Framework?', a: 'Operational Excellence (run and monitor systems, automate operations), Security (protect data and systems, least privilege IAM), Reliability (recover from failures, scale to meet demand), Performance Efficiency (use resources efficiently, right tool for the job), and Cost Optimization (avoid unnecessary costs, pay for what you use). Every architectural decision should be evaluated against these pillars.' },
          { q: 'What is the difference between On-Demand, Reserved, and Spot instances?', a: 'On-Demand: pay per hour/second, no commitment, highest price — use for unpredictable workloads. Reserved: 1 or 3 year commitment, up to 72% discount — use for steady-state workloads. Spot: bid on unused capacity, up to 90% discount but can be interrupted with 2-minute warning — use for fault-tolerant batch jobs, data processing, CI/CD. Savings Plans offer flexible discounts (up to 66%) based on a spend commitment rather than specific instance types.' },
          { q: 'How does AWS achieve high availability?', a: 'AWS achieves HA through multiple Availability Zones (physically separate data centers within a region), redundant power and networking, managed services with built-in replication (RDS Multi-AZ, S3 11 nines durability), Auto Scaling to replace failed instances, Elastic Load Balancing to distribute traffic, Route 53 health checks for DNS failover, and global infrastructure with 30+ regions. You design for HA by deploying across multiple AZs, using managed services, and implementing health checks.' },
          { q: 'What is the difference between IaaS, PaaS, and SaaS on AWS?', a: 'IaaS (Infrastructure as a Service): You manage OS, runtime, application — AWS provides hardware. Example: EC2. PaaS (Platform as a Service): AWS manages OS and runtime — you manage application and data. Examples: Elastic Beanstalk, RDS, ECS. SaaS (Software as a Service): AWS manages everything — you just use the service. Examples: WorkMail, Chime, QuickSight. Serverless (FaaS) is a subset of PaaS where AWS manages everything except your function code — Lambda, Fargate.' },
        ]
      },
    ],
  },

  'aws-roadmap': {
    slug: 'aws-roadmap', title: 'AWS Learning Roadmap', subtitle: '30-day MAANG-focused plan for DevOps/SRE and Cloud Engineering interviews',
    duration: '10 min', difficulty: 'Beginner',
    sections: [
      {
        type: 'text', heading: 'How to Use This Roadmap',
        body: `This 30-day roadmap is designed for DevOps engineers, SREs, and backend engineers preparing for cloud engineering interviews at MAANG-level companies. It is not a certification cram — it is designed to help you design, debug, and explain systems confidently.\n\nThe plan assumes 3-5 hours per day and follows a deliberate progression: foundations first, then networking and high availability, then DevOps and serverless, and finally system design and interview practice. Each week builds on the previous one.\n\nThe golden rule: 30% learning, 70% hands-on practice. Reading about EC2 is not the same as launching an EC2 instance, deploying an app, and debugging why it is not reachable. Use the AWS Free Tier — it gives you 750 hours of EC2 t2.micro per month, 5GB of S3, 1 million Lambda requests, and much more. Everything in this roadmap can be practiced for free or near-free.\n\nDo not memorize services. Understand when and why to use them. Interviewers do not want a list of AWS services — they want to see how you think about tradeoffs, failure modes, and scalability.`
      },
      {
        type: 'diagram', variant: 'flow', heading: '30-Day AWS Roadmap Overview', caption: 'Four weeks, each building on the previous — do not skip foundations',
        steps: [
          { label: 'Week 1', desc: 'Core Foundations: IAM, EC2, S3, RDS, DynamoDB', color: 'orange' },
          { label: 'Week 2', desc: 'Networking + HA: VPC, Load Balancers, Auto Scaling, CloudFront, Route 53', color: 'blue' },
          { label: 'Week 3', desc: 'DevOps + Serverless: CI/CD, ECS/EKS, Lambda, SQS/SNS, CloudWatch', color: 'green' },
          { label: 'Week 4', desc: 'System Design + Interview Prep: Real projects, design questions, scenarios', color: 'red' },
        ]
      },
      {
        type: 'text', heading: 'Week 1: Core Foundations (Days 1–7)',
        body: `**Day 1–2: Cloud Basics + IAM (Security is Critical)**\nLearn: Regions, Availability Zones, Shared Responsibility Model, Well-Architected Framework\nDeep dive: IAM Users, Roles, Policies, Groups. Least privilege principle. MFA.\nPractice: Create IAM roles with least privilege, attach policies, create a service role for EC2 to access S3\nInterview angle: "How do you secure AWS resources?" "What is the difference between an IAM user and a role?"\n\n**Day 3–4: Compute (Very Important)**\nLearn: EC2 instance types (t3, c5, m5, r5), pricing models (On-Demand, Reserved, Spot), AMIs, security groups, key pairs\nPractice: Launch EC2, deploy a simple web app, configure security groups, set up user data scripts\nInterview angle: "How do you handle traffic spikes?" "When would you use Spot instances?"\n\n**Day 5: Storage**\nLearn: S3 storage classes, versioning, lifecycle policies, bucket policies, pre-signed URLs\nPractice: Upload files, configure public/private access, set up lifecycle rules, generate pre-signed URLs\nInterview angle: "How is S3 highly durable?" "What is the difference between S3 storage classes?"\n\n**Day 6–7: Databases**\nLearn: RDS (Multi-AZ, read replicas, Aurora), DynamoDB (partition keys, GSI, capacity modes)\nPractice: Create RDS instance, connect from EC2, create DynamoDB table with GSI\nInterview angle: "When would you use DynamoDB vs RDS?" "What is Multi-AZ in RDS?"`
      },
      {
        type: 'text', heading: 'Week 2: Networking + High Availability (Days 8–14)',
        body: `**Day 8–9: Networking (Critical)**\nLearn: VPC, subnets (public/private), route tables, Internet Gateway, NAT Gateway, security groups vs NACLs\nPractice: Create a VPC from scratch with public and private subnets, configure routing, launch EC2 in each subnet\nInterview angle: "Design a secure network architecture" "What is the difference between a security group and a NACL?"\n\n**Day 10: Load Balancing**\nLearn: ALB vs NLB vs CLB, target groups, health checks, sticky sessions, SSL termination\nPractice: Add ALB in front of EC2 instances, configure health checks, test failover\nInterview angle: "When would you use NLB over ALB?"\n\n**Day 11: Auto Scaling**\nLearn: Launch templates, scaling policies (target tracking, step, scheduled), cooldown periods, lifecycle hooks\nPractice: Set up Auto Scaling Group with target tracking policy, simulate load, watch scaling\nInterview angle: "How do you handle sudden traffic spikes?"\n\n**Day 12: CDN + DNS**\nLearn: CloudFront (edge locations, cache behaviors, origins), Route 53 (record types, routing policies)\nPractice: Serve static site via CloudFront, configure Route 53 with health checks and failover routing\n\n**Day 13–14: High Availability Design**\nLearn: Multi-AZ vs Multi-Region, RTO vs RPO, active-active vs active-passive failover\nPractice: Design a fault-tolerant architecture on paper, then implement a multi-AZ RDS setup\nInterview focus: "Design a fault-tolerant system on AWS"`
      },
      {
        type: 'text', heading: 'Week 3: DevOps + Serverless (Days 15–21)',
        body: `**Day 15–16: CI/CD**\nLearn: CodeCommit, CodeBuild, CodeDeploy, CodePipeline. Blue/green and canary deployments.\nPractice: Build a pipeline that deploys to EC2 or ECS on every git push\n\n**Day 17–18: Containers**\nLearn: ECS vs EKS vs Fargate, task definitions, services, clusters, ECR\nPractice: Containerize an app, push to ECR, deploy on ECS with Fargate\n\n**Day 19: Serverless**\nLearn: Lambda execution model, cold starts, triggers, API Gateway integration, concurrency\nPractice: Build a REST API with API Gateway + Lambda + DynamoDB\n\n**Day 20–21: Messaging + Monitoring**\nLearn: SQS (standard vs FIFO, DLQ, visibility timeout), SNS (topics, fan-out), EventBridge, CloudWatch\nPractice: Build async workflow with SQS + Lambda, set up CloudWatch alarms and dashboards\n\n**Week 4: System Design + Interview Prep (Days 22–30)**\nDay 22–23: CloudFormation/CDK — infrastructure as code\nDay 24–27: Build a production-ready project: User → CloudFront → ALB → ECS → RDS/DynamoDB, with Auto Scaling, CI/CD, and CloudWatch monitoring\nDay 28–29: System design practice — URL shortener, Netflix clone, notification system\nDay 30: Mock interview — scenario-based questions, explain tradeoffs, think at scale`
      },
      {
        type: 'diagram', variant: 'comparison', heading: 'What Makes This MAANG-Level',
        items: [
          { title: 'Average Candidate', color: 'red', points: ['❌ Lists AWS services by name', '❌ Reads documentation only', '❌ Cannot explain tradeoffs', '❌ No hands-on experience', '❌ Memorizes without understanding'] },
          { title: 'Top Candidate (You)', color: 'green', points: ['✅ Explains WHEN and WHY to use each service', '✅ Hands-on with real projects', '✅ Discusses failure modes and recovery', '✅ Thinks about cost, scale, and security', '✅ Structured approach to system design'] },
        ]
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'How long does it take to become AWS interview-ready?', a: '30 days with 3-5 hours/day of focused study and hands-on practice. The key is practice over theory — launch real services, break things, fix them. Use the AWS Free Tier. Build at least one end-to-end project (web app with EC2/ECS, RDS, S3, CloudFront, and monitoring). That project alone will give you more interview material than weeks of reading.' },
          { q: 'Should I get AWS certified before interviewing?', a: 'Certification helps but is not required. The AWS Solutions Architect Associate (SAA-C03) is the most valuable for cloud engineering roles. However, interviewers care more about your ability to design systems and explain tradeoffs than your certification status. A candidate who can design a fault-tolerant multi-AZ architecture and explain why they chose each service will outperform a certified candidate who cannot.' },
          { q: 'What AWS services are most important for DevOps/SRE interviews?', a: 'Core: EC2, S3, IAM, VPC, RDS, DynamoDB. High priority: Lambda, ECS/EKS, CloudWatch, ALB, Auto Scaling, Route 53, CloudFront. DevOps: CodePipeline, CloudFormation, ECR. Messaging: SQS, SNS, EventBridge. Know these deeply — what they do, when to use them, how they fail, and how to monitor them.' },
        ]
      },
    ],
  },


  'aws-iam': {
    slug: 'aws-iam', title: 'IAM — Identity and Access Management', subtitle: 'Users, roles, policies, and the principle of least privilege',
    duration: '30 min', difficulty: 'Beginner',
    sections: [
      {
        type: 'text', heading: 'What is IAM and Why It Matters',
        body: `AWS Identity and Access Management (IAM) is the service that controls who can do what in your AWS account. Every API call to AWS — whether from the console, CLI, SDK, or another AWS service — is authenticated and authorized through IAM. If IAM is misconfigured, your entire infrastructure is at risk. If it is too restrictive, your applications break. Getting IAM right is one of the most important skills in cloud engineering.\n\nIAM is global — it is not region-specific. An IAM user or role you create is available across all AWS regions. IAM is also free — there is no charge for creating users, roles, or policies.\n\nThe core principle of IAM is least privilege: every user, application, and service should have only the minimum permissions required to do its job, and nothing more. This limits the blast radius if credentials are compromised. A Lambda function that only needs to read from one S3 bucket should have a policy that allows only s3:GetObject on that specific bucket — not s3:* on all buckets.`
      },
      {
        type: 'text', heading: 'IAM Identities: Users, Groups, and Roles',
        body: `**IAM Users** are long-term credentials for humans or applications. Each user has a username, password (for console access), and optionally access keys (for CLI/SDK access). Users are for people who need persistent access to your AWS account. Best practice: do not use the root account for daily work — create IAM users with appropriate permissions.\n\n**IAM Groups** are collections of users. Instead of attaching policies to individual users, attach them to groups. A "Developers" group might have permissions to EC2, S3, and RDS. A "ReadOnly" group might have only read permissions. When a new developer joins, add them to the group — they instantly get the right permissions. When they leave, remove them from the group.\n\n**IAM Roles** are temporary credentials for AWS services, applications, or cross-account access. Unlike users, roles do not have long-term credentials — they issue temporary security tokens (via AWS STS) that expire. This is the preferred way to grant permissions to:\n- EC2 instances (instance profiles) — so your app can access S3 without hardcoding credentials\n- Lambda functions — so your function can write to DynamoDB\n- ECS tasks — so your container can access secrets in Secrets Manager\n- Cross-account access — so Account A can access resources in Account B\n- Federated users — so employees can log in with their corporate SSO\n\nNever hardcode AWS credentials in your application code. Always use IAM roles. If credentials are hardcoded and your code is pushed to GitHub, you will have a security incident within minutes — bots scan GitHub for AWS credentials continuously.`
      },
      {
        type: 'text', heading: 'IAM Policies — The Permission Language',
        body: `IAM policies are JSON documents that define what actions are allowed or denied on which resources. Every policy has the same structure: Effect (Allow or Deny), Action (what API calls), Resource (which AWS resources), and optionally Condition (when the policy applies).\n\nHere is a policy that allows reading from a specific S3 bucket:\n\n\`\`\`json\n{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": [\n        "s3:GetObject",\n        "s3:ListBucket"\n      ],\n      "Resource": [\n        "arn:aws:s3:::my-app-bucket",\n        "arn:aws:s3:::my-app-bucket/*"\n      ]\n    }\n  ]\n}\n\`\`\`\n\nHere is a policy that allows a Lambda function to write to DynamoDB and publish to SNS:\n\n\`\`\`json\n{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": [\n        "dynamodb:PutItem",\n        "dynamodb:UpdateItem",\n        "dynamodb:GetItem"\n      ],\n      "Resource": "arn:aws:dynamodb:us-east-1:123456789:table/Orders"\n    },\n    {\n      "Effect": "Allow",\n      "Action": "sns:Publish",\n      "Resource": "arn:aws:sns:us-east-1:123456789:order-notifications"\n    }\n  ]\n}\n\`\`\`\n\nPolicy types: **AWS Managed Policies** (pre-built by AWS, like AmazonS3ReadOnlyAccess), **Customer Managed Policies** (you create and manage), and **Inline Policies** (embedded directly in a user/role — avoid these, they are hard to manage). Use customer managed policies for fine-grained control.`
      },
      {
        type: 'text', heading: 'IAM Best Practices for Production',
        body: `**Enable MFA on the root account immediately.** The root account has unlimited access to everything in your AWS account. Enable MFA, create an IAM admin user for daily work, and lock the root account credentials in a safe place. Never use root for anything except account-level tasks (changing billing info, closing the account).\n\n**Use IAM roles for EC2 instances, not access keys.** Attach an instance profile (IAM role) to your EC2 instance. Your application automatically gets temporary credentials that rotate every hour. No credentials to manage, no credentials to leak.\n\n**Rotate access keys regularly.** If you must use access keys (for CI/CD systems, for example), rotate them every 90 days. Use AWS Secrets Manager or Parameter Store to store them, not environment variables in your code.\n\n**Use IAM Access Analyzer** to identify resources that are shared with external entities. It analyzes your resource-based policies (S3 bucket policies, IAM role trust policies) and alerts you to unintended public access.\n\n**Use Service Control Policies (SCPs) in AWS Organizations** to set guardrails across all accounts. An SCP can prevent any account in your organization from disabling CloudTrail, creating resources in unapproved regions, or using non-approved instance types.\n\n**Cross-account access with roles:** Instead of creating IAM users in every account, create a role in the target account with a trust policy that allows the source account to assume it. Users in Account A can assume the role in Account B to access its resources. This is the correct pattern for multi-account AWS setups.\n\n\`\`\`json\n// Trust policy on the role in Account B\n{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Principal": {\n      "AWS": "arn:aws:iam::ACCOUNT-A-ID:root"\n    },\n    "Action": "sts:AssumeRole"\n  }]\n}\n\`\`\``
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between an IAM user and an IAM role?', a: 'IAM users have long-term credentials (password, access keys) and are for humans or applications that need persistent access. IAM roles have no long-term credentials — they issue temporary security tokens via STS that expire (typically 1-12 hours). Roles are for AWS services (EC2, Lambda), cross-account access, and federated users. Best practice: use roles for everything except human console access.' },
          { q: 'What is the principle of least privilege?', a: 'Every identity (user, role, service) should have only the minimum permissions required to perform its function, and nothing more. A Lambda function that reads from S3 should have s3:GetObject on that specific bucket — not s3:* on all buckets. This limits the blast radius if credentials are compromised. Implement it by starting with no permissions and adding only what is needed, rather than starting with broad permissions and restricting.' },
          { q: 'How does IAM policy evaluation work when there are multiple policies?', a: 'AWS evaluates all applicable policies and uses this logic: (1) Explicit Deny always wins — if any policy denies an action, it is denied regardless of other allows. (2) Explicit Allow — if a policy allows the action and there is no explicit deny, it is allowed. (3) Implicit Deny — if no policy allows the action, it is denied by default. SCPs (Service Control Policies) are evaluated first and can restrict what even admin users can do.' },
          { q: 'What is an IAM instance profile?', a: 'An instance profile is a container for an IAM role that can be attached to an EC2 instance. When you attach an instance profile, the EC2 instance can call AWS APIs using the role\'s permissions without any hardcoded credentials. The AWS SDK automatically retrieves temporary credentials from the instance metadata service (169.254.169.254). This is the correct way to give EC2 applications access to AWS services.' },
          { q: 'How do you audit IAM permissions in a large AWS account?', a: 'Use IAM Access Analyzer to find resources shared externally. Use IAM Credential Report (downloadable CSV) to see all users, their access keys, MFA status, and last used dates. Use AWS Config rules to detect policy violations. Use CloudTrail to audit all API calls. Use IAM Access Advisor (on each user/role) to see which services were actually accessed and when — use this to remove unused permissions.' },
        ]
      },
    ],
  },

  'aws-regions-az': {
    slug: 'aws-regions-az', title: 'Regions, AZs, and Edge Locations', subtitle: 'AWS global infrastructure and how to design for high availability',
    duration: '20 min', difficulty: 'Beginner',
    sections: [
      {
        type: 'text', heading: 'AWS Global Infrastructure',
        body: `AWS operates a global network of data centers organized into Regions, Availability Zones, and Edge Locations. Understanding this hierarchy is fundamental to designing highly available, low-latency systems on AWS.\n\nAs of 2024, AWS has 33 geographic Regions, 105 Availability Zones, and 600+ Edge Locations (Points of Presence) worldwide. This infrastructure is the foundation of AWS's reliability guarantees — the reason S3 promises 99.999999999% (11 nines) durability and services like RDS Multi-AZ can survive a data center failure without downtime.\n\nWhen you design a system on AWS, you are making explicit choices about which regions and AZs to use. These choices affect latency (how close are you to your users?), availability (can you survive a data center failure?), compliance (does your data need to stay in a specific country?), and cost (data transfer between regions costs money).`
      },
      {
        type: 'text', heading: 'Regions, Availability Zones, and Edge Locations Explained',
        body: `**AWS Regions** are geographic areas, each containing multiple Availability Zones. Examples: us-east-1 (N. Virginia), eu-west-1 (Ireland), ap-southeast-1 (Singapore). Each region is completely independent — resources in us-east-1 are isolated from eu-west-1. Data does not automatically replicate between regions (you must explicitly configure cross-region replication). Regions are connected by AWS's private global network backbone, which is faster and more reliable than the public internet.\n\n**Availability Zones (AZs)** are one or more discrete data centers within a region, each with redundant power, networking, and cooling. AZs within a region are physically separated (typically 10-100km apart) but connected with low-latency, high-bandwidth fiber. This separation means a natural disaster, power outage, or hardware failure in one AZ does not affect others. When you deploy across multiple AZs, you can survive an entire data center failure with zero downtime. Most regions have 3 AZs (some have 2, a few have 6). AZ names like us-east-1a, us-east-1b, us-east-1c are randomized per account — your us-east-1a might be a different physical AZ than your colleague's us-east-1a.\n\n**Edge Locations (Points of Presence)** are endpoints for AWS services that cache content close to users. CloudFront uses 600+ edge locations to serve cached content with single-digit millisecond latency. Route 53 DNS queries are answered from the nearest edge location. AWS Global Accelerator routes traffic through the AWS backbone from the nearest edge location. Edge locations are not full regions — they cannot run EC2 or RDS — but they dramatically reduce latency for content delivery and DNS.`
      },
      {
        type: 'diagram', variant: 'layers', heading: 'AWS Infrastructure Hierarchy',
        caption: 'From global to local — each layer provides a different level of isolation',
        layers: [
          { label: 'AWS Global Network', detail: 'Private fiber backbone connecting all regions', color: 'orange', highlight: true },
          { label: 'Region (e.g., us-east-1)', detail: 'Geographic area, 3+ AZs, independent', color: 'blue', highlight: true },
          { label: 'Availability Zone (e.g., us-east-1a)', detail: 'One or more data centers, redundant power/networking', color: 'green', highlight: true },
          { label: 'Data Center', detail: 'Physical building with servers, networking, cooling', color: 'yellow', highlight: true },
          { label: 'Edge Location / PoP', detail: 'CloudFront, Route 53, Global Accelerator cache points', color: 'cyan', highlight: true },
        ]
      },
      {
        type: 'text', heading: 'Choosing a Region and Multi-AZ vs Multi-Region',
        body: `**How to choose a region:** (1) Latency — deploy close to your users. Use CloudPing or AWS's latency tool to measure. (2) Compliance — some regulations require data to stay in specific countries (GDPR in EU, data residency laws). (3) Service availability — not all AWS services are available in all regions. New services launch in us-east-1 first. (4) Cost — pricing varies by region. us-east-1 is typically cheapest. (5) Disaster recovery — for DR, choose a region far enough away to be unaffected by regional disasters.\n\n**Multi-AZ (High Availability within a region):** Deploy your application across 2-3 AZs in the same region. Use an ALB to distribute traffic. Use RDS Multi-AZ for automatic database failover. Use Auto Scaling Groups that span multiple AZs. This protects against data center failures and is the minimum for production workloads. Latency between AZs is typically <1ms — transparent to applications.\n\n**Multi-Region (Disaster Recovery and Global Scale):** Deploy in multiple regions for protection against regional outages (rare but possible), compliance requirements, or serving users globally with low latency. Requires data replication (DynamoDB Global Tables, Aurora Global Database, S3 Cross-Region Replication). More complex and expensive. Use Route 53 latency-based or geolocation routing to direct users to the nearest region. Active-active multi-region means both regions serve traffic simultaneously. Active-passive means one region is primary and the other is standby.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between a Region and an Availability Zone?', a: 'A Region is a geographic area (like us-east-1 in N. Virginia) containing multiple AZs. An Availability Zone is one or more physically separate data centers within a region, with independent power, networking, and cooling. Regions are completely isolated from each other. AZs within a region are physically separated but connected with low-latency fiber. You deploy across AZs for high availability within a region, and across regions for disaster recovery or global reach.' },
          { q: 'What is the difference between Multi-AZ and Multi-Region?', a: 'Multi-AZ deploys resources across multiple data centers within the same region. It protects against data center failures, provides high availability, and has <1ms latency between AZs. Multi-Region deploys across geographically separate regions. It protects against regional outages, enables global low-latency access, and satisfies data residency requirements. Multi-AZ is the standard for production HA. Multi-Region is for DR, global scale, or compliance.' },
          { q: 'What are Edge Locations used for?', a: 'Edge Locations (Points of Presence) are used by CloudFront (CDN caching), Route 53 (DNS resolution), and AWS Global Accelerator (traffic routing). They cache content close to end users to reduce latency. There are 600+ edge locations globally, far more than the 33 regions. When a user requests a CloudFront-served file, it is served from the nearest edge location — potentially from cache — rather than traveling all the way to the origin server.' },
          { q: 'How do you design for high availability on AWS?', a: 'Deploy across at least 2 AZs (3 is better). Use an Application Load Balancer to distribute traffic. Use Auto Scaling Groups that span multiple AZs to replace failed instances. Use RDS Multi-AZ for automatic database failover. Use S3 for static assets (11 nines durability, automatically replicated across AZs). Use Route 53 health checks to detect failures and reroute traffic. Design stateless application tiers so any instance can handle any request.' },
        ]
      },
    ],
  },


  // ── COMPUTE ───────────────────────────────────────────────────────────────
  'aws-ec2': {
    slug: 'aws-ec2', title: 'EC2 — Elastic Compute Cloud', subtitle: 'Virtual servers, instance types, pricing models, and production patterns',
    duration: '35 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is EC2 and Why It Matters',
        body: `Amazon EC2 (Elastic Compute Cloud) is AWS's virtual server service. It lets you launch Linux or Windows servers in minutes, choose from hundreds of instance types optimized for different workloads, and pay only for what you use. EC2 is the foundation of most AWS architectures — even if you use containers (ECS/EKS) or serverless (Lambda), understanding EC2 is essential because those services run on EC2 under the hood.\n\nAn EC2 instance is a virtual machine running on AWS's physical hardware. You choose the operating system (via an AMI), the instance type (CPU, memory, storage, network), the network configuration (VPC, subnet, security groups), and the storage (EBS volumes). The instance starts in seconds and you can SSH into it, deploy your application, and serve traffic.\n\nEC2 is the most flexible compute option on AWS — you have full control over the OS, runtime, and configuration. This flexibility comes with responsibility: you manage OS patches, security hardening, and capacity planning. For teams that want less operational overhead, ECS/EKS (containers) or Lambda (serverless) are better choices.`
      },
      {
        type: 'text', heading: 'Instance Types and Families',
        body: `AWS offers hundreds of instance types organized into families based on their optimization. The naming convention is: family + generation + size. For example, m5.xlarge = general purpose (m), 5th generation (5), extra large (xlarge).\n\n**General Purpose (m, t):** Balanced CPU, memory, and networking. Use for web servers, application servers, small databases, development environments.\n- t3/t4g: Burstable performance. Earn CPU credits when idle, spend them during bursts. Cheapest option. t3.micro is free tier eligible. Use for low-traffic apps.\n- m5/m6i: Consistent performance. Use for production web/app servers.\n\n**Compute Optimized (c):** High CPU-to-memory ratio. Use for CPU-intensive workloads: batch processing, media transcoding, scientific modeling, gaming servers.\n- c5/c6i: Best price-performance for compute-heavy workloads.\n\n**Memory Optimized (r, x):** High memory-to-CPU ratio. Use for in-memory databases (Redis, Memcached), real-time big data analytics, SAP HANA.\n- r5/r6i: Up to 768GB RAM. Use for large in-memory caches.\n- x2idn: Up to 6TB RAM. Use for SAP HANA, large in-memory databases.\n\n**Storage Optimized (i, d):** High sequential read/write, NVMe SSD storage. Use for NoSQL databases, data warehousing, Elasticsearch.\n- i3/i4i: NVMe SSD, very high IOPS. Use for databases requiring fast local storage.\n\n**Accelerated Computing (p, g, inf):** GPU or custom hardware. Use for machine learning training/inference, video rendering, HPC.\n- p3/p4: NVIDIA V100/A100 GPUs. Use for ML training.\n- g4dn: NVIDIA T4 GPUs. Use for ML inference, video transcoding.`
      },
      {
        type: 'text', heading: 'Pricing Models and When to Use Each',
        body: `**On-Demand:** Pay per hour (or per second for Linux). No commitment, highest price. Use for: unpredictable workloads, development/testing, short-term projects, applications you cannot interrupt.\n\n**Reserved Instances (RI):** 1 or 3 year commitment, up to 72% discount. Standard RIs are for a specific instance type in a specific region. Convertible RIs allow changing instance type/OS. Use for: steady-state production workloads where you know your baseline capacity.\n\n**Savings Plans:** Flexible commitment to a spend level ($/hour) for 1 or 3 years, up to 66% discount. Compute Savings Plans apply to EC2, Lambda, and Fargate regardless of instance type or region. More flexible than RIs. Use for: production workloads where you want discounts without locking into specific instance types.\n\n**Spot Instances:** Bid on unused EC2 capacity, up to 90% discount. AWS can reclaim with 2-minute warning. Use for: fault-tolerant batch jobs, data processing, CI/CD, ML training, anything that can be checkpointed and restarted. Never use for: databases, stateful applications, anything that cannot tolerate interruption.\n\n**Dedicated Hosts:** Physical server dedicated to you. Use for: compliance requirements (software licenses tied to physical cores), regulatory requirements that prohibit multi-tenant hardware.\n\nA common production pattern: use Reserved Instances or Savings Plans for your baseline capacity (the minimum you always need), and On-Demand or Spot for burst capacity. This gives you predictable costs for the base and flexibility for peaks.`
      },
      {
        type: 'text', heading: 'AMIs, Security Groups, and Key Pairs',
        body: `**Amazon Machine Images (AMIs)** are templates for EC2 instances. An AMI contains the OS, pre-installed software, and configuration. You can use AWS-provided AMIs (Amazon Linux 2, Ubuntu, Windows Server), AWS Marketplace AMIs (pre-configured with commercial software), or create your own custom AMIs from a running instance. Custom AMIs are powerful for immutable infrastructure — bake your application and dependencies into an AMI, then launch identical instances from it. This eliminates configuration drift and speeds up Auto Scaling.\n\n**Security Groups** are virtual firewalls for EC2 instances. They control inbound and outbound traffic at the instance level. Security groups are stateful — if you allow inbound traffic on port 80, the response traffic is automatically allowed outbound. Rules are allow-only (no explicit deny). You can reference other security groups in rules (e.g., allow traffic from the ALB security group). Best practice: create separate security groups for each tier (ALB, app servers, database) and only allow traffic between adjacent tiers.\n\n**Key Pairs** are SSH credentials for EC2 instances. AWS stores the public key on the instance; you keep the private key. Use key pairs for initial access, then set up proper access management (AWS Systems Manager Session Manager is better — no open SSH port needed). Never share private keys. If a key is compromised, terminate the instance and launch a new one with a new key pair.\n\n**User Data** scripts run once when an instance first launches. Use them to install software, configure the OS, or pull your application code:\n\n\`\`\`bash\n#!/bin/bash\nyum update -y\nyum install -y nginx\nsystemctl start nginx\nsystemctl enable nginx\necho "<h1>Hello from EC2</h1>" > /usr/share/nginx/html/index.html\n\`\`\``
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between stopping and terminating an EC2 instance?', a: 'Stopping an instance shuts it down but preserves the EBS root volume and its data. You can restart it later — it gets a new public IP but keeps its private IP and EBS data. Terminating an instance permanently deletes it and (by default) its root EBS volume. Instance store volumes are always lost on stop/terminate. Use stop for instances you want to restart later. Use terminate for instances you no longer need.' },
          { q: 'What are placement groups and when would you use them?', a: 'Placement groups control how EC2 instances are placed on underlying hardware. Cluster placement groups pack instances close together in a single AZ for low-latency, high-throughput networking (10Gbps+) — use for HPC, distributed computing. Spread placement groups place instances on distinct hardware to reduce correlated failures — use for small groups of critical instances. Partition placement groups divide instances into logical partitions on separate hardware — use for large distributed systems like Hadoop, Cassandra.' },
          { q: 'How do you handle EC2 instance failures in production?', a: 'Use Auto Scaling Groups — they automatically detect unhealthy instances (via EC2 status checks or ELB health checks) and replace them. Use multiple AZs so a single AZ failure does not take down your application. Use an ALB to distribute traffic and stop sending requests to unhealthy instances. Use CloudWatch alarms to alert on instance failures. Design stateless application tiers so any instance can handle any request — session state in ElastiCache, not on the instance.' },
          { q: 'What is the difference between instance store and EBS?', a: 'Instance store is physically attached to the host server — extremely fast (NVMe SSD), but ephemeral (data is lost when the instance stops or terminates). Use for temporary data, caches, buffers. EBS (Elastic Block Store) is network-attached storage that persists independently of the instance lifecycle. Data survives instance stop/start. Can be detached and reattached to another instance. Use for root volumes, databases, any data that must persist.' },
          { q: 'How do you reduce EC2 costs without sacrificing performance?', a: 'Use Reserved Instances or Savings Plans for baseline capacity (up to 72% discount). Use Spot Instances for fault-tolerant batch workloads (up to 90% discount). Right-size instances — use CloudWatch metrics and AWS Compute Optimizer to identify over-provisioned instances. Use Auto Scaling to scale down during low-traffic periods. Use Graviton (ARM-based) instances — up to 40% better price-performance than x86. Schedule non-production instances to stop outside business hours.' },
        ]
      },
    ],
  },

  'aws-lambda': {
    slug: 'aws-lambda', title: 'AWS Lambda', subtitle: 'Serverless functions, cold starts, concurrency, and event-driven patterns',
    duration: '30 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is Lambda and the Serverless Model',
        body: `AWS Lambda is a serverless compute service that runs your code in response to events without requiring you to provision or manage servers. You upload your function code, configure a trigger (API Gateway, S3 event, SQS message, CloudWatch schedule), and Lambda handles everything else — server provisioning, OS patching, scaling, and high availability.\n\nThe Lambda execution model is fundamentally different from EC2. With EC2, you have a server running 24/7 waiting for requests. With Lambda, your function only runs when triggered. You pay per invocation (first 1 million requests/month are free) and per GB-second of compute time. A function that runs 100ms and is invoked 1 million times costs about $0.20. This makes Lambda extremely cost-effective for event-driven, intermittent, or unpredictable workloads.\n\nLambda supports multiple runtimes: Node.js, Python, Java, Go, Ruby, .NET, and custom runtimes (anything via the Runtime API). Functions can run up to 15 minutes, use up to 10GB of memory, and have 512MB-10GB of ephemeral /tmp storage. Lambda automatically scales — if 1000 events arrive simultaneously, Lambda runs 1000 concurrent function instances.`
      },
      {
        type: 'text', heading: 'Cold Starts — The Most Important Lambda Concept',
        body: `A cold start occurs when Lambda needs to initialize a new execution environment for your function. This involves: downloading your code package, starting the runtime (JVM for Java, Node.js process for JavaScript), and running your initialization code (outside the handler). Cold starts add latency — typically 100ms-1s for Node.js/Python, up to 10s for Java with large JARs.\n\nCold starts happen when: (1) your function is invoked for the first time, (2) Lambda needs to scale up to handle more concurrent requests, or (3) your function has been idle and the execution environment was recycled.\n\nStrategies to reduce cold start impact:\n\n**Provisioned Concurrency:** Pre-warm a specified number of execution environments. Lambda keeps them initialized and ready to respond immediately. Eliminates cold starts for those instances. Costs extra (you pay for the provisioned concurrency even when idle). Use for latency-sensitive APIs.\n\n**Reduce package size:** Smaller packages download faster. Use tree-shaking, remove unused dependencies, use Lambda Layers for shared dependencies.\n\n**Choose the right runtime:** Node.js and Python have the fastest cold starts. Java and .NET have the slowest. Use GraalVM native image for Java to reduce cold start time.\n\n**Keep functions warm:** Use EventBridge to invoke your function every 5 minutes. This keeps execution environments alive. A simple workaround but not as reliable as Provisioned Concurrency.\n\n**Optimize initialization code:** Move expensive operations (database connections, loading large models) outside the handler function. Lambda reuses execution environments for subsequent invocations — initialization code runs once per environment, not per invocation.`
      },
      {
        type: 'text', heading: 'Lambda Configuration, Triggers, and Layers',
        body: `**Memory and Timeout:** Lambda memory ranges from 128MB to 10GB. CPU is allocated proportionally to memory — more memory = more CPU. If your function is CPU-bound, increase memory even if you do not need the RAM. Timeout ranges from 1 second to 15 minutes. Set it to the minimum needed — a stuck function consuming max timeout wastes money and blocks downstream systems.\n\n**Triggers:** Lambda integrates with virtually every AWS service as a trigger:\n- API Gateway / ALB: HTTP requests → Lambda (synchronous)\n- S3: Object created/deleted → Lambda (asynchronous)\n- SQS: Messages in queue → Lambda (polling, batch processing)\n- SNS: Topic notification → Lambda (asynchronous)\n- DynamoDB Streams: Table changes → Lambda (streaming)\n- EventBridge: Scheduled events or custom events → Lambda\n- Kinesis: Stream records → Lambda (streaming)\n\n**Lambda Layers:** Reusable packages of code or dependencies that can be shared across multiple functions. Instead of bundling numpy, pandas, or your company's shared utilities in every function, put them in a layer. Functions can use up to 5 layers. Layers are versioned and can be shared across accounts.\n\n**Lambda@Edge:** Run Lambda functions at CloudFront edge locations, close to users. Use for: A/B testing, request/response manipulation, authentication at the edge, URL rewrites. Limitations: max 5 seconds timeout, max 128MB memory, no VPC access.\n\n\`\`\`python\nimport json\nimport boto3\n\n# Initialization code runs once per execution environment (not per invocation)\ndynamodb = boto3.resource('dynamodb')\ntable = dynamodb.Table('Orders')\n\ndef handler(event, context):\n    # Handler runs on every invocation\n    order_id = event['pathParameters']['orderId']\n    response = table.get_item(Key={'orderId': order_id})\n    return {\n        'statusCode': 200,\n        'body': json.dumps(response.get('Item', {}))\n    }\n\`\`\``
      },
      {
        type: 'text', heading: 'Concurrency, Throttling, and DLQ',
        body: `**Concurrency** is the number of Lambda function instances running simultaneously. AWS has a default account-level concurrency limit of 1000 (can be increased). Each function can have a reserved concurrency limit — this guarantees that function always has capacity but also caps it (useful to prevent one function from consuming all account concurrency).\n\n**Throttling** occurs when Lambda cannot scale fast enough or when concurrency limits are hit. Throttled invocations return a 429 error. For synchronous invocations (API Gateway), the caller gets the error immediately. For asynchronous invocations (S3, SNS), Lambda retries twice before sending to the Dead Letter Queue (DLQ).\n\n**Dead Letter Queue (DLQ):** Configure an SQS queue or SNS topic as the DLQ for asynchronous Lambda invocations. Failed events (after retries) are sent to the DLQ for investigation and reprocessing. Always configure a DLQ for production Lambda functions that process important events — otherwise failed events are silently dropped.\n\n**Destinations:** A newer alternative to DLQ. Configure success and failure destinations for asynchronous invocations. On success, send the event and result to an SQS queue, SNS topic, EventBridge, or another Lambda. On failure, send to the same options. More flexible than DLQ because you can handle both success and failure cases.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What causes Lambda cold starts and how do you mitigate them?', a: 'Cold starts occur when Lambda initializes a new execution environment: downloading code, starting the runtime, running initialization code. Mitigation: (1) Provisioned Concurrency — pre-warm environments, eliminates cold starts. (2) Reduce package size — smaller packages initialize faster. (3) Choose fast runtimes — Node.js/Python are faster than Java/.NET. (4) Move initialization outside the handler — database connections, SDK clients. (5) Keep functions warm with scheduled pings (less reliable).' },
          { q: 'What is the difference between synchronous and asynchronous Lambda invocations?', a: 'Synchronous: caller waits for the function to complete and gets the response. Examples: API Gateway, ALB, Cognito triggers. If the function fails, the error is returned to the caller. Asynchronous: Lambda queues the event and returns immediately. Examples: S3 events, SNS, EventBridge. Lambda retries failed invocations twice. Configure a DLQ or Destination for failed events. SQS trigger is a special case — Lambda polls SQS and processes messages in batches.' },
          { q: 'How do you handle Lambda timeouts?', a: 'Investigate: check CloudWatch Logs for the function, use X-Ray tracing to identify slow operations, check if the function is waiting on external APIs or database queries. Fix: optimize slow operations (add caching, optimize queries), increase timeout if the operation legitimately takes longer, break long-running operations into smaller steps using Step Functions, use async patterns (write to SQS and process asynchronously). Set CloudWatch alarms on Lambda duration metrics.' },
          { q: 'What is Lambda concurrency and how does it affect your application?', a: 'Concurrency is the number of function instances running simultaneously. Default account limit is 1000. If all 1000 are in use, new invocations are throttled (429). Use reserved concurrency to guarantee capacity for critical functions and prevent them from being starved. Use provisioned concurrency to pre-warm instances for latency-sensitive functions. Monitor ConcurrentExecutions and Throttles metrics in CloudWatch.' },
          { q: 'When would you NOT use Lambda?', a: 'Lambda is not suitable for: long-running processes (>15 minutes), workloads requiring persistent connections (WebSockets — use API Gateway WebSocket or EC2), high-performance computing requiring consistent CPU (use EC2 or ECS), applications with large local storage needs (>10GB), workloads where cold starts are unacceptable and Provisioned Concurrency cost is prohibitive, or applications that need to maintain in-memory state between invocations.' },
        ]
      },
    ],
  },


  'aws-ecs-eks': {
    slug: 'aws-ecs-eks', title: 'ECS and EKS — Container Orchestration', subtitle: 'Running containers at scale with ECS, EKS, and Fargate',
    duration: '35 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'Container Orchestration on AWS',
        body: `Containers have become the standard way to package and deploy applications. Docker containers bundle your application with its dependencies, ensuring it runs the same way everywhere. But running containers in production requires orchestration — managing where containers run, how many instances are running, how they scale, how they communicate, and how they recover from failures.\n\nAWS offers two container orchestration services: ECS (Elastic Container Service) and EKS (Elastic Kubernetes Service). ECS is AWS's proprietary orchestration system — simpler, tightly integrated with AWS services, and easier to operate. EKS is managed Kubernetes — the industry-standard open-source orchestration platform. Both can run containers on EC2 instances or on Fargate (serverless containers).\n\nChoosing between ECS and EKS is a common interview question. The answer depends on your team's Kubernetes expertise, your need for portability, and your operational complexity tolerance. ECS is the right choice for most AWS-native teams. EKS is the right choice if you need Kubernetes-specific features, have existing Kubernetes expertise, or need to run the same workloads on-premises and in the cloud.`
      },
      {
        type: 'diagram', variant: 'comparison', heading: 'ECS vs EKS vs Fargate',
        items: [
          { title: 'Amazon ECS', color: 'orange', points: ['AWS-native, simpler to operate', 'Task Definitions define containers', 'Services manage desired count + scaling', 'Deep AWS integration (IAM, ALB, CloudWatch)', 'No Kubernetes knowledge required', '✅ Best for: AWS-native teams, simpler workloads'] },
          { title: 'Amazon EKS', color: 'blue', points: ['Managed Kubernetes control plane', 'Full Kubernetes API compatibility', 'Portable across clouds and on-prem', 'Larger ecosystem (Helm, operators)', 'More complex to operate', '✅ Best for: Kubernetes teams, multi-cloud, complex workloads'] },
          { title: 'AWS Fargate', color: 'green', points: ['Serverless container runtime', 'Works with both ECS and EKS', 'No EC2 instances to manage', 'Pay per vCPU/memory per second', 'Slower startup than EC2-backed', '✅ Best for: variable workloads, no ops overhead'] },
        ]
      },
      {
        type: 'text', heading: 'ECS Core Concepts: Clusters, Task Definitions, and Services',
        body: `**Clusters** are logical groupings of compute resources (EC2 instances or Fargate capacity) where your containers run. A cluster can contain multiple services and tasks. You can have separate clusters for production, staging, and development.\n\n**Task Definitions** are blueprints for your containers — similar to a docker-compose.yml. They define: the Docker image to use, CPU and memory requirements, environment variables, port mappings, IAM role (task role), logging configuration (CloudWatch Logs), and volume mounts. Task definitions are versioned — each update creates a new revision.\n\n\`\`\`json\n{\n  "family": "web-app",\n  "networkMode": "awsvpc",\n  "requiresCompatibilities": ["FARGATE"],\n  "cpu": "256",\n  "memory": "512",\n  "taskRoleArn": "arn:aws:iam::123456789:role/ecsTaskRole",\n  "containerDefinitions": [{\n    "name": "web",\n    "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/web-app:latest",\n    "portMappings": [{"containerPort": 3000, "protocol": "tcp"}],\n    "environment": [{"name": "NODE_ENV", "value": "production"}],\n    "logConfiguration": {\n      "logDriver": "awslogs",\n      "options": {\n        "awslogs-group": "/ecs/web-app",\n        "awslogs-region": "us-east-1",\n        "awslogs-stream-prefix": "ecs"\n      }\n    }\n  }]\n}\n\`\`\`\n\n**Services** maintain a desired number of running task instances. If a task fails, the service automatically starts a replacement. Services integrate with ALB for load balancing and support rolling updates, blue/green deployments (via CodeDeploy), and Auto Scaling. A service ensures your application is always running the desired number of healthy containers.`
      },
      {
        type: 'text', heading: 'EKS Architecture and Key Concepts',
        body: `EKS manages the Kubernetes control plane (API server, etcd, scheduler, controller manager) — you do not need to operate it. You manage the worker nodes (EC2 instances or Fargate) where your pods run.\n\n**Key EKS concepts:** Pods (one or more containers that share network and storage), Deployments (manage desired state of pods, rolling updates), Services (stable network endpoint for pods), Ingress (HTTP routing, integrates with AWS ALB via the AWS Load Balancer Controller), ConfigMaps and Secrets (configuration and sensitive data), Namespaces (logical isolation within a cluster).\n\n**EKS node options:** Managed Node Groups (AWS manages EC2 instances, handles patching and updates), Self-managed nodes (you manage EC2 instances), Fargate profiles (serverless, no nodes to manage).\n\n**Deployment strategies:** Rolling update (replace pods gradually, zero downtime), Blue/Green (deploy new version alongside old, switch traffic), Canary (route small percentage of traffic to new version). EKS supports all these via Kubernetes native mechanisms or AWS CodeDeploy integration.\n\nFor MAANG interviews, know the difference between ECS and EKS, understand when to use each, and be able to describe a deployment pipeline: code push → CodeBuild builds Docker image → push to ECR → update ECS service or EKS deployment → ALB routes traffic to new containers.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'When would you choose ECS over EKS?', a: 'Choose ECS when: your team does not have Kubernetes expertise, you want simpler operations with deep AWS integration, you are building AWS-native applications, you want lower operational overhead, or you are migrating from EC2 and want a gradual path to containers. Choose EKS when: you have existing Kubernetes expertise, you need Kubernetes-specific features (custom operators, CRDs), you need portability across clouds, or you are running the same workloads on-premises and in AWS.' },
          { q: 'How do you deploy a containerized application to ECS?', a: '(1) Build Docker image: docker build -t app-name . (2) Push to ECR: docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/app-name:tag (3) Create/update Task Definition with the new image tag (4) Update ECS Service to use the new task definition revision (5) ECS performs a rolling update — starts new tasks with the new image, waits for them to pass health checks, then stops old tasks. Automate this with CodePipeline + CodeDeploy for blue/green deployments.' },
          { q: 'What is the difference between a Task and a Service in ECS?', a: 'A Task is a single running instance of a task definition — it runs and then stops (like a batch job or one-off command). A Service is a long-running managed group of tasks — it maintains a desired count, replaces failed tasks, integrates with load balancers, and supports auto scaling. Use Tasks for batch jobs, migrations, one-off scripts. Use Services for web servers, APIs, background workers that should always be running.' },
          { q: 'How do containers in ECS communicate with each other?', a: 'In awsvpc network mode (recommended for Fargate), each task gets its own ENI and private IP. Containers communicate via service discovery (AWS Cloud Map) or through an ALB. For ECS on EC2 with bridge networking, containers on the same host communicate via the Docker bridge network. For cross-service communication, use service discovery (DNS-based) or an internal ALB. Use security groups to control which services can communicate.' },
        ]
      },
    ],
  },

  'aws-fargate': {
    slug: 'aws-fargate', title: 'AWS Fargate', subtitle: 'Serverless containers — run containers without managing servers',
    duration: '20 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is Fargate and Why Use It',
        body: `AWS Fargate is a serverless compute engine for containers. It works with both ECS and EKS, allowing you to run containers without provisioning or managing EC2 instances. With Fargate, you define your container requirements (CPU, memory, networking) and AWS handles the underlying infrastructure — server selection, patching, scaling, and availability.\n\nWith EC2-backed ECS/EKS, you manage a fleet of EC2 instances: right-sizing them, patching the OS, managing capacity, and handling instance failures. With Fargate, all of that disappears. You focus entirely on your containers and application logic.\n\nFargate is ideal for: variable or unpredictable workloads (you pay per second, no idle capacity), teams that want to minimize operational overhead, batch jobs and scheduled tasks, microservices with different resource requirements, and development/staging environments. The tradeoff is cost — Fargate is more expensive per compute unit than EC2, and startup time is slightly slower (no pre-warmed instances).`
      },
      {
        type: 'text', heading: 'Fargate Pricing and Task Sizing',
        body: `Fargate pricing is based on the vCPU and memory you allocate to your task, billed per second with a 1-minute minimum. You choose from predefined CPU/memory combinations:\n\n\`\`\`\nvCPU    Memory options\n0.25    0.5GB, 1GB, 2GB\n0.5     1GB to 4GB\n1       2GB to 8GB\n2       4GB to 16GB\n4       8GB to 30GB\n8       16GB to 60GB\n16      32GB to 120GB\n\`\`\`\n\nRight-sizing Fargate tasks is important for cost optimization. Use CloudWatch Container Insights to monitor actual CPU and memory utilization. If your tasks consistently use 20% of allocated CPU, you are over-provisioned. Reduce the allocation to save money.\n\nCompared to EC2: a t3.small (2 vCPU, 2GB) costs ~$0.023/hour On-Demand. The equivalent Fargate task (0.5 vCPU, 2GB) costs ~$0.025/hour. Fargate is slightly more expensive per unit but eliminates EC2 management overhead. For variable workloads, Fargate is often cheaper overall because you only pay when tasks are running.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'When would you use Fargate vs EC2-backed ECS?', a: 'Use Fargate when: you want zero server management, workloads are variable or unpredictable, you are running batch jobs or scheduled tasks, you want strong task isolation (each task gets its own kernel), or you are a small team without dedicated infrastructure engineers. Use EC2-backed ECS when: you need specific instance types (GPU, high memory), you need to optimize costs at scale (EC2 Reserved Instances are cheaper), you need faster startup times, or you need access to instance-level features (placement groups, enhanced networking).' },
          { q: 'How does Fargate handle security isolation?', a: 'Each Fargate task runs in its own isolated compute environment with its own kernel — tasks do not share the underlying EC2 host. This provides stronger isolation than EC2-backed containers where multiple tasks share a host. Each task gets its own ENI (Elastic Network Interface) with its own security group, enabling fine-grained network access control. Use task IAM roles to grant AWS permissions to containers without hardcoding credentials.' },
          { q: 'What are the limitations of Fargate?', a: 'No GPU support (use EC2-backed ECS/EKS for ML workloads). No privileged containers (cannot run Docker-in-Docker). No access to the underlying host. Slightly slower startup than EC2-backed (no pre-warmed instances). More expensive per compute unit than EC2 Reserved Instances at scale. Limited to predefined CPU/memory combinations. No support for Windows containers on Fargate (ECS only, not EKS).' },
        ]
      },
    ],
  },

  'aws-autoscaling': {
    slug: 'aws-autoscaling', title: 'Auto Scaling', subtitle: 'Scaling policies, launch templates, lifecycle hooks, and production patterns',
    duration: '30 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is Auto Scaling and Why It Matters',
        body: `AWS Auto Scaling automatically adjusts the number of EC2 instances (or ECS tasks, DynamoDB capacity, etc.) in response to demand. It ensures you have enough capacity to handle traffic spikes without over-provisioning during quiet periods. Auto Scaling is fundamental to building cost-efficient, highly available applications on AWS.\n\nWithout Auto Scaling, you face a dilemma: provision for peak traffic (expensive, wasteful during off-peak) or provision for average traffic (cheap, but crashes during spikes). Auto Scaling solves this by dynamically adjusting capacity. During a traffic spike, it adds instances. When traffic drops, it removes them. You pay only for what you need.\n\nAuto Scaling Groups (ASGs) are the core resource. An ASG defines: the minimum number of instances (floor), maximum number (ceiling), desired number (current target), launch template (what instances to launch), and scaling policies (when to scale). The ASG spans multiple AZs and automatically distributes instances across them for high availability.`
      },
      {
        type: 'animation', id: 'auto-scaling',
        heading: 'ASG Scale-Out and Scale-In in Action',
        caption: 'Watch the ASG respond to a CPU spike — adding and removing instances automatically',
      },
      {
        type: 'text', heading: 'Launch Templates and Scaling Policies',
        body: `**Launch Templates** define the configuration for instances launched by the ASG: AMI, instance type, key pair, security groups, IAM instance profile, user data, and storage. Launch templates support versioning and can specify multiple instance types (mixed instances policy) for cost optimization — use a mix of On-Demand and Spot instances.\n\n**Scaling Policies:**\n\n**Target Tracking Scaling** (recommended): Maintain a target value for a metric. Example: keep average CPU utilization at 50%. AWS automatically calculates how many instances to add or remove. Simple to configure, works well for most use cases.\n\n\`\`\`json\n{\n  "TargetValue": 50.0,\n  "PredefinedMetricSpecification": {\n    "PredefinedMetricType": "ASGAverageCPUUtilization"\n  }\n}\n\`\`\`\n\n**Step Scaling:** Add or remove a specific number of instances based on CloudWatch alarm thresholds. More control than target tracking. Example: add 2 instances when CPU > 70%, add 4 instances when CPU > 90%.\n\n**Scheduled Scaling:** Scale at specific times. Example: add 10 instances every weekday at 8am, remove them at 8pm. Use for predictable traffic patterns.\n\n**Predictive Scaling:** Uses machine learning to predict future traffic based on historical patterns and proactively scales before traffic arrives. Reduces the lag between traffic increase and capacity addition.\n\n**Cooldown Periods:** After a scaling activity, the ASG waits for the cooldown period (default 300 seconds) before evaluating scaling policies again. This prevents rapid scale-in/scale-out oscillation. Set shorter cooldowns for scale-out (respond faster to traffic) and longer for scale-in (avoid removing instances too quickly).`
      },
      {
        type: 'text', heading: 'Lifecycle Hooks and Health Checks',
        body: `**Lifecycle Hooks** pause instance launch or termination to allow custom actions. When an instance is launching, a hook can pause it in a "Pending:Wait" state while you: install software, run configuration management (Ansible, Chef), register with a service discovery system, or warm up application caches. When an instance is terminating, a hook can pause it in "Terminating:Wait" while you: drain connections, deregister from service discovery, or copy logs to S3.\n\n\`\`\`bash\n# Example: lifecycle hook for instance launch\n# The instance is paused in Pending:Wait state\n# Your script runs, then completes the lifecycle action\naws autoscaling complete-lifecycle-action \\\n  --lifecycle-hook-name my-launch-hook \\\n  --auto-scaling-group-name my-asg \\\n  --lifecycle-action-result CONTINUE \\\n  --instance-id i-1234567890abcdef0\n\`\`\`\n\n**Health Checks:** ASGs use two types of health checks. EC2 health checks (default) check the instance status — if the instance is stopped or has a system failure, it is replaced. ELB health checks check whether the instance is passing the load balancer's health check — if the application is not responding correctly, the instance is replaced. Always enable ELB health checks for web applications — EC2 health checks alone will not catch application-level failures.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between horizontal and vertical scaling?', a: 'Horizontal scaling (scale out/in) adds or removes instances. It is the AWS-native approach — use Auto Scaling Groups to add EC2 instances, ECS tasks, or Lambda concurrency. Horizontal scaling is preferred because it provides high availability (no single point of failure), is theoretically unlimited, and can be automated. Vertical scaling (scale up/down) increases the size of an existing instance (e.g., t3.medium → t3.large). It requires downtime for EC2, has limits (largest instance type), and creates a single point of failure.' },
          { q: 'How do you handle a sudden traffic spike with Auto Scaling?', a: 'Target tracking scaling responds to spikes but has a lag — it takes time to launch new instances (typically 2-5 minutes). To handle sudden spikes: (1) Use Predictive Scaling to proactively add capacity before expected spikes. (2) Set a higher minimum instance count during known high-traffic periods (scheduled scaling). (3) Use a warm pool — pre-initialized instances that can be quickly added to the ASG. (4) Use Lambda or Fargate for the most variable components — they scale in seconds. (5) Use CloudFront to absorb traffic spikes at the edge.' },
          { q: 'What is a warm pool in Auto Scaling?', a: 'A warm pool is a group of pre-initialized EC2 instances that sit outside the ASG in a stopped or running state. When the ASG needs to scale out, it pulls instances from the warm pool instead of launching new ones — dramatically reducing scale-out time from minutes to seconds. Instances in the warm pool have already completed their initialization (user data, software installation). You pay for stopped instances at a reduced rate (EBS storage only, no compute).' },
          { q: 'How do you prevent Auto Scaling from terminating the wrong instances?', a: 'Use termination policies to control which instances are terminated during scale-in. Default policy: terminate the instance in the AZ with the most instances, then the oldest launch template, then the one closest to the next billing hour. Custom policies: protect specific instances from termination (instance scale-in protection), use lifecycle hooks to drain connections before termination, configure the ASG to prefer terminating On-Demand instances before Spot (to save money).' },
        ]
      },
    ],
  },


  // ── STORAGE ───────────────────────────────────────────────────────────────
  'aws-s3': {
    slug: 'aws-s3', title: 'Amazon S3', subtitle: 'Object storage, storage classes, versioning, security, and lifecycle policies',
    duration: '35 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is S3 and Why It Is Foundational',
        body: `Amazon S3 (Simple Storage Service) is AWS's object storage service. It stores files (objects) in buckets and provides 99.999999999% (11 nines) durability — meaning if you store 10 million objects, you can expect to lose one object every 10,000 years. S3 is not a file system or a block device — it is an object store accessed via HTTP APIs. You cannot mount S3 like a disk or append to files in place.\n\nS3 is used for virtually everything: static website hosting, application data storage, backup and archival, data lake storage, log aggregation, software distribution, and as the source/destination for data pipelines. Every AWS service integrates with S3. Lambda can be triggered by S3 events. CloudFront can serve S3 content. Athena can query S3 data directly. EMR processes data from S3.\n\nS3 stores objects in a flat namespace — there are no real directories, just key names with slashes that look like paths. An object's key is its full path: images/2024/photo.jpg. The bucket name must be globally unique across all AWS accounts. Objects can be up to 5TB in size. There is no limit on the number of objects in a bucket.`
      },
      {
        type: 'text', heading: 'Storage Classes — Choosing the Right Tier',
        body: `S3 offers multiple storage classes with different cost and availability tradeoffs. Choosing the right class can dramatically reduce storage costs.\n\n**S3 Standard:** Default class. 99.99% availability, 11 nines durability. Replicated across 3+ AZs. Use for frequently accessed data. Most expensive storage cost, no retrieval fee.\n\n**S3 Intelligent-Tiering:** Automatically moves objects between access tiers based on usage patterns. No retrieval fees. Small monthly monitoring fee per object. Use when access patterns are unknown or change over time.\n\n**S3 Standard-IA (Infrequent Access):** Lower storage cost than Standard, but retrieval fee applies. 99.9% availability. Use for data accessed less than once a month — backups, disaster recovery files.\n\n**S3 One Zone-IA:** Like Standard-IA but stored in a single AZ. 20% cheaper than Standard-IA. Data is lost if the AZ is destroyed. Use for reproducible data (thumbnails, transcoded media) where you can regenerate it if lost.\n\n**S3 Glacier Instant Retrieval:** Archival storage with millisecond retrieval. 68% cheaper than Standard. Use for archive data accessed once a quarter.\n\n**S3 Glacier Flexible Retrieval:** Archival storage, retrieval in minutes to hours. Use for backups and archives accessed once or twice a year.\n\n**S3 Glacier Deep Archive:** Cheapest storage ($0.00099/GB/month). Retrieval in 12-48 hours. Use for compliance archives, data that must be retained for 7-10 years but rarely accessed.\n\n**Lifecycle Policies** automate transitions between storage classes:\n\n\`\`\`json\n{\n  "Rules": [{\n    "Status": "Enabled",\n    "Transitions": [\n      {"Days": 30, "StorageClass": "STANDARD_IA"},\n      {"Days": 90, "StorageClass": "GLACIER"},\n      {"Days": 365, "StorageClass": "DEEP_ARCHIVE"}\n    ],\n    "Expiration": {"Days": 2555}\n  }]\n}\n\`\`\``
      },
      {
        type: 'animation', id: 's3',
        heading: 'S3 Lifecycle — Objects Moving Through Storage Tiers',
        caption: 'Watch how a lifecycle policy automatically moves data to cheaper tiers over time',
      },
      {
        type: 'text', heading: 'Versioning, Replication, and Security',
        body: `**Versioning:** When enabled, S3 keeps all versions of every object. Deleting an object adds a delete marker — the object is not actually deleted. You can restore previous versions. Versioning protects against accidental deletion and overwrites. Enable it on all production buckets. Note: versioning increases storage costs because all versions are stored.\n\n**Cross-Region Replication (CRR):** Automatically replicates objects to a bucket in another region. Requires versioning on both source and destination. Use for: disaster recovery (data in multiple regions), compliance (data residency requirements), latency reduction (serve data from the nearest region). Replication is asynchronous — there is a small delay.\n\n**Pre-signed URLs:** Generate a time-limited URL that grants temporary access to a private S3 object. Use for: allowing users to download private files without making the bucket public, allowing users to upload directly to S3 from the browser (bypassing your server). Pre-signed URLs are signed with your IAM credentials and expire after a specified time (up to 7 days).\n\n\`\`\`python\nimport boto3\ns3 = boto3.client('s3')\n\n# Generate pre-signed URL for download (valid 1 hour)\nurl = s3.generate_presigned_url(\n    'get_object',\n    Params={'Bucket': 'my-bucket', 'Key': 'private/file.pdf'},\n    ExpiresIn=3600\n)\n\`\`\`\n\n**Security:** S3 buckets are private by default. Control access with: Bucket Policies (resource-based, JSON, can grant cross-account access), IAM Policies (identity-based, attached to users/roles), ACLs (legacy, avoid for new buckets), S3 Block Public Access (account-level or bucket-level setting that prevents public access regardless of policies — enable this on all buckets that should not be public). Enable S3 server-side encryption (SSE-S3 or SSE-KMS) for data at rest.`
      },
      {
        type: 'text', heading: 'S3 Events, Multipart Upload, and Performance',
        body: `**S3 Event Notifications:** S3 can trigger notifications when objects are created, deleted, or restored. Destinations: Lambda (process the object), SQS (queue for async processing), SNS (fan-out to multiple consumers), EventBridge (route to any AWS service). Use cases: image resizing when a photo is uploaded, virus scanning new files, triggering a data pipeline when a CSV is uploaded.\n\n**Multipart Upload:** For objects larger than 100MB, use multipart upload. It splits the object into parts, uploads them in parallel, and assembles them on S3. Benefits: faster uploads (parallel), resumable (if a part fails, retry just that part), required for objects >5GB. The AWS SDK automatically uses multipart upload for large files.\n\n**S3 Performance:** S3 supports 3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests per second per prefix. For high-throughput workloads, use multiple prefixes (key name prefixes) to parallelize requests. S3 Transfer Acceleration uses CloudFront edge locations to accelerate uploads from distant locations — useful for global applications uploading large files.\n\n**S3 Select and Glacier Select:** Query data directly in S3 using SQL without downloading the entire object. Useful for large CSV or JSON files where you only need a subset of data. Reduces data transfer costs and speeds up queries.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'How does S3 achieve 11 nines of durability?', a: 'S3 automatically replicates every object across a minimum of 3 Availability Zones within a region. When you upload an object, S3 stores multiple copies on different physical devices in different AZs. S3 continuously monitors data integrity using checksums and automatically repairs any corruption. The 11 nines (99.999999999%) durability means losing one object out of 10 billion stored per year — effectively zero data loss.' },
          { q: 'What is the difference between S3 durability and availability?', a: 'Durability is the probability that your data will not be lost — S3 Standard offers 11 nines (99.999999999%). Availability is the probability that you can access your data when you need it — S3 Standard offers 99.99%. You can have high durability but lower availability (data exists but the service is temporarily unavailable). S3 One Zone-IA has the same durability as Standard within one AZ, but if that AZ is destroyed, the data is lost.' },
          { q: 'How do you secure an S3 bucket?', a: 'Enable S3 Block Public Access at the account level (prevents any bucket from being accidentally made public). Use bucket policies for resource-based access control. Use IAM policies for identity-based access. Enable versioning to protect against accidental deletion. Enable server-side encryption (SSE-KMS for audit trail, SSE-S3 for simplicity). Enable CloudTrail S3 data events to log all object-level API calls. Use VPC endpoints to access S3 from EC2 without going through the internet.' },
          { q: 'What is S3 Intelligent-Tiering and when should you use it?', a: 'S3 Intelligent-Tiering automatically moves objects between access tiers (Frequent Access, Infrequent Access, Archive Instant Access) based on actual usage patterns. There are no retrieval fees, just a small monthly monitoring fee per object ($0.0025 per 1,000 objects). Use it when access patterns are unknown, unpredictable, or change over time. Not cost-effective for objects smaller than 128KB (monitoring fee exceeds savings) or objects accessed frequently (Standard is cheaper without the monitoring fee).' },
          { q: 'How do you handle large file uploads to S3?', a: 'Use multipart upload for files >100MB (required for >5GB). The AWS SDK handles this automatically with TransferManager. For browser uploads, generate a pre-signed POST URL — the browser uploads directly to S3 without going through your server (reduces server load and bandwidth costs). For very large datasets, use AWS DataSync or S3 Transfer Acceleration. For offline transfers (petabytes), use AWS Snowball.' },
        ]
      },
    ],
  },

  'aws-ebs-efs': {
    slug: 'aws-ebs-efs', title: 'EBS and EFS — Block and File Storage', subtitle: 'EBS volume types, snapshots, EFS shared storage, and when to use each',
    duration: '25 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'EBS — Elastic Block Store',
        body: `Amazon EBS provides persistent block storage for EC2 instances. Unlike instance store (ephemeral, lost on stop/terminate), EBS volumes persist independently of the instance lifecycle. You can stop an EC2 instance, detach the EBS volume, attach it to another instance, and all your data is intact.\n\nEBS volumes are network-attached storage — they communicate with EC2 instances over the AWS network. This means there is slightly more latency than local NVMe storage, but the durability and flexibility are worth it for most workloads. EBS volumes are replicated within a single AZ for durability (99.999% availability). They are NOT automatically replicated across AZs — use snapshots for cross-AZ or cross-region durability.\n\nEBS volumes can only be attached to one EC2 instance at a time (except io1/io2 Multi-Attach, which allows up to 16 instances in the same AZ). For shared storage across multiple instances, use EFS.`
      },
      {
        type: 'text', heading: 'EBS Volume Types',
        body: `**gp3 (General Purpose SSD):** The default and recommended type for most workloads. 3,000 IOPS and 125 MB/s baseline, independently configurable up to 16,000 IOPS and 1,000 MB/s. 20% cheaper than gp2. Use for: boot volumes, development environments, low-latency applications, virtual desktops.\n\n**gp2 (General Purpose SSD, legacy):** IOPS tied to volume size (3 IOPS/GB, max 16,000). Migrate to gp3 for better performance and lower cost.\n\n**io2 Block Express (Provisioned IOPS SSD):** Up to 256,000 IOPS and 4,000 MB/s. Sub-millisecond latency. 99.999% durability (vs 99.8-99.9% for gp3). Use for: I/O-intensive databases (Oracle, SQL Server, SAP HANA), latency-sensitive applications.\n\n**io1 (Provisioned IOPS SSD, legacy):** Up to 64,000 IOPS. Use io2 instead — same price, better durability.\n\n**st1 (Throughput Optimized HDD):** Low-cost HDD for frequently accessed, throughput-intensive workloads. Up to 500 MB/s. Cannot be a boot volume. Use for: big data, data warehouses, log processing, sequential reads/writes.\n\n**sc1 (Cold HDD):** Lowest cost HDD for infrequently accessed data. Up to 250 MB/s. Use for: cold data requiring fewer scans per day, archives.\n\n**EBS Snapshots:** Point-in-time backups of EBS volumes stored in S3. Incremental — only changed blocks are saved after the first snapshot. Use AWS Data Lifecycle Manager (DLM) to automate snapshot creation and deletion. Snapshots can be copied to other regions for disaster recovery. You can create a new EBS volume from a snapshot in any AZ.`
      },
      {
        type: 'diagram', variant: 'comparison', heading: 'EBS vs EFS vs S3',
        items: [
          { title: 'EBS (Block Storage)', color: 'blue', points: ['Attached to one EC2 instance', 'Persistent, survives instance stop', 'Low latency, high IOPS', 'AZ-specific (not cross-AZ)', 'Use for: OS, databases, apps', '✅ Best for: single-instance storage'] },
          { title: 'EFS (File Storage)', color: 'green', points: ['Shared across multiple EC2 instances', 'NFS protocol, POSIX-compliant', 'Automatically scales, multi-AZ', 'Higher latency than EBS', 'Use for: shared content, CMS, home dirs', '✅ Best for: shared file storage'] },
          { title: 'S3 (Object Storage)', color: 'orange', points: ['Accessed via HTTP API', 'Unlimited scale, 11 nines durability', 'Not mountable as filesystem', 'Highest latency of the three', 'Use for: backups, static assets, data lake', '✅ Best for: unstructured data at scale'] },
        ]
      },
      {
        type: 'text', heading: 'EFS — Elastic File System',
        body: `Amazon EFS is a managed NFS (Network File System) that can be mounted on multiple EC2 instances simultaneously. Unlike EBS (one instance at a time), EFS is a shared file system — all instances see the same files. EFS automatically scales storage capacity up and down as you add and remove files, with no provisioning required.\n\nEFS is multi-AZ by default — data is replicated across multiple AZs within a region. You mount EFS using mount targets in each AZ. All instances in all AZs access the same file system.\n\nEFS performance modes: General Purpose (default, low latency, suitable for most workloads) and Max I/O (higher throughput and IOPS, slightly higher latency, for highly parallelized workloads like big data processing).\n\nEFS throughput modes: Bursting (throughput scales with storage size, like gp2 EBS), Provisioned (specify throughput independently of storage), and Elastic (automatically scales throughput based on workload — recommended for spiky workloads).\n\nEFS storage classes: Standard (frequently accessed) and Infrequent Access (IA, 92% cheaper, for files not accessed for 30+ days). Use EFS Lifecycle Management to automatically move files to IA.\n\nUse EFS for: content management systems (WordPress, Drupal) where multiple web servers need to share uploaded files, home directories for multiple EC2 instances, shared configuration files, container storage (EFS CSI driver for EKS).`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between EBS and EFS?', a: 'EBS is block storage attached to a single EC2 instance (like a hard drive). It is AZ-specific, low latency, and used for OS volumes, databases, and application storage. EFS is a shared NFS file system that can be mounted on multiple EC2 instances simultaneously across multiple AZs. It automatically scales, is more expensive than EBS, and is used for shared content, home directories, and CMS storage.' },
          { q: 'When would you use gp3 vs io2?', a: 'Use gp3 for most workloads — it provides 3,000 IOPS baseline (configurable to 16,000) at a lower cost than io2. Use io2 when you need more than 16,000 IOPS, sub-millisecond consistent latency, 99.999% durability (vs 99.8% for gp3), or Multi-Attach (attach to multiple instances). io2 is for I/O-intensive databases like Oracle, SQL Server, and SAP HANA where performance is critical.' },
          { q: 'How do EBS snapshots work?', a: 'EBS snapshots are incremental backups stored in S3. The first snapshot copies all data. Subsequent snapshots only copy changed blocks. Despite being incremental, each snapshot is a complete restore point — you can create a new volume from any snapshot. Snapshots are AZ-agnostic — you can create a volume in any AZ from a snapshot. Use AWS Data Lifecycle Manager to automate snapshot creation, retention, and cross-region copying.' },
        ]
      },
    ],
  },


  // ── DATABASES ─────────────────────────────────────────────────────────────
  'aws-rds': {
    slug: 'aws-rds', title: 'Amazon RDS', subtitle: 'Managed relational databases, Multi-AZ, read replicas, and Aurora',
    duration: '30 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is RDS and Why Use It',
        body: `Amazon RDS (Relational Database Service) is a managed service for running relational databases on AWS. It supports MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, and Amazon Aurora. RDS handles the undifferentiated heavy lifting of database operations: hardware provisioning, OS patching, database software installation, backups, and monitoring. You focus on your schema and queries.\n\nCompared to running a database on EC2, RDS provides: automated backups (daily snapshots + transaction logs for point-in-time recovery), automated patching (OS and database engine), Multi-AZ for automatic failover, read replicas for read scaling, Performance Insights for query analysis, and easy vertical scaling (change instance class with a few clicks).\n\nRDS is not serverless (except Aurora Serverless) — you provision an instance class and pay per hour. For truly serverless relational databases, use Aurora Serverless v2, which scales capacity in fine-grained increments based on actual usage.`
      },
      {
        type: 'text', heading: 'Multi-AZ, Read Replicas, and Aurora',
        body: `**Multi-AZ Deployment:** RDS maintains a synchronous standby replica in a different AZ. All writes to the primary are synchronously replicated to the standby before acknowledging the write. If the primary fails (hardware failure, AZ outage), RDS automatically fails over to the standby — typically in 60-120 seconds. The DNS endpoint automatically points to the new primary. Your application reconnects and continues. Multi-AZ is for high availability, not performance — the standby does not serve read traffic.\n\n**Read Replicas:** Asynchronous replicas that serve read traffic. You can have up to 15 read replicas for Aurora, 5 for other engines. Read replicas reduce load on the primary for read-heavy workloads. They can be in the same region, a different region (cross-region read replicas), or promoted to a standalone database (for migrations or disaster recovery). Note: replication is asynchronous — there is a small lag between primary and replica.\n\n**Amazon Aurora:** AWS's cloud-native relational database, compatible with MySQL and PostgreSQL. Aurora is not just RDS with a different engine — it is a fundamentally different architecture. Aurora separates compute from storage: the storage layer is a distributed, fault-tolerant, self-healing system that automatically replicates data across 3 AZs in 6 copies. Aurora is up to 5x faster than MySQL and 3x faster than PostgreSQL on RDS.\n\nAurora features: up to 15 low-latency read replicas (vs 5 for MySQL), automatic storage scaling (up to 128TB), Aurora Global Database (cross-region replication with <1 second lag), Aurora Serverless v2 (auto-scales capacity), Aurora Multi-Master (multiple write nodes). For new applications requiring a relational database, Aurora is almost always the better choice over standard RDS.`
      },
      {
        type: 'animation', id: 'rds',
        heading: 'RDS Multi-AZ Failover + Read Replicas',
        caption: 'Watch automatic failover when the primary AZ goes down',
      },
      {
        type: 'text', heading: 'RDS Proxy, Performance Insights, and Parameter Groups',
        body: `**RDS Proxy:** A fully managed database proxy that sits between your application and RDS. It pools and shares database connections, reducing the overhead of opening new connections. Critical for Lambda functions — Lambda can create thousands of concurrent connections, overwhelming the database. RDS Proxy maintains a pool of connections to the database and multiplexes application connections through them. Also improves failover time (from 60-120 seconds to <30 seconds) because the proxy maintains connections during failover.\n\n**Performance Insights:** A database performance monitoring tool that shows database load over time, broken down by wait events, SQL queries, hosts, and users. It helps you identify the top SQL queries consuming the most database time. Use it to find slow queries, identify lock contention, and understand database bottlenecks. Available for all RDS engines and Aurora.\n\n**Parameter Groups:** Configuration settings for the database engine. Use parameter groups to tune database behavior: buffer pool size, connection limits, query cache settings, slow query log threshold. Create custom parameter groups for production — do not use the default parameter group, which cannot be modified.\n\n\`\`\`sql\n-- Example: check slow queries in MySQL RDS\n-- Enable slow query log in parameter group:\n-- slow_query_log = 1\n-- long_query_time = 1 (log queries taking >1 second)\n\n-- Then query the slow query log:\nSELECT * FROM mysql.slow_log\nORDER BY query_time DESC\nLIMIT 10;\n\`\`\``
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between Multi-AZ and Read Replicas in RDS?', a: 'Multi-AZ is for high availability — synchronous replication to a standby in another AZ, automatic failover if the primary fails. The standby does not serve traffic. Read Replicas are for read scaling — asynchronous replication to one or more replicas that serve read traffic. Read replicas can be in different regions. Multi-AZ protects against failures; read replicas improve read performance. You can use both simultaneously.' },
          { q: 'When would you use Aurora over standard RDS?', a: 'Use Aurora when: you need higher performance (5x MySQL, 3x PostgreSQL), you need more than 5 read replicas (Aurora supports 15), you need cross-region replication with <1 second lag (Aurora Global Database), you want serverless auto-scaling (Aurora Serverless v2), or you need faster failover. Aurora costs more than standard RDS but the performance and features justify it for most production workloads. Use standard RDS for Oracle or SQL Server (Aurora does not support them).' },
          { q: 'How do you handle database connection limits with Lambda?', a: 'Lambda can create thousands of concurrent connections, overwhelming RDS (which has a connection limit based on instance class). Use RDS Proxy — it pools connections between Lambda and RDS, multiplexing thousands of Lambda connections through a smaller pool of database connections. RDS Proxy also improves failover time and handles connection management. Always use RDS Proxy when Lambda connects to RDS.' },
          { q: 'What is RTO and RPO in the context of RDS?', a: 'RTO (Recovery Time Objective) is how long it takes to restore service after a failure. RDS Multi-AZ has RTO of 60-120 seconds (automatic failover). RPO (Recovery Point Objective) is how much data you can afford to lose. RDS Multi-AZ has RPO of ~0 (synchronous replication, no data loss). Automated backups have RPO of up to 5 minutes (transaction logs). For stricter RPO, use Aurora Global Database with <1 second replication lag.' },
        ]
      },
    ],
  },

  'aws-dynamodb': {
    slug: 'aws-dynamodb', title: 'Amazon DynamoDB', subtitle: 'NoSQL at scale — partition keys, GSI, DynamoDB Streams, DAX, and single-table design',
    duration: '35 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'What is DynamoDB and When to Use It',
        body: `Amazon DynamoDB is a fully managed, serverless NoSQL database that delivers single-digit millisecond performance at any scale. It is the database behind some of the world's largest applications — Amazon.com's shopping cart, Lyft's ride-sharing platform, Duolingo's learning app. DynamoDB handles trillions of requests per day and scales automatically without any capacity planning.\n\nDynamoDB is a key-value and document database. You store items (like JSON objects) and retrieve them by their primary key. Unlike relational databases, DynamoDB has no fixed schema — different items in the same table can have different attributes. This flexibility makes it ideal for rapidly evolving data models.\n\nUse DynamoDB when: you need single-digit millisecond latency at any scale, your access patterns are known and simple (get by key, query by partition), you need automatic scaling without capacity planning, you want a fully managed service with no operational overhead, or you are building event-driven or serverless applications. Do NOT use DynamoDB when: you need complex SQL queries with joins and aggregations, your access patterns are unknown or highly variable, or you need ACID transactions across multiple tables (use RDS/Aurora instead).`
      },
      {
        type: 'text', heading: 'Data Model: Partition Keys, Sort Keys, and Indexes',
        body: `**Primary Key:** Every DynamoDB table has a primary key that uniquely identifies each item. Two options:\n- **Simple primary key (partition key only):** A single attribute that uniquely identifies the item. Example: userId. DynamoDB hashes the partition key to determine which partition stores the item.\n- **Composite primary key (partition key + sort key):** Two attributes together uniquely identify the item. Example: userId (partition key) + timestamp (sort key). All items with the same partition key are stored together, sorted by sort key. This enables range queries: "get all orders for user X between date A and date B."\n\n**Choosing a good partition key is critical.** DynamoDB distributes data across partitions based on the partition key hash. A bad partition key creates "hot partitions" — one partition receives most of the traffic while others are idle. Good partition keys have high cardinality (many distinct values) and distribute access evenly. Bad: status (only a few values), date (all today's writes go to one partition). Good: userId, orderId, deviceId.\n\n**Global Secondary Indexes (GSI):** An index with a different partition key and optional sort key than the base table. Allows querying the table by attributes other than the primary key. Example: a table with userId as partition key can have a GSI with email as partition key, allowing lookup by email. GSIs have their own read/write capacity and are eventually consistent.\n\n**Local Secondary Indexes (LSI):** An index with the same partition key as the base table but a different sort key. Must be created at table creation time (cannot add later). Allows different sort orders within a partition. Shares capacity with the base table. Use when you need to query by the same partition key but sort by different attributes.`
      },
      {
        type: 'text', heading: 'Capacity Modes, DynamoDB Streams, and DAX',
        body: `**Capacity Modes:**\n- **On-Demand:** Pay per request. No capacity planning. Automatically scales to handle any traffic level. More expensive per request but no waste. Use for: unpredictable traffic, new applications, development/testing.\n- **Provisioned:** Specify read capacity units (RCUs) and write capacity units (WCUs). 1 RCU = 1 strongly consistent read of up to 4KB/second. 1 WCU = 1 write of up to 1KB/second. Cheaper than on-demand for predictable workloads. Use Auto Scaling to automatically adjust provisioned capacity.\n\n**DynamoDB Streams:** A time-ordered sequence of item-level changes in a DynamoDB table. When an item is created, updated, or deleted, a stream record is written. Streams are retained for 24 hours. Use cases: trigger Lambda on data changes (event-driven architecture), replicate data to other systems, audit trail, cross-region replication. Lambda polls the stream and processes records in batches.\n\n**DAX (DynamoDB Accelerator):** An in-memory cache for DynamoDB that reduces read latency from milliseconds to microseconds. DAX is a write-through cache — writes go to both DAX and DynamoDB. Reads are served from DAX cache if available. Use for: read-heavy workloads, applications requiring microsecond latency, reducing DynamoDB read costs. DAX is a cluster (1-10 nodes) deployed in your VPC.\n\n**Single-Table Design:** A DynamoDB best practice where you store multiple entity types in a single table, using the primary key to differentiate them. This avoids the need for joins (which DynamoDB does not support) and enables efficient access patterns. Example: a table with PK=USER#userId and SK=PROFILE stores user profiles; PK=USER#userId and SK=ORDER#orderId stores orders. This allows fetching a user and all their orders in a single query.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is a hot partition in DynamoDB and how do you avoid it?', a: 'A hot partition occurs when most requests go to a single partition because the partition key has low cardinality or skewed access patterns. DynamoDB limits each partition to 3,000 RCUs and 1,000 WCUs. If you exceed this, requests are throttled. Avoid hot partitions by: choosing high-cardinality partition keys (userId, orderId), adding a random suffix to partition keys for write-heavy scenarios (write sharding), using DAX for read-heavy hot keys, and using on-demand capacity mode which handles bursts automatically.' },
          { q: 'What is the difference between a GSI and an LSI?', a: 'GSI (Global Secondary Index): different partition key and optional sort key. Can be added after table creation. Eventually consistent reads only. Has its own capacity. Allows querying by any attribute. LSI (Local Secondary Index): same partition key as base table, different sort key. Must be created at table creation time. Supports strongly consistent reads. Shares capacity with base table. Limited to 10GB per partition key value. Use GSI for querying by different attributes; use LSI for different sort orders within the same partition.' },
          { q: 'When would you use DynamoDB vs RDS?', a: 'Use DynamoDB when: access patterns are known and simple (get by key, query by partition), you need automatic scaling without capacity planning, you need single-digit millisecond latency at any scale, or you are building serverless/event-driven applications. Use RDS when: you need complex queries with joins and aggregations, your data is highly relational, you need ACID transactions across multiple tables, your access patterns are unknown or ad-hoc, or your team is more comfortable with SQL.' },
          { q: 'What is DynamoDB single-table design?', a: 'Single-table design stores multiple entity types in one DynamoDB table, using composite primary keys to differentiate them. Instead of separate tables for Users, Orders, and Products, you have one table where PK=USER#123, SK=PROFILE stores user data; PK=USER#123, SK=ORDER#456 stores an order. This enables fetching related entities in a single query (all orders for a user), avoids joins, and optimizes for DynamoDB\'s access patterns. It requires careful upfront design of access patterns.' },
        ]
      },
    ],
  },

  'aws-elasticache': {
    slug: 'aws-elasticache', title: 'Amazon ElastiCache', subtitle: 'Redis vs Memcached, cluster mode, eviction policies, and caching patterns',
    duration: '25 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is ElastiCache and Why Caching Matters',
        body: `Amazon ElastiCache is a fully managed in-memory caching service that supports Redis and Memcached. Caching is one of the most effective ways to improve application performance and reduce database load. By storing frequently accessed data in memory (microsecond latency) instead of fetching it from a database (millisecond latency), you can dramatically improve response times and reduce costs.\n\nCommon caching use cases: database query results (cache expensive SQL queries), session storage (store user sessions in Redis instead of a database), rate limiting (use Redis atomic operations to count requests per user), leaderboards (Redis sorted sets), pub/sub messaging (Redis pub/sub), and distributed locks (Redis SETNX).\n\nElastiCache handles the operational overhead: hardware provisioning, software patching, monitoring, failure detection, and recovery. You focus on your caching strategy.`
      },
      {
        type: 'diagram', variant: 'comparison', heading: 'Redis vs Memcached',
        items: [
          { title: 'Redis', color: 'red', points: ['Rich data structures (strings, lists, sets, sorted sets, hashes)', 'Persistence (RDB snapshots, AOF logs)', 'Replication and automatic failover', 'Pub/Sub messaging', 'Lua scripting, transactions', '✅ Best for: sessions, leaderboards, pub/sub, complex caching'] },
          { title: 'Memcached', color: 'blue', points: ['Simple key-value only', 'No persistence (data lost on restart)', 'Multi-threaded (better CPU utilization)', 'Horizontal scaling (sharding)', 'Simpler architecture', '✅ Best for: simple caching, high-throughput key-value'] },
        ]
      },
      {
        type: 'text', heading: 'Redis Cluster Mode, Eviction, and Patterns',
        body: `**Redis Cluster Mode Disabled:** Single shard with one primary and up to 5 read replicas. All data fits in one node's memory. Automatic failover — if the primary fails, a replica is promoted. Use for: datasets that fit in a single node, read-heavy workloads.\n\n**Redis Cluster Mode Enabled:** Data is sharded across multiple shards (up to 500 shards). Each shard has a primary and replicas. Allows horizontal scaling beyond a single node's memory. Use for: large datasets, write-heavy workloads, very high throughput.\n\n**Eviction Policies:** When the cache is full, ElastiCache must evict (remove) some keys to make room for new ones. Common policies:\n- **allkeys-lru:** Evict the least recently used key from all keys. Good general-purpose policy.\n- **volatile-lru:** Evict the least recently used key from keys with an expiration set.\n- **allkeys-lfu:** Evict the least frequently used key (Redis 4.0+).\n- **noeviction:** Return an error when memory is full. Use when you cannot afford to lose any cached data.\n\n**Caching Patterns:**\n- **Cache-aside (lazy loading):** Application checks cache first. On miss, fetch from DB, store in cache, return. Simple, only caches what is actually needed. Risk: cache miss on first request (cold start).\n- **Write-through:** Write to cache and DB simultaneously on every write. Cache is always up-to-date. Risk: writes are slower, cache may contain data that is never read.\n- **Write-behind (write-back):** Write to cache immediately, write to DB asynchronously. Fastest writes. Risk: data loss if cache fails before DB write.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'When would you use Redis vs Memcached?', a: 'Use Redis when: you need data persistence (survive restarts), you need rich data structures (sorted sets for leaderboards, lists for queues), you need pub/sub messaging, you need replication and automatic failover, or you need atomic operations (INCR for rate limiting). Use Memcached when: you only need simple key-value caching, you need multi-threaded performance, or you need to scale horizontally with simple sharding. Redis is the right choice for most new applications.' },
          { q: 'What is cache invalidation and why is it hard?', a: 'Cache invalidation is the process of removing or updating cached data when the underlying data changes. It is hard because: you must ensure the cache and database are consistent, invalidating too aggressively reduces cache effectiveness, invalidating too conservatively serves stale data. Strategies: TTL (time-to-live) — let cached data expire automatically, event-driven invalidation — invalidate cache when data changes (requires coordination), versioned keys — include a version number in the cache key and increment it on updates.' },
          { q: 'How do you handle a Redis cache failure?', a: 'Design your application to degrade gracefully — if the cache is unavailable, fall back to the database. Use try/catch around cache operations and log the failure. Use ElastiCache Multi-AZ with automatic failover — if the primary fails, a replica is promoted in ~30 seconds. Use Redis Cluster Mode for higher availability. Monitor cache hit rate, memory usage, and evictions with CloudWatch. Set up alarms for high eviction rates (indicates cache is too small) and low hit rates (indicates caching strategy needs review).' },
        ]
      },
    ],
  },

  'aws-redshift': {
    slug: 'aws-redshift', title: 'Amazon Redshift', subtitle: 'Data warehouse, columnar storage, Redshift Spectrum, and when to use it',
    duration: '20 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is Redshift and When to Use It',
        body: `Amazon Redshift is a fully managed, petabyte-scale data warehouse service. It is designed for analytical queries (OLAP — Online Analytical Processing) on large datasets, not transactional workloads (OLTP — Online Transaction Processing). Redshift can query petabytes of structured data and return results in seconds using massively parallel processing (MPP).\n\nRedshift uses columnar storage — data is stored column by column rather than row by row. This is dramatically more efficient for analytical queries that aggregate specific columns across millions of rows. Instead of reading entire rows, Redshift reads only the columns needed for the query. Combined with compression (columnar data compresses much better than row data), Redshift can scan terabytes of data very quickly.\n\nUse Redshift for: business intelligence and reporting, data warehousing (consolidating data from multiple sources), complex analytical queries on large datasets, historical data analysis. Do NOT use Redshift for: transactional workloads (use RDS/Aurora), real-time queries (use DynamoDB/ElastiCache), small datasets (use RDS), or unstructured data (use S3 + Athena).`
      },
      {
        type: 'text', heading: 'Redshift Architecture and Spectrum',
        body: `**Redshift Architecture:** A Redshift cluster consists of a leader node (receives queries, coordinates execution) and compute nodes (store data, execute query fragments in parallel). Data is distributed across compute nodes using a distribution key. Choose the distribution key carefully — it determines how data is distributed and affects query performance.\n\nThe key to Redshift performance is the distribution style:\n- **KEY distribution:** Rows with the same distribution key value go to the same node. Use when you frequently join two large tables on the same column — co-locates the data and avoids network shuffling.\n- **EVEN distribution:** Rows are distributed round-robin across all nodes. Use when a table does not participate in joins or when there is no clear distribution key.\n- **ALL distribution:** A full copy of the table is stored on every node. Use for small dimension tables that are frequently joined with large fact tables.\n\n**Sort Keys** determine the order in which data is stored on disk. Redshift uses zone maps (min/max values per block) to skip blocks that do not match the query filter. Choose sort keys that match your most common WHERE clause columns (e.g., date columns for time-series queries).\n\n**Redshift Spectrum:** Extends Redshift queries to data stored in S3 without loading it into Redshift. You can join Redshift tables with S3 data in a single query. Use Spectrum for: querying historical data in S3 without the cost of loading it into Redshift, building a data lake architecture where hot data is in Redshift and cold data is in S3.\n\n**Redshift Serverless:** Automatically scales compute capacity based on workload. No cluster management. Pay per query. Use for: variable or unpredictable query workloads, development/testing, infrequent analytics.\n\n\`\`\`sql\n-- Example: Redshift analytical query\n-- Aggregating 500M rows across 3 years of sales data\nSELECT\n  DATE_TRUNC('month', order_date) AS month,\n  product_category,\n  SUM(revenue)                    AS total_revenue,\n  COUNT(DISTINCT customer_id)     AS unique_customers,\n  AVG(order_value)                AS avg_order_value\nFROM sales_fact\nWHERE order_date >= '2022-01-01'\nGROUP BY 1, 2\nORDER BY 1 DESC, 3 DESC;\n-- Redshift executes this in parallel across all compute nodes\n-- Columnar storage means only 4 columns are read, not all 50+\n\`\`\``
      },
      {
        type: 'diagram', variant: 'comparison', heading: 'When to Use: Redshift vs RDS vs DynamoDB vs Athena',
        caption: 'Choosing the right database is one of the most common system design interview questions',
        items: [
          {
            title: 'Amazon Redshift',
            color: 'purple',
            points: [
              '🏭 Use case: Data warehouse, BI, analytics',
              '📊 Query type: OLAP — complex aggregations',
              '📦 Data size: Petabytes of structured data',
              '⚡ Latency: Seconds to minutes per query',
              '💰 Cost: Per node-hour (or serverless per query)',
              '✅ Best for: Monthly sales reports, dashboards, joining data from multiple sources',
              '❌ Not for: Real-time lookups, transactional writes',
            ]
          },
          {
            title: 'Amazon RDS / Aurora',
            color: 'blue',
            points: [
              '🏦 Use case: Transactional apps, OLTP',
              '📊 Query type: Row-based, complex SQL joins',
              '📦 Data size: GBs to low TBs',
              '⚡ Latency: Milliseconds per query',
              '💰 Cost: Per instance-hour',
              '✅ Best for: E-commerce orders, user accounts, banking transactions',
              '❌ Not for: Petabyte analytics, massive write throughput',
            ]
          },
          {
            title: 'Amazon DynamoDB',
            color: 'green',
            points: [
              '🚀 Use case: High-throughput key-value / document',
              '📊 Query type: Key-based lookups, simple filters',
              '📦 Data size: Any size (auto-scales)',
              '⚡ Latency: Single-digit milliseconds',
              '💰 Cost: Per request or provisioned capacity',
              '✅ Best for: Gaming leaderboards, session stores, IoT, shopping carts',
              '❌ Not for: Complex SQL joins, ad-hoc analytics',
            ]
          },
          {
            title: 'Amazon Athena',
            color: 'orange',
            points: [
              '🔍 Use case: Ad-hoc queries on S3 data lake',
              '📊 Query type: SQL on S3 (Parquet, CSV, JSON)',
              '📦 Data size: Petabytes in S3',
              '⚡ Latency: Seconds to minutes',
              '💰 Cost: $5 per TB scanned (use Parquet to reduce)',
              '✅ Best for: Log analysis, one-off queries, data exploration without loading data',
              '❌ Not for: Frequent queries (gets expensive), real-time data',
            ]
          },
        ]
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between OLTP and OLAP?', a: 'OLTP (Online Transaction Processing) handles many small, fast transactions — inserts, updates, deletes. Optimized for row-based access. Examples: e-commerce orders, banking transactions. Use RDS/Aurora. OLAP (Online Analytical Processing) handles complex queries that aggregate large amounts of data — sum, average, count across millions of rows. Optimized for column-based access. Examples: sales reports, business intelligence. Use Redshift.' },
          { q: 'Why is columnar storage better for analytics?', a: 'Analytical queries typically aggregate specific columns across many rows (e.g., SUM(revenue) WHERE date > 2024-01-01). With row storage, you read entire rows even though you only need one column — wasteful. With columnar storage, you read only the columns needed. Additionally, columnar data compresses much better (similar values in a column compress well), reducing I/O. Redshift can scan terabytes of data quickly because it reads only the relevant columns and they are highly compressed.' },
          { q: 'What is Redshift Spectrum and when would you use it?', a: 'Redshift Spectrum allows querying data stored in S3 directly from Redshift without loading it into the cluster. Use it for: querying historical data that is too large or too old to keep in Redshift (store in S3 Glacier, query with Spectrum), building a data lake where you join Redshift tables with S3 data, reducing Redshift storage costs by keeping cold data in S3. Spectrum queries are slower than native Redshift queries but much cheaper for infrequently accessed data.' },
        ]
      },
    ],
  },


  // ── NETWORKING ────────────────────────────────────────────────────────────
  'aws-vpc': {
    slug: 'aws-vpc', title: 'Amazon VPC', subtitle: 'Virtual Private Cloud — subnets, routing, security groups, NAT, and VPC peering',
    duration: '40 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'What is a VPC and Why It Matters',
        body: `Amazon VPC (Virtual Private Cloud) is your private, isolated network within AWS. Every resource you launch — EC2 instances, RDS databases, Lambda functions in a VPC — lives inside a VPC. Understanding VPC is critical for designing secure, well-architected AWS systems. Misconfigured VPCs are one of the most common sources of security incidents and connectivity issues.\n\nA VPC is defined by a CIDR block — a range of IP addresses. For example, 10.0.0.0/16 gives you 65,536 IP addresses (10.0.0.0 to 10.0.255.255). Within the VPC, you create subnets — smaller IP ranges in specific AZs. Resources in the same VPC can communicate with each other by default. Resources in different VPCs cannot communicate unless you explicitly configure VPC peering or Transit Gateway.\n\nEvery AWS account comes with a default VPC in each region. The default VPC is convenient for getting started but should not be used for production — it has permissive settings and all subnets are public. Create custom VPCs for production workloads with proper network segmentation.`
      },
      {
        type: 'text', heading: 'Subnets, Route Tables, and Internet Gateway',
        body: `**Subnets** are subdivisions of your VPC CIDR block, each associated with a specific AZ. A subnet is either public (has a route to the Internet Gateway) or private (no direct internet access).\n\n**Public subnets:** Resources have public IP addresses and can communicate directly with the internet. Use for: load balancers, NAT Gateways, bastion hosts. Do NOT put databases or application servers in public subnets.\n\n**Private subnets:** Resources have only private IP addresses. No direct internet access. Use for: application servers, databases, internal services. Private resources can access the internet through a NAT Gateway (for outbound traffic only).\n\n**Route Tables:** Each subnet is associated with a route table that determines where traffic is directed. A public subnet's route table has a route: 0.0.0.0/0 → Internet Gateway. A private subnet's route table has a route: 0.0.0.0/0 → NAT Gateway.\n\n**Internet Gateway (IGW):** Allows resources in public subnets to communicate with the internet. Attach one IGW per VPC. Highly available and scalable — no bandwidth limits.\n\n**NAT Gateway:** Allows resources in private subnets to initiate outbound connections to the internet (for software updates, API calls) without allowing inbound connections from the internet. Deploy one NAT Gateway per AZ for high availability. NAT Gateways cost money — $0.045/hour + $0.045/GB processed. For cost optimization, use VPC endpoints for AWS services (S3, DynamoDB) to avoid NAT Gateway charges.\n\n\`\`\`\nTypical 3-tier VPC architecture:\n\nPublic Subnet (10.0.1.0/24)     → Internet Gateway → Internet\n  - Application Load Balancer\n  - NAT Gateway\n\nPrivate Subnet (10.0.2.0/24)    → NAT Gateway → Internet (outbound only)\n  - EC2 App Servers\n  - ECS Tasks\n\nPrivate Subnet (10.0.3.0/24)    → No internet access\n  - RDS Database\n  - ElastiCache\n\`\`\``
      },
      {
        type: 'text', heading: 'Security Groups vs NACLs, VPC Peering, and Endpoints',
        body: `**Security Groups** are stateful virtual firewalls at the instance level. Stateful means: if you allow inbound traffic on port 80, the response traffic is automatically allowed outbound. Rules are allow-only (no explicit deny). You can reference other security groups in rules. Security groups are the primary network security mechanism for EC2, RDS, Lambda, and other resources.\n\n**Network ACLs (NACLs)** are stateless firewalls at the subnet level. Stateless means: you must explicitly allow both inbound and outbound traffic. Rules are evaluated in order (lowest number first). NACLs support both allow and deny rules. Use NACLs for: blocking specific IP addresses (DDoS mitigation), adding an extra layer of security at the subnet boundary. For most use cases, security groups are sufficient.\n\n**VPC Peering:** Connect two VPCs so resources can communicate using private IP addresses. Works across accounts and regions. Not transitive — if VPC A peers with VPC B and VPC B peers with VPC C, A cannot communicate with C through B. Use for: connecting a few VPCs. For many VPCs, use Transit Gateway.\n\n**Transit Gateway:** A hub that connects multiple VPCs and on-premises networks. Transitive routing — all connected VPCs can communicate with each other through the Transit Gateway. Simplifies network architecture for large organizations with many VPCs.\n\n**VPC Endpoints:** Private connections from your VPC to AWS services without going through the internet or NAT Gateway. Two types: Interface Endpoints (powered by PrivateLink, for most AWS services) and Gateway Endpoints (for S3 and DynamoDB, free). Use VPC endpoints to: improve security (traffic stays on AWS network), reduce NAT Gateway costs, improve performance.`
      },
      {
        type: 'diagram', variant: 'layers', heading: 'VPC Security Layers',
        caption: 'Defense in depth — multiple security layers protect your resources',
        layers: [
          { label: 'AWS Shield / WAF', detail: 'DDoS protection, web application firewall', color: 'red', highlight: true },
          { label: 'Internet Gateway / NAT Gateway', detail: 'Controls internet access', color: 'orange', highlight: true },
          { label: 'Network ACL (Subnet level)', detail: 'Stateless, allow/deny rules, subnet boundary', color: 'yellow', highlight: true },
          { label: 'Security Group (Instance level)', detail: 'Stateful, allow-only rules, instance boundary', color: 'green', highlight: true },
          { label: 'IAM Policies', detail: 'API-level access control', color: 'blue', highlight: true },
          { label: 'Application-level auth', detail: 'JWT, OAuth, API keys', color: 'purple', highlight: true },
        ]
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between a security group and a NACL?', a: 'Security groups are stateful (response traffic automatically allowed), operate at the instance level, support allow rules only, and are evaluated as a whole (all rules checked). NACLs are stateless (must explicitly allow both directions), operate at the subnet level, support both allow and deny rules, and are evaluated in order (lowest rule number first). Use security groups as your primary security mechanism. Use NACLs for subnet-level controls like blocking specific IP ranges.' },
          { q: 'What is the difference between VPC Peering and Transit Gateway?', a: 'VPC Peering connects two VPCs directly — simple, low cost, but not transitive (A-B and B-C does not mean A-C). Transit Gateway is a hub that connects multiple VPCs and on-premises networks — transitive routing, centralized management, but more expensive. Use VPC Peering for connecting a few VPCs. Use Transit Gateway for large organizations with many VPCs that need full mesh connectivity.' },
          { q: 'Why would you use a VPC endpoint instead of a NAT Gateway?', a: 'VPC endpoints provide private connectivity to AWS services (S3, DynamoDB, etc.) without going through the internet or NAT Gateway. Benefits: improved security (traffic stays on AWS network, never touches the internet), reduced cost (no NAT Gateway data processing charges — $0.045/GB), improved performance (lower latency). Gateway endpoints for S3 and DynamoDB are free. Interface endpoints for other services have an hourly charge but save NAT Gateway costs for high-volume traffic.' },
          { q: 'How do you design a secure VPC for a 3-tier web application?', a: 'Public subnet: ALB (receives internet traffic), NAT Gateway (outbound internet for private subnets). Private subnet (app tier): EC2/ECS instances, security group allows traffic only from ALB security group. Private subnet (data tier): RDS/ElastiCache, security group allows traffic only from app tier security group. Use VPC endpoints for S3 and DynamoDB. Enable VPC Flow Logs for network traffic monitoring. Use AWS WAF on the ALB for application-layer protection.' },
        ]
      },
    ],
  },

  'aws-load-balancers': {
    slug: 'aws-load-balancers', title: 'Load Balancers', subtitle: 'ALB vs NLB, target groups, health checks, SSL termination, and sticky sessions',
    duration: '25 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'Why Load Balancers Are Essential',
        body: `A load balancer distributes incoming traffic across multiple backend instances, ensuring no single instance is overwhelmed. Load balancers are fundamental to high availability — they detect unhealthy instances and stop sending traffic to them, automatically routing to healthy ones. They also enable zero-downtime deployments by gradually shifting traffic from old instances to new ones.\n\nAWS offers three types of load balancers under the Elastic Load Balancing (ELB) service: Application Load Balancer (ALB), Network Load Balancer (NLB), and Classic Load Balancer (CLB, legacy). Choose based on your protocol, performance requirements, and routing needs.`
      },
      {
        type: 'animation', id: 'load-balancer',
        heading: 'How ALB Distributes Traffic',
        caption: 'Watch requests fan out to healthy EC2 instances in real time',
      },
      {
        type: 'diagram', variant: 'comparison', heading: 'ALB vs NLB vs CLB',
        items: [
          { title: 'Application Load Balancer (ALB)', color: 'blue', points: ['Layer 7 (HTTP/HTTPS/WebSocket)', 'Content-based routing (path, host, headers)', 'Native Lambda integration', 'SSL/TLS termination', 'Sticky sessions (cookie-based)', '✅ Best for: web apps, microservices, REST APIs'] },
          { title: 'Network Load Balancer (NLB)', color: 'green', points: ['Layer 4 (TCP/UDP/TLS)', 'Millions of requests/second, ultra-low latency', 'Static IP addresses per AZ', 'Preserves source IP', 'TLS termination', '✅ Best for: gaming, IoT, real-time, TCP/UDP apps'] },
          { title: 'Classic Load Balancer (CLB)', color: 'red', points: ['Legacy, Layer 4 and 7', 'Limited features', 'No content-based routing', 'Being phased out', 'Use ALB or NLB instead', '❌ Avoid for new applications'] },
        ]
      },
      {
        type: 'text', heading: 'Target Groups, Health Checks, and SSL Termination',
        body: `**Target Groups:** A logical grouping of targets (EC2 instances, ECS tasks, Lambda functions, IP addresses) that receive traffic from the load balancer. Each target group has a health check configuration. ALB rules route traffic to specific target groups based on conditions (path, host header, query string, HTTP method).\n\n**Health Checks:** The load balancer periodically sends requests to each target and marks it healthy or unhealthy based on the response. Configure: protocol (HTTP/HTTPS/TCP), path (/health), port, healthy threshold (consecutive successes to mark healthy), unhealthy threshold (consecutive failures to mark unhealthy), timeout, and interval. A good health check endpoint checks that the application is actually working — not just that the server is running. Check database connectivity, cache connectivity, and critical dependencies.\n\n**SSL/TLS Termination:** The ALB handles SSL/TLS decryption, so your backend instances receive plain HTTP. This offloads CPU-intensive cryptographic operations from your application servers. Use AWS Certificate Manager (ACM) to provision free SSL certificates. Configure HTTPS listeners on the ALB and redirect HTTP to HTTPS. For end-to-end encryption, configure HTTPS on the target group as well.\n\n**Sticky Sessions:** Route all requests from a specific client to the same target. ALB uses a cookie (AWSALB) to track sessions. Use for: stateful applications that store session data locally (not recommended — use ElastiCache for sessions instead). Sticky sessions reduce the effectiveness of load balancing and complicate deployments.\n\n**ALB Routing Rules:**\n\`\`\`\nHost-based routing:\n  api.example.com → API target group\n  www.example.com → Web target group\n\nPath-based routing:\n  /api/* → API target group\n  /static/* → S3 bucket (via Lambda)\n  /* → Web target group\n\nHeader-based routing:\n  X-Version: v2 → New version target group\n  (default) → Stable version target group\n\`\`\``
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'When would you use NLB over ALB?', a: 'Use NLB when: you need ultra-low latency (microseconds vs milliseconds for ALB), you need to handle millions of requests per second, you need static IP addresses (NLB provides one per AZ), you need to preserve the client source IP address, you are using TCP/UDP protocols (not HTTP), or you need to handle non-HTTP traffic (gaming, IoT, financial trading). Use ALB for all HTTP/HTTPS web applications — it has richer routing features.' },
          { q: 'How does an ALB handle a backend instance failure?', a: 'The ALB continuously sends health check requests to all registered targets. When a target fails the health check (exceeds the unhealthy threshold), the ALB marks it unhealthy and stops routing traffic to it. Existing connections to the unhealthy target are not immediately dropped — the ALB drains them (connection draining/deregistration delay, default 300 seconds). New requests are routed only to healthy targets. When the target recovers and passes health checks, it is marked healthy and receives traffic again.' },
          { q: 'What is connection draining and why is it important?', a: 'Connection draining (deregistration delay) is the time the ALB waits for in-flight requests to complete before removing a target from service. When you deregister a target (during a deployment or scale-in), the ALB stops sending new requests to it but allows existing requests to complete within the draining period (default 300 seconds, configurable 0-3600). This ensures zero-downtime deployments — users do not get errors because their request was cut off mid-flight.' },
        ]
      },
    ],
  },

  'aws-cloudfront': {
    slug: 'aws-cloudfront', title: 'Amazon CloudFront', subtitle: 'CDN, edge caching, origins, cache behaviors, and Lambda@Edge',
    duration: '25 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is CloudFront and How CDNs Work',
        body: `Amazon CloudFront is AWS's Content Delivery Network (CDN). It caches your content at 600+ edge locations worldwide, so users receive content from the nearest edge location rather than traveling all the way to your origin server. This dramatically reduces latency — a user in Tokyo accessing content cached at a Tokyo edge location gets it in <10ms instead of 200ms from a US-East origin.\n\nCloudFront works by caching responses from your origin (S3 bucket, ALB, EC2, API Gateway, or any HTTP server) at edge locations. When a user requests content, CloudFront checks if it has a cached copy at the nearest edge location. If yes (cache hit), it serves it immediately. If no (cache miss), it fetches from the origin, caches it, and serves it. Subsequent requests for the same content are served from cache.\n\nCloudFront is not just for static content. It can cache API responses, accelerate dynamic content (using the AWS backbone network instead of the public internet), provide DDoS protection (AWS Shield Standard is included), and run code at the edge (Lambda@Edge, CloudFront Functions).`
      },
      {
        type: 'animation', id: 'cdn',
        heading: 'CloudFront Cache Hit vs Cache Miss',
        caption: 'See the difference between a first request (cache miss) and a repeat request (cache hit)',
      },
      {
        type: 'text', heading: 'Origins, Cache Behaviors, and Signed URLs',
        body: `**Origins:** The source of your content. CloudFront supports: S3 buckets (static websites, file downloads), ALB or EC2 (dynamic web applications), API Gateway (REST APIs), and custom HTTP origins (any web server). You can configure multiple origins and route different requests to different origins using cache behaviors.\n\n**Cache Behaviors:** Rules that determine how CloudFront handles requests based on the URL path. Each behavior specifies: which origin to use, cache TTL (how long to cache), allowed HTTP methods, whether to forward cookies/headers/query strings, and whether to require HTTPS. Example: /static/* → S3 origin, cache for 1 year; /api/* → ALB origin, do not cache.\n\n**Cache TTL:** Control how long CloudFront caches content. Set via Cache-Control headers from your origin (max-age, s-maxage) or CloudFront cache policies. For static assets with versioned filenames (app.v2.js), use long TTLs (1 year). For dynamic content, use short TTLs or no caching. Use cache invalidation to immediately remove content from all edge locations (costs $0.005 per path after the first 1,000/month).\n\n**Signed URLs and Signed Cookies:** Restrict access to CloudFront content to authorized users. Signed URLs grant access to a single file for a limited time. Signed Cookies grant access to multiple files. Use for: paid content, private downloads, time-limited access. Generate signed URLs/cookies using your CloudFront key pair.\n\n**Lambda@Edge:** Run Lambda functions at CloudFront edge locations. Triggers: Viewer Request (before CloudFront checks cache), Origin Request (before CloudFront forwards to origin), Origin Response (after CloudFront receives from origin), Viewer Response (before CloudFront returns to viewer). Use for: A/B testing, authentication at the edge, URL rewrites, request/response manipulation, personalization.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'How does CloudFront improve performance?', a: 'CloudFront caches content at 600+ edge locations worldwide, reducing latency by serving content from the nearest edge location. It uses the AWS global backbone network (faster and more reliable than the public internet) to fetch content from origins. It reduces load on origin servers by serving cached content. It supports HTTP/2 and HTTP/3 (QUIC) for faster connections. For dynamic content, it still improves performance by routing through the AWS backbone instead of the public internet.' },
          { q: 'What is the difference between CloudFront and a load balancer?', a: 'CloudFront is a CDN — it caches content at edge locations globally and reduces latency for end users. It operates at the edge, close to users. A load balancer distributes traffic across backend instances within a region. They serve different purposes and are often used together: CloudFront in front of an ALB. CloudFront handles caching, DDoS protection, and global distribution. The ALB handles routing to healthy backend instances.' },
          { q: 'How do you invalidate CloudFront cache?', a: 'Create an invalidation request specifying the paths to invalidate (e.g., /images/*, /index.html). CloudFront removes the cached content from all edge locations within ~10 minutes. The first 1,000 invalidation paths per month are free; additional paths cost $0.005 each. For frequent updates, use versioned filenames (app.v2.js) instead of invalidations — update the filename and the old version expires naturally. This is more efficient and avoids invalidation costs.' },
        ]
      },
    ],
  },

  'aws-route53': {
    slug: 'aws-route53', title: 'Amazon Route 53', subtitle: 'DNS, record types, routing policies, health checks, and failover',
    duration: '25 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is Route 53',
        body: `Amazon Route 53 is AWS's highly available and scalable DNS (Domain Name System) service. It translates human-readable domain names (www.example.com) into IP addresses that computers use to connect. Route 53 is named after port 53, the standard DNS port.\n\nRoute 53 does more than basic DNS. It provides: domain registration, DNS routing with multiple routing policies, health checks to monitor endpoint availability, and traffic flow for complex routing configurations. Route 53 is designed for 100% availability — it is one of the few AWS services with a 100% SLA.\n\nRoute 53 answers DNS queries from the nearest edge location (600+ globally), providing low-latency DNS resolution. DNS responses are cached by resolvers and clients based on the TTL (Time to Live) you configure. Lower TTL = faster propagation of changes but more DNS queries (higher cost). Higher TTL = slower propagation but fewer queries.`
      },
      {
        type: 'animation', id: 'route53',
        heading: 'Route 53 Routing Policies — Interactive',
        caption: 'Click each policy to see how Route 53 routes traffic differently',
      },
      {
        type: 'text', heading: 'Record Types and Routing Policies',
        body: `**Common DNS Record Types:**\n- **A record:** Maps a hostname to an IPv4 address. example.com → 1.2.3.4\n- **AAAA record:** Maps a hostname to an IPv6 address.\n- **CNAME record:** Maps a hostname to another hostname. www.example.com → example.com. Cannot be used for the zone apex (root domain).\n- **Alias record:** AWS-specific. Maps a hostname to an AWS resource (ALB, CloudFront, S3 website). Works for the zone apex. Free (no charge for alias queries to AWS resources). Prefer alias over CNAME for AWS resources.\n- **MX record:** Mail exchange — specifies mail servers for the domain.\n- **TXT record:** Text data — used for domain verification, SPF records, DKIM.\n\n**Routing Policies:**\n\n**Simple:** Route to a single resource. No health checks. Use for single-server setups.\n\n**Weighted:** Route a percentage of traffic to different resources. Example: 90% to stable version, 10% to new version (canary deployment). Use for A/B testing, gradual migrations.\n\n**Latency-based:** Route to the region with the lowest latency for the user. AWS measures latency from the user's location to each region. Use for global applications where you want users to hit the nearest region.\n\n**Failover:** Route to a primary resource; if it fails health checks, route to a secondary (standby). Use for active-passive disaster recovery.\n\n**Geolocation:** Route based on the user's geographic location (country, continent). Use for: serving localized content, compliance (keep EU users' data in EU), blocking traffic from specific countries.\n\n**Geoproximity:** Route based on geographic location with a bias — you can shift traffic toward or away from specific regions. Requires Route 53 Traffic Flow.\n\n**Multi-value answer:** Return multiple IP addresses for a hostname, with health checks. Clients randomly select one. Not a replacement for a load balancer but provides basic client-side load balancing.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between a CNAME and an Alias record?', a: 'CNAME maps a hostname to another hostname. It cannot be used for the zone apex (root domain — example.com). It incurs DNS query charges. Alias is AWS-specific and maps a hostname to an AWS resource (ALB, CloudFront, S3). It can be used for the zone apex. Queries to AWS resources are free. Alias records also automatically update when the underlying resource\'s IP changes. Always use Alias records for AWS resources.' },
          { q: 'How does Route 53 health checking work?', a: 'Route 53 health checkers (located in multiple AWS regions) periodically send requests to your endpoint (HTTP, HTTPS, or TCP). If the endpoint fails to respond or returns an error, the health check fails. After a configurable number of consecutive failures, the endpoint is marked unhealthy. Route 53 stops routing traffic to unhealthy endpoints (in failover, weighted, and latency routing policies). You can also create calculated health checks that combine multiple health checks.' },
          { q: 'How would you implement DNS failover for a multi-region application?', a: 'Create a primary record (failover routing, primary) pointing to your primary region\'s ALB with a health check. Create a secondary record (failover routing, secondary) pointing to your DR region\'s ALB. When the primary health check fails, Route 53 automatically routes traffic to the secondary. TTL should be low (60 seconds) for fast failover. Note: DNS failover is not instant — clients cache DNS responses for the TTL duration. For faster failover, use Route 53 Application Recovery Controller.' },
        ]
      },
    ],
  },


  // ── DEVOPS & MONITORING ───────────────────────────────────────────────────
  'aws-cloudwatch': {
    slug: 'aws-cloudwatch', title: 'Amazon CloudWatch', subtitle: 'Metrics, logs, alarms, dashboards, Insights, and X-Ray integration',
    duration: '30 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is CloudWatch and Why Observability Matters',
        body: `Amazon CloudWatch is AWS's observability service — it collects metrics, logs, and traces from your AWS resources and applications, and provides tools to visualize, analyze, and alert on them. Observability is the ability to understand what is happening inside your system from its external outputs. Without observability, you are flying blind in production.\n\nCloudWatch is the central hub for monitoring on AWS. Every AWS service publishes metrics to CloudWatch automatically — EC2 CPU utilization, RDS database connections, Lambda invocation count, ALB request count. You can also publish custom metrics from your application code. CloudWatch Logs collects log data from EC2, Lambda, ECS, and other services. CloudWatch Alarms trigger notifications or automated actions when metrics cross thresholds.\n\nFor SRE and DevOps interviews, CloudWatch is one of the most important services to know deeply. When asked "how do you debug a production issue on AWS?", your answer should start with CloudWatch.`
      },
      {
        type: 'text', heading: 'Metrics, Alarms, and Dashboards',
        body: `**Metrics:** Numerical data points over time. CloudWatch stores metrics for 15 months. Standard resolution is 1-minute granularity; high-resolution metrics can be 1-second. Key metrics to monitor:\n- EC2: CPUUtilization, NetworkIn/Out, DiskReadOps/WriteOps, StatusCheckFailed\n- RDS: CPUUtilization, DatabaseConnections, FreeStorageSpace, ReadLatency, WriteLatency\n- Lambda: Invocations, Errors, Duration, Throttles, ConcurrentExecutions\n- ALB: RequestCount, TargetResponseTime, HTTPCode_Target_5XX_Count, HealthyHostCount\n- SQS: ApproximateNumberOfMessagesVisible, ApproximateAgeOfOldestMessage\n\n**Custom Metrics:** Publish application-level metrics from your code:\n\`\`\`python\nimport boto3\ncloudwatch = boto3.client('cloudwatch')\n\ncloudwatch.put_metric_data(\n    Namespace='MyApp',\n    MetricData=[{\n        'MetricName': 'OrdersProcessed',\n        'Value': 42,\n        'Unit': 'Count',\n        'Dimensions': [{'Name': 'Environment', 'Value': 'production'}]\n    }]\n)\n\`\`\`\n\n**Alarms:** Monitor a metric and trigger actions when it crosses a threshold. Actions: send SNS notification (email, SMS, PagerDuty), trigger Auto Scaling, stop/terminate/reboot EC2 instance. Alarm states: OK (metric within threshold), ALARM (metric outside threshold), INSUFFICIENT_DATA (not enough data). Use composite alarms to combine multiple alarms with AND/OR logic.\n\n**Dashboards:** Visualize metrics from multiple services in a single view. Create dashboards for: application health (request rate, error rate, latency), infrastructure health (CPU, memory, disk), business metrics (orders per minute, revenue). Share dashboards with stakeholders.`
      },
      {
        type: 'text', heading: 'CloudWatch Logs, Insights, and X-Ray',
        body: `**CloudWatch Logs:** Centralized log storage and analysis. Log groups contain log streams (one per source). Retention policies control how long logs are kept (1 day to 10 years, or never expire). Use metric filters to extract metrics from log data (e.g., count ERROR occurrences and create an alarm).\n\n**CloudWatch Logs Insights:** Interactive query language for analyzing log data. Run queries across multiple log groups. Find errors, analyze latency, identify patterns:\n\n\`\`\`\n# Find the top 10 slowest Lambda invocations\nfilter @type = "REPORT"\n| stats max(@duration) as maxDuration by @requestId\n| sort maxDuration desc\n| limit 10\n\n# Count errors by type in the last hour\nfilter @message like /ERROR/\n| stats count(*) as errorCount by errorType\n| sort errorCount desc\n\`\`\`\n\n**AWS X-Ray:** Distributed tracing service. Traces requests as they flow through your application — from the user's browser through API Gateway, Lambda, DynamoDB, and external APIs. X-Ray shows you: end-to-end latency, which service is the bottleneck, error rates per service, and service maps (visual representation of your architecture). Instrument your code with the X-Ray SDK to add custom segments and annotations.\n\n**Container Insights:** Enhanced monitoring for ECS and EKS. Collects CPU, memory, disk, and network metrics at the container, task, and cluster level. Provides pre-built dashboards for container workloads.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'How would you debug a Lambda function that is failing in production?', a: 'Check CloudWatch Logs for the Lambda function — look for ERROR messages, stack traces, and timeout messages. Use CloudWatch Logs Insights to query across multiple invocations. Check X-Ray traces to see where time is being spent (is it slow DynamoDB queries? External API calls?). Check Lambda metrics: Errors, Duration, Throttles, ConcurrentExecutions. If the function is timing out, check if it is waiting on a VPC resource (NAT Gateway, RDS). Set up CloudWatch alarms on Lambda Errors and Duration metrics.' },
          { q: 'What is the difference between CloudWatch and X-Ray?', a: 'CloudWatch collects metrics (numerical time-series data) and logs (text data) from AWS services and your application. It is for monitoring infrastructure health and application behavior over time. X-Ray provides distributed tracing — it tracks individual requests as they flow through your distributed system, showing you the path and latency at each step. Use CloudWatch for: "is my system healthy?" Use X-Ray for: "why is this specific request slow?" They complement each other.' },
          { q: 'How do you set up alerting for a production application on AWS?', a: 'Create CloudWatch alarms for key metrics: high error rate (Lambda Errors, ALB 5XX), high latency (ALB TargetResponseTime, Lambda Duration), resource exhaustion (EC2 CPU, RDS storage, SQS queue depth). Configure alarms to send to an SNS topic. Subscribe PagerDuty, OpsGenie, or email to the SNS topic. Use composite alarms to reduce alert noise (only alert if both error rate AND latency are high). Create a CloudWatch dashboard for at-a-glance health status.' },
          { q: 'What is CloudWatch Logs Insights and when would you use it?', a: 'CloudWatch Logs Insights is an interactive query service for analyzing log data. Use it when: you need to find errors across multiple Lambda invocations, analyze API latency patterns, count specific log events, or correlate events across services. It supports a SQL-like query language with filter, stats, sort, and limit commands. It can query multiple log groups simultaneously. For real-time log tailing, use the CloudWatch console or aws logs tail CLI command.' },
        ]
      },
    ],
  },

  'aws-codepipeline': {
    slug: 'aws-codepipeline', title: 'CI/CD with CodePipeline', subtitle: 'CodeCommit, CodeBuild, CodeDeploy, blue/green and canary deployments',
    duration: '30 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'AWS CI/CD Services Overview',
        body: `AWS provides a suite of developer tools for building CI/CD pipelines: CodeCommit (Git repository), CodeBuild (build and test), CodeDeploy (deployment automation), and CodePipeline (orchestration). Together, they enable fully automated pipelines from code commit to production deployment.\n\nCodePipeline is the orchestration layer — it defines the stages of your pipeline (source, build, test, deploy) and coordinates the other services. Each stage has one or more actions. Actions can be sequential or parallel. The pipeline triggers automatically when code is pushed to the source repository.\n\nFor most teams, CodePipeline integrates with GitHub or GitLab (not just CodeCommit) and uses CodeBuild for building Docker images and running tests. CodeDeploy handles the actual deployment to EC2, ECS, Lambda, or on-premises servers.`
      },
      {
        type: 'animation', id: 'cicd',
        heading: 'CI/CD Pipeline — Code to Production',
        caption: 'Watch a git push trigger each stage: source → build → test → staging → production',
      },
      {
        type: 'text', heading: 'Blue/Green and Canary Deployments',
        body: `**Blue/Green Deployment:** Maintain two identical environments — blue (current production) and green (new version). Deploy the new version to green, run tests, then switch traffic from blue to green. If something goes wrong, switch back to blue instantly. Zero downtime, instant rollback.\n\nWith ECS and CodeDeploy: CodeDeploy creates a new task set (green) alongside the existing one (blue). The ALB shifts traffic from blue to green. After a configurable wait time (for monitoring), CodeDeploy terminates the blue task set. If alarms trigger during the wait, CodeDeploy automatically rolls back.\n\n**Canary Deployment:** Gradually shift traffic to the new version. Example: 10% of traffic to new version for 10 minutes, then 100% if no alarms trigger. This limits the blast radius of a bad deployment — only 10% of users are affected if the new version has issues.\n\nCodeDeploy supports canary deployments for Lambda (shift a percentage of traffic to the new version using Lambda aliases and weighted routing) and ECS (shift traffic gradually using ALB weighted target groups).\n\n\`\`\`yaml\n# CodeDeploy appspec.yml for ECS blue/green\nversion: 0.0\nResources:\n  - TargetService:\n      Type: AWS::ECS::Service\n      Properties:\n        TaskDefinition: <TASK_DEFINITION>\n        LoadBalancerInfo:\n          ContainerName: "web"\n          ContainerPort: 3000\nHooks:\n  - BeforeAllowTraffic: "LambdaFunctionToValidateBeforeTrafficShift"\n  - AfterAllowTraffic: "LambdaFunctionToValidateAfterTrafficShift"\n\`\`\``
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between blue/green and canary deployments?', a: 'Blue/green: deploy the new version alongside the old, then switch 100% of traffic at once. Instant rollback by switching back. Zero downtime. Risk: if the new version has issues, 100% of users are affected immediately after the switch. Canary: gradually shift traffic (e.g., 5% → 25% → 100%). Limits blast radius — only a small percentage of users are affected if the new version has issues. Slower rollout but safer. Use canary for high-risk changes, blue/green for standard deployments.' },
          { q: 'How do you implement zero-downtime deployments on ECS?', a: 'Use ECS rolling updates with a minimum healthy percent of 100% (never reduce below current capacity) and maximum percent of 200% (can temporarily double capacity). Or use CodeDeploy blue/green: deploy new task set, shift traffic, wait for validation, terminate old task set. Configure ALB connection draining so in-flight requests complete before old tasks are stopped. Use health checks to ensure new tasks are healthy before receiving traffic.' },
          { q: 'How would you roll back a bad deployment?', a: 'With CodeDeploy blue/green: trigger a rollback in the CodeDeploy console or CLI — it shifts traffic back to the original (blue) task set immediately. With ECS rolling updates: update the service to use the previous task definition revision. With Lambda: update the alias to point to the previous version. Set up CloudWatch alarms that automatically trigger CodeDeploy rollback if error rate or latency exceeds thresholds during deployment. Always test rollback procedures in staging.' },
        ]
      },
    ],
  },

  'aws-cloudformation': {
    slug: 'aws-cloudformation', title: 'CloudFormation', subtitle: 'Infrastructure as Code, stacks, change sets, drift detection, and CDK',
    duration: '25 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'Infrastructure as Code with CloudFormation',
        body: `AWS CloudFormation is an Infrastructure as Code (IaC) service that lets you define your AWS infrastructure in JSON or YAML templates. Instead of clicking through the console to create resources, you write a template that describes the desired state, and CloudFormation creates, updates, or deletes resources to match.\n\nIaC provides: version control (your infrastructure is code, stored in Git), repeatability (deploy the same infrastructure to dev, staging, and production), auditability (every change is tracked), and automation (no manual steps, no human error). CloudFormation is the AWS-native IaC tool. Terraform is the multi-cloud alternative (also widely used on AWS).\n\nA CloudFormation template describes resources and their relationships. CloudFormation figures out the dependency order and creates resources in the right sequence. If a resource fails to create, CloudFormation rolls back the entire stack to the previous state.`
      },
      {
        type: 'text', heading: 'Templates, Stacks, Change Sets, and CDK',
        body: `**Templates:** YAML or JSON files that define AWS resources. Key sections: Parameters (inputs), Resources (required — the AWS resources to create), Outputs (values to export), Mappings (static lookup tables), Conditions (create resources conditionally).\n\n\`\`\`yaml\nAWSTemplateFormatVersion: '2010-09-09'\nParameters:\n  InstanceType:\n    Type: String\n    Default: t3.micro\nResources:\n  WebServer:\n    Type: AWS::EC2::Instance\n    Properties:\n      InstanceType: !Ref InstanceType\n      ImageId: ami-0c55b159cbfafe1f0\n      SecurityGroupIds:\n        - !Ref WebSecurityGroup\n  WebSecurityGroup:\n    Type: AWS::EC2::SecurityGroup\n    Properties:\n      GroupDescription: Web server security group\n      SecurityGroupIngress:\n        - IpProtocol: tcp\n          FromPort: 80\n          ToPort: 80\n          CidrIp: 0.0.0.0/0\nOutputs:\n  PublicIP:\n    Value: !GetAtt WebServer.PublicIp\n\`\`\`\n\n**Stacks:** A stack is a collection of AWS resources managed as a single unit. Create, update, and delete stacks as a whole. Use nested stacks to break large templates into reusable modules.\n\n**Change Sets:** Preview the changes CloudFormation will make before applying them. Create a change set, review the proposed changes (which resources will be added, modified, or deleted), then execute it. Essential for production — never update a production stack without reviewing a change set first.\n\n**Drift Detection:** Detects when the actual state of your resources differs from the CloudFormation template (e.g., someone manually changed a security group). Run drift detection to identify out-of-band changes.\n\n**AWS CDK (Cloud Development Kit):** Define infrastructure using familiar programming languages (TypeScript, Python, Java, Go). CDK synthesizes to CloudFormation templates. Higher-level abstractions (constructs) make it easier to define complex architectures. CDK is increasingly preferred over raw CloudFormation for its developer experience.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between CloudFormation and Terraform?', a: 'CloudFormation is AWS-native, free, and deeply integrated with AWS services. It uses JSON/YAML templates. State is managed by AWS. Terraform is multi-cloud (AWS, GCP, Azure, on-prem), uses HCL (HashiCorp Configuration Language), and manages state in a state file (local or remote). Terraform has a larger ecosystem and is often preferred for multi-cloud or hybrid environments. CloudFormation is preferred for AWS-only environments where deep AWS integration matters.' },
          { q: 'What happens when a CloudFormation stack update fails?', a: 'CloudFormation automatically rolls back to the previous state. It reverses all changes made during the failed update, restoring resources to their pre-update configuration. You can disable rollback for debugging (to inspect the failed state). Use change sets to preview changes before applying them. For production stacks, always use change sets and test updates in staging first.' },
          { q: 'What is AWS CDK and why would you use it over raw CloudFormation?', a: 'AWS CDK lets you define infrastructure using TypeScript, Python, Java, or Go instead of YAML/JSON. Benefits: use loops, conditions, and functions (not possible in YAML), reuse infrastructure patterns as classes, better IDE support (autocomplete, type checking), higher-level constructs that encode best practices (e.g., a single construct creates an ECS service with ALB, security groups, and IAM roles). CDK synthesizes to CloudFormation, so you get all CloudFormation benefits. Use CDK for complex infrastructure; use raw CloudFormation for simple, stable templates.' },
        ]
      },
    ],
  },

  'aws-ecr': {
    slug: 'aws-ecr', title: 'Amazon ECR', subtitle: 'Container registry, image lifecycle policies, vulnerability scanning, and cross-account access',
    duration: '15 min', difficulty: 'Beginner',
    sections: [
      {
        type: 'text', heading: 'What is ECR and How to Use It',
        body: `Amazon ECR (Elastic Container Registry) is a fully managed Docker container registry. It stores, manages, and deploys Docker container images. ECR integrates natively with ECS, EKS, and CodePipeline — no credentials needed when pulling images from ECR to ECS/EKS in the same account.\n\nECR is private by default. Each image is stored in a repository (like a GitHub repo for Docker images). Images are tagged with versions (latest, v1.2.3, git-sha). ECR supports both private repositories (your images) and public repositories (ECR Public Gallery for sharing images publicly).\n\nBasic workflow:\n\`\`\`bash\n# Authenticate Docker to ECR\naws ecr get-login-password --region us-east-1 | \\\n  docker login --username AWS --password-stdin \\\n  123456789.dkr.ecr.us-east-1.amazonaws.com\n\n# Build and tag image\ndocker build -t my-app .\ndocker tag my-app:latest \\\n  123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:latest\n\n# Push to ECR\ndocker push 123456789.dkr.ecr.us-east-1.amazonaws.com/my-app:latest\n\`\`\`\n\n**Image Lifecycle Policies:** Automatically delete old images to reduce storage costs. Example: keep only the last 10 tagged images, delete untagged images older than 1 day. Without lifecycle policies, your ECR repository grows indefinitely.\n\n**Vulnerability Scanning:** ECR can automatically scan images for known vulnerabilities (CVEs) using Amazon Inspector. Basic scanning (free) uses the Clair scanner. Enhanced scanning uses Amazon Inspector for more comprehensive results. Configure scan-on-push to automatically scan every new image.\n\n**Cross-account access:** Use ECR repository policies to grant other AWS accounts permission to pull images. Useful for: sharing base images across accounts, allowing a CI/CD account to push images that production accounts pull.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'How does ECR integrate with ECS?', a: 'ECS task definitions reference ECR image URIs. When ECS launches a task, it pulls the image from ECR using the task execution role (ecsTaskExecutionRole). This role has the AmazonECSTaskExecutionRolePolicy which includes ECR pull permissions. No credentials are needed — IAM handles authentication automatically. For cross-account image pulls, add the source account\'s ECS execution role to the ECR repository policy.' },
          { q: 'How do you manage ECR image versions in a CI/CD pipeline?', a: 'Tag images with the Git commit SHA (docker tag app:${GIT_SHA}) for traceability — you can always identify which code version is running. Also tag with semantic versions (v1.2.3) for releases. Use the latest tag for the most recent build (but never rely on latest in production — always use specific tags). Configure ECR lifecycle policies to keep the last N tagged images and delete untagged images. Store the image tag in your deployment configuration (ECS task definition, Kubernetes deployment).' },
        ]
      },
    ],
  },


  // ── SERVERLESS & MESSAGING ────────────────────────────────────────────────
  'aws-api-gateway': {
    slug: 'aws-api-gateway', title: 'Amazon API Gateway', subtitle: 'REST, HTTP, and WebSocket APIs — throttling, caching, Lambda integration, and stages',
    duration: '25 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is API Gateway',
        body: `Amazon API Gateway is a fully managed service for creating, deploying, and managing APIs at any scale. It acts as the "front door" for your backend services — Lambda functions, EC2 instances, ECS containers, or any HTTP endpoint. API Gateway handles: request routing, authentication and authorization, throttling, caching, SSL termination, request/response transformation, and monitoring.\n\nAPI Gateway supports three API types: REST API (full-featured, most options), HTTP API (simpler, cheaper, faster — 60% cheaper than REST API), and WebSocket API (bidirectional, real-time communication). For new serverless APIs, use HTTP API unless you need REST API-specific features (API keys, usage plans, request validation, AWS WAF integration).`
      },
      {
        type: 'animation', id: 'api-gateway',
        heading: 'API Gateway Request Lifecycle',
        caption: 'Every request passes through auth, throttle, transform, and backend — watch it step by step',
      },
      {
        type: 'text', heading: 'Integration Types, Throttling, Caching, and Stages',
        body: `**Integration Types:**\n- **Lambda Proxy:** API Gateway passes the entire request to Lambda and returns Lambda's response directly. Simplest integration. Lambda receives event with headers, query params, body, path params.\n- **Lambda Non-Proxy:** API Gateway transforms the request before sending to Lambda and transforms the response. More control but more configuration.\n- **HTTP Proxy:** Forward requests to any HTTP endpoint (EC2, ECS, external API).\n- **AWS Service:** Directly integrate with AWS services (SQS, DynamoDB, SNS) without Lambda.\n\n**Throttling:** API Gateway limits requests to protect your backend. Default: 10,000 requests/second per account, 5,000 burst. Configure per-stage or per-method throttling. Throttled requests return 429 Too Many Requests. Use usage plans and API keys to set per-client throttling limits.\n\n**Caching:** API Gateway can cache responses at the edge for a configurable TTL (0-3600 seconds). Reduces backend load and improves latency. Cache key includes the request path and optionally query parameters and headers. Invalidate cache manually or wait for TTL expiration. Caching costs extra — only enable for responses that are safe to cache.\n\n**Stages:** Deployments of your API (dev, staging, production). Each stage has its own URL, throttling settings, caching configuration, and stage variables. Use stage variables to configure different Lambda functions or backend URLs per stage. Deploy to a stage after making changes — changes are not live until deployed.\n\n\`\`\`\nAPI Gateway URL format:\nhttps://{api-id}.execute-api.{region}.amazonaws.com/{stage}/{resource}\n\nExample:\nhttps://abc123.execute-api.us-east-1.amazonaws.com/prod/users\n\`\`\``
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between REST API and HTTP API in API Gateway?', a: 'HTTP API is newer, simpler, and 60-70% cheaper than REST API. It supports Lambda proxy integration, JWT authorizers, CORS, and automatic deployments. REST API has more features: API keys and usage plans, request/response transformation, AWS WAF integration, resource policies, per-method throttling, caching, and X-Ray tracing. Use HTTP API for most new serverless APIs. Use REST API when you need API keys, WAF, or advanced request/response transformation.' },
          { q: 'How do you secure an API Gateway endpoint?', a: 'Options: (1) IAM authorization — require AWS Signature V4 signed requests (for internal AWS services). (2) Lambda authorizer — custom authorization logic in a Lambda function (validate JWT, API key, OAuth token). (3) Cognito User Pools — validate Cognito JWT tokens natively. (4) API keys + usage plans — for third-party API consumers. (5) Resource policies — restrict access by IP, VPC, or AWS account. For public APIs, use Cognito or Lambda authorizer. For internal APIs, use IAM authorization.' },
          { q: 'How do you handle CORS in API Gateway?', a: 'CORS (Cross-Origin Resource Sharing) is required when your frontend (e.g., app.example.com) calls an API on a different domain (api.example.com). Enable CORS in API Gateway: configure the OPTIONS method to return the appropriate Access-Control-Allow-Origin, Access-Control-Allow-Methods, and Access-Control-Allow-Headers headers. For HTTP API, enable CORS in the API configuration. For REST API, enable CORS on each resource. Also ensure your Lambda function returns CORS headers in its response.' },
        ]
      },
    ],
  },

  'aws-sqs-sns': {
    slug: 'aws-sqs-sns', title: 'SQS and SNS', subtitle: 'Message queues, pub/sub, FIFO, DLQ, visibility timeout, and fan-out patterns',
    duration: '30 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'Asynchronous Messaging on AWS',
        body: `Asynchronous messaging decouples components of your system — the producer sends a message and continues without waiting for the consumer to process it. This improves resilience (if the consumer is down, messages queue up and are processed when it recovers), scalability (consumers can scale independently), and performance (producers are not blocked by slow consumers).\n\nAWS provides two core messaging services: SQS (Simple Queue Service) for point-to-point queuing and SNS (Simple Notification Service) for pub/sub messaging. They are often used together in a fan-out pattern: SNS distributes a message to multiple SQS queues, each processed by a different consumer.`
      },
      {
        type: 'animation', id: 'sqs',
        heading: 'SQS Message Lifecycle — Visibility Timeout & DLQ',
        caption: 'Watch messages flow through the queue, fail retries, and land in the Dead Letter Queue',
      },
      {
        type: 'text', heading: 'SQS — Standard vs FIFO, Visibility Timeout, and DLQ',
        body: `**SQS Standard Queue:** At-least-once delivery (messages may be delivered more than once), best-effort ordering (messages may arrive out of order). Unlimited throughput. Use for: most workloads where occasional duplicates and out-of-order delivery are acceptable.\n\n**SQS FIFO Queue:** Exactly-once processing, strict ordering within a message group. Limited to 3,000 messages/second (with batching) or 300/second (without). Use for: financial transactions, order processing, any workflow where order and exactly-once processing matter.\n\n**Visibility Timeout:** When a consumer receives a message, it becomes invisible to other consumers for the visibility timeout period (default 30 seconds, max 12 hours). The consumer must process and delete the message before the timeout expires. If it does not (consumer crashes), the message becomes visible again and another consumer can process it. Set the visibility timeout to slightly longer than your maximum processing time.\n\n**Dead Letter Queue (DLQ):** A separate queue for messages that fail processing after a configurable number of attempts (maxReceiveCount). Instead of losing failed messages, they are moved to the DLQ for investigation. Always configure a DLQ for production queues. Monitor the DLQ depth with CloudWatch alarms — messages in the DLQ indicate processing failures.\n\n**Long Polling:** SQS supports short polling (returns immediately, even if empty) and long polling (waits up to 20 seconds for messages). Use long polling to reduce empty responses and lower costs. Configure ReceiveMessageWaitTimeSeconds = 20 on the queue.\n\n\`\`\`python\nimport boto3\nsqs = boto3.client('sqs')\n\n# Send message\nsqs.send_message(\n    QueueUrl='https://sqs.us-east-1.amazonaws.com/123456789/my-queue',\n    MessageBody=json.dumps({'orderId': '123', 'amount': 99.99})\n)\n\n# Receive and process messages\nresponse = sqs.receive_message(\n    QueueUrl=queue_url,\n    MaxNumberOfMessages=10,\n    WaitTimeSeconds=20  # Long polling\n)\nfor message in response.get('Messages', []):\n    process(message['Body'])\n    sqs.delete_message(\n        QueueUrl=queue_url,\n        ReceiptHandle=message['ReceiptHandle']\n    )\n\`\`\``
      },
      {
        type: 'text', heading: 'SNS — Topics, Subscriptions, and Fan-Out Pattern',
        body: `**SNS Topics:** A communication channel. Publishers send messages to a topic. Subscribers receive all messages published to the topic. SNS supports multiple subscription protocols: SQS, Lambda, HTTP/HTTPS, email, SMS, mobile push notifications.\n\n**Fan-Out Pattern:** Publish one message to SNS, which delivers it to multiple SQS queues simultaneously. Each queue is processed by a different consumer. Example: when an order is placed, publish to an SNS topic. Three SQS queues subscribe: one for inventory service, one for payment service, one for notification service. All three process the order event independently and in parallel.\n\n\`\`\`\nFan-Out Architecture:\n\nOrder Service → SNS Topic (order-placed)\n                    ├── SQS Queue → Inventory Lambda\n                    ├── SQS Queue → Payment Lambda\n                    └── SQS Queue → Notification Lambda\n\`\`\`\n\n**SNS Message Filtering:** Subscribers can filter messages based on message attributes. Instead of receiving all messages from a topic, a subscriber only receives messages matching its filter policy. Example: an inventory service only receives messages where category = "physical" (not digital products).\n\n**SNS FIFO Topics:** Like SQS FIFO, SNS FIFO topics provide strict ordering and exactly-once delivery. Use with SQS FIFO queues for ordered fan-out.`
      },
      {
        type: 'animation', id: 'sns',
        heading: 'SNS Fan-Out — One Publish, Many Consumers',
        caption: 'One event published to SNS fans out to all subscribers simultaneously',
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between SQS and SNS?', a: 'SQS is a queue — messages are stored until a consumer pulls and processes them. Point-to-point: one message is processed by one consumer. Messages persist until deleted. SNS is pub/sub — messages are pushed to all subscribers immediately. One-to-many: one message is delivered to all subscribers. Messages are not stored (if a subscriber is unavailable, the message is lost unless the subscriber is an SQS queue). Use SQS for work queues. Use SNS for event notifications. Use both together for fan-out.' },
          { q: 'What is the visibility timeout in SQS and why is it important?', a: 'When a consumer receives a message, it becomes invisible to other consumers for the visibility timeout period. The consumer must process and delete the message before the timeout expires. If the consumer crashes or takes too long, the message becomes visible again and another consumer processes it (at-least-once delivery). Set the visibility timeout to slightly longer than your maximum processing time. If processing takes variable time, extend the visibility timeout programmatically using ChangeMessageVisibility.' },
          { q: 'How do you handle duplicate messages in SQS?', a: 'SQS Standard queues deliver messages at least once — duplicates are possible. Make your consumers idempotent: processing the same message twice should have the same effect as processing it once. Techniques: use a unique message ID to track processed messages (store in DynamoDB, check before processing), use database transactions with unique constraints, design operations to be naturally idempotent (SET value = X is idempotent; INCREMENT value is not). For strict exactly-once processing, use SQS FIFO queues.' },
          { q: 'When would you use EventBridge instead of SNS?', a: 'Use EventBridge when: you need content-based routing (route events to different targets based on event content), you need to receive events from AWS services (EC2 state changes, S3 events, CodePipeline events), you need cross-account event routing, or you need scheduled events (cron). Use SNS when: you need simple pub/sub with multiple subscribers, you need to send SMS or email notifications, or you need mobile push notifications. EventBridge is more powerful for event-driven architectures; SNS is simpler for basic pub/sub.' },
        ]
      },
    ],
  },

  'aws-dlq': {
    slug: 'aws-dlq', title: 'Dead Letter Queues (DLQ)', subtitle: 'Handling poison messages, retry exhaustion, and failure observability in SQS and SNS',
    duration: '20 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is a Dead Letter Queue and Why You Need One',
        body: `A Dead Letter Queue (DLQ) is a special SQS queue that receives messages that could not be successfully processed after a configurable number of attempts. Without a DLQ, failed messages either disappear (if the consumer deletes them after a failed attempt) or loop forever (if the consumer never deletes them). Both outcomes are bad — you either lose data or waste compute.\n\nEvery production SQS queue should have a DLQ configured. It is your safety net for poison messages — messages that consistently fail processing due to bugs, malformed data, downstream service outages, or unexpected edge cases. The DLQ preserves these messages so you can investigate, fix the bug, and replay them.\n\nDLQs work with both SQS Standard and FIFO queues. SNS subscriptions can also have DLQs — if SNS cannot deliver a message to a subscriber (Lambda throttled, SQS queue full, HTTP endpoint down), the message goes to the subscription's DLQ instead of being silently dropped.`
      },
      {
        type: 'animation', id: 'dlq',
        heading: 'DLQ — Retry Exhaustion Flow',
        caption: 'Watch a poison message fail 3 times, get moved to the DLQ, and trigger a CloudWatch alarm',
      },
      {
        type: 'text', heading: 'Configuring DLQs and maxReceiveCount',
        body: `**maxReceiveCount:** The number of times a message can be received from the queue before being moved to the DLQ. When a consumer receives a message, SQS increments the receive count. If the consumer fails to delete the message (crashes, throws an exception, visibility timeout expires), the message becomes visible again. After maxReceiveCount receives, SQS moves it to the DLQ.\n\nChoose maxReceiveCount carefully:\n- Too low (1-2): transient failures (network blip, brief downstream outage) send messages to DLQ unnecessarily\n- Too high (10+): poison messages waste compute for many retries before being quarantined\n- Recommended: 3-5 for most workloads\n\n\`\`\`json\n// CloudFormation: SQS queue with DLQ\n{\n  "MainQueue": {\n    "Type": "AWS::SQS::Queue",\n    "Properties": {\n      "QueueName": "order-processing",\n      "VisibilityTimeout": 60,\n      "RedrivePolicy": {\n        "deadLetterTargetArn": {"Fn::GetAtt": ["DLQ", "Arn"]},\n        "maxReceiveCount": 3\n      }\n    }\n  },\n  "DLQ": {\n    "Type": "AWS::SQS::Queue",\n    "Properties": {\n      "QueueName": "order-processing-dlq",\n      "MessageRetentionPeriod": 1209600\n    }\n  }\n}\n\`\`\`\n\n**Message Retention:** DLQ messages are retained for up to 14 days (1,209,600 seconds). Set retention to the maximum — you want time to investigate and replay. The DLQ retention period must be >= the source queue retention period.\n\n**Monitoring DLQ Depth:** Create a CloudWatch alarm on the DLQ's ApproximateNumberOfMessagesVisible metric. Any message in the DLQ means a processing failure — alert immediately. This is one of the most important alarms for any event-driven system.\n\n\`\`\`python\n# CloudWatch alarm for DLQ depth\ncloudwatch.put_metric_alarm(\n    AlarmName='OrderProcessingDLQ-NotEmpty',\n    MetricName='ApproximateNumberOfMessagesVisible',\n    Namespace='AWS/SQS',\n    Dimensions=[{'Name': 'QueueName', 'Value': 'order-processing-dlq'}],\n    Statistic='Sum',\n    Period=60,\n    EvaluationPeriods=1,\n    Threshold=1,\n    ComparisonOperator='GreaterThanOrEqualToThreshold',\n    AlarmActions=['arn:aws:sns:us-east-1:123456789:pagerduty-alerts'],\n)\n\`\`\``
      },
      {
        type: 'text', heading: 'Replaying DLQ Messages',
        body: `Once you fix the bug that caused messages to fail, you need to replay the DLQ messages through the main queue. AWS provides a built-in DLQ redrive feature in the SQS console and API — it moves messages from the DLQ back to the source queue for reprocessing.\n\n**SQS DLQ Redrive (console):** In the SQS console, select the DLQ → "Start DLQ redrive" → choose the destination queue → start. AWS moves messages in batches.\n\n**Programmatic redrive:**\n\`\`\`python\nimport boto3\nsqs = boto3.client('sqs')\n\n# Start DLQ redrive\nsqs.start_message_move_task(\n    SourceArn='arn:aws:sqs:us-east-1:123456789:order-processing-dlq',\n    DestinationArn='arn:aws:sqs:us-east-1:123456789:order-processing',\n    MaxNumberOfMessagesPerSecond=10  # throttle to avoid overwhelming consumer\n)\n\`\`\`\n\n**Before replaying:** Always fix the root cause first. Replaying without fixing the bug just refills the DLQ. Test the fix with a single message before replaying all DLQ messages. Consider replaying during off-peak hours to avoid impacting production traffic.\n\n**DLQ for Lambda:** When Lambda is triggered by SQS, Lambda handles retries internally (based on the event source mapping's bisectBatchOnFunctionError and maximumRetryAttempts settings). Configure the SQS queue's DLQ — Lambda will not move messages to DLQ itself, but the SQS queue will after maxReceiveCount is exceeded. Alternatively, configure a Lambda destination for failures (sends failed event records to SQS, SNS, or EventBridge).`
      },
      {
        type: 'diagram', variant: 'comparison', heading: 'DLQ Patterns: SQS vs SNS vs Lambda',
        items: [
          { title: 'SQS DLQ', color: 'blue', points: ['Configure via RedrivePolicy on source queue', 'maxReceiveCount: 3-5 recommended', 'DLQ receives full message body', 'Use SQS redrive to replay', '✅ Best for: work queues, order processing'] },
          { title: 'SNS DLQ', color: 'purple', points: ['Per-subscription DLQ (not per-topic)', 'Catches delivery failures to subscriber', 'Subscriber must be SQS, Lambda, or HTTP', 'Message includes delivery failure reason', '✅ Best for: critical notifications that must not be lost'] },
          { title: 'Lambda DLQ', color: 'orange', points: ['For async Lambda invocations only', 'Not for SQS-triggered Lambda (use SQS DLQ)', 'Configure on Lambda function config', 'Receives event + error details', '✅ Best for: async Lambda (S3 events, SNS, EventBridge)'] },
        ]
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is a Dead Letter Queue and why is it important?', a: 'A DLQ is a queue that receives messages that failed processing after maxReceiveCount attempts. It is important because: it prevents poison messages from blocking the queue forever, it preserves failed messages for investigation and replay, it provides visibility into processing failures (monitor DLQ depth with CloudWatch alarms). Without a DLQ, failed messages either loop forever (wasting compute) or are silently lost. Always configure a DLQ for production queues.' },
          { q: 'What is the difference between a DLQ and a retry mechanism?', a: 'Retries happen automatically via the visibility timeout — if a consumer fails to delete a message, it becomes visible again and another consumer can try. The DLQ is the final destination after all retries are exhausted (maxReceiveCount exceeded). Retries handle transient failures (network blips, brief outages). The DLQ handles persistent failures (bugs, malformed data, consistently failing downstream services). They work together: retry first, DLQ as the last resort.' },
          { q: 'How do you replay messages from a DLQ?', a: 'Fix the root cause first. Then use SQS DLQ redrive: in the console, select the DLQ → Start DLQ redrive → choose destination queue. Or use the StartMessageMoveTask API programmatically. Throttle the replay rate (MaxNumberOfMessagesPerSecond) to avoid overwhelming your consumer. Test with a single message before replaying all. Monitor the main queue and consumer during replay. If messages fail again, they will return to the DLQ.' },
          { q: 'How do you monitor a DLQ?', a: 'Create a CloudWatch alarm on ApproximateNumberOfMessagesVisible for the DLQ with threshold >= 1. Any message in the DLQ is a bug — alert immediately via SNS → PagerDuty/email. Also monitor ApproximateAgeOfOldestMessage to detect messages that have been in the DLQ for a long time (indicates the issue has not been investigated). Set up a CloudWatch dashboard showing both the main queue depth and DLQ depth side by side.' },
        ]
      },
    ],
  },

  'aws-eventbridge': {
    slug: 'aws-eventbridge', title: 'Amazon EventBridge', subtitle: 'Event buses, rules, targets, scheduled events, and cross-account routing',
    duration: '20 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'What is EventBridge',
        body: `Amazon EventBridge is a serverless event bus that makes it easy to build event-driven applications. It receives events from AWS services, your own applications, and SaaS partners, and routes them to targets based on rules. EventBridge is the evolution of CloudWatch Events — it has the same scheduling capability plus much more.\n\nEventBridge has three types of event buses: Default event bus (receives events from AWS services — EC2 state changes, S3 events, CodePipeline events), Custom event buses (for your application events), and Partner event buses (for SaaS partner events — Zendesk, Datadog, PagerDuty).\n\nEventBridge rules match incoming events based on event patterns (JSON matching) and route them to targets. Targets include: Lambda, SQS, SNS, ECS tasks, Step Functions, API Gateway, Kinesis, and more. One rule can have up to 5 targets.`
      },
      {
        type: 'text', heading: 'Event Patterns, Scheduled Events, and Cross-Account',
        body: `**Event Patterns:** JSON patterns that match incoming events. EventBridge checks if the event matches the pattern and routes it to the configured targets.\n\n\`\`\`json\n// Match EC2 instance state changes to "stopped"\n{\n  "source": ["aws.ec2"],\n  "detail-type": ["EC2 Instance State-change Notification"],\n  "detail": {\n    "state": ["stopped"]\n  }\n}\n\n// Match custom application events\n{\n  "source": ["my-app.orders"],\n  "detail-type": ["OrderPlaced"],\n  "detail": {\n    "amount": [{"numeric": [">", 1000]}]\n  }\n}\n\`\`\`\n\n**Scheduled Events:** EventBridge can trigger targets on a schedule — like cron jobs in the cloud. Use rate expressions (rate(5 minutes), rate(1 day)) or cron expressions (cron(0 12 * * ? *) for noon UTC daily). Use for: scheduled Lambda functions, periodic data processing, report generation, cleanup jobs.\n\n**Cross-Account Events:** EventBridge supports routing events between AWS accounts. Add a resource-based policy to the target account's event bus to allow the source account to send events. Use for: centralized event processing, multi-account architectures where a central account processes events from all other accounts.\n\n**EventBridge Pipes:** Connect event sources (SQS, DynamoDB Streams, Kinesis) directly to targets with optional filtering and enrichment — without writing Lambda code for simple routing logic.`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What is the difference between EventBridge and SQS?', a: 'EventBridge is a push-based event router — events are pushed to targets immediately based on rules. It is for event-driven architectures where you want to react to events in real-time. SQS is a pull-based queue — consumers poll for messages. It is for decoupling producers and consumers, handling backpressure, and ensuring reliable message delivery. Use EventBridge for routing events to multiple targets based on content. Use SQS for work queues where you need buffering and backpressure handling.' },
          { q: 'How do you use EventBridge for scheduled tasks?', a: 'Create an EventBridge rule with a schedule expression (rate or cron). Set the target to a Lambda function, ECS task, or Step Functions state machine. Example: run a Lambda function every day at midnight to generate reports — cron(0 0 * * ? *). EventBridge Scheduler (newer service) provides more features: one-time schedules, timezone support, flexible time windows, and higher scale than EventBridge rules.' },
        ]
      },
    ],
  },

  'aws-serverless-patterns': {
    slug: 'aws-serverless-patterns', title: 'Serverless Patterns', subtitle: 'Event-driven architecture, fan-out, saga pattern, and serverless best practices',
    duration: '25 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Event-Driven Architecture',
        body: `Event-driven architecture (EDA) is a design pattern where components communicate by producing and consuming events. Instead of direct API calls (synchronous, tight coupling), services publish events to a message bus and other services react to those events (asynchronous, loose coupling). This makes systems more resilient, scalable, and easier to evolve.\n\nOn AWS, the event-driven stack is: EventBridge or SNS for event routing, SQS for buffering and backpressure, Lambda for event processing, DynamoDB Streams for database change events, and Kinesis for high-throughput streaming events.\n\nBenefits of EDA: loose coupling (services do not know about each other), independent scaling (each service scales based on its own load), resilience (if a consumer is down, events queue up), extensibility (add new consumers without changing producers), and auditability (events are a natural audit log).`
      },
      {
        type: 'text', heading: 'Serverless Patterns: Fan-Out, Saga, and Best Practices',
        body: `**Fan-Out Pattern:** One event triggers multiple parallel processes. SNS topic → multiple SQS queues → multiple Lambda functions. Example: user registration event triggers: welcome email (Lambda 1), create user profile (Lambda 2), provision free trial (Lambda 3). All happen in parallel, independently.\n\n**Saga Pattern:** Manage distributed transactions across multiple services without a central coordinator. Each service performs its local transaction and publishes an event. The next service listens for the event and performs its transaction. If a step fails, compensating transactions undo previous steps.\n\n\`\`\`\nOrder Saga:\n1. Order Service: create order → publish OrderCreated\n2. Payment Service: charge card → publish PaymentProcessed (or PaymentFailed)\n3. Inventory Service: reserve items → publish InventoryReserved (or InsufficientInventory)\n4. Shipping Service: schedule delivery → publish ShipmentScheduled\n\nOn failure at step 3:\n- Inventory Service publishes InsufficientInventory\n- Payment Service listens and refunds the charge\n- Order Service listens and cancels the order\n\`\`\`\n\n**Serverless Best Practices:**\n- Keep functions small and focused (single responsibility)\n- Move initialization code outside the handler (database connections, SDK clients)\n- Use environment variables for configuration, Secrets Manager for secrets\n- Set appropriate memory and timeout — start with 256MB and 30 seconds, tune based on metrics\n- Use Provisioned Concurrency for latency-sensitive functions\n- Always configure DLQ or Destinations for async invocations\n- Use structured logging (JSON) for easier CloudWatch Logs Insights queries\n- Use X-Ray for distributed tracing\n- Design for idempotency — Lambda may invoke your function more than once`
      },
      {
        type: 'faq', heading: 'Frequently Asked Interview Questions',
        questions: [
          { q: 'What are the tradeoffs of event-driven architecture?', a: 'Benefits: loose coupling, independent scaling, resilience, extensibility. Tradeoffs: eventual consistency (events are processed asynchronously — data may be temporarily inconsistent), debugging complexity (tracing a request across multiple services and queues is harder than a synchronous call chain — use X-Ray), ordering challenges (events may arrive out of order — use FIFO queues or include sequence numbers), and operational complexity (more moving parts — queues, topics, functions). EDA is powerful but adds complexity — use it where the benefits justify the tradeoffs.' },
          { q: 'How do you handle failures in a serverless event-driven system?', a: 'Configure DLQ or Destinations for all async Lambda invocations. Set appropriate retry counts and backoff. Use idempotent consumers so retries are safe. Monitor DLQ depth with CloudWatch alarms. For saga pattern failures, implement compensating transactions. Use Step Functions for complex workflows with built-in error handling, retries, and state management. Log all events and failures for debugging. Use X-Ray to trace requests across services.' },
          { q: 'What is the difference between choreography and orchestration in microservices?', a: 'Choreography: services react to events without a central coordinator. Each service knows what to do when it receives an event. Decentralized, loosely coupled, but harder to understand the overall flow. Orchestration: a central coordinator (Step Functions, a workflow service) tells each service what to do and when. Easier to understand and debug the overall flow, but the coordinator is a central point of coupling. Use choreography for simple event flows. Use orchestration (Step Functions) for complex workflows with branching, parallel steps, and error handling.' },
        ]
      },
    ],
  },


  // ── SYSTEM DESIGN ON AWS ──────────────────────────────────────────────────
  'aws-design-url-shortener': {
    slug: 'aws-design-url-shortener', title: 'Design a URL Shortener', subtitle: 'Like Bitly — high read traffic, low latency, global scale',
    duration: '30 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Requirements',
        body: `**Functional Requirements:**\n- Shorten a long URL to a short code (e.g., bit.ly/abc123)\n- Redirect short URL to original URL\n- Custom aliases (optional)\n- Analytics: click count, referrer, geography (optional)\n\n**Non-Functional Requirements:**\n- High availability (99.99% uptime)\n- Low latency redirects (<50ms p99)\n- Read-heavy: 100:1 read-to-write ratio\n- Scale: 100M URLs stored, 10B redirects/month (~3,800 redirects/second)\n- Short codes: 7 characters, alphanumeric (62^7 = 3.5 trillion unique codes)\n\n**Estimations:**\n- Write: 10M new URLs/month = ~4 writes/second\n- Read: 10B redirects/month = ~3,800 reads/second\n- Storage: 100M URLs × 500 bytes = 50GB (fits in DynamoDB easily)\n- Cache: top 20% of URLs handle 80% of traffic — cache ~20M URLs`
      },
      {
        type: 'text', heading: 'AWS Services and Architecture',
        body: `**AWS Services Used:**\n- API Gateway + Lambda: handle create and redirect requests\n- DynamoDB: store URL mappings (shortCode → longUrl)\n- ElastiCache (Redis): cache hot URLs for sub-millisecond redirects\n- CloudFront: CDN for global low-latency access\n- Route 53: DNS routing\n- S3: store analytics data\n- Kinesis: stream click events for analytics\n\n**Short Code Generation:**\nOption 1: Hash the long URL (MD5/SHA256), take first 7 characters. Risk: collisions.\nOption 2: Base62 encode an auto-incrementing ID from a counter service (DynamoDB atomic counter or Redis INCR). Guaranteed unique, sequential.\nOption 3: Generate random 7-character string, check DynamoDB for collision. Simple but requires a read before every write.\n\nFor production, use Option 2: DynamoDB atomic counter with conditional writes ensures uniqueness without collisions.`
      },
      {
        type: 'diagram', variant: 'flow', heading: 'URL Shortener Architecture Flow',
        caption: 'Create flow and redirect flow — optimized for high read throughput',
        steps: [
          { label: 'Create URL', desc: 'POST /shorten → API Gateway → Lambda → generate code → DynamoDB write', color: 'blue' },
          { label: 'Redirect (Cache Hit)', desc: 'GET /abc123 → CloudFront → Lambda → Redis cache hit → 301 redirect', color: 'green' },
          { label: 'Redirect (Cache Miss)', desc: 'GET /abc123 → Lambda → DynamoDB read → cache in Redis → 301 redirect', color: 'orange' },
          { label: 'Analytics', desc: 'Click event → Kinesis → Lambda → S3/DynamoDB for aggregation', color: 'purple' },
        ]
      },
      {
        type: 'text', heading: 'Scaling Strategy and Bottlenecks',
        body: `**Scaling Strategy:**\n- Lambda scales automatically — no capacity planning needed\n- DynamoDB on-demand mode scales to any throughput\n- ElastiCache Redis cluster mode for horizontal cache scaling\n- CloudFront absorbs read traffic at the edge — most redirects never reach Lambda\n\n**Bottlenecks and Solutions:**\n\n**Hot URLs:** A viral URL gets millions of hits. Solution: CloudFront caches the redirect response at the edge. The redirect never reaches Lambda or DynamoDB. Cache-Control: max-age=3600 on redirect responses.\n\n**DynamoDB hot partitions:** If many short codes start with the same character, they hash to the same partition. Solution: use random short codes (not sequential) to distribute across partitions evenly.\n\n**Cache stampede:** When a cached URL expires, many concurrent requests hit DynamoDB simultaneously. Solution: use Redis SETNX to implement a lock — only one request fetches from DynamoDB, others wait for the cache to be populated.\n\n**Analytics at scale:** Counting clicks in DynamoDB with UpdateItem (atomic increment) works but creates hot keys for popular URLs. Solution: use Kinesis to buffer click events, aggregate in Lambda, write aggregated counts to DynamoDB periodically.`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'How would you handle custom aliases (e.g., bit.ly/my-brand)?', a: 'Store custom aliases in DynamoDB with the same schema as auto-generated codes. Check for conflicts before creating (conditional write: only create if the key does not exist). Rate-limit custom alias creation per user to prevent abuse. Reserve common words (admin, api, login) to prevent conflicts with system paths.' },
          { q: 'How would you implement URL expiration?', a: 'Add a TTL attribute to DynamoDB items — DynamoDB automatically deletes expired items. For the cache, set Redis TTL to match the URL expiration. When a redirect request comes in for an expired URL, return 410 Gone instead of 301 Redirect. For analytics, keep expired URL data in S3 for historical reporting.' },
          { q: 'How would you scale to 1 billion redirects per day?', a: 'At 1B redirects/day (~11,500/second), CloudFront is the key. Configure CloudFront to cache redirect responses (301 with Cache-Control headers). Most requests are served from CloudFront edge locations without hitting Lambda or DynamoDB. For the remaining cache misses, Lambda scales automatically. DynamoDB on-demand handles any read throughput. ElastiCache Redis cluster mode handles cache at scale.' },
        ]
      },
    ],
  },

  'aws-design-image-upload': {
    slug: 'aws-design-image-upload', title: 'Design an Image Upload System', subtitle: 'Like Instagram — upload, process, and serve images globally',
    duration: '30 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Requirements and AWS Services',
        body: `**Functional Requirements:**\n- Users upload images (up to 10MB)\n- Images are resized to multiple dimensions (thumbnail, medium, large)\n- Images are served globally with low latency\n- Images are associated with user profiles\n\n**Non-Functional Requirements:**\n- High availability, durable storage (no data loss)\n- Upload latency: <2 seconds for 10MB image\n- Serve latency: <100ms globally\n- Scale: 10M uploads/day, 1B image views/day\n\n**AWS Services:**\n- S3: store original and processed images (11 nines durability)\n- Lambda: triggered by S3 events to resize images\n- CloudFront: serve images globally from edge locations\n- RDS/DynamoDB: store image metadata (userId, imageId, S3 keys, timestamps)\n- API Gateway: handle upload requests, generate pre-signed URLs\n- SQS: buffer resize jobs for reliability`
      },
      {
        type: 'diagram', variant: 'flow', heading: 'Image Upload and Serving Flow',
        caption: 'Direct-to-S3 upload bypasses your server — scales to any upload volume',
        steps: [
          { label: 'Request Upload URL', desc: 'Client → API Gateway → Lambda → generate S3 pre-signed URL → return to client', color: 'blue' },
          { label: 'Upload to S3', desc: 'Client uploads directly to S3 using pre-signed URL (bypasses your server)', color: 'green' },
          { label: 'Process Image', desc: 'S3 event → Lambda → resize to thumbnail/medium/large → store in S3', color: 'orange' },
          { label: 'Serve Image', desc: 'Client → CloudFront → S3 origin (cache miss) or edge cache (cache hit)', color: 'purple' },
        ]
      },
      {
        type: 'text', heading: 'Architecture Details and Scaling',
        body: `**Pre-signed URL Upload Flow:** Instead of uploading through your API server (which would require your server to handle large file transfers), generate a pre-signed S3 URL and have the client upload directly to S3. This eliminates your server as a bottleneck for uploads. The pre-signed URL is valid for a short time (5-15 minutes) and allows only PUT to a specific S3 key.\n\n**Image Processing Pipeline:** When an image is uploaded to S3, an S3 event triggers a Lambda function. The Lambda function reads the original image, resizes it to multiple dimensions using a library like Sharp (Node.js) or Pillow (Python), and stores the resized versions in S3 with different key prefixes (thumbnails/, medium/, large/). Store the S3 keys in DynamoDB for metadata lookup.\n\nFor reliability, use SQS between S3 events and Lambda: S3 event → SQS → Lambda. This provides retry logic (if Lambda fails, the message stays in SQS) and backpressure (Lambda processes at its own pace).\n\n**Serving Images:** Store processed images in S3 with CloudFront in front. Configure CloudFront cache behaviors: /thumbnails/* → long TTL (1 year), /original/* → shorter TTL or no caching. Use S3 Transfer Acceleration for uploads from distant locations.\n\n**Bottlenecks:**\n- Large image processing: Lambda has 15-minute timeout and 10GB memory. For very large images, use AWS Elemental MediaConvert or EC2-based processing.\n- Storage costs: use S3 Intelligent-Tiering for images not accessed frequently.\n- Serving costs: CloudFront reduces S3 data transfer costs significantly.`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'Why use pre-signed URLs instead of uploading through your API?', a: 'Pre-signed URLs allow clients to upload directly to S3, bypassing your API server. Benefits: your server does not handle large file transfers (no bandwidth bottleneck), S3 handles the upload reliability (multipart upload, retry), scales to any upload volume without scaling your API, and reduces API server costs. The tradeoff: you need to generate and return the pre-signed URL first, adding one extra API call.' },
          { q: 'How do you handle image processing failures?', a: 'Use SQS between S3 events and Lambda. If Lambda fails to process an image, the message stays in SQS and is retried. Configure a DLQ for messages that fail after maxReceiveCount retries. Monitor DLQ depth with CloudWatch alarms. For the user experience, show a "processing" state in the UI and update to the processed image URL when processing completes (poll or use WebSocket/SNS push notification).' },
        ]
      },
    ],
  },

  'aws-design-ecommerce': {
    slug: 'aws-design-ecommerce', title: 'Design an E-commerce Platform', subtitle: 'Like Amazon — product catalog, orders, cart, and high availability',
    duration: '35 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Requirements and Architecture Overview',
        body: `**Functional Requirements:**\n- Product catalog (browse, search, filter)\n- Shopping cart\n- Order placement and tracking\n- Payment processing\n- Inventory management\n- User authentication\n\n**Non-Functional Requirements:**\n- High availability (99.99%)\n- Handle traffic spikes (Black Friday: 10x normal traffic)\n- Consistent inventory (no overselling)\n- Low latency: <200ms for product pages, <500ms for checkout\n\n**AWS Services:**\n- CloudFront + S3: static assets (product images, frontend)\n- ALB + ECS/EC2: application tier\n- RDS Aurora: orders, users, inventory (ACID transactions)\n- DynamoDB: shopping cart (high-throughput key-value)\n- ElastiCache Redis: product catalog cache, session storage\n- SQS: order processing queue (decouple checkout from fulfillment)\n- SNS: order notifications (email, SMS)\n- Cognito: user authentication\n- Auto Scaling: handle traffic spikes`
      },
      {
        type: 'diagram', variant: 'flow', heading: 'E-commerce Architecture Flow',
        caption: 'Layered architecture with caching at every level',
        steps: [
          { label: 'User Request', desc: 'Browser → CloudFront (static assets cached) → ALB → App Servers (ECS)', color: 'blue' },
          { label: 'Product Catalog', desc: 'App → ElastiCache Redis (cache hit) or Aurora RDS (cache miss, then cache)', color: 'green' },
          { label: 'Shopping Cart', desc: 'App → DynamoDB (userId as partition key, fast reads/writes)', color: 'orange' },
          { label: 'Checkout', desc: 'App → Aurora (ACID transaction: deduct inventory + create order) → SQS', color: 'purple' },
          { label: 'Order Processing', desc: 'SQS → Lambda → payment service → SNS → email/SMS notification', color: 'red' },
        ]
      },
      {
        type: 'text', heading: 'Scaling for Traffic Spikes and Bottlenecks',
        body: `**Handling Black Friday Traffic Spikes:**\n- Auto Scaling Groups with target tracking (CPU at 60%) — scales EC2/ECS automatically\n- Pre-scale before known events: use scheduled scaling to add capacity before Black Friday\n- CloudFront absorbs static asset traffic — product images, CSS, JS never hit your servers\n- ElastiCache Redis caches product catalog — most product page requests never hit the database\n- SQS decouples checkout from order processing — checkout is fast (write to queue), processing happens asynchronously\n\n**Inventory Consistency (No Overselling):**\nThe hardest problem in e-commerce. When 1000 users try to buy the last item simultaneously:\n- Use Aurora with optimistic locking: UPDATE inventory SET quantity = quantity - 1 WHERE productId = X AND quantity > 0. If 0 rows affected, the item is sold out.\n- Use DynamoDB conditional writes for inventory: UpdateItem with ConditionExpression = "quantity > 0"\n- Use SQS FIFO to serialize inventory updates — only one update at a time per product\n\n**Database Scaling:**\n- Aurora read replicas for product catalog reads (read-heavy)\n- Aurora Multi-AZ for high availability\n- RDS Proxy for Lambda connections (prevents connection exhaustion)\n- DynamoDB for shopping cart (no joins needed, high throughput)\n\n**Caching Strategy:**\n- Product catalog: cache in Redis with 5-minute TTL. Invalidate on price/inventory changes.\n- User sessions: store in Redis (not in-memory on app servers — stateless architecture)\n- Search results: cache popular search queries in Redis`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'How do you prevent overselling when inventory is limited?', a: 'Use database-level atomic operations. In Aurora: UPDATE inventory SET quantity = quantity - 1 WHERE productId = X AND quantity > 0 — if 0 rows affected, item is sold out. In DynamoDB: UpdateItem with ConditionExpression. For high-concurrency scenarios, use SQS FIFO to serialize purchase requests for the same product. Use optimistic locking with version numbers to detect concurrent modifications. Never check inventory in application code and then update separately — that creates a race condition.' },
          { q: 'How would you design the shopping cart?', a: 'Use DynamoDB with userId as the partition key and productId as the sort key. This allows: get all cart items for a user (query by partition key), add/remove items (PutItem/DeleteItem), update quantity (UpdateItem). DynamoDB handles high throughput without capacity planning. Cart data is temporary — set a TTL of 30 days for abandoned carts. When the user checks out, read the cart from DynamoDB, validate inventory in Aurora, and create the order in a transaction.' },
        ]
      },
    ],
  },

  'aws-design-video-streaming': {
    slug: 'aws-design-video-streaming', title: 'Design a Video Streaming Platform', subtitle: 'Like Netflix — upload, transcode, and stream video globally',
    duration: '30 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Requirements and AWS Services',
        body: `**Functional Requirements:**\n- Upload videos (up to 10GB)\n- Transcode to multiple resolutions (360p, 720p, 1080p, 4K)\n- Stream video with adaptive bitrate (ABR)\n- Support millions of concurrent viewers\n\n**Non-Functional Requirements:**\n- Upload: handle large files reliably\n- Streaming: low latency start (<2 seconds), smooth playback\n- Global: serve users worldwide with low latency\n- Scale: 1M concurrent viewers\n\n**AWS Services:**\n- S3: store original and transcoded videos\n- AWS Elemental MediaConvert: video transcoding service\n- CloudFront: global video delivery (CDN)\n- Lambda: orchestrate transcoding workflow\n- DynamoDB: video metadata (title, description, S3 keys, status)\n- SQS: transcode job queue\n- SNS: notify users when video is ready\n- API Gateway + Lambda: video management API`
      },
      {
        type: 'diagram', variant: 'flow', heading: 'Video Streaming Architecture',
        caption: 'Upload → Transcode → Distribute — each step is decoupled and scalable',
        steps: [
          { label: 'Upload', desc: 'Client → S3 multipart upload (pre-signed URL) → S3 event → SQS', color: 'blue' },
          { label: 'Transcode', desc: 'SQS → Lambda → MediaConvert job → multiple resolutions in S3', color: 'orange' },
          { label: 'Metadata Update', desc: 'MediaConvert completion event → Lambda → update DynamoDB status to "ready"', color: 'green' },
          { label: 'Stream', desc: 'Viewer → CloudFront → S3 (HLS/DASH segments) → adaptive bitrate player', color: 'purple' },
        ]
      },
      {
        type: 'text', heading: 'Adaptive Bitrate Streaming and Scaling',
        body: `**Adaptive Bitrate Streaming (ABR):** Instead of serving a single video file, transcode the video into multiple quality levels and small segments (2-10 seconds each). The player automatically switches between quality levels based on the viewer's bandwidth. HLS (HTTP Live Streaming) and DASH (Dynamic Adaptive Streaming over HTTP) are the standard protocols.\n\nMediaConvert transcodes the original video into HLS or DASH format: multiple quality levels (360p, 720p, 1080p), each split into small segments, with a manifest file (.m3u8 for HLS) that lists all segments. The player downloads the manifest, then requests segments at the appropriate quality level.\n\n**CloudFront for Video Delivery:** Configure CloudFront with S3 as the origin. Video segments are cached at edge locations — once the first viewer in a region watches a video, subsequent viewers get it from the edge cache. Use CloudFront signed URLs to restrict access to paid content.\n\n**Scaling to 1M Concurrent Viewers:**\n- CloudFront handles the scale — it has virtually unlimited capacity at edge locations\n- S3 scales automatically — no throughput limits for video delivery\n- The bottleneck is NOT serving video (CloudFront handles that) — it is transcoding\n- MediaConvert scales automatically — submit jobs and it processes them in parallel\n- Use SQS to buffer transcode jobs during upload spikes\n\n**Cost Optimization:**\n- Store original videos in S3 Standard, transcoded videos in S3 Standard\n- Move old/unpopular videos to S3 Intelligent-Tiering or Glacier\n- CloudFront reduces S3 data transfer costs (CloudFront pricing is lower than S3 direct transfer)`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'How do you handle video upload for large files (10GB)?', a: 'Use S3 multipart upload via pre-signed URLs. The client splits the file into parts (5MB-5GB each), uploads each part in parallel, and S3 assembles them. Benefits: parallel uploads are faster, failed parts can be retried without re-uploading the entire file, and uploads can be paused and resumed. The AWS SDK handles multipart upload automatically with TransferManager. For browser uploads, use the AWS SDK for JavaScript.' },
          { q: 'How would you implement video access control (paid content)?', a: 'Use CloudFront signed URLs or signed cookies. When a user pays for a video, generate a signed URL with an expiration time (e.g., 4 hours). The signed URL is cryptographically signed with your CloudFront key pair — CloudFront validates the signature and only serves the content if the signature is valid and not expired. Use signed cookies for multi-segment videos (one cookie grants access to all segments). Store access grants in DynamoDB.' },
        ]
      },
    ],
  },

  'aws-design-notification': {
    slug: 'aws-design-notification', title: 'Design a Notification System', subtitle: 'Email, SMS, and push notifications at scale with retry and fan-out',
    duration: '25 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Requirements and Architecture',
        body: `**Functional Requirements:**\n- Send notifications via email, SMS, and mobile push\n- Support transactional (order confirmation) and marketing (promotions) notifications\n- Retry failed notifications\n- Track delivery status\n\n**Non-Functional Requirements:**\n- High throughput: 1M notifications/hour\n- Reliable delivery (retry on failure)\n- Low latency for transactional notifications (<5 seconds)\n- Deduplication (do not send the same notification twice)\n\n**AWS Services:**\n- SNS: send email, SMS, and mobile push notifications\n- SQS: buffer notifications, handle retries\n- Lambda: process notifications, call SNS\n- DynamoDB: track notification status, deduplication\n- SES (Simple Email Service): high-volume email delivery\n- EventBridge: route events to notification service\n- Kinesis: high-throughput event ingestion`
      },
      {
        type: 'diagram', variant: 'flow', heading: 'Notification System Architecture',
        caption: 'Event-driven fan-out with retry and deduplication',
        steps: [
          { label: 'Event Source', desc: 'Order service, payment service → EventBridge → Notification SQS queue', color: 'blue' },
          { label: 'Notification Lambda', desc: 'SQS → Lambda → check DynamoDB for deduplication → route by channel', color: 'green' },
          { label: 'Channel Routing', desc: 'Email → SES, SMS → SNS, Push → SNS mobile push, In-app → WebSocket', color: 'orange' },
          { label: 'Status Tracking', desc: 'Delivery status → DynamoDB → CloudWatch metrics → alerts on failure rate', color: 'purple' },
        ]
      },
      {
        type: 'text', heading: 'Retry, Deduplication, and Scaling',
        body: `**Retry Strategy:** Configure SQS visibility timeout to allow retries. If Lambda fails to send a notification, the message becomes visible again after the timeout and is retried. Set maxReceiveCount = 3 (retry 3 times) before moving to DLQ. For transient failures (SNS/SES rate limits), use exponential backoff in Lambda.\n\n**Deduplication:** Before sending a notification, check DynamoDB for a record with the same notificationId. If it exists and was already sent, skip it. Use DynamoDB conditional writes to atomically check and create the record. This prevents duplicate notifications if the same event is processed twice (SQS at-least-once delivery).\n\n**Rate Limiting:** SNS and SES have sending limits. SES: 14 emails/second (sandbox), up to 1M/day (production). SNS SMS: varies by country. Use SQS to buffer notifications and process at a controlled rate. Use Lambda reserved concurrency to limit parallel processing.\n\n**Scaling:** Lambda scales automatically with SQS. For 1M notifications/hour (~278/second), Lambda handles this easily. SES handles high-volume email. SNS handles SMS and push at scale. The bottleneck is usually external provider rate limits, not AWS services.`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'How do you handle notification failures?', a: 'Use SQS with a DLQ. Lambda retries failed notifications up to maxReceiveCount times. Failed notifications go to the DLQ. Monitor DLQ depth with CloudWatch alarms. Process DLQ messages manually or with a separate Lambda for investigation and reprocessing. For critical notifications (order confirmations), implement a fallback channel (if email fails, try SMS). Track delivery status in DynamoDB for auditing.' },
          { q: 'How would you implement user notification preferences?', a: 'Store preferences in DynamoDB: userId → {email: true, sms: false, push: true, marketing: false}. Before sending a notification, check the user\'s preferences. For marketing notifications, check opt-in status and respect unsubscribe requests (required by CAN-SPAM, GDPR). Use SNS subscription filters to route notifications based on user preferences. Cache preferences in ElastiCache to avoid DynamoDB reads for every notification.' },
        ]
      },
    ],
  },

  'aws-design-log-processing': {
    slug: 'aws-design-log-processing', title: 'Design a Log Processing System', subtitle: 'Real-time log ingestion, processing, storage, and analytics',
    duration: '30 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Requirements and AWS Services',
        body: `**Functional Requirements:**\n- Collect logs from thousands of services\n- Process logs in real-time (detect errors, extract metrics)\n- Store logs for 90 days (hot) and 7 years (cold/compliance)\n- Search and query logs\n- Alert on error patterns\n\n**Non-Functional Requirements:**\n- Ingest: 1M log events/second\n- Processing latency: <30 seconds from log generation to alert\n- Storage: 10TB/day of raw logs\n- Query: ad-hoc queries on recent logs (<30 seconds response)\n\n**AWS Services:**\n- Kinesis Data Streams: high-throughput log ingestion\n- Kinesis Data Firehose: deliver logs to S3 and OpenSearch\n- Lambda: real-time log processing and alerting\n- S3: long-term log storage (with lifecycle to Glacier)\n- Amazon OpenSearch Service: log search and analytics\n- CloudWatch Logs: application log collection\n- SNS: alerting on error patterns\n- Athena: ad-hoc SQL queries on S3 logs`
      },
      {
        type: 'diagram', variant: 'flow', heading: 'Log Processing Pipeline',
        caption: 'Ingest → Process → Store → Analyze — each stage scales independently',
        steps: [
          { label: 'Ingest', desc: 'Services → Kinesis Data Streams (1M events/sec, sharded)', color: 'blue' },
          { label: 'Real-time Processing', desc: 'Kinesis → Lambda → detect errors → SNS alerts', color: 'red' },
          { label: 'Delivery', desc: 'Kinesis Firehose → S3 (raw logs) + OpenSearch (searchable)', color: 'green' },
          { label: 'Long-term Storage', desc: 'S3 lifecycle: Standard (90 days) → Glacier (7 years)', color: 'orange' },
          { label: 'Analytics', desc: 'Athena queries S3 directly (SQL on raw logs, pay per query)', color: 'purple' },
        ]
      },
      {
        type: 'text', heading: 'Kinesis Sharding, Processing, and Cost Optimization',
        body: `**Kinesis Data Streams:** A shard is the base unit of capacity — 1MB/second write, 2MB/second read. For 1M events/second at 1KB average size = 1GB/second → 1000 shards. Use the service name or host as the partition key to distribute logs evenly across shards.\n\n**Lambda Processing:** Lambda polls Kinesis shards and processes records in batches. One Lambda invocation per shard per batch. Process: parse log line, extract fields (timestamp, level, service, message), check for ERROR/CRITICAL patterns, publish metrics to CloudWatch, send alerts via SNS for critical errors.\n\n**Kinesis Firehose:** Buffers records and delivers to S3 in batches (configurable: 1-128MB or 60-900 seconds). Automatically compresses (gzip, snappy) and converts format (JSON to Parquet for Athena). No Lambda needed for delivery — fully managed.\n\n**Cost Optimization:**\n- Compress logs before storing in S3 (gzip reduces size by 70-90%)\n- Convert to columnar format (Parquet) for Athena queries (10x cheaper to query)\n- Use S3 lifecycle policies to move old logs to Glacier\n- Use Kinesis Firehose instead of Lambda for delivery (cheaper, no code to maintain)\n- Use Athena for ad-hoc queries instead of keeping all logs in OpenSearch (OpenSearch is expensive at scale)`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'How do you handle Kinesis shard limits?', a: 'Each Kinesis shard handles 1MB/second write and 2MB/second read. If you exceed shard capacity, records are throttled. Solutions: reshard (increase shard count) using UpdateShardCount, use enhanced fan-out for consumers that need dedicated 2MB/second per shard, use Kinesis Data Firehose for delivery (it handles sharding automatically), or use Kinesis Data Analytics for real-time processing without managing shards.' },
          { q: 'How would you implement real-time alerting on log patterns?', a: 'Lambda processes Kinesis records in real-time. For each batch, scan for ERROR or CRITICAL log levels. Use regex or structured log parsing to extract error types. Publish custom CloudWatch metrics (error count by service). Create CloudWatch alarms on these metrics. When an alarm triggers, SNS sends to PagerDuty/OpsGenie. For complex pattern matching (e.g., error rate > 5% in 5 minutes), use CloudWatch Logs Metric Filters or a Lambda that maintains a sliding window counter in ElastiCache.' },
        ]
      },
    ],
  },


  // ── PRODUCTION SCENARIOS ──────────────────────────────────────────────────
  'aws-scenario-high-traffic': {
    slug: 'aws-scenario-high-traffic', title: 'High Traffic Website Slowdown', subtitle: 'Investigate and optimize performance during peak hours',
    duration: '25 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Situation',
        body: `Your e-commerce website is experiencing slow response times during peak hours (evenings and weekends). Users are complaining about pages taking 5-10 seconds to load. The site is hosted on EC2 behind an ALB, with an RDS MySQL database and ElastiCache Redis. Normal response time is under 500ms.\n\nThis is a classic performance investigation scenario. The key is to approach it systematically — do not guess, measure. Start with the highest-level metrics and drill down to find the bottleneck.`
      },
      {
        type: 'text', heading: 'Investigation Steps',
        body: `**Step 1: Check ALB Metrics in CloudWatch**\nLook at: TargetResponseTime (is it high?), RequestCount (is traffic higher than normal?), HTTPCode_Target_5XX_Count (are there errors?), HealthyHostCount (are all instances healthy?).\n\n**Step 2: Check EC2 Instance Metrics**\nFor each EC2 instance: CPUUtilization (is it maxed out?), NetworkIn/Out (network saturation?), StatusCheckFailed (instance health?). If CPU is at 100%, the instances are the bottleneck.\n\n**Step 3: Check RDS Metrics**\nDatabaseConnections (are you hitting the connection limit?), CPUUtilization (is the database CPU maxed?), ReadLatency/WriteLatency (are queries slow?), FreeStorageSpace (is disk full?). Enable Performance Insights to identify slow queries.\n\n**Step 4: Check ElastiCache Metrics**\nCacheHits vs CacheMisses (is the cache effective?), CurrConnections (connection count), Evictions (is the cache too small?), CPUUtilization.\n\n**Step 5: Check Application Logs**\nUse CloudWatch Logs Insights to find slow requests:\n\`\`\`\nfilter @message like /response_time/\n| stats avg(response_time), max(response_time) by endpoint\n| sort max(response_time) desc\n\`\`\``
      },
      {
        type: 'text', heading: 'Root Causes and Solutions',
        body: `**Root Cause 1: EC2 instances under-provisioned**\nSymptom: CPU at 90-100% during peak. Solution: scale out (add more instances via Auto Scaling) or scale up (larger instance type). Implement target tracking Auto Scaling to automatically add instances when CPU exceeds 70%.\n\n**Root Cause 2: Database connection exhaustion**\nSymptom: DatabaseConnections at max, application errors "too many connections". Solution: implement RDS Proxy to pool connections. Reduce connection pool size in application config. Add read replicas for read-heavy queries.\n\n**Root Cause 3: Slow database queries**\nSymptom: high ReadLatency in RDS, Performance Insights shows specific queries consuming most DB time. Solution: add database indexes for slow queries, optimize N+1 query patterns, cache query results in ElastiCache.\n\n**Root Cause 4: Cache not effective**\nSymptom: high CacheMisses, low hit rate. Solution: review caching strategy — are you caching the right data? Is the TTL too short? Is the cache too small (causing evictions)? Increase ElastiCache node size or add nodes.\n\n**Root Cause 5: No CDN for static assets**\nSymptom: high NetworkOut on EC2, ALB serving static files. Solution: move static assets to S3 + CloudFront. This alone can reduce EC2 load by 50-70% for content-heavy sites.\n\n**Prevention:**\n- Set up Auto Scaling with target tracking (CPU at 60%)\n- Configure CloudWatch alarms for CPU, latency, and error rate\n- Implement CloudFront for static assets\n- Use RDS Proxy for connection pooling\n- Load test before peak events (Black Friday, product launches)`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'Walk me through how you would debug a slow AWS application.', a: 'Start at the top: check ALB metrics (response time, error rate, request count). If ALB response time is high, check EC2 CPU and memory. If EC2 is healthy, check RDS metrics (connections, CPU, query latency). Use RDS Performance Insights to find slow queries. Check ElastiCache hit rate. Use CloudWatch Logs Insights to find slow endpoints. Use X-Ray to trace individual slow requests through the system. The goal is to find the bottleneck layer by layer.' },
          { q: 'How do you handle a sudden 10x traffic spike?', a: 'If Auto Scaling is configured, it will add instances automatically — but there is a lag (2-5 minutes to launch new instances). To handle sudden spikes: use CloudFront to absorb static traffic at the edge, use ElastiCache to reduce database load, pre-scale before known events (scheduled scaling), use Spot Instances in the Auto Scaling Group for cost-effective burst capacity, and use SQS to queue requests during the spike and process them as capacity allows.' },
        ]
      },
    ],
  },

  'aws-scenario-disaster-recovery': {
    slug: 'aws-scenario-disaster-recovery', title: 'Disaster Recovery Planning', subtitle: 'RTO, RPO, backup strategies, and multi-region failover',
    duration: '25 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Situation and DR Concepts',
        body: `Your company runs critical applications on AWS and needs a disaster recovery plan. The business requires: RTO (Recovery Time Objective) of 1 hour — the application must be back online within 1 hour of a disaster. RPO (Recovery Point Objective) of 15 minutes — you can lose at most 15 minutes of data.\n\n**RTO** is how long it takes to restore service. **RPO** is how much data you can afford to lose. These drive your DR architecture choices. Lower RTO/RPO = more expensive (active-active multi-region). Higher RTO/RPO = cheaper (backup and restore).\n\n**DR Strategies (from cheapest to most expensive):**\n1. Backup and Restore: backup data to S3, restore to new infrastructure when needed. RTO: hours. RPO: hours.\n2. Pilot Light: minimal infrastructure running in DR region (just the database). Scale up when needed. RTO: 30-60 minutes. RPO: minutes.\n3. Warm Standby: scaled-down version of production running in DR region. Scale up when needed. RTO: minutes. RPO: seconds.\n4. Active-Active: full production running in multiple regions simultaneously. RTO: seconds. RPO: near-zero.`
      },
      {
        type: 'text', heading: 'Implementation Steps',
        body: `**For RTO=1 hour, RPO=15 minutes — Warm Standby approach:**\n\n**Step 1: Data Replication**\n- RDS: enable automated backups (daily snapshots + transaction logs for point-in-time recovery to 5-minute granularity). Enable cross-region automated backup replication.\n- Aurora: use Aurora Global Database — replicates to DR region with <1 second lag. Promotes to primary in <1 minute.\n- S3: enable Cross-Region Replication (CRR) for critical buckets.\n- DynamoDB: enable Global Tables for multi-region replication.\n\n**Step 2: Infrastructure in DR Region**\n- Use CloudFormation/CDK to define all infrastructure as code. Deploy the same stack to the DR region.\n- Keep a scaled-down version running (1 instance instead of 10) to reduce costs.\n- Use Route 53 health checks and failover routing to automatically redirect traffic.\n\n**Step 3: Automate Failover**\n- Route 53 health check monitors the primary region's ALB endpoint.\n- If health check fails for 3 consecutive checks, Route 53 automatically routes traffic to the DR region.\n- In the DR region, Auto Scaling Group scales up to full capacity.\n- Aurora Global Database promotes the DR region to primary.\n\n**Step 4: Test Regularly**\n- Run DR drills quarterly — actually fail over to the DR region and verify the application works.\n- Measure actual RTO and RPO during drills — they are often worse than expected.\n- Document the runbook: step-by-step instructions for manual failover if automation fails.`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'What is the difference between RTO and RPO?', a: 'RTO (Recovery Time Objective) is the maximum acceptable time to restore service after a disaster — how long can the business tolerate downtime? RPO (Recovery Point Objective) is the maximum acceptable data loss — how much data can the business afford to lose? Example: RTO=1 hour means the application must be back online within 1 hour. RPO=15 minutes means you can lose at most 15 minutes of data. Lower RTO/RPO requires more expensive architecture (active-active multi-region).' },
          { q: 'How would you implement a DR plan with near-zero RPO?', a: 'Use Aurora Global Database — replicates to DR region with <1 second lag. Use DynamoDB Global Tables for NoSQL data. Use S3 Cross-Region Replication for object storage. Use active-active architecture with Route 53 latency-based routing — both regions serve traffic simultaneously. If one region fails, Route 53 automatically routes all traffic to the healthy region. This achieves near-zero RPO (data is replicated in real-time) and near-zero RTO (traffic is already flowing to the DR region).' },
        ]
      },
    ],
  },

  'aws-scenario-cost-optimization': {
    slug: 'aws-scenario-cost-optimization', title: 'AWS Cost Optimization', subtitle: 'Identify cost-consuming resources and reduce spend without impacting performance',
    duration: '25 min', difficulty: 'Intermediate',
    sections: [
      {
        type: 'text', heading: 'Situation',
        body: `Your finance department has noticed an unexpected spike in AWS costs — the monthly bill jumped from $50,000 to $80,000 with no corresponding increase in traffic or new features. You need to identify the cause and implement cost optimization strategies.\n\nCost optimization is a continuous process, not a one-time fix. AWS provides several tools to help: AWS Cost Explorer (visualize and analyze costs), AWS Cost Anomaly Detection (ML-based anomaly detection), AWS Trusted Advisor (cost optimization recommendations), AWS Compute Optimizer (right-sizing recommendations), and Cost Allocation Tags (attribute costs to teams/projects).`
      },
      {
        type: 'text', heading: 'Investigation and Optimization Strategies',
        body: `**Step 1: Identify the Cost Spike**\nOpen AWS Cost Explorer. Filter by service to see which service increased. Filter by time to see when the increase started. Use cost allocation tags to identify which team or project is responsible. Check AWS Cost Anomaly Detection for automated anomaly reports.\n\n**Step 2: Common Cost Culprits**\n- **Data transfer:** Unexpected cross-region or internet data transfer. Check EC2 data transfer costs. Use VPC endpoints for S3/DynamoDB to avoid NAT Gateway charges.\n- **NAT Gateway:** $0.045/GB processed. High-volume applications can generate thousands of dollars in NAT Gateway costs. Use VPC endpoints for AWS services.\n- **Unattached EBS volumes:** Volumes that are not attached to any instance still incur storage costs. Use AWS Config to find and delete unattached volumes.\n- **Idle EC2 instances:** Instances running 24/7 with <5% CPU utilization. Use AWS Compute Optimizer to identify over-provisioned instances.\n- **Snapshots:** Old EBS snapshots accumulate. Use Data Lifecycle Manager to automatically delete old snapshots.\n- **RDS instances:** Dev/test RDS instances running 24/7. Schedule them to stop outside business hours.\n\n**Step 3: Optimization Actions**\n- Right-size EC2 instances using Compute Optimizer recommendations\n- Purchase Reserved Instances or Savings Plans for steady-state workloads (up to 72% discount)\n- Use Spot Instances for batch jobs and CI/CD (up to 90% discount)\n- Enable S3 Intelligent-Tiering for infrequently accessed data\n- Delete unattached EBS volumes and old snapshots\n- Stop dev/test resources outside business hours (use Lambda + EventBridge scheduler)\n- Use Graviton (ARM) instances — 20-40% cheaper than x86 for the same performance`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'How do you reduce EC2 costs by 50% without impacting production?', a: 'Purchase Reserved Instances or Savings Plans for baseline capacity (up to 72% discount). Use Spot Instances for fault-tolerant workloads (batch jobs, CI/CD) — up to 90% discount. Right-size instances using Compute Optimizer — many instances are over-provisioned. Use Graviton (ARM) instances — 20-40% cheaper. Stop non-production instances outside business hours. Use Auto Scaling to scale down during low-traffic periods. These combined can easily achieve 50%+ cost reduction.' },
          { q: 'What is the difference between Reserved Instances and Savings Plans?', a: 'Reserved Instances commit to a specific instance type, region, and OS for 1 or 3 years — up to 72% discount. Less flexible (changing instance type requires converting or selling the RI). Savings Plans commit to a spend level ($/hour) for 1 or 3 years — up to 66% discount. More flexible — applies to any EC2 instance type, Lambda, and Fargate. Compute Savings Plans are the most flexible. Use Savings Plans for most workloads; use Reserved Instances when you need the maximum discount for a specific instance type.' },
        ]
      },
    ],
  },

  'aws-scenario-lambda-timeout': {
    slug: 'aws-scenario-lambda-timeout', title: 'Lambda Function Timeout', subtitle: 'Debug and fix Lambda timeouts in production',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Situation',
        body: `Your Lambda function is hitting its 30-second timeout in production. The function processes orders from an SQS queue and writes to RDS. It was working fine for months, but started timing out after a recent deployment. Users are seeing order processing delays, and the SQS queue is growing.\n\nLambda timeouts are one of the most common production issues. The key is to identify WHERE the function is spending its time — is it a slow database query? A network call? A cold start? An infinite loop?`
      },
      {
        type: 'text', heading: 'Debug Steps and Root Causes',
        body: `**Step 1: Check CloudWatch Logs**\nLook for the REPORT line at the end of each invocation: "REPORT RequestId: ... Duration: 29847.23 ms". This tells you the actual execution time. Look for the last log line before the timeout — this tells you where the function was when it timed out.\n\n**Step 2: Enable X-Ray Tracing**\nX-Ray shows a timeline of your function's execution — how long each operation took. Add the X-Ray SDK to your function and instrument database calls and HTTP requests. This immediately shows you which operation is slow.\n\n**Step 3: Check VPC Configuration**\nIf your Lambda is in a VPC, it needs a NAT Gateway to access the internet (for external APIs) and VPC endpoints for AWS services (RDS, DynamoDB). A misconfigured VPC can cause Lambda to hang waiting for network connections that never complete.\n\n**Common Root Causes:**\n\n**Slow database queries:** A recent schema change or data growth made a query slow. Check RDS Performance Insights for slow queries. Add indexes. Optimize the query.\n\n**Database connection exhaustion:** Lambda scaled up and created too many connections to RDS. The function hangs waiting for a connection. Solution: implement RDS Proxy.\n\n**Cold start in VPC:** Lambda in a VPC has longer cold starts (ENI attachment). Use Provisioned Concurrency to eliminate cold starts.\n\n**External API timeout:** The function calls an external API that is slow or unresponsive. Add a timeout to the HTTP client (e.g., 5 seconds). Implement circuit breaker pattern.\n\n**Memory pressure:** Function is using too much memory, causing garbage collection pauses. Increase memory allocation.\n\n**Prevention:**\n- Set CloudWatch alarms on Lambda Duration (alert at 80% of timeout)\n- Use X-Ray for all production Lambda functions\n- Implement RDS Proxy for Lambda → RDS connections\n- Set HTTP client timeouts shorter than Lambda timeout\n- Load test Lambda functions before deployment`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'Your Lambda function is timing out. Walk me through your debugging process.', a: '(1) Check CloudWatch Logs — find the last log line before timeout to identify where it hung. (2) Enable X-Ray tracing — see a timeline of all operations and identify the slow one. (3) Check if it is a VPC issue — Lambda in VPC needs NAT Gateway for internet access and VPC endpoints for AWS services. (4) Check RDS Performance Insights for slow queries. (5) Check if Lambda is waiting for database connections (implement RDS Proxy). (6) Check external API calls — add timeouts. (7) Increase Lambda timeout as a temporary fix while investigating.' },
          { q: 'How do you prevent Lambda from overwhelming your RDS database?', a: 'Use RDS Proxy — it pools database connections between Lambda and RDS. Lambda can create thousands of concurrent connections, but RDS Proxy multiplexes them through a smaller pool. Configure the pool size based on your RDS instance\'s max_connections. Also: set Lambda reserved concurrency to limit the maximum number of concurrent Lambda instances. Use connection pooling in your Lambda code (initialize the connection outside the handler so it is reused across invocations).' },
        ]
      },
    ],
  },

  'aws-scenario-ec2-500-errors': {
    slug: 'aws-scenario-ec2-500-errors', title: 'EC2 Random 500 Errors', subtitle: 'Debug random 500 errors on EC2 behind an ALB during peak traffic',
    duration: '20 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Situation',
        body: `Your application is hosted on EC2 behind an ALB. During peak traffic, users are experiencing random 500 errors. The errors are intermittent — not all requests fail, just some. The application was working fine before, and no code changes were deployed recently.\n\nRandom 500 errors during peak traffic are a classic scaling problem. The key is to determine whether the errors are coming from the application (5XX from EC2) or from the ALB itself (ALB-generated 502/503/504).`
      },
      {
        type: 'text', heading: 'Investigation and Root Causes',
        body: `**Step 1: Check ALB Access Logs**\nEnable ALB access logs to S3. Query with Athena:\n\`\`\`sql\nSELECT elb_status_code, target_status_code, \n       request_processing_time, target_processing_time,\n       COUNT(*) as count\nFROM alb_logs\nWHERE time > '2024-01-01'\nGROUP BY 1,2,3,4\nORDER BY count DESC;\n\`\`\`\n\n**Step 2: Distinguish ALB 5XX vs Target 5XX**\n- HTTPCode_ELB_5XX: errors generated by the ALB itself (502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout)\n- HTTPCode_Target_5XX: errors returned by your EC2 instances\n\n**Common Root Causes:**\n\n**502 Bad Gateway:** EC2 instance returned an invalid response. Causes: application crashed, out of memory, connection reset. Check EC2 application logs.\n\n**503 Service Unavailable:** No healthy targets. All EC2 instances failed health checks. Check health check configuration — is the health check endpoint correct? Is the application starting up slowly?\n\n**504 Gateway Timeout:** EC2 instance did not respond within the ALB idle timeout (default 60 seconds). Causes: slow database queries, external API calls, application deadlock. Increase ALB idle timeout or fix the slow operation.\n\n**Application-level 500:** EC2 returned 500. Check application logs in CloudWatch Logs. Common causes: unhandled exceptions, database errors, out of memory.\n\n**Prevention:**\n- Enable ALB access logs and set up CloudWatch alarms on 5XX rate\n- Implement proper health check endpoints that verify application health\n- Use Auto Scaling to replace unhealthy instances\n- Implement circuit breakers for external dependencies\n- Set up structured logging for easier debugging`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'How do you distinguish between ALB-generated 5XX errors and application 5XX errors?', a: 'Check two CloudWatch metrics: HTTPCode_ELB_5XX (errors generated by the ALB — 502, 503, 504) and HTTPCode_Target_5XX (errors returned by your EC2 instances). If ELB_5XX is high but Target_5XX is low, the ALB cannot reach your instances (health check failures, connection timeouts). If Target_5XX is high, your application is returning errors — check application logs. Enable ALB access logs for detailed per-request analysis.' },
          { q: 'An EC2 instance keeps failing health checks. How do you troubleshoot?', a: '(1) SSH into the instance and check if the application is running (systemctl status app). (2) Test the health check endpoint locally: curl localhost:3000/health. (3) Check application logs for errors. (4) Check if the security group allows traffic from the ALB on the health check port. (5) Check if the health check path is correct (returns 200, not 301 redirect). (6) Check if the instance has enough memory and CPU. (7) Check if the health check timeout is long enough for the application to respond.' },
        ]
      },
    ],
  },

  'aws-scenario-multi-region': {
    slug: 'aws-scenario-multi-region', title: 'Multi-Region Deployment', subtitle: 'Challenges, architecture, and failover for global high availability',
    duration: '25 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Situation and Challenges',
        body: `Your company is expanding globally and needs to deploy applications in multiple AWS regions to serve users in North America, Europe, and Asia with low latency and high availability. You need to architect a multi-region deployment.\n\n**Challenges of Multi-Region:**\n- **Data consistency:** How do you keep data in sync across regions? Synchronous replication adds latency. Asynchronous replication risks data loss.\n- **Deployment complexity:** Deploying to multiple regions requires coordinated CI/CD pipelines.\n- **Cost:** Running infrastructure in multiple regions doubles or triples costs.\n- **Cross-region communication:** Services in different regions communicate over the internet (or AWS backbone) — higher latency than intra-region.\n- **Compliance:** Some data cannot leave specific regions (GDPR, data residency laws).`
      },
      {
        type: 'text', heading: 'Architecture and Implementation',
        body: `**Active-Active Multi-Region Architecture:**\n\nAll regions serve traffic simultaneously. Route 53 latency-based routing directs users to the nearest region. Each region has its own ALB, ECS cluster, and database.\n\n**Data Layer:**\n- Aurora Global Database: primary in us-east-1, read replicas in eu-west-1 and ap-southeast-1. Replication lag <1 second. Writes go to primary, reads from local replica.\n- DynamoDB Global Tables: multi-master, all regions can write. Eventual consistency with <1 second replication.\n- S3 Cross-Region Replication: replicate objects to all regions.\n\n**Application Layer:**\n- Design stateless services — no session state on the server. Store sessions in DynamoDB Global Tables or ElastiCache (with cross-region replication).\n- Use CloudFront for static assets — single distribution serves all regions from edge locations.\n\n**Routing:**\n- Route 53 latency-based routing: users are directed to the region with the lowest latency.\n- Route 53 health checks: if a region fails, Route 53 automatically routes traffic to healthy regions.\n- CloudFront: for static content and API caching, CloudFront serves from the nearest edge location regardless of region.\n\n**Failover:**\n- Route 53 detects the primary region failure via health checks.\n- Traffic is automatically routed to the next-lowest-latency region.\n- Aurora Global Database promotes the DR region to primary in <1 minute.\n- RTO: <5 minutes. RPO: <1 second (Aurora Global Database).`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'How do you handle data consistency in a multi-region active-active setup?', a: 'Use eventually consistent data stores with conflict resolution: DynamoDB Global Tables (last-writer-wins conflict resolution), Aurora Global Database (single primary for writes, read replicas in other regions). For strong consistency requirements, route all writes to a single primary region and reads to local replicas. Accept that there will be a small replication lag (<1 second for Aurora Global Database). Design your application to handle eventual consistency — show "processing" states, use optimistic locking.' },
          { q: 'What are the cost implications of multi-region?', a: 'Multi-region roughly doubles or triples infrastructure costs: you run the same infrastructure in 2-3 regions. Additional costs: cross-region data transfer (AWS charges for data leaving a region), Route 53 health checks, Aurora Global Database replication. Optimize costs: use smaller instances in secondary regions (scale up only during failover), use CloudFront to reduce origin requests, use S3 CRR only for critical data. Multi-region is expensive — justify it with business requirements (global users, compliance, SLA).' },
        ]
      },
    ],
  },

  'aws-scenario-serverless-migration': {
    slug: 'aws-scenario-serverless-migration', title: 'EC2 to Serverless Migration', subtitle: 'Migrate from EC2 to Lambda and Fargate — planning, execution, and monitoring',
    duration: '25 min', difficulty: 'Advanced',
    sections: [
      {
        type: 'text', heading: 'Situation',
        body: `Your team wants to migrate a monolithic application running on EC2 to a serverless architecture using Lambda and Fargate. The goal is to reduce operational overhead, improve scalability, and reduce costs for variable workloads.\n\nMigrating to serverless is not just a technical change — it requires rethinking your application architecture. Serverless works best for event-driven, stateless, short-lived workloads. Long-running processes, stateful applications, and workloads requiring consistent CPU are better suited for EC2 or containers.`
      },
      {
        type: 'text', heading: 'Migration Plan and Considerations',
        body: `**Migration Strategy: Strangler Fig Pattern**\nDo not rewrite everything at once. Gradually replace EC2 components with serverless equivalents, routing traffic to the new implementation while keeping the old one running. This reduces risk and allows incremental validation.\n\n**Component Mapping:**\n\`\`\`\nEC2 Component              → Serverless Equivalent\nNginx/Express API          → API Gateway + Lambda\nBackground workers         → SQS + Lambda\nScheduled cron jobs        → EventBridge + Lambda\nFile processing            → S3 events + Lambda\nLong-running processes     → ECS Fargate\nDatabase (MySQL on EC2)    → Aurora Serverless v2\nSession storage            → DynamoDB or ElastiCache\nSecrets (env files)        → AWS Secrets Manager\nCI/CD (manual scripts)     → CodePipeline + CodeBuild\n\`\`\`\n\n**Key Considerations:**\n\n**Cold Starts:** Lambda has cold starts (100ms-1s). For latency-sensitive APIs, use Provisioned Concurrency. For background processing, cold starts are acceptable.\n\n**Statelessness:** Lambda functions must be stateless — no in-memory state between invocations. Move session state to DynamoDB or ElastiCache. Move file storage to S3.\n\n**Timeout Limits:** Lambda has a 15-minute maximum timeout. Long-running processes (>15 minutes) must be broken into smaller steps using Step Functions or moved to Fargate.\n\n**Database Connections:** Lambda can create thousands of concurrent connections to RDS. Use RDS Proxy to pool connections.\n\n**Monitoring Changes:** Replace SSH-based log access with CloudWatch Logs. Replace custom monitoring with CloudWatch metrics and X-Ray tracing. Set up dashboards and alarms before migrating.\n\n**Cost Analysis:** Serverless is cheaper for variable workloads (pay per invocation) but can be more expensive than Reserved EC2 for steady-state high-throughput workloads. Calculate the break-even point before migrating.`
      },
      {
        type: 'faq', heading: 'Interview Questions',
        questions: [
          { q: 'What are the main challenges when migrating from EC2 to Lambda?', a: 'Cold starts (mitigate with Provisioned Concurrency), statelessness requirement (move state to DynamoDB/ElastiCache), 15-minute timeout limit (break long processes into steps or use Fargate), database connection limits (use RDS Proxy), different deployment model (no SSH, use CloudWatch Logs), different monitoring (CloudWatch instead of server metrics), and cost model change (per-invocation vs per-hour). Not all workloads are suitable for Lambda — evaluate each component.' },
          { q: 'When would you use Fargate instead of Lambda for a serverless migration?', a: 'Use Fargate when: the process runs longer than 15 minutes (Lambda timeout), the workload requires more than 10GB memory, you need GPU access, the application requires a persistent filesystem, you are migrating a containerized application and want to keep the container model, or the workload has consistent high CPU usage (Lambda is more expensive than Fargate for sustained compute). Fargate is serverless containers — no EC2 management, but you still define container resources.' },
        ]
      },
    ],
  },

};

// ── UTILITY FUNCTIONS ─────────────────────────────────────────────────────
export const getTopicBySlug = (slug) => AWS_TOPICS[slug] || null;

export const getNextTopic = (slug) => {
  const allSlugs = AWS_SECTIONS.flatMap(s => s.topics);
  const idx = allSlugs.indexOf(slug);
  return idx >= 0 && idx < allSlugs.length - 1 ? AWS_TOPICS[allSlugs[idx + 1]] : null;
};

export const getPrevTopic = (slug) => {
  const allSlugs = AWS_SECTIONS.flatMap(s => s.topics);
  const idx = allSlugs.indexOf(slug);
  return idx > 0 ? AWS_TOPICS[allSlugs[idx - 1]] : null;
};
