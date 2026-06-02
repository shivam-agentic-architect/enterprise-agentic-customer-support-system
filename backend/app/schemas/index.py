from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID

# -----------------
# AUTH & USER SCHEMAS
# -----------------
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "support_agent"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str
    exp: int
    type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

# -----------------
# CUSTOMER SCHEMAS
# -----------------
class CustomerOrderSchema(BaseModel):
    id: str
    item: str
    date: str
    amount: float
    status: str # delivered, processing, shipped, returned

class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    plan: str = "basic" # basic, premium, enterprise

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    plan: Optional[str] = None
    sentiment: Optional[str] = None
    sentiment_score: Optional[int] = None

class CustomerResponse(CustomerBase):
    id: UUID
    sentiment: str
    sentiment_score: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CustomerProfileResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    phone: Optional[str] = None
    plan: str
    sentiment: str
    sentiment_score: int
    summary: Optional[str] = None
    orders: List[CustomerOrderSchema] = []
    tickets: List[Any] = [] # Typed dynamically based on imports
    ai_recommendations: List[str] = []

    model_config = ConfigDict(from_attributes=True)

# -----------------
# CONVERSATION SCHEMAS
# -----------------
class RAGSourceSchema(BaseModel):
    title: str
    url: str
    score: float

class AttachmentSchema(BaseModel):
    name: str
    type: str
    size: str
    url: Optional[str] = None

class MessageBase(BaseModel):
    sender: str # user, agent, ai
    sender_name: str
    text: str
    agent_phase: Optional[str] = None
    tokens_used: Optional[int] = 0
    sources: Optional[List[RAGSourceSchema]] = []
    attachments: Optional[List[AttachmentSchema]] = []

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationBase(BaseModel):
    customer_id: UUID
    topic: Optional[str] = None

class ConversationCreate(ConversationBase):
    pass

class ConversationResponse(BaseModel):
    id: UUID
    customer_id: UUID
    customer_name: Optional[str] = None
    customer_avatar: Optional[str] = None
    status: str
    sentiment: str
    topic: Optional[str] = None
    messages: List[MessageResponse] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatMessageRequest(BaseModel):
    customerId: UUID
    message: str

# -----------------
# TICKETS SCHEMAS
# -----------------
class TicketCommentBase(BaseModel):
    author_name: str
    action_taken: str
    comment: Optional[str] = None
    details: Optional[str] = None

class TicketCommentCreate(TicketCommentBase):
    pass

class TicketCommentResponse(TicketCommentBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TicketBase(BaseModel):
    title: str
    description: str
    customer_id: UUID
    assigned_to: Optional[UUID] = None
    priority: str = "medium" # low, medium, high, critical

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[UUID] = None
    status: Optional[str] = None
    priority: Optional[str] = None

class TicketResponse(TicketBase):
    id: UUID
    customer_name: Optional[str] = None
    status: str
    comments: List[TicketCommentResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# -----------------
# KNOWLEDGE BASE SCHEMAS
# -----------------
class KBArticleBase(BaseModel):
    title: str
    category: str = "policy" # policy, faq, sop, api
    content: str
    format: str = "pdf" # pdf, docx, txt
    size: str

class KBArticleCreate(KBArticleBase):
    pass

class KBArticleResponse(KBArticleBase):
    id: UUID
    status: str
    last_sync: datetime
    citations_count: int

    model_config = ConfigDict(from_attributes=True)

# -----------------
# AI AGENT telemetry SCHEMAS
# -----------------
class AgentActivityResponse(BaseModel):
    id: UUID
    agentName: str = Field(alias="agent_name")
    status: str
    health: str
    tasksProcessed: int = Field(alias="tasks_processed")
    avgResponseTime: float = Field(alias="avg_response_time")
    requestsPerMin: int = Field(alias="requests_per_min")
    latency: int
    accuracyRate: float = Field(alias="accuracy_rate")
    modelId: str = Field(alias="model_id")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# -----------------
# DASHBOARD SCHEMAS
# -----------------
class DashboardSummaryResponse(BaseModel):
    totalCustomers: int
    totalConversations: int
    totalTickets: int
    openTickets: int
    resolutionRate: float
    customerSatisfaction: float
    aiAutomationRate: float

class DashboardChartItem(BaseModel):
    name: str
    total: Optional[float] = 0
    automated: Optional[float] = 0
    escalated: Optional[float] = 0
    low: Optional[float] = 0
    medium: Optional[float] = 0
    high: Optional[float] = 0
    critical: Optional[float] = 0
    value: Optional[float] = 0
    csat: Optional[float] = 0

class DashboardChartsResponse(BaseModel):
    monthlyConversations: List[DashboardChartItem]
    ticketTrends: List[DashboardChartItem]
    escalationTrends: List[DashboardChartItem]
    satisfactionScores: List[DashboardChartItem]

class SystemConfigUpdate(BaseModel):
    bedrockModel: str
    temperature: float
    maxTokens: int
    systemPrompt: str
