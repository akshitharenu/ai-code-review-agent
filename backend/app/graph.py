# from langgraph.graph import StateGraph, END
# from langchain_google_genai import ChatGoogleGenerativeAI
# from typing import TypedDict, Optional, List
# from app.config import GEMINI_API_KEY
# import os

# os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY

# # --- State Schema ---
# # This is passed between ALL nodes in the pipeline
# class ReviewState(TypedDict):
#     # Input
#     code: str
#     language: str
#     filename: str

#     # Node outputs
#     parsed_code: Optional[str]
#     bugs: Optional[List[dict]]
#     security_issues: Optional[List[dict]]
#     quality_score: Optional[int]
#     quality_feedback: Optional[str]
#     suggestions: Optional[List[dict]]
#     final_report: Optional[str]

#     # Metadata
#     status: str
#     error: Optional[str]

# # --- Initialize Gemini ---
# llm = ChatGoogleGenerativeAI(
#     model="gemini-1.5-flash",
#     temperature=0.3
# )

from langgraph.graph import StateGraph, END
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from typing import TypedDict, Optional, List
from app.config import NVIDIA_API_KEY
import os

# --- State Schema ---
class ReviewState(TypedDict):
    code: str
    language: str
    filename: str
    parsed_code: Optional[str]
    bugs: Optional[List[dict]]
    security_issues: Optional[List[dict]]
    quality_score: Optional[int]
    quality_feedback: Optional[str]
    suggestions: Optional[List[dict]]
    final_report: Optional[str]
    status: str
    error: Optional[str]

# --- NVIDIA NIM LLM ---
llm = ChatNVIDIA(
    model="meta/llama-3.1-8b-instruct",
    api_key=NVIDIA_API_KEY,
    temperature=0.3
)

# --- Build Graph ---
def build_review_graph():
    from app.nodes import (
        parser_node, bug_detector_node, security_scanner_node,
        quality_checker_node, suggestion_generator_node, report_writer_node
    )

    graph = StateGraph(ReviewState)

    # Add all nodes
    graph.add_node("parser", parser_node)
    graph.add_node("bug_detector", bug_detector_node)
    graph.add_node("security_scanner", security_scanner_node)
    graph.add_node("quality_checker", quality_checker_node)
    graph.add_node("suggestion_generator", suggestion_generator_node)
    graph.add_node("report_writer", report_writer_node)

    # Connect nodes in sequence
    graph.set_entry_point("parser")
    graph.add_edge("parser", "bug_detector")
    graph.add_edge("bug_detector", "security_scanner")
    graph.add_edge("security_scanner", "quality_checker")
    graph.add_edge("quality_checker", "suggestion_generator")
    graph.add_edge("suggestion_generator", "report_writer")
    graph.add_edge("report_writer", END)

    return graph.compile()

# Compiled graph instance
review_graph = build_review_graph()