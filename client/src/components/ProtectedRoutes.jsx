import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useToast } from "../context/ToastProvider.jsx";

const ProtectedRoutes = ({ isAuthenticated }) => {
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      toast("Please log in to access this page.", "error");
    }
  }, [isAuthenticated]);

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );

  // return <Outlet />;
};

export default ProtectedRoutes;
