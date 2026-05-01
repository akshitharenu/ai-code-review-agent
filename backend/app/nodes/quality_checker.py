from app.graph import ReviewState, llm
from langchain_core.messages import HumanMessage
import json

def quality_checker_node(state: ReviewState) -> ReviewState:
    print("⭐ Node 4: Checking quality...")
    
    prompt = f"""
    You are a senior software engineer. Score this code quality from 0-100.
    
    Code:
    {state["code"]}
    
    Consider: readability, naming conventions, structure, 
    documentation, error handling, and best practices.
    
    Respond in this JSON format:
    {{
        "score": <0-100>,
        "feedback": {{
            "readability": <score 0-10>,
            "naming": <score 0-10>,
            "structure": <score 0-10>,
            "documentation": <score 0-10>,
            "error_handling": <score 0-10>,
            "summary": <overall feedback text>
        }}
    }}
    Return ONLY the JSON, no other text.
    """
    
    response = llm.invoke([HumanMessage(content=prompt)])
    
    try:
        clean = response.content.strip().replace("```json", "").replace("```", "")
        data = json.loads(clean)
        score = data.get("score", 0)
        feedback = json.dumps(data.get("feedback", {}))
    except:
        score = 0
        feedback = "Could not analyze quality"
    
    return {
        **state,
        "quality_score": score,
        "quality_feedback": feedback,
        "status": "quality_checked"
    }