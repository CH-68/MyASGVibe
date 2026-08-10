from langchain_openai import ChatOpenAI
from langchain_community.embeddings import HuggingFaceEmbeddings

# Configure your language model to use a local LLM studio endpoint
llm_local = ChatOpenAI(
    api_key="NIL",
    openai_api_base="http://localhost:1234/v1/",
)
# Configure your embedding model (e.g., a model from Hugging Face)
model_name = "sentence-transformers/all-MiniLM-L6-v2"
model_kwargs = {'device': 'cpu'}
hf_embeddings = HuggingFaceEmbeddings(
    model_name=model_name,
    model_kwargs=model_kwargs
)
