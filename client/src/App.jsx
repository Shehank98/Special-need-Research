import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import LessonPlayer from './pages/LessonPlayer.jsx';
import Quiz from './pages/Quiz.jsx';
import Badges from './pages/Badges.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import LessonManager from './pages/LessonManager.jsx';

export default function App() {
  const { user, ready } = useAuth();
  if (!ready) return null;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'teacher' ? '/teacher' : '/home'} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lesson/:id"
        element={
          <ProtectedRoute role="student">
            <LessonPlayer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quiz/:id"
        element={
          <ProtectedRoute role="student">
            <Quiz />
          </ProtectedRoute>
        }
      />
      <Route
        path="/badges"
        element={
          <ProtectedRoute role="student">
            <Badges />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/lessons"
        element={
          <ProtectedRoute role="teacher">
            <LessonManager />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
