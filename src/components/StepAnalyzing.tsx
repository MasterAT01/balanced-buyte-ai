import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface StepAnalyzingProps {
  onComplete: () => void;
}

const STEPS_LOG = [
  'Initializing Balanced Buyte Engine™...',
  'Analyzing macro targets & dietary constraints...',
  'Cross-checking glycemic load & sip pairing...',
  'Generating Decision Confidence™ report...',
  'Finalizing 60-Second Best Buyte™...',
];

export const StepAnalyzing: React.FC<StepAnalyzingProps> = ({ onComplete }) => {
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLogIndex((prev) => {
        if (prev < STEPS_LOG.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-[#EAF3EC] border-t-[#1C8354] animate-spin-slow flex items-center justify-center" />
        <div className="absolute inset-0 flex items-center justify-center text-[#1C8354]">
          <Zap className="w-8 h-8 fill-current" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-display font-bold text-xl text-[#0B2E22]">
          Engine Analyzing Decision
        </h3>
        <p className="font-mono-custom text-xs text-[#5B7A6E]">
          Target time: under 60 seconds
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2.5 pt-4 text-left">
        {STEPS_LOG.map((log, idx) => {
          const isDone = idx < currentLogIndex;
          const isCurrent = idx === currentLogIndex;

          return (
            <div
              key={log}
              className={`flex items-center gap-2.5 text-xs font-mono-custom transition-all duration-300 ${
                isDone
                  ? 'text-[#1C8354]'
                  : isCurrent
                  ? 'text-[#0B2E22] font-semibold'
                  : 'text-[#A3BEB0]/60'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-[#1C8354] flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-[#1C8354] animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-[#DCE8E1] flex-shrink-0" />
              )}
              <span>{log}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-6 flex items-center justify-center gap-1.5 text-[11px] font-mono-custom text-[#5B7A6E]">
        <ShieldCheck className="w-4 h-4 text-[#1C8354]" />
        <span>100% Deterministic Engine + AI Coaching</span>
      </div>
    </div>
  );
};
