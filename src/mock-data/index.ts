import { Customer, Ticket, Conversation, KBArticle, AgentStatus, TicketTrend, EscalationReason } from '../types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-1029',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@nexustech.io',
    phone: '+1 (555) 382-9011',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    plan: 'enterprise',
    sentiment: 'frustrated',
    sentimentScore: 28,
    summary: 'Sarah is the CTO of NexusTech, a key enterprise client. She is currently experiencing persistent activation errors on her corporate device profile and is critical of delayed SLA response times.',
    orders: [
      { id: 'ORD-9801', item: 'iPhone 15 Pro Max 1TB Enterprise Pack', date: '2026-05-10', amount: 8499.00, status: 'delivered' },
      { id: 'ORD-9742', item: 'Lauki Premium Charging Pod 10x Pack', date: '2026-04-12', amount: 1200.00, status: 'delivered' }
    ],
    tickets: [],
    aiRecommendations: [
      'Offer immediate replacement of corporate profile keys via Secure Token API.',
      'Waive current monthly accessory tier charge ($150) as goodwill gesture.',
      'Assign dedicated solutions architect if problem persists past 4 hours.'
    ]
  },
  {
    id: 'CUST-3044',
    name: 'David Chen',
    email: 'd.chen@prismmedia.com',
    phone: '+1 (555) 728-1192',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    plan: 'premium',
    sentiment: 'happy',
    sentimentScore: 89,
    summary: 'David Chen manages client relations for Prism Media. He is highly satisfied with Lauki Customer Care automation and has recently commended our quick delivery on international hardware replacements.',
    orders: [
      { id: 'ORD-8944', item: 'Lauki Secure Phone Core Gen-2', date: '2026-05-24', amount: 1299.00, status: 'processing' },
      { id: 'ORD-8431', item: 'Lauki Glass Shield Guard v4', date: '2026-03-01', amount: 89.00, status: 'delivered' }
    ],
    tickets: [],
    aiRecommendations: [
      'Present cross-sell opportunity for the upcoming Lauki SmartDock Ultra.',
      'Invite to the Premium Client feedback panel in June.'
    ]
  },
  {
    id: 'CUST-5512',
    name: 'Elena Rostova',
    email: 'elena.rostova@globalsecure.net',
    phone: '+44 20 7946 0918',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    plan: 'enterprise',
    sentiment: 'neutral',
    sentimentScore: 55,
    summary: 'Elena is an information security auditor at GlobalSecure. She is actively auditing safety logs and token parameters for Lauki device profiles inside their organization.',
    orders: [
      { id: 'ORD-7622', item: 'Lauki Secure Workspaces Enterprise Suite (100 Seats)', date: '2026-02-18', amount: 24000.00, status: 'delivered' }
    ],
    tickets: [],
    aiRecommendations: [
      'Provide technical RAG citation on security token rotation protocols.',
      'Ensure Verification Agent health checks are showing 100% compliance during logs check.'
    ]
  }
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TCK-2940',
    title: 'Enterprise MDM Activation Failure - Error 994',
    description: 'Corporate MDM device profile fails to activate on new iPhone 15 Pro Max fleet. Device displays credential token verification error. Impeding onboarding of 25 new executive hires.',
    customerId: 'CUST-1029',
    customerName: 'Sarah Jenkins',
    status: 'escalated',
    priority: 'critical',
    createdAt: '2026-05-30T10:15:00Z',
    updatedAt: '2026-05-30T17:30:00Z',
    assignedTo: 'Lead Architect (Alex)',
    sentiment: 'frustrated',
    timeline: [
      { id: 't1', action: 'Ticket Created', user: 'Sarah Jenkins', timestamp: '2026-05-30T10:15:00Z', details: 'Submitted via Web Portal.' },
      { id: 't2', action: 'AI Routing & Triage', user: 'Intent Agent', timestamp: '2026-05-30T10:16:02Z', details: 'Categorized under MDM/Security. Priority elevated to CRITICAL due to affected seat counts (25) and client plan (Enterprise).' },
      { id: 't3', action: 'Bedrock FAQ Analysis', user: 'Knowledge Agent', timestamp: '2026-05-30T10:16:10Z', details: 'Parsed RAG standard solutions. Emailed suggestions to client: MDM Token Refresh (KB-992).' },
      { id: 't4', action: 'Automatic Escalation Triggered', user: 'Escalation Agent', timestamp: '2026-05-30T11:45:00Z', details: 'Client responded: "Suggestions failed. Error persists. Need human escalation." Sentiment score dropped below 30.' },
      { id: 't5', action: 'Developer Assignment', user: 'Alex (Support Ops)', timestamp: '2026-05-30T12:00:00Z', details: 'Assigned to level-3 operations queue.' }
    ]
  },
  {
    id: 'TCK-1145',
    title: 'Shipping Delay: Custom Logo Engraving Package',
    description: 'Order ORD-8944 shows "processing" for over 6 days. Client requires engraved devices for corporate presentation in London.',
    customerId: 'CUST-3044',
    customerName: 'David Chen',
    status: 'open',
    priority: 'medium',
    createdAt: '2026-05-29T14:20:00Z',
    updatedAt: '2026-05-30T09:12:00Z',
    assignedTo: 'Fulfillment Agent (Zoe)',
    sentiment: 'neutral',
    timeline: [
      { id: 't6', action: 'Ticket Created', user: 'David Chen', timestamp: '2026-05-29T14:20:00Z', details: 'Submitted via mobile app chat.' },
      { id: 't7', action: 'Warehouse Check', user: 'Action Agent', timestamp: '2026-05-29T14:21:05Z', details: 'Queried ERP Database. Status confirmed: Engraving finished, awaiting shipping courier assignment.' }
    ]
  },
  {
    id: 'TCK-8023',
    title: 'Request for System Architecture & Security Audit Logs',
    description: 'Elena Rostova requesting formal architecture overview and technical details of the AI platform data paths for compliance documentation.',
    customerId: 'CUST-5512',
    customerName: 'Elena Rostova',
    status: 'resolved',
    priority: 'low',
    createdAt: '2026-05-28T09:00:00Z',
    updatedAt: '2026-05-29T16:00:00Z',
    assignedTo: 'Compliance Agent (AI)',
    sentiment: 'happy',
    timeline: [
      { id: 't8', action: 'Ticket Created', user: 'Elena Rostova', timestamp: '2026-05-28T09:00:00Z' },
      { id: 't9', action: 'RAG Architecture Document Dispatch', user: 'Knowledge Agent', timestamp: '2026-05-28T09:01:22Z', details: 'Fetched Technical Spec whitepaper (KB-102) and sent to client.' },
      { id: 't10', action: 'Ticket Closed', user: 'Elena Rostova', timestamp: '2026-05-29T16:00:00Z', details: 'Client closed ticket: "Documents are perfect. Security audit passed. Thank you!"' }
    ]
  }
];

// Seed tickets back into customers
MOCK_CUSTOMERS[0].tickets = [MOCK_TICKETS[0]];
MOCK_CUSTOMERS[1].tickets = [MOCK_TICKETS[1]];
MOCK_CUSTOMERS[2].tickets = [MOCK_TICKETS[2]];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'CONV-1029',
    customerId: 'CUST-1029',
    customerName: 'Sarah Jenkins',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'escalated',
    sentiment: 'frustrated',
    lastMessageText: 'Suggestions failed. Error persists. Need human escalation.',
    lastMessageTime: '11:45 AM',
    topic: 'MDM Corporate Activation',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        senderName: 'Sarah Jenkins',
        text: 'Hi there, I am trying to roll out 25 new iPhone 15 Pro Max devices for our executive onboarding. But every single device is throwing "Activation Failure: Error 994 - Security Credential Missing". Help!',
        timestamp: '10:15 AM'
      },
      {
        id: 'm2',
        sender: 'ai',
        senderName: 'Lauki Care AI',
        text: 'Analyzing request intent: **Enterprise MDM Security Token Auth**.\nVerifying profile status for **Sarah Jenkins (CTO, NexusTech)**: Identifiers checked successfully.',
        timestamp: '10:16 AM',
        agentPhase: 'intent',
        tokensUsed: 124
      },
      {
        id: 'm3',
        sender: 'ai',
        senderName: 'Lauki Care AI',
        text: 'Searching vector database for: `Activation Failure: Error 994 - Security Credential Missing`.\n\nRetrieved standard operating guide for MDM Profile Security. The system suggests triggering an automatic **Token Refresh** or checking if the corporate firewall allows TCP port 8443.',
        timestamp: '10:16 AM',
        agentPhase: 'rag',
        sources: [
          { title: 'MDM Configuration Guide (v2.4)', url: 's3://kb-docs/mdm-config-v2.pdf', score: 0.94 },
          { title: 'Security Token Policies', url: 's3://kb-docs/security-token-policy.md', score: 0.88 }
        ],
        tokensUsed: 420
      },
      {
        id: 'm4',
        sender: 'user',
        senderName: 'Sarah Jenkins',
        text: 'Suggestions failed. Error persists. Need human escalation.',
        timestamp: '11:45 AM'
      }
    ]
  },
  {
    id: 'CONV-3044',
    customerId: 'CUST-3044',
    customerName: 'David Chen',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    status: 'active',
    sentiment: 'neutral',
    lastMessageText: 'Can you confirm when the engraving is scheduled to complete?',
    lastMessageTime: '09:12 AM',
    topic: 'Shipping Delay & Custom Engraving',
    messages: [
      {
        id: 'm5',
        sender: 'user',
        senderName: 'David Chen',
        text: 'Hello, I ordered a Lauki Secure Phone Core Gen-2 with a custom logo engraving (Invoice #8944) for a presentation in London. It shows "processing" for 6 days. Can you tell me when it will ship?',
        timestamp: '09:10 AM'
      },
      {
        id: 'm6',
        sender: 'ai',
        senderName: 'Lauki Care AI',
        text: 'Analyzing intent: **Order Fulfillment Enquiry / Custom Engraving Status**.\nFetching details from ERP database via `get_order_status` action...',
        timestamp: '09:11 AM',
        agentPhase: 'intent',
        tokensUsed: 98
      },
      {
        id: 'm7',
        sender: 'ai',
        senderName: 'Lauki Care AI',
        text: 'Successfully queried warehouse ERP.\n\n**Invoice #8944 Details:**\n* Item: Lauki Secure Phone Core Gen-2\n* Customization: Premium Laser Engraving (Prism Logo)\n* Current Status: **Engraving Completed**\n* Packaging Phase: Completed\n* Courier Allocation: **Awaiting pickup from DHL**\n\nThe courier is scheduled to retrieve the package within the next 4 hours. You will receive an automated tracking code immediately.',
        timestamp: '09:11 AM',
        agentPhase: 'action',
        tokensUsed: 310
      },
      {
        id: 'm8',
        sender: 'user',
        senderName: 'David Chen',
        text: 'Can you confirm when the engraving is scheduled to complete?',
        timestamp: '09:12 AM'
      }
    ]
  }
];

export const MOCK_KB_ARTICLES: KBArticle[] = [
  {
    id: 'KB-992',
    title: 'MDM Profile Error 994 Activation Workaround',
    category: 'sop',
    content: 'Standard operating procedure detailing instructions on bypassing cryptographic token errors during organizational profile loads. Explains how to trigger Cognito token rotations using standard API calls.',
    format: 'pdf',
    size: '1.8 MB',
    status: 'indexed',
    lastSync: '2026-05-28 08:30 AM',
    citationsCount: 42
  },
  {
    id: 'KB-102',
    title: 'Lauki Platform Enterprise Security Architecture Whitepaper',
    category: 'api',
    content: 'Full cloud layout detailing HTTPS data paths, Amazon Web Services integration (Cognito, Bedrock, ECS, OpenSearch), and VPC isolation configurations.',
    format: 'pdf',
    size: '4.2 MB',
    status: 'indexed',
    lastSync: '2026-05-20 14:00 PM',
    citationsCount: 120
  },
  {
    id: 'KB-501',
    title: 'Standard Product Refund Policy & Warranty Claims',
    category: 'policy',
    content: 'Corporate handbook detailing active warranty procedures, refund eligibility criteria, custom engraving liability exceptions, and high-frustration escalation triggers.',
    format: 'markdown',
    size: '80 KB',
    status: 'indexed',
    lastSync: '2026-05-25 09:15 AM',
    citationsCount: 89
  },
  {
    id: 'KB-338',
    title: 'Enterprise VPN Client Configuration Matrix',
    category: 'faq',
    content: 'List of frequently asked questions regarding VPN endpoint configs, routing subnets, and active directory synchronization issues.',
    format: 'doc',
    size: '512 KB',
    status: 'syncing',
    lastSync: '2026-05-30 19:10 PM',
    citationsCount: 0
  }
];

export const MOCK_AGENT_STATUSES: AgentStatus[] = [
  {
    id: 'agent-intent',
    name: 'Intent Agent',
    role: 'Language Parsing & Routing Orchestration',
    status: 'idle',
    health: 'healthy',
    activity: 'Monitoring inbound WebSockets for active chats',
    latency: 180,
    requestsPerMin: 450,
    accuracyRate: 99.2,
    modelId: 'amazon.titan-text-express-v1'
  },
  {
    id: 'agent-verification',
    name: 'Verification Agent',
    role: 'Cognito Validation & Token Authentication',
    status: 'idle',
    health: 'healthy',
    activity: 'Validating active session keys with Cognito User Pools',
    latency: 90,
    requestsPerMin: 512,
    accuracyRate: 100.0,
    modelId: 'custom-auth-classifier-v1'
  },
  {
    id: 'agent-knowledge',
    name: 'Knowledge RAG Agent',
    role: 'Vector Database (OpenSearch) Querying & RAG Retrieval',
    status: 'processing',
    health: 'healthy',
    activity: 'Executing k-NN vector search queries on KB indexes',
    latency: 680,
    requestsPerMin: 320,
    accuracyRate: 96.8,
    modelId: 'anthropic.claude-3-5-sonnet'
  },
  {
    id: 'agent-action',
    name: 'Action Execution Agent',
    role: 'ERP, CRM, and Databases Tool Calling Manager',
    status: 'idle',
    health: 'healthy',
    activity: 'Awaiting Lambda execution parameters',
    latency: 820,
    requestsPerMin: 140,
    accuracyRate: 98.4,
    modelId: 'anthropic.claude-3-5-sonnet'
  },
  {
    id: 'agent-escalation',
    name: 'Escalation & Safety Agent',
    role: 'Sentiment Evaluation & Call Center Handoff Orchestrator',
    status: 'idle',
    health: 'warning',
    activity: 'Evaluating elevated chat frustration indicators',
    latency: 120,
    requestsPerMin: 180,
    accuracyRate: 97.9,
    modelId: 'meta.llama-3-1-70b-instruct'
  }
];

// Monthly stats for analytics
export const MOCK_MONTHLY_CONVS = [
  { name: 'Jan', total: 1280, automated: 920, escalated: 360, csat: 4.60 },
  { name: 'Feb', total: 1450, automated: 1080, escalated: 370, csat: 4.68 },
  { name: 'Mar', total: 1890, automated: 1480, escalated: 410, csat: 4.75 },
  { name: 'Apr', total: 2430, automated: 1980, escalated: 450, csat: 4.80 },
  { name: 'May', total: 2980, automated: 2420, escalated: 560, csat: 4.85 }
];

export const MOCK_TICKET_TRENDS: TicketTrend[] = [
  { name: 'Mon', low: 24, medium: 18, high: 9, critical: 2 },
  { name: 'Tue', low: 30, medium: 22, high: 12, critical: 4 },
  { name: 'Wed', low: 28, medium: 25, high: 15, critical: 3 },
  { name: 'Thu', low: 35, medium: 20, high: 11, critical: 5 },
  { name: 'Fri', low: 32, medium: 28, high: 14, critical: 6 },
  { name: 'Sat', low: 12, medium: 8, high: 4, critical: 1 },
  { name: 'Sun', low: 10, medium: 6, high: 2, critical: 1 }
];

export const MOCK_ESCALATION_REASONS: EscalationReason[] = [
  { name: 'Complex Cryptographic Audits', value: 42 },
  { name: 'Device Hardware RMA Requests', value: 28 },
  { name: 'Billing / Subscription Changes', value: 18 },
  { name: 'Angry / Frustrated Sentiment triggers', value: 12 }
];

export const MOCK_COST_SAVINGS = [
  { name: 'Jan', humanCost: 28000, aiCost: 1800, savings: 26200 },
  { name: 'Feb', humanCost: 31000, aiCost: 2200, savings: 28800 },
  { name: 'Mar', humanCost: 38000, aiCost: 2900, savings: 35100 },
  { name: 'Apr', humanCost: 46000, aiCost: 3600, savings: 42400 },
  { name: 'May', humanCost: 54000, aiCost: 4100, savings: 49900 }
];

export const MOCK_RESOLUTION_TIMES = [
  { name: 'AI Automations', avgSeconds: 1.2 },
  { name: 'L1 Operations Escalations', avgSeconds: 820 },
  { name: 'L3 Operations Escalations', avgSeconds: 14400 }
];
