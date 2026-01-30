import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AlertProvider } from './context/AlertContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import MobileLayout from './layout/MobileLayout';

import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load components
const Welcome = lazy(() => import('./pages/Welcome'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Home = lazy(() => import('./pages/Home'));
const CreateAlert = lazy(() => import('./pages/CreateAlert'));
const Feed = lazy(() => import('./pages/Feed'));
const AlertDetail = lazy(() => import('./pages/AlertDetail'));
const Emergency = lazy(() => import('./pages/Emergency'));
const Community = lazy(() => import('./pages/Community'));
const Profile = lazy(() => import('./pages/Profile'));
const MyAccount = lazy(() => import('./pages/MyAccount'));
const Support = lazy(() => import('./pages/Support'));
const TopicDetail = lazy(() => import('./pages/TopicDetail'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-[100dvh] bg-primary-50">
    <div className="w-10 h-10 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to home if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <LocationProvider>
          <AlertProvider>
            <Router>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route element={<MobileLayout />}>
                      {/* Public Routes */}
                      <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
                      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                      <Route path="/onboarding" element={<Onboarding />} />

                      {/* Private Routes */}
                      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                      <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                      <Route path="/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
                      <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                      <Route path="/topic/:id" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/my-account" element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
                      <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                      <Route path="/alert/:id" element={<ProtectedRoute><AlertDetail /></ProtectedRoute>} />
                      <Route path="/create-alert" element={<ProtectedRoute><CreateAlert /></ProtectedRoute>} />

                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </Router>
          </AlertProvider>
        </LocationProvider>
      </AuthProvider>
    </NotificationProvider>
  )
}

export default App
