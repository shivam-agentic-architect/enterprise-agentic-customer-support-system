export interface RAGSource {
  title: string;
  url: string;
  score: number;
}

export interface Attachment {
  name: string;
  type: string;
  size: string;
  url?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'agent' | 'ai';
  senderName: string;
  text: string;
  timestamp: string;
  tokensUsed?: number;
  agentPhase?: 'intent' | 'verification' | 'rag' | 'action' | 'generation' | 'complete';
  sources?: RAGSource[];
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  status: 'active' | 'waiting' | 'escalated' | 'resolved';
  sentiment: 'happy' | 'neutral' | 'frustrated';
  lastMessageText: string;
  lastMessageTime: string;
  messages: Message[];
  assignedAgentId?: string;
  topic?: string;
}

export interface TicketTimelineItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  customerId: string;
  customerName: string;
  status: 'open' | 'pending' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  sentiment?: 'happy' | 'neutral' | 'frustrated';
  timeline: TicketTimelineItem[];
}

export interface CustomerOrder {
  id: string;
  item: string;
  date: string;
  amount: number;
  status: 'delivered' | 'processing' | 'shipped' | 'returned';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  plan: 'basic' | 'premium' | 'enterprise';
  sentiment: 'happy' | 'neutral' | 'frustrated';
  sentimentScore: number; // 0 - 100
  orders: CustomerOrder[];
  tickets: Ticket[];
  aiRecommendations: string[];
  summary?: string;
}

export interface KBArticle {
  id: string;
  title: string;
  category: 'policy' | 'faq' | 'sop' | 'api';
  content: string;
  format: 'pdf' | 'doc' | 'markdown';
  size: string;
  status: 'indexed' | 'syncing' | 'failed';
  lastSync: string;
  citationsCount: number;
}

export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'processing' | 'offline';
  health: 'healthy' | 'warning' | 'error';
  activity: string;
  latency: number; // ms
  requestsPerMin: number;
  accuracyRate: number; // %
  modelId: string;
}

export interface MetricData {
  name: string;
  total: number;
  automated: number;
  escalated: number;
  csat: number;
}

export interface TicketTrend {
  name: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface EscalationReason {
  name: string;
  value: number;
}
