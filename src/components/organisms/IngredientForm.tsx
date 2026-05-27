import { Card, Chip, FoodIcon, Input, Label } from "@/components/atoms";
import { FieldGroup } from "@/components/molecules";
import type { UseIngredientFormReturn } from "@/hooks/useIngredientForm";
import { CAT_ICON, FOOD_GLYPHS } from "@/icons";
import { UNITS } from "@/utils/units";

const ICON_GROUPS = [
  { label: "Hortifruti", cat: "Produce" },
  { label: "Proteína", cat: "Protein" },
  { label: "Laticínio", cat: "Dairy" },
  { label: "Despensa", cat: "Pantry" },
  { label: "Tempero", cat: "Spice" },
  { label: "Outro", cat: "Other" },
] as const;

export const SHELF_LIFE = [2, 5, 7, 14, 30, 90];

interface IngredientFormProps {
  form: UseIngredientFormReturn;
  autoFocus?: boolean;
}

export function IngredientForm({
  form,
  autoFocus = false,
}: IngredientFormProps) {
  const {
    name,
    handleNameChange,
    qty,
    setQty,
    unit,
    setUnit,
    cat,
    setCat,
    expiry,
    setExpiry,
    monthlyBuy,
    setMonthlyBuy,
    hasMonthly,
    setHasMonthly,
    alwaysAvailable,
    setAlwaysAvailable,
  } = form;

  return (
    <>
      {/* Live preview */}
      <div className="pb-[22px]">
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

      {/* Name */}
      <FieldGroup label="O que é?">
        <Input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="ex: Tomate cereja"
          autoFocus={autoFocus}
        />
      </FieldGroup>

      {/* Always available toggle */}
      <FieldGroup
        label="Sempre disponível"
        sub="Temperos e básicos que nunca acabam (sal, pimenta…)"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setAlwaysAvailable(!alwaysAvailable)}
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

      {/* Quantity + unit */}

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

      {/* Category */}
      <FieldGroup label="Categoria" sub="Adivinhamos pelo nome">
        <div className="flex gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none">
          {ICON_GROUPS.map(({ label, cat: groupCat }) => {
            const icon = CAT_ICON[groupCat];
            const c = FOOD_GLYPHS[icon].color;
            const sel = cat === groupCat;
            return (
              <button
                key={label}
                type="button"
                onClick={() => setCat(groupCat)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all shrink-0 min-w-[60px]"
                style={{
                  background: sel ? c + "18" : "var(--c-card, #f5f3ff)",
                  border: sel ? `1.5px solid ${c}` : "1.5px solid transparent",
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

      {/* Expiry */}
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

      {/* Monthly goal */}
      <FieldGroup
        label="Meta mensal"
        sub="Preenche automaticamente quanto comprar na lista"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setHasMonthly(!hasMonthly)}
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
    </>
  );
}
