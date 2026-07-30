import React from 'react';
import { RestaurantSuggestion } from '../types';
import { UtensilsCrossed, MapPin, Star, Sparkles, Navigation } from 'lucide-react';

interface RestaurantViewProps {
  restaurants: RestaurantSuggestion[];
}

export const RestaurantView: React.FC<RestaurantViewProps> = ({ restaurants }) => {
  return (
    <div className="mt-4 bg-white border border-[#DCE8E1] rounded-[20px] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2ECE6] pb-3">
        <div className="flex items-center gap-2 font-display font-bold text-base text-[#0B2E22]">
          <UtensilsCrossed className="w-5 h-5 text-[#1C8354]" />
          <span>Nearby Healthy Alternatives</span>
        </div>
      </div>

      <div className="space-y-3">
        {restaurants.map((rest) => (
          <div
            key={rest.id}
            className="p-4 bg-[#F5F9F6] border border-[#E2ECE6] rounded-2xl space-y-2.5 hover:border-[#1C8354] transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-[#0B2E22]">{rest.name}</h4>
                <div className="text-xs font-semibold text-[#1C8354] mt-0.5">{rest.dishName}</div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-mono-custom font-bold text-[#C98A2C]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{rest.rating}</span>
                </div>
                <div className="text-[10px] font-mono-custom text-[#5B7A6E] mt-0.5">{rest.estimatedCost}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono-custom text-[#5B7A6E]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#1C8354]" />
                {rest.distance}
              </span>
              <span>•</span>
              <span>{rest.calories} kcal</span>
            </div>

            <div className="p-2.5 bg-[#EAF3EC] rounded-xl text-xs text-[#0B2E22] flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#1C8354] mt-0.5 flex-shrink-0" />
              <span>
                <strong>Order Tip:</strong> {rest.healthyCustomization}
              </span>
            </div>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(rest.name + ' ' + rest.mapAddress)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono-custom font-bold text-[#1C8354] hover:underline pt-1"
            >
              <Navigation className="w-3 h-3" />
              <span>Get Directions ({rest.mapAddress})</span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
