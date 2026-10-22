import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { ToastProvider } from './contexts/ToastContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { RequireAdmin } from './components/admin/RequireAdmin.jsx';
import { Skeleton } from './components/common/Feedback.jsx';
import './styles/public.css';

const RequestPage = lazy(() => import('./pages/public/RequestPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage.jsx'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage.jsx'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout.jsx'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage.jsx'));
const RequestsPage = lazy(() => import('./pages/admin/RequestsPage.jsx'));
const MaterialsPage = lazy(() => import('./pages/admin/MaterialsPage.jsx'));
const CategoriesPage = lazy(() => import('./pages/admin/CategoriesPage.jsx'));
const BranchesPage = lazy(() => import('./pages/admin/BranchesPage.jsx'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage.jsx'));
const FormSettingsPage = lazy(() => import('./pages/admin/FormSettingsPage.jsx'));
const IntegrationsPage = lazy(() => import('./pages/admin/IntegrationsPage.jsx'));
const AdminsPage = lazy(() => import('./pages/admin/AdminsPage.jsx'));

const Fallback = () => (
  <div style={{ padding: 32, display: 'grid', gap: 16 }} aria-busy="true">
    <Skeleton height={48} width="40%" />
    <Skeleton height={240} radius={28} />
  </div>
);

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<Fallback />}>
              <Routes>
                <Route path="/" element={<Navigate to="/solicitar" replace />} />
                <Route path="/solicitar" element={<RequestPage />} />
                <Route path="/admin/login" element={<LoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <RequireAdmin>
                      <AdminLayout />
                    </RequireAdmin>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="solicitudes" element={<RequestsPage />} />
                  <Route path="materiales" element={<MaterialsPage />} />
                  <Route path="categorias" element={<CategoriesPage />} />
                  <Route path="sucursales" element={<BranchesPage />} />
                  <Route path="reportes" element={<ReportsPage />} />
                  <Route path="configuracion/formulario" element={<FormSettingsPage />} />
                  <Route path="integraciones" element={<IntegrationsPage />} />
                  <Route path="administradores" element={<AdminsPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </MotionConfig>
  );
}
