import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import TrackerPage from "./pages/Tracker";
import { AuthProvider } from "./context/AuthContext";
import { isFirebaseConfigured } from "./firebase";
import { cardClass } from "./constants/styles";

function App() {
  // Show setup instructions if .env is missing (Firebase would crash otherwise)
  if (!isFirebaseConfigured) return <SetupNotice />;

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="mx-auto max-w-5xl px-4 py-8">
          <Header />

          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <TrackerPage />
                </ProtectedRoute>
              }
            />
            {/* unknown URL → home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

function SetupNotice() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className={cardClass}>
        <h1 className="text-lg font-bold">🔧 Firebase setup required</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Create a <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.env</code>{" "}
          file in the project root (see <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">.env.example</code>), add your Firebase keys, then restart <code>npm run dev</code>.
        </p>
      </div>
    </div>
  );
}

export default App;
