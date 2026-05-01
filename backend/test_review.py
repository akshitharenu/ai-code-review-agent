import requests

# Sample code with intentional bugs and security issues for testing
test_code = """
def add(a, b):
    return a + b

def divide(x, y):
    return x / y  # Bug: No check for division by zero

password = 'admin123'  # Security: Hardcoded password

db_query = 'SELECT * FROM users WHERE name = ' + user_input  # Security: SQL Injection

try:
    result = divide(10, 0)
except:
    pass  # Bug: Bare except, silently swallowing errors
"""

response = requests.post(
    "http://127.0.0.1:8000/review/submit",
    json={
        "code": test_code,
        "filename": "example.py",
        "language": "python"
    }
)

print(f"Status: {response.status_code}")
print(f"Response:\n{response.json()}")
