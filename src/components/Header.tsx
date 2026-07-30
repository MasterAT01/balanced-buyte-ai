import React from 'react';
import { Gauge, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentStep: 1 | 2 | 3;
}

// ------------------------------------------------------------------
// MANDATORY BRAND HEADER — identical on every screen, sticky to the
// top of the scroll area. "Balanced" stays white, "Buyte" stays
// orange, the ™ is preserved. On the DRS/result screen (step 3) the
// step badge is replaced with a "Decision Ready" confirmation badge
// instead of "STEP 3/3" — everything else about the header (logo,
// tagline, colors, size, progress bar) stays identical.
// ------------------------------------------------------------------
export const Header: React.FC<HeaderProps> = ({ currentStep }) => {
  const isDecisionReady = currentStep === 3;

  return (
    <header className="sticky top-0 z-20 px-5 sm:px-7 py-5 sm:py-6 bg-[#114B36] text-white flex-shrink-0 border-b border-[#1C8354]/30">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Speedometer / gauge logo mark */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#0B2E22] border border-[#1C8354] flex items-center justify-center flex-shrink-0">
            <Gauge className="w-5 h-5 text-[#9FD8BE]" strokeWidth={2.5} />
          </div>

          <div className="min-w-0">
            <div className="font-display font-semibold text-xl sm:text-2xl tracking-tight leading-none flex items-baseline gap-1">
              <span className="text-white">Balanced</span>
              <span className="text-[#F0A94E]">Buyte</span>
              <span className="text-xs text-[#9FD8BE] font-mono font-normal">™</span>
            </div>
            <div className="font-mono-custom text-[9px] sm:text-[10px] uppercase text-[#9FD8BE] tracking-wider mt-1.5 leading-snug">
              Your GPS for Better Food &amp; Drink Decisions.
              <br />
              One Decision, Under 60 Seconds.
            </div>
          </div>
        </div>

        {/* Right side: dynamic step badge, or a Decision Ready
            confirmation once the DRS/result screen is showing */}
        <div className="flex-shrink-0">
          {isDecisionReady ? (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono-custom font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#1C8354] text-white rounded-full border border-[#9FD8BE]/40 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>DECISION READY</span>
            </div>
          ) : (
            <div className="text-[10px] sm:text-xs font-mono-custom px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#0B2E22] text-[#9FD8BE] rounded-full border border-[#1C8354] whitespace-nowrap">
              STEP {currentStep}/3
            </div>
          )}
        </div>
      </div>

      {/* Progress bar — unchanged 3-segment fill logic */}
      <div className="flex gap-1.5 mt-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: currentStep >= step ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>
    </header>
  );
};
