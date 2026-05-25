import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, FoodIcon } from '@/components/atoms';
import { SubHeader } from '@/components/molecules';
import { FOOD_GLYPHS, IcChevRight, IcClock, IcSparkle } from '@/icons';
import { saveAIRecipe } from '@/api/recipes';
import type { AIResult, GeneratedRecipe } from '@/api/ai';
import { diffPT, tagPT } from '@/utils/labels';

export function AIResultsPage() {
  const navigate     = useNavigate();
  const location     = useLocation();
  const queryClient  = useQueryClient();
  const result       = (location.state as { result?: AIResult } | null)?.result;

  const saveMutation = useMutation({
    mutationFn: saveAIRecipe,
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      navigate(`/cook/${saved.id}`);
    },
  });

  if (!result) {
    return (
      <div className="pb-[110px] bg-bg min-h-full">
        <SubHeader onBack={() => navigate(-1 as never)} title="Ask Nonna" />
        <div className="px-[18px] pt-8 text-center text-muted text-sm">
          Sem resultado. Tente de novo.
        </div>
      </div>
    );
  }

  return (
    <div className="pb-[140px] bg-bg min-h-full">
      <SubHeader
        onBack={() => navigate(-1 as never)}
        title="Nova receita da Nonna"
        sub="Criada especialmente pra vocês."
        right={<Button onClick={() => navigate('/ai')}>Tentar de novo</Button>}
      />

      <div className="px-[18px] pt-2 flex flex-col gap-3">
        <AIGeneratedCard recipe={result.recipe} />
      </div>

      {/* Sticky CTA */}
      <div
        className="fixed left-0 right-0 bottom-0 z-25 px-[18px] pt-3.5 pb-7"
        style={{
          background:           'linear-gradient(180deg, rgba(250,248,255,0) 0%, rgba(250,248,255,0.9) 30%, rgba(250,248,255,1) 100%)',
          backdropFilter:       'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {saveMutation.isError && (
          <div className="mb-2 text-xs text-red-500 text-center">
            Erro ao salvar. Tente de novo.
          </div>
        )}
        <Button
          variant="primary"
          size="lg"
          full
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate(result.recipe)}
          icon={<IcChevRight size={16} />}
        >
          {saveMutation.isPending ? 'Salvando…' : 'Vamos cozinhar'}
        </Button>
      </div>
    </div>
  );
}

// ─── Generated recipe card ────────────────────────────────────────────────────

function AIGeneratedCard({ recipe: r }: { recipe: GeneratedRecipe }) {
  const [expanded, setExpanded] = useState(false);
  const accent = r.accent;

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header */}
      <div className="p-4" style={{ background: accent + '12' }}>
        <div className="flex items-start gap-3.5">
          <div
            className="w-[64px] h-[64px] rounded-[18px] flex items-center justify-center flex-shrink-0"
            style={{ background: accent + '28' }}
          >
            <FoodIcon name={r.sprites[0] as any} size={40} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex gap-1.5 mb-1.5">
              <span className="text-[11px] font-bold text-accent bg-accent-tint px-2 py-0.5 rounded-lg">{tagPT(r.tag)}</span>
              <span className="text-[11px] font-bold text-success bg-[#dcfce7] px-2 py-0.5 rounded-lg inline-flex items-center gap-1">
                <IcClock size={9} /> {r.time}m · {diffPT(r.difficulty)}
              </span>
            </div>
            <div className="text-[17px] font-extrabold text-ink tracking-[-0.3px] leading-snug">
              {r.name}
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-muted leading-[1.5] flex gap-1.5 items-start">
          <span className="text-accent flex-shrink-0 mt-0.5"><IcSparkle size={11} /></span>
          <span>{r.why}</span>
        </div>
      </div>

      {/* Nutrition strip */}
      {r.nutrition && (
        <div className="flex divide-x divide-border border-t border-b border-border">
          {([
            { label: 'Kcal',     value: r.nutrition.kcal    },
            { label: 'Proteína', value: `${r.nutrition.protein}g` },
            { label: 'Carbo',    value: `${r.nutrition.carbs}g`   },
            { label: 'Gordura',  value: `${r.nutrition.fat}g`     },
          ] as const).map((n) => (
            <div key={n.label} className="flex-1 text-center py-2.5">
              <div className="text-[13px] font-extrabold text-ink">{n.value}</div>
              <div className="text-[10px] text-muted mt-0.5">{n.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Ingredients */}
      <div className="px-4 pt-4">
        <div className="text-[13px] font-bold text-ink mb-2.5">
          Ingredientes · {r.servings} porções
        </div>
        <div className="flex flex-col gap-1.5">
          {r.ingredients.map((ing, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-ink">{ing.name}</span>
              <span className="text-muted">{ing.qty} {ing.unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps (collapsible) */}
      <div className="px-4 pt-4 pb-4">
        <button
          className="w-full flex items-center justify-between text-[13px] font-bold text-ink mb-2.5"
          onClick={() => setExpanded((v) => !v)}
        >
          <span>Preparo · {r.steps.length} passos</span>
          <span className="text-muted text-xs">{expanded ? 'Fechar': 'Ver preparo'}</span>
        </button>

        {expanded && (
          <div className="flex flex-col gap-3 mt-1">
            {r.steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-extrabold text-white mt-0.5"
                  style={{ background: accent }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-ink mb-0.5">{step.title}</div>
                  <div className="text-xs text-muted leading-[1.5]">{step.desc}</div>
                  <div className="text-[11px] text-subtle mt-1">~{step.mins} min</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
