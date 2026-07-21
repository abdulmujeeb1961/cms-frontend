import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Departments";
import Students from "./pages/Students";
import Faculty from "./pages/Faculty";
import Courses from "./pages/Courses";
import Attendance from "./pages/Attendance";
import Grades from "./pages/Grades";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><AppLayout title="Dashboard" /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]}><AppLayout title="Departments" /></ProtectedRoute>}>
            <Route path="/departments" element={<Departments />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]}><AppLayout title="Students" /></ProtectedRoute>}>
            <Route path="/students" element={<Students />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]}><AppLayout title="Faculty" /></ProtectedRoute>}>
            <Route path="/faculty" element={<Faculty />} />
          </Route>

          <Route element={<ProtectedRoute><AppLayout title="Courses" /></ProtectedRoute>}>
            <Route path="/courses" element={<Courses />} />
          </Route>

          <Route element={<ProtectedRoute><AppLayout title="Attendance" /></ProtectedRoute>}>
            <Route path="/attendance" element={<Attendance />} />
          </Route>

          <Route element={<ProtectedRoute><AppLayout title="Grades" /></ProtectedRoute>}>
            <Route path="/grades" element={<Grades />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
