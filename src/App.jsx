import React from 'react';
import { useAuth } from './context/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { TaskProvider } from './context/TaskContext';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { AITaskCreation } from './pages/AITaskCreation';
import { SmartScheduler } from './pages/SmartScheduler';
import { Calendar } from './pages/Calendar';
import { FocusMode } from './pages/FocusMode';
import { Goals } from './pages/Goals';
import { Analytics } from './pages/Analytics';
import { AIAssistant } from './pages/AIAssistant';
import { Settings } from './pages/Settings';

// Auth Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

function ProtectedDashboard() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <DashboardLayout /> : <Navigate to="/login" replace />;
}

function UserScopedData({ children }) {
  const { user, loading } = useAuth();
  const accountKey = loading ? 'auth-loading' : (user?.id || 'guest');
  return (
    <NotificationProvider key={accountKey}>
      <TaskProvider key={accountKey}>{children}</TaskProvider>
    </NotificationProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserScopedData>
            <Routes>
              {/* Authentication Routes (Stand-alone without dashboard sidebar) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected Dashboard Layout Routes */}
              <Route path="/" element={<ProtectedDashboard />}>
                <Route index element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="ai-task-creation" element={<AITaskCreation />} />
                <Route path="smart-scheduler" element={<SmartScheduler />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="focus-mode" element={<FocusMode />} />
                <Route path="goals" element={<Goals />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="ai-assistant" element={<AIAssistant />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </UserScopedData>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
