import streamlit as st
import os
import pandas as pd
from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import hf_embeddings, llm_local
from utils import anonymize_text, check_password
import numpy as np
import requests
from bs4 import BeautifulSoup
from typing import List

# --- Web Crawling Configuration ---
WEBSITE_URLS = [
    "https://www.linkedin.com/company/engagepro/about/",
    "https://engagepro.com/about-us/",
    "https://engagepro.com/how-it-works/"
]

def load_urls(urls: List[str]) -> List[Document]:
    """Loads content from a list of URLs and returns a list of Documents."""
    docs = []
    for url in urls:
        try:
            response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            # A simple approach to get text; can be refined to target specific tags
            text_content = soup.get_text(separator='\n', strip=True)
            docs.append(Document(page_content=text_content, metadata={"source": url}))
        except requests.RequestException as e:
            st.warning(f"Could not fetch content from {url}: {e}")
    return docs

#Guardrails
def embed_and_save_knowledge_base(pdf_path, urls, pickle_path):
    """
    Loads a PDF, splits it into chunks, generates embeddings,
    and saves the result to a pickle file.
    """
    try:
        # Load the PDF
        loader = PyPDFLoader(pdf_path)
        pdf_docs = loader.load()

        # Load content from URLs
        web_docs = load_urls(urls)
        
        # Split the document into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        all_docs = pdf_docs + web_docs
        docs = text_splitter.split_documents(all_docs)
        
        # Prepare data for DataFrame
        documents_data = []
        for doc in docs:
            # Anonymize content before embedding
            original_content = doc.page_content
            anonymized_content = anonymize_text(original_content)
            embedding = hf_embeddings.embed_query(anonymized_content)
            documents_data.append({
                "content": anonymized_content,
                "embedding": embedding,
                "source": doc.metadata
            })
        
        # Create DataFrame and save to pickle
        df = pd.DataFrame(documents_data)
        if df.empty:
            st.warning("No content was processed. The knowledge base is empty.")
            return
        df.to_pickle(pickle_path)
        
        st.success(f"Successfully processed and saved '{os.path.basename(pdf_path)}' to '{pickle_path}'")
    except Exception as e:
        st.error(f"An error occurred: {e}")

#Upload Knowledge Base
def admin_page():
    """
    Streamlit page for admin tasks like uploading and processing PDFs.
    """
    st.title("Admin Console")

    if "password_correct" not in st.session_state:
        st.session_state.password_correct = False

    if not st.session_state.password_correct:
        password = st.text_input("Enter password to access admin functions:", type="password")
        if st.button("Login"):
            if check_password(password):
                st.session_state.password_correct = True
                st.rerun()
            else:
                st.error("The password you entered is incorrect.")
    else:
        st.write("Upload a new company brochure to update the knowledge base.")

        uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")

        if uploaded_file is not None:
            # Define the paths
            upload_dir = "uploads"
            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)
                
            pdf_path = os.path.join(upload_dir, "Company_Brochure.pdf")
            pickle_path = "Company_Brochure.pkl"

            # Save the uploaded file
            with open(pdf_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
            
            st.info(f"File '{uploaded_file.name}' uploaded successfully.")

            if st.button("Process and Embed Document"):
                with st.spinner("Processing PDF and generating embeddings... This may take a moment."):
                    embed_and_save_knowledge_base(pdf_path, WEBSITE_URLS, pickle_path)

        if st.button("Logout"):
            st.session_state.password_correct = False
            st.rerun()


if __name__ == "__main__":
    admin_page()