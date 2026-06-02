import asyncio
import uuid
import logging
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .database.session import AsyncSessionLocal, Base, engine
from .models.index import (
    User, Customer, CustomerProfile, Conversation, Message, 
    Ticket, TicketComment, AgentActivity, AnalyticsMetric
)
from .core.security import get_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("db_seeder")

# Realistic Seeding Registers
SCENARIOS = [
    {
        "category": "ORDER_SHIPPING",
        "topic": "Order Tracking & Fulfillment",
        "user_msg": "Where is my iPhone fleet order ORD-8944? The DHL tracking status says in-transit and I need to verify custom engravings.",
        "ai_msg": "Parsed shipping register for order ORD-8944 (25 iPhones). The custom engraving has been verified by the warehouse. The package is currently in transit via DHL Express (Tracking: DHL-982-1029-44) and is on schedule to reach your London Office Hub by next Tuesday.",
        "phase": "complete"
    },
    {
        "category": "ORDER_SHIPPING",
        "topic": "Shipment Engraving Delay",
        "user_msg": "Our logistics director noticed order ORD-1092 was delivered, but 2 devices lack custom fleet serial engravings.",
        "ai_msg": "I apologize for the oversight on ORD-1092. I have queried the fulfillment database and confirmed that two serial numbers were skipped during custom laser printing. I am dispatching a pre-paid FedEx return label and placing a priority replacement batch order today.",
        "phase": "complete"
    },
    {
        "category": "MDM_SECURITY",
        "topic": "Cognito Enrollment Error 994",
        "user_msg": "Our remote engineers are getting MDM profile Enrollment Failure Error 994 during active Cognito authentication.",
        "ai_msg": "Security logs map Error 994 to expired authentication profiles. I have triggered an automated secure Cognito user session token rotation for your team. Please reboot the handsets and run the enrollment handshake again.",
        "phase": "action"
    },
    {
        "category": "MDM_SECURITY",
        "topic": "Passcode Bypass Override",
        "user_msg": "A field engineer was locked out of their MDM secure device. Can we get a passcode bypass key?",
        "ai_msg": "Under security profile protocols, I have checked your active Enterprise Gold entitlement. I am initiating a secure bypass override challenge code. Please input bypass key: MDM-BYPASS-509.",
        "phase": "action"
    },
    {
        "category": "GENERAL_FAQ",
        "topic": "Account Billing Setup",
        "user_msg": "What are your support working hours and how do we set up consolidated ACH invoices?",
        "ai_msg": "Lauki AI Customer Care is operational 24/7/365. To configure automated corporate ACH billing, please navigate to settings, select corporate invoicing, and map your account bank details. Settlements occur monthly on invoice INV-2026-991.",
        "phase": "rag"
    },
    {
        "category": "GENERAL_FAQ",
        "topic": "SOP Device Lifecycle Policy",
        "user_msg": "What is the standard warranty policy on hardware replacements for corporate premium plans?",
        "ai_msg": "Under our Premium SLA guidelines (SOP-312), hardware failures reported prior to 5:00 PM GMT qualify for next-business-day DHL express swap delivery. Your devices are fully protected.",
        "phase": "rag"
    },
    {
        "category": "FRUSTRATED_ESCALATION",
        "topic": "Urgent Operations Lockout",
        "user_msg": "This is completely unacceptable. The MDM system has been locked for two hours and our field operators can't work! Escalate this to a supervisor now.",
        "ai_msg": "⚠️ **Frustration Indicator Triggered**: I completely understand the operational impact. I have created a **CRITICAL Support Ticket** and dispatched your session profile to our L3 MDM engineering team immediately. solutions expert Alex will reach out.",
        "phase": "complete"
    },
    {
        "category": "FRUSTRATED_ESCALATION",
        "topic": "Double Billing Dispute",
        "user_msg": "We were billed twice on invoice INV-2026-1022! This is terrible service and I demand to speak with your finance director.",
        "ai_msg": "⚠️ **Frustration Indicator Triggered**: I apologize for the invoicing discrepancy. I have marked this billing dispute as critical, initialized ticket #4092, and routed it to our accounts settlement department. You will receive an immediate voice call.",
        "phase": "complete"
    }
]

FIRST_NAMES = ["Sarah", "Sophia", "Olivia", "Ava", "Emma", "Isabella", "James", "Alexander", "Michael", "David", "Robert", "John", "Jessica", "Daniel", "Emily", "Mia"]
LAST_NAMES = ["Jenkins", "Patel", "Chen", "Ross", "Watson", "Smith", "Johnson", "Brown", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor"]
DOMAINS = ["nexus.io", "cybercore.net", "auroratech.co", "laukicare.org", "fleetops.com", "technovate.net", "globalinfra.org", "enterprisehub.co"]

async def seed_database():
    logger.info("Initializing Postgres database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    db: AsyncSession = AsyncSessionLocal()
    try:
        # 1. Seed Operators users
        logger.info("Seeding Admin & Support Agent profiles...")
        chk_u = await db.execute(select(User).filter(User.email == "admin@lauki.care"))
        if not chk_u.scalars().first():
            hashed = get_password_hash("AdminPassword123!")
            admin = User(
                email="admin@lauki.care",
                hashed_password=hashed,
                full_name="Admin Operator",
                role="admin"
            )
            agent = User(
                email="agent@lauki.care",
                hashed_password=hashed,
                full_name="Alex Support Architect",
                role="support_agent"
            )
            db.add_all([admin, agent])
            await db.flush()

        # 2. Seed 100 Customer profiles
        logger.info("Seeding 100 detailed Customer profiles...")
        chk_c = await db.execute(select(Customer))
        existing_customers = chk_c.scalars().all()
        customers_list = []
        
        if not existing_customers:
            for i in range(1, 101):
                plans = ["basic", "premium", "enterprise"]
                plan = plans[i % 3]
                sentiments = ["happy", "neutral", "frustrated"]
                sentiment = sentiments[i % 3]
                
                first = random.choice(FIRST_NAMES)
                last = random.choice(LAST_NAMES)
                name = f"{first} {last}"
                email = f"{first.lower()}.{last.lower()}_{i}@{random.choice(DOMAINS)}"
                
                cust = Customer(
                    name=name,
                    email=email,
                    phone=f"+1 (555) 728-{1000 + i}",
                    plan=plan,
                    sentiment=sentiment,
                    sentiment_score=40 + (i % 55)
                )
                db.add(cust)
                customers_list.append(cust)
            await db.flush()

            # Seed profiles and order histories for each customer
            for idx, cust in enumerate(customers_list):
                orders = [
                    {
                        "id": f"ORD-{9800 + idx}",
                        "item": "Lauki Secure Phone Core Gen-2",
                        "date": (datetime.now() - timedelta(days=random.randint(5, 30))).strftime("%Y-%m-%d"),
                        "amount": 1299.00 * random.randint(1, 10),
                        "status": "delivered" if idx % 2 == 0 else "shipped"
                    }
                ]
                prof = CustomerProfile(
                    customer_id=cust.id,
                    summary=f"Key corporate technical point of contact managed under entitlement tier: {cust.plan.upper()}.",
                    orders=orders
                )
                db.add(prof)
            await db.flush()
        else:
            customers_list = existing_customers

        # 3. Seed 500 Conversation logs
        logger.info("Seeding 500 multi-turn Conversation logs...")
        chk_v = await db.execute(select(Conversation))
        if not chk_v.scalars().all():
            for i in range(1, 501):
                cust = customers_list[i % len(customers_list)]
                scen = random.choice(SCENARIOS)
                
                conv = Conversation(
                    customer_id=cust.id,
                    topic=f"{scen['topic']} - Case {1000 + i}",
                    status="resolved" if i % 2 == 0 else "active",
                    sentiment=cust.sentiment
                )
                db.add(conv)
                await db.flush()

                # Add multi-turn message exchanges
                m1 = Message(
                    conversation_id=conv.id,
                    sender="user",
                    sender_name=cust.name,
                    text=scen["user_msg"],
                    created_at=datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 120))
                )
                m2 = Message(
                    conversation_id=conv.id,
                    sender="ai",
                    sender_name="Lauki Care AI",
                    text=scen["ai_msg"],
                    agent_phase=scen["phase"],
                    tokens_used=180 + (i % 250),
                    created_at=datetime.now(timezone.utc) - timedelta(minutes=random.randint(1, 4))
                )
                db.add_all([m1, m2])
            await db.flush()

        # 4. Seed 200 Support Tickets
        logger.info("Seeding 200 SLA Tickets...")
        chk_t = await db.execute(select(Ticket))
        if not chk_t.scalars().all():
            for i in range(1, 201):
                cust = customers_list[i % len(customers_list)]
                priorities = ["low", "medium", "high", "critical"]
                priority = priorities[i % 4]
                statuses = ["open", "pending", "resolved", "closed", "escalated"]
                status = statuses[i % 5]
                
                ticket = Ticket(
                    title=f"MDM Activation Failure - Error Code {900 + i}",
                    description=f"Device enrollment profile validation token credentials handshake failed. Assigned customer ID link: {cust.id}",
                    customer_id=cust.id,
                    priority=priority,
                    status=status
                )
                db.add(ticket)
                await db.flush()

                # Add timeline comment
                com = TicketComment(
                    ticket_id=ticket.id,
                    author_name="System Audit Log",
                    action_taken="Ticket Initialized",
                    comment=f"Ticket opened under SLA check priority {priority.upper()}.",
                    details=f"Assigned customer ID link: {cust.id}"
                )
                db.add(com)
            await db.flush()

        # 5. Seed 5 AI Agents statuses
        logger.info("Seeding 5 active AI Agents statuses...")
        chk_a = await db.execute(select(AgentActivity))
        if not chk_a.scalars().all():
            agents = [
                AgentActivity(agent_name="Intent Agent", status="idle", health="healthy", tasks_processed=4500, avg_response_time=0.18, requests_per_min=450, latency=180, accuracy_rate=99.2, model_id="amazon.titan-text-express-v1"),
                AgentActivity(agent_name="Verification Agent", status="idle", health="healthy", tasks_processed=5120, avg_response_time=0.09, requests_per_min=512, latency=90, accuracy_rate=100.0, model_id="custom-auth-classifier-v1"),
                AgentActivity(agent_name="Knowledge RAG Agent", status="idle", health="healthy", tasks_processed=3200, avg_response_time=0.68, requests_per_min=320, latency=680, accuracy_rate=96.8, model_id="anthropic.claude-3-5-sonnet"),
                AgentActivity(agent_name="Action Execution Agent", status="idle", health="healthy", tasks_processed=1400, avg_response_time=0.82, requests_per_min=140, latency=820, accuracy_rate=98.4, model_id="anthropic.claude-3-5-sonnet"),
                AgentActivity(agent_name="Escalation Agent", status="idle", health="warning", tasks_processed=1800, avg_response_time=0.12, requests_per_min=180, latency=120, accuracy_rate=97.9, model_id="meta.llama-3-1-70b-instruct")
            ]
            db.add_all(agents)
            await db.flush()

        # 6. Seed 30 Days of Analytics Metrics
        logger.info("Seeding 30 days of deep Analytics Metrics...")
        chk_m = await db.execute(select(AnalyticsMetric))
        if not chk_m.scalars().all():
            # Seed daily values for the past 30 days
            for day_offset in range(30):
                bucket_time = datetime.now() - timedelta(days=day_offset)
                
                # Metric variations
                total_chats = 120 + random.randint(10, 80)
                violations = random.randint(0, 5)
                csat = 4.5 + (random.randint(0, 4) / 10.0)
                automation = 78.0 + (random.randint(0, 80) / 10.0)
                escalations = 4.0 + (random.randint(0, 50) / 10.0)
                
                metrics = [
                    AnalyticsMetric(metric_name="total_chats", value=float(total_chats), time_bucket=bucket_time),
                    AnalyticsMetric(metric_name="sla_violations", value=float(violations), time_bucket=bucket_time),
                    AnalyticsMetric(metric_name="csat_score", value=float(csat), time_bucket=bucket_time),
                    AnalyticsMetric(metric_name="ai_automation_rate", value=float(automation), time_bucket=bucket_time),
                    AnalyticsMetric(metric_name="escalation_rate", value=float(escalations), time_bucket=bucket_time)
                ]
                db.add_all(metrics)
            await db.flush()

        await db.commit()
        logger.info("Database successfully seeded with enterprise operational data matrices!")
    except Exception as e:
        await db.rollback()
        logger.error(f"Seeding operation failed: {e}")
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
