import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, MapPin, Calendar, Clock, Image, ShieldAlert, Sparkles, AlertTriangle, EyeOff, CheckCircle } from 'lucide-react';
import MapPlaceholder from '../components/MapPlaceholder';

interface IncidentReportingPageProps {
  onToast: (msg: string, type: 'info' | 'success' | 'warn') => void;
  onSubmitReport?: (reportData: any) => void;
}

export default function IncidentReportingPage({ onToast, onSubmitReport }: IncidentReportingPageProps) {
  const [incidentType, setIncidentType] = useState('harassment');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('2026-07-06T12:00');
  const [locationName, setLocationName] = useState('Near Sector 4 Underpass Crossing');
  const [coordinates, setCoordinates] = useState<{ x: number; y: number } | null>({ x: 0.28, y: 0.42 });
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [photoSelected, setPhotoSelected] = useState<string | null>(null);

  // Dynamic file upload simulation
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoSelected(file.name);
      onToast(`Attached photo: ${file.name} to safety report.`, 'success');
    }
  };

  // Map pin selector callback
  const handleSelectPin = (coords: { x: number; y: number }, address: string) => {
    setCoordinates(coords);
    setLocationName(address);
    onToast(`Pinned spot: ${address}`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !locationName.trim()) {
      onToast('Please enter both description and coordinate location', 'warn');
      return;
    }

    const reportData = {
      type: incidentType,
      description,
      dateTime,
      locationName,
      coordinates: coordinates || { x: 0.5, y: 0.5 },
      isAnonymous,
      reporterName: isAnonymous ? 'Anonymous Member' : 'Aria Sharma',
    };

    if (onSubmitReport) {
      onSubmitReport(reportData);
    }

    // Reset Form
    setDescription('');
    setPhotoSelected(null);
    onToast('Safety report submitted successfully to Community database.', 'success');
  };

  return (
    <div id="safeher-report-incident-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-violet-600 animate-pulse" />
          Report Community Incident
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Submit spatial warnings, poor lighting sectors, or harassment spots. Help other women stay secure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Submission Form (Cols: 6) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-5 h-5 text-violet-600" />
              Incident Details form
            </h2>

            {/* Incident Type Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">Incident Classification</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'harassment', label: 'Harassment', emoji: '⚠️' },
                  { id: 'theft', label: 'Theft / Snatching', emoji: '🚨' },
                  { id: 'poor-lighting', label: 'Poor Lighting', emoji: '🌑' },
                  { id: 'unsafe-road', label: 'Unsafe Roadway', emoji: '🚧' },
                  { id: 'safe-zone', label: 'Safe Zone Active', emoji: '❇️' },
                ].map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setIncidentType(t.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                      incidentType === t.id
                        ? 'border-violet-500 bg-violet-50/70 text-violet-600'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-sm mb-1">{t.emoji}</span>
                    <span className="text-[10px] font-bold truncate max-w-full">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location (Linked from map) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">Report Location Coordinates</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4.5 h-4.5 text-rose-500" />
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Tap map on right to capture coordinates..."
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 font-semibold text-slate-800"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                For precise tracking, click on the map canvas on the right to position the incident node automatically.
              </p>
            </div>

            {/* Description Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">Safety Issue Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue (e.g. Unlit stretch of 400m, several broken street lamps. Avoid after 9 PM)..."
                rows={4}
                className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-800 font-medium leading-relaxed"
              />
            </div>

            {/* Date & Time Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">Occurrence Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-700 font-semibold"
                />
              </div>
            </div>

            {/* Drag & Drop File Upload simulation */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 block">Upload Evidence (Optional)</label>
              <div className="border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-xl p-4 text-center cursor-pointer relative group transition">
                <input
                  type="file"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-1 text-slate-400">
                  <Image className="w-6 h-6 mx-auto text-slate-300 group-hover:text-violet-500 transition" />
                  <p className="text-xs font-semibold text-slate-600 group-hover:text-violet-600 transition">
                    {photoSelected ? `Attached: ${photoSelected}` : 'Drag image here or click to browse'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Anonymous Toggle Widget */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/50 flex items-center justify-between">
              <div className="flex gap-2">
                <EyeOff className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Submit Anonymously</h4>
                  <p className="text-[10px] text-slate-500 leading-snug">Hides your profile name and email on public safety grids.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAnonymous ? 'bg-violet-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isAnonymous ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              File Verified Report
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Interactive Map (Cols: 6) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm h-[480px] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">Safety GIS Pin Placer</span>
              {coordinates ? (
                <span className="text-[10px] font-mono text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100 font-semibold">
                  Coords: {coordinates.lat !== undefined && coordinates.lng !== undefined
                    ? `GPS: ${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
                    : `${coordinates.x.toFixed(2)}, ${coordinates.y.toFixed(2)}`}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">No Location Selected</span>
              )}
            </div>

            <div className="flex-1 my-3">
              <MapPlaceholder
                mode="incident-report"
                onSelectPinLocation={handleSelectPin}
                selectedPinLocation={coordinates}
              />
            </div>

            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200/60 flex gap-2.5 text-[11px] text-amber-800 leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Encrypted Submission Block</p>
                <p>SafeHer uses decentralized encryption hashes for all anonymous report vectors. Local police authorities cannot retrieve your device identity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
