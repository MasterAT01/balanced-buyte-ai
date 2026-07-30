import React, { useState } from 'react';
import { BudgetTier, CravingType, DecisionResult, EatingLocation, GoalType, MealTime, SavedJourneyItem } from './types';
import { runBalancedBuyteEngine, runSmartKitchenEngine } from './utils/engine';
import { enhanceWithGemini } from './services/geminiService';
import { Header } from './components/Header';
import { StepPreferences } from './components/StepPreferences';
import { StepAnalyzing } from './components/StepAnalyzing';
import { ResultScreen } from './components/ResultScreen';

export default function App() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [country, setCountry] = useState<string>('India');
  const [regionState, setRegionState] = useState<string>('Maharashtra');
  const [goal, setGoal] = useState<GoalType>('Eat Healthy');
  const [craving, setCraving] = useState<CravingType>('Fresh & Crisp');
  const [mealTime, setMealTime] = useState<MealTime>('Lunch');
  const [dietRestrictions, setDietRestrictions] = useState<string[]>([]);
  const [eatingLocation, setEatingLocation] = useState<EatingLocation | undefined>(undefined);
  const [budget, setBudget] = useState<BudgetTier | undefined>(undefined);
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);

  // Saved Journey items
  const [history, setHistory] = useState<SavedJourneyItem[]>([]);
  const [favorites, setFavorites] = useState<SavedJourneyItem[]>([]);

  const toggleDietRestriction = (restriction: string) => {
    setDietRestrictions((prev) =>
      prev.includes(restriction)
        ? prev.filter((r) => r !== restriction)
        : [...prev, restriction]
    );
  };

  // ------------------------------------------------------------------
  // Shared by both the standard engine path and Smart Kitchen: records
  // the result to Journey history, then — TASK 4 — asynchronously asks
  // Gemini to rewrite the already-decided facts into warmer language.
  // The Balanced Buyte Decision Engine has ALREADY chosen everything by
  // the time this runs; Gemini only ever upgrades text in place, never
  // the recommendation itself. If Gemini is unavailable or fails, the
  // engine's own rule-based text (already on screen) simply stays.
  // ------------------------------------------------------------------
  const finalizeResult = (result: DecisionResult) => {
    setDecisionResult(result);

    const newItem: SavedJourneyItem = {
      id: result.id,
      title: result.bestBuyteName,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      score: result.meterScore,
      goal: result.goal,
      isFavorite: false,
      result,
    };
    setHistory((prev) => [newItem, ...prev]);

    enhanceWithGemini(result)
      .then((coach) => {
        if (!coach) return; // disabled, unconfigured, or failed — rule-based text stays
        setDecisionResult((prev) => {
          if (!prev || prev.id !== result.id) return prev; // a newer decision already replaced this one
          return {
            ...prev,
            coachRationale: coach.coachRationale,
            coachTip: coach.coachTip,
            aiEnhanced: true,
            balancedSip: { ...prev.balancedSip, whyPairingWorks: coach.sipExplanation },
            recipe: coach.healthySwap
              ? { ...prev.recipe, healthySwaps: [coach.healthySwap, ...prev.recipe.healthySwaps] }
              : prev.recipe,
          };
        });
      })
      .catch(() => {
        // enhanceWithGemini already resolves null on any internal failure —
        // this is just a final safety net so a stray rejection can never
        // surface as an unhandled promise rejection in the console.
      });
  };

  const handleStartEngine = async () => {
    setCurrentStep(2);
    setEngineError(null);
    try {
      const result = await runBalancedBuyteEngine({
        goal,
        craving,
        mealTime,
        dietRestrictions,
        location: { country, regionState },
        eatingLocation,
        budget,
      });
      finalizeResult(result);
    } catch (err) {
      console.error('Balanced Buyte engine failed:', err);
      setEngineError("We couldn't put together your decision — please try again.");
      setCurrentStep(1);
    }
  };

  // TASK 2 — SMART KITCHEN™: never runs the goal-driven engine. Scores
  // the food database purely against what the user says they have on
  // hand, then produces the same DRS shape everything else uses.
  const handleStartSmartKitchen = async (ingredients: string[]) => {
    setCurrentStep(2);
    setEngineError(null);
    try {
      const result = await runSmartKitchenEngine(
        ingredients,
        mealTime,
        dietRestrictions,
        { country, regionState },
        goal,
        craving
      );
      finalizeResult(result);
    } catch (err) {
      console.error('Smart Kitchen engine failed:', err);
      setEngineError("We couldn't match your ingredients — please try again.");
      setCurrentStep(1);
    }
  };

  const handleEngineComplete = () => {
    setCurrentStep(3);
  };

  const handleRestart = () => {
    setCurrentStep(1);
  };

  const handleNewGoal = () => {
    setGoal('Eat Healthy');
    setCraving('Fresh & Crisp');
    setMealTime('Lunch');
    setDietRestrictions([]);
    setEatingLocation(undefined);
    setBudget(undefined);
    setCurrentStep(1);
  };

  const handleToggleFavorite = (id: string) => {
    if (!decisionResult) return;

    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === id);
      if (exists) {
        return prev.filter((item) => item.id !== id);
      } else {
        const itemToFav: SavedJourneyItem = {
          id: decisionResult.id,
          title: decisionResult.bestBuyteName,
          date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
          score: decisionResult.meterScore,
          goal: decisionResult.goal,
          isFavorite: true,
          result: decisionResult,
        };
        return [itemToFav, ...prev];
      }
    });
  };

  return (
    <div className="min-h-screen py-4 md:py-8 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-[480px] bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col min-h-[90vh] md:min-h-[850px] border border-[#DCE8E1]">
        {/* Persistent App Header */}
        <Header currentStep={currentStep} />

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6">
          {currentStep === 1 && engineError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-[#FDECEC] border border-[#F0A94E]/40 text-[#8A3B2A] text-xs font-medium"
            >
              {engineError}
            </div>
          )}

          {currentStep === 1 && (
            <StepPreferences
              goal={goal}
              setGoal={setGoal}
              country={country}
              setCountry={setCountry}
              regionState={regionState}
              setRegionState={setRegionState}
              craving={craving}
              setCraving={setCraving}
              mealTime={mealTime}
              setMealTime={setMealTime}
              dietRestrictions={dietRestrictions}
              toggleDietRestriction={toggleDietRestriction}
              eatingLocation={eatingLocation}
              setEatingLocation={setEatingLocation}
              budget={budget}
              setBudget={setBudget}
              onStartEngine={handleStartEngine}
              onStartSmartKitchen={handleStartSmartKitchen}
            />
          )}

          {currentStep === 2 && (
            <StepAnalyzing onComplete={handleEngineComplete} />
          )}

          {currentStep === 3 && decisionResult && (
            <ResultScreen
              result={decisionResult}
              onRestart={handleRestart}
              onNewGoal={handleNewGoal}
              favorites={favorites}
              history={history}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </main>
      </div>
    </div>
  );
}
