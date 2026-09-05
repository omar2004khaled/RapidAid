import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Radio, BarChart3, Wrench, Siren, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import Notification from './Notification';

export default function Navbar() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const displayName = user?.fullName || user?.name || user?.username || user?.sub || 'Operator';
  const displayEmail = user?.email || (user?.sub && user.sub.includes('@') ? user.sub : 'Authorized User');
  const initial = displayName.charAt(0).toUpperCase();

  const navItems = [
    { to: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
    { to: '/dispatcher', label: 'Dispatch Board', icon: Radio },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/debug', label: 'Diagnostics', icon: Wrench },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#BDD2B6] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#798777] flex items-center justify-center text-white shadow-md shadow-[#798777]/25 group-hover:scale-105 transition-transform">
                <Siren className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg leading-tight tracking-tight text-[#283227]">
                  Rapid<span className="text-[#798777]">Aid</span>
                </span>
                <span className="text-[10px] font-semibold text-[#5B6859] tracking-wider uppercase">
                  Emergency Command
                </span>
              </div>
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#BDD2B6]/40 text-[#283227] border border-[#A2B29F] shadow-sm font-bold'
                          : 'text-[#5B6859] hover:text-[#283227] hover:bg-[#F8EDE3]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Notification Component */}
            <Notification />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#F8EDE3] border border-transparent hover:border-[#BDD2B6] transition-colors"
                aria-label="User profile menu"
              >
                <div className="w-8 h-8 rounded-lg bg-[#798777] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {initial}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#283227] leading-none">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-[#5B6859] leading-none mt-0.5">
                    {user?.role || 'Dispatcher'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#5B6859] hidden lg:block" />
              </button>

              {showProfile && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-[#BDD2B6] z-50 overflow-hidden animate-fadeIn">
                  <div className="p-4 border-b border-[#BDD2B6] bg-[#F8EDE3]/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#798777] text-white font-bold text-sm flex items-center justify-center shadow-sm">
                        {initial}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-[#283227] truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-[#5B6859] truncate">
                          {displayEmail}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
