import { addIngredient } from "@/api/pantry";
import { Button, Card, Chip, FoodIcon, Input, Label } from "@/components/atoms";
import { FieldGroup, SubHeader } from "@/components/molecules";
import { CAT_ICON, FOOD_GLYPHS, IcCheck } from "@/icons";
import type { IngredientCat } from "@/types";
import { UNITS } from "@/utils/units";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ICON_GROUPS: { label: string; cat: IngredientCat }[] = [
  { label: "Hortifruti", cat: "Produce" },
  { label: "Proteína", cat: "Protein" },
  { label: "Laticínio", cat: "Dairy" },
  { label: "Despensa", cat: "Pantry" },
  { label: "Tempero", cat: "Spice" },
  { label: "Outro", cat: "Other" },
];

const NAME_GUESS: Record<string, IngredientCat> = {
  tomato: "Produce",
  onion: "Produce",
  garlic: "Spice",
  carrot: "Produce",
  pepper: "Produce",
  lemon: "Produce",
  basil: "Spice",
  mint: "Spice",
  egg: "Protein",
  chicken: "Protein",
  salmon: "Protein",
  fish: "Protein",
  cheese: "Dairy",
  parmesan: "Dairy",
  milk: "Dairy",
  cream: "Dairy",
  rice: "Pantry",
  pasta: "Pantry",
  bread: "Pantry",
};

const SHELF_LIFE = [2, 5, 7, 14, 30, 90];

export function AddIngredientPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState<string>("unid");
  const [cat, setCat] = useState<IngredientCat>("Produce");
  const [expiry, setExpiry] = useState<number>(7);
  const [monthlyBuy, setMonthlyBuy] = useState("");
  const [hasMonthly, setHasMonthly] = useState(false);
  const [alwaysAvailable, setAlwaysAvailable] = useState(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: addIngredient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry'] });
      qc.invalidateQueries({ queryKey: ['recipes'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleNameChange = (v: string) => {
    setName(v);
    const match = Object.keys(NAME_GUESS).find((k) =>
      v.toLowerCase().includes(k),
    );
    if (match) setCat(NAME_GUESS[match]);
  };

  const handleSave = async () => {
    if (!name) return;
    await mutateAsync({
      name,
      qty: alwaysAvailable ? 0 : Number(qty),
      unit,
      cat,
      expiry,
      alwaysAvailable,
      ...(hasMonthly && monthlyBuy ? { monthlyBuy: Number(monthlyBuy) } : {}),
    });
    navigate("/pantry");
  };

  return (
    <div className="pb-[110px] bg-bg min-h-full">
      <SubHeader
        onBack={() => navigate(-1 as never)}
        title="Adicionar ingrediente"
        sub="O que acabamos de guardar?"
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
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="ex: Tomate cereja"
            autoFocus
          />
        </FieldGroup>

        <FieldGroup
          label="Sempre disponível"
          sub="Temperos e básicos que nunca acabam (sal, pimenta…)"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAlwaysAvailable((v) => !v)}
              className={[
                "w-11 h-6 rounded-full transition-colors flex-shrink-0",
                alwaysAvailable ? "bg-accent" : "bg-subtle",
              ].join(" ")}
            >
              <span
                className={[
                  "block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5",
                  alwaysAvailable ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
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
            <div className="flex items-center justify-between gap-2.5">
              <Input
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
                type="number"
                className="flex-1 text-center h-[40px] font-bold flex-shrink-0"
              />
              <div className="flex flex-wrap gap-1.5">
                {UNITS.map((u) => (
                  <Chip key={u} active={unit === u} onClick={() => setUnit(u)}>
                    {u}
                  </Chip>
                ))}
              </div>
            </div>
          </FieldGroup>
        )}

        <FieldGroup label="Categoria" sub="Adivinhamos pelo nome">
          <div className="flex gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
            {ICON_GROUPS.map(({ label, cat: groupCat }) => {
              const icon = CAT_ICON[groupCat];
              const c = FOOD_GLYPHS[icon].color;
              const sel = cat === groupCat;
              return (
                <button
                  key={label}
                  onClick={() => setCat(groupCat)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all shrink-0 min-w-[60px]"
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

        <div className="flex items-center gap-2 mt-1.5">
          <Button onClick={() => navigate(-1 as never)} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
            icon={<IcCheck size={14} />}
            disabled={!name || (!alwaysAvailable && !qty) || isPending}
          >
            {isPending ? "Salvando…" : "Adicionar à despensa"}
          </Button>
        </div>
      </div>
    </div>
  );
}
