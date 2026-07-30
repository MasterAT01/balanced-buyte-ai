import React, { useState } from 'react';
import { DecisionResult, DeliveryMode, SavedJourneyItem } from '../types';
import { SmartKitchenView } from './SmartKitchenView';
import { ShoppingListView } from './ShoppingListView';
import { RestaurantView } from './RestaurantView';
import { JourneyView } from './JourneyView';
import { DrsModals } from './DrsModals';
import {
  Compass,
  CheckCircle2,
  Sparkles,
  Mail,
  Share2,
  RotateCcw,
  Target,
  Bookmark,
  GlassWater,
  Home,
  Utensils,
  ShoppingBag,
  Bike,
  Printer,
  ListChecks,
  XCircle,
  Lightbulb,
  HeartHandshake,
} from 'lucide-react';

interface ResultScreenProps {
  result: DecisionResult;
  onRestart: () => void;
  onNewGoal: () => void;
  favorites: SavedJourneyItem[];
  history: SavedJourneyItem[];
  onToggleFavorite: (id: string) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  onRestart,
  onNewGoal,
  favorites,
  history,
  onToggleFavorite,
}) => {
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('Cook');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSavedFavorite, setIsSavedFavorite] = useState(false);

  const handleBookmarkToggle = () => {
    setIsSavedFavorite(!isSavedFavorite);
    onToggleFavorite(result.id);
  };

  const handlePrintDrsCard = () => {
    window.print();
  };

  // Dial gauge calculation for SVG circle stroke
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.meterScore / 100) * circumference;

  // Trust-safe tier label — describes fit honestly, never overpromises
  // ("100% verified" / "perfect" / "guaranteed" are avoided by design).
  const scoreBand =
    result.meterScore >= 85
      ? { emoji: '🟢', label: 'Excellent Balanced Choice' }
      : result.meterScore >= 70
      ? { emoji: '🟢', label: 'Good Balanced Choice' }
      : result.meterScore >= 45
      ? { emoji: '🟡', label: 'Fair Choice Today' }
      : { emoji: '🟠', label: 'Weaker Fit Today' };

  return (
    <div className="space-y-7">
      {/* 1. BALANCED METER™ GAUGE */}
      <div className="flex flex-col items-center justify-center my-2">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#EAF3EC"
              strokeWidth="11"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#1C8354"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="font-display font-bold text-4xl text-[#0B2E22] leading-none">
              {result.meterScore}
              <sub className="text-xs font-mono-custom text-[#5B7A6E] font-normal ml-0.5">/100</sub>
            </div>
            <div className="text-[10px] font-mono-custom font-bold text-[#1C8354] uppercase tracking-wider mt-1">
              Balanced Score
            </div>
          </div>
        </div>

        <div className="mt-3 px-3.5 py-1 bg-[#EAF3EC] text-[#114B36] font-mono-custom text-xs font-bold rounded-full border border-[#1C8354]/30 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1C8354] animate-pulse" />
          <span>{scoreBand.emoji} {scoreBand.label}</span>
        </div>
      </div>

      {/* 2. DECISION CONFIDENCE™ BLOCK */}
      <div className="bg-[#F5F9F6] border border-[#E2ECE6] rounded-[22px] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-mono-custom font-bold text-[#5B7A6E] uppercase tracking-wider">
            <Compass className="w-4 h-4 text-[#1C8354]" />
            <span>Decision Confidence™</span>
          </div>
          <span className="font-display font-bold text-xl text-[#1C8354]">
            {result.confidencePercentage}%
          </span>
        </div>

        {/* Confidence Progress Bar */}
        <div className="w-full h-2.5 bg-[#EAF3EC] rounded-full overflow-hidden my-3">
          <div
            className="h-full bg-[#1C8354] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${result.confidencePercentage}%` }}
          />
        </div>

        <div className="space-y-1.5 pt-1">
          {result.confidenceBreakdown.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-[#0B2E22] leading-relaxed">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1C8354] mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. BEST BUYTE™ CARD — large, accurate food visual (the food's
          own emoji, never an unrelated stock/placeholder image) */}
      <div className="bg-white border border-[#E2ECE6] rounded-[24px] p-5 shadow-xs text-center space-y-4 relative">
        <button type="button"
          onClick={handleBookmarkToggle}
          title={isSavedFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
          aria-label={isSavedFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
          aria-pressed={isSavedFavorite}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#F5F9F6] border border-[#E2ECE6] text-[#C98A2C] hover:bg-[#FBF3E4] transition-all cursor-pointer"
        >
          <Bookmark className={`w-4 h-4 ${isSavedFavorite ? 'fill-current' : ''}`} />
        </button>

        <div className="w-32 h-32 mx-auto rounded-[22px] flex items-center justify-center text-6xl shadow-md border-2 border-white bg-gradient-to-br from-[#EAF3EC] to-[#DCE8E1]">
          {result.bestBuyteEmoji}
        </div>

        <div className="space-y-1.5">
          <div className="text-[11px] font-mono-custom font-bold text-[#1C8354] uppercase tracking-wider">
            Best Buyte™ — Your Best Food Today
          </div>
          <h2 className="font-display font-bold text-2xl text-[#0B2E22] leading-tight">
            {result.bestBuyteName}
          </h2>
          <p className="text-xs text-[#5B7A6E] max-w-xs mx-auto leading-relaxed">
            {result.bestBuyteDescription}
          </p>
        </div>

        {/* Macro Pill Highlights */}
        <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#E2ECE6] text-xs font-mono-custom">
          <span className="font-bold text-[#0B2E22]">{result.nutrition.calories} kcal</span>
          <span className="text-[#5B7A6E]">•</span>
          <span className="text-[#1C8354] font-bold">{result.nutrition.protein}g Protein</span>
          <span className="text-[#5B7A6E]">•</span>
          <span className="text-[#5B7A6E]">{result.nutrition.fiber}g Fiber</span>
        </div>
      </div>

      {/* 4. BALANCED SIP™ CARD — large, accurate drink visual */}
      <div className="bg-white border border-[#FBF3E4] rounded-[22px] p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono-custom font-bold text-[#C98A2C] uppercase tracking-wider">
          <GlassWater className="w-4 h-4 text-[#C98A2C]" />
          <span>Balanced Sip™ — Your Best Drink Today</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 flex-shrink-0 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br from-[#FBF3E4] to-white border border-[#C98A2C]/20">
            {result.balancedSip.primaryEmoji}
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 bg-[#FBF3E4] rounded-xl border border-[#C98A2C]/20">
              <div className="text-[10px] font-mono-custom font-bold text-[#C98A2C] uppercase">
                Primary Drink
              </div>
              <div className="font-display font-bold text-xs text-[#0B2E22] mt-1">
                {result.balancedSip.primary}
              </div>
            </div>
            <div className="p-2.5 bg-[#F5F9F6] rounded-xl border border-[#E2ECE6]">
              <div className="text-[10px] font-mono-custom font-bold text-[#5B7A6E] uppercase">
                Alternative Sip
              </div>
              <div className="font-display font-bold text-xs text-[#0B2E22] mt-1">
                {result.balancedSip.alternative}
              </div>
            </div>
          </div>
        </div>

        {/* Hydration Score™ bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-mono-custom font-bold text-[#5B7A6E] uppercase tracking-wider">
              💧 Hydration Score™
            </span>
            <span className="font-display font-bold text-sm text-[#1C8354]">
              {result.balancedSip.hydrationScore}%
            </span>
          </div>
          <div className="w-full h-2 bg-[#EAF3EC] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1C8354] to-[#3FB88A] rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${result.balancedSip.hydrationScore}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-[#5B7A6E] leading-relaxed">
          <strong className="text-[#0B2E22] font-mono-custom">Why This Pairing Works: </strong>
          {result.balancedSip.whyPairingWorks}
        </p>
      </div>

      {/* 5. AI DECISION COACH — Gemini enhances this text; Balanced
          Buyte's own rule-based rationale already decided the facts */}
      <div className="bg-[#F5F9F6] border border-[#E2ECE6] rounded-[22px] p-5 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono-custom font-bold text-[#5B7A6E] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#1C8354]" />
            <span>AI Decision Coach — Why We Chose This</span>
          </div>
          {result.aiEnhanced && (
            <span className="text-[10px] font-mono-custom font-bold text-[#1C8354] bg-[#EAF3EC] px-2 py-0.5 rounded-full">
              ✨ AI-Enhanced
            </span>
          )}
        </div>
        <p className="text-xs text-[#0B2E22] leading-relaxed">{result.coachRationale}</p>
      </div>

      {/* 6. BETTER OPTIONS NEARBY (minimum 3) */}
      {result.betterOptions.length > 0 && (
        <div className="bg-white border border-[#E2ECE6] rounded-[22px] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono-custom font-bold text-[#5B7A6E] uppercase tracking-wider">
            <ListChecks className="w-4 h-4 text-[#1C8354]" />
            <span>Better Options Nearby</span>
          </div>
          <div className="space-y-2">
            {result.betterOptions.map((opt, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-[#F5F9F6] border border-[#E2ECE6] rounded-xl"
              >
                <span className="text-xl flex-shrink-0">{opt.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-xs text-[#0B2E22] truncate">{opt.name}</div>
                  <div className="text-[11px] text-[#5B7A6E] leading-snug">{opt.reason}</div>
                </div>
                <span className="font-mono-custom text-[11px] font-bold text-[#1C8354] bg-[#EAF3EC] px-2 py-0.5 rounded-full flex-shrink-0">
                  {opt.score}/100
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. ONE TO AVOID — "Better to Skip Today" */}
      <div className="bg-[#FBEBE8] border border-[#E7B7AC] rounded-[22px] p-5 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-mono-custom font-bold text-[#B23B2E] uppercase tracking-wider">
          <XCircle className="w-4 h-4 text-[#B23B2E]" />
          <span>Better to Skip Today</span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg">{result.oneToAvoid.emoji}</span>
          <span className="font-display font-bold text-sm text-[#0B2E22]">{result.oneToAvoid.name}</span>
        </div>
        <p className="text-xs text-[#8A3226] leading-relaxed">{result.oneToAvoid.reason}</p>
      </div>

      {/* 8. COACH TIP */}
      <div className="bg-[#FBF3E4] border border-[#C98A2C]/30 rounded-[22px] p-5 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-mono-custom font-bold text-[#C98A2C] uppercase tracking-wider">
          <Lightbulb className="w-4 h-4 text-[#C98A2C]" />
          <span>Coach Tip</span>
        </div>
        <p className="text-xs text-[#7A5714] leading-relaxed">{result.coachTip}</p>
      </div>

      {/* 9. CHOOSE ONE — HOW WILL YOU GET THIS? */}
      <div className="bg-[#F5F9F6] border border-[#E2ECE6] rounded-[22px] p-5 space-y-4">
        <div className="text-xs font-mono-custom font-bold text-[#5B7A6E] uppercase tracking-wider">
          Choose One — How Will You Get This?
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button type="button"
            onClick={() => setDeliveryMode('Cook')}
            aria-pressed={deliveryMode === 'Cook'}
            className={`p-3.5 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              deliveryMode === 'Cook'
                ? 'bg-[#1C8354] text-white border-[#1C8354] shadow-sm'
                : 'bg-white text-[#0B2E22] border-[#DCE8E1] hover:border-[#1C8354]'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>🏠 Cook at Home</span>
          </button>

          <button type="button"
            onClick={() => setDeliveryMode('Eat Out')}
            aria-pressed={deliveryMode === 'Eat Out'}
            className={`p-3.5 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              deliveryMode === 'Eat Out'
                ? 'bg-[#1C8354] text-white border-[#1C8354] shadow-sm'
                : 'bg-white text-[#0B2E22] border-[#DCE8E1] hover:border-[#1C8354]'
            }`}
          >
            <Utensils className="w-5 h-5" />
            <span>🍽 Eat Out</span>
          </button>

          <button type="button"
            onClick={() => setDeliveryMode('Shop Ingredients')}
            aria-pressed={deliveryMode === 'Shop Ingredients'}
            className={`p-3.5 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              deliveryMode === 'Shop Ingredients'
                ? 'bg-[#1C8354] text-white border-[#1C8354] shadow-sm'
                : 'bg-white text-[#0B2E22] border-[#DCE8E1] hover:border-[#1C8354]'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>🛒 Shop Ingredients</span>
          </button>

          <button type="button"
            onClick={() => setDeliveryMode('Order Online')}
            aria-pressed={deliveryMode === 'Order Online'}
            className={`p-3.5 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              deliveryMode === 'Order Online'
                ? 'bg-[#1C8354] text-white border-[#1C8354] shadow-sm'
                : 'bg-white text-[#0B2E22] border-[#DCE8E1] hover:border-[#1C8354]'
            }`}
          >
            <Bike className="w-5 h-5" />
            <span>🛵 Order Online</span>
          </button>
        </div>

        {/* Dynamic Action Detail View */}
        {deliveryMode === 'Cook' && (
          <SmartKitchenView recipe={result.recipe} nutrition={result.nutrition} />
        )}

        {deliveryMode === 'Eat Out' && (
          <RestaurantView restaurants={result.restaurants} />
        )}

        {deliveryMode === 'Shop Ingredients' && (
          <ShoppingListView initialItems={result.shoppingList} />
        )}

        {deliveryMode === 'Order Online' && (
          <div className="mt-3 p-4 bg-white border border-[#DCE8E1] rounded-[20px] space-y-3">
            <div className="text-xs font-mono-custom font-bold text-[#0B2E22] uppercase">
              Fast Delivery Partner Options
            </div>
            <div className="grid grid-cols-3 gap-2">
              {result.orderLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#F5F9F6] border border-[#E2ECE6] rounded-xl text-center text-xs font-bold text-[#0B2E22] hover:border-[#1C8354] transition-all flex flex-col items-center gap-1"
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.platform}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 10. JOURNEY (Favorites, Meal Planner, History) */}
      <JourneyView
        favorites={favorites}
        history={history}
        onToggleFavorite={onToggleFavorite}
      />

      {/* 10.5 BALANCED RECOVERY™ — supportive, never guilt-tripping;
          only rendered when the context actually calls for it */}
      {result.recoveryGuidance && (
        <div className="bg-[#EAF3EC] border border-[#1C8354]/30 rounded-[22px] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono-custom font-bold text-[#114B36] uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4 text-[#1C8354]" />
            <span>💚 Balanced Recovery™</span>
          </div>
          <p className="text-xs text-[#0B2E22] leading-relaxed">
            {result.recoveryGuidance.message}
          </p>
          <div className="space-y-1.5">
            {result.recoveryGuidance.actions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#114B36] leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#1C8354] mt-0.5 flex-shrink-0" />
                <span>{action}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[#5B7A6E] italic leading-relaxed pt-2 border-t border-[#1C8354]/15">
            {result.recoveryGuidance.closingLine}
          </p>
        </div>
      )}

      {/* 11. DRS REPORT ACTIONS (Download DRS Card, Email DRS, Share DRS) */}
      <div className="space-y-3 pt-2 no-print">
        <button type="button"
          onClick={handlePrintDrsCard}
          className="w-full py-4 bg-[#1C8354] hover:bg-[#114B36] text-white font-display font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Download DRS™ Card / Print Decision</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button type="button"
            onClick={() => setShowEmailModal(true)}
            className="py-3 bg-[#EAF3EC] hover:bg-[#DCE8E1] text-[#114B36] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            <span>Email My DRS</span>
          </button>

          <button type="button"
            onClick={() => setShowShareModal(true)}
            className="py-3 bg-[#EAF3EC] hover:bg-[#DCE8E1] text-[#114B36] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share DRS</span>
          </button>
        </div>

        {/* Primary Flow Control Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button type="button"
            onClick={onRestart}
            className="py-3.5 bg-[#0B2E22] hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start Again</span>
          </button>

          <button type="button"
            onClick={onNewGoal}
            className="py-3.5 bg-[#0B2E22] hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* 12. MINIMAL PREMIUM FOOTER (Strictly < 80px height, centered, small, elegant) */}
      <footer className="mt-8 pt-6 border-t border-[#E2ECE6] text-center space-y-1.5 pb-2">
        <div className="text-[12px] font-mono-custom font-bold text-[#0B2E22] tracking-wide">
          © 2026 Balanced Buyte™
        </div>
        <div className="text-[11px] font-body-custom text-[#5B7A6E] leading-tight">
          Your GPS for Better Food & Drink Decisions.
        </div>
        <div className="text-[10px] font-mono-custom text-[#A3BEB0]">
          One Decision. Under 60 Seconds.
        </div>
      </footer>

      {/* DRS Modals */}
      <DrsModals
        result={result}
        showEmailModal={showEmailModal}
        setShowEmailModal={setShowEmailModal}
        showShareModal={showShareModal}
        setShowShareModal={setShowShareModal}
      />
    </div>
  );
};
