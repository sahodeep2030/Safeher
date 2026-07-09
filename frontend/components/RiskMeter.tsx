import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface RiskMeterProps {
  score: number;
}

export default function RiskMeter({ score }: RiskMeterProps) {
  // Determine color and status message based on score
  const getStatusDetails = (val: number) => {
    if (val <= 30) {
      return {
        color: 'from-emerald-500 to-green-400',
        textColor: 'text-emerald-600',
        bgLight: 'bg-emerald-50',
        border: 'border-emerald-100',
        title: 'Safe',
        desc: 'All tracking normal. SafeSphere is monitoring your route.',
        icon: <ShieldCheck className="w-5 h-5 text-emerald-600 animate-pulse" />,
      };
    } else if (val <= 60) {
      return {
        color: 'from-amber-500 to-yellow-400',
        textColor: 'text-amber-600',
        bgLight: 'bg-amber-50',
        border: 'border-amber-100',
        title: 'Warning Alert',
        desc: 'Unusual activity noticed. Standing by to dispatch notifications.',
        icon: <Shield className="w-5 h-5 text-amber-600 animate-bounce" />,
      };
    } else {
      return {
        color: 'from-red-600 to-rose-500',
        textColor: 'text-red-600',
        bgLight: 'bg-red-50',
        border: 'border-red-100',
        title: 'Emergency State',
        desc: 'Immediate distress detected! Dispatching SMS and Email coordinates.',
        icon: <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />,
      };
    }
  };

  const status = getStatusDetails(score);

  return (
    <div className={`p-5 bg-white/70 backdrop-blur-md rounded-2xl border ${status.border} shadow-sm space-y-4 transition-all duration-300`}>
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {status.icon}
          <h4 className="text-sm font-bold text-slate-800">Risk Engine Level: <span className={status.textColor}>{status.title}</span></h4>
        </div>
        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${status.bgLight} ${status.textColor}`}>
          {score}/100 Score
        </span>
      </div>

      {/* Progress Bar Gauge */}
      <div className="space-y-1">
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${status.color} transition-all duration-500 ease-out`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-bold px-0.5">
          <span>0 (SAFE)</span>
          <span>50 (WARNING)</span>
          <span>100 (SOS)</span>
        </div>
      </div>

      {/* Helper Text Description */}
      <p className="text-[11px] text-slate-500 leading-normal font-medium">
        {status.desc}
      </p>
    </div>
  );
}
