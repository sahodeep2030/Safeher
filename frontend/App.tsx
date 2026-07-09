import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Home, Navigation, AlertTriangle, FileText, Users, User, X, LogIn, Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import { Page, RouteInfo, IncidentReport } from './types';
// Firebase imports
import { auth, db, isConfigured, seedInitialData } from './services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { collection, onSnapshot, query, addDoc } from 'firebase/firestore';

// Hook imports
import { useGeolocation } from './hooks/useGeolocation';
import { useRiskDetection } from './hooks/useRiskDetection';
import { useEmergency } from './context/EmergencyContext';

// Component imports
import AuthForm from './components/AuthForm';
import WarningModal from './components/WarningModal';
import VoiceAssistant from './components/VoiceAssistant';

// Page imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import SafeRoutePage from './pages/SafeRoutePage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import EmergencyPage from './pages/EmergencyPage';
import IncidentReportingPage from './pages/IncidentReportingPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warn';
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string | null; displayName: string | null } | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState<RouteInfo | null>(null);
  const [customReports, setCustomReports] = useState<IncidentReport[]>([]);

  // Safety & AI Assistant hooks
  const { location, error: geoError, isTracking, startTracking, stopTracking, setLocation } = useGeolocation();
  const { safetyLevel, riskScore, triggerWarning, cancelWarning, triggerEmergency } = useEmergency();

  const { warningCountdown, isDeviated, setIsDeviated } = useRiskDetection({
    latitude: location ? location.latitude : null,
    longitude: location ? location.longitude : null,
    speed: location ? location.speed : null,
    isSimulatedDev: false,
    isActive: isTracking,
  });

  // Escalate UI Page dynamically to Emergency cockpit during SOS Mode
  useEffect(() => {
    if (safetyLevel === 'emergency') {
      setCurrentPage('emergency');
    }
  }, [safetyLevel]);

  // Seed initial data if Firebase is configured
  useEffect(() => {
    if (isConfigured && db) {
      seedInitialData();
    }
  }, []);

  // Listen to Firestore real-time updates for incidents
  useEffect(() => {
    if (isConfigured && db) {
      const q = query(collection(db, 'incidents'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reportsList: IncidentReport[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          reportsList.push({
            id: doc.id,
            type: data.type,
            description: data.description,
            dateTime: data.dateTime,
            locationName: data.locationName,
            coordinates: data.coordinates,
            isAnonymous: data.isAnonymous,
            status: data.status,
            reporter: data.reporter,
            upvotes: data.upvotes || 0,
          });
        });
        setCustomReports(reportsList);
      }, (error) => {
        console.error("Firestore onSnapshot error:", error);
      });
      return () => unsubscribe();
    }
  }, []);

  // Listen to Firebase Auth state change
  useEffect(() => {
    if (isConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsLoggedIn(true);
          setCurrentUser({
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
          });
        } else {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Toast System State
  const [toasts, setToasts] = useState<Toast[]>([]);

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
    startTracking();
    handlePageChange('live-trip');
    handleToast(`Tracking initiated for ${route.name}!`, 'success');
  };

  // Submit new incident from reporter form
  const handleAddIncidentReport = async (reportData: any) => {
    const formattedReport: Omit<IncidentReport, 'id'> = {
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

    if (isConfigured && db) {
      try {
        await addDoc(collection(db, 'incidents'), formattedReport);
        handleToast('Safety report filed on Firebase Firestore!', 'success');
      } catch (error: any) {
        console.error(error);
        handleToast(`Failed to save to Firebase: ${error.message}`, 'warn');
      }
    } else {
      // Fallback local memory state
      const localReport: IncidentReport = {
        id: `custom-${Math.random().toString()}`,
        ...formattedReport
      };
      setCustomReports((prev) => [localReport, ...prev]);
      handleToast('Safety report filed (Local mockup mode)', 'success');
    }
    handlePageChange('community');
  };

  const handleAuthSubmit = async (
    mode: 'login' | 'signup' | 'forgot',
    data: { email: string; password?: string; displayName?: string }
  ) => {
    const { email, password, displayName } = data;
    if (mode !== 'forgot' && !password) return;

    if (mode === 'forgot') {
      try {
        if (isConfigured && auth) {
          await sendPasswordResetEmail(auth, email);
          handleToast('Security link sent! Check your inbox to reset password.', 'success');
        } else {
          handleToast(`Simulated reset link sent to ${email} (Mock Mode Active)!`, 'success');
        }
      } catch (err: any) {
        throw new Error(err.message || 'Failed to send password reset email.');
      }
      return;
    }

    if (isConfigured && auth) {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
        setCurrentUser({
          email: userCredential.user.email,
          displayName: displayName || userCredential.user.email?.split('@')[0] || 'User',
        });
        setIsLoggedIn(true);
        setLoginModalOpen(false);
        handleToast('Account registered and logged in successfully!', 'success');
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setCurrentUser({
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User',
        });
        setIsLoggedIn(true);
        setLoginModalOpen(false);
        handleToast('Welcome back! Firebase Session Active.', 'success');
      }
    } else {
      // Mock mode fallback
      if (mode === 'signup') {
        setIsLoggedIn(true);
        setCurrentUser({
          email,
          displayName: displayName || email.split('@')[0],
        });
        setLoginModalOpen(false);
        handleToast(`Account registered (Mock Mode Active)! Welcome, ${displayName || email.split('@')[0]}.`, 'success');
      } else {
        setIsLoggedIn(true);
        setCurrentUser({
          email,
          displayName: displayName || email.split('@')[0] || 'Aria Sharma',
        });
        setLoginModalOpen(false);
        handleToast('Welcome back! (Mock Session Active)', 'success');
      }
    }
  };

  const handleLogoutAction = async () => {
    if (isConfigured && auth) {
      try {
        await signOut(auth);
        handleToast('Logged out of Firebase session.', 'info');
      } catch (error: any) {
        handleToast(`Logout failed: ${error.message}`, 'warn');
      }
    } else {
      setIsLoggedIn(false);
      setCurrentUser(null);
      handleToast('Logged out of SafeHer session.', 'info');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative pb-16 md:pb-0">

      {/* Voice Assistant Speech Engine Utility */}
      <VoiceAssistant />

      {/* Warning Overlay Modal for level 2 Alerts */}
      {safetyLevel === 'warning' && warningCountdown !== null && (
        <WarningModal
          countdown={warningCountdown}
          onConfirmSafe={cancelWarning}
          onTriggerEmergency={() => {
            triggerEmergency(
              'User pressed NEED HELP',
              location?.latitude || 0,
              location?.longitude || 0,
              100, // mock battery
              location?.speed || 0
            );
          }}
        />
      )}

      {/* 1. Header Navigation */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        onOpenLoginModal={() => setLoginModalOpen(true)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogoutAction}
        currentUser={currentUser}
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
            {!isLoggedIn && currentPage !== 'home' ? (
              <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-full max-w-md space-y-4">
                  <div className="p-4 bg-violet-50 text-violet-800 rounded-3xl border border-violet-100 text-center text-xs font-semibold">
                    🔑 Access Required: Please sign in or create an account to use this SafeHer feature.
                  </div>
                  <AuthForm
                    onSubmit={handleAuthSubmit}
                    isMockMode={!isConfigured}
                  />
                </div>
              </div>
            ) : (
              <>
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
                    userLocation={location}
                  />
                )}

                {currentPage === 'live-trip' && (
                  <LiveMonitoringPage
                    activeRoute={activeRoute}
                    onToast={handleToast}
                    onNavigateTo={handlePageChange}
                    userLocation={location}
                    isTracking={isTracking}
                    stopTracking={stopTracking}
                  />
                )}

                {currentPage === 'emergency' && (
                  <EmergencyPage
                    onToast={handleToast}
                    currentUser={currentUser}
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
                    isDbActive={isConfigured}
                  />
                )}

                {currentPage === 'profile' && (
                  <ProfilePage
                    onToast={handleToast}
                    onNavigateTo={handlePageChange}
                    currentUser={currentUser}
                  />
                )}
              </>
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
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${currentPage === 'home' ? 'text-violet-600 font-bold' : 'text-slate-500'
            }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 font-bold">Home</span>
        </button>

        <button
          onClick={() => handlePageChange('safe-route')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${currentPage === 'safe-route' ? 'text-violet-600 font-bold' : 'text-slate-500'
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
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${currentPage === 'report' ? 'text-violet-600 font-bold' : 'text-slate-500'
            }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[9px] mt-0.5 font-bold">Report</span>
        </button>

        <button
          onClick={() => handlePageChange('community')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition cursor-pointer ${currentPage === 'community' ? 'text-violet-600 font-bold' : 'text-slate-500'
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
              className="fixed inset-x-4 top-[15%] md:top-[20%] mx-auto z-50 max-w-md"
            >
              <AuthForm
                onSubmit={handleAuthSubmit}
                onClose={() => setLoginModalOpen(false)}
                isMockMode={!isConfigured}
              />
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
              className={`p-3.5 rounded-2xl shadow-lg border text-xs font-semibold flex items-start gap-2.5 pointer-events-auto glass-panel ${toast.type === 'success'
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
