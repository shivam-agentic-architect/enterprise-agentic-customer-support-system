import { Message, Ticket, Conversation, KBArticle } from '../types';
import { MOCK_CONVERSATIONS, MOCK_TICKETS, MOCK_KB_ARTICLES } from '../mock-data';

// Helper to simulate API call latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApiService = {
  // Simulate active session messaging flow
  async simulateAISession(
    messageText: string,
    onProgress: (partialMessage: Partial<Message>) => void
  ): Promise<Message> {
    const messageId = 'msg-' + Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Step 1: Intent Parsing
    onProgress({
      id: messageId,
      sender: 'ai',
      senderName: 'Lauki Care AI',
      text: '🤖 **Intent Agent**: Analysing user message to resolve routing destination...',
      timestamp,
      agentPhase: 'intent',
      tokensUsed: 42
    });
    await delay(1200);

    // Step 2: Verification Check
    onProgress({
      text: '🔐 **Verification Agent**: Confirming user authentication keys. Checking token integrity via Amazon Cognito User Pools...',
      agentPhase: 'verification',
      tokensUsed: 92
    });
    await delay(1000);

    // Step 3: RAG Retrieval
    onProgress({
      text: '📂 **Knowledge Agent**: Performing k-NN semantic search on vector search indices. Extracting document citations...',
      agentPhase: 'rag',
      tokensUsed: 220
    });
    await delay(1400);

    // Formulate a custom response based on words in messageText
    let matchedResponse = '';
    let sourcesList: any[] = [];
    const query = messageText.toLowerCase();

    if (query.includes('activation') || query.includes('mdm') || query.includes('error')) {
      matchedResponse = `🚨 **Error 994 Activation Failure Identified**: 
Based on our vector indexing standard policy (**KB-992**), this error occurs when an executive enrollment security profile lacks its local decryption token.

**Recommended System Remediation:**
1. Navigate to the **AWS API Settings panel** in the dashboard.
2. Toggle the **Cognito Token Rotation** setting.
3. Ask the user to restart the device profile load.

Alternatively, our system has scheduled an automatic level-3 technician queue escalation (Ticket generated for Alex).`;
      sourcesList = [
        { title: 'MDM Profile Bypass Standard (KB-992)', url: 's3://kb-docs/mdm-config-v2.pdf', score: 0.96 },
        { title: 'Cognito Security Guidelines', url: 's3://kb-docs/security-token-policy.md', score: 0.84 }
      ];
    } else if (query.includes('order') || query.includes('ship') || query.includes('delay') || query.includes('engrav')) {
      matchedResponse = `📦 **Custom Logo Engraving Fulfillment Check**:
We queried our warehouse ERP via a serverless AWS Lambda trigger. 

**Order Status details:**
* Item: iPhone 15 Pro Max Custom Pack
* Laser Engraving: Prism Media logo overlay
* State: **Completed and Inspected**
* Ship status: DHL pickup scheduled. Awaiting tracking code dispatch.

Delivery timeframe to London is confirmed within **3 business days** via priority air courier.`;
      sourcesList = [
        { title: 'Warehouse Logistics SOP', url: 's3://kb-warehouse/logistics-sop.pdf', score: 0.91 }
      ];
    } else {
      matchedResponse = `👋 **Standard Lauki Care AI Response**:
Thank you for contacting Lauki Customer Operations support. I have parsed your query regarding: "${messageText}".

Our Multi-Agent orchestration platform has checked our local SOP indices and hasn't flagged any specific hardware warnings. If this is an operational bottleneck, I can automatically draft an executive ticket and escalate this conversation to a human supervisor in our Amazon Connect queue.

Would you like me to create an engineering support ticket?`;
      sourcesList = [
        { title: 'Standard Service Guidelines (KB-501)', url: 's3://kb-docs/service-guidelines.md', score: 0.81 }
      ];
    }

    // Step 4: Action / Database updates
    onProgress({
      text: `⚡ **Action Agent**: Invoking database triggers and executing CRM records updates...\n*Result: Checked client profile and synchronized sentiment values.*`,
      agentPhase: 'action',
      tokensUsed: 310
    });
    await delay(1200);

    // Step 5: Final Response Generation
    const finalMsg: Message = {
      id: messageId,
      sender: 'ai',
      senderName: 'Lauki Care AI',
      text: matchedResponse,
      timestamp,
      agentPhase: 'complete',
      sources: sourcesList,
      tokensUsed: Math.floor(Math.random() * 200) + 300
    };

    onProgress(finalMsg);
    return finalMsg;
  },

  // Ticket Operations
  async getTickets(): Promise<Ticket[]> {
    await delay(600);
    return [...MOCK_TICKETS];
  },

  async updateTicketStatus(ticketId: string, status: Ticket['status']): Promise<void> {
    await delay(500);
    console.log(`Updated Ticket ${ticketId} status to ${status}`);
  },

  // Knowledge Base Search
  async semanticSearch(query: string): Promise<KBArticle[]> {
    await delay(800);
    const searchVal = query.toLowerCase();
    if (!searchVal) return MOCK_KB_ARTICLES;

    return MOCK_KB_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(searchVal) ||
        a.content.toLowerCase().includes(searchVal)
    );
  },

  // File Vector Sync simulation
  async simulateDocumentUpload(
    name: string,
    size: string,
    onProgress: (percent: number) => void
  ): Promise<KBArticle> {
    for (let percent = 5; percent <= 100; percent += 15) {
      onProgress(percent);
      await delay(250);
    }

    const newDoc: KBArticle = {
      id: 'KB-' + Math.floor(Math.random() * 900 + 100),
      title: name,
      category: name.toLowerCase().includes('policy') ? 'policy' : 'sop',
      content: `Simulated parsed text content for uploaded document: ${name}. This file was processed using Amazon Textract, chunked into overlapping passages of 512 tokens, and converted to 1536-dimensional vectors.`,
      format: name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'markdown',
      size,
      status: 'indexed',
      lastSync: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      citationsCount: 0
    };

    return newDoc;
  }
};
