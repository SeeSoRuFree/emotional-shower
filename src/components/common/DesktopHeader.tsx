import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarCheck, Users, User, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useChallengeStore } from '@/store/challengeStore';
import { useAuthStore } from '@/store/authStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Updated navigation items for 30-day challenge (same as BottomNav)
const navItems = [
  { path: '/home', icon: Home, label: '홈' },
  { path: '/daily-record', icon: CalendarCheck, label: '오늘기록' },
  { path: '/community', icon: Users, label: '커뮤니티' },
  { path: '/profile', icon: User, label: '프로필' },
];

export default function DesktopHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPreSurveyDialog, setShowPreSurveyDialog] = useState(false);

  const { currentUser } = useAuthStore();
  const { getCurrentChallenge, calculateCurrentDay } = useChallengeStore();
  const cohortId = currentUser?.currentCohortId;

  const handleNavigation = (path: string) => {
    // "오늘기록" 버튼 클릭 시 DAY 1 설문 체크
    if (path === '/daily-record' && cohortId) {
      const challenge = getCurrentChallenge(cohortId);
      const currentDay = calculateCurrentDay(cohortId);

      // approved 상태이고 DAY 1인 경우 설문 안내 팝업 표시
      if (challenge?.status === 'approved' && currentDay === 1) {
        setShowPreSurveyDialog(true);
        setIsMobileMenuOpen(false);
        return;
      }
    }

    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="hidden md:block fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-headspace-border z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => navigate('/home')}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-cloud-blue rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">☁️</span>
            </div>
            <h1 className="text-xl font-bold text-cloud-text">정서샤워</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-headspace-pastel-blue text-headspace-blue' 
                      : 'text-headspace-textMuted hover:text-headspace-darkGray hover:bg-gray-50'
                  }`}
                >
                  <Icon 
                    className="w-5 h-5" 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-headspace-yellow rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">😊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Toggle (for tablet sizes) */}
      <div className="md:hidden absolute right-4 top-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg text-headspace-textMuted hover:text-headspace-darkGray"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white border-t border-headspace-border"
        >
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    isActive 
                      ? 'bg-headspace-pastel-blue text-headspace-blue' 
                      : 'text-headspace-textMuted hover:text-headspace-darkGray hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* DAY 1 설문 안내 Dialog */}
      <Dialog open={showPreSurveyDialog} onOpenChange={setShowPreSurveyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">🌱 DAY 1 설문을 먼저 완료해주세요</DialogTitle>
            <DialogDescription className="text-center pt-2">
              챌린지를 시작하려면 먼저 사전 설문을 완료해야 해요.
              <br />
              설문은 약 5분 정도 소요됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreSurveyDialog(false)}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={() => {
                setShowPreSurveyDialog(false);
                navigate('/pre-survey');
              }}
              className="flex-1 bg-gradient-to-r from-headspace-blue to-headspace-purple"
            >
              설문 시작하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}