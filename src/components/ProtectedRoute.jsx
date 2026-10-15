import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// 🚪 Guard route: if the user is not logged in, redirect to /login
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="py-20 text-center text-slate-500">⏳ Checking...</p>;
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
