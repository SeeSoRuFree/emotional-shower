import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  ClipboardList,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { useAdminAuthStore } from '@/store/adminAuthStore';

const menuItems = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'users', label: '사용자 관리', icon: Users, path: '/admin/users' },
  { id: 'cohorts', label: '기수 관리', icon: Calendar, path: '/admin/cohorts' },
  { id: 'applications', label: '신청 관리', icon: FileText, path: '/admin/applications' },
  { id: 'surveys', label: '설문 관리', icon: ClipboardList, path: '/admin/surveys' },
  { id: 'records', label: '기록 관리', icon: BookOpen, path: '/admin/records' },
  { id: 'community', label: '커뮤니티', icon: MessageSquare, path: '/admin/community' },
  { id: 'statistics', label: '통계', icon: BarChart3, path: '/admin/statistics' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogout, adminEmail } = useAdminAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      adminLogout();
      navigate('/admin/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-slate-200 fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">정서샤워</h1>
              <p className="text-xs text-slate-500">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-4 border-t border-slate-200">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-slate-500">관리자</p>
            <p className="text-sm font-medium text-slate-900 truncate">{adminEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`md:hidden fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">정서샤워</span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User & Logout - Mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs text-slate-500">관리자</p>
            <p className="text-sm font-medium text-slate-900 truncate">{adminEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>

            {/* Page Title */}
            <h2 className="text-lg md:text-xl font-bold text-slate-900">
              {menuItems.find((item) => isActive(item.path))?.label || '관리자 대시보드'}
            </h2>

            {/* Desktop User Info */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-700">
                  {adminEmail?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
