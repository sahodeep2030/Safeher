import { motion } from 'motion/react';
import { Navigation, Map, AlertOctagon, PhoneCall, AlertTriangle, Users, ArrowRight, ShieldCheck, Star, Sparkles, ShieldAlert } from 'lucide-react';
import { Page } from '../types';

interface LandingPageProps {
  onNavigateTo: (page: Page) => void;
  onOpenLoginModal: () => void;
  isLoggedIn: boolean;
}

export default function LandingPage({ onNavigateTo, onOpenLoginModal, isLoggedIn }: LandingPageProps) {
  // 6 Core Features
  const features = [
    {
      title: 'Safe Route Navigation',
      description: 'Calculates routes optimized for safety, illumination, CCTV density, and active police checkpoints rather than just the shortest distance.',
      icon: Navigation,
      badge: 'Smart Engine',
      color: 'bg-violet-50 text-violet-600 border-violet-100',
    },
    {
      title: 'Live Journey Tracking',
      description: 'Shares continuous live coordinates and vehicle status in real-time with chosen trusted contacts who can view your progress on any device.',
      icon: Map,
      badge: 'Real-Time',
      color: 'bg-teal-50 text-teal-600 border-teal-100',
    },
    {
      title: 'Route Deviation Detection',
      description: 'Our proprietary machine learning monitors your vehicle. Instantly flags if a cab or driver diverges from the planned safe route corridor.',
      icon: AlertOctagon,
      badge: 'ML-Powered',
      color: 'bg-rose-50 text-rose-500 border-rose-100',
    },
    {
      title: 'SOS Emergency Response',
      description: 'Trigger a distress signal with one tap. Auto-records ambient audio, sends locations, calls local emergency units, and alerts contacts.',
      icon: PhoneCall,
      badge: '1-Click Distress',
      color: 'bg-red-50 text-red-500 border-red-100',
    },
    {
      title: 'Incident Reporting',
      description: 'Submit reports of harassment, catcalling, dark roads, or unsafe spots. Pin coordinates anonymously to warn other women in the area.',
      icon: AlertTriangle,
      badge: 'Crowdsourced',
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'Community Safety Grid',
      description: 'Access dynamic community-voted safety overlays and localized statistics. Participate in verified hazard cleanups and safety reviews.',
      icon: Users,
      badge: 'Decentralized',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
  ];

  // Visual Statistics
  const stats = [
    { value: '98.4%', label: 'Safe Navigation Index', icon: ShieldCheck, color: 'text-teal-600' },
    { value: '1.2M+', label: 'Protected Trips Shared', icon: Star, color: 'text-violet-600' },
    { value: '15k+', label: 'Verified Safety Volunteers', icon: Users, color: 'text-indigo-600' },
  ];

  // Abstract SVG Phone Map Illustration
  const SmartphoneIllustration = () => (
    <div className="relative flex items-center justify-center w-full max-w-lg mx-auto">
      {/* Decorative backdrop elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-100/60 rounded-full blur-3xl" />
      <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-teal-100/40 rounded-full blur-2xl" />
      
      {/* Smartphone frame */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative w-[280px] h-[540px] bg-slate-900 rounded-[40px] p-3.5 shadow-2xl border-4 border-slate-800 flex flex-col z-10 overflow-hidden"
      >
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-around px-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="w-1 h-1 rounded-full bg-slate-800"></span>
        </div>

        {/* Screen Content Mock */}
        <div className="flex-1 bg-slate-50 rounded-[28px] overflow-hidden flex flex-col relative select-none">
          {/* Mock Status Header */}
          <div className="h-8 bg-white border-b border-slate-100 px-4 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
            <span>12:00 PM</span>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Secure GPS</span>
            </div>
          </div>

          {/* Simulated Map Background */}
          <div className="flex-1 relative bg-slate-100">
            {/* Grid paths */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M 20 80 Q 80 120 120 180 T 220 280 T 260 400" fill="none" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round" />
              <path d="M 40 400 L 150 200 L 250 100" fill="none" stroke="#E2E8F0" strokeWidth="12" strokeLinecap="round" />
              {/* Actual safe path */}
              <path d="M 40 400 Q 110 320 120 250 T 220 110" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
            </svg>

            {/* Pulsing Start pin */}
            <div className="absolute bottom-[100px] left-[32px] w-4 h-4 rounded-full bg-teal-500 border-2 border-white flex items-center justify-center shadow-lg">
              <span className="absolute inset-0 rounded-full bg-teal-500 animate-ping opacity-75"></span>
            </div>

            {/* Custom vehicle marker */}
            <motion.div
              animate={{
                x: [40, 75, 120, 160, 220],
                y: [400, 320, 250, 180, 110],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-5 h-5 rounded-full bg-violet-600 border-2 border-white shadow-md flex items-center justify-center"
            >
              <Navigation className="w-2.5 h-2.5 text-white rotate-45" />
            </motion.div>

            {/* Floating Live Card widget */}
            <div className="absolute top-4 left-3 right-3 bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-sm border border-slate-200/50 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-800 truncate">Cab Sharing Live</p>
                <p className="text-[8px] text-teal-600 font-semibold truncate">Safe Corridor Tracked</p>
              </div>
            </div>

            {/* Quick action button float */}
            <div className="absolute bottom-4 right-4 bg-red-500 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg glow-pulse-red cursor-pointer">
              <span className="text-[9px] font-extrabold uppercase">SOS</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating UI Badges overlapping smartphone */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-12 top-1/4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-100 shadow-xl max-w-[170px] z-20 flex gap-2.5 items-start hidden sm:flex"
      >
        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800">99.8% Perfect</h4>
          <p className="text-[10px] text-slate-500 leading-snug">Lit rating calculated for night walking routes.</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -right-8 bottom-1/3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-100 shadow-xl max-w-[180px] z-20 flex gap-2.5 items-start hidden sm:flex"
      >
        <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800">Deviation Sentinel</h4>
          <p className="text-[10px] text-slate-500 leading-snug">Auto-detects cab route changes instantly.</p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div id="safeher-landing-page" className="w-full">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white py-12 md:py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Content side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-6 text-center lg:text-left"
            >
              {/* Highlight badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-spin" />
                <span>Next-Gen Personal Protection Suite</span>
              </div>

              {/* Large headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                Your Safety, <br />
                <span className="text-violet-600">Every Step</span> of the Journey.
              </h1>

              {/* Short description */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Navigate safer routes verified by active community surveillance, receive emergency assistance instantly with automated route deviation alerts, and stay securely connected to those who care.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => onNavigateTo('safe-route')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer group"
                >
                  Start Safe Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('features-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-8 py-3.5 rounded-xl transition cursor-pointer"
                >
                  Learn More
                </button>
              </div>

              {/* Stats Bar */}
              <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-4 text-left max-w-md mx-auto lg:mx-0">
                {stats.map((s, index) => {
                  const Icon = s.icon;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Icon className={`w-4 h-4 ${s.color}`} />
                        <span className="text-base sm:text-lg font-bold text-slate-800">{s.value}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Illustration side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="relative w-full"
            >
              <SmartphoneIllustration />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="features-section" className="py-16 md:py-24 bg-slate-50/50 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
            <span className="text-xs font-bold text-violet-600 uppercase tracking-widest bg-violet-50 px-3.5 py-1.5 rounded-full border border-violet-100">
              Advanced Protection Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              A comprehensive safety shield designed for reality.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              We focus on responsive interfaces, proactive warnings, and real human grids to assist you wherever and whenever you travel.
            </p>
          </div>

          {/* Six Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Icon container */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl border ${feat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{feat.description}</p>
                  </div>

                  {/* Interactive footer action */}
                  <div className="pt-5 mt-5 border-t border-slate-100/80 flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (feat.title.includes('Route')) onNavigateTo('safe-route');
                        else if (feat.title.includes('SOS')) onNavigateTo('emergency');
                        else if (feat.title.includes('Report')) onNavigateTo('report');
                        else if (feat.title.includes('Community')) onNavigateTo('community');
                        else onNavigateTo('safe-route');
                      }}
                      className="text-xs font-semibold text-violet-600 hover:text-violet-700 inline-flex items-center gap-1 group cursor-pointer"
                    >
                      Access Feature
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. PROACTIVE TRUST BANNER */}
      <section className="bg-slate-900 text-white py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Need immediate response or police support?</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              SafeHer is instantly available. Call our designated safety dispatch team or toggle our silent SOS button.
            </p>
          </div>
          <button
            onClick={() => onNavigateTo('emergency')}
            className="w-full md:w-auto bg-rose-500 hover:bg-rose-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-rose-900/30 glow-pulse-red transition cursor-pointer"
          >
            Access Emergency Hub
          </button>
        </div>
      </section>
    </div>
  );
}
