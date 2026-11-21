import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Menu, Plus, Sparkles } from 'lucide-react';
import { SearchBar } from '../common/SearchBar';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onOpenSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Derive current page title from pathname
  const getPageDetails = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'Dashboard', subtitle: 'Overview & daily focus' };
      case '/tasks':
        return { title: 'My Tasks', subtitle: 'Task management & tracking' };
      case '/ai-task-creation':
        return { title: 'Quick Task Entry', subtitle: 'Add coursework, research, and deadlines' };
      case '/smart-scheduler':
        return { title: 'Smart Scheduler', subtitle: 'Plan focused work around your deadlines' };
      case '/calendar':
        return { title: 'Calendar', subtitle: 'Deadlines & scheduled blocks' };
      case '/focus-mode':
        return { title: 'Focus Mode', subtitle: 'Pomodoro timer & deep work' };
      case '/goals':
        return { title: 'Goals', subtitle: 'Long-term milestones & tracking' };
      case '/analytics':
        return { title: 'Analytics', subtitle: 'Performance & productivity trends' };
      case '/ai-assistant':
        return { title: 'Optional AI Assistant', subtitle: 'Ask questions about your tasks' };
      case '/settings':
        return { title: 'Settings', subtitle: 'Preferences & integrations' };
      default:
        return { title: 'SmartTask AI', subtitle: 'Graduate student scheduling' };
    }
  };

  const page = getPageDetails();

  const handleSearchSubmit = (val) => {
    setSearchQuery(val);
    if (val.trim() && location.pathname !== '/tasks') {
      navigate(`/tasks?q=${encodeURIComponent(val)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-50"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-semibold text-gray-900 leading-tight">
            {page.title}
          </h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            {page.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchSubmit}
          placeholder="Search anything (tasks, schedules, goals)..."
        />
      </div>

      {/* Right: Quick Action, Notifications, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick task entry */}
        <button
          onClick={() => navigate('/ai-task-creation')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Add</span>
        </button>

        {/* Notification Icon */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>
          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
          />
        </div>

        {/* User Avatar */}
        <div 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 pl-2 border-l border-gray-200 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AM'}
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="text-xs text-gray-500 hover:text-blue-600" title="Sign out">
          Sign out
        </button>
      </div>
    </header>
  );
};
