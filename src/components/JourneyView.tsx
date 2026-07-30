import React, { useState } from 'react';
import { MealPlanDay, SavedJourneyItem } from '../types';
import { INITIAL_MEAL_PLAN } from '../data/mockData';
import { Compass, Star, Calendar, History, Bookmark, ChevronDown, ChevronUp } from 'lucide-react';

interface JourneyViewProps {
  favorites: SavedJourneyItem[];
  history: SavedJourneyItem[];
  onToggleFavorite: (id: string) => void;
}

export const JourneyView: React.FC<JourneyViewProps> = ({
  favorites,
  history,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'mealplanner' | 'history'>('favorites');
  const [expandedSection, setExpandedSection] = useState<boolean>(true);
  const [mealPlan] = useState<MealPlanDay[]>(INITIAL_MEAL_PLAN);

  return (
    <div className="bg-[#F5F9F6] border border-[#E2ECE6] rounded-[20px] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2ECE6] pb-3">
        <div className="flex items-center gap-2 font-mono-custom text-xs font-bold text-[#5B7A6E] uppercase tracking-wider">
          <Compass className="w-4 h-4 text-[#1C8354]" />
          <span>Your Journey</span>
        </div>
        <button type="button"
          onClick={() => setExpandedSection(!expandedSection)}
          aria-expanded={expandedSection}
          aria-label={expandedSection ? 'Collapse Journey section' : 'Expand Journey section'}
          className="text-xs text-[#5B7A6E] flex items-center gap-1 hover:text-[#0B2E22]"
        >
          {expandedSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expandedSection && (
        <>
          <div role="tablist" aria-label="Journey sections" className="flex gap-1.5 p-1 bg-[#E2ECE6]/50 rounded-xl">
            <button type="button"
              role="tab"
              aria-selected={activeTab === 'favorites'}
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'favorites'
                  ? 'bg-[#114B36] text-white shadow-sm'
                  : 'text-[#5B7A6E] hover:text-[#0B2E22]'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Favorites ({favorites.length})</span>
            </button>
            <button type="button"
              role="tab"
              aria-selected={activeTab === 'mealplanner'}
              onClick={() => setActiveTab('mealplanner')}
              className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'mealplanner'
                  ? 'bg-[#114B36] text-white shadow-sm'
                  : 'text-[#5B7A6E] hover:text-[#0B2E22]'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Meal Plan</span>
            </button>
            <button type="button"
              role="tab"
              aria-selected={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'history'
                  ? 'bg-[#114B36] text-white shadow-sm'
                  : 'text-[#5B7A6E] hover:text-[#0B2E22]'
              }`}
            >
              <History className="w-3 h-3" />
              <span>History ({history.length})</span>
            </button>
          </div>

          <div className="pt-2">
            {activeTab === 'favorites' && (
              <div className="space-y-2">
                {favorites.length === 0 ? (
                  <p className="text-xs text-[#5B7A6E] text-center py-4 italic">
                    No favorite Best Buytes saved yet. Click the bookmark icon on your decision to save!
                  </p>
                ) : (
                  favorites.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-[#E2ECE6] rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-display font-bold text-xs text-[#0B2E22]">{item.title}</div>
                        <div className="text-[10px] font-mono-custom text-[#5B7A6E]">
                          {item.goal} • Score: {item.score}/100
                        </div>
                      </div>
                      <button type="button"
                        onClick={() => onToggleFavorite(item.id)}
                        aria-label={`Remove ${item.title} from favorites`}
                        className="text-[#C98A2C] hover:scale-110 transition-transform"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'mealplanner' && (
              <div className="space-y-2">
                {mealPlan.map((day) => (
                  <div
                    key={day.day}
                    className="p-3 bg-white border border-[#E2ECE6] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono-custom font-bold text-[#1C8354] uppercase text-[10px] mr-2">
                        {day.day}
                      </span>
                      <strong className="text-[#0B2E22]">{day.mealName}</strong>
                      <div className="text-[10px] text-[#5B7A6E]">Sip: {day.sipName}</div>
                    </div>
                    <div className="font-mono-custom text-[11px] font-bold text-[#0B2E22]">
                      {day.calories} kcal
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-xs text-[#5B7A6E] text-center py-4 italic">
                    Your previous decisions will appear here.
                  </p>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white border border-[#E2ECE6] rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-display font-bold text-xs text-[#0B2E22]">{item.title}</div>
                        <div className="text-[10px] font-mono-custom text-[#5B7A6E]">
                          {item.date} • Goal: {item.goal}
                        </div>
                      </div>
                      <span className="text-xs font-mono-custom font-bold text-[#1C8354] bg-[#EAF3EC] px-2 py-0.5 rounded-full">
                        {item.score}/100
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
