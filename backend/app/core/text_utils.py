import json
import re

def normalize_subject_key(subject: str) -> str:
    return re.sub(r"[\s\-_]+", "", subject).lower()

def parse_json_response(text: str):
    text = re.sub(r"```json|```", "", text).strip()
    try:
        match = re.search(r"\[.*\]", text, re.DOTALL)
        if match:
            return json.loads(match.group())
        return json.loads(text)
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}\nRaw text: {text[:200]}")
        return []