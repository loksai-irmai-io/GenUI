# Use a Node.js base image for the frontend build
FROM node:20 AS frontend-build
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source files (excluding files in .dockerignore)
COPY . .

# Build the frontend
RUN npm run build

# Use a Python base image for the backend API with build tools
FROM python:3.9-slim AS backend
WORKDIR /app

# Install system dependencies needed for building Python packages
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    make \
    cmake \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt ./
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy all Python files and create necessary directories
COPY . .
RUN mkdir -p app data

# Final stage: runtime environment with minimal dependencies
FROM python:3.9-slim
WORKDIR /app

# Install only runtime dependencies (no build tools needed in final image)
RUN apt-get update && apt-get install -y \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# Copy installed Python packages from build stage
COPY --from=backend /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=backend /usr/local/bin /usr/local/bin

# Copy backend files from previous stage
COPY --from=backend /app /app

# Copy frontend build from previous stage
COPY --from=frontend-build /app/dist /app/public

# Switch back to root to set up startup script, then back to app user
USER root
RUN mkdir -p /app && chown -R app:app /app
USER app

EXPOSE 8080

# Start backend API (create a flexible startup script)
USER root
RUN echo '#!/bin/bash\n\
    if [ -f "app/main.py" ]; then\n\
    exec uvicorn app.main:app --host 0.0.0.0 --port 8080\n\
    elif [ -f "main.py" ]; then\n\
    exec uvicorn main:app --host 0.0.0.0 --port 8080\n\
    else\n\
    exec python -m http.server 8080\n\
    fi' > /app/start.sh && chmod +x /app/start.sh && chown app:app /app/start.sh

USER app
CMD ["/app/start.sh"]