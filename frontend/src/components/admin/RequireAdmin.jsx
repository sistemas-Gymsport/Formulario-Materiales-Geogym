import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Skeleton } from '../common/Feedback.jsx';

export const RequireAdmin = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'idle' || status === 'loading') {
    return (
      <div style={{ padding: 32, display: 'grid', gap: 16 }} aria-busy="true">
        <Skeleton height={56} width="30%" />
        <Skeleton height={300} radius={28} />
      </div>
    );
  }
  if (status !== 'authenticated') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return children;
};
