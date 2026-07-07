# 🚀 Road Detector — Local Development Execution Guide

This document contains step-by-step instructions to set up, configure, and execute the **Road Detector** application locally.

---

## 📋 Prerequisites

Before running the application, ensure you have the following installed on your machine:
- **Python**: Version 3.11.x
- **Node.js**: Version 18.x or 20.x (with `npm`)
- **MySQL Database**: A local instance running on port `3306`

---

## 🗄️ Database Setup

The backend is configured to connect to a local MySQL instance with the following default credentials (defined in [settings.py](file:///e:/Ganiiiii/SRDD/SRDD/backend/SmartRoadBackend/backend/settings.py)):
- **Database Name**: `smartroad`
- **Username**: `root`
- **Password**: `21040724`
- **Host**: `localhost`
- **Port**: `3306`

If your local MySQL credentials differ, create a `.env` file under `SRDD/backend/SmartRoadBackend/` and set:
```env
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

---

## 🐍 1. Running the Django Backend Service

1. **Open a terminal** and navigate to the backend project directory:
   ```powershell
   cd "e:\Ganiiiii\SRDD\SRDD\backend\SmartRoadBackend"
   ```

2. **Activate the pre-configured Python virtual environment**:
   * On Windows (PowerShell):
     ```powershell
     .\env\Scripts\activate
     ```
   * On Windows (CMD):
     ```cmd
     .\env\Scripts\activate.bat
     ```
   * On macOS/Linux:
     ```bash
     source env/bin/activate
     ```

3. **Install dependencies** (if not already installed):
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply database migrations**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Start the Django development server**:
   If standard `python` command doesn't resolve to your virtual environment (causing `ModuleNotFoundError: No module named 'django'`), run using the direct virtual environment path:
   * **Windows (PowerShell or CMD)**:
     ```powershell
     .\env\Scripts\python manage.py runserver 0.0.0.0:8000
     ```
   * **macOS/Linux**:
     ```bash
     ./env/bin/python manage.py runserver 0.0.0.0:8000
     ```
   *Standard run (if path resolves correctly):*
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   *The backend server will run at [http://localhost:8000/api/](http://localhost:8000/api/).*

---

## ⚛️ 2. Running the React Frontend Client

1. **Open a new terminal window** (keep the backend terminal running) and navigate to the frontend project directory:
   ```powershell
   cd "e:\Ganiiiii\SRDD\SRDD\frontend\road-damage-frontend"
   ```

2. **Install npm dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Start the frontend development server**:
   * **Windows (Command Prompt / CMD)**:
     ```cmd
     set PORT=3000&& set BROWSER=none&& npm start
     ```
   * **Windows (PowerShell)**:
     ```powershell
     $env:PORT=3000; $env:BROWSER="none"; npm start
     ```
   * **macOS/Linux**:
     ```bash
     PORT=3000 BROWSER=none npm start
     ```
   *Or simply (to run on default settings):*
   ```bash
   npm start
   ```

---

## 🔄 Verified Running Status

We have already executed the commands for you! The servers are currently running in the background:
- **Backend API**: Listening on port `8000` (PID 43548)
- **Frontend App**: Listening on port `3000` (PID 31392)
