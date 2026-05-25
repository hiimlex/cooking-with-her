import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/atoms';
import { SubHeader } from '@/components/molecules';
import { IngredientForm } from '@/components/organisms';
import { IcCheck } from '@/icons';
import { addIngredient } from '@/api/pantry';
import { useIngredientForm } from '@/hooks/useIngredientForm';

export function AddIngredientPage() {
  const navigate = useNavigate();
  const qc       = useQueryClient();
  const form     = useIngredientForm();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: addIngredient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry'] });
      qc.invalidateQueries({ queryKey: ['recipes'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleSave = async () => {
    if (!form.name) return;
    await mutateAsync({
      name:            form.name,
      qty:             form.alwaysAvailable ? 0 : Number(form.qty),
      unit:            form.unit,
      cat:             form.cat,
      expiry:          form.expiry,
      alwaysAvailable: form.alwaysAvailable,
      ...(form.hasMonthly && form.monthlyBuy
        ? { monthlyBuy: Number(form.monthlyBuy) }
        : {}),
    });
    navigate('/pantry');
  };

  const canSave = Boolean(form.name) && (form.alwaysAvailable || Boolean(form.qty));

  return (
    <div className="bg-bg min-h-full flex flex-col">

      <div className="sticky top-0 z-20 bg-bg flex-shrink-0">
        <SubHeader
          onBack={() => navigate(-1 as never)}
          title="Adicionar ingrediente"
          sub="O que acabamos de guardar?"
          right={
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!canSave || isPending}
              icon={<IcCheck size={14} />}
            >
              {isPending ? 'Salvando…' : 'Adicionar'}
            </Button>
          }
        />
      </div>

      <div className="px-[18px] pt-2 pb-[110px] flex flex-col gap-[18px]">
        <IngredientForm form={form} autoFocus />
      </div>
    </div>
  );
}
