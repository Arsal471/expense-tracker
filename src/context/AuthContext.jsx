import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

// 🪪 AuthContext tells the whole app who is logged in
const AuthContext = createContext();

// After clicking the verification link, Firebase shows a "Continue" button back to our app.
// (The domain must be listed under Firebase → Authentication → Settings → Authorized domains.)
async function sendVerification(user) {
  try {
    await sendEmailVerification(user, { url: window.location.origin + "/" });
  } catch (err) {
    // Domain not authorized yet? Still send the email, just without the "Continue" button.
    if (err.code === "auth/unauthorized-continue-uri" || err.code === "auth/invalid-continue-uri") {
      await sendEmailVerification(user);
    } else {
      throw err;
    }
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = nobody logged in
  const [loading, setLoading] = useState(true); // true while Firebase checks the session
  // Firebase updates the same user object in place (e.g. after reload()),
  // so we bump this counter to tell React "something changed, re-render".
  const [, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);

  useEffect(() => {
    // Firebase notifies us on every login/logout (and remembers the session across refreshes)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // 🧹 cleanup: stop listening
  }, []);

  async function signup(name, email, password) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await sendVerification(result.user); // 📧 verification email
    refresh(); // show the name immediately
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  function resendVerification() {
    return sendVerification(auth.currentUser);
  }

  // Ask Firebase for the latest user info (has the email been verified yet?)
  async function reloadUser() {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    refresh();
    return auth.currentUser.emailVerified;
  }

  function logout() {
    return signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        loginWithGoogle,
        resetPassword,
        resendVerification,
        reloadUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
