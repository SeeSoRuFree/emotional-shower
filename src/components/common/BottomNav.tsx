import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, User, Heart, CalendarCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-headspace-border z-50">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
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
  );
}