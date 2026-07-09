import { Shield, Mail, Phone, MapPin, Heart, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  onNavTo: (page: 'home' | 'safe-route' | 'emergency' | 'report' | 'community' | 'profile') => void;
}

export default function Footer({ onNavTo }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="safeher-footer" className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Safe<span className="text-violet-400">Her</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering women with real-time safety routing, live tracking, route deviation detection, and emergency support.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-violet-600 hover:text-white transition text-slate-400">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-violet-600 hover:text-white transition text-slate-400">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-violet-600 hover:text-white transition text-slate-400">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-violet-600 hover:text-white transition text-slate-400">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Features</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavTo('safe-route')} className="hover:text-violet-400 transition cursor-pointer text-left">
                  Safe Route Finder
                </button>
              </li>
              <li>
                <button onClick={() => onNavTo('emergency')} className="hover:text-violet-400 transition cursor-pointer text-left">
                  SOS Response Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavTo('report')} className="hover:text-violet-400 transition cursor-pointer text-left">
                  Incident Reporting
                </button>
              </li>
              <li>
                <button onClick={() => onNavTo('community')} className="hover:text-violet-400 transition cursor-pointer text-left">
                  Community Safety Maps
                </button>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Legal & Trust</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#" className="hover:text-violet-400 transition">About SafeHer Initiative</a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-400 transition">Privacy & Encryption Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-400 transition">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-violet-400 transition">Helpline Directory</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Emergency Contact</h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>National Helpline: <strong className="text-white">1091 / 112</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-violet-400 shrink-0" />
                <span>support@safeher-initiative.org</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Global Security Ops Center, New Delhi</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© {currentYear} SafeHer Foundation. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-500 font-medium">
            <span>Made with commitment to women's safety</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
