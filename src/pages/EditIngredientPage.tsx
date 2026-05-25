import { getPantry, updateIngredient } from "@/api/pantry";
import { Button, Card, Chip, FoodIcon, Input, Label } from "@/components/atoms";
import { FieldGroup, SubHeader } from "@/components/molecules";
import { CAT_ICON, FOOD_GLYPHS, IcCheck } from "@/icons";
import { UNITS } from "@/utils/units";
import type { Ingredient, IngredientCat } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ICON_GROUPS: { label: string; cat: IngredientCat }[] = [
  { label: "Hortifruti", cat: "Produce" },
  { label: "Proteína", cat: "Protein" },
  { label: "Laticínio", cat: "Dairy" },
  { label: "Despensa", cat: "Pantry" },
  { label: "Tempero", cat: "Spice" },
  { label: "Outro", cat: "Other" },
];

const SHELF_LIFE = [2, 5, 7, 14, 30, 90];

export function EditIngredientPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { id = "" } = useParams<{ id: string }>();

  const { data: pantry = [], isLoading: pantryLoading } = useQuery<
    Ingredient[]
  >({
    queryKey: ["pantry"],
    queryFn: () => getPantry(),
    staleTime: 60_000,
  });

  const ingredient = pantry.find((i) => i.id === id);

  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState<string>("g");
  const [cat, setCat] = useState<IngredientCat>("Produce");
  const [expiry, setExpiry] = useState<number>(7);
  const [monthlyBuy,      setMonthlyBuy]      = useState('');
  const [hasMonthly,      setHasMonthly]      = useState(false);
  const [alwaysAvailable, setAlwaysAvailable] = useState(false);
  const [ready,           setReady]           = useState(false);

  // Pre-populate when ingredient is found in cache
  useEffect(() => {
    if (ingredient && !ready) {
      setName(ingredient.name);
      setQty(String(ingredient.qty));
      setUnit(ingredient.unit);
      setCat(ingredient.cat);
      setExpiry(ingredient.expiry);
      setAlwaysAvailable(ingredient.alwaysAvailable ?? false);
      if (ingredient.monthlyBuy) {
        setHasMonthly(true);
        setMonthlyBuy(String(ingredient.monthlyBuy));
      }
      setReady(true);
    }
  }, [ingredient, ready]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Parameters<typeof updateIngredient>[1]) =>
      updateIngredient(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pantry'] }),
  });

  const handleSave = async () => {
    if (!name) return;
    await mutateAsync({
      name,
      qty:            alwaysAvailable ? 0 : Number(qty),
      unit,
      cat,
      expiry,
      alwaysAvailable,
      ...(hasMonthly && monthlyBuy
        ? { monthlyBuy: Number(monthlyBuy) }
        : { monthlyBuy: undefined }),
    });
    navigate("/pantry");
  };

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
    <div className="pb-[110px] bg-bg min-h-full">
      <SubHeader
        onBack={() => navigate(-1 as never)}
        title="Editar ingrediente"
        sub={name || "Atualize as informações"}
      />

      {/* Live preview */}
      <div className="px-[18px] pb-[22px]">
        <Card
          className="p-5 flex items-center gap-4"
          style={{ background: FOOD_GLYPHS[CAT_ICON[cat]].color + "12" }}
        >
          <div className="w-[72px] h-[72px] rounded-[20px] bg-card flex items-center justify-center flex-shrink-0">
            <FoodIcon name={CAT_ICON[cat]} size={44} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-extrabold text-ink tracking-[-0.3px] truncate">
              {name || "Sem nome"}
            </div>
            <div className="text-[13px] text-muted mt-0.5">
              {qty || "—"} {unit} · {cat}
            </div>
            <div className="mt-1.5">
              <Label
                color={expiry <= 3 ? "red" : expiry <= 7 ? "yellow" : "green"}
              >
                {expiry}d de validade
              </Label>
            </div>
          </div>
        </Card>
      </div>

      <div className="px-[18px] pb-5 flex flex-col gap-[18px]">
        <FieldGroup label="O que é?">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Tomate cereja"
          />
        </FieldGroup>

        <FieldGroup label="Sempre disponível" sub="Temperos e básicos que nunca acabam (sal, pimenta…)">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAlwaysAvailable((v) => !v)}
              className={[
                'w-11 h-6 rounded-full transition-colors flex-shrink-0',
                alwaysAvailable ? 'bg-accent' : 'bg-subtle',
              ].join(' ')}
            >
              <span
                className={[
                  'block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5',
                  alwaysAvailable ? 'translate-x-5' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
            {alwaysAvailable && (
              <span className="text-xs font-semibold text-accent">
                Não será descontado do estoque ao cozinhar
              </span>
            )}
          </div>
        </FieldGroup>

        {!alwaysAvailable && (
        <FieldGroup label="Quanto?">
          <div className="flex items-start gap-2 mb-2">
            <Input
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              type="number"
              className="!w-[110px] text-center text-[17px] font-bold flex-shrink-0"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {UNITS.map((u) => (
              <Chip key={u} active={unit === u} onClick={() => setUnit(u)}>
                {u}
              </Chip>
            ))}
          </div>
        </FieldGroup>
        )}

        <FieldGroup label="Categoria">
          <div className="flex gap-2">
            {ICON_GROUPS.map(({ label, cat: groupCat }) => {
              const icon = CAT_ICON[groupCat];
              const c = FOOD_GLYPHS[icon].color;
              const sel = cat === groupCat;
              return (
                <button
                  key={label}
                  onClick={() => setCat(groupCat)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all flex-1"
                  style={{
                    background: sel ? c + "18" : "var(--c-card, #f5f3ff)",
                    border: sel
                      ? `1.5px solid ${c}`
                      : "1.5px solid transparent",
                    boxShadow: sel ? `0 0 0 3px ${c}22` : undefined,
                  }}
                >
                  <FoodIcon name={icon} size={28} />
                  <span
                    className="text-[10px] font-semibold leading-none text-center"
                    style={{ color: sel ? c : undefined }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </FieldGroup>

        <FieldGroup
          label="Validade"
          sub={`Avisamos quando ${name || "isso"} estiver perto de vencer`}
        >
          <div className="flex flex-wrap gap-1.5">
            {SHELF_LIFE.map((d) => (
              <Chip key={d} active={expiry === d} onClick={() => setExpiry(d)}>
                {d < 30 ? `${d} dias` : `${d / 30} mês`}
              </Chip>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup
          label="Meta mensal"
          sub="Preenche automaticamente quanto comprar na lista"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHasMonthly((v) => !v)}
              className={[
                "w-11 h-6 rounded-full transition-colors flex-shrink-0",
                hasMonthly ? "bg-accent" : "bg-subtle",
              ].join(" ")}
            >
              <span
                className={[
                  "block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5",
                  hasMonthly ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
              />
            </button>
            {hasMonthly && (
              <div className="flex items-center gap-2">
                <Input
                  value={monthlyBuy}
                  onChange={(e) => setMonthlyBuy(e.target.value)}
                  placeholder="0"
                  type="number"
                  className="w-24 text-center font-semibold"
                />
                <span className="text-sm font-semibold text-muted whitespace-nowrap">
                  {unit} / mês
                </span>
              </div>
            )}
          </div>
        </FieldGroup>

        <div className="flex gap-2 mt-1.5">
          <Button onClick={() => navigate(-1 as never)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            icon={<IcCheck size={14} />}
            disabled={!name || (!alwaysAvailable && !qty) || isPending}
            className="flex-1"
          >
            {isPending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
