import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useToast } from "../context/ToastProvider.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const shownRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated && !shownRef.current) {
      toast("Please log in to access this page.", "error");
      shownRef.current = true;
    }
  }, [isAuthenticated, toast]);

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace state={{ from: location }} />;
  // }

  return <Outlet />;
};

export default ProtectedRoutes;
