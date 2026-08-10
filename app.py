from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import os
import json
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.vectorstores import FAISS
from langchain_core.messages import AIMessage, HumanMessage, trim_messages
from langchain_openai import ChatOpenAI
from config import hf_embeddings
from utils import anonymize_text

app = FastAPI()

FAISS_INDEX_PATH = "faiss_index"

# Point the LLM to LM Studio's local server
llm = ChatOpenAI(
    openai_api_base="http://localhost:1234/v1",
    api_key="not-needed",
    temperature=0.,
    model="local-model" # This can be generic as LM Studio uses the loaded model
)

# Define the Prompt Template
# This separates the instructions (system) from the data (human)
prompt_template = ChatPromptTemplate.from_messages([
    ("system", """You are InnovaBot, a professional AI assistant for EngagePro. Your role is to answer user questions based *only* on the provided context data.
    
    INSTRUCTIONS & CONSTRAINTS:
    1. Tone: Professional, concise, engaging and helpful.
    2. Grounding: Answer ONLY using the information provided in the Context Data.
    3. Hallucination Prevention: If the answer is not in the context, exactly say: "I apologize, but I do not have that information in my current knowledge base." Do not guess.
    4. Formatting: Always structure your final answer using markdown bullet points. Do not write a long introductory paragraph."""),
    MessagesPlaceholder(variable_name="history"),
    ("human", "Context Data:\n{context}\n\nUser Question: {question}")
])

def load_document_store():
    """Loads the FAISS index from the local path."""
    if not os.path.exists(FAISS_INDEX_PATH):
        return None
    try:
        return FAISS.load_local(FAISS_INDEX_PATH, hf_embeddings, allow_dangerous_deserialization=True)
    except Exception as e:
        print(f"Error loading FAISS index: {e}")
        return None

index = load_document_store()

class ChatMessage(BaseModel):
    """Message model for chat history."""
    role: str
    content: str

class ChatRequest(BaseModel):
    """Request model for the chat endpoint."""
    prompt: str
    history: List[ChatMessage] = []

async def response_generator(request: ChatRequest):
    """Generates a streaming response from the RAG pipeline."""
    if index is None:
        yield "I'm sorry, but no documents have been uploaded yet. An administrator needs to upload a PDF file first."
        return

    # 1. Convert JSON history from the request into LangChain message objects
    formatted_history = []
    for msg in request.history:
        if msg.role == "user":
            formatted_history.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            formatted_history.append(AIMessage(content=msg.content))

    # 2. Trim the history to fit within a token budget
    trimmed_history = trim_messages(
        formatted_history,
        max_tokens=2000,          # Token budget for history
        strategy="last",          # Keep the most recent messages
        token_counter=llm,        # Use the LLM to count tokens
        start_on="human",         # Ensure history doesn't start with an AI response
        include_system=False,     # The system prompt is separate
    )

    results = index.similarity_search(request.prompt, k=3)
    retrieved_content = "\n\n".join([doc.page_content for doc in results])
    
    # Extract unique sources from the retrieved documents
    sources = list(dict.fromkeys([doc.metadata.get("source", "Unknown Source") for doc in results]))
    
    # Chain the prompt template with the language model
    chain = prompt_template | llm
    
    # Stream the response from the local LLM
    async for chunk in chain.astream({
        "history": trimmed_history,
        "context": retrieved_content,
        "question": request.prompt
    }):
        if chunk.content:
            yield json.dumps({"type": "content", "data": chunk.content}) + "\n"

    # After content is streamed, send the sources
    yield json.dumps({"type": "sources", "data": sources}) + "\n"

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """FastAPI endpoint to handle chat requests and stream responses."""
    request.prompt = anonymize_text(request.prompt)
    return StreamingResponse(response_generator(request), media_type="application/x-ndjson")

if __name__ == "__main__":
    import uvicorn
    # Note: The frontend expects the backend on port 5000.
    # The user request mentioned port 8000 for FastAPI, but I am keeping 5000
    # to ensure compatibility with the existing frontend configuration.
    uvicorn.run(app, host="0.0.0.0", port=5000)
