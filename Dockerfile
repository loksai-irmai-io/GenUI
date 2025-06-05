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

# Create a FastAPI app that properly serves all static files
USER root
RUN echo 'from fastapi import FastAPI\n\
from fastapi.staticfiles import StaticFiles\n\
from fastapi.responses import RedirectResponse, FileResponse\n\
import os\n\
import glob\n\
\n\
app = FastAPI()\n\
\n\
@app.get("/")\n\
def read_root():\n\
    return RedirectResponse(url="/public/")\n\
\n\
# Mount the public directory for HTML files\n\
app.mount("/public", StaticFiles(directory="public", html=True), name="public")\n\
\n\
# Mount assets directory\n\
app.mount("/assets", StaticFiles(directory="public/assets"), name="assets")\n\
\n\
# Add explicit handlers for JSON files\n\
@app.get("/{json_file_name}.json")\n\
async def serve_json(json_file_name: str):\n\
    file_path = f"public/{json_file_name}.json"\n\
    if os.path.exists(file_path):\n\
        return FileResponse(file_path, media_type="application/json")\n\
    return {"error": "File not found"}, 404\n\
\n\
# Serve files from lovable-uploads\n\
@app.get("/lovable-uploads/{file_path:path}")\n\
async def serve_uploads(file_path: str):\n\
    file_path = f"public/lovable-uploads/{file_path}"\n\
    if os.path.exists(file_path):\n\
        return FileResponse(file_path)\n\
    return {"error": "File not found"}, 404\n\
\n\
# Print available routes for debugging\n\
@app.on_event("startup")\n\
async def print_routes():\n\
    print("Available files in public directory:")\n\
    for root, dirs, files in os.walk("public"):\n\
        for file in files:\n\
            print(f"  - {os.path.join(root, file)}")\n\
    # Print all JSON files\n\
    json_files = glob.glob("public/*.json")\n\
    print("\\nJSON files available:")\n\
    for json_file in json_files:\n\
        print(f"  - {json_file}")\n\
' > /app/main.py

# Set up proper permissions
RUN mkdir -p /app && chown -R app:app /app

# Create an improved startup script with better error handling
RUN echo '#!/bin/bash\n\
echo "Starting GenUI application..."\n\
\n\
# Function to list files in directory\n\
list_files() {\n\
    echo "Contents of $1:"\n\
    ls -la "$1"\n\
}\n\
\n\
# Show what we have\n\
list_files /app\n\
list_files /app/public\n\
\n\
if [ -f "app/main.py" ]; then\n\
    echo "Found app/main.py - Starting with uvicorn..."\n\
    exec uvicorn app.main:app --host 0.0.0.0 --port 8080\n\
elif [ -f "main.py" ]; then\n\
    echo "Found main.py - Starting with uvicorn..."\n\
    exec uvicorn main:app --host 0.0.0.0 --port 8080\n\
else\n\
    echo "No API found - Serving static files from /app/public directory"\n\
    cd /app/public && exec python -m http.server 8080\n\
fi' > /app/start.sh && chmod +x /app/start.sh && chown app:app /app/start.sh

USER app
EXPOSE 8080
CMD ["/app/start.sh"]