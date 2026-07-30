import React, { useState } from 'react';
import { ShoppingIngredient } from '../types';
import { ShoppingBag, CheckSquare, Square, DollarSign } from 'lucide-react';

interface ShoppingListViewProps {
  initialItems: ShoppingIngredient[];
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({ initialItems }) => {
  const [items, setItems] = useState<ShoppingIngredient[]>(initialItems);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const categories = ['Produce', 'Protein', 'Dairy', 'Pantry'] as const;

  const totalCost = items.reduce((acc, item) => acc + item.estimatedCost, 0);

  return (
    <div className="mt-4 bg-white border border-[#DCE8E1] rounded-[20px] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#E2ECE6] pb-3">
        <div className="flex items-center gap-2 font-display font-bold text-base text-[#0B2E22]">
          <ShoppingBag className="w-5 h-5 text-[#1C8354]" />
          <span>Smart Grocery List</span>
        </div>
        <div className="flex items-center gap-1 font-mono-custom text-xs font-bold text-[#1C8354] bg-[#EAF3EC] px-2.5 py-1 rounded-full">
          <DollarSign className="w-3.5 h-3.5" />
          <span>Est. ${totalCost.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          if (catItems.length === 0) return null;

          return (
            <div key={cat} className="space-y-2">
              <h5 className="text-[11px] font-mono-custom font-bold text-[#5B7A6E] uppercase tracking-wider">
                {cat}
              </h5>
              <div className="space-y-1.5">
                {catItems.map((item) => (
                  <button type="button"
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    aria-pressed={item.checked}
                    aria-label={`${item.name}, ${item.checked ? 'checked off' : 'not yet checked off'}`}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                      item.checked
                        ? 'bg-[#F5F9F6] border-[#DCE8E1] text-[#5B7A6E] line-through'
                        : 'bg-white border-[#E2ECE6] text-[#0B2E22] hover:border-[#1C8354]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.checked ? (
                        <CheckSquare className="w-4 h-4 text-[#1C8354]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#5B7A6E]" />
                      )}
                      <span className="font-medium">{item.name}</span>
                      <span className="text-[10px] text-[#5B7A6E] font-mono-custom">({item.amount})</span>
                    </div>
                    <span className="font-mono-custom text-[11px] text-[#5B7A6E]">
                      ${item.estimatedCost.toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
