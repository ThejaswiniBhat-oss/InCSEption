import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppShell from './components/layout/AppShell';
import SplashPage        from './pages/SplashPage';
import AuthPage          from './pages/AuthPage';
import RolePickerPage    from './pages/RolePickerPage';
import HomePage          from './pages/HomePage';
import SchemeDetailPage  from './pages/SchemeDetailPage';
import ApplyPage         from './pages/ApplyPage';
import VerifyPage        from './pages/VerifyPage';
import AgentsPage        from './pages/AgentsPage';
import MySchemesPage     from './pages/MySchemesPage';
import ProfilePage       from './pages/ProfilePage';
import EditProfilePage   from './pages/EditProfilePage';
import AboutPage         from './pages/AboutPage';
import HelpPage          from './pages/HelpPage';
import PrivacyPage       from './pages/PrivacyPage';

function ProtectedRoutes() {
  const { isAuthenticated, firstLogin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (firstLogin)       return <Navigate to="/role-picker" replace />;
  return <AppShell />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/splash"      element={<SplashPage />} />
      <Route path="/auth"        element={isAuthenticated ? <Navigate to="/home" replace /> : <AuthPage />} />
      <Route path="/role-picker" element={<RolePickerPage />} />

      <Route element={<ProtectedRoutes />}>
        <Route path="/home"                          element={<HomePage />} />
        <Route path="/scheme/:id"                    element={<SchemeDetailPage />} />
        <Route path="/scheme/:id/apply"              element={<ApplyPage />} />
        <Route path="/scheme/:id/verify/:appId"      element={<VerifyPage />} />
        <Route path="/agents"                        element={<AgentsPage />} />
        <Route path="/my-schemes"                    element={<MySchemesPage />} />
        <Route path="/profile"                       element={<ProfilePage />} />
        <Route path="/profile/edit"                  element={<EditProfilePage />} />
        <Route path="/about"                         element={<AboutPage />} />
        <Route path="/help"                          element={<HelpPage />} />
        <Route path="/privacy"                       element={<PrivacyPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/splash" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
