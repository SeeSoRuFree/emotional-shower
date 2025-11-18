import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Splash from '@/pages/Splash';
import Onboarding from '@/pages/Onboarding';
import Home from '@/pages/Home';
import Community from '@/pages/Community';
import PostDetail from '@/components/community/PostDetail';
import Profile from '@/pages/Profile';
import { Toaster } from '@/components/ui/toaster';
import { useChallengeStore } from '@/store/challengeStore';

// Challenge pages
import DailyRecord from '@/pages/DailyRecord';
import PreSurvey from '@/pages/PreSurvey';
import PostSurvey from '@/pages/PostSurvey';
import Report from '@/pages/Report';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const initializeCohort = useChallengeStore(state => state.initializeCohort);

  useEffect(() => {
    // Initialize current cohort on app start
    initializeCohort();

    // For development: Clear onboarding state to test flow
    // COMMENTED OUT FOR PRODUCTION DEPLOYMENT
    // localStorage.removeItem('hasCompletedOnboarding');
    // localStorage.removeItem('isLoggedIn');
    // localStorage.removeItem('loginMethod');
    // localStorage.removeItem('kindness-challenge');
    // localStorage.removeItem('kindness-daily-records');
    // localStorage.removeItem('kindness-surveys');

    // Check if user has completed onboarding
    const completedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    setHasCompletedOnboarding(!!completedOnboarding);
  }, [initializeCohort]);

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
          <Route
            path="/"
            element={hasCompletedOnboarding ? <Navigate to="/home" /> : <Navigate to="/onboarding" />}
          />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<Home />} />
          <Route path="/pre-survey" element={<PreSurvey />} />
          <Route path="/daily-record" element={<DailyRecord />} />
          <Route path="/post-survey" element={<PostSurvey />} />
          <Route path="/report" element={<Report />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/:roomId" element={<Community />} />
          <Route path="/community/:roomId/:postId" element={<PostDetail />} />
          <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;