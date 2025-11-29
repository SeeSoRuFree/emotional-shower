import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Splash from '@/pages/Splash';
import Intro from '@/pages/Intro';
import Home from '@/pages/Home';
import Community from '@/pages/Community';
import PostDetail from '@/components/community/PostDetail';
import Profile from '@/pages/Profile';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/store/authStore';

// Challenge pages
import DailyRecord from '@/pages/DailyRecord';
import PreSurvey from '@/pages/PreSurvey';
import PostSurvey from '@/pages/PostSurvey';
import Report from '@/pages/Report';

// Application pages
import Signup from '@/pages/Signup';
import Login from '@/pages/Login';
import Apply from '@/pages/Apply';
import Admin from '@/pages/Admin';
import Onboarding from '@/pages/Onboarding';

// Admin pages
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import CohortManagement from '@/pages/admin/CohortManagement';
import ApplicationManagement from '@/pages/admin/ApplicationManagement';
import Statistics from '@/pages/admin/Statistics';

// Error pages
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';
import Waiting from '@/pages/Waiting';

// Admin auth
import { useAdminAuthStore } from '@/store/adminAuthStore';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const { isLoggedIn, checkAuth } = useAuthStore();
  const { isAdminLoggedIn, checkAdminAuth } = useAdminAuthStore();

  useEffect(() => {
    // Check auth status (async)
    const initAuth = async () => {
      await checkAuth();
      checkAdminAuth();

      // For development: Clear onboarding state to test flow
      // COMMENTED OUT FOR PRODUCTION DEPLOYMENT
      // localStorage.removeItem('hasCompletedOnboarding');
      // localStorage.removeItem('isLoggedIn');
      // localStorage.removeItem('loginMethod');
      // localStorage.removeItem('kindness-challenge');
      // localStorage.removeItem('kindness-daily-records');
      // localStorage.removeItem('kindness-surveys');
      // localStorage.removeItem('kindness-users');
      // localStorage.removeItem('kindness-auth');

      // Check if user has completed onboarding
      const completedOnboarding = localStorage.getItem('hasCompletedOnboarding');
      setHasCompletedOnboarding(!!completedOnboarding);
    };

    initAuth();
  }, [checkAuth, checkAdminAuth]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <Splash onComplete={handleSplashComplete} />;
  }

  return (
    <Router>
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        메인 콘텐트로 건너뛰기
      </a>
      
      <div className="min-h-screen bg-background">
        <main id="main-content">
          <Routes>
          {/* 첫 방문자는 항상 Intro부터 시작 */}
          <Route path="/" element={<Navigate to="/intro" />} />

          {/* Public routes - 로그인 불필요 */}
          <Route path="/intro" element={<Intro />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/onboarding" element={isLoggedIn ? <Onboarding /> : <Navigate to="/unauthorized" />} />

          {/* Old Admin (for backward compatibility - will be removed) */}
          <Route path="/admin" element={<Navigate to="/admin/login" />} />

          {/* New Admin Routes */}
          <Route path="/admin/login" element={!isAdminLoggedIn ? <AdminLogin /> : <Navigate to="/admin/dashboard" />} />
          <Route path="/admin/*" element={isAdminLoggedIn ? <AdminLayout /> : <Navigate to="/admin/login" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="cohorts" element={<CohortManagement />} />
            <Route path="applications" element={<ApplicationManagement />} />
            <Route path="statistics" element={<Statistics />} />
            <Route index element={<Navigate to="/admin/dashboard" />} />
          </Route>

          {/* Error/Info pages */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/waiting" element={<Waiting />} />

          {/* Protected routes - require login */}
          <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/unauthorized" />} />
          <Route path="/pre-survey" element={isLoggedIn ? <PreSurvey /> : <Navigate to="/unauthorized" />} />
          <Route path="/daily-record" element={isLoggedIn ? <DailyRecord /> : <Navigate to="/unauthorized" />} />
          <Route path="/post-survey" element={isLoggedIn ? <PostSurvey /> : <Navigate to="/unauthorized" />} />
          <Route path="/report" element={isLoggedIn ? <Report /> : <Navigate to="/unauthorized" />} />
          <Route path="/community" element={isLoggedIn ? <Community /> : <Navigate to="/unauthorized" />} />
          <Route path="/community/:roomId" element={isLoggedIn ? <Community /> : <Navigate to="/unauthorized" />} />
          <Route path="/community/:roomId/:postId" element={isLoggedIn ? <PostDetail /> : <Navigate to="/unauthorized" />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/unauthorized" />} />

          {/* 404 - Catch all */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;