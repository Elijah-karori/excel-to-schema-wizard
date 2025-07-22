# FastAPI Backend Deployment Guide

## Local Development

1. **Setup virtual environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the API:**
   - API: http://localhost:8000
   - Interactive docs: http://localhost:8000/docs
   - Alternative docs: http://localhost:8000/redoc

## Deployment Options

### 1. Railway

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`

### 2. Render

1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 3. Vercel

1. Install Vercel CLI: `npm install -g vercel`
2. Create `vercel.json`:
   ```json
   {
     "builds": [
       {
         "src": "main.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "main.py"
       }
     ]
   }
   ```
3. Deploy: `vercel --prod`

### 4. Docker Deployment

1. **Build image:**
   ```bash
   docker build -t excel-sql-api .
   ```

2. **Run container:**
   ```bash
   docker run -p 8000:8000 excel-sql-api
   ```

3. **Deploy to cloud:**
   - Push to Docker Hub
   - Deploy on AWS ECS, Google Cloud Run, or Azure Container Instances

## Environment Variables

Set these in your deployment platform:

- `ENVIRONMENT=production`
- `CORS_ORIGINS=https://your-frontend-domain.com`

## API Endpoints

- `POST /api/upload` - Upload Excel file and get SQL schema
- `GET /api/health` - Health check
- `GET /` - API info
- `GET /docs` - Interactive API documentation

## Frontend Integration

Update your frontend's API URL to point to your deployed backend:

```typescript
const API_URL = "https://your-backend-url.com";

const response = await fetch(`${API_URL}/api/upload`, {
  method: "POST",
  body: formData,
});
```