import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, Toggle } from '@/components/atoms';
import { SubHeader } from '@/components/molecules';
import { getUtensils, patchUtensil } from '@/api/utensils';
import { UTENSIL_ICON, IcUtensils } from '@/icons';

export function UtensilsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['utensils'],
    queryFn:  getUtensils,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, have }: { id: string; have: boolean }) => patchUtensil(id, { have }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['utensils'] }),
  });

  const have = items.filter((u) => u.have).length;

  return (
    <div className="pb-[100px]">
      <SubHeader
        onBack={() => navigate(-1 as never)}
        title="Nossos utensílios"
        sub={isLoading ? 'Carregando…' : `${have} de ${items.length} prontos`}
      />
      <div className="px-[18px] pt-2 flex flex-col gap-2">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[68px] bg-canvas rounded-3xl animate-pulse" />
        ))}
        {items.map((u) => {
          const UtensilIcon = UTENSIL_ICON[u.id] ?? IcUtensils;
          return (
          <Card key={u.id} className="px-3.5 py-3 flex items-center gap-3">
            <div
              className={[
                'w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0',
                u.have ? 'bg-lab-green-bg text-lab-green-fg' : 'bg-canvas text-subtle opacity-60',
              ].join(' ')}
            >
              <UtensilIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-ink">{u.name}</div>
              <div className="text-xs text-muted mt-0.5">
                {u.have ? 'Pronto na cozinha' : 'Adicione quando tiver'}
              </div>
            </div>
            <Toggle
              on={u.have}
              onChange={() => toggleMutation.mutate({ id: u.id, have: !u.have })}
            />
          </Card>
          );
        })}
      </div>
    </div>
  );
}
