import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // Context yükleniyor, render etme

  if (!isAuthenticated) {
    return <Navigate to="/" />; // Giriş yapılmamışsa login sayfasına yönlendir
  }

  return children;
};

export default PrivateRoute;