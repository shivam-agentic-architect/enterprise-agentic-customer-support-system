import { create } from 'zustand';
import { Conversation, Ticket, Customer, KBArticle, AgentStatus, Message } from '../types';
import { MOCK_CONVERSATIONS, MOCK_TICKETS, MOCK_CUSTOMERS, MOCK_KB_ARTICLES, MOCK_AGENT_STATUSES } from '../mock-data';
import { mockApiService } from '../services/mockApiService';

interface AppState {
  // Navigation & UI States
  activeTab: string;
  isSidebarCollapsed: boolean;
  
  // Data States
  conversations: Conversation[];
  activeConversationId: string | null;
  tickets: Ticket[];
  customers: Customer[];
  kbArticles: KBArticle[];
  agentStatuses: AgentStatus[];
  
  // System Configurations
  apiConfig: {
    bedrockModel: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
  };
  
  // Enterprise Alerts & Notifications
  notifications: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: 'info' | 'warning' | 'success' | 'error';
    read: boolean;
  }>;
  
  // Action Handlers
  setActiveTab: (tab: string) => void;
  toggleSidebar: () => void;
  setActiveConversationId: (id: string | null) => void;
  
  // Conversational operations
  sendMessage: (convId: string, text: string) => Promise<void>;
  createConversation: (customerId: string, topic: string) => void;
  
  // Ticket actions
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;
  addTicketTimeline: (ticketId: string, action: string, user: string, details?: string) => void;
  
  // Knowledge Base actions
  uploadKBArticle: (name: string, size: string, onProgress: (percent: number) => void) => Promise<void>;
  
  // Configurations operations
  updateApiConfig: (config: Partial<AppState['apiConfig']>) => void;
  
  // Notifications actions
  addNotification: (message: string, type: AppState['notifications'][0]['type']) => void;
  dismissNotification: (id: string) => void;
  markNotificationsAsRead: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Defaults
  activeTab: 'dashboard',
  isSidebarCollapsed: false,
  
  conversations: MOCK_CONVERSATIONS,
  activeConversationId: 'CONV-1029',
  tickets: MOCK_TICKETS,
  customers: MOCK_CUSTOMERS,
  kbArticles: MOCK_KB_ARTICLES,
  agentStatuses: MOCK_AGENT_STATUSES,
  
  apiConfig: {
    bedrockModel: 'anthropic.claude-3-5-sonnet',
    temperature: 0.3,
    maxTokens: 2000,
    systemPrompt: 'You are Lauki Enterprise AI Customer Care, orchestrating RAG knowledge access and invoking client CRM microservices safely. Maintain absolute professional utility.'
  },
  
  notifications: [
    {
      id: 'n-1',
      message: 'SLA Escalation Alert: Sarah Jenkins (CUST-1029) MDM Failure unresolved for 90m.',
      timestamp: '11:45 AM',
      type: 'error',
      read: false
    },
    {
      id: 'n-2',
      message: 'AI RAG index rebuilt: Amazon OpenSearch synchronized 3 PDFs successfully.',
      timestamp: '09:00 AM',
      type: 'success',
      read: false
    }
  ],

  // Implement Handlers
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  
  setActiveConversationId: (id) => set({ activeConversationId: id }),

  // Multi-Agent simulated conversational cycle
  sendMessage: async (convId, text) => {
    const userMsgId = 'msg-' + Math.random().toString(36).substr(2, 9);
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      senderName: 'User',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Find and update conversation with user message immediately
    const updatedConversations = get().conversations.map((conv) => {
      if (conv.id === convId) {
        // Evaluate user message sentiment to dynamically update customer details
        let sentiment: Conversation['sentiment'] = conv.sentiment;
        if (text.toLowerCase().includes('angry') || text.toLowerCase().includes('terrible') || text.toLowerCase().includes('fail') || text.toLowerCase().includes('worst')) {
          sentiment = 'frustrated';
        }
        
        return {
          ...conv,
          sentiment,
          lastMessageText: text,
          lastMessageTime: userMsg.timestamp,
          messages: [...conv.messages, userMsg]
        };
      }
      return conv;
    });

    set({ conversations: updatedConversations });

    // Handle interactive agent execution stats update
    set((state) => ({
      agentStatuses: state.agentStatuses.map(agent => 
        agent.id === 'agent-intent' ? { ...agent, status: 'processing' as const } : agent
      )
    }));

    // Create temporary AI message container
    const aiMsgId = 'msg-ai-temp';
    const tempAiMsg: Message = {
      id: aiMsgId,
      sender: 'ai',
      senderName: 'Lauki Care AI',
      text: '🤖 Orchestrating intent query analysis...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentPhase: 'intent'
    };

    // Append temporary message
    set((state) => ({
      conversations: state.conversations.map((conv) => 
        conv.id === convId ? { ...conv, messages: [...conv.messages, tempAiMsg] } : conv
      )
    }));

    try {
      // Simulate real-time progress steps
      const finalMsg = await mockApiService.simulateAISession(text, (progress) => {
        // Dynamically update agent stats as phases execute
        set((state) => {
          const activePhase = progress.agentPhase;
          const updatedAgents = state.agentStatuses.map((agent) => {
            if (activePhase === 'intent' && agent.id === 'agent-intent') {
              return { ...agent, status: 'processing' as const, requestsPerMin: agent.requestsPerMin + 1 };
            }
            if (activePhase === 'verification' && agent.id === 'agent-verification') {
              return { ...agent, status: 'processing' as const, requestsPerMin: agent.requestsPerMin + 1 };
            }
            if (activePhase === 'rag' && agent.id === 'agent-knowledge') {
              return { ...agent, status: 'processing' as const, requestsPerMin: agent.requestsPerMin + 1 };
            }
            if (activePhase === 'action' && agent.id === 'agent-action') {
              return { ...agent, status: 'processing' as const, requestsPerMin: agent.requestsPerMin + 1 };
            }
            if (activePhase === 'complete') {
              return { ...agent, status: 'idle' as const };
            }
            return { ...agent, status: agent.status === 'processing' ? ('idle' as const) : agent.status };
          });

          const nextConversations = state.conversations.map((c) => {
            if (c.id === convId) {
              const updatedMessages = c.messages.map((m) => {
                if (m.id === aiMsgId) {
                  return { ...m, ...progress };
                }
                return m;
              });
              return { ...c, messages: updatedMessages };
            }
            return c;
          });

          return { agentStatuses: updatedAgents, conversations: nextConversations };
        });
      });

      // Synchronize sentiment with CRM customer records
      const conv = get().conversations.find((c) => c.id === convId);
      if (conv) {
        set((state) => ({
          customers: state.customers.map((c) => {
            if (c.id === conv.customerId) {
              const scoreOffset = conv.sentiment === 'frustrated' ? -15 : (conv.sentiment === 'happy' ? 5 : 0);
              return {
                ...c,
                sentiment: conv.sentiment,
                sentimentScore: Math.max(0, Math.min(100, c.sentimentScore + scoreOffset))
              };
            }
            return c;
          })
        }));

        // If escalated sentiment is flagged, notify and trigger critical dashboard alerts
        if (conv.sentiment === 'frustrated') {
          get().addNotification(`Dynamic Sentiment Alert: Session ${convId} triggers elevated client frustration context.`, 'warning');
        }
      }

    } catch (err) {
      console.error('Multi-Agent loop error:', err);
    }
  },

  createConversation: (customerId, topic) => {
    const customer = get().customers.find((c) => c.id === customerId);
    if (!customer) return;

    const newConvId = 'CONV-' + Math.floor(Math.random() * 9000 + 1000);
    const newConv: Conversation = {
      id: newConvId,
      customerId,
      customerName: customer.name,
      customerAvatar: customer.avatar,
      status: 'active',
      sentiment: customer.sentiment,
      lastMessageText: `Session initialized around: ${topic}`,
      lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topic,
      messages: [
        {
          id: 'init-msg',
          sender: 'ai',
          senderName: 'Lauki Care AI',
          text: `🤖 Welcome back, **${customer.name}** (${customer.plan.toUpperCase()} Account). Lauki Multi-Agent Gateway is active.\n*Focus topic initialized: **${topic}***.\n\nHow can I help you support device parameters today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    set((state) => ({
      conversations: [newConv, ...state.conversations],
      activeConversationId: newConvId,
      activeTab: 'conversations'
    }));

    get().addNotification(`New Customer care session created: ${newConvId} (${topic}).`, 'info');
  },

  updateTicketStatus: (ticketId, status) => {
    set((state) => {
      const nextTickets = state.tickets.map((t) => {
        if (t.id === ticketId) {
          const actionText = status === 'resolved' ? 'Ticket Resolved' : (status === 'escalated' ? 'Escalated to Operations Manager' : 'Ticket Status Updated');
          const newAction = {
            id: 'act-' + Math.random().toString(36).substr(2, 9),
            action: actionText,
            user: 'System Admin',
            timestamp: new Date().toISOString(),
            details: `Updated state to: ${status.toUpperCase()}`
          };
          return {
            ...t,
            status,
            updatedAt: new Date().toISOString(),
            timeline: [...t.timeline, newAction]
          };
        }
        return t;
      });

      // Synchronize with customer ticket instances
      const updatedCustomers = state.customers.map((cust) => {
        return {
          ...cust,
          tickets: cust.tickets.map((t) => {
            if (t.id === ticketId) {
              return { ...t, status, updatedAt: new Date().toISOString() };
            }
            return t;
          })
        };
      });

      return { tickets: nextTickets, customers: updatedCustomers };
    });

    get().addNotification(`Ticket ${ticketId} status synchronized to: ${status.toUpperCase()}`, 'success');
  },

  addTicketTimeline: (ticketId, action, user, details) => {
    set((state) => {
      const newAction = {
        id: 'act-' + Math.random().toString(36).substr(2, 9),
        action,
        user,
        timestamp: new Date().toISOString(),
        details
      };
      
      const nextTickets = state.tickets.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            updatedAt: new Date().toISOString(),
            timeline: [...t.timeline, newAction]
          };
        }
        return t;
      });

      return { tickets: nextTickets };
    });
  },

  uploadKBArticle: async (name, size, onProgress) => {
    try {
      const parsedArticle = await mockApiService.simulateDocumentUpload(name, size, onProgress);
      set((state) => ({
        kbArticles: [parsedArticle, ...state.kbArticles]
      }));
      get().addNotification(`New RAG File Indexed: "${name}" synchronized into vector search database.`, 'success');
    } catch (err) {
      console.error('KB Sync failed:', err);
      get().addNotification(`Failed parsing knowledge file: "${name}"`, 'error');
    }
  },

  updateApiConfig: (config) => set((state) => ({ apiConfig: { ...state.apiConfig, ...config } })),

  addNotification: (message, type) => {
    const newNotif = {
      id: 'notif-' + Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false
    };
    set((state) => ({ notifications: [newNotif, ...state.notifications] }));
  },

  dismissNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id)
  })),

  markNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true }))
  }))
}));
