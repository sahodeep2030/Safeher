import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Home, Navigation, AlertTriangle, FileText, Users, User, X, LogIn, Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import { Page, RouteInfo, IncidentReport } from './types';

// Page imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import SafeRoutePage from './components/SafeRoutePage';
import LiveMonitoringPage from './components/LiveMonitoringPage';
import EmergencyPage from './components/EmergencyPage';
import IncidentReportingPage from './components/IncidentReportingPage';
import CommunityPage from './components/CommunityPage';
import ProfilePage from './components/ProfilePage';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warn';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Logged in by default with mock profile
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null);
  const [customReports, setCustomReports] = useState<IncidentReport[]>([]);

  // Toast System State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Authentication Fields state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Floating Notification Toast Dispatcher
  const handleToast = (message: string, type: 'info' | 'success' | 'warn') => {
    const newToast: Toast = {
      id: Math.random().toString(),
      message,
      type
    };
    setToasts((prev) => [...prev, newToast]);
  };

  // Auto clean-up toasts
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Handle route navigation click
  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Launch Active Journey from Safe Route Finder
  const handleStartJourney = (route: RouteInfo) => {
    setActiveRoute(route);
    handlePageChange('live-trip');
    handleToast(`Tracking initiated for ${route.name}!`, 'success');
  };

  // Submit new incident from reporter form
  const handleAddIncidentReport = (reportData: any) => {
    const formattedReport: IncidentReport = {
      id: `custom-${Math.random().toString()}`,
      type: reportData.type,
      description: reportData.description,
      dateTime: 'Reported just now',
      locationName: reportData.locationName,
      coordinates: reportData.coordinates,
      isAnonymous: reportData.isAnonymous,
      status: 'pending',
      reporter: reportData.isAnonymous ? 'Anonymous Member' : 'Aria Sharma',
      upvotes: 1
    };

    setCustomReports((prev) => [formattedReport, ...prev]);
    handlePageChange('community');
  };

  // Mock Login Action
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      handleToast('Please fill out all credentials', 'warn');
      return;
    }

    setIsLoggedIn(true);
    setLoginModalOpen(false);
    handleToast('Welcome back, Aria Sharma! Security Sentinel Active.', 'success');
  };

  const handleLogoutAction = () => {
    setIsLoggedIn(false);
    handleToast('Logged out of SafeHer session.', 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative pb-16 md:pb-0">
      
      {/* 1. Header Navigation */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogoutAction}
      />

      {/* 2. Main SPA Render Router with Framer Motion slide-up */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {currentPage === 'home' && (
              <LandingPage
                onNavigateTo={handlePageChange}
                onOpenLoginModal={() => setLoginModalOpen(true)}
                isLoggedIn={isLoggedIn}
              />
            )}

            {currentPage === 'safe-route' && (
              <SafeRoutePage
                onStartJourney={handleStartJourney}
                onToast={handleToast}
              />
            )}

            {currentPage === 'live-trip' && (
              <LiveMonitoringPage
                activeRoute={activeRoute}
                onToast={handleToast}
                onNavigateTo={handlePageChange}
              />
            )}

            {currentPage === 'emergency' && (
              <EmergencyPage
                onToast={handleToast}
              />
            )}

            {currentPage === 'report' && (
              <IncidentReportingPage
                onToast={handleToast}
                onSubmitReport={handleAddIncidentReport}
              />
            )}

            {currentPage === 'community' && (
              <CommunityPage
                onToast={handleToast}
                customReports={customReports}
              />
            )}

            {currentPage === 'profile' && (
              <ProfilePage
                onToast={handleToast}
                onNavigateTo={handlePageChange}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 3. Footer */}
      <Footer onNavTo={handlePageChange} />

      {/* 4. Mobile Bottom Navigation Bar (WCAG Touch Targets >=44px) */}
      <nav id="safeher-mobile-bottom-bar" className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 flex md:hidden items-center justify-around h-16 px-2">
        <button
          onClick={() => handlePageChange('home')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${
            currentPage === 'home' ? 'text-violet-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 font-bold">Home</span>
        </button>

        <button
          onClick={() => handlePageChange('safe-route')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${
            currentPage === 'safe-route' ? 'text-violet-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 font-bold">Route</span>
        </button>

        {/* Centralized High Priority SOS circle on mobile bottom bar */}
        <button
          onClick={() => handlePageChange('emergency')}
          className="flex flex-col items-center justify-center w-14 h-14 bg-rose-500 text-white rounded-full -translate-y-4 shadow-lg shadow-rose-300 border-4 border-white glow-pulse-red transition cursor-pointer"
        >
          <span className="text-[10px] font-extrabold uppercase">SOS</span>
        </button>

        <button
          onClick={() => handlePageChange('report')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${
            currentPage === 'report' ? 'text-violet-600 font-bold' : 'text-slate-500'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 font-bold">Report</span>
        </button>

        <button
          onClick={() => handlePageChange('community')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${
            currentPage === 'community' ? 'text-violet-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 font-bold">Grid</span>
        </button>
      </nav>

      {/* 5. Login/Signup Modal popup */}
      <AnimatePresence>
        {loginModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setLoginModalOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="fixed inset-x-4 top-[15%] md:top-[25%] mx-auto z-50 max-w-sm bg-white rounded-3xl border border-slate-100 shadow-2xl p-6"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-1.5 text-slate-800">
                  <Shield className="w-5 h-5 text-violet-600" />
                  <span className="text-sm font-bold">Sign In to SafeHer Hub</span>
                </div>
                <button
                  onClick={() => setLoginModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="aria@safeher-grid.org"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  Confirm Sign In
                </button>
              </form>

              <div className="pt-4 mt-4 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-medium">
                  Don't have an encrypted key? <a href="#" onClick={(e) => { e.preventDefault(); handleToast('Demo account: Enter any email/password to sign in.', 'info'); }} className="text-violet-600 font-bold underline">Create Credentials</a>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 6. Dynamic Self-Cleaning Toast System */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-3.5 rounded-2xl shadow-lg border text-xs font-semibold flex items-start gap-2.5 pointer-events-auto glass-panel ${
                toast.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50/90 text-emerald-900'
                  : toast.type === 'warn'
                  ? 'border-rose-200 bg-rose-50/90 text-rose-900'
                  : 'border-violet-100 bg-violet-50/90 text-violet-900'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {toast.type === 'warn' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
              {toast.type === 'info' && <Shield className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />}
              
              <div className="flex-1">
                <p className="leading-snug">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
