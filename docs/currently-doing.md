# askai module
- In-memory `chat_histories` dict, keep full list (no deletion)
- Slice `[-MAX_TURNS:]` only when building the prompt
- No condensing step (saves the extra LLM call)
- Export feature added later on top of this, since the full history is already preserved