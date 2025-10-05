import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { userService } from '@/services/userService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);

  useEffect(() => {
    if (requireAdmin && user && !checkingAdmin) {
      setCheckingAdmin(true);
      userService.isAdmin(user.id).then(({ isAdmin, error }) => {
        if (!error) {
          setIsAdmin(isAdmin);
        } else {
          setIsAdmin(false);
        }
        setCheckingAdmin(false);
      });
    }
  }, [user, requireAdmin, checkingAdmin]);

  if (loading || (requireAdmin && isAdmin === null)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;