import { apiClient } from './apiClient';
import { 
  Customer, Ticket, Conversation, Message, KBArticle, 
  AgentStatus, TicketTrend, RAGSource 
} from '../types';

// ==========================================
// Authentication Types
// ==========================================
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'support_agent' | 'user';
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ==========================================
// Dashboard Types
// ==========================================
export interface DashboardSummaryResponse {
  conversations_count: number;
  open_tickets_count: number;
  escalated_tickets_count: number;
  resolution_rate: number;
  csat_score: number;
  ai_automation_rate: number;
  volume_increase_percentage: number;
}

export interface DashboardChartsResponse {
  monthly_volume: Array<{
    name: string;
    total: number;
    automated: number;
    escalated: number;
    csat: number;
  }>;
  ticket_trends: Array<{
    name: string;
    low: number;
    medium: number;
    high: number;
    critical: number;
  }>;
}

// ==========================================
// Helper Formatters
// ==========================================
const formatTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '12:00 PM';
  }
};

const formatSyncTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    return d.toLocaleString([], { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch {
    return 'Pending';
  }
};

// ==========================================
// API Services Wrapper
// ==========================================
export const apiService = {
  
  // 1. AUTHENTICATION SERVICES
  auth: {
    async login(payload: any): Promise<AuthResponse> {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
      return data;
    },
    async register(payload: any): Promise<User> {
      const { data } = await apiClient.post<User>('/auth/register', payload);
      return data;
    },
    async getProfile(): Promise<User> {
      const { data } = await apiClient.get<User>('/auth/profile');
      return data;
    },
    async logout(): Promise<void> {
      await apiClient.post('/auth/logout');
    }
  },

  // 2. DASHBOARD SERVICES
  dashboard: {
    async getSummary(): Promise<DashboardSummaryResponse> {
      const { data } = await apiClient.get<any>('/dashboard/summary');
      return {
        conversations_count: data.totalConversations ?? 0,
        open_tickets_count: data.openTickets ?? 0,
        escalated_tickets_count: (data.totalTickets ?? 0) - (data.openTickets ?? 0),
        resolution_rate: data.resolutionRate ?? 94.2,
        csat_score: data.customerSatisfaction ?? 4.85,
        ai_automation_rate: data.aiAutomationRate ?? 81.0,
        volume_increase_percentage: 18.4
      };
    },
    async getCharts(): Promise<DashboardChartsResponse> {
      const { data } = await apiClient.get<any>('/dashboard/charts');
      return {
        monthly_volume: (data.monthlyConversations || []).map((c: any) => ({
          name: c.name,
          total: c.total ?? 0,
          automated: c.automated ?? 0,
          escalated: c.escalated ?? 0,
          csat: c.csat ?? 4.8,
        })),
        ticket_trends: (data.ticketTrends || []).map((t: any) => ({
          name: t.name,
          low: t.low ?? 0,
          medium: t.medium ?? 0,
          high: t.high ?? 0,
          critical: t.critical ?? 0,
        })),
      };
    },
  },

  // 3. CUSTOMER SERVICES
  customers: {
    async getCustomers(): Promise<Customer[]> {
      const { data } = await apiClient.get<any[]>('/customers/');
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || '',
        avatar: c.avatar || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`,
        plan: c.plan || 'basic',
        sentiment: c.sentiment || 'neutral',
        sentimentScore: c.sentiment_score ?? 60,
        orders: [],
        tickets: [],
        aiRecommendations: [],
        summary: ''
      }));
    },
    async getCustomerById(id: string): Promise<Customer> {
      const { data } = await apiClient.get<any>(`/customers/${id}`);
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        plan: data.plan || 'basic',
        sentiment: data.sentiment || 'neutral',
        sentimentScore: data.sentiment_score ?? 60,
        orders: [],
        tickets: [],
        aiRecommendations: [],
        summary: ''
      };
    },
    async getCustomerProfile(id: string): Promise<Customer> {
      const { data } = await apiClient.get<any>(`/customers/${id}/profile`);
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        avatar: data.avatar || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`,
        plan: data.plan || 'basic',
        sentiment: data.sentiment || 'neutral',
        sentimentScore: data.sentiment_score ?? 60,
        summary: data.summary || '',
        orders: (data.orders || []).map((o: any) => ({
          id: o.id,
          item: o.item,
          date: o.date,
          amount: o.amount,
          status: o.status
        })),
        tickets: (data.tickets || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          customerId: t.customer_id,
          customerName: data.name,
          status: t.status,
          priority: t.priority,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
          timeline: []
        })),
        aiRecommendations: data.ai_recommendations || []
      };
    },
    async createCustomer(payload: Partial<Customer>): Promise<Customer> {
      const { data } = await apiClient.post<Customer>('/customers/', payload);
      return data;
    },
    async updateCustomer(id: string, payload: Partial<Customer>): Promise<Customer> {
      const { data } = await apiClient.put<Customer>(`/customers/${id}`, payload);
      return data;
    },
    async deleteCustomer(id: string): Promise<void> {
      await apiClient.delete(`/customers/${id}`);
    }
  },

  // 4. CONVERSATION SERVICES
  conversations: {
    async getConversations(): Promise<Conversation[]> {
      const { data } = await apiClient.get<any[]>('/conversations/');
      return data.map((conv: any) => ({
        id: conv.id,
        customerId: conv.customer_id,
        customerName: conv.customer_name || 'Customer',
        customerAvatar: conv.customer_avatar || '',
        status: conv.status || 'active',
        sentiment: conv.sentiment || 'neutral',
        topic: conv.topic || 'Diagnostic Query',
        lastMessageText: conv.messages && conv.messages.length > 0 
          ? conv.messages[conv.messages.length - 1].text 
          : 'Conversation started.',
        lastMessageTime: conv.messages && conv.messages.length > 0 
          ? formatTime(conv.messages[conv.messages.length - 1].created_at)
          : formatTime(conv.created_at),
        messages: (conv.messages || []).map((m: any) => ({
          id: m.id,
          sender: m.sender,
          senderName: m.sender_name,
          text: m.text,
          timestamp: formatTime(m.created_at),
          tokensUsed: m.tokens_used,
          agentPhase: m.agent_phase,
          sources: (m.sources || []).map((s: any) => ({
            title: s.title,
            url: s.url,
            score: s.score
          }))
        }))
      }));
    },
    async getConversationById(id: string): Promise<Conversation> {
      const { data } = await apiClient.get<any>(`/conversations/${id}`);
      return {
        id: data.id,
        customerId: data.customer_id,
        customerName: data.customer_name || 'Customer',
        customerAvatar: data.customer_avatar || '',
        status: data.status || 'active',
        sentiment: data.sentiment || 'neutral',
        topic: data.topic || 'Diagnostic Query',
        lastMessageText: data.messages && data.messages.length > 0 
          ? data.messages[data.messages.length - 1].text 
          : 'Conversation started.',
        lastMessageTime: data.messages && data.messages.length > 0 
          ? formatTime(data.messages[data.messages.length - 1].created_at)
          : formatTime(data.created_at),
        messages: (data.messages || []).map((m: any) => ({
          id: m.id,
          sender: m.sender,
          senderName: m.sender_name,
          text: m.text,
          timestamp: formatTime(m.created_at),
          tokensUsed: m.tokens_used,
          agentPhase: m.agent_phase,
          sources: (m.sources || []).map((s: any) => ({
            title: s.title,
            url: s.url,
            score: s.score
          }))
        }))
      };
    },
    async createConversation(payload: { customerId: string; topic: string }): Promise<Conversation> {
      const { data } = await apiClient.post<any>('/conversations/', payload);
      return {
        id: data.id,
        customerId: data.customer_id,
        customerName: data.customer_name || 'Customer',
        customerAvatar: data.customer_avatar || '',
        status: data.status || 'active',
        sentiment: data.sentiment || 'neutral',
        topic: data.topic || 'Diagnostic Query',
        lastMessageText: '',
        lastMessageTime: formatTime(data.created_at),
        messages: []
      };
    },
    async addMessage(id: string, payload: { sender: string; sender_name: string; text: string }): Promise<Message> {
      const { data } = await apiClient.post<any>(`/conversations/${id}/message`, payload);
      return {
        id: data.id,
        sender: data.sender,
        senderName: data.sender_name,
        text: data.text,
        timestamp: formatTime(data.created_at),
        tokensUsed: data.tokens_used,
        agentPhase: data.agent_phase
      };
    }
  },

  // 5. TICKET SERVICES
  tickets: {
    async getTickets(): Promise<Ticket[]> {
      const { data } = await apiClient.get<any[]>('/tickets/');
      return data.map((t: any) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        customerId: t.customer_id,
        customerName: t.customer_name || 'Unknown Customer',
        assignedTo: t.assigned_to,
        status: t.status,
        priority: t.priority,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        sentiment: t.status === 'escalated' ? 'frustrated' : 'neutral',
        timeline: (t.comments || []).map((c: any) => ({
          id: c.id,
          action: c.action_taken || 'Status Logged',
          user: c.author_name || 'System Operator',
          timestamp: c.created_at,
          details: c.comment || ''
        }))
      }));
    },
    async getTicketById(id: string): Promise<Ticket> {
      const { data } = await apiClient.get<any>(`/tickets/${id}`);
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        customerId: data.customer_id,
        customerName: data.customer_name || 'Unknown Customer',
        assignedTo: data.assigned_to,
        status: data.status,
        priority: data.priority,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        sentiment: data.status === 'escalated' ? 'frustrated' : 'neutral',
        timeline: (data.comments || []).map((c: any) => ({
          id: c.id,
          action: c.action_taken || 'Status Logged',
          user: c.author_name || 'System Operator',
          timestamp: c.created_at,
          details: c.comment || ''
        }))
      };
    },
    async createTicket(payload: any): Promise<Ticket> {
      const { data } = await apiClient.post<any>('/tickets/', payload);
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        customerId: data.customer_id,
        customerName: data.customer_name || 'Customer',
        assignedTo: data.assigned_to,
        status: data.status,
        priority: data.priority,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        timeline: []
      };
    },
    async updateTicket(id: string, payload: Partial<Ticket>): Promise<Ticket> {
      const { data } = await apiClient.put<any>(`/tickets/${id}`, payload);
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        customerId: data.customer_id,
        customerName: data.customer_name || 'Customer',
        assignedTo: data.assigned_to,
        status: data.status,
        priority: data.priority,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        timeline: []
      };
    },
    async deleteTicket(id: string): Promise<void> {
      await apiClient.delete(`/tickets/${id}`);
    }
  },

  // 6. KNOWLEDGE BASE SERVICES
  knowledgeBase: {
    async getArticles(): Promise<KBArticle[]> {
      const { data } = await apiClient.get<any[]>('/knowledge_base/');
      return data.map((a: any) => ({
        id: a.id,
        title: a.title,
        category: a.category || 'policy',
        content: a.content || '',
        format: a.format || 'pdf',
        size: a.size || '512 KB',
        status: a.status || 'indexed',
        lastSync: formatSyncTime(a.last_sync),
        citationsCount: a.citations_count ?? 0
      }));
    },
    async uploadArticle(file: File, onUploadProgress?: (progressEvent: any) => void): Promise<KBArticle> {
      const formData = new FormData();
      formData.append('file', file);
      
      const { data } = await apiClient.post<any>('/knowledge_base/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress
      });
      return {
        id: data.id,
        title: data.title,
        category: data.category || 'policy',
        content: data.content || '',
        format: data.format || 'pdf',
        size: data.size || '512 KB',
        status: data.status || 'indexed',
        lastSync: formatSyncTime(data.last_sync),
        citationsCount: data.citations_count ?? 0
      };
    }
  },

  // 7. AI AGENTS SERVICES
  agents: {
    async getAgents(): Promise<AgentStatus[]> {
      const { data } = await apiClient.get<AgentStatus[]>('/agents/');
      return data;
    }
  },

  // 8. DEEP BI ANALYTICS SERVICES
  analytics: {
    async getOverview(): Promise<any> {
      const { data } = await apiClient.get('/analytics/overview');
      return data;
    },
    async getCSAT(): Promise<any[]> {
      const { data } = await apiClient.get<any[]>('/analytics/customer-satisfaction');
      return data;
    },
    async getTrends(): Promise<any[]> {
      const { data } = await apiClient.get<any[]>('/analytics/ticket-trends');
      return data;
    },
    async getAiPerformance(): Promise<any> {
      const { data } = await apiClient.get('/analytics/ai-performance');
      return data;
    }
  },

  // 9. CORE SETTINGS SERVICES
  settings: {
    async getSettings(): Promise<any> {
      const { data } = await apiClient.get('/settings/');
      return data;
    },
    async updateSettings(payload: any): Promise<any> {
      const { data } = await apiClient.post('/settings/', payload);
      return data;
    }
  },

  // 10. AI MULTI-AGENT CHAT
  chat: {
    async sendMessage(payload: { customerId: string; message: string }): Promise<Message> {
      const { data } = await apiClient.post<any>('/chat/message', payload);
      return {
        id: data.id,
        sender: data.sender,
        senderName: data.sender_name,
        text: data.text,
        timestamp: formatTime(data.created_at),
        tokensUsed: data.tokens_used,
        agentPhase: data.agent_phase,
        sources: (data.sources || []).map((s: any) => ({
          title: s.title,
          url: s.url,
          score: s.score
        }))
      };
    }
  }
};
