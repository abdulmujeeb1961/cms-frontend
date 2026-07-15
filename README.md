# College Management System — Frontend (React + Bootstrap)

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_URL if your backend isn't on localhost:8000
npm run dev
```

Runs on `http://localhost:5173` by default. Make sure the Django backend is running on the URL set in `.env` (default `http://127.0.0.1:8000/api`), and that `CORS_ALLOWED_ORIGINS` in the backend includes `http://localhost:3000` / `http://localhost:5173` as needed.

## Structure

```
src/
  api/axios.js          axios instance: attaches JWT, auto-refreshes on 401
  context/AuthContext.jsx  login/logout state, persisted to localStorage
  routes/ProtectedRoute.jsx  redirects to /login if unauthenticated, enforces role access
  components/
    AppLayout.jsx        sidebar + topbar shell, wraps all authenticated pages
    Sidebar.jsx           role-aware nav (Admin/Faculty/Student see different links)
    Topbar.jsx
    Modal.jsx             reusable modal used by every CRUD page
  pages/
    Login.jsx
    Dashboard.jsx         role-aware stat cards
    Students.jsx          full CRUD (Admin only)
    Faculty.jsx            full CRUD (Admin only)
    Courses.jsx            CRUD for Admin, read-only list for Faculty/Student
    Attendance.jsx          mark (Admin/Faculty), view own (Student)
    Grades.jsx              enter (Admin/Faculty), view own (Student)
```

## Auth flow

1. `Login.jsx` posts to `/api/auth/login/`, stores `access`/`refresh`/`role` in localStorage.
2. `api/axios.js` attaches `Authorization: Bearer <access>` to every request automatically.
3. On a 401, it transparently calls `/api/auth/login/refresh/` and retries the original request once. If refresh also fails, the user is logged out and sent to `/login`.

## Role-based UI

`ProtectedRoute` takes an optional `allowedRoles` prop — routes like `/students` and `/faculty` are wrapped with `allowedRoles={["ADMIN"]}` so Faculty/Student accounts are redirected away even if they guess the URL. Within a shared page (e.g. `Courses.jsx`), components check `user.role` to show/hide the "Add" button and admin-only columns — the backend still enforces the same rules independently via DRF permissions, so this is UX convenience, not the security boundary.

## Design

Visual identity: navy (`#1E3557`) + gold (`#C9A44C`) "registrar's ledger" theme — `Fraunces` for headings, `Inter` for body text, `IBM Plex Mono` for IDs/roll numbers/data. All tokens are CSS variables in `src/index.css` — change them there to re-theme the whole app.

## Next steps

- Add a "My enrollments" self-service page for students to enroll in open courses.
- Add pagination controls to tables (backend already paginates at 20/page).
- Swap `alert()`/`confirm()` for toast notifications and a proper confirm dialog.
- Add an `.env.production` and deploy (Vercel/Netlify), pointing `VITE_API_URL` at your deployed backend.
