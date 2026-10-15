import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VerifyEmailPage from "../pages/VerifyEmailPage";

// 🚪 Guard route:
//   not logged in      → redirect to /login
//   email not verified → show the "verify your email" screen
//   otherwise          → show the page
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="py-20 text-center text-slate-500">⏳ Checking...</p>;
  }

  if (!user) return <Navigate to="/login" replace />;

  // Google accounts are already verified by Google, so they skip this
  if (!user.emailVerified) return <VerifyEmailPage />;

  return children;
}

export default ProtectedRoute;
