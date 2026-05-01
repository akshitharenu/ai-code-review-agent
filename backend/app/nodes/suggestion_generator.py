from app.graph import ReviewState, llm
from langchain_core.messages import HumanMessage
import json

def suggestion_generator_node(state: ReviewState) -> ReviewState:
    print("💡 Node 5: Generating suggestions...")
    
    bugs_text = json.dumps(state.get("bugs", []))
    security_text = json.dumps(state.get("security_issues", []))
    
    prompt = f"""
    You are a senior developer. Based on the bugs and security issues found,
    provide specific actionable code suggestions with fixed code examples.
    
    Original Code:
    {state["code"]}
    
    Bugs Found:
    {bugs_text}
    
    Security Issues:
    {security_text}
    
    Respond in this JSON format:
    {{
        "suggestions": [
            {{
                "priority": "high|medium|low",
                "title": <short title>,
                "description": <what to change>,
                "original_code": <problematic code snippet>,
                "fixed_code": <corrected code snippet>
            }}
        ]
    }}
    Return ONLY the JSON, no other text.
    """
    
    response = llm.invoke([HumanMessage(content=prompt)])
    
    try:
        clean = response.content.strip().replace("```json", "").replace("```", "")
        suggestions = json.loads(clean).get("suggestions", [])
    except:
        suggestions = []
    
    return {
        **state,
        "suggestions": suggestions,
        "status": "suggestions_generated"
    }