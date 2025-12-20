import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, User, CalendarCheck } from 'lucide-react';
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

// Updated navigation items for 30-day challenge
const navItems = [
  { path: '/home', icon: Home, label: '홈' },
  { path: '/daily-record', icon: CalendarCheck, label: '오늘기록' },
  { path: '/community', icon: Users, label: '커뮤니티' },
  { path: '/profile', icon: User, label: '프로필' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
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
        return;
      }
    }

    navigate(path);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-headspace-border z-50">
        <div className="flex justify-around items-center h-20 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex flex-col items-center justify-center flex-1 h-full group"
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute top-3 w-12 h-12 bg-headspace-pastel-blue rounded-2xl"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon */}
                <div className="relative z-10">
                  <Icon
                    className={`w-6 h-6 mb-1 transition-colors ${
                      isActive
                        ? 'text-headspace-blue'
                        : 'text-headspace-textMuted group-hover:text-headspace-darkGray'
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>

                {/* Label */}
                <span className={`text-xs relative z-10 transition-colors ${
                  isActive
                    ? 'text-headspace-blue font-semibold'
                    : 'text-headspace-textMuted group-hover:text-headspace-darkGray'
                }`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

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
    </>
  );
}
