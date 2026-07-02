import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import GuardianView from './pages/GuardianView.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import LessonPlayer from './pages/LessonPlayer.jsx';
import Quiz from './pages/Quiz.jsx';
import NumberGame from './pages/NumberGame.jsx';
import SpellingGame from './pages/SpellingGame.jsx';
import WritingActivity from './pages/WritingActivity.jsx';
import Badges from './pages/Badges.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import GroupSelect from './pages/GroupSelect.jsx';
import GroupStudents from './pages/GroupStudents.jsx';
import LessonManager from './pages/LessonManager.jsx';
import StudentDetail from './pages/StudentDetail.jsx';
import ClassOverview from './pages/math/ClassOverview.jsx';
import MathHome from './pages/math/MathHome.jsx';
import MathModule from './pages/math/MathModule.jsx';
import MathActivity from './pages/math/MathActivity.jsx';

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
      {/* Public guardian progress view (no login; child code only) */}
      <Route path="/guardian" element={<GuardianView />} />
      {/* Grade 4 Maths is the student home */}
      <Route
        path="/home"
        element={
          <ProtectedRoute role="student">
            <MathHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/math/:moduleId"
        element={
          <ProtectedRoute role="student">
            <MathModule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/math/play/:activityId"
        element={
          <ProtectedRoute role="student">
            <MathActivity />
          </ProtectedRoute>
        }
      />
      {/* Old game dashboard (badges/progress/mood) kept here */}
      <Route
        path="/progress"
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
        path="/numbers/:id"
        element={
          <ProtectedRoute role="student">
            <NumberGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/spelling/:id"
        element={
          <ProtectedRoute role="student">
            <SpellingGame />
          </ProtectedRoute>
        }
      />
      <Route
        path="/writing"
        element={
          <ProtectedRoute role="student">
            <WritingActivity />
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
      {/* Teacher landing: choose a research group (path) first */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <GroupSelect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/group/:group"
        element={
          <ProtectedRoute role="teacher">
            <GroupStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/dashboard"
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
      <Route
        path="/teacher/student/:id"
        element={
          <ProtectedRoute role="teacher">
            <StudentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/overview"
        element={
          <ProtectedRoute role="teacher">
            <ClassOverview />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
