# DataForge: Smart Data Validation and Automated Insights Generator

> **Final Year Project (23SW)**
> Department of Software Engineering, Mehran University of Engineering, Science & Technology (MUET), Jamshoro

DataForge is a full-stack automated data validation, quality scoring, anomaly detection, cleaning, and reporting platform.

---

## 🏗️ Architecture

- **Frontend:** React 18, Vite 6, Tailwind CSS v4, shadcn/ui primitives, Apache ECharts, Zustand
- **Backend API:** Node.js, Express.js, MongoDB / Mongoose, JWT Authentication, Multer, Cloudinary SDK, Google Gemini AI
- **Processing Service:** Python 3.13, FastAPI, Pandas, NumPy, Scikit-Learn (Isolation Forest), SciPy, ReportLab

---

## 🚀 Quick Start

### 1. Backend Service
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

### 2. Frontend Application
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### 3. Python Processing Service
```bash
cd python-service
# Activate virtual environment:
.\venv\Scripts\activate
# Start FastAPI service:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
# Running on http://localhost:8000 (Swagger docs at /docs)
```
