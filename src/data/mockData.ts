import { MealPlanDay } from '../types';

// NOTE: This file previously also exported `DEFAULT_PRESETS` — a set of
// static, hardcoded recommendations (one per goal) with unrelated
// stock-photo image URLs and clinical/jargon-heavy language. It was
// never imported anywhere; the Balanced Buyte Decision Engine
// (src/utils/engine.ts) is the only source of recommendations in this
// app. Removed entirely per Task 1 — no static/hardcoded recommendation
// logic should exist in the codebase.

export const INITIAL_MEAL_PLAN: MealPlanDay[] = [
  { day: 'Monday', mealName: 'Rainbow Mediterranean Quinoa Bowl', sipName: 'Cold-Pressed Green Apple Celery Juice', calories: 420, score: 97 },
  { day: 'Tuesday', mealName: 'Zesty Turkey & Lettuce Wraps', sipName: 'Cucumber Mint Infusion', calories: 350, score: 98 },
  { day: 'Wednesday', mealName: 'Double-Grilled Chicken & Brown Rice', sipName: 'Tart Cherry Electrolyte Drink', calories: 640, score: 96 },
  { day: 'Thursday', mealName: 'Wild Salmon & Sweet Potato Energy Plate', sipName: 'Sparkling Yerba Mate', calories: 510, score: 96 },
  { day: 'Friday', mealName: 'Ahi Tuna Avocado Nootropic Bowl', sipName: 'Iced Ceremonial Matcha', calories: 460, score: 98 },
];
