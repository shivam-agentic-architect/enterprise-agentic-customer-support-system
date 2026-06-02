# Base file for Alembic auto-generation mappings
from .session import Base
from ..models.index import (
    User,
    Customer,
    CustomerProfile,
    Conversation,
    Message,
    Ticket,
    TicketComment,
    KnowledgeDocument,
    AgentActivity,
    AnalyticsMetric,
    AuditLog,
    Notification
)
