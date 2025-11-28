import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarCheck, Users, User, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

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
                  onClick={() => navigate(item.path)}
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
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
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
    </header>
  );
}