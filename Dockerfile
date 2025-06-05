# Use a Node.js base image for the frontend build
FROM node:20 AS frontend-build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm run build

# Use a Python base image for the backend API
FROM python:3.9-slim AS backend
WORKDIR /app
COPY requirements.txt ./
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt
COPY ./app ./app
COPY ./data ./data

# Final stage: serve both frontend and backend
FROM python:3.9-slim
WORKDIR /app
# Copy backend from previous stage
COPY --from=backend /app /app
# Copy frontend build from previous stage
COPY --from=frontend-build /app/dist /app/public
EXPOSE 8080
# Start backend API (assumes FastAPI/Uvicorn)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]