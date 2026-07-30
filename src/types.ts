export type GoalType =
  | 'Eat Healthy'
  | 'Lose Weight'
  | 'Build Muscle'
  | 'Energy Boost'
  | 'Brain Focus'
  | 'Heart Friendly'
  | 'Family Meal'
  | 'Budget Meal'
  | 'Kids'
  | 'Cheat Meal'
  | 'Party / Drinks'
  | 'Late Night'
  | 'High Protein'
  | 'Weight Loss';

export type CravingType =
  | 'Warm & Comforting'
  | 'Fresh & Crisp'
  | 'Savory & Bold'
  | 'Sweet & Lite'
  | 'Quick & Energizing';

export type MealTime = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Post-Workout';

export type DeliveryMode = 'Cook' | 'Eat Out' | 'Shop Ingredients' | 'Order Online';

export type EatingLocation = 'Home' | 'Office' | 'Restaurant' | 'Fast Food' | 'Cafe' | 'Grocery Store' | 'Party';

export type BudgetTier = 'Low' | 'Medium' | 'High';

export type CuisineTag = 'Indian' | 'American' | 'British' | 'MiddleEastern' | 'Japanese' | 'European' | 'Asian' | 'Global';

export interface LocationPreference {
  country: string;
  regionState: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sodium: string;
}

export interface HealthySwap {
  original: string;
  replacement: string;
  caloricSavings: string;
}

export interface SmartKitchenRecipe {
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  steps: string[];
  youtubeVideoId: string;
  youtubeVideoTitle: string;
  healthySwaps: HealthySwap[];
}

export interface ShoppingIngredient {
  id: string;
  name: string;
  amount: string;
  category: 'Produce' | 'Protein' | 'Dairy' | 'Pantry';
  estimatedCost: number;
  checked?: boolean;
}

export interface RestaurantSuggestion {
  id: string;
  name: string;
  dishName: string;
  distance: string;
  healthyCustomization: string;
  calories: number;
  rating: number;
  estimatedCost: string;
  mapAddress: string;
}

export interface BalancedSip {
  primary: string;
  primaryEmoji: string;
  alternative: string;
  alternativeEmoji: string;
  whyPairingWorks: string;
  hydrationScore: number; // 0-100
}

// ------------------------------------------------------------------
// GLOBAL FOOD DATABASE — the structured dataset the Decision Engine
// scores against. Nothing about a recommendation is hardcoded per
// goal; every field here is an input to scoring.
// ------------------------------------------------------------------
export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  category: string;
  cuisine: CuisineTag;
  mealTimes: MealTime[];
  goals: GoalType[];
  dietExcludes: string[]; // diet options this dish can NOT satisfy
  budget: BudgetTier;
  cravings: CravingType[];
  nutrition: NutritionInfo;
  cookMin: number;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
  ingredients: string[];
  probiotic?: boolean;
}

export interface DrinkItem {
  id: string;
  name: string;
  emoji: string;
  goals: GoalType[];
  mealTimes: MealTime[];
  hydrationScore: number;
  probiotic?: boolean;
  calm?: boolean; // suited to Dinner / Late Night wind-down pairing
}

export interface AlternateOption {
  name: string;
  emoji: string;
  score: number;
  reason: string;
}

export interface AvoidOption {
  name: string;
  emoji: string;
  reason: string;
}

// ------------------------------------------------------------------
// SECTION 13 — BALANCED RECOVERY™
// Never shaming, never calorie-compensation, never restriction —
// just one or two supportive, practical next steps. Only present when
// the context actually calls for it (heavy meal, cheat meal, party /
// drinks, fast food, late night) — omitted entirely otherwise.
// ------------------------------------------------------------------
export interface RecoveryGuidance {
  message: string;
  actions: string[]; // 1-2 practical, supportive actions
  closingLine: string;
}

export interface DecisionResult {
  id: string;
  timestamp: string;
  goal: GoalType;
  craving: CravingType;
  mealTime: MealTime;
  dietRestrictions: string[];
  location?: LocationPreference;
  eatingLocation?: EatingLocation;
  budget?: BudgetTier;

  // Balanced Meter & Decision Confidence
  meterScore: number; // 0-100
  confidencePercentage: number; // e.g. 96%
  confidenceBreakdown: string[];

  // Best Buyte
  bestBuyteName: string;
  bestBuyteEmoji: string;
  bestBuyteDescription: string;
  category: string;
  nutrition: NutritionInfo;
  coachRationale: string;
  aiEnhanced?: boolean; // true once Gemini has upgraded the coach text

  // Balanced Sip
  balancedSip: BalancedSip;

  // Better Options / One To Avoid / Coach Tip
  betterOptions: AlternateOption[];
  oneToAvoid: AvoidOption;
  coachTip: string;

  // Balanced Recovery™ — present only when the context calls for it
  recoveryGuidance?: RecoveryGuidance;

  // Smart Kitchen
  recipe: SmartKitchenRecipe;
  fromPantry?: boolean;
  pantryMatchNote?: string;

  // Shopping List
  shoppingList: ShoppingIngredient[];

  // Restaurants
  restaurants: RestaurantSuggestion[];

  // Delivery & Order
  orderLinks: {
    platform: string;
    url: string;
    icon: string;
  }[];
}

export interface SavedJourneyItem {
  id: string;
  title: string;
  date: string;
  score: number;
  goal: string;
  isFavorite: boolean;
  result: DecisionResult;
}

export interface MealPlanDay {
  day: string;
  mealName: string;
  sipName: string;
  calories: number;
  score: number;
}
