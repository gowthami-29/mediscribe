from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from langchain_text_splitters import RecursiveCharacterTextSplitter  # type: ignore

class RagService:
    @staticmethod
    def _get_embedding(text_content: str) -> List[float]:
        """Generate embedding using OpenAI API."""
        import openai
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY not configured")

        # 1. Initialize Client
        if settings.ENDPOINT and ("azure.com" in settings.ENDPOINT or "cognitiveservices" in settings.ENDPOINT):
            client = openai.AzureOpenAI(
                api_key=settings.OPENAI_API_KEY,
                api_version="2024-02-01", # Common Azure API version for embeddings
                azure_endpoint=settings.ENDPOINT.split("/openai/")[0]
            )
            # In Azure, the "model" param is the deployment name
            # We'll try 'text-embedding-3-small' as a default deployment name
            model = "text-embedding-3-small" 
        else:
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            model = "text-embedding-3-small"

        try:
            response = client.embeddings.create(
                input=text_content,
                model=model
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Embedding error: {e}")
            # If the deployment name is wrong in Azure, we might need the user to configure it
            raise

    @staticmethod
    def index_document(db: Session, patient_id: str, source_id: str, source_type: str, content: str):
        """Chunk text and store embeddings in the database."""
        if not content or not content.strip():
            return

        # 1. Chunking
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100,
            length_function=len,
        )
        chunks = text_splitter.split_text(content)

        # 2. Generate and Store Embeddings
        for chunk in chunks:
            embedding = RagService._get_embedding(chunk)
            
            # Using raw SQL for pgvector support if SQLAlchemy doesn't have it loaded
            sql = text("""
                INSERT INTO document_embeddings 
                (patient_id, source_record_id, source_type, content, embedding)
                VALUES (:patient_id, :source_id, :source_type, :content, :embedding)
            """)
            
            db.execute(sql, {
                "patient_id": patient_id,
                "source_id": source_id,
                "source_type": source_type,
                "content": chunk,
                "embedding": str(embedding)
            })
        
        db.commit()

    @staticmethod
    def query_patient_history(db: Session, patient_id: str, query_text: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Find most relevant historical chunks for a patient."""
        if not query_text or not patient_id:
            return []

        # 1. Generate embedding for query
        query_embedding = RagService._get_embedding(query_text)

        # 2. Similarity Search (Cosine Similarity)
        # operator <=> is cosine distance
        sql = text("""
            SELECT content, source_type, created_at, 1 - (embedding <=> :embedding) as similarity
            FROM document_embeddings
            WHERE patient_id = :patient_id
            ORDER BY embedding <=> :embedding
            LIMIT :limit
        """)

        results = db.execute(sql, {
            "patient_id": patient_id,
            "embedding": str(query_embedding),
            "limit": limit
        }).fetchall()

        return [
            {
                "content": r.content,
                "source_type": r.source_type,
                "created_at": r.created_at.isoformat(),
                "similarity": float(r.similarity)
            }
            for r in results
        ]

    @staticmethod
    def get_augmented_context(db: Session, patient_id: str, query_text: str) -> str:
        """Format retrieved history for prompt injection."""
        print(f"DEBUG: RAG searching for patient {patient_id} with query: {query_text[:50]}...")
        relevant_chunks = RagService.query_patient_history(db, patient_id, query_text)
        
        if not relevant_chunks:
            print("DEBUG: RAG found NO relevant historical context.")
            return "No historical medical records found for this patient."

        print(f"DEBUG: RAG found {len(relevant_chunks)} relevant history snippets.")
        context_parts = ["The following are relevant excerpts from the patient's historical records:"]
        for i, chunk in enumerate(relevant_chunks):
            source_info = f"[Source: {chunk['source_type'].upper()}, Date: {chunk['created_at']}]"
            context_parts.append(f"--- Record {i+1} {source_info} ---\n{chunk['content']}")
            
        return "\n\n".join(context_parts)

    @staticmethod
    def query_all_patients(db: Session, query_text: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Find most relevant historical chunks across ALL patients."""
        if not query_text:
            return []

        # 1. Generate embedding for query
        query_embedding = RagService._get_embedding(query_text)

        # 2. Similarity Search across entire database
        sql = text("""
            SELECT patient_id, content, source_type, created_at, 1 - (embedding <=> :embedding) as similarity
            FROM document_embeddings
            ORDER BY embedding <=> :embedding
            LIMIT :limit
        """)

        results = db.execute(sql, {
            "embedding": str(query_embedding),
            "limit": limit
        }).fetchall()

        return [
            {
                "patient_id": str(r.patient_id),
                "content": r.content,
                "source_type": r.source_type,
                "created_at": r.created_at.isoformat(),
                "similarity": float(r.similarity)
            }
            for r in results
        ]

    @staticmethod
    def get_population_context(db: Session, query_text: str) -> str:
        """Format retrieved population history for prompt injection."""
        relevant_chunks = RagService.query_all_patients(db, query_text)
        
        if not relevant_chunks:
            return "No historical medical records found matching this disease/condition in the database."

        context_parts = ["The following are relevant excerpts from various patients in our database matching this condition:"]
        for i, chunk in enumerate(relevant_chunks):
            source_info = f"[Patient UUID: {chunk['patient_id']}, Source: {chunk['source_type'].upper()}]"
            context_parts.append(f"--- Record {i+1} {source_info} ---\n{chunk['content']}")
            
        return "\n\n".join(context_parts)
