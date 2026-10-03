FROM python:3.11-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set up non-root user with UID 1000 (required for Hugging Face Spaces security sandbox)
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    HF_HOME=/home/user/.cache/huggingface \
    PYTHONUNBUFFERED=1

WORKDIR $HOME/app

# Install python dependencies from backend/requirements.txt
COPY --chown=user:user backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir --user -r requirements.txt

# Pre-download local embedding model so runtime startup is instant
RUN python3 -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy backend source code
COPY --chown=user:user backend/app/ ./app/
COPY --chown=user:user backend/scripts/ ./scripts/

# Create data directory for Chroma vectors
RUN mkdir -p $HOME/app/data/chroma && chown -R user:user $HOME/app/data

USER user

# Hugging Face Spaces listens on port 7860
EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
