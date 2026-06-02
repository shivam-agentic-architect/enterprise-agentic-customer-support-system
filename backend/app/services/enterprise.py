import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

logger = logging.getLogger("enterprise_service")

class SalesforceMock:
    def __init__(self):
        # Seed Salesforce CRM Contact and Case records
        self.contacts = {
            "admin@lauki.care": {
                "contact_id": "0038W00001YzaQ9QAJ",
                "account_name": "Lauki Systems Ltd",
                "phone": "+1-555-019-2831",
                "title": "IT Operations Director",
                "tier": "Enterprise Gold"
            },
            "agent@lauki.care": {
                "contact_id": "0038W00001YzaQ9QAK",
                "account_name": "Lauki Support Core",
                "phone": "+1-555-019-2832",
                "title": "Lead Support Coordinator",
                "tier": "Enterprise Silver"
            }
        }
        self.cases = [
            {
                "case_id": "5008W00000VzA92QAF",
                "subject": "Cognito User Pool Token Rotation Delay",
                "status": "In Progress",
                "priority": "High",
                "contact_email": "admin@lauki.care",
                "description": "API requests to rotation Cognito credentials occasionally timeout during peak usage.",
                "created_at": (datetime.now() - timedelta(days=2)).isoformat()
            },
            {
                "case_id": "5008W00000VzA92QAG",
                "subject": "Bulk Fleet Device Registration Error",
                "status": "Closed",
                "priority": "Medium",
                "contact_email": "admin@lauki.care",
                "description": "Bulk import of iPhone fleet failed with enrollment limits boundary alerts.",
                "created_at": (datetime.now() - timedelta(days=5)).isoformat()
            }
        ]

    async def get_contact(self, email: str) -> Optional[Dict[str, Any]]:
        return self.contacts.get(email)

    async def get_cases(self, email: Optional[str] = None) -> List[Dict[str, Any]]:
        if email:
            return [c for c in self.cases if c["contact_email"] == email]
        return self.cases

    async def create_case(self, subject: str, description: str, email: str, priority: str = "Medium") -> Dict[str, Any]:
        case_id = f"5008W00000VzA{len(self.cases) + 100}QAF"
        new_case = {
            "case_id": case_id,
            "subject": subject,
            "description": description,
            "status": "New",
            "priority": priority,
            "contact_email": email,
            "created_at": datetime.now().isoformat()
        }
        self.cases.insert(0, new_case)
        logger.info(f"Salesforce Case created: {case_id}")
        return new_case


class ServiceNowMock:
    def __init__(self):
        # Seed ServiceNow IT incidents
        self.incidents = [
            {
                "sys_id": "INC0010928",
                "short_description": "MDM Enrollment Handshake Error 994",
                "category": "Software",
                "state": "Active",
                "assignment_group": "L3 MDM Engineering",
                "caller_id": "admin@lauki.care",
                "urgency": "1 - High",
                "sys_created_on": (datetime.now() - timedelta(hours=12)).isoformat()
            },
            {
                "sys_id": "INC0009821",
                "short_description": "Cognito IDP API Endpoint Outage",
                "category": "Cloud Infrastructure",
                "state": "Resolved",
                "assignment_group": "Identity Operations",
                "caller_id": "admin@lauki.care",
                "urgency": "2 - Medium",
                "sys_created_on": (datetime.now() - timedelta(days=4)).isoformat()
            }
        ]

    async def get_incidents(self, caller: Optional[str] = None) -> List[Dict[str, Any]]:
        if caller:
            return [i for i in self.incidents if i["caller_id"] == caller]
        return self.incidents

    async def create_incident(self, short_description: str, caller: str, urgency: str = "2 - Medium") -> Dict[str, Any]:
        sys_id = f"INC00{len(self.incidents) + 10928}"
        new_inc = {
            "sys_id": sys_id,
            "short_description": short_description,
            "category": "Software",
            "state": "New",
            "assignment_group": "L1 Service Desk Team",
            "caller_id": caller,
            "urgency": urgency,
            "sys_created_on": datetime.now().isoformat()
        }
        self.incidents.insert(0, new_inc)
        logger.info(f"ServiceNow Incident registered: {sys_id}")
        return new_inc


class OrderManagementMock:
    def __init__(self):
        # Seed Order status database
        self.orders = {
            "ORD-8944": {
                "order_id": "ORD-8944",
                "shipping_carrier": "DHL Express",
                "tracking_number": "DHL-982-1029-44",
                "status": "In Transit",
                "delivery_location": "London Office Hub",
                "custom_engraving_profile": "Lauki Corp Logo Inspected",
                "estimated_arrival": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
                "fleet_size": 25,
                "model": "iPhone 15 Pro Max 256GB"
            },
            "ORD-1092": {
                "order_id": "ORD-1092",
                "shipping_carrier": "FedEx Priority",
                "tracking_number": "FDX-773-1092-21",
                "status": "Delivered",
                "delivery_location": "Manchester Operations Center",
                "custom_engraving_profile": "Completed & Verified",
                "estimated_arrival": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
                "fleet_size": 10,
                "model": "iPhone 15 Pro 128GB"
            }
        }

    async def get_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        return self.orders.get(order_id)

    async def update_tracking(self, order_id: str, status: str, location: str) -> Optional[Dict[str, Any]]:
        order = self.orders.get(order_id)
        if order:
            order["status"] = status
            order["delivery_location"] = location
            logger.info(f"Order {order_id} tracking updated: {status}")
            return order
        return None


class PaymentSystemMock:
    def __init__(self):
        # Seed invoices listing
        self.invoices = [
            {
                "invoice_id": "INV-2026-991",
                "billing_account": "Lauki Systems Ltd",
                "amount": 28450.00,
                "currency": "USD",
                "status": "Paid",
                "payment_method": "ACH Direct Debit",
                "invoice_date": (datetime.now() - timedelta(days=15)).strftime("%Y-%m-%d")
            },
            {
                "invoice_id": "INV-2026-1022",
                "billing_account": "Lauki Systems Ltd",
                "amount": 1250.00,
                "currency": "USD",
                "status": "Awaiting Settlement",
                "payment_method": "Corporate Credit Card",
                "invoice_date": datetime.now().strftime("%Y-%m-%d")
            }
        ]

    async def get_invoices(self, account_name: Optional[str] = None) -> List[Dict[str, Any]]:
        if account_name:
            return [i for i in self.invoices if i["billing_account"] == account_name]
        return self.invoices

    async def process_payment(self, invoice_id: str) -> Optional[Dict[str, Any]]:
        for i in self.invoices:
            if i["invoice_id"] == invoice_id:
                i["status"] = "Paid"
                logger.info(f"Invoice {invoice_id} payment processed successfully.")
                return i
        return None


class EnterpriseService:
    def __init__(self):
        self.salesforce = SalesforceMock()
        self.servicenow = ServiceNowMock()
        self.orders = OrderManagementMock()
        self.payments = PaymentSystemMock()

    # Consolidated CRM contact profile resolver helper
    async def get_consolidated_customer_profile(self, email: str) -> Dict[str, Any]:
        sfdc_contact = await self.salesforce.get_contact(email)
        if not sfdc_contact:
            return {"error": f"Contact not found in Salesforce CRM Registry for: {email}"}
            
        sfdc_cases = await self.salesforce.get_cases(email)
        snow_incidents = await self.servicenow.get_incidents(email)
        invoices = await self.payments.get_invoices(sfdc_contact["account_name"])
        
        return {
            "crm_contact": sfdc_contact,
            "salesforce_cases": sfdc_cases,
            "servicenow_incidents": snow_incidents,
            "billing_invoices": invoices,
            "sync_timestamp": datetime.now().isoformat()
        }

enterprise_service = EnterpriseService()
