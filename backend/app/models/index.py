import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from ..database.session import Base

# Mixin class providing common columns
class BaseModelMixin:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)

class User(Base, BaseModelMixin):
    __tablename__ = "users"

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="support_agent", nullable=False) # admin, support_agent, manager, customer
    is_active = Column(Boolean, default=True, nullable=False)

    # Relationships
    tickets = relationship("Ticket", back_populates="assignee")

class Customer(Base, BaseModelMixin):
    __tablename__ = "customers"

    name = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    plan = Column(String, default="basic", nullable=False) # basic, premium, enterprise
    sentiment = Column(String, default="neutral", nullable=False) # happy, neutral, frustrated
    sentiment_score = Column(Integer, default=50, nullable=False) # 0 - 100

    # Relationships
    profile = relationship("CustomerProfile", back_populates="customer", uselist=False)
    conversations = relationship("Conversation", back_populates="customer")
    tickets = relationship("Ticket", back_populates="customer")

class CustomerProfile(Base, BaseModelMixin):
    __tablename__ = "customer_profiles"

    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), unique=True, nullable=False)
    summary = Column(String, nullable=True)
    orders = Column(JSON, default=list) # List of CustomerOrder objects

    # Relationships
    customer = relationship("Customer", back_populates="profile")

class Conversation(Base, BaseModelMixin):
    __tablename__ = "conversations"

    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    status = Column(String, default="active", nullable=False) # active, waiting, escalated, resolved
    topic = Column(String, nullable=True)
    sentiment = Column(String, default="neutral", nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", order_by="Message.created_at")

class Message(Base, BaseModelMixin):
    __tablename__ = "messages"

    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    sender = Column(String, nullable=False) # user, agent, ai
    sender_name = Column(String, nullable=False)
    text = Column(String, nullable=False)
    agent_phase = Column(String, nullable=True) # intent, verification, rag, action, complete
    tokens_used = Column(Integer, default=0)
    sources = Column(JSON, default=list) # List of RAGSource objects
    attachments = Column(JSON, default=list) # List of Attachment objects

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

class Ticket(Base, BaseModelMixin):
    __tablename__ = "tickets"

    title = Column(String, nullable=False, index=True)
    description = Column(String, nullable=False)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    status = Column(String, default="open", nullable=False) # open, pending, resolved, closed, escalated
    priority = Column(String, default="medium", nullable=False) # low, medium, high, critical

    # Relationships
    customer = relationship("Customer", back_populates="tickets")
    assignee = relationship("User", back_populates="tickets")
    comments = relationship("TicketComment", back_populates="ticket", order_by="TicketComment.created_at")

class TicketComment(Base, BaseModelMixin):
    __tablename__ = "ticket_comments"

    ticket_id = Column(UUID(as_uuid=True), ForeignKey("tickets.id"), nullable=False)
    author_name = Column(String, nullable=False)
    action_taken = Column(String, nullable=False)
    comment = Column(String, nullable=True)
    details = Column(String, nullable=True)

    # Relationships
    ticket = relationship("Ticket", back_populates="comments")

class KnowledgeDocument(Base, BaseModelMixin):
    __tablename__ = "knowledge_documents"

    title = Column(String, nullable=False, index=True)
    category = Column(String, default="policy", nullable=False) # policy, faq, sop, api
    content = Column(String, nullable=False)
    format = Column(String, default="pdf", nullable=False) # pdf, docx, txt
    size = Column(String, nullable=False)
    status = Column(String, default="indexed", nullable=False) # indexed, syncing, failed
    last_sync = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    citations_count = Column(Integer, default=0, nullable=False)

class AgentActivity(Base, BaseModelMixin):
    __tablename__ = "agent_activity"

    agent_name = Column(String, nullable=False, unique=True, index=True)
    status = Column(String, default="idle", nullable=False) # idle, processing, offline
    health = Column(String, default="healthy", nullable=False) # healthy, warning, error
    tasks_processed = Column(Integer, default=0, nullable=False)
    avg_response_time = Column(Float, default=0.0, nullable=False)
    requests_per_min = Column(Integer, default=0, nullable=False)
    latency = Column(Integer, default=0, nullable=False)
    accuracy_rate = Column(Float, default=95.0, nullable=False)
    model_id = Column(String, nullable=False)

class AnalyticsMetric(Base, BaseModelMixin):
    __tablename__ = "analytics_metrics"

    metric_name = Column(String, nullable=False, index=True)
    value = Column(Float, nullable=False)
    time_bucket = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

class AuditLog(Base, BaseModelMixin):
    __tablename__ = "audit_logs"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    details = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)

class Notification(Base, BaseModelMixin):
    __tablename__ = "notifications"

    message = Column(String, nullable=False)
    type = Column(String, default="info", nullable=False) # info, warning, success, error
    is_read = Column(Boolean, default=False, nullable=False)
