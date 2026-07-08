import React, { useState } from 'react';
import { Shield, Menu, X, Home, Navigation, AlertTriangle, FileText, Users, User, LogIn, Heart } from 'lucide-react';
import { Page } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onOpenLoginModal: () => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

interface NavItem {
  id: Page;
  label: string;
  icon: React.ComponentType<any>;
  highlight?: boolean;
}

export default function Navbar({ currentPage, setCurrentPage, onOpenLoginModal, isLoggedIn, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'safe-route', label: 'Safe Route', icon: Navigation },
    { id: 'emergency', label: 'Emergency SOS', icon: AlertTriangle, highlight: true },
    { id: 'report', label: 'Report Incident', icon: FileText },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header id="safeher-sticky-navbar" className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-sm shadow-violet-200">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Safe<span className="text-violet-600">Her</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-teal-600 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                Secured
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? item.highlight
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                        : 'bg-violet-50 text-violet-600'
                      : item.highlight
                      ? 'text-rose-500 hover:bg-rose-50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive && !item.highlight ? 'text-violet-600' : ''}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Login/Signup or User Status */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleNavClick('profile')}
                >
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border-2 border-violet-200 object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-700">Aria Sharma</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 transition px-2.5 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Login / Signup
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {currentPage !== 'emergency' && (
              <button
                onClick={() => handleNavClick('emergency')}
                className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 glow-pulse-red cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                SOS
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Slide-out overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-40 w-80 max-w-[85vw] bg-white p-6 shadow-2xl md:hidden flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <span className="text-lg font-bold text-slate-900">Navigation Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition cursor-pointer ${
                          isActive
                            ? item.highlight
                              ? 'bg-rose-500 text-white'
                              : 'bg-violet-50 text-violet-600'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-4">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <img
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border-2 border-violet-100 object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">Aria Sharma</p>
                        <p className="text-[10px] text-teal-600">Security Active</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onOpenLoginModal();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-semibold shadow-sm cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    Login / Signup
                  </button>
                )}

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <span>SafeHer is with you</span>
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
