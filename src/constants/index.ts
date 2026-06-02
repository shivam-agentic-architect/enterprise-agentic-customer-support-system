export interface AWSServiceDetails {
  id: string;
  name: string;
  category: 'security' | 'gateway' | 'compute' | 'orchestration' | 'ai' | 'database' | 'monitoring' | 'telephony';
  description: string;
  role: string;
  details: string[];
}

export const AWS_SERVICES: AWSServiceDetails[] = [
  {
    id: 'cognito',
    name: 'Amazon Cognito',
    category: 'security',
    description: 'Secure, frictionless customer identity and access management.',
    role: 'Authenticates and authorizes customer sessions, providing JWT security tokens.',
    details: [
      'Multi-factor authentication (MFA)',
      'Federated login via SAML 2.0 / OpenID Connect',
      'Secure user pool storage and verification'
    ]
  },
  {
    id: 'api-gateway',
    name: 'Amazon API Gateway',
    category: 'gateway',
    description: 'Fully managed service that makes it easy for developers to create APIs at scale.',
    role: 'Exposes HTTP endpoints for customer chat, tickets, and CRM integrations.',
    details: [
      'Built-in rate limiting and DDoS protection',
      'WebSocket protocol support for real-time streaming',
      'API caching for faster responses'
    ]
  },
  {
    id: 'lambda',
    name: 'AWS Lambda',
    category: 'compute',
    description: 'Serverless, event-driven compute service to run code without provisioning servers.',
    role: 'Executes CRM/Database lookup tools, triggers notifications, and handles short tasks.',
    details: [
      'Automatic scaling to thousands of concurrent requests',
      'Sub-second billing based on millisecond execution times',
      'Native integration with Bedrock for Tool Calling workflows'
    ]
  },
  {
    id: 'ecs',
    name: 'Amazon ECS (Fargate)',
    category: 'orchestration',
    description: 'Fully managed container orchestration service with serverless compute.',
    role: 'Hosts the main Enterprise AI Agent Orchestrator which coordinates multi-agent processing.',
    details: [
      'Runs the orchestrator Node.js / Python daemon',
      'Serverless computing via AWS Fargate (no EC2 provisioning)',
      'High-speed VPC networking with sub-millisecond database queries'
    ]
  },
  {
    id: 'bedrock',
    name: 'Amazon Bedrock',
    category: 'ai',
    description: 'Fully managed service that offers choice of high-performing Foundation Models (FMs).',
    role: 'Executes reasoning, intent routing, and natural language response generation using LLMs.',
    details: [
      'Access to Anthropic Claude 3.5, Meta Llama 3, and Amazon Titan',
      'Serverless orchestration of Agents and Guardrails',
      'No data is sent over the public internet, ensuring enterprise compliance'
    ]
  },
  {
    id: 'opensearch',
    name: 'Amazon OpenSearch (Vector)',
    category: 'database',
    description: 'Fully managed vector search database for real-time RAG.',
    role: 'Stores and searches high-dimensional vector embeddings of FAQs, SOPs, and policies.',
    details: [
      'High-performance k-Nearest Neighbors (k-NN) search',
      'Real-time indexing of uploaded PDFs and documents',
      'Semantic matching for advanced question-answering'
    ]
  },
  {
    id: 'rds',
    name: 'Amazon RDS (Aurora)',
    category: 'database',
    description: 'Cloud relational database built for enterprise scale and speed.',
    role: 'Maintains transactional customer history, order logs, and ticket statuses.',
    details: [
      'Aurora Serverless v2 for automatic, cost-effective scaling',
      'Multi-AZ active-active replication for 99.99% availability',
      'Encrypted-at-rest storage keeping PII secure'
    ]
  },
  {
    id: 'cloudwatch',
    name: 'Amazon CloudWatch',
    category: 'monitoring',
    description: 'Real-time monitoring and observability dashboard.',
    role: 'Monitors agent health, LLM latencies, vector storage load, and audit logs.',
    details: [
      'Real-time alarm thresholds for elevated agent latencies',
      'Unified logs tracking multi-agent decisions',
      'Custom metric dashboards tracking RAG token consumption'
    ]
  },
  {
    id: 'connect',
    name: 'Amazon Connect',
    category: 'telephony',
    description: 'Omnichannel cloud contact center with AI integration.',
    role: 'Orchestrates live voice escalations and transfers customer sessions to human agents.',
    details: [
      'Natural-sounding interactive voice response (IVR)',
      'Automated customer profile popups during handoff',
      'Conversational voice analytics tracking customer sentiments'
    ]
  }
];

export const SUGGESTED_PROMPTS = [
  'Verify identity of customer John Doe',
  'Retrieve order status for invoice ID #88921',
  'Summarize standard refund policy on electronics',
  'Analyze customer sentiment and trigger executive escalation',
  'Process standard replacement request for broken charging port'
];

export const BEDROCK_MODELS = [
  { id: 'anthropic.claude-3-5-sonnet', name: 'Anthropic Claude 3.5 Sonnet v2', provider: 'Anthropic', latency: '0.8s' },
  { id: 'meta.llama-3-1-70b-instruct', name: 'Meta Llama 3.1 70B Instruct', provider: 'Meta', latency: '0.5s' },
  { id: 'amazon.titan-text-express-v1', name: 'Amazon Titan Text Express', provider: 'Amazon', latency: '0.3s' },
  { id: 'mistral.mistral-large-2407', name: 'Mistral Large 2', provider: 'Mistral', latency: '0.7s' }
];

export const SIDEBAR_LINKS = [
  { label: 'Dashboard', path: '/dashboard', iconName: 'LayoutDashboard' },
  { label: 'Conversations', path: '/conversations', iconName: 'MessageSquareCode' },
  { label: 'Customers', path: '/customers', iconName: 'Users' },
  { label: 'Tickets', path: '/tickets', iconName: 'Ticket' },
  { label: 'Knowledge Base', path: '/knowledge-base', iconName: 'FileSearch' },
  { label: 'AI Agents', path: '/ai-agents', iconName: 'Cpu' },
  { label: 'Architecture', path: '/architecture', iconName: 'Network' },
  { label: 'Analytics', path: '/analytics', iconName: 'BarChart3' },
  { label: 'Settings', path: '/settings', iconName: 'Settings' }
];
