import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/atoms';
import { SubHeader } from '@/components/molecules';
import { IngredientForm, IngredientSyncOverlay } from '@/components/organisms';
import { IcCheck } from '@/icons';
import { getPantry, updateIngredient } from '@/api/pantry';
import { useIngredientForm } from '@/hooks/useIngredientForm';
import type { Ingredient } from '@/types';

export function EditIngredientPage() {
  const navigate    = useNavigate();
  const qc          = useQueryClient();
  const { id = '' } = useParams<{ id: string }>();

  const { data: pantry = [], isLoading: pantryLoading } = useQuery<Ingredient[]>({
    queryKey: ['pantry'],
    queryFn:  () => getPantry(),
    staleTime: 60_000,
  });

  const ingredient = pantry.find((i) => i.id === id);

  const form = useIngredientForm();

  const [ready,    setReady]    = useState(false);
  const [showSync, setShowSync] = useState(false);

  const originalUnit = useRef<string>('g');

  useEffect(() => {
    if (ingredient && !ready) {
      form.reset({
        name:            ingredient.name,
        qty:             String(ingredient.qty),
        unit:            ingredient.unit,
        cat:             ingredient.cat,
        expiry:          ingredient.expiry,
        alwaysAvailable: ingredient.alwaysAvailable ?? false,
        hasMonthly:      Boolean(ingredient.monthlyBuy),
        monthlyBuy:      ingredient.monthlyBuy ? String(ingredient.monthlyBuy) : '',
      });
      originalUnit.current = ingredient.unit;
      setReady(true);
    }
  }, [ingredient, ready]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Parameters<typeof updateIngredient>[1]) =>
      updateIngredient(id, payload),
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
        : { monthlyBuy: undefined }),
    });
    setShowSync(true);
  };

  const canSave = Boolean(form.name) && (form.alwaysAvailable || Boolean(form.qty));

  if (pantryLoading && !ready) {
    return (
      <div className="pb-[110px] bg-bg min-h-full">
        <SubHeader
          onBack={() => navigate(-1 as never)}
          title="Editar ingrediente"
        />
        <div className="px-[18px] pb-[22px]">
          <div className="h-[100px] bg-canvas rounded-3xl animate-pulse" />
        </div>
        <div className="px-[18px] flex flex-col gap-[18px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-3.5 w-24 bg-canvas rounded-lg animate-pulse" />
              <div className="h-11 bg-canvas rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!ingredient && pantry.length > 0) {
    return (
      <div className="pb-[110px] bg-bg min-h-full">
        <SubHeader
          onBack={() => navigate(-1 as never)}
          title="Editar ingrediente"
        />
        <div className="px-[18px] py-10 text-center text-muted text-sm">
          Ingrediente não encontrado.
        </div>
      </div>
    );
  }

  return (
    <>
      {showSync && ingredient && (
        <IngredientSyncOverlay
          ingredientId={id}
          ingredientName={form.name}
          oldUnit={originalUnit.current}
          newUnit={form.unit}
          onDone={() => {
            qc.invalidateQueries({ queryKey: ['recipes'] });
            qc.removeQueries({ queryKey: ['recipe'] });
            navigate('/pantry');
          }}
        />
      )}

      <div className="bg-bg min-h-full flex flex-col">

        <div className="sticky top-0 z-20 bg-bg flex-shrink-0">
          <SubHeader
            onBack={() => navigate(-1 as never)}
            title="Editar ingrediente"
            sub={form.name || 'Atualize as informações'}
            right={
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={!canSave || isPending}
                icon={<IcCheck size={14} />}
              >
                {isPending ? 'Salvando…' : 'Salvar'}
              </Button>
            }
          />
        </div>

        <div className="px-[18px] pt-2 pb-[110px] flex flex-col gap-[18px]">
          <IngredientForm form={form} />
        </div>
      </div>
    </>
  );
}
