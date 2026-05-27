import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Avatar, Card, FoodIcon } from '@/components/atoms';
import { MenuRow, Section } from '@/components/molecules';
import { Stars } from '@/components/atoms';
import { FOOD_GLYPHS, IcBook, IcCalendar, IcGear, IcImage, IcUtensils } from '@/icons';
import { COUPLE } from '@/data/mock';
import { useStatsData, timeAgo } from '@/hooks/useStatsData';
import { getRecipes } from '@/api/recipes';
import { getMemories } from '@/api/memories';
import { getUtensils } from '@/api/utensils';

export function UsPage() {
  const navigate = useNavigate();

  const { stats, entries, isLoading } = useStatsData();

  const { data: recipes  = [] } = useQuery({ queryKey: ['recipes'],  queryFn: () => getRecipes() });
  const { data: memories = [] } = useQuery({ queryKey: ['memories'], queryFn: getMemories });
  const { data: utensils = [] } = useQuery({ queryKey: ['utensils'], queryFn: getUtensils });

  const utensilsReady = utensils.filter((u) => u.have).length;

  const statsDisplay = [
    { label: 'Cozidas',   value: stats?.totalCooked ?? '—' },
    { label: 'Receitas',  value: recipes.length           },
    { label: 'Fotos',     value: memories.length          },
    { label: 'Sequência', value: stats?.streak ?? '—'     },
  ];

  return (
    <div>
      {/* Hero */}
      <div
        className="pt-[54px] px-[18px] pb-[22px] relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, var(--c-canvas) 0%, var(--c-bg) 100%)' }}
      >
        <div
          aria-hidden
          className="absolute top-[70px] -right-10 w-[180px] h-[180px] rounded-full pointer-events-none opacity-50"
          style={{ background: 'radial-gradient(circle, #ffd6e8 0%, transparent 70%)' }}
        />
        <div className="flex items-center gap-3.5 mb-3.5 relative">
          <div className="flex">
            <div className="-mr-3 z-[2]"><Avatar who="alex" size={56} ring /></div>
            <Avatar who="yuka" size={56} ring />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="m-0 text-[22px] font-extrabold text-ink tracking-[-0.5px]">
              Alex &amp; Yuka
            </h1>
            <div className="text-[13px] text-muted mt-0.5">
              desde {COUPLE.startedDate} · 1 gato
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex bg-card rounded-3xl p-3 gap-0.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 px-1">
                <div className="h-5 w-8 bg-canvas rounded-lg animate-pulse" />
                <div className="h-3 w-10 bg-canvas rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex bg-card rounded-3xl p-3 relative">
            {statsDisplay.map((s, i) => (
              <div
                key={s.label}
                className={[
                  'flex-1 text-center',
                  i < statsDisplay.length - 1 ? 'border-r border-canvas' : '',
                ].join(' ')}
              >
                <div className="text-lg font-extrabold text-ink tracking-[-0.3px] tabular-nums">
                  {s.value}
                </div>
                <div className="text-[11px] text-muted font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="px-[18px] pt-1.5">
        <div className="flex flex-col gap-2">
          <MenuRow
            Icon={IcBook}
            label="Minhas Receitas"
            sub={`${recipes.length} salvas · adicionar nova`}
            color="#7c3aed"
            onClick={() => navigate('/us/recipes')}
          />
          <MenuRow
            Icon={IcImage}
            label="Memórias"
            sub={memories.length > 0
              ? `${memories.length} cozinhadas fotografadas`
              : 'Nenhuma foto ainda'}
            color="#ff7eb9"
            onClick={() => navigate('/us/memories')}
          />
          <MenuRow
            Icon={IcUtensils}
            label="Utensílios"
            sub={utensils.length > 0
              ? `${utensilsReady} de ${utensils.length} prontos`
              : 'Configure sua cozinha'}
            color="#22c55e"
            onClick={() => navigate('/us/utensils')}
          />
          <MenuRow
            Icon={IcCalendar}
            label="Registrar janta passada"
            sub="Esqueceu de marcar no dia? Adicione aqui"
            color="#f59e0b"
            onClick={() => navigate('/us/log-past')}
          />
          <MenuRow
            Icon={IcGear}
            label="Configurações"
            sub="Tema, cor e preferências"
            color="#6b6580"
            onClick={() => navigate('/us/settings')}
          />
        </div>
      </div>

      {/* Recent activity */}
      <div className="px-[18px] pt-[22px]">
        <Section title="Atividade recente" padded={false} />
        <div className="mt-3 flex flex-col gap-1.5">
          {isLoading && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[58px] bg-canvas rounded-2xl animate-pulse" />
              ))}
            </>
          )}
          {entries.slice(0, 5).map((h, i) => {
            const spriteId = h.recipe.sprites[0]?.sprite ?? 'Tomato';
            const accent   = (FOOD_GLYPHS as Record<string, { color: string }>)[spriteId]?.color ?? '#7c3aed';
            return (
              <Card key={i} className="p-3 flex items-center gap-3">
                <Avatar who={h.by.personId as 'alex' | 'yuka'} size={26} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-ink leading-[1.4]">
                    <b>{COUPLE[h.by.personId as 'alex' | 'yuka']?.name ?? h.by.personId}</b>{' '}
                    cozinhou{' '}
                    <b className="text-accent">{h.recipe.name}</b>
                  </div>
                  <div className="text-[11px] text-muted mt-0.5 flex items-center gap-1.5">
                    <span>{timeAgo(h.cookedAt)}</span>
                    <span>·</span>
                    <Stars value={h.rating} size={10} />
                  </div>
                </div>
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: accent + '18' }}
                >
                  <FoodIcon name={spriteId as any} size={22} />
                </div>
              </Card>
            );
          })}

          {!isLoading && entries.length === 0 && (
            <div className="text-center text-muted text-[13px] py-6">
              Nenhuma cozinhada registrada ainda.
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-5 pb-4 text-[11px] text-subtle">
        Feito só pra nós · v1.0
      </div>
    </div>
  );
}
