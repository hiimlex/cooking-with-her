// src/pages/CookCompletePage.tsx
import { useState } from 'react';
import { Button, Card, Input } from '@/components/atoms';
import { IcCheck, IcStar } from '@/icons';
import { RECIPES } from '@/data/mock';

export interface CookCompletePageProps {
  recipeId?: string;
  onExit?: () => void;
  onAddPhoto?: () => void;
}

export function CookCompletePage({ recipeId = 'shakshuka', onExit, onAddPhoto }: CookCompletePageProps) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');

  if (!recipe) return null;

  return (
    <div className="absolute inset-0 bg-bg flex flex-col overflow-auto no-scrollbar">
      {/* confetti */}
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-sm"
            style={{
              left: `${(i * 41) % 100}%`,
              top: -10,
              background: ['#7c3aed', '#ff7eb9', '#22c55e', '#f59e0b', '#a78bfa'][i % 5],
              animation: `fall ${3 + (i % 4)}s linear ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="px-6 pt-[70px] text-center relative">
        <div
          className="w-[84px] h-[84px] rounded-full text-white mx-auto mb-[18px] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' }}
        >
          <IcCheck size={40} />
        </div>
        <div className="text-xs font-bold text-accent uppercase tracking-[0.6px] mb-1.5">
          nailed it
        </div>
        <h1 className="m-0 text-[28px] font-extrabold text-ink tracking-[-0.6px]">{recipe.name}</h1>
        <p className="m-0 mt-2 text-[13px] text-muted">
          Streak now at 13 days · 8 cooks total
        </p>
      </div>

      <div className="px-[18px] py-6 flex flex-col gap-3.5 relative">
        <Card className="p-4">
          <div className="text-sm font-bold text-ink mb-2.5">How was it, Yuka?</div>
          <div className="flex gap-1.5 mb-3.5 justify-center">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={[
                  'p-1 transition-opacity',
                  n <= rating ? 'text-attention' : 'text-canvas',
                ].join(' ')}
              >
                <IcStar size={32} filled={n <= rating} />
              </button>
            ))}
          </div>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Leave a sweet note for Alex 💌"
          />
        </Card>

        <div className="flex gap-2">
          <Button full onClick={onAddPhoto}>📷 Add a photo</Button>
          <Button variant="primary" full onClick={onExit}>Save &amp; exit</Button>
        </div>
      </div>
    </div>
  );
}
