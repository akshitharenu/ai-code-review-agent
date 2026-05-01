from app.graph import ReviewState,llm
from langchain_core.messages import HumanMessage

def parse_code_node(state: ReviewState) -> ReviewState:
    print("Node 1: Parsing Code")

    prompt = f"""
    Analyze this code and identify:
    1. Programming language
    2. What the code does
    3. Number of lines
    4. Functions/classes found
    
    Code:
    {state["code"]}
    
    Respond in this exact format:
    LANGUAGE: <language>
    DESCRIPTION: <what it does>
    LINES: <number>
    COMPONENTS: <functions/classes found>
    """

    response = llm.invoke([HumanMessage(content=prompt)])






    return {
        **state,
        "parsed_code": response.content,
        "status": "parsed"
    }


