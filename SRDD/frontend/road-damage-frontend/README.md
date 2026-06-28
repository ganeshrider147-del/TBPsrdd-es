# 🚧 Road Detector

**Road Detector** is an AI-powered Road Damage Reporting and Management System designed to help citizens report road issues while enabling government authorities to efficiently manage, monitor, and resolve complaints.

The platform combines **Artificial Intelligence**, **Computer Vision**, **Django REST Framework**, and **React** to automate road damage identification and streamline the complaint management workflow.

---

# 🌟 Features

## 👤 Citizen Portal

* Secure Registration & Login (JWT Authentication)
* Report Road Damage
* Upload Road Images
* Automatic Damage Detection
* Complaint Tracking
* Complaint History
* Complaint Timeline
* View Repair Progress
* Notifications
* Profile Management
* Feedback & Rating

---

## 🛠 Administrator Portal

* Secure Administrator Login
* Operations Dashboard
* Complaint Management
* Search & Filtering
* Complaint Assignment
* Status Updates
* Repair Image Upload
* Analytics Dashboard
* Report Generation
* Department Management
* Notification Management

---

# 🤖 AI Features

The system automatically analyzes uploaded road images.

Supported detections include:

* Potholes
* Road Cracks

The system provides:

* Damage Identification
* Detection Accuracy
* Severity Analysis
* Repair Priority
* Damage Summary

No manual damage selection is required.

---

# 📲 Notification System

Integrated with Twilio SMS.

Citizens receive updates when:

* Complaint Submitted
* Complaint Assigned
* Work Scheduled
* Work Started
* Work In Progress
* Work Completed
* Complaint Closed

---

# 🖥 Technology Stack

## Frontend

* React
* React Router
* Axios
* Tailwind CSS
* Material UI
* Framer Motion

---

## Backend

* Django
* Django REST Framework
* Simple JWT
* Gunicorn
* WhiteNoise

---

## AI

* YOLO
* OpenCV
* NumPy
* Pillow

---

## Database

* PostgreSQL (Production)
* SQLite (Development)

---

## Cloud & Deployment

* Railway
* GitHub

---

## Notifications

* Twilio SMS API

---

# 📁 Project Structure

```text
RoadDetector/

├── backend/
│   ├── authentication/
│   ├── complaints/
│   ├── analytics/
│   ├── notifications/
│   ├── ai_detection/
│   ├── media/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── routes/
│   │   └── assets/
│   └── package.json
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/245124751058-dotcom/TBPsrdd-es.git
```

```bash
cd TBPsrdd-es
```

---

## Backend Setup

```bash
cd backend

python -m venv venv
```

Activate virtual environment.

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start backend:

```bash
python manage.py runserver
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm start
```

Frontend:

```
http://localhost:3000
```

Backend:

```
http://localhost:8000
```

---

# 🔐 Environment Variables

Create a `.env` file.

Example:

```env
SECRET_KEY=

DEBUG=False

DATABASE_URL=

JWT_SECRET_KEY=

TWILIO_ACCOUNT_SID=

TWILIO_AUTH_TOKEN=

TWILIO_PHONE_NUMBER=

MEDIA_ROOT=

MEDIA_URL=

YOLO_MODEL_PATH=
```

---

# 📊 Application Workflow

Citizen

```
Register
      ↓
Login
      ↓
Upload Road Image
      ↓
Automatic Damage Detection
      ↓
Complaint Submitted
      ↓
Complaint Tracking
      ↓
Repair Updates
      ↓
Complaint Closed
```

Administrator

```
Login
      ↓
View Complaints
      ↓
Assign Complaint
      ↓
Schedule Work
      ↓
Update Status
      ↓
Upload Repair Images
      ↓
Close Complaint
```

---

# 📈 Dashboard Modules

Citizen Dashboard

* Complaint Summary
* Recent Complaints
* Complaint Timeline
* Notifications

Administrator Dashboard

* Total Complaints
* Pending
* In Progress
* Completed
* Analytics
* Reports
* Department Performance

---

# 🔒 Security Features

* JWT Authentication
* Password Hashing
* Role-Based Access Control
* Protected Routes
* API Authorization
* Input Validation
* Secure File Upload

---

# 📸 Media Support

* Road Image Upload
* Repair Image Upload
* Image Preview
* Before / After Comparison
* Media Storage

---

# 📱 Responsive Design

Optimized for:

* Desktop
* Laptop
* Tablet
* Mobile

---

# 🚀 Deployment

Production deployment is configured for:

* Railway
* PostgreSQL
* Gunicorn
* WhiteNoise

---

# 🧪 Testing

Verified modules include:

* User Registration
* User Login
* Admin Login
* Complaint Submission
* Image Upload
* Damage Detection
* Complaint History
* Complaint Tracking
* Analytics
* Reports
* Notifications
* Twilio Integration
* Responsive UI

---

# 📄 License

This project is intended for educational, research, and demonstration purposes. Review and adapt the licensing terms before using it in a production or commercial environment.

---

# 👨‍💻 Developed By

B.Tech – Computer Science & Engineering

AI-Powered Road Damage Reporting & Monitoring System
