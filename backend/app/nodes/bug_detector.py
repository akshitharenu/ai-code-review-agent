from app.graph import ReviewState, llm
from langchain_core.messages import HumanMessage
import json

def bug_detector_node(state: ReviewState) -> ReviewState:
    print("🐛 Node 2: Detecting bugs...")
    
    prompt = f"""
    You are an expert code reviewer. Find ALL bugs in this code.
    
    Code:
    {state["code"]}
    
    For each bug found, respond in this JSON format:
    {{
        "bugs": [
            {{
                "line": <line number or null>,
                "severity": "critical|warning|info",
                "type": <bug type>,
                "description": <what the bug is>,
                "fix": <how to fix it>
            }}
        ]
    }}
    
    If no bugs found, return {{"bugs": []}}
    Return ONLY the JSON, no other text.
    """
    
    response = llm.invoke([HumanMessage(content=prompt)])
    
    try:
        clean = response.content.strip().replace("```json", "").replace("```", "")
        bugs = json.loads(clean).get("bugs", [])
    except:
        bugs = []
    
    return {
        **state,
        "bugs": bugs,
        "status": "bugs_detected"
    }