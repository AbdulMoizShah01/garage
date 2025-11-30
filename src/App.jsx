import "./App.css";
import AppLayout from "./AppLayout";     // this is fine; it will pick AppLayout.jsx
import { Route, Routes, Navigate } from "react-router-dom";
import { routes } from "./routes";
import Login from "./pages/auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useState } from "react";
import firebaseSDK from "./firebase/firebase.config";

const AuthRedirect = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseSDK.auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const routesToRender = routes?.userRoutes || [];

  return (
    <div>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {routesToRender.map((route) => {
            let Component = route?.Component;
            return (
              <Route
                key={route?.path}
                path={route?.path}
                element={<Component />}
              />
            );
          })}

          <Route path="*" element={<div>Not found</div>} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
