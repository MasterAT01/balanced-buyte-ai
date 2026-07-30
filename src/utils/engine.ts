import {
  AlternateOption,
  AvoidOption,
  BalancedSip,
  BudgetTier,
  CravingType,
  DecisionResult,
  DrinkItem,
  EatingLocation,
  FoodItem,
  GoalType,
  LocationPreference,
  MealTime,
  NutritionInfo,
  RecoveryGuidance,
  RestaurantSuggestion,
  ShoppingIngredient,
  SmartKitchenRecipe,
} from '../types';
import { CUISINE_BY_COUNTRY, DRINK_ITEMS, FOOD_ITEMS } from '../data/foodDatabase';

export interface EngineContext {
  goal: GoalType;
  craving: CravingType;
  mealTime: MealTime;
  dietRestrictions: string[];
  location?: LocationPreference;
  eatingLocation?: EatingLocation;
  budget?: BudgetTier;
}

// ------------------------------------------------------------------
// A small deterministic hash — used ONLY to break exact score ties in
// a stable, repeatable way. This is not randomness: the same inputs
// always produce the same tie-break, so results stay reproducible.
// ------------------------------------------------------------------
function stableHash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 5;
}

function cuisineForLocation(location?: LocationPreference) {
  if (!location?.country) return 'Global';
  return CUISINE_BY_COUNTRY[location.country] || 'Global';
}

interface ScoredFood {
  item: FoodItem;
  score: number;
  reasons: string[];
}

// ------------------------------------------------------------------
// TASK 1 — DECISION ENGINE
// Scores EVERY candidate food item against ALL selected inputs.
// Hard filters (meal time + diet conflicts) remove unsafe/irrelevant
// items first; everything left is scored and ranked. Different
// selections change both the filter set and the score, so different
// inputs reliably produce different outputs.
// ------------------------------------------------------------------
function scoreCandidates(ctx: EngineContext, pool: FoodItem[] = FOOD_ITEMS): ScoredFood[] {
  const cuisine = cuisineForLocation(ctx.location);

  const eligible = pool.filter((item) => {
    if (!item.mealTimes.includes(ctx.mealTime)) return false;
    if (ctx.dietRestrictions.some((d) => item.dietExcludes.includes(d))) return false;
    return true;
  });

  const scored: ScoredFood[] = eligible.map((item) => {
    let score = 40; // baseline — every eligible item is at least meal-time & diet safe
    const reasons: string[] = [];

    // Region / Country / Cuisine match
    if (item.cuisine === cuisine) {
      score += 26;
      reasons.push(`Matches everyday food in ${ctx.location?.country || 'your region'}`);
    } else if (item.cuisine === 'Global') {
      score += 10;
    }

    // Goal match — the single strongest weight, per spec
    if (item.goals.includes(ctx.goal)) {
      score += 28;
      reasons.push(`Directly supports your "${ctx.goal}" goal`);
    } else {
      score += 6;
    }

    // Craving / vibe match
    if (item.cravings.includes(ctx.craving)) {
      score += 12;
      reasons.push(`Fits your "${ctx.craving}" craving`);
    }

    // Budget match
    if (ctx.budget) {
      if (item.budget === ctx.budget) {
        score += 10;
        reasons.push(`Fits your ${ctx.budget.toLowerCase()} budget`);
      } else if (ctx.budget === 'Medium' && item.budget !== 'High') {
        score += 4;
      } else if (ctx.budget === 'High') {
        score += 4;
      }
    } else {
      score += 4;
    }

    // Eating Location influence — light-touch, not a hard filter
    if (ctx.eatingLocation) {
      if ((ctx.eatingLocation === 'Fast Food' || ctx.eatingLocation === 'Cafe' || ctx.eatingLocation === 'Office') && item.cookMin <= 15) {
        score += 6;
      }
      if (ctx.eatingLocation === 'Party' && item.goals.includes('Party / Drinks')) {
        score += 10;
      }
      if (ctx.eatingLocation === 'Grocery Store' && item.budget !== 'High') {
        score += 5;
      }
      if (ctx.eatingLocation === 'Restaurant' && item.difficulty !== 'Easy') {
        score += 4;
      }
      if (ctx.eatingLocation === 'Home' && item.cookMin >= 15) {
        score += 3;
      }
    }

    // Deterministic, stable tie-break — never literal randomness
    score += stableHash(item.id + ctx.goal + ctx.mealTime + cuisine);

    return { item, score: Math.min(99, score), reasons };
  });

  return scored.sort((a, b) => b.score - a.score);
}

function pickOneToAvoid(ranked: ScoredFood[]): ScoredFood | null {
  if (ranked.length < 2) return null;
  // The lowest-scoring item that still passed the hard filters —
  // technically "safe" to eat, but clearly the weakest fit today.
  return ranked[ranked.length - 1];
}

// ------------------------------------------------------------------
// TASK 1 — BALANCED SIP™
// ------------------------------------------------------------------
function buildSip(ctx: EngineContext, item: FoodItem): BalancedSip {
  const eligible = DRINK_ITEMS.filter((d) => d.mealTimes.includes(ctx.mealTime));
  const pool = eligible.length ? eligible : DRINK_ITEMS;

  let primary: DrinkItem | undefined;
  let reasonTail = 'rounds out this meal without working against your goal';

  if (item.probiotic) {
    primary = pool.find((d) => d.probiotic);
    reasonTail = 'supports the same gut-friendly direction as your meal';
  }
  if (!primary && ctx.mealTime === 'Dinner' && pool.some((d) => d.calm)) {
    primary = pool.find((d) => d.calm);
    reasonTail = 'winds things down for the evening instead of adding stimulation this late';
  }
  if (!primary) {
    primary = pool.find((d) => d.goals.includes(ctx.goal));
  }
  if (!primary) {
    primary = pool.find((d) => d.goals.includes('Eat Healthy')) || pool[0];
  }

  const chosenPrimary = primary as DrinkItem;
  const alt =
    pool.find((d) => d.id !== chosenPrimary.id && d.goals.some((g) => chosenPrimary.goals.includes(g))) ||
    pool.find((d) => d.id !== chosenPrimary.id) ||
    chosenPrimary;

  return {
    primary: chosenPrimary.name,
    primaryEmoji: chosenPrimary.emoji,
    alternative: alt.name,
    alternativeEmoji: alt.emoji,
    hydrationScore: chosenPrimary.hydrationScore,
    whyPairingWorks: `Paired with ${item.name}, ${chosenPrimary.name.toLowerCase()} ${reasonTail}.`,
  };
}

// ------------------------------------------------------------------
// Ingredient category classifier — used to group the Shopping List.
// ------------------------------------------------------------------
function categorize(ingredient: string): ShoppingIngredient['category'] {
  const lower = ingredient.toLowerCase();
  if (/(milk|yogurt|cheese|paneer|labneh|butter|cream|halloumi|mozzarella|feta)/.test(lower)) return 'Dairy';
  if (/(chicken|beef|lamb|fish|salmon|turkey|egg|prawn|tofu|lentil|beans|chickpea|dal|paneer|protein)/.test(lower)) return 'Protein';
  if (/(rice|oats|bread|flour|noodle|pasta|quinoa|spice|sauce|oil|stock|tea|honey|sugar|cornstarch|granola|nuts|dates)/.test(lower)) return 'Pantry';
  return 'Produce';
}

function estimateCost(ingredient: string): number {
  // Deterministic estimate from the ingredient's own stable hash, so
  // the same ingredient always prices the same — never random.
  return Math.round((1.5 + (stableHash(ingredient) / 4) * 4) * 100) / 100;
}

function buildShoppingList(item: FoodItem): ShoppingIngredient[] {
  return item.ingredients.map((name, idx) => ({
    id: `${item.id}-ing-${idx}`,
    name,
    amount: '1 unit',
    category: categorize(name),
    estimatedCost: estimateCost(name),
    checked: false,
  }));
}

function buildRecipe(item: FoodItem): SmartKitchenRecipe {
  const prep = Math.max(5, Math.round(item.cookMin * 0.35));
  const cook = Math.max(3, item.cookMin - prep);
  const mainIngredients = item.ingredients.slice(0, 3).join(', ');
  const restIngredients = item.ingredients.slice(3);

  return {
    prepTimeMinutes: prep,
    cookTimeMinutes: cook,
    servings: 2,
    steps: [
      `Prep your ingredients: ${mainIngredients}${restIngredients.length ? `, plus ${restIngredients.join(', ')}` : ''}.`,
      `Cook ${item.name.toLowerCase()} using your usual method for about ${cook} minutes, until everything is properly cooked through.`,
      `Season to taste, plate it up, and pair it with your Balanced Sip™ recommendation.`,
    ],
    youtubeVideoId: '', // no verified matching video for every dish — SmartKitchenView links out to search instead
    youtubeVideoTitle: `${item.name} — recipe tutorial`,
    healthySwaps: item.dietExcludes.includes('Dairy-Free')
      ? [{ original: 'Dairy ingredient', replacement: 'Plant-based alternative', caloricSavings: '-40 kcal' }]
      : [{ original: 'Regular cooking oil', replacement: 'Extra virgin olive oil', caloricSavings: '-40 kcal' }],
  };
}

const RESTAURANT_STYLE_BY_CUISINE: Record<string, string[]> = {
  Indian: ['Spice Route Kitchen', 'The Thali House'],
  American: ['Green Fork Kitchen', 'The Daily Grill'],
  British: ['The Local Kitchen', 'Garden & Grain'],
  MiddleEastern: ['Cedar & Sumac', 'Al Fanar Grill'],
  Japanese: ['Umami Table', 'Sakura Kitchen'],
  European: ['Trattoria Verde', 'The Olive Table'],
  Asian: ['Lotus Kitchen', 'Spice & Rice'],
  Global: ['The Balanced Table', 'Fresh & Co.'],
};

function buildRestaurants(item: FoodItem): RestaurantSuggestion[] {
  const names = RESTAURANT_STYLE_BY_CUISINE[item.cuisine] || RESTAURANT_STYLE_BY_CUISINE.Global;
  return names.slice(0, 2).map((name, idx) => ({
    id: `${item.id}-rest-${idx}`,
    name,
    dishName: item.name,
    distance: `${(0.4 + idx * 0.3).toFixed(1)} miles away`,
    healthyCustomization: 'Ask for dressing/sauce on the side to keep it close to this DRS.',
    calories: item.nutrition.calories + idx * 20,
    rating: 4.6 + idx * 0.1,
    estimatedCost: item.budget === 'High' ? '$18–24' : item.budget === 'Medium' ? '$12–18' : '$7–12',
    mapAddress: 'Near you',
  }));
}

function buildOrderLinks(location?: LocationPreference) {
  if (location?.country === 'India') {
    return [
      { platform: 'Zomato', url: 'https://zomato.com', icon: '🔴' },
      { platform: 'Swiggy', url: 'https://swiggy.com', icon: '🟠' },
      { platform: 'Blinkit', url: 'https://blinkit.com', icon: '🟡' },
    ];
  }
  if (location?.country === 'United Kingdom') {
    return [
      { platform: 'Deliveroo', url: 'https://deliveroo.co.uk', icon: '🦘' },
      { platform: 'Just Eat', url: 'https://just-eat.co.uk', icon: '🍕' },
      { platform: 'Uber Eats UK', url: 'https://ubereats.com/gb', icon: '🛵' },
    ];
  }
  if (location?.country === 'United Arab Emirates') {
    return [
      { platform: 'Talabat', url: 'https://talabat.com', icon: '🟠' },
      { platform: 'Careem', url: 'https://careem.com', icon: '🟢' },
      { platform: 'Noon Food', url: 'https://noon.com', icon: '🟡' },
    ];
  }
  if (location?.country === 'Singapore') {
    return [
      { platform: 'GrabFood', url: 'https://food.grab.com', icon: '🟢' },
      { platform: 'foodpanda', url: 'https://foodpanda.sg', icon: '🐼' },
    ];
  }
  return [
    { platform: 'Uber Eats', url: 'https://ubereats.com', icon: '🛵' },
    { platform: 'DoorDash', url: 'https://doordash.com', icon: '🚗' },
  ];
}

function nutritionSentence(n: NutritionInfo): string {
  return `${n.protein}g protein and ${n.fiber}g fiber for the calories it costs you`;
}

// ------------------------------------------------------------------
// SECTION 13 — BALANCED RECOVERY™
// Balanced Buyte is a decision companion, not a diet app. This never
// fires for a normal balanced choice — only when the context itself
// signals an indulgent or thrown-off day (a heavy/rich item, a Cheat
// Meal / Party goal, fast food or a party setting, or a Late Night
// goal). When it does fire, it stays positive, practical, and never
// mentions calories-to-compensate or restriction of any kind.
// ------------------------------------------------------------------
function buildRecoveryGuidance(item: FoodItem, ctx: EngineContext): RecoveryGuidance | undefined {
  const heavyMeal = item.nutrition.calories >= 500 || item.nutrition.fats >= 25;
  const indulgentGoal = ctx.goal === 'Cheat Meal' || ctx.goal === 'Party / Drinks';
  const lateNight = ctx.goal === 'Late Night';
  const indulgentLocation = ctx.eatingLocation === 'Party' || ctx.eatingLocation === 'Fast Food';

  if (!heavyMeal && !indulgentGoal && !lateNight && !indulgentLocation) return undefined;

  const candidates: string[] = [];

  if (indulgentGoal || indulgentLocation) {
    candidates.push('Drink 2–3 glasses of water over the next few hours.');
    candidates.push('Skip sugary drinks for the rest of the day.');
  }
  if (heavyMeal) {
    candidates.push(
      ctx.mealTime === 'Dinner'
        ? 'Go for a 15–20 minute walk after eating.'
        : 'Choose a lighter dinner if this meal was on the heavier side.'
    );
    if (!indulgentGoal && !indulgentLocation) {
      candidates.push('Add a serving of vegetables to your next meal.');
    }
  }
  if (lateNight) {
    candidates.push('Prioritize good sleep tonight.');
  }

  const actions = Array.from(new Set(candidates)).slice(0, 2);
  if (actions.length === 0) actions.push('Stay hydrated.');

  return {
    message: "Enjoy your meal. Every decision doesn't have to be perfect. Here's one simple way to bring balance back today.",
    actions,
    closingLine: 'Route recalculated — one balanced choice is enough to get back on track. Your next meal is a fresh opportunity.',
  };
}

// Shared builder — both the standard engine and Smart Kitchen funnel
// through here, so Balanced Meter, Sip, Confidence, etc. always stay
// consistent no matter which path produced the winning food item.
function buildResultFromFoodItem(
  item: FoodItem,
  ranked: ScoredFood[],
  ctx: EngineContext,
  opts?: { fromPantry?: boolean; pantryMatchNote?: string; overrideConfidence?: number; overrideReasons?: string[] }
): DecisionResult {
  const scoredEntry = ranked.find((r) => r.item.id === item.id) || ranked[0];
  const meterScore = scoredEntry.score;

  const second = ranked.find((r) => r.item.id !== item.id);
  const gap = second ? meterScore - second.score : 20;
  const confidencePercentage = opts?.overrideConfidence ?? Math.max(62, Math.min(98, 70 + gap));

  const lastId = ranked[ranked.length - 1]?.item.id;
  const betterOptions: AlternateOption[] = ranked
    .filter((r) => r.item.id !== item.id && r.item.id !== lastId)
    .slice(0, 3)
    .map((r) => ({
      name: r.item.name,
      emoji: r.item.emoji,
      score: r.score,
      reason: r.reasons[0] || `A solid ${ctx.mealTime.toLowerCase()} option worth trying next time.`,
    }));

  const avoidEntry = pickOneToAvoid(ranked);
  const oneToAvoid: AvoidOption = avoidEntry
    ? {
        name: avoidEntry.item.name,
        emoji: avoidEntry.item.emoji,
        reason: `Today it's a weaker match for "${ctx.goal}" than ${item.name} — save it for a day it fits your goal better.`,
      }
    : { name: 'Nothing to flag today', emoji: '👍', reason: 'Every option that fit your filters was a reasonable choice today.' };

  const sip = buildSip(ctx, item);

  const confidenceBreakdown = opts?.overrideReasons?.length
    ? opts.overrideReasons
    : (scoredEntry.reasons.length ? scoredEntry.reasons : [`A safe, balanced fit for ${ctx.mealTime}`]).slice(0, 3);

  const coachTip = `Based on what you've shared, ${item.name} is one balanced option that fits your "${ctx.goal}" goal today — not a guarantee, just a solid, honest pick for right now.`;

  return {
    id: `dr-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    goal: ctx.goal,
    craving: ctx.craving,
    mealTime: ctx.mealTime,
    dietRestrictions: ctx.dietRestrictions,
    location: ctx.location,
    eatingLocation: ctx.eatingLocation,
    budget: ctx.budget,

    meterScore,
    confidencePercentage,
    confidenceBreakdown,

    bestBuyteName: item.name,
    bestBuyteEmoji: item.emoji,
    bestBuyteDescription: item.desc,
    category: item.category,
    nutrition: item.nutrition,
    coachRationale: `${item.name} gives you ${nutritionSentence(item.nutrition)} — a straightforward match for "${ctx.goal}" at ${ctx.mealTime.toLowerCase()}.`,
    aiEnhanced: false,

    balancedSip: sip,
    betterOptions,
    oneToAvoid,
    coachTip,
    recoveryGuidance: buildRecoveryGuidance(item, ctx),

    recipe: buildRecipe(item),
    fromPantry: opts?.fromPantry,
    pantryMatchNote: opts?.pantryMatchNote,

    shoppingList: buildShoppingList(item),
    restaurants: buildRestaurants(item),
    orderLinks: buildOrderLinks(ctx.location),
  };
}

// ------------------------------------------------------------------
// PUBLIC: the standard Balanced Buyte Decision Engine.
// ------------------------------------------------------------------
export async function runBalancedBuyteEngine(ctx: EngineContext): Promise<DecisionResult> {
  const ranked = scoreCandidates(ctx);
  const winner = ranked[0]?.item || FOOD_ITEMS[0];
  return buildResultFromFoodItem(winner, ranked, ctx);
}

// ------------------------------------------------------------------
// TASK 2 — SMART KITCHEN™
// Matches the food database against what the user says they actually
// have on hand, instead of running the normal goal-driven engine.
// The closer the ingredient overlap, the higher the match score.
// ------------------------------------------------------------------
export async function runSmartKitchenEngine(
  pantryIngredients: string[],
  mealTime: MealTime,
  dietRestrictions: string[],
  location?: LocationPreference,
  goal: GoalType = 'Eat Healthy',
  craving: CravingType = 'Fresh & Crisp'
): Promise<DecisionResult> {
  const ctx: EngineContext = { goal, craving, mealTime, dietRestrictions, location };
  const normalizedPantry = pantryIngredients.map((p) => p.toLowerCase().trim()).filter(Boolean);

  const eligible = FOOD_ITEMS.filter((item) => {
    if (!item.mealTimes.includes(mealTime)) return false;
    if (dietRestrictions.some((d) => item.dietExcludes.includes(d))) return false;
    return true;
  });

  const matched = eligible
    .map((item) => {
      const itemIngredients = item.ingredients.map((i) => i.toLowerCase());
      const overlap = itemIngredients.filter((ing) =>
        normalizedPantry.some((p) => ing.includes(p) || p.includes(ing.split(' ')[0]))
      ).length;
      const matchRatio = overlap / itemIngredients.length;
      const score = Math.round(35 + matchRatio * 55 + stableHash(item.id));
      return {
        item,
        score: Math.min(97, score),
        overlap,
        matchRatio,
        reasons: [`Uses ${overlap} of ${itemIngredients.length} ingredients you already have`],
      };
    })
    .sort((a, b) => b.score - a.score);

  const winner = matched[0]?.item || FOOD_ITEMS[0];
  const topMatch = matched[0];
  const pantryMatchNote =
    topMatch && topMatch.overlap > 0
      ? `Matched using ${topMatch.overlap} ingredient${topMatch.overlap === 1 ? '' : 's'} you told us you have on hand.`
      : `None of your listed ingredients matched closely — this is our closest balanced fallback for ${mealTime.toLowerCase()}.`;

  return buildResultFromFoodItem(winner, matched, ctx, {
    fromPantry: true,
    pantryMatchNote,
    overrideConfidence: topMatch ? Math.max(58, Math.min(96, Math.round(60 + topMatch.matchRatio * 38))) : 60,
    overrideReasons: [
      pantryMatchNote,
      `Still respects your ${mealTime.toLowerCase()} and any dietary filters you set`,
      `Balanced Score reflects how completely your pantry covers this recipe`,
    ],
  });
}
