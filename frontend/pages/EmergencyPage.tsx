import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Phone, MessageSquare, AlertTriangle, Send, User, Trash2, Plus, Heart, Share2, Compass, Check } from 'lucide-react';
import { EmergencyContact } from '../types';

interface EmergencyPageProps {
  onToast: (msg: string, type: 'info' | 'success' | 'warn') => void;
  currentUser: { email: string | null; displayName: string | null } | null;
}

export default function EmergencyPage({ onToast, currentUser }: EmergencyPageProps) {
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'chat'>('contacts');

  // Emergency Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isLoadingAgent, setIsLoadingAgent] = useState(false);

  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages([
      { id: '1', sender: 'system', text: 'Secure AI Sentinel session established.', time: timeStr },
      { id: '2', sender: 'agent', text: `Hello ${currentUser?.displayName || 'Aria'}. I am your SafeHer AI Emergency Sentinel. I am monitoring your live GPS coordinates. Please tell me: Are you currently in immediate danger, or has your route deviated?`, time: timeStr }
    ]);
  }, [currentUser]);

  // Initial Emergency Contacts
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: 'c1', name: 'Aria Sharma', relation: 'Sister', phone: '+91 99100 23456', isTrusted: true, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120' },
    { id: 'c2', name: 'Maya Sharma', relation: 'Mother', phone: '+91 98112 34567', isTrusted: true, avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=120' },
    { id: 'c3', name: 'Rohit Verma', relation: 'Partner', phone: '+91 99991 88273', isTrusted: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120' }
  ]);

  // Contact creation state
  const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '' });
  const [showAddContactForm, setShowAddContactForm] = useState(false);

  // SOS button countdown countdown
  useEffect(() => {
    let interval: any;
    if (sosCountdown !== null) {
      if (sosCountdown > 1) {
        interval = setInterval(() => {
          setSosCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else if (sosCountdown === 1) {
        interval = setTimeout(() => {
          setSosCountdown(null);
          setSosTriggered(true);
          onToast('CRITICAL SOS ALERT SENT! Police and emergency contacts notified.', 'warn');
        }, 1000);
      }
    }
    return () => {
      clearInterval(interval);
      clearTimeout(interval);
    };
  }, [sosCountdown]);

  const handleSOSPress = () => {
    if (sosTriggered) {
      setSosTriggered(false);
      onToast('Emergency SOS alert cancelled.', 'info');
      return;
    }

    if (sosCountdown !== null) {
      setSosCountdown(null);
      onToast('SOS countdown cancelled.', 'info');
      return;
    }

    setSosCountdown(3);
    onToast('Distress signal initialized. Tap again to cancel.', 'info');
  };

  const handleDispatch = (type: string, number: string) => {
    onToast(`Initiating direct emergency call to ${type} (${number})...`, 'warn');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoadingAgent) return;

    const userMsg = {
      id: Math.random().toString(),
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsLoadingAgent(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey !== "") {
        const historyForGemini = chatMessages
          .filter(msg => msg.sender === 'user' || msg.sender === 'agent')
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'model' as const,
            text: msg.text
          }));
        
        historyForGemini.push({ role: 'user', text: userMsg.text });

        const systemInstruction = `You are the SafeHer AI Emergency Sentinel, an empathetic, urgent, and professional safety dispatch coordinator built into the SafeHer personal security app.
Your objective is to guide users who have triggered an SOS or feel unsafe.
Rules:
1. Act with urgency, empathy, and absolute calm. Keep your tone reassuring.
2. Keep responses brief (max 2-3 sentences) so they can be read quickly in stressful situations.
3. Suggest practical safety actions based on what they report:
   - If they are followed: advise walking to a well-lit, public business.
   - If vehicle deviates: advise opening windows, calling out, and preparing an emergency contact alert.
   - If medical threat: advise staying still, locking doors, and confirming dispatch of assistance.
4. Address them by name if they are named ${currentUser?.displayName || 'Aria'}.
5. Confirm that SafeHer has locked their GPS position and is standing by to alert authorities.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: historyForGemini.map(m => ({
              role: m.role,
              parts: [{ text: m.text }]
            })),
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            generationConfig: {
              maxOutputTokens: 200,
              temperature: 0.3,
            }
          })
        });

        if (!response.ok) {
          throw new Error('Gemini API call failed.');
        }

        const result = await response.json();
        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "I am tracking your position. Please stay in a secure public area if possible.";

        setChatMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'agent',
          text: responseText.trim(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsLoadingAgent(false);
        onToast('AI Sentinel responded.', 'success');
      } else {
        throw new Error("No API Key configured.");
      }
    } catch (error) {
      console.warn("Falling back to pre-programmed responses:", error);
      setTimeout(() => {
        const responses = [
          'SafeHer Sentinel: We have locked your coordinates and notified your emergency contacts. A safety coordinator is alerted. Stay in a public area.',
          'SafeHer Sentinel: Understood. Are you in a public space? Please seek a populated area while we monitor your GPS stream.',
          'SafeHer Sentinel: Distress transmission confirmed. Avoid dark corridors. Walk towards security checkpoints or active market stalls.'
        ];
        const fallbackMsg = responses[Math.floor(Math.random() * responses.length)];
        setChatMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: 'agent',
          text: fallbackMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setIsLoadingAgent(false);
      }, 1000);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      onToast('Please enter contact name and phone number', 'warn');
      return;
    }

    const contact: EmergencyContact = {
      id: Math.random().toString(),
      name: newContact.name,
      relation: newContact.relation || 'Friend',
      phone: newContact.phone,
      isTrusted: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
    };

    setContacts(prev => [...prev, contact]);
    setNewContact({ name: '', relation: '', phone: '' });
    setShowAddContactForm(false);
    onToast(`Added ${contact.name} to Emergency Contacts.`, 'success');
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    onToast('Contact removed.', 'info');
  };

  return (
    <div id="safeher-emergency-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Title */}
      <div className="mb-8 space-y-2 text-center md:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
          <AlertTriangle className="w-7 h-7 text-rose-500 animate-pulse" />
          Emergency SOS Response Hub
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Distress protocols are fully offline-ready. Tap SOS or access direct dispatch panels below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: Center SOS Ring (Cols: 5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">Distress Transmitter</h2>
          
          {/* Concentric Animated SOS Trigger Ring */}
          <div className="relative w-72 h-72 flex items-center justify-center select-none">
            {/* Pulsing ring backdrops */}
            <div className={`absolute inset-0 rounded-full bg-rose-500/10 ${sosCountdown !== null || sosTriggered ? 'animate-ping' : ''}`} style={{ animationDuration: '1.5s' }} />
            <div className={`absolute inset-10 rounded-full bg-rose-500/15 ${sosCountdown !== null || sosTriggered ? 'animate-ping' : ''}`} style={{ animationDuration: '2s' }} />
            <div className="absolute inset-16 rounded-full bg-rose-500/20" />

            {/* Main Trigger Button */}
            <button
              onClick={handleSOSPress}
              className={`absolute w-44 h-44 rounded-full border-4 border-white flex flex-col items-center justify-center shadow-2xl transition duration-300 transform active:scale-95 cursor-pointer select-none ${
                sosTriggered
                  ? 'bg-rose-600 text-white'
                  : sosCountdown !== null
                  ? 'bg-violet-600 text-white'
                  : 'bg-rose-500 text-white hover:bg-rose-600'
              }`}
            >
              <AlertTriangle className="w-10 h-10 mb-2 animate-bounce" />
              {sosCountdown !== null ? (
                <>
                  <span className="text-4xl font-extrabold font-mono">{sosCountdown}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1">CANCEL?</span>
                </>
              ) : sosTriggered ? (
                <>
                  <span className="text-2xl font-black uppercase tracking-wider">ACTIVE</span>
                  <span className="text-[10px] text-rose-200 font-bold tracking-widest mt-1">TAP TO END</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-black uppercase tracking-wider">SOS</span>
                  <span className="text-[10px] text-rose-100 font-semibold tracking-widest mt-1">HOLD 3 SECS</span>
                </>
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 leading-relaxed max-w-xs">
            {sosCountdown !== null
              ? 'Distress signal starting in ' + sosCountdown + ' seconds. Release or tap again to stop.'
              : sosTriggered
              ? 'GPS Lock active. Dispatching response unit to DLF Avenue coordinates immediately.'
              : 'Hold or tap the SOS button. Will immediately initiate location broadcasts, audio recording, and contact warnings.'}
          </p>

          {/* Direct Dispatch Quick Action buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => handleDispatch('Police Control', '112')}
              className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4 text-rose-400" />
              Police (112)
            </button>
            <button
              onClick={() => handleDispatch('Ambulance Dispatch', '102')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 px-4 rounded-xl text-xs font-bold border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-teal-600" />
              Ambulance (102)
            </button>
          </div>
        </div>

        {/* RIGHT COMPONENT: Tab Selection - Contacts vs Chat (Cols: 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[520px]">
          
          {/* Header Tab Toggles */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition cursor-pointer ${
                activeTab === 'contacts'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Trusted Contacts ({contacts.length})
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition cursor-pointer ${
                activeTab === 'chat'
                  ? 'border-violet-500 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              AI Emergency Sentinel Chat
            </button>
          </div>

          {/* Tab 1: Contacts Grid view */}
          <div className="flex-1 p-5 overflow-y-auto">
            {activeTab === 'contacts' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Guardians Network</h3>
                  <button
                    onClick={() => setShowAddContactForm(!showAddContactForm)}
                    className="text-xs text-violet-600 hover:text-violet-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Guardian
                  </button>
                </div>

                {/* Add contact Form popup inline */}
                {showAddContactForm && (
                  <form onSubmit={handleAddContact} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-700">New Emergency Guardian</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={newContact.name}
                        onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                        className="p-2 bg-white border border-slate-200 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <input
                        type="text"
                        placeholder="Relation (e.g. Sister)"
                        value={newContact.relation}
                        onChange={e => setNewContact({ ...newContact, relation: e.target.value })}
                        className="p-2 bg-white border border-slate-200 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={newContact.phone}
                        onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                        className="p-2 bg-white border border-slate-200 text-xs rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAddContactForm(false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                )}

                {/* Contact List cards */}
                <div className="space-y-3">
                  {contacts.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-slate-100 object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{c.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{c.relation} • {c.phone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onToast(`Calling ${c.name}...`, 'info')}
                          className="p-2 bg-slate-50 hover:bg-violet-50 text-slate-600 hover:text-violet-600 border border-slate-200/50 rounded-xl transition cursor-pointer"
                          title="Quick Call"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onToast(`Sent custom SOS warning ping to ${c.name}`, 'success')}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-100 rounded-xl transition cursor-pointer"
                          title="Direct SOS warning message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(c.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition cursor-pointer"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Tab 2: Live Emergency Advisor Chat */
              <div className="flex flex-col h-full overflow-hidden">
                {/* AI Sentinel Header Badge */}
                <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold shrink-0">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-violet-600" />
                    <span>AI Emergency Sentinel Dispatch</span>
                  </div>
                  {import.meta.env.VITE_GEMINI_API_KEY ? (
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Live AI Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                      Simulated AI
                    </span>
                  )}
                </div>

                {/* Messages Panel */}
                <div className="flex-1 space-y-4 overflow-y-auto mb-3 pr-1 px-4 py-2">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-violet-600 text-white rounded-br-none'
                            : msg.sender === 'system'
                            ? 'bg-slate-100 text-slate-500 font-medium text-center text-[10px] w-full max-w-full'
                            : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-bl-none font-medium'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 font-semibold">{msg.time}</span>
                    </div>
                  ))}

                  {/* Typing / Loading Agent State */}
                  {isLoadingAgent && (
                    <div className="flex flex-col max-w-[85%] mr-auto items-start animate-pulse">
                      <div className="p-3 bg-violet-50 text-violet-600 border border-violet-100 rounded-2xl rounded-bl-none text-xs font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping"></span>
                        AI Sentinel is coordinating dispatch...
                      </div>
                    </div>
                  )}
                </div>

                {/* Preset Fast Actions */}
                <div className="flex flex-wrap gap-1.5 pb-2.5 px-4 shrink-0">
                  <button
                    onClick={() => setChatInput('Help, I feel unsafe walking here!')}
                    disabled={isLoadingAgent}
                    className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/50 py-1 px-2.5 rounded-full transition cursor-pointer disabled:opacity-50"
                  >
                    "Feel unsafe walking"
                  </button>
                  <button
                    onClick={() => setChatInput('The cab driver has taken a strange route deviation.')}
                    disabled={isLoadingAgent}
                    className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/50 py-1 px-2.5 rounded-full transition cursor-pointer disabled:opacity-50"
                  >
                    "Cab deviation"
                  </button>
                  <button
                    onClick={() => setChatInput('My location coordinates look wrong.')}
                    disabled={isLoadingAgent}
                    className="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/50 py-1 px-2.5 rounded-full transition cursor-pointer disabled:opacity-50"
                  >
                    "GPS verify"
                  </button>
                </div>

                {/* Input Text Form */}
                <form onSubmit={handleSendMessage} className="flex gap-2 px-4 pb-4 shrink-0">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isLoadingAgent}
                    placeholder={isLoadingAgent ? "AI is typing safety instructions..." : "Type a message or tap quick shortcuts..."}
                    className="flex-1 bg-slate-50 border border-slate-200 text-xs px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={isLoadingAgent}
                    className="bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-xl shrink-0 transition shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    <Send className="w-4.5 h-4.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
