import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, User, AuthResponse, DashboardSummaryResponse, DashboardChartsResponse } from '../services/apiService';
import { Customer, Ticket, Conversation, Message, KBArticle, AgentStatus } from '../types';
import { saveTokens, clearTokens } from '../services/apiClient';

// ==========================================
// AUTHENTICATION HOOKS
// ==========================================
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await apiService.auth.login(payload);
      saveTokens(response.access_token, response.refresh_token);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    }
  });
}

export function useProfile() {
  return useQuery<User, Error>({
    queryKey: ['profile'],
    queryFn: apiService.auth.getProfile,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await apiService.auth.logout();
      } finally {
        clearTokens();
      }
    },
    onSuccess: () => {
      queryClient.clear();
    }
  });
}

// ==========================================
// DASHBOARD HOOKS
// ==========================================
export function useDashboardSummary() {
  return useQuery<DashboardSummaryResponse, Error>({
    queryKey: ['dashboard-summary'],
    queryFn: apiService.dashboard.getSummary,
    refetchInterval: 15000, // Live poll every 15s for SLA dashboards
  });
}

export function useDashboardCharts() {
  return useQuery<DashboardChartsResponse, Error>({
    queryKey: ['dashboard-charts'],
    queryFn: apiService.dashboard.getCharts,
    staleTime: 60 * 1000,
  });
}

// ==========================================
// CUSTOMER HOOKS
// ==========================================
export function useCustomers() {
  return useQuery<Customer[], Error>({
    queryKey: ['customers'],
    queryFn: apiService.customers.getCustomers,
    staleTime: 30 * 1000,
  });
}

export function useCustomerProfile(id: string | null) {
  return useQuery<any, Error>({
    queryKey: ['customer-profile', id],
    queryFn: () => apiService.customers.getCustomerProfile(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

// ==========================================
// SUPPORT TICKETS HOOKS
// ==========================================
export function useTickets() {
  return useQuery<Ticket[], Error>({
    queryKey: ['tickets'],
    queryFn: apiService.tickets.getTickets,
    refetchInterval: 10000, // Poll every 10s for incoming SLA alerts
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Ticket> }) => 
      apiService.tickets.updateTicket(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] });
    }
  });
}

// ==========================================
// CONVERSATIONS HOOKS
// ==========================================
export function useConversations() {
  return useQuery<Conversation[], Error>({
    queryKey: ['conversations'],
    queryFn: apiService.conversations.getConversations,
    refetchInterval: 5000, // Fast polling for active chats
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { customerId: string; topic: string }) => 
      apiService.conversations.createConversation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { customerId: string; message: string }) => 
      apiService.chat.sendMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
}

// ==========================================
// KNOWLEDGE BASE HOOKS
// ==========================================
export function useKBArticles() {
  return useQuery<KBArticle[], Error>({
    queryKey: ['kb-articles'],
    queryFn: apiService.knowledgeBase.getArticles,
  });
}

export function useUploadKB() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (p: any) => void }) => 
      apiService.knowledgeBase.uploadArticle(file, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    }
  });
}

// ==========================================
// AI AGENTS HOOKS
// ==========================================
export function useAgents() {
  return useQuery<AgentStatus[], Error>({
    queryKey: ['agents'],
    queryFn: apiService.agents.getAgents,
    refetchInterval: 10000,
  });
}

// ==========================================
// ANALYTICS HOOKS
// ==========================================
export function useAnalyticsCSAT() {
  return useQuery<any[], Error>({
    queryKey: ['analytics-csat'],
    queryFn: apiService.analytics.getCSAT,
  });
}

export function useAnalyticsTrends() {
  return useQuery<any[], Error>({
    queryKey: ['analytics-trends'],
    queryFn: apiService.analytics.getTrends,
  });
}

export function useAnalyticsAiPerformance() {
  return useQuery<any, Error>({
    queryKey: ['analytics-ai'],
    queryFn: apiService.analytics.getAiPerformance,
  });
}

// ==========================================
// SETTINGS HOOKS
// ==========================================
export function useSettings() {
  return useQuery<any, Error>({
    queryKey: ['settings'],
    queryFn: apiService.settings.getSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => apiService.settings.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });
}
