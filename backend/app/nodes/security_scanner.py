from app.graph import ReviewState, llm
from langchain_core.messages import HumanMessage
import json

def security_scanner_node(state: ReviewState) -> ReviewState:
    print("🔒 Node 3: Scanning security...")
    
    prompt = f"""
    You are a security expert. Find ALL security vulnerabilities in this code.
    Check for: SQL injection, XSS, hardcoded secrets, insecure dependencies,
    authentication issues, data exposure, and any other vulnerabilities.
    
    Code:
    {state["code"]}
    
    Respond in this JSON format:
    {{
        "security_issues": [
            {{
                "severity": "critical|high|medium|low",
                "type": <vulnerability type>,
                "description": <what the issue is>,
                "line": <line number or null>,
                "fix": <how to fix it>
            }}
        ]
    }}
    
    If no issues found, return {{"security_issues": []}}
    Return ONLY the JSON, no other text.
    """
    
    response = llm.invoke([HumanMessage(content=prompt)])
    
    try:
        clean = response.content.strip().replace("```json", "").replace("```", "")
        issues = json.loads(clean).get("security_issues", [])
    except:
        issues = []
    
    return {
        **state,
        "security_issues": issues,
        "status": "security_scanned"
    }