import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AlertProvider } from './context/AlertContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import MobileLayout from './layout/MobileLayout';

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
const TopicDetail = lazy(() => import('./pages/TopicDetail'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-[100dvh] bg-primary-50">
    <div className="w-10 h-10 border-4 border-accent-200 border-t-accent-600 rounded-full animate-spin"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <AlertProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<MobileLayout />}>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/emergency" element={<Emergency />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/topic/:id" element={<TopicDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/alert/:id" element={<AlertDetail />} />
                  <Route path="/create-alert" element={<CreateAlert />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </AlertProvider>
        </LocationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
