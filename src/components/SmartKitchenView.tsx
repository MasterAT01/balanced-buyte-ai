import React, { useState } from 'react';
import { SmartKitchenRecipe, NutritionInfo } from '../types';
import { ChefHat, Clock, Flame, Sparkles, Youtube, CheckCircle2, Circle } from 'lucide-react';

interface SmartKitchenViewProps {
  recipe: SmartKitchenRecipe;
  nutrition: NutritionInfo;
}

export const SmartKitchenView: React.FC<SmartKitchenViewProps> = ({ recipe, nutrition }) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="mt-4 bg-white border border-[#DCE8E1] rounded-[20px] p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-[#E2ECE6] pb-3">
        <div className="flex items-center gap-2 font-display font-bold text-base text-[#0B2E22]">
          <ChefHat className="w-5 h-5 text-[#1C8354]" />
          <span>Smart Kitchen™ Guide</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono-custom text-[#5B7A6E]">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#1C8354]" />
            {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#C98A2C]" />
            {nutrition.calories} kcal
          </span>
        </div>
      </div>

      {/* Step-by-Step Cooking Guide */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono-custom font-bold text-[#5B7A6E] uppercase tracking-wider">
          Step-by-Step Preparation
        </h4>
        <div className="space-y-2">
          {recipe.steps.map((step, idx) => {
            const isCompleted = completedSteps.includes(idx);
            return (
              <button type="button"
                key={idx}
                onClick={() => toggleStep(idx)}
                aria-pressed={isCompleted}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  isCompleted
                    ? 'bg-[#EAF3EC] border-[#1C8354]/40 text-[#114B36]'
                    : 'bg-[#F5F9F6] border-[#E2ECE6] text-[#0B2E22] hover:border-[#1C8354]'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1C8354] mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-[#5B7A6E] mt-0.5 flex-shrink-0" />
                )}
                <span className={`text-xs leading-relaxed ${isCompleted ? 'line-through opacity-75' : ''}`}>
                  <strong className="font-mono-custom mr-1">{idx + 1}.</strong> {step}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Complete Nutrition Breakdown */}
      <div className="bg-[#F5F9F6] border border-[#E2ECE6] rounded-xl p-4">
        <h4 className="text-xs font-mono-custom font-bold text-[#5B7A6E] uppercase tracking-wider mb-3">
          Macro & Micro Nutrition
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-2.5 rounded-lg border border-[#E2ECE6]">
            <div className="text-[10px] font-mono-custom text-[#5B7A6E]">Protein</div>
            <div className="font-display font-bold text-sm text-[#0B2E22]">{nutrition.protein}g</div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-[#E2ECE6]">
            <div className="text-[10px] font-mono-custom text-[#5B7A6E]">Carbs</div>
            <div className="font-display font-bold text-sm text-[#0B2E22]">{nutrition.carbs}g</div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-[#E2ECE6]">
            <div className="text-[10px] font-mono-custom text-[#5B7A6E]">Healthy Fats</div>
            <div className="font-display font-bold text-sm text-[#0B2E22]">{nutrition.fats}g</div>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs text-[#5B7A6E] font-mono-custom mt-3 pt-2 border-t border-[#E2ECE6]">
          <span>Dietary Fiber: {nutrition.fiber}g</span>
          <span>Sodium: {nutrition.sodium}</span>
        </div>
      </div>

      {/* YouTube Video Tutorial Embed */}
      {recipe.youtubeVideoId && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono-custom font-bold text-[#5B7A6E] uppercase tracking-wider">
            <Youtube className="w-4 h-4 text-red-600" />
            <span>Recipe Video Tutorial</span>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden border border-[#DCE8E1] bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${recipe.youtubeVideoId}?rel=0`}
              title={recipe.youtubeVideoTitle}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Healthy Swaps */}
      {recipe.healthySwaps && recipe.healthySwaps.length > 0 && (
        <div className="bg-[#FBF3E4] border border-[#C98A2C]/30 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono-custom font-bold text-[#C98A2C]">
            <Sparkles className="w-4 h-4" />
            <span>Smart Healthy Swaps</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {recipe.healthySwaps.map((swap, i) => (
              <div key={i} className="flex items-center justify-between text-[#0B2E22]">
                <span>
                  Swap <strong>{swap.original}</strong> → <strong>{swap.replacement}</strong>
                </span>
                <span className="font-mono-custom text-[11px] font-bold text-[#1C8354]">
                  {swap.caloricSavings}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
