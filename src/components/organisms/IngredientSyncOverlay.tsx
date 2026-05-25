import { useEffect, useRef, useState } from 'react';
import { streamIngredientSync, type IngredientSyncEvent } from '@/api/ai';
import { IcCheck, IcSparkle } from '@/icons';

interface RecipeStatus {
  recipeId:  string;
  name:      string;
  status:    'pending' | 'done';
  noChange:  boolean;
  qty?:      number;
  unit?:     string;
  reason?:   string;
}

export interface IngredientSyncOverlayProps {
  ingredientId:   string;
  ingredientName: string;
  oldUnit:        string;
  newUnit:        string;
  onDone:         () => void;
}

export function IngredientSyncOverlay({
  ingredientId,
  ingredientName,
  oldUnit,
  newUnit,
  onDone,
}: IngredientSyncOverlayProps) {
  const [recipes,  setRecipes]  = useState<RecipeStatus[]>([]);
  const [total,    setTotal]    = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const ran = useRef(false);
  const autoCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        for await (const event of streamIngredientSync(ingredientId, oldUnit)) {
          if ('error' in event) {
            setError(event.error);
            return;
          }
          if ('total' in event) {
            setTotal(event.total);
            // No recipes use this ingredient — auto-close without bothering user.
            if (event.total === 0) {
              autoCloseTimer.current = setTimeout(() => onDone(), 300);
            }
          } else if ('done' in event) {
            setFinished(true);
          } else if ('recipeId' in event) {
            setRecipes((prev) => {
              const existing = prev.find((r) => r.recipeId === event.recipeId);
              if (existing) {
                return prev.map((r) =>
                  r.recipeId === event.recipeId
                    ? { ...r, status: 'done', noChange: event.noChange, qty: event.qty, unit: event.unit, reason: event.reason ?? undefined }
                    : r,
                );
              }
              return [...prev, {
                recipeId: event.recipeId,
                name:     event.recipeName,
                status:   'done',
                noChange: event.noChange,
                qty:      event.qty,
                unit:     event.unit,
                reason:   event.reason ?? undefined,
              }];
            });
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro desconhecido');
      }
    })();

    return () => { if (autoCloseTimer.current) clearTimeout(autoCloseTimer.current); };
  }, [ingredientId, oldUnit]);

  const doneCount = recipes.filter((r) => r.status === 'done').length;
  const changedCount = recipes.filter((r) => r.status === 'done' && !r.noChange).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Sheet */}
      <div className="relative w-full bg-bg rounded-t-[28px] px-5 pt-5 pb-8 flex flex-col gap-4">

        {/* Handle */}
        <div className="w-10 h-1 bg-subtle rounded-full mx-auto mb-1" />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-accent/10 text-accent"
          >
            <IcSparkle size={20} />
          </div>
          <div>
            <div className="text-[15px] font-extrabold text-ink">
              {finished ? 'Receitas atualizadas!' : 'Nonna revisando receitas…'}
            </div>
            <div className="text-[12px] text-muted mt-0.5">
              {ingredientName}: <span className="font-semibold">{oldUnit}</span> → <span className="font-semibold text-accent">{newUnit}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {total !== null && total > 0 && (
          <div className="h-1.5 bg-canvas rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / total) * 100}%` }}
            />
          </div>
        )}

        {/* Recipe list */}
        {total === 0 ? (
          <div className="text-center text-muted text-sm py-4">
            Nenhuma receita usa esse ingrediente.
          </div>
        ) : recipes.length > 0 ? (
          <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto no-scrollbar">
            {recipes.map((r) => (
              <div key={r.recipeId} className="flex items-start gap-3 rounded-2xl bg-canvas px-3.5 py-2.5">
                <div className={[
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  r.noChange ? 'bg-green-100 text-green-600' : 'bg-accent/10 text-accent',
                ].join(' ')}>
                  <IcCheck size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold text-ink truncate">{r.name}</div>
                  {r.noChange ? (
                    <div className="text-[11px] text-muted">Quantidade ok — sem alteração</div>
                  ) : (
                    <div className="text-[11px] text-accent font-semibold">
                      Ajustado para {r.qty} {r.unit}
                      {r.reason && <span className="text-muted font-normal"> · {r.reason}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : total !== null ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className="h-[52px] rounded-2xl bg-canvas animate-pulse" />
            ))}
          </div>
        ) : null}

        {/* Error state */}
        {error && (
          <div className="rounded-2xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}

        {/* Summary + close */}
        {(finished || error) && (
          <div className="flex flex-col gap-1.5 mt-1">
            {finished && changedCount > 0 && (
              <div className="text-[12px] text-muted text-center">
                {changedCount} receita{changedCount !== 1 ? 's' : ''} ajustada{changedCount !== 1 ? 's' : ''} pela Nonna
              </div>
            )}
            <button
              onClick={onDone}
              className="w-full h-11 rounded-2xl bg-accent text-white text-sm font-extrabold"
            >
              Pronto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
