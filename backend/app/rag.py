import os
import json
import uuid
from pathlib import Path
from typing import List, Dict, Any, TypedDict, Optional
import re
import hashlib
import numpy as np
from datetime import datetime
from dotenv import load_dotenv

# LangChain and related imports
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langsmith import traceable
from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser

# Load environment variables
load_dotenv()

# Set up LangSmith environment variables if available
if os.getenv("LANGCHAIN_API_KEY"):
    os.environ["LANGSMITH_TRACING"] = "true"

# Define message type
class Message(TypedDict):
    role: str  # "user" or "assistant" 
    content: str

class RAGResponse(TypedDict):
    answer: str
    confidence: float
    source: str
    needs_rerouting: bool

class Source(TypedDict):
    page_number: str
    section: str
    content: str

class EnhancedRAGResponse(TypedDict):
    answer: str
    confidence: float
    sources: List[Source]
    needs_rerouting: bool

# Initialize OpenAI models
def get_llm(model_name="gpt-4o", temperature=0.1):
    """Get LLM based on specified model"""
    return ChatOpenAI(
        model=model_name,
        temperature=temperature,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )

def get_fast_llm():
    """Get a faster, cheaper LLM for less intensive tasks"""
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.1,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )

def get_embeddings():
    """Get embeddings model"""
    return OpenAIEmbeddings(
        model="text-embedding-3-large",
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )

# Global instances
llm = get_llm()
fast_llm = get_fast_llm()
embeddings = get_embeddings()

# Document preparation
@traceable(name="document_preparation")
def prepare_documents(documents: List[Document]) -> List[Document]:
    """Split documents into chunks with tracing and add metadata"""
    if not documents:
        raise ValueError("No input documents provided to prepare_documents")
        
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=200
    )
    
    processed_docs = []
    last_seen_page_number = None
    
    for doc_idx, doc in enumerate(documents):
        if not doc.page_content.strip():
            print(f"Warning: Empty document at index {doc_idx}")
            continue
            
        splits = text_splitter.split_documents([doc])
        
        if not splits:
            print(f"Warning: No splits generated for document at index {doc_idx}")
            continue
            
        for chunk_idx, split_doc in enumerate(splits):
            # Try to extract page number from content if available
            page_match = re.search(r'2500-(\d+)\n---', split_doc.page_content)
            if page_match:
                page_number = int(page_match.group(1))
                last_seen_page_number = page_number
            else:
                if last_seen_page_number is not None:
                    page_number = last_seen_page_number + 1
                    last_seen_page_number = page_number
                else:
                    page_number = 1
                    last_seen_page_number = 1
            
            split_doc.metadata.update({
                'document_id': f'doc_{doc_idx}',
                'page_number': page_number
            })
            processed_docs.append(split_doc)
    
    if not processed_docs:
        raise ValueError("No documents were successfully processed")
        
    return processed_docs

# Vector Store Operations
@traceable(name="vector_store_creation")
def create_vector_store(document_splits: List[Document]) -> FAISS:
    """Create a vector store from document splits with tracing"""
    try:
        if not document_splits:
            raise ValueError("No documents provided for vector store creation")
            
        vectorstore = FAISS.from_documents(
            documents=document_splits, 
            embedding=embeddings
        )
        return vectorstore
    except Exception as e:
        print(f"Error creating vector store: {str(e)}")
        raise

def save_vectorstore(vectorstore: FAISS, path: str = "faiss_index"):
    """Save the FAISS index to disk"""
    vectorstore.save_local(path)

def load_vectorstore(path: str = "faiss_index") -> Optional[FAISS]:
    """Load the FAISS index from disk"""
    if os.path.exists(path):
        return FAISS.load_local(path, embeddings, allow_dangerous_deserialization=True)
    return None

@traceable(name="initialize_vectorstore")
def initialize_vectorstore() -> FAISS:
    """Initialize or load the vector store"""
    try:
        # Try loading existing vectorstore
        vectorstore = FAISS.load_local(
            "backend/faiss_index", 
            embeddings,
            allow_dangerous_deserialization=True
        )
        if vectorstore:
            return vectorstore
            
        # Initialize if not found - ensure the docs directory exists
        project_root = Path(__file__).parent.parent.parent
        docs_path = project_root / "docs" / "hotel_guidelines.md"
        
        # If the docs directory doesn't exist, create it
        docs_dir = project_root / "docs"
        if not docs_dir.exists():
            docs_dir.mkdir(parents=True)
        
        # If the file doesn't exist, create a sample file
        if not docs_path.exists():
            with open(docs_path, "w", encoding="utf-8") as f:
                f.write("# Hotel Construction Guidelines\n\n"
                        "## Section 2500: General Requirements\n\n"
                        "### 2500-1\n---\n"
                        "All hotel construction must adhere to brand standards and local building codes.\n\n"
                        "### 2500-2\n---\n"
                        "Fire safety systems must be installed according to international standards.\n\n"
                        "### 2500-3\n---\n"
                        "Energy efficiency requirements must meet or exceed LEED Silver certification.\n\n")
        
        loader = TextLoader(str(docs_path), encoding="utf-8")
        documents = loader.load()
        document_splits = prepare_documents(documents)
        vectorstore = create_vector_store(document_splits)
        
        # Save the vectorstore
        save_vectorstore(vectorstore, "backend/faiss_index")
        
        return vectorstore
    except Exception as e:
        print(f"Error initializing vector store: {str(e)}")
        raise

# Query Translation
@traceable(name="basic_query_translation")
def basic_translate_query(query: str, conversation_history: List[Message] = None) -> str:
    """Basic query translation with conversation history"""
    translation_prompt = ChatPromptTemplate.from_template(
        """     
You are a specialized query refiner in a Retrieval-Augmented Generation (RAG) system. Your task is to transform a user's original question into a clear, concise, and focused query optimized for similarity search against a document corpus.

Instructions:

1. Review Context: Analyze the provided conversation history.
 Identify key topics, subject matter, and any previous questions.
2. Analyze Query: Evaluate the user's question.
3. Determine Relevance:
    - If the query uses referential language (e.g., "What about...", "And what about...", pronouns such as "these" or "that") or directly builds upon a topic from a previous question (for example, asking "What about garages?" following a query "What is the required certification around Fire-rated Doors and Frames?"), then treat the query as directly related to the conversation history.
    - If the query is standalone and does not rely on prior context, focus exclusively on refining the user's question.
4. Refinement: Rewrite the query to be unambiguous, specific, and optimized for similarity search, incorporating relevant context only if the query is determined to be directly related to the conversation history.
5. Output: Return only the refined query with no additional commentary or formatting.

conversation history:

{conversation_history}

user question:

{query}

Your refined query:
        """
    )
    
    # Format conversation history
    formatted_history = "\n".join([
        f"{msg['role']}: {msg['content']}" 
        for msg in (conversation_history or [])
    ])
    
    translation_chain = translation_prompt | fast_llm | StrOutputParser()
    return translation_chain.invoke({
        "query": query,
        "conversation_history": formatted_history
    })

# Document Retrieval based on technique
@traceable(name="document_retrieval")
def retrieve_documents(vectorstore: FAISS, query: str, conversation_history: List[Message] = None) -> List[Dict]:
    """Retrieve documents using basic retrieval"""
    retriever = vectorstore.as_retriever(search_kwargs={"k": 15})
    docs = retriever.invoke(query)
    
    return [
        {
            "page_content": doc.page_content,
            "metadata": dict(doc.metadata)
        }
        for doc in docs
    ]

# Create RAG Chain
@traceable(name="create_rag_chain_with_reflection")
def create_rag_chain(vectorstore: FAISS, conversation_history: List[Message] = None):
    """Create the RAG chain with self-reflection and confidence assessment"""
    
    # Update prompt to include self-reflection and source formatting
    rag_prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert in building regulations at the Hilton hotel. Your job is to answer questions using only the documents provided. Follow these instructions carefully:

1. Use Provided Information Only:
   - Base your answer solely on the details in the documents.
   - If you cannot find sufficient information, explicitly state this.

2. Self-Reflection:
   - Assess your confidence in the answer (0-1 scale)
   - If confidence < 0.7, indicate the answer needs rerouting
   - Explain why you are/aren't confident

3. Citation and Structure:
   - For every statement, cite the specific section and page number
   - Format sources as: [Page X, Section Y.Y.Y]
   - Collect all sources used in a separate list

4. Output Format:
   Return your response as a JSON object with:
   - answer: your detailed response with inline citations
   - confidence: number between 0 and 1 (not a string)
   - sources: array of used sources, each containing:
     - page_number: page number
     - section: section number/id
     - content: relevant excerpt from source
   - needs_rerouting: boolean indicating if query needs rerouting

5. Uncertainty Handling:
   - If information is incomplete, state what's missing
   - If question is outside scope of provided documents, set needs_rerouting to true
"""),
        ("human", """Here is the relevant information:

Documents:
{context}

Previous Conversation:
{conversation_history}

Question: {question}

Provide your response in the specified JSON format.""")
    ])

    # Format conversation history
    formatted_history = "\n".join([
        f"{msg['role']}: {msg['content']}" 
        for msg in (conversation_history or [])
    ])
    
    def format_docs(docs):
        formatted_docs = []
        for doc in docs:
            page_number = doc["metadata"].get("page_number", "Unknown")
            formatted_doc = f"[Page {page_number}]\n{doc['page_content']}"
            formatted_docs.append(formatted_doc)
        return "\n\n---\n\n".join(formatted_docs)

    # Create the chain with JSON output parsing
    chain = (
        RunnablePassthrough.assign(
            context=lambda x: format_docs(x["retrieved_docs"]),
            conversation_history=lambda _: formatted_history,
        )
        | rag_prompt 
        | llm
        | JsonOutputParser(pydantic_object=EnhancedRAGResponse)
    )
    
    return chain

@traceable(name="create_full_doc_chain")
def create_full_doc_chain(conversation_history: List[Message] = None):
    """Create a chain for processing queries against the full document"""
    
    full_doc_prompt = ChatPromptTemplate.from_messages([
       ("system", """You are an expert in building regulations at the Hilton hotel. Your job is to answer questions using only the documents provided. Follow the instructions below:

1. Use Provided Information Only:
   - Base your answer solely on the details in the documents.
   - Do not introduce any external information.

2. Cite Specific Sections:
   - For every regulation or requirement mentioned, include the corresponding section number (e.g., Section 2516.03).
   - Ensure each cited section directly supports your response.

3. Reference Documents by Page Number:
   Each document begins with metadata that includes a 'page_number' field formatted as [Page_Number] (e.g., [230]). 
   - When referring to any document, use the page number from the metadata.

4. Organize Your Answer Clearly:
   - Present your answer in a structured format (e.g., bullet points, numbered lists, headlines, or clear paragraphs).
   - Prioritize clarity and conciseness.

5. Acknowledge Limitations:
   - If the provided documents do not contain enough information to answer the question fully, explicitly state this limitation in your response.
- Your output must be in a structured format.
"""),
        ("human", """Here is the relevant information to help answer the question:

Documents:
{full_doc}

Previous Conversation:
{conversation_history}

Question:
{question}

Please provide your answer based on the documents. also follow the guidelines above.""") 
    ])

    try:
        # Get path to hotel guidelines document
        project_root = Path(__file__).parent.parent.parent
        docs_path = project_root / "docs" / "hotel_guidelines.md"
        
        if not docs_path.exists():
            return lambda x: "Documentation not found. Please contact the administrator."
            
        # Load full document
        with open(docs_path, "r", encoding="utf-8") as f:
            full_doc = f.read()

        # Create a simpler chain structure to avoid serialization issues
        def run_chain(inputs):
            formatted_history = "\n".join([
                f"{msg['role']}: {msg['content']}" 
                for msg in (conversation_history or [])
            ])
            
            prompt_args = {
                "conversation_history": formatted_history,
                "question": inputs["question"],
                "full_doc": full_doc
            }
            
            messages = full_doc_prompt.format_messages(**prompt_args)
            response = fast_llm.invoke(messages)
            return response.content
            
        return RunnableLambda(run_chain)

    except Exception as e:
        print(f"Error creating full document chain: {str(e)}")
        raise

# Main RAG Pipeline
@traceable(name="rag_pipeline_with_routing")
def process_query(user_query: str, user_region: str, conversation_history: List[Message] = None):
    """Complete RAG pipeline with self-routing"""
    try:
        # Initialize vectorstore
        vectorstore = initialize_vectorstore()

        # Initial RAG attempt
        refined_query = basic_translate_query(user_query, conversation_history)
        retrieved_docs = retrieve_documents(vectorstore, refined_query, conversation_history)
        
        rag_chain = create_rag_chain(vectorstore, conversation_history)
        initial_response = rag_chain.invoke({
            "question": user_query,
            "retrieved_docs": retrieved_docs
        })

        # Convert confidence to float and handle routing
        confidence = float(initial_response.get("confidence", 0))
        needs_rerouting = initial_response.get("needs_rerouting", False)

        if needs_rerouting or confidence < 0.7:
            try:
                print(f"Rerouting due to: needs_rerouting={needs_rerouting}, confidence={confidence}")
                full_doc_chain = create_full_doc_chain(conversation_history)
                final_response = full_doc_chain.invoke({
                    "question": user_query
                })
                response_type = "full_doc"
                sources = []  # Full doc chain doesn't provide sources
            except Exception as e:
                print(f"Full doc chain failed: {str(e)}")
                final_response = initial_response["answer"]
                response_type = "rag_fallback"
                sources = initial_response.get("sources", [])
        else:
            print(f"Using RAG response with confidence={confidence}")
            final_response = initial_response["answer"]
            response_type = "rag"
            sources = initial_response.get("sources", [])

        return {
            "original_query": user_query,
            "refined_query": refined_query,
            "response": final_response,
            "retrieved_documents": retrieved_docs,
            "conversation_history": conversation_history,
            "confidence": confidence,
            "response_type": response_type,
            "sources": sources,
            "region": user_region
        }

    except Exception as e:
        print(f"Pipeline error: {str(e)}")
        raise Exception(f"Failed to process query: {str(e)}") 