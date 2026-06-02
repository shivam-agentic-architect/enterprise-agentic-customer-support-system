import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from ...services.enterprise import enterprise_service

logger = logging.getLogger("integrations_router")
router = APIRouter(prefix="/integrations", tags=["Enterprise Mock Integrations"])

# Request Models
class SalesforceCaseCreate(BaseModel):
    subject: str
    description: str
    contact_email: str
    priority: Optional[str] = "Medium"

class ServiceNowIncidentCreate(BaseModel):
    short_description: str
    caller_email: str
    urgency: Optional[str] = "2 - Medium"

class InvoicePaymentRequest(BaseModel):
    invoice_id: str


# 1. Salesforce CRM Endpoints
@router.get("/salesforce/cases")
async def get_salesforce_cases(email: Optional[str] = None):
    try:
        return await enterprise_service.salesforce.get_cases(email)
    except Exception as e:
        logger.error(f"Salesforce mock lookup failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Salesforce CRM connection failure"
        )

@router.post("/salesforce/cases", status_code=status.HTTP_201_CREATED)
async def create_salesforce_case(payload: SalesforceCaseCreate):
    try:
        return await enterprise_service.salesforce.create_case(
            subject=payload.subject,
            description=payload.description,
            email=payload.contact_email,
            priority=payload.priority
        )
    except Exception as e:
        logger.error(f"Salesforce mock insert failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Salesforce Case creation failed"
        )


# 2. ServiceNow IT Incident Endpoints
@router.get("/servicenow/incidents")
async def get_servicenow_incidents(caller: Optional[str] = None):
    try:
        return await enterprise_service.servicenow.get_incidents(caller)
    except Exception as e:
        logger.error(f"ServiceNow mock query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ServiceNow connection timed out"
        )

@router.post("/servicenow/incidents", status_code=status.HTTP_201_CREATED)
async def create_servicenow_incident(payload: ServiceNowIncidentCreate):
    try:
        return await enterprise_service.servicenow.create_incident(
            short_description=payload.short_description,
            caller=payload.caller_email,
            urgency=payload.urgency
        )
    except Exception as e:
        logger.error(f"ServiceNow mock registration failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ServiceNow Incident generation failed"
        )


# 3. Order Management System Endpoints
@router.get("/orders/{order_id}")
async def get_order_tracking(order_id: str):
    order = await enterprise_service.orders.get_order(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order {order_id} not found in fulfillment warehouse register."
        )
    return order


# 4. Payment & Billing Systems Endpoints
@router.get("/payments/invoices")
async def get_billing_invoices(account_name: Optional[str] = None):
    try:
        return await enterprise_service.payments.get_invoices(account_name)
    except Exception as e:
        logger.error(f"Payments invoices query failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Payment Core connection failure"
        )

@router.post("/payments/process")
async def process_invoice_payment(payload: InvoicePaymentRequest):
    invoice = await enterprise_service.payments.process_payment(payload.invoice_id)
    if not invoice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice {payload.invoice_id} not found or already settled."
        )
    return {
        "success": True,
        "message": f"Payment successfully captured for {payload.invoice_id}.",
        "invoice": invoice
    }


# 5. Unified CRM Contact profile Endpoint
@router.get("/customers/{email}")
async def get_salesforce_customer_profile(email: str):
    profile = await enterprise_service.get_consolidated_customer_profile(email)
    if "error" in profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=profile["error"]
        )
    return profile
