import logging
from typing import List, Dict, Any
from ..core.config import settings

logger = logging.getLogger("opensearch_service")

class OpenSearchService:
    def __init__(self):
        self.active = False
        if settings.OPENSEARCH_HOST:
            try:
                # OpenSearch async search configuration
                from opensearchpy import AsyncOpenSearch
                self.client = AsyncOpenSearch(
                    hosts=[settings.OPENSEARCH_HOST],
                    http_auth=(settings.OPENSEARCH_USER, settings.OPENSEARCH_PASSWORD),
                    use_ssl=True,
                    verify_certs=True,
                )
                self.active = True
                logger.info("OpenSearch Vector DB client successfully connected.")
            except Exception as e:
                logger.error(f"Failed to connect to OpenSearch: {e}")
        else:
            logger.info("OpenSearch Host not configured. Defaulting to local keyword indexing fallbacks.")

    async def index_document(
        self, 
        document_id: str, 
        title: str, 
        content: str, 
        embeddings: List[float], 
        metadata: Dict[str, Any]
    ) -> bool:
        if self.active:
            try:
                body = {
                    "title": title,
                    "content": content,
                    "vector": embeddings,
                    "metadata": metadata
                }
                await self.client.index(
                    index="kb-articles",
                    id=document_id,
                    body=body,
                    refresh=True
                )
                logger.info(f"Indexed document {document_id} inside OpenSearch vector.")
                return True
            except Exception as e:
                logger.error(f"OpenSearch index failed: {e}")
        return True

    async def search_vector_database(
        self, 
        query_text: str, 
        query_embeddings: List[float], 
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        if self.active:
            try:
                # k-NN vector search query payload structure
                query = {
                    "size": limit,
                    "query": {
                        "knn": {
                            "vector": {
                                "vector": query_embeddings,
                                "k": limit
                            }
                        }
                    }
                }
                resp = await self.client.search(index="kb-articles", body=query)
                hits = resp["hits"]["hits"]
                
                results = []
                for h in hits:
                    source = h["_source"]
                    results.append({
                        "title": source.get("title"),
                        "url": source.get("metadata", {}).get("url", "s3://kb-policies/docs.pdf"),
                        "score": h["_score"],
                        "content": source.get("content")
                    })
                return results
            except Exception as e:
                logger.error(f"OpenSearch search failed: {e}")

        # Local semantic mock fallback search
        results = []
        search_val = query_text.lower()
        if "activation" in search_val or "mdm" in search_val or "error" in search_val or "994" in search_val:
            results = [
                {
                    "title": "MDM Profile Error 994 Activation Workaround (KB-992)",
                    "url": "s3://kb-docs/mdm-config-v2.pdf",
                    "score": 0.96,
                    "content": "Workaround instructions bypassing token errors: trigger Cognito token rotations using standard API setups."
                },
                {
                    "title": "Cognito Security Guidelines",
                    "url": "s3://kb-docs/security-token-policy.md",
                    "score": 0.88,
                    "content": "Verify JWT keys. Enforce user pools credentials validations through private network channels."
                }
            ]
        elif "order" in search_val or "ship" in search_val or "engrav" in search_val:
            results = [
                {
                    "title": "Warehouse Logistics SOP",
                    "url": "s3://kb-warehouse/logistics-sop.pdf",
                    "score": 0.91,
                    "content": "Standard shipping policies on customized iPhone fleet orders: engravings finished prior to DHL retrieval."
                }
            ]
        else:
            results = [
                {
                    "title": "Standard Service Guidelines (KB-501)",
                    "url": "s3://kb-docs/service-guidelines.md",
                    "score": 0.81,
                    "content": "Default SLA priorities checks: ticket queues rotators and escalation triggers."
                }
            ]
        return results[:limit]

opensearch_service = OpenSearchService()
