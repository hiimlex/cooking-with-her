import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Card, FoodIcon } from '@/components/atoms';
import { SubHeader } from '@/components/molecules';
import { FOOD_GLYPHS } from '@/icons';
import { getMemories } from '@/api/memories';

export function MemoriesPage() {
  const navigate = useNavigate();

  const { data: memories = [], isLoading } = useQuery({
    queryKey: ['memories'],
    queryFn:  getMemories,
  });

  return (
    <div className="pb-[100px]">
      <SubHeader
        onBack={() => navigate(-1 as never)}
        title="Memórias"
        sub={isLoading ? 'Carregando…' : `${memories.length} cozinhadas fotografadas`}
      />
      <div className="px-[18px] pt-2">
        {isLoading && (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-canvas rounded-3xl animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && memories.length === 0 && (
          <div className="text-center text-muted text-[13px] py-10">
            Nenhuma memória ainda. Cozinhe e registre!
          </div>
        )}

        {!isLoading && memories.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5">
            {memories.map((m) => {
              const spriteId = m.recipe.sprites[0]?.sprite ?? 'Tomato';
              const accent = (FOOD_GLYPHS as Record<string, { color: string }>)[spriteId]?.color ?? '#7c3aed';
              return (
                <Card key={m.id} className="p-0 overflow-hidden">
                  <div
                    className="aspect-square flex items-center justify-center relative"
                    style={{
                      background: `linear-gradient(135deg, ${accent}30 0%, ${accent}15 100%)`,
                    }}
                  >
                    <FoodIcon name={spriteId as any} size={64} />
                    <div className="absolute top-2 left-2 bg-card/90 rounded-full pl-1 pr-2 py-0.5 flex items-center gap-1 text-[11px] font-bold text-ink">
                      <Avatar who={m.by.personId as 'alex' | 'yuka'} size={18} />
                      {m.by.name}
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="text-[13px] font-bold text-ink truncate">{m.recipe.name}</div>
                    <div className="text-[11px] text-muted mt-0.5">
                      {new Date(m.date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
