import { Navigate } from 'react-router-dom';
import BottomNav from './BottomNav';

/**
 * ProtectedRoute — offline-safe route guard.
 *
 * Reads `userToken` from localStorage on every render (NOT from React state)
 * so that the session survives hard refreshes and network dead zones.
 * Never makes any network calls — pure local-storage check only.
 *
 * Also preserves the BottomNav that the original App.jsx ProtectedRoute rendered,
 * so protected views retain their navigation chrome.
 */
export function ProtectedRoute({ children }) {
  // Always read from localStorage directly — do NOT cache in state.
  // This is intentional: state would be lost on hard refresh, localStorage is not.
  const token = localStorage.getItem('userToken');

  if (!token) {
    // No token → redirect to root (onboarding/login) regardless of online status.
    return <Navigate to="/" replace />;
  }

  // Token present → render the protected content unconditionally.
  // navigator.onLine is intentionally NOT checked here — offline users with a
  // valid cached token must be able to navigate freely.
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}

export default ProtectedRoute;
