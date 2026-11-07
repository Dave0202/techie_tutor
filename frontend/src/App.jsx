import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import TutorDashboard from './pages/TutorDashboard';
import TutorSearchPage from './pages/TutorSearchPage';
import TutorProfilePage from './pages/TutorProfilePage';
import SessionPage from './pages/SessionPage';
import ResourcePage from './pages/ResourcePage';
import TutorProfileEditPage from './pages/TutorProfileEditPage';
import ProfilePage from './pages/ProfilePage';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tutors" element={<TutorSearchPage />} />
        <Route path="/tutors/:id" element={<TutorProfilePage />} />

        <Route element={<ProtectedRoute /> }>
          <Route path="/dashboard" element={user?.role === 'TUTOR' ? <TutorDashboard /> : <StudentDashboard />} />
          <Route path="/sessions" element={<SessionPage />} />
          <Route path="/resources" element={<ResourcePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route element={<ProtectedRoute requiredRole="TUTOR" />}>
          <Route path="/tutor/profile" element={<TutorProfileEditPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
