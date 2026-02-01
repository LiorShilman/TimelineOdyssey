import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MomentsPage from './pages/MomentsPage';
import GalaxyPage from './pages/GalaxyPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './stores/authStore';

function App() {
  const { isAuthenticated, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <Router basename={import.meta.env.BASE_URL.replace(/\/+$/, '')}>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          {/* Redirect root based on auth status — wait for initAuth if restoring session */}
          <Route
            path="/"
            element={isLoading ? null : (isAuthenticated ? <Navigate to="/galaxy" replace /> : <Navigate to="/login" replace />)}
          />

          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/galaxy"
            element={
              <ProtectedRoute>
                <GalaxyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moments"
            element={
              <ProtectedRoute>
                <MomentsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Toaster position="top-center" theme="dark" richColors />
      </div>
    </Router>
  );
}

export default App;
