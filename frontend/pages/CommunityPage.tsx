import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Filter, Star, AlertTriangle, Eye, ThumbsUp, Landmark, ShieldCheck, HelpCircle, MessageSquare } from 'lucide-react';
import { IncidentReport, CommunityComment } from '../types';
import MapPlaceholder from '../components/MapPlaceholder';
import { db } from '../services/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

interface CommunityPageProps {
  onToast: (msg: string, type: 'info' | 'success' | 'warn') => void;
  customReports?: IncidentReport[];
  isDbActive?: boolean;
}

export default function CommunityPage({ onToast, customReports = [], isDbActive = false }: CommunityPageProps) {
  const [filter, setFilter] = useState<string>('all');

  // Filter chips list
  const filterChips = [
    { id: 'all', label: 'All Markers', emoji: '🌐' },
    { id: 'harassment', label: 'Harassment', emoji: '⚠️' },
    { id: 'theft', label: 'Theft Snatching', emoji: '🚨' },
    { id: 'poor-lighting', label: 'Poor Lighting', emoji: '🌑' },
    { id: 'unsafe-roads', label: 'Unsafe Roads', emoji: '🚧' },
    { id: 'safe-zones', label: 'Safe Zones Only', emoji: '❇️' },
  ] as const;

  // Static + Custom Crowdsourced Reports list
  const initialReports: IncidentReport[] = [
    {
      id: 'r1',
      type: 'poor-lighting',
      description: 'Sector 4 Metro Underpass is completely dark. The high-mast light bulb is broken. Avoid walking alone after 8 PM.',
      dateTime: 'Reported 2 hours ago',
      locationName: 'Sector 4 Metro Underpass Link',
      coordinates: { x: 0.58, y: 0.55 },
      isAnonymous: true,
      status: 'verified',
      reporter: 'Anonymous Guardian',
      upvotes: 42
    },
    {
      id: 'r2',
      type: 'harassment',
      description: 'Two men loitering near the construction site gate. Making passing comments at female walkers. Police booth is 1km away.',
      dateTime: 'Reported 5 hours ago',
      locationName: 'Outer Ring Bypass Construction Site',
      coordinates: { x: 0.28, y: 0.42 },
      isAnonymous: false,
      status: 'verified',
      reporter: 'Ritu Sen',
      upvotes: 28
    },
    {
      id: 'r3',
      type: 'theft',
      description: 'Two-wheeler chain snatching incident reported near the park exit. Poor patrolling in this sector after dark.',
      dateTime: 'Reported Yesterday',
      locationName: 'Vikas Public Park Gate 3',
      coordinates: { x: 0.82, y: 0.75 },
      isAnonymous: true,
      status: 'resolved',
      reporter: 'Anonymous Member',
      upvotes: 56
    },
    {
      id: 'r4',
      type: 'safe-zone',
      description: '24/7 market cluster. Extremely safe with 3 active security guards and high-footfall grocery stores open all night.',
      dateTime: 'Reported 2 days ago',
      locationName: 'Safe Zone C (Palam Market Cluster)',
      coordinates: { x: 0.62, y: 0.8 },
      isAnonymous: false,
      status: 'verified',
      reporter: 'Neha Malhotra',
      upvotes: 89
    }
  ];

  const allReports = isDbActive ? customReports : [...customReports, ...initialReports];

  // Filter reports
  const filteredReports = allReports.filter((rep) => {
    if (filter === 'all') return true;
    if (filter === 'harassment' && rep.type === 'harassment') return true;
    if (filter === 'theft' && rep.type === 'theft') return true;
    if (filter === 'poor-lighting' && rep.type === 'poor-lighting') return true;
    if (filter === 'unsafe-roads' && rep.type === 'unsafe-road') return true;
    if (filter === 'safe-zones' && rep.type === 'safe-zone') return true;
    return false;
  });

  // Safe and Unsafe hot lists
  const unsafeAreas = [
    { name: 'Vikas Underpass Link', reason: 'Unlit stretch, zero guards', safetyIndex: 32 },
    { name: 'Sector 12 Construction Bypass', reason: 'Dark, low footfall', safetyIndex: 45 },
    { name: 'Palam Railway Exit Alley', reason: 'Theft snatching corridor', safetyIndex: 28 }
  ];

  const safeAreas = [
    { name: 'Sector 6 Commercial Hub', features: '24/7 Security Patrols, Well-lit', safetyIndex: 98 },
    { name: 'Outer Ring Metro Boulevard', features: 'High CCTV density, PCR check', safetyIndex: 95 },
    { name: 'DLF CyberCity Gateway', features: 'Private guard posts every 50m', safetyIndex: 97 }
  ];

  // Community Comments feed
  const comments: CommunityComment[] = [
    {
      id: 'c1',
      author: 'Preeti Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
      content: 'I take Sector 6 Boulevard every evening at 10 PM after my office shift. Can confirm there are always 2 PCR vans parked. Extremely secure.',
      timeAgo: '1 hour ago',
      likes: 18,
      location: 'Sector 6 Boulevard',
      tag: 'Safe Corridor Tip'
    },
    {
      id: 'c2',
      author: 'Anjali Verma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120',
      content: 'Avoid Vikas Park Gate 3 exit path after 7 PM. The streetlamps are flickering and it gets desolate fast. Take Palam Market road instead.',
      timeAgo: '4 hours ago',
      likes: 24,
      location: 'Vikas Park',
      tag: 'Alternative Route advice'
    }
  ];

  const handleUpvote = async (id: string) => {
    if (isDbActive && db) {
      try {
        const docRef = doc(db, 'incidents', id);
        await updateDoc(docRef, {
          upvotes: increment(1)
        });
        onToast('Safety score upvoted in Firestore! Data verified.', 'success');
      } catch (error: any) {
        console.error("Firestore Upvote Error:", error);
        onToast(`Upvote failed: ${error.message}`, 'warn');
      }
    } else {
      onToast('Safety score upvoted! (Local mockup mode)', 'success');
    }
  };

  const handleChipClick = (id: string) => {
    setFilter(id);
    onToast(`Filtering heatmap for: ${id.replace('-', ' ')}`, 'info');
  };

  return (
    <div id="safeher-community-safety-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6.5 h-6.5 text-violet-600" />
          Community Safety Grid
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Access crowd-sourced risk indicators, upvoted hazard spots, and live safety comments compiled by women in the city.
        </p>
      </div>

      {/* 1. Filter Chips Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-slate-100">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Matrix:
        </span>
        <div className="flex gap-2">
          {filterChips.map((chip) => (
            <button
              key={chip.id}
              onClick={() => handleChipClick(chip.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 cursor-pointer ${
                filter === chip.id
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
              }`}
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
        
        {/* LEFT PANEL: Interactive Heatmap (Cols: 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Live Crowdsourced Heatmap Overlay</h3>
            <div className="h-[400px]">
              <MapPlaceholder
                mode="community-heatmap"
                heatmapFilter={filter}
                customReports={allReports}
              />
            </div>
          </div>

          {/* List of Recent Incidents */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Recent safety reports in filtered grid ({filteredReports.length})
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {filteredReports.map((rep) => (
                <motion.div
                  key={rep.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          rep.type === 'safe-zone'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rep.type === 'harassment'
                            ? 'bg-rose-100 text-rose-800'
                            : rep.type === 'theft'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rep.type.replace('-', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{rep.dateTime}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200/50 px-2 py-0.5 rounded-full">
                        {rep.status === 'verified' ? '✓ Verified Safe' : 'In Review'}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-violet-500" />
                    {rep.locationName}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{rep.description}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2 text-xs">
                    <span className="text-[10px] text-slate-400 font-semibold">Reported by: <strong className="text-slate-600">{rep.reporter}</strong></span>
                    <button
                      onClick={() => handleUpvote(rep.id)}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-violet-600 transition font-bold text-[11px] cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Upvote Safety ({rep.upvotes})</span>
                    </button>
                  </div>
                </motion.div>
              ))}

              {filteredReports.length === 0 && (
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/50 text-center text-slate-400 text-xs">
                  No active incidents flagged in this filter matrix.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Safe vs Unsafe areas, Comments (Cols: 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick grid hotspots lists */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Zone Safety Hotspots</h3>
            
            {/* Unsafe areas (Low score) */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">⚠️ Unsafe Grid Zones</span>
              <div className="space-y-2">
                {unsafeAreas.map((area, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-rose-50/30 p-2.5 rounded-xl border border-rose-100/50">
                    <div>
                      <h4 className="font-bold text-slate-800">{area.name}</h4>
                      <p className="text-[10px] text-rose-600 font-semibold">{area.reason}</p>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-rose-500 bg-white border border-rose-200 px-2 py-0.5 rounded-lg shrink-0">
                      Index {area.safetyIndex}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe areas (High score) */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">❇️ Verified Safe Havens</span>
              <div className="space-y-2">
                {safeAreas.map((area, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-emerald-50/30 p-2.5 rounded-xl border border-emerald-100/50">
                    <div>
                      <h4 className="font-bold text-slate-800">{area.name}</h4>
                      <p className="text-[10px] text-emerald-600 font-semibold">{area.features}</p>
                    </div>
                    <span className="text-xs font-mono font-extrabold text-emerald-600 bg-white border border-emerald-200 px-2 py-0.5 rounded-lg shrink-0">
                      Index {area.safetyIndex}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active safety conversations comments list */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <MessageSquare className="w-4 h-4 text-violet-600" /> Community Conversations
            </h3>

            <div className="space-y-4">
              {comments.map((comm) => (
                <div key={comm.id} className="text-xs space-y-2 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <img
                        src={comm.avatar}
                        alt={comm.author}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full border border-slate-100 object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{comm.author}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{comm.timeAgo} • Near {comm.location}</p>
                      </div>
                    </div>
                    {comm.tag && (
                      <span className="text-[9px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-bold">
                        {comm.tag}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 leading-relaxed font-medium pl-1">{comm.content}</p>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onToast('Thanks for liking safety comment.', 'success')}
                      className="text-[10px] text-slate-400 hover:text-violet-600 font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3" /> Like comment ({comm.likes})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
