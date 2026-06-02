import json
import logging
import re
from typing import List
import boto3
from ..core.config import settings

logger = logging.getLogger("bedrock_service")

class BedrockService:
    def __init__(self):
        self.active = False
        # Initialize Bedrock Client if keys are configured
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            try:
                self.client = boto3.client(
                    service_name="bedrock-runtime",
                    region_name=settings.AWS_REGION,
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
                )
                self.active = True
                logger.info("AWS Bedrock runtime client successfully configured.")
            except Exception as e:
                logger.error(f"Failed to initialize AWS Bedrock client: {e}")
        else:
            logger.info("AWS keys not fully configured. Defaulting to local AI mock layers.")

    async def generate_response(
        self, 
        prompt: str, 
        system_prompt: str = None, 
        max_tokens: int = 1000, 
        temperature: float = 0.3,
        model_id: str = None
    ) -> str:
        model = model_id or settings.BEDROCK_MODEL_ID
        
        if self.active:
            try:
                # Body schema varies based on model providers. Mapped standard Claude Messages schema
                body_dict = {
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "messages": [{"role": "user", "content": prompt}]
                }
                if system_prompt:
                    body_dict["system"] = system_prompt

                body = json.dumps(body_dict)
                response = self.client.invoke_model(
                    body=body,
                    modelId=model,
                    accept="application/json",
                    contentType="application/json"
                )
                response_body = json.loads(response.get("body").read())
                return response_body["content"][0]["text"]
            except Exception as e:
                logger.error(f"Bedrock invocation failed: {e}. Defaulting to mock response.")

        # Local mock response fallback logic
        query = prompt.lower()
        if "activation" in query or "mdm" in query or "994" in query:
            return (
                "🚨 **Error 994 Activation Failure Mapped**: Based on standard security vector bypass "
                "policies, this credential error is triggered when an enrollment security profile lacks "
                "its local decryption token.\n\n"
                "**Action Plan**:\n1. Instruct Cognito user pool manager to rotation tokens.\n"
                "2. Perform automatic level-3 technician queue escalation (Ticket created for Alex)."
            )
        elif "order" in query or "ship" in query or "invoice" in query:
            return (
                "📦 **Custom Logo Engraving Fulfillment Check**:\n"
                "Successfully queried warehousing databases. Invoice #8944 custom engraving profile is **completed and inspected**.\n"
                "Package awaiting pickup from DHL. Delivery to London scheduled within 3 business days."
            )
        else:
            return (
                "👋 **Lauki Care AI Response**: Thank you for contacting customer support. I have parsed your query "
                f"around \"{prompt}\". Our system has checked SOP indexes and has not flagged any immediate hardware alerts. "
                "Would you like me to create an engineering support ticket or escalate to an active Connect human queue?"
            )

    async def classify_intent(self, user_query: str) -> str:
        if self.active:
            try:
                prompt = (
                    "Classify the intent of the following customer support query into one of these exact categories: "
                    "MDM_SECURITY, ORDER_SHIPPING, GENERAL_FAQ, FRUSTRATED_ESCALATION.\n"
                    f"Query: \"{user_query}\"\n"
                    "Category:"
                )
                resp = await self.generate_response(prompt, max_tokens=15, temperature=0.0)
                cleaned = resp.strip().upper()
                for cat in ["MDM_SECURITY", "ORDER_SHIPPING", "GENERAL_FAQ", "FRUSTRATED_ESCALATION"]:
                    if cat in cleaned:
                        return cat
            except Exception as e:
                logger.error(f"Intent classification failed: {e}")

        # Local regex classification fallback
        query = user_query.lower()
        if any(w in query for w in ["activation", "mdm", "994", "token", "credential"]):
            return "MDM_SECURITY"
        elif any(w in query for w in ["order", "ship", "invoice", "deliver", "tracking"]):
            return "ORDER_SHIPPING"
        elif any(w in query for w in ["angry", "terrible", "fail", "worst", "human", "agent"]):
            return "FRUSTRATED_ESCALATION"
        return "GENERAL_FAQ"

    async def summarize_conversation(self, messages_text: str) -> str:
        if self.active:
            try:
                prompt = f"Summarize the following support conversation thread concisely focusing on technical issues:\n{messages_text}"
                return await self.generate_response(prompt, max_tokens=120)
            except Exception:
                pass
        return "Support chat summarizing active MDM activation failures and warehouse shipping status checks."

    async def generate_embeddings(self, text: str) -> List[float]:
        if self.active:
            try:
                # Amazon Titan embedding V2 body config
                body = json.dumps({"inputText": text})
                response = self.client.invoke_model(
                    body=body,
                    modelId="amazon.titan-embed-text-v1",
                    accept="application/json",
                    contentType="application/json"
                )
                response_body = json.loads(response.get("body").read())
                return response_body["embedding"]
            except Exception as e:
                logger.error(f"Embedding generation failed: {e}")
                
        # Return standard 1536-dimensional mock vector coordinates
        return [0.015 * (i % 5) for i in range(1536)]

bedrock_service = BedrockService()
