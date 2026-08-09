from flask import Flask, render_template, request, jsonify, Response
import os
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import List
from langchain_community.vectorstores import FAISS
import pandas as pd

from config import llm_local as llm
from config import hf_embeddings
from utils import anonymize_text

app = Flask(__name__)

DOC_PICKLE = "Company_Brochure.pkl"

class RagResponse(BaseModel):
    summary: str = Field(description="A summary of the answer based on the context.")

def load_document_store():
    if not os.path.exists(DOC_PICKLE):
        return None
    df = pd.read_pickle(DOC_PICKLE)
    texts = df['content'].tolist()
    embeddings = df['embedding'].tolist()
    text_embedding_pairs = list(zip(texts, embeddings))
    return FAISS.from_embeddings(text_embedding_pairs, hf_embeddings)

index = load_document_store()

def response_generator(prompt):
    if index is None:
        yield "I'm sorry, but no documents have been uploaded yet. An administrator needs to upload a PDF file first."
        return

    structured_llm = llm.with_structured_output(RagResponse)
    results = index.similarity_search(prompt, k=3)
    retrieved_content = [doc.page_content for doc in results]
    
    messages = [
        SystemMessage(content="You are a RAG Chatbot. Use the context to answer the question and provide a summary."),
        HumanMessage(content=f"Context:\n{retrieved_content}\n\nQuestion: {prompt}")
    ]
    for chunk in structured_llm.stream(messages):
        if chunk.summary:
            yield chunk.summary

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get("message")
    anonymized_prompt = anonymize_text(user_input)
    return Response(response_generator(anonymized_prompt), mimetype='text/plain')

if __name__ == "__main__":
    app.run(debug=True, port=5000)