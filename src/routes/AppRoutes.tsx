import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Brands } from '@/pages/Brands';
import { Projects } from '@/pages/Projects';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { MyTasks } from '@/pages/MyTasks';
import { SendTasksEmail } from '@/pages/SendTasksEmail';
import { TeamManagement } from '@/pages/TeamManagement';
import { SuperadminDashboard } from '@/pages/SuperadminDashboard';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { UserDashboard } from '@/pages/UserDashboard';
import { useAuthStore } from '@/store/authStore';

export const AppRoutes = () => {
  const user = useAuthStore((s) => s.user);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={
                  user?.role === 'superadmin' ? <SuperadminDashboard /> :
                  user?.role === 'admin' ? <AdminDashboard /> :
                  <UserDashboard />
                } />
                <Route path="/brands" element={<Brands />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/my-tasks" element={<MyTasks />} />
                <Route path="/send-tasks-email" element={<SendTasksEmail />} />
                <Route path="/team" element={<TeamManagement />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

