# Smart Road Damage Reporting System - Architecture & Technical Audit

## 1. Executive Summary

This repository implements a proof-of-concept Smart Road Damage Reporting System with:
- A React frontend built on Create React App and Tailwind CSS
- A Django backend with REST endpoints, JWT authentication, and AI-based damage detection
- A YOLO object detection model for classifying road damage images
- MySQL as the configured database backend
- Twilio-based SMS notifications for status updates and escalation alerts

The repository contains duplicate backend copies and duplicated build/config files. The functional frontend API integration is limited; most pages are static UI placeholders. The backend contains both active and partially unused escalation/scheduler code.

This report is intended to provide a senior engineer with a complete understanding of the project structure, architecture, API surface, database design, workflow, and modernization risks.

---

## 2. Complete Folder Structure

```
E:\Ganiiiii\SRDD
├─ README.md
├─ API_DOCUMENTATION.md
├─ COMPLETION_SUMMARY.md
├─ DOCUMENTATION_INDEX.md
├─ GETTING_STARTED.md
├─ IMPROVEMENTS_SUMMARY.md
├─ train_model.py
├─ test_model.py
├─ yolov8n.pt
├─ backend\SmartRoadBackend\
│  ├─ backend\
│  │  ├─ __init__.py
│  │  ├─ asgi.py
│  │  ├─ settings.py
│  │  ├─ urls.py
│  │  └─ wsgi.py
│  ├─ complaints\
│  │  ├─ admin.py
│  │  ├─ apps.py
│  │  ├─ auth_serializers.py
│  │  ├─ detector.py
│  │  ├─ migrations\
│  │  ├─ models.py
│  │  ├─ scheduler.py
│  │  ├─ serializers.py
│  │  ├─ sms_service.py
│  │  ├─ tasks.py
│  │  ├─ tests.py
│  │  ├─ urls.py
│  │  ├─ views.py
│  │  ├─ userserializer.py
│  │  ├─ best.pt
│  │  └─ ...
│  ├─ env\ (Python virtual environment)
│  ├─ manage.py
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ test_detector.py
│  └─ media\
├─ SRDD\
│  ├─ train_model.py
│  ├─ test_model.py
│  ├─ yolov8n.pt
│  ├─ dataset\
│  │  ├─ data.yaml
│  │  ├─ README.dataset.txt
│  │  ├─ README.roboflow.txt
│  │  ├─ test\
│  │  │  ├─ images\
│  │  │  └─ labels\
│  │  ├─ train\
│  │  │  ├─ images\
│  │  │  └─ labels\
│  │  └─ valid\
│  │     ├─ images\
│  │     └─ labels\
│  ├─ backend\SmartRoadBackend\
│  │  ├─ backend\
│  │  ├─ complaints\
│  │  ├─ env\
│  │  ├─ media\
│  │  ├─ manage.py
│  │  ├─ package.json
│  │  ├─ package-lock.json
│  │  ├─ test_detector.py
│  │  └─ users\
│  ├─ frontend\road-damage-frontend\
│  │  ├─ package.json
│  │  ├─ package-lock.json
│  │  ├─ public\
│  │  └─ src\
│  │     ├─ App.js
│  │     ├─ index.js
│  │     ├─ routes\
│  │     ├─ context\
│  │     ├─ pages\
│  │     ├─ components\
│  │     ├─ services\
│  │     ├─ styles\
│  │     └─ ...
│  └─ runs\
│     └─ detect\
│        ├─ train\
│        └─ train3\
└─ ...
```

### Key Notes
- There are two backend copies: `backend\SmartRoadBackend` and `SRDD\backend\SmartRoadBackend`.
- There are also duplicate training scripts and model weights under root and `SRDD`.
- The main React frontend is located at `SRDD\frontend\road-damage-frontend`.
- The dataset manifest is located at `SRDD\dataset\data.yaml`.

---

## 3. Frontend Architecture

### Technology Stack
- React 19 (Create React App)
- React Router DOM 7
- Axios for HTTP requests
- Tailwind CSS v3 with custom theme extensions
- React Context for authentication state
- Material Symbols Outlined icons loaded via Google Fonts
- CSS with both Tailwind utility classes and custom CSS classes

### Folder Layout
- `src/`
  - `App.js` — application root, wraps router and auth provider
  - `index.js` — React root renderer
  - `routes/` — routing definitions and protected route guard
  - `context/` — authentication context
  - `services/` — API client and service layer
  - `pages/` — individual page screens
  - `components/layout/` — layout and navigation components
  - `styles/` — Tailwind CSS entrypoint and custom component styles

### Routing Architecture
- `AppRoutes.jsx` defines all client-side routes.
- Public routes
  - `/login`
  - `/register`
- Citizen-protected routes
  - `/dashboard`
  - `/report`
  - `/my-complaints`
  - `/track`
- Admin-protected route
  - `/admin`
- Root `/` redirects based on user authentication and `is_staff` claim.

### Protected Routing
- `ProtectedRoute.jsx` uses `useAuth()` to decide whether to allow access.
- If user is not authenticated, it redirects to `/login`.
- If a staff user lands on `/dashboard`, it redirects to `/admin`.
- Layout wrapper is applied to routed pages.

### State Management
- Authentication state is managed with React Context in `AuthContext.jsx`.
- It stores `user`, `loading`, and provides `login`/`logout`.
- On initialization, it reads JWT access token from `localStorage` and decodes it manually.
- The app does not use a more advanced state manager like Redux or Zustand.

### API Integration
- `src/services/api.js` defines an Axios instance pointing to `http://localhost:8000/api/`.
- Interceptors add `Authorization: Bearer <access>` and attempt refresh on 401.
- Services exposed:
  - `authService.login`
  - `authService.register`
  - `complaintService.create`
  - `complaintService.getMyList`
  - `complaintService.getAll`
  - `complaintService.getTrack`
  - `complaintService.updateStatus`
  - `complaintService.uploadAfterImage`
  - `complaintService.getEscalated`
  - `dashboardService.getStats`
  - `dashboardService.getAnalytics`
  - `dashboardService.getSeverity`
  - `dashboardService.getChart`

### Layout System
- `Layout.jsx` composes `TopAppBar`, `Sidebar`, and `MobileNav` around page content.
- Desktop layout includes a fixed sidebar and top app bar.
- Mobile layout uses bottom navigation and a sticky top bar.

### Styling Approach
- Tailwind theme is heavily customized in `tailwind.config.js`.
- Global styles are in `src/styles/index.css` with custom component classes such as `glass-card`, `road-overlay`, and `custom-shadow`.
- The public `index.html` also includes Tailwind CDN config and fonts.

### Pages and Components
- `Login.jsx` — login form, JWT sign-in, redirect to dashboard or admin.
- `Register.jsx` — registration form, calls API and then navigates to login.
- `Dashboard.jsx` — client-side dashboard layout with placeholder KPIs and recent reports.
- `ReportDamage.jsx` — active form for complaint submission and image upload.
- `MyComplaints.jsx` — complaint list UI with search and filters (static data only).
- `TrackComplaint.jsx` — complaint tracking UI with timeline (static data only).
- `AdminOperations.jsx` — admin dashboard UI with analytics cards and management table (static data only).
- `Sidebar.jsx` / `TopAppBar.jsx` / `MobileNav.jsx` — navigation and layout.

### Frontend Observations
- Only `Login`, `Register`, and `ReportDamage` consistently invoke backend APIs.
- `Dashboard`, `MyComplaints`, `TrackComplaint`, and `AdminOperations` render static placeholder content.
- Routes are cleanly separated by user role, but actual admin/citizen data flows are incomplete.

---

## 4. Backend Architecture

### Technology Stack
- Django 5.2
- Django REST Framework
- django-cors-headers
- django-crontab
- djangorestframework-simplejwt
- Twilio Python SDK
- Ultralytics YOLO for AI detection
- MySQL configured as the database backend

### Django Apps
- `complaints` — primary application for complaint submission, tracking, analytics, AI detection, and user registration.
- `users` — present but currently empty; no models or endpoint integration.

### Settings (`backend/settings.py`)
- `DEBUG = True`
- `ALLOWED_HOSTS = []`
- `DATABASES` configured with `mysql`, database name `smartroad`, user `root`, no password.
- Installed apps include `rest_framework`, `corsheaders`, `django_crontab`, plus `users` and `complaints`.
- `CORS_ALLOW_ALL_ORIGINS = True`
- `MEDIA_URL = '/media/'`, `MEDIA_ROOT = BASE_DIR / 'media'`
- Cron job configured to run `complaints.tasks.run_escalation_check` at midnight daily.
- Twilio credentials and admin phone number are hardcoded in settings.

### URL Configuration
- `backend/urls.py` mounts the admin interface at `/admin/`.
- The API is mounted under `/api/` using `complaints.urls`.
- Media files are served using Django static helper in development.

### Complaints App Structure
- `models.py` — defines `Complaint`.
- `serializers.py` — defines `ComplaintSerializer`.
- `auth_serializers.py` — custom JWT token serializer adding claims.
- `views.py` — houses all API view functions and registration.
- `urls.py` — routes API endpoints.
- `detector.py` — YOLO model loading and inference.
- `sms_service.py` — Twilio SMS client wrapper.
- `tasks.py` — cron-based escalation logic.
- `scheduler.py` — background scheduler code that appears unused.
- `admin.py` — registers `Complaint` with Django admin.

### Authentication
- Login uses `rest_framework_simplejwt.views.TokenRefreshView` and custom `TokenObtainPairView`.
- Custom token claims include `username`, `is_staff`, and `email`.
- Registration is manual via `RegisterSerializer` writing to Django `auth.User`.
- `create_complaint` and `my_complaints` require authentication.
- Most other endpoints are exposed without authentication.

### Services and Utilities
- `detector.py` loads pretrained YOLO weights from `complaints/best.pt`.
- `sms_service.py` sends messages using Twilio.
- `tasks.py` contains discrete escalation logic for pending complaints older than 15 days.
- `scheduler.py` duplicates escalation logic and provides a `start()` method that is not wired into Django.

---

## 5. Database Design

### Primary Model: Complaint

Fields:
- `user: ForeignKey(auth.User, null=True, blank=True)`
- `image: ImageField(upload_to='complaints/', blank=True, null=True)`
- `after_image: ImageField(upload_to='repaired/', blank=True, null=True)`
- `location: CharField(max_length=255)`
- `phone_number: CharField(max_length=15, blank=True, null=True)`
- `damage_type: CharField(max_length=20, choices=[Pothole, Crack])`
- `detected_damage: CharField(max_length=100, blank=True, null=True)`
- `severity: IntegerField(default=1)`
- `confidence: FloatField(default=0)`
- `severity_level: CharField(max_length=20, default='Low')`
- `status: CharField(max_length=20, choices=[Pending, In Progress, Completed, Escalated], default='Pending')`
- `created_at: DateTimeField(auto_now_add=True)`
- `escalated: BooleanField(default=False)`
- `escalation_date: DateTimeField(null=True, blank=True)`

Relationships:
- `Complaint.user` references Django `auth.User`.
- The model is the central business entity of the app.

Constraints and Purpose:
- `damage_type` is constrained to user-friendly damage categories.
- `status` tracks workflow state.
- `severity_level` is derived from `confidence`.
- `escalated` flags overdue cases.
- `created_at` enables time-based escalation.

### ER Diagram

```
User (auth_user)
  1 <---> * Complaint

Complaint
  id
  user_id
  image
  after_image
  location
  phone_number
  damage_type
  detected_damage
  severity
  confidence
  severity_level
  status
  created_at
  escalated
  escalation_date
```

---

## 6. API Documentation

### Overview
Base URL: `http://localhost:8000/api/`

### Endpoints

1. `POST /api/register/`
   - Purpose: create a new user account
   - Request payload: `{ "username": string, "email": string, "password": string }`
   - Response payload: `{ "message": "User Registered Successfully" }`
   - Authentication: none
   - Frontend use: `Register.jsx`

2. `POST /api/login/`
   - Purpose: obtain JWT access and refresh tokens
   - Request payload: `{ "username": string, "password": string }`
   - Response payload: `{ "refresh": string, "access": string }` plus custom JWT claims inside access
   - Authentication: none
   - Frontend use: `Login.jsx`

3. `POST /api/refresh/`
   - Purpose: refresh access token using refresh token
   - Request payload: `{ "refresh": string }`
   - Response payload: `{ "access": string }`
   - Authentication: requires valid refresh token
   - Frontend use: Axios interceptor in `api.js`

4. `POST /api/complaints/`
   - Purpose: submit a new road damage complaint
   - Request payload: multipart/form-data with fields:
     - `image` — image file
     - `location` — string
     - `damage_type` — string
     - `phone_number` — string
   - Response payload: serialized `Complaint` object
   - Authentication: required
   - Frontend use: `ReportDamage.jsx`

5. `GET /api/my-complaints/`
   - Purpose: retrieve complaints belonging to authenticated user
   - Request payload: none
   - Response payload: list of serialized `Complaint` objects
   - Authentication: required
   - Frontend use: planned for `MyComplaints.jsx` but not currently wired

6. `GET /api/complaints/list/`
   - Purpose: retrieve all complaints
   - Request payload: none
   - Response payload: list of serialized `Complaint` objects
   - Authentication: none
   - Frontend use: not wired

7. `GET /api/complaints/<id>/`
   - Purpose: retrieve a single complaint
   - Request payload: none
   - Response payload: serialized `Complaint`
   - Authentication: none
   - Frontend use: planned for `TrackComplaint.jsx` but not currently wired

8. `PUT /api/complaints/<id>/status/`
   - Purpose: update complaint status
   - Request payload: `{ "status": string }`
   - Response payload: serialized updated `Complaint`
   - Authentication: none
   - Frontend use: planned for admin operations

9. `PUT /api/complaints/<id>/after-image/`
   - Purpose: upload repaired image after completion
   - Request payload: multipart/form-data with `after_image`
   - Response payload: serialized updated `Complaint`
   - Authentication: none
   - Frontend use: not wired

10. `GET /api/complaints/escalated/`
    - Purpose: list escalated complaints
    - Request payload: none
    - Response payload: list of serialized `Complaint` objects
    - Authentication: none
    - Frontend use: not wired

11. `GET /api/complaints/severity/`
    - Purpose: summary counts by severity level
    - Request payload: none
    - Response payload: `{ low, medium, high, critical }`
    - Authentication: none
    - Frontend use: planned for dashboard analytics

12. `GET /api/dashboard/`
    - Purpose: summary counts by complaint status
    - Request payload: none
    - Response payload: `{ total, pending, in_progress, completed, escalated }`
    - Authentication: none
    - Frontend use: planned for dashboard analytics

13. `GET /api/dashboard/analytics/`
    - Purpose: additional analytics and severity counts
    - Request payload: none
    - Response payload: summary object with counts
    - Authentication: none
    - Frontend use: planned for admin analytics pages

14. `GET /api/complaints/chart/`
    - Purpose: returns complaint counts by creation day
    - Request payload: none
    - Response payload: list of `{ day, total }`
    - Authentication: none
    - Frontend use: planned for charts

---

## 7. Authentication Flow

### Login Flow
1. User submits credentials to `POST /api/login/`.
2. Backend returns JWT tokens.
3. Frontend stores `access` and `refresh` in `localStorage`.
4. JWT payload is decoded to set `user` state with `username`, `email`, and `is_staff`.
5. Route redirection occurs based on `is_staff`.

### Registration Flow
1. User submits registration data to `POST /api/register/`.
2. Backend creates a Django `auth.User` via `RegisterSerializer`.
3. On success, frontend navigates to `/login`.

### JWT Lifecycle
- Access token is decoded by frontend with `atob(token.split('.')[1])`.
- Axios request interceptor adds bearer authorization.
- On 401, response interceptor attempts `POST /api/refresh/` using `refresh` token.
- If refresh succeeds, the original request retries.
- If refresh fails, the app clears tokens and redirects to `/login`.

### Session Storage
- Tokens are persisted in browser `localStorage`.
- No refresh token expiration handling is implemented beyond retry logic.

---

## 8. Complaint Workflow

### Complaint Submission
- User navigates to `/report`.
- Image is uploaded via drag-and-drop or file picker.
- User inputs damage type, location, and phone number.
- On submit, frontend sends multipart form data to `/api/complaints/`.

### Image Upload
- `ReportDamage.jsx` sends an image file field named `image`.
- Backend receives it via DRF and stores it in `MEDIA_ROOT/complaints/`.

### AI Damage Detection
- After saving the complaint, backend runs `detect_damage(complaint.image.path)`.
- YOLO model returns a damage class and confidence score.
- Complaint attributes are updated:
  - `detected_damage`
  - `damage_type`
  - `confidence`
  - `severity`
  - `severity_level`
  - `status` resets to `Pending`

### Complaint Tracking
- `TrackComplaint.jsx` offers a search UI and timeline card.
- It currently does not call the API.
- API endpoint support exists at `/api/complaints/<id>/`.

### Complaint History
- `MyComplaints.jsx` renders a complaints list UI.
- It is not wired to the backend, but `GET /api/my-complaints/` supports user-specific history retrieval.

### Search Workflow
- Search fields exist in `MyComplaints.jsx` and `TrackComplaint.jsx`.
- No frontend search filtering or backend query support is implemented.
- Search is currently purely UI-based.

---

## 9. AI Detection Workflow

### Model
- YOLO model weights are stored as `complaints/best.pt`.
- The repository also has `yolov8n.pt` and training artifacts in `SRDD/runs/detect`.

### Detector Implementation
- `complaints/detector.py` loads the model at import time:
  - `model = YOLO("complaints/best.pt")`
- `detect_damage(image_path)` runs inference and reads the first detected class.
- It returns:
  - `damage_type`
  - `confidence` as a percentage

### Severity Mapping
- Confidence thresholds map to severity:
  - 80+ => 5 (Critical)
  - 60+ => 4 (High)
  - 40+ => 3 (Medium)
  - 20+ => 2
  - otherwise => 1
- Severity text is derived from the numeric score.

### AI Limitations Observed
- Only the first bounding box is used; multiple detections are ignored.
- There is no fallback if detection returns no boxes besides `Unknown`.
- The model is loaded from disk synchronously on module import.

---

## 10. Admin Workflow

### Admin Route
- Admin users are routed to `/admin`.
- Access is controlled by `ProtectedRoute` using `user.is_staff`.

### Admin Pages
- `AdminOperations.jsx` presents admin KPIs, charts, and complaint management UI.
- Most admin UI is static and not backed by API data.

### Status Management
- Endpoint `/api/complaints/<id>/status/` allows status changes.
- It is currently unprotected and accessible without authorization.

### Escalation
- Escalation logic exists in two places:
  - `complaints/tasks.py` for cron execution
  - `complaints/scheduler.py` for a background scheduler
- Cron job is configured in settings via `django_crontab`.
- Escalation marks pending complaints older than 15 days as `Escalated`.
- Escalation sends SMS via Twilio.

### SMS Notifications
- Status updates call `send_status_sms` from `twilio_service.py`.
- The Twilio account SID, auth token, and phone numbers are hardcoded in Django settings.
- `send_status_sms` is invoked during status update and escalation.

---

## 11. Dashboard Architecture

### Citizen Dashboard
- `Dashboard.jsx` is a rich UI with cards, tables, and map imagery.
- All dashboard values are hardcoded placeholders.
- Navigation includes a floating action button and bottom nav.

### Admin Dashboard
- `AdminOperations.jsx` provides KPI cards, bar graphs, donut visuals, and complaint tables.
- It uses static numbers and sample rows.
- The sidebar and mobile nav are fully implemented.

### Analytics Implementation
- Backend analytics endpoints exist but are not consumed by these pages.
- `complaints/chart/` returns time-series counts.
- `dashboard/analytics/` returns severity and status aggregates.

---

## 12. UI Component Hierarchy

### Root
- `App.js`
  - `AuthProvider`
  - `Router`
  - `AppRoutes`

### Routes
- `AppRoutes.jsx`
  - Public pages: `Login`, `Register`
  - Protected pages: `Dashboard`, `ReportDamage`, `MyComplaints`, `TrackComplaint`
  - Admin page: `AdminOperations`

### Layout
- `Layout.jsx`
  - `TopAppBar.jsx`
  - `Sidebar.jsx`
  - `MobileNav.jsx`
  - `main` content wrapper

### Pages
- `Login.jsx`
- `Register.jsx`
- `Dashboard.jsx`
- `ReportDamage.jsx`
- `MyComplaints.jsx`
- `TrackComplaint.jsx`
- `AdminOperations.jsx`

### Services
- `api.js`
- `AuthContext.jsx`

---

## 13. Reusable Components

- `Layout` — structural page wrapper used by all protected routes
- `TopAppBar` — fixed top navigation shared by protected pages
- `Sidebar` — desktop navigation for citizens/admins
- `MobileNav` — bottom mobile navigation
- `AuthContext` — shared authentication provider
- `api` Axios instance — centralized API client with token refresh logic

### Design System Reuse
- Tailwind theme tokens are reused across components.
- Utility classes are consistent for spacing, card styles, and buttons.
- Custom CSS classes support repeated visual patterns like glass cards and overlays.

---

## 14. Current Design System

### Color Palette
- Primary blue: `#004ac6`
- Primary container: `#2563eb`
- Secondary: `#565e74`
- Error: `#ba1a1a`
- Background: `#faf8ff`
- Surface variants range from `#ffffff` to `#e1e2ed`

### Typography
- Font family: `Inter`
- Custom size tokens from `headline-xl` to `label-sm`
- Strong emphasis on uppercase labels and bold headings

### Spacing
- Tailwind spacing tokens: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`
- Consistent use of padding and margin for cards and forms

### Responsive Behavior
- Desktop uses sidebar + top app bar
- Mobile uses bottom navigation and stacked cards
- UI is generally responsive, but many pages are still layout prototypes

### Visual Style
- Rounded cards and soft shadows
- Frosted/glass effects in login and panels
- Gradient overlay and hero-style backgrounds
- Consistent material iconography

---

## 15. Security Review

### Critical Findings
- `DEBUG = True` in production-like settings.
- `SECRET_KEY` and Twilio credentials are hardcoded in source control.
- `CORS_ALLOW_ALL_ORIGINS = True` opens the API to any origin.
- Several API endpoints are publicly accessible without authentication:
  - `/api/complaints/list/`
  - `/api/complaints/<id>/`
  - `/api/complaints/<id>/status/`
  - `/api/complaints/<id>/after-image/`
  - `/api/complaints/escalated/`
  - `/api/complaints/severity/`
  - `/api/dashboard/`
  - `/api/dashboard/analytics/`
  - `/api/complaints/chart/`
- `update_status` is not protected, allowing any caller to change complaint state.
- `send_status_sms` uses unvalidated phone numbers and raw SMS payloads.
- JWT refresh logic is implemented, but token expiry and refresh token rotation are not enforced.

### Access Control Concerns
- Admin-only behavior is only enforced at the frontend route guard.
- Critical operations like status updates and SMS notifications have no server-side role checks.
- The `users` app is not used, so no dedicated user management exists beyond `auth.User`.

### Data Exposure
- `get_complaints` returns all complaints to any caller.
- `track_complaint` returns complaint details without ownership verification.

---

## 16. Performance Review

### Backend
- The YOLO model loads on import in `detector.py`; this can cause slow startup.
- Image-based inference is synchronous inside request handling.
- The model uses `complaints/best.pt`, which may be large and resource-intensive.
- `escalate_complaint` is called repeatedly for every complaint request in several endpoints.
- The cron job logic duplicates the runtime escalation check.

### Frontend
- Axios interceptors are set up correctly, but no global loading/error handling exists.
- Many pages render heavy static markup but do not use actual backend data.
- The login/register forms use minimal validation beyond input presence.

---

## 17. Technical Debt

### Duplicate and Unused Code
- Duplicate backend copies under root and `SRDD`.
- Duplicate training/test scripts at root and `SRDD`.
- `scheduler.py` duplicates escalation logic and is not wired.
- `users` app is largely empty and unused.
- Frontend admin/citizen pages are mostly placeholder UI.

### Incomplete Integrations
- `MyComplaints` page is not wired to `GET /api/my-complaints/`.
- `TrackComplaint` page does not call `/api/complaints/<id>/`.
- `AdminOperations` page is not wired to analytics or complaint list endpoints.
- Search filters exist only in UI and do not interact with backend.

### Configuration and Environment
- No `requirements.txt` or `Pipfile` is present for backend dependencies.
- Backend package management is unclear; `package.json` in the Python backend folder is unusual.
- Hardcoded credentials and local DB config reduce portability.

---

## 18. Scalability Assessment

### Architecture
- Monolithic Django backend and React frontend in one repository.
- The backend serves as both API and media host.
- The AI model is embedded in the same process.

### Scalability Risks
- YOLO inference inside the request lifecycle will not scale under concurrent load.
- Public access to data endpoints could increase load and expose sensitive records.
- The MySQL instance is configured for local use only.
- `django_crontab` is suitable for small deployments but not large-scale distributed systems.

### Suggested Improvement Areas
- Separate AI inference into a dedicated service or worker queue.
- Add server-side permissions per endpoint.
- Migrate secrets to environment variables.
- Implement pagination on complaint lists.
- Add request validation and rate limiting.

---

## 19. Maintainability Assessment

### Strengths
- The React router and auth flow are logically organized.
- Tailwind theming is consistent and extensible.
- The complaint model is simple and focused.

### Weaknesses
- Duplication across backend copies and training scripts.
- Placeholder pages create false confidence in feature completeness.
- No automated tests beyond empty `tests.py`.
- No requirements file or dependency manifest for Python backend.
- Hardcoded environment data and secrets hinder safe onboarding.

### Code Quality Notes
- `views.py` mixes business logic, escalation logic, and endpoint definitions in one module.
- `scheduler.py` duplicates code rather than reusing shared functions.
- `auth_serializers.py` is correct, but `rest_framework_simplejwt` is not explicitly configured in settings.

---

## 20. Backend Compatibility Notes

### Python/Django
- Backend is built for Django 5.2.
- Database backend is MySQL.
- Required Python packages likely include:
  - Django
  - djangorestframework
  - djangorestframework-simplejwt
  - django-cors-headers
  - django-crontab
  - twilio
  - ultralytics
  - apscheduler

### Frontend
- React 19 with CRA 5
- Tailwind CSS 3
- Axios 1+
- React Router 7

### Model Training
- `train_model.py` and `test_model.py` use `ultralytics.YOLO`.
- Dataset YAML references Roboflow dataset metadata.
- Training paths are hardcoded to `G:/SRDD/dataset/data.yaml`.

---

## 21. High-Level Improvement Roadmap

1. **Consolidate duplicate backend copies** into one canonical `SmartRoadBackend`.
2. **Extract environment variables** for secret key, DB credentials, Twilio credentials, and allowed hosts.
3. **Secure all API endpoints** with authentication and role-based permissions.
4. **Wire actual data fetches** into dashboard, history, tracking, and admin pages.
5. **Centralize escalation logic** and remove duplicate scheduler code.
6. **Add a dependency manifest** for Python (`requirements.txt` or `pyproject.toml`).
7. **Move AI inference off request thread** into a task queue or service.
8. **Implement search and filter APIs** for complaint list and track pages.
9. **Add backend tests** and meaningful frontend integration tests.
10. **Replace hardcoded Twilio secrets** and add SMS retry/failure handling.

---

## Appendix: Notable Files and Their Roles

- `SRDD/frontend/road-damage-frontend/src/App.js` — app root
- `SRDD/frontend/road-damage-frontend/src/routes/AppRoutes.jsx` — client routes
- `SRDD/frontend/road-damage-frontend/src/context/AuthContext.jsx` — auth state
- `SRDD/frontend/road-damage-frontend/src/services/api.js` — API client
- `SRDD/frontend/road-damage-frontend/src/pages/ReportDamage.jsx` — active complaint submission
- `SRDD/backend/SmartRoadBackend/complaints/models.py` — Complaint entity
- `SRDD/backend/SmartRoadBackend/complaints/views.py` — API endpoints
- `SRDD/backend/SmartRoadBackend/complaints/detector.py` — AI detection
- `SRDD/backend/SmartRoadBackend/complaints/sms_service.py` — Twilio SMS
- `SRDD/backend/SmartRoadBackend/backend/settings.py` — Django configuration
- `SRDD/backend/SmartRoadBackend/complaints/urls.py` — API routing
- `SRDD/dataset/data.yaml` — YOLO dataset manifest

---

## Final Observations

This project is a strong prototype with a compelling UI concept and a backend capable of AI-driven complaint ingestion. The current state is closer to a functional prototype than a fully integrated product. The most urgent modernization work is to secure endpoints, remove duplicate code, and replace placeholder UI with live data connections.
