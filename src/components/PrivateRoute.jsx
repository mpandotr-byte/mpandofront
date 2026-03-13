import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasAccess, getDefaultPath } from "../config/roles";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Rol bazli erisim kontrolu
  const userRole = user?.role;
  if (userRole && !hasAccess(userRole, location.pathname)) {
    // Yetkisiz erisim - kullaniciyi varsayilan sayfasina yonlendir
    const defaultPath = getDefaultPath(userRole);
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export default PrivateRoute;
