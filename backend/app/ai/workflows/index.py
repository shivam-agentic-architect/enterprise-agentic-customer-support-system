import logging
from langgraph.graph import StateGraph, END
from ..agents.index import (
    AgentState,
    intent_agent_node,
    verification_agent_node,
    knowledge_agent_node,
    action_agent_node,
    escalation_agent_node
)

logger = logging.getLogger("ai_workflows")

# 1. Initialize State Graph
workflow = StateGraph(AgentState)

# 2. Add Processing Nodes
workflow.add_node("intent", intent_agent_node)
workflow.add_node("verification", verification_agent_node)
workflow.add_node("knowledge", knowledge_agent_node)
workflow.add_node("action", action_agent_node)
workflow.add_node("escalation", escalation_agent_node)

# 3. Configure Sequential Tracing Edges
workflow.set_entry_point("intent")
workflow.add_edge("intent", "verification")
workflow.add_edge("verification", "knowledge")
workflow.add_edge("knowledge", "action")
workflow.add_edge("action", "escalation")
workflow.add_edge("escalation", END)

# 4. Compile Compiled Graph State Machine
compiled_graph = workflow.compile()
logger.info("LangGraph Agentic pipeline compiled successfully.")
