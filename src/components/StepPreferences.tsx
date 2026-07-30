import React, { useState } from 'react';
import { BudgetTier, CravingType, EatingLocation, GoalType, MealTime } from '../types';
import { ChevronDown, ChevronRight, SlidersHorizontal, Check, ChefHat, X, ArrowLeft } from 'lucide-react';

interface StepPreferencesProps {
  goal: GoalType;
  setGoal: (g: GoalType) => void;
  country: string;
  setCountry: (c: string) => void;
  regionState: string;
  setRegionState: (r: string) => void;
  craving: CravingType;
  setCraving: (c: CravingType) => void;
  mealTime: MealTime;
  setMealTime: (m: MealTime) => void;
  dietRestrictions: string[];
  toggleDietRestriction: (d: string) => void;
  eatingLocation: EatingLocation | undefined;
  setEatingLocation: (l: EatingLocation) => void;
  budget: BudgetTier | undefined;
  setBudget: (b: BudgetTier) => void;
  onStartEngine: () => void;
  onStartSmartKitchen: (ingredients: string[]) => void;
}

interface GoalOption {
  id: GoalType;
  label: string;
  emoji: string;
}

const GOALS_LIST: GoalOption[] = [
  { id: 'Eat Healthy', label: 'Eat Healthy', emoji: '🍇' },
  { id: 'Lose Weight', label: 'Lose Weight', emoji: '⚖️' },
  { id: 'Build Muscle', label: 'Build Muscle', emoji: '💪' },
  { id: 'Energy Boost', label: 'Energy Boost', emoji: '⚡' },
  { id: 'Brain Focus', label: 'Brain Focus', emoji: '🧠' },
  { id: 'Heart Friendly', label: 'Heart Friendly', emoji: '❤️' },
  { id: 'Family Meal', label: 'Family Meal', emoji: '👨‍👩‍👧‍👦' },
  { id: 'Budget Meal', label: 'Budget Meal', emoji: '💰' },
  { id: 'Kids', label: 'Kids', emoji: '👶' },
  { id: 'Cheat Meal', label: 'Cheat Meal', emoji: '🍩' },
  { id: 'Party / Drinks', label: 'Party / Drinks', emoji: '🎉' },
  { id: 'Late Night', label: 'Late Night', emoji: '🌙' },
];

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Singapore',
  'United Arab Emirates',
  'Germany',
  'France',
  'Japan',
  'Other / International',
];

const REGIONS_MAP: Record<string, string[]> = {
  India: ['Maharashtra', 'Delhi NCR', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'West Bengal', 'Telangana', 'Punjab', 'Kerala', 'Rajasthan'],
  'United States': ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Washington', 'Massachusetts', 'Georgia', 'Colorado'],
  'United Kingdom': ['Greater London', 'South East', 'North West', 'Scotland', 'Wales', 'Midlands'],
  Canada: ['Ontario', 'British Columbia', 'Quebec', 'Alberta'],
  Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
};

const CRAVINGS: CravingType[] = [
  'Warm & Comforting',
  'Fresh & Crisp',
  'Savory & Bold',
  'Sweet & Lite',
  'Quick & Energizing',
];

const MEAL_TIMES: MealTime[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Post-Workout'];

const DIET_OPTIONS = [
  'Gluten-Free',
  'Dairy-Free',
  'Vegetarian',
  'Vegan',
  'Low Sodium',
  'Nut-Free',
];

const EATING_LOCATIONS: { id: EatingLocation; label: string; emoji: string }[] = [
  { id: 'Home', label: 'Home', emoji: '🏠' },
  { id: 'Office', label: 'Office', emoji: '🏢' },
  { id: 'Restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'Fast Food', label: 'Fast Food', emoji: '🍔' },
  { id: 'Cafe', label: 'Cafe', emoji: '☕' },
  { id: 'Grocery Store', label: 'Grocery Store', emoji: '🛒' },
  { id: 'Party', label: 'Party', emoji: '🎉' },
];

const BUDGETS: { id: BudgetTier; label: string }[] = [
  { id: 'Low', label: '$ Low' },
  { id: 'Medium', label: '$$ Medium' },
  { id: 'High', label: '$$$ High' },
];

const QUICK_ADD_INGREDIENTS = [
  'Eggs', 'Rice', 'Chicken', 'Spinach', 'Tomato', 'Onion',
  'Garlic', 'Paneer', 'Tofu', 'Potato', 'Yogurt', 'Bread',
];

export const StepPreferences: React.FC<StepPreferencesProps> = ({
  goal,
  setGoal,
  country,
  setCountry,
  regionState,
  setRegionState,
  craving,
  setCraving,
  mealTime,
  setMealTime,
  dietRestrictions,
  toggleDietRestriction,
  eatingLocation,
  setEatingLocation,
  budget,
  setBudget,
  onStartEngine,
  onStartSmartKitchen,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [smartKitchenOpen, setSmartKitchenOpen] = useState(false);
  const [pantryTags, setPantryTags] = useState<string[]>([]);
  const [pantryInput, setPantryInput] = useState('');

  const availableRegions = REGIONS_MAP[country] || [];

  const handleSelectGoalAndRun = (selectedGoal: GoalType) => {
    setGoal(selectedGoal);
  };

  const addPantryTag = (raw: string) => {
    const value = raw.trim();
    if (!value) return;
    setPantryTags((prev) => (prev.some((p) => p.toLowerCase() === value.toLowerCase()) ? prev : [...prev, value]));
    setPantryInput('');
  };

  const removePantryTag = (value: string) => {
    setPantryTags((prev) => prev.filter((p) => p !== value));
  };

  const handlePantryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addPantryTag(pantryInput);
    }
  };

  return (
    <div className="space-y-6">
      {/* ==========================================
          STEP 1: LOCATION
         ========================================== */}
      <div className="space-y-4">
        <div className="space-y-1">
          <div className="text-[11px] font-mono-custom font-extrabold text-[#1C8354] uppercase tracking-widest">
            STEP 1
          </div>
          <h1 className="font-display font-bold text-2xl md:text-[26px] text-[#0B2E22] leading-tight">
            Where are you, and what are we deciding on?
          </h1>
          <p className="text-xs text-[#5B7A6E] leading-relaxed">
            Just the essentials — this takes about 15 seconds.
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {/* Country Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0B2E22]">
              Country <span className="text-[#B23B2E]">*</span>
            </label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value);
                  const newRegions = REGIONS_MAP[e.target.value] || [];
                  setRegionState(newRegions[0] || '');
                }}
                className="w-full px-4 py-3.5 bg-[#F5F9F6] border border-[#DCE8E1] rounded-2xl text-xs font-semibold text-[#0B2E22] appearance-none focus:outline-none focus:border-[#1C8354] transition-all cursor-pointer pr-10 shadow-xs"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-[#1C8354] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Region / State Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0B2E22]">
              Region / State <span className="text-[#5B7A6E] font-normal">(optional)</span>
            </label>
            <div className="relative">
              {availableRegions.length > 0 ? (
                <select
                  value={regionState}
                  onChange={(e) => setRegionState(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#F5F9F6] border border-[#DCE8E1] rounded-2xl text-xs font-semibold text-[#0B2E22] appearance-none focus:outline-none focus:border-[#1C8354] transition-all cursor-pointer pr-10 shadow-xs"
                >
                  <option value="">Select Region / State</option>
                  {availableRegions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. State, Province, or City"
                  value={regionState}
                  onChange={(e) => setRegionState(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#F5F9F6] border border-[#DCE8E1] rounded-2xl text-xs font-semibold text-[#0B2E22] focus:outline-none focus:border-[#1C8354] transition-all shadow-xs"
                />
              )}
              {availableRegions.length > 0 && (
                <ChevronDown className="w-4 h-4 text-[#1C8354] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          STEP 2: SMART KITCHEN™ — banner OR ingredient panel
         ========================================== */}
      {!smartKitchenOpen && (
        <button
          type="button"
          onClick={() => setSmartKitchenOpen(true)}
          className="w-full bg-[#F5F9F6] hover:bg-[#EAF3EC] border-2 border-dashed border-[#1C8354]/40 hover:border-[#1C8354] rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 group shadow-xs space-y-1"
        >
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-[#114B36] group-hover:text-[#1C8354] transition-colors">
            <span className="text-base">🍳</span>
            <span>Or try Smart Kitchen™ — cook with what you already have</span>
          </div>
          <div className="text-xs font-bold text-[#1C8354] group-hover:translate-x-1 transition-transform inline-block">
            →
          </div>
        </button>
      )}

      {smartKitchenOpen && (
        <div className="bg-[#F5F9F6] border border-[#DCE8E1] rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-[#114B36]">
              <ChefHat className="w-4 h-4 text-[#1C8354]" />
              <span>Smart Kitchen™ — what do you have on hand?</span>
            </div>
            <button type="button"
              onClick={() => setSmartKitchenOpen(false)}
              className="flex items-center gap-1 text-xs font-bold text-[#5B7A6E] hover:text-[#0B2E22] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
          </div>

          <p className="text-xs text-[#5B7A6E] leading-relaxed">
            Add the ingredients you already have. We'll build a Balanced Score™ recipe using only what's actually in your kitchen.
          </p>

          {/* Tag input */}
          <div className="flex flex-wrap gap-1.5 p-2.5 bg-white border border-[#DCE8E1] rounded-xl min-h-[46px]">
            {pantryTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#EAF3EC] text-[#114B36] text-xs font-bold rounded-full"
              >
                {tag}
                <button type="button" onClick={() => removePantryTag(tag)} aria-label={`Remove ${tag}`} className="cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={pantryInput}
              onChange={(e) => setPantryInput(e.target.value)}
              onKeyDown={handlePantryKeyDown}
              onBlur={() => addPantryTag(pantryInput)}
              placeholder={pantryTags.length ? 'Add another…' : 'Type an ingredient and press Enter'}
              className="flex-1 min-w-[120px] text-xs font-semibold text-[#0B2E22] focus:outline-none bg-transparent py-1"
            />
          </div>

          {/* Quick-add chips */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono-custom font-bold text-[#5B7A6E] uppercase tracking-wider">
              Quick Add
            </div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ADD_INGREDIENTS.filter((i) => !pantryTags.includes(i)).map((ing) => (
                <button type="button"
                  key={ing}
                  onClick={() => addPantryTag(ing)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-full border border-[#DCE8E1] bg-white text-[#0B2E22] hover:border-[#1C8354] transition-all cursor-pointer"
                >
                  + {ing}
                </button>
              ))}
            </div>
          </div>

          {/* Meal time still matters for recipe filtering */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono-custom font-bold text-[#5B7A6E] uppercase">
              Meal Time
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {MEAL_TIMES.map((m) => (
                <button type="button"
                  key={m}
                  onClick={() => setMealTime(m)}
                  aria-pressed={mealTime === m}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                    mealTime === m
                      ? 'bg-[#0B2E22] text-white border-[#0B2E22]'
                      : 'bg-white text-[#0B2E22] border-[#DCE8E1]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button type="button"
            onClick={() => onStartSmartKitchen(pantryTags)}
            disabled={pantryTags.length === 0}
            className={`w-full py-3.5 font-display font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              pantryTags.length === 0
                ? 'bg-[#DCE8E1] text-[#8AA79A] cursor-not-allowed'
                : 'bg-[#1C8354] hover:bg-[#114B36] text-white'
            }`}
          >
            <span>Generate My Recipe</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {!smartKitchenOpen && (
        <>
          {/* ==========================================
              STEP 3: GOAL SELECTION
             ========================================== */}
          <div className="space-y-3 pt-1">
            <p className="text-xs text-[#5B7A6E] leading-relaxed font-medium">
              Pick the single best match — you can always come back for another decision.
            </p>

            {/* 12 Goals 2-Column Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {GOALS_LIST.map((item) => {
                const isSelected = goal === item.id;
                return (
                  <button type="button"
                    key={item.id}
                    onClick={() => handleSelectGoalAndRun(item.id)}
                    aria-pressed={isSelected}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-[#114B36] text-white border-[#114B36] shadow-md ring-2 ring-[#1C8354]/30'
                        : 'bg-[#F5F9F6] text-[#0B2E22] border-[#DCE8E1] hover:border-[#1C8354] hover:bg-[#EAF3EC]'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{item.emoji}</span>
                    <span className="text-xs md:text-sm font-bold leading-tight flex-1">
                      {item.label}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#9FD8BE] flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Fine-Tuning Drawer Toggle */}
          <div className="pt-2 border-t border-[#E2ECE6]">
            <button type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-expanded={showAdvanced}
              className="w-full py-2 flex items-center justify-between text-xs font-bold text-[#5B7A6E] hover:text-[#0B2E22] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#1C8354]" />
                <span>Optional Filters (Craving, Meal Time, Diet, Where, Budget)</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-[#F5F9F6] border border-[#E2ECE6] rounded-2xl space-y-4 animate-in fade-in zoom-in-95">
                {/* Craving */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono-custom font-bold text-[#5B7A6E] uppercase">
                    Craving or Vibe
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {CRAVINGS.map((c) => (
                      <button type="button"
                        key={c}
                        onClick={() => setCraving(c)}
                        aria-pressed={craving === c}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${
                          craving === c
                            ? 'bg-[#1C8354] text-white border-[#1C8354]'
                            : 'bg-white text-[#0B2E22] border-[#DCE8E1]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meal Time */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono-custom font-bold text-[#5B7A6E] uppercase">
                    Meal Time
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {MEAL_TIMES.map((m) => (
                      <button type="button"
                        key={m}
                        onClick={() => setMealTime(m)}
                        aria-pressed={mealTime === m}
                        className={`py-2 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                          mealTime === m
                            ? 'bg-[#0B2E22] text-white border-[#0B2E22]'
                            : 'bg-white text-[#0B2E22] border-[#DCE8E1]'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eating Location */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono-custom font-bold text-[#5B7A6E] uppercase">
                    Where Are You Eating?
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {EATING_LOCATIONS.map((l) => (
                      <button type="button"
                        key={l.id}
                        onClick={() => setEatingLocation(l.id)}
                        aria-pressed={eatingLocation === l.id}
                        className={`py-2 px-1.5 text-[11px] font-semibold rounded-xl border transition-all text-center flex flex-col items-center gap-0.5 cursor-pointer ${
                          eatingLocation === l.id
                            ? 'bg-[#0B2E22] text-white border-[#0B2E22]'
                            : 'bg-white text-[#0B2E22] border-[#DCE8E1]'
                        }`}
                      >
                        <span className="text-sm leading-none">{l.emoji}</span>
                        <span className="leading-tight">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono-custom font-bold text-[#5B7A6E] uppercase">
                    Budget
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {BUDGETS.map((b) => (
                      <button type="button"
                        key={b.id}
                        onClick={() => setBudget(b.id)}
                        aria-pressed={budget === b.id}
                        className={`py-2 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                          budget === b.id
                            ? 'bg-[#C98A2C] text-white border-[#C98A2C]'
                            : 'bg-white text-[#0B2E22] border-[#DCE8E1]'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diet Options */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono-custom font-bold text-[#5B7A6E] uppercase">
                    Dietary Options
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DIET_OPTIONS.map((d) => {
                      const selected = dietRestrictions.includes(d);
                      return (
                        <button type="button"
                          key={d}
                          onClick={() => toggleDietRestriction(d)}
                          aria-pressed={selected}
                          className={`p-2 text-xs font-medium rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            selected
                              ? 'bg-[#FBF3E4] text-[#C98A2C] border-[#C98A2C] font-bold'
                              : 'bg-white text-[#5B7A6E] border-[#DCE8E1]'
                          }`}
                        >
                          <span>{d}</span>
                          {selected && <span className="text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Action Button */}
          <button type="button"
            onClick={onStartEngine}
            className="w-full py-4 bg-[#1C8354] hover:bg-[#114B36] text-white font-display font-bold text-base rounded-2xl shadow-lg shadow-[#1C8354]/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Get Balanced Buyte™ Decision</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </>
      )}
    </div>
  );
};
