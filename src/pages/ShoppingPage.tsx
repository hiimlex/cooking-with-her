import { getPantry } from "@/api/pantry";
import { checkoutShopping } from "@/api/shopping";
import { Button, Card, FoodTile, Input, Label } from "@/components/atoms";
import { ScreenHeader, Section, ShoppingItem } from "@/components/molecules";
import { useShoppingList } from "@/hooks/useShoppingList";
import { CAT_ICON, IcCheck, IcPlus, IcX } from "@/icons";
import type { Ingredient } from "@/types";
import { stepForUnit, formatQtyForUnit } from "@/utils/units";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

interface CheckoutItem {
  id: string;
  name: string;
  ingredientId?: string;
  unit: string;
  purchasedQty: number;
  rawQty: string;
  step: number;
  monthlyBuy?: number;
}

function parseQtyNumber(qtyStr: string): number {
  const m = qtyStr.match(/^([\d.]+)/);
  return m ? parseFloat(m[1]) : 1;
}

function parseUnit(qtyStr: string): string {
  return qtyStr.replace(/^[\d.\s]+/, "").trim() || "unid";
}

function fmtQty(n: number, unit?: string): string {
  if (unit) return formatQtyForUnit(n, unit);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function ShoppingPage() {
  const qc = useQueryClient();
  const { items, isLoading, isAdding, add, toggle, remove, clearDone } =
    useShoppingList();
  const [newItem, setNewItem] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: pantryItems = [] } = useQuery<Ingredient[]>({
    queryKey: ["pantry"],
    queryFn: () => getPantry(),
  });

  const matches =
    newItem.trim().length > 0
      ? pantryItems
          .filter((i) => i.name.toLowerCase().includes(newItem.toLowerCase()))
          .slice(0, 6)
      : [];

  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);

  const queuedNames = new Set(open.map((i) => i.name.toLowerCase()));
  const outOfStock = pantryItems.filter(
    (i) => i.qty === 0 && i.alwaysAvailable !== true && !queuedNames.has(i.name.toLowerCase()),
  );

  const outOfStockNames = new Set(outOfStock.map((i) => i.name.toLowerCase()));
  const alreadyListed = (name: string) =>
    queuedNames.has(name.toLowerCase()) ||
    outOfStockNames.has(name.toLowerCase());

  const nearExpiry = pantryItems.filter(
    (i) => i.qty > 0 && i.alwaysAvailable !== true && i.expiry > 0 && i.expiry <= 3 && !alreadyListed(i.name),
  );

  const nearExpiryNames = new Set(nearExpiry.map((i) => i.name.toLowerCase()));
  const lowStock = pantryItems.filter((i) => {
    if (i.qty === 0 || i.alwaysAvailable === true) return false;
    if (alreadyListed(i.name) || nearExpiryNames.has(i.name.toLowerCase()))
      return false;
    if (i.monthlyBuy) return i.qty < i.monthlyBuy * 0.25;
    return false;
  });

  const handleAdd = async () => {
    if (!newItem.trim()) return;
    await add({ name: newItem.trim(), qty: "1 pc", cat: "Other" });
    setNewItem("");
    setDropdownOpen(false);
  };

  const buyQty = (ing: Ingredient): { amount: number; label: string } => {
    if (ing.monthlyBuy) {
      const remaining = ing.monthlyBuy - ing.qty;
      const amount = remaining > 0 ? remaining : ing.monthlyBuy;
      const label =
        remaining > 0
          ? `${amount} ${ing.unit} restam no mês`
          : `${amount} ${ing.unit} repor`;
      return { amount, label };
    }
    return { amount: 1, label: `repor ${ing.unit}` };
  };

  const handleSelectIngredient = (ing: Ingredient) => {
    const { amount } = buyQty(ing);
    add({ name: ing.name, qty: `${amount} ${ing.unit}`.trim(), cat: ing.cat });
    setNewItem("");
    setDropdownOpen(false);
  };

  const handleAddOutOfStock = async (ing: Ingredient) => {
    setAddingId(ing.id);
    try {
      const { amount } = buyQty(ing);
      await add({
        name: ing.name,
        qty: `${amount} ${ing.unit}`.trim(),
        cat: ing.cat,
        ingredientId: ing.id,
      });
    } finally {
      setAddingId(null);
    }
  };

  const handleInputBlur = () => {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 150);
  };

  const handleDropdownMouseDown = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const handleOpenCheckout = () => {
    const pantryMap = new Map(pantryItems.map((p) => [p.id, p]));
    const ci: CheckoutItem[] = done.map((item) => {
      const ingredient = item.ingredientId
        ? pantryMap.get(item.ingredientId)
        : undefined;
      const unit = ingredient?.unit ?? parseUnit(item.qty);
      const step = stepForUnit(unit);
      const purchasedQty = ingredient?.monthlyBuy ?? parseQtyNumber(item.qty);
      return {
        id: item.id,
        name: item.name,
        ingredientId: item.ingredientId,
        unit,
        purchasedQty,
        rawQty: fmtQty(purchasedQty, unit),
        step,
        monthlyBuy: ingredient?.monthlyBuy,
      };
    });
    setCheckoutItems(ci);
    setCheckoutOpen(true);
  };

  const adjustQty = (id: string, delta: number) => {
    setCheckoutItems((prev) =>
      prev.map((ci) => {
        if (ci.id !== id) return ci;
        const next = Math.max(
          0,
          parseFloat((ci.purchasedQty + delta).toFixed(2)),
        );
        return { ...ci, purchasedQty: next, rawQty: fmtQty(next, ci.unit) };
      }),
    );
  };

  const handleRawQtyChange = (id: string, raw: string) => {
    setCheckoutItems((prev) =>
      prev.map((ci) => {
        if (ci.id !== id) return ci;
        const parsed = parseFloat(raw);
        const purchasedQty =
          !isNaN(parsed) && parsed >= 0 ? parsed : ci.purchasedQty;
        return { ...ci, rawQty: raw, purchasedQty };
      }),
    );
  };

  const commitRawQty = (id: string) => {
    setCheckoutItems((prev) =>
      prev.map((ci) =>
        ci.id === id ? { ...ci, rawQty: fmtQty(ci.purchasedQty, ci.unit) } : ci,
      ),
    );
  };

  const handleConfirmCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const withIngredient = checkoutItems.filter(
        (ci) => ci.ingredientId && ci.purchasedQty > 0,
      );
      if (withIngredient.length > 0) {
        await checkoutShopping(
          withIngredient.map((ci) => ({
            ingredientId: ci.ingredientId!,
            purchasedQty: ci.purchasedQty,
          })),
        );
        qc.invalidateQueries({ queryKey: ["pantry"] });
        qc.invalidateQueries({ queryKey: ["shopping"] });
      } else {
        await clearDone();
      }
      setCheckoutOpen(false);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const linkedCount = checkoutItems.filter((ci) => ci.ingredientId).length;

  return (
    <div className={done.length > 0 ? "pb-[40px]" : ""}>
      <ScreenHeader
        title="Compras"
        sub={
          isLoading ? "Carregando…" : `${open.length} para comprar · ao vivo`
        }
        right={
          <Label color="green" className="h-6 px-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-success"
              style={{ animation: "pulseDot 1.5s infinite" }}
            />
            Ao vivo
          </Label>
        }
      />

      {/* Quick add */}
      <div className="px-[18px] pt-1 pb-3.5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={newItem}
              onChange={(e) => {
                setNewItem(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={handleInputBlur}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="O que esquecemos?"
            />
            {dropdownOpen && matches.length > 0 && (
              <div
                className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-card rounded-2xl shadow-lg overflow-hidden"
                onMouseDown={handleDropdownMouseDown}
              >
                {matches.map((ing) => (
                  <button
                    key={ing.id}
                    type="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-canvas transition-colors text-left"
                    onClick={() => handleSelectIngredient(ing)}
                  >
                    <FoodTile
                      name={CAT_ICON[ing.cat]}
                      tileSize={32}
                      radius={8}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink truncate">
                        {ing.name}
                      </div>
                      <div className="text-[11px] text-muted">
                        {buyQty(ing).label}
                      </div>
                    </div>
                    {ing.monthlyBuy && (
                      <span className="text-[10px] font-bold text-accent bg-accent-tint px-1.5 py-0.5 rounded-lg flex-shrink-0">
                        {ing.monthlyBuy}
                        {ing.unit}/mês
                      </span>
                    )}
                    <IcPlus size={14} className="text-muted flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={!newItem.trim() || isAdding}
            icon={<IcPlus size={14} />}
          >
            Adicionar
          </Button>
        </div>
      </div>

      {/* Out of stock — from pantry with qty=0 */}
      {outOfStock.length > 0 && (
        <div className="px-[18px] pt-1 pb-5">
          <Section
            title="Fora do estoque"
            count={outOfStock.length}
            kicker="despensa zerada"
            padded={false}
          />
          <div className="mt-3 flex flex-col gap-2 max-h-[200px] overflow-y-auto no-scrollbar">
            {outOfStock.map((ing) => {
              const { amount } = buyQty(ing);
              const isThis = addingId === ing.id;
              return (
                <div
                  key={ing.id}
                  className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-3.5 py-2.5"
                >
                  <FoodTile
                    name={CAT_ICON[ing.cat]}
                    tileSize={36}
                    radius={10}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-ink truncate">
                      {ing.name}
                    </div>
                    <div className="text-[11px] text-amber-700 font-semibold">
                      {amount} {ing.unit} · sem estoque
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isThis}
                    onClick={() => handleAddOutOfStock(ing)}
                    className="flex items-center gap-1 text-[12px] font-bold text-accent bg-accent-tint px-2.5 py-1.5 rounded-xl hover:bg-accent hover:text-white transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <IcPlus size={11} />
                    {isThis ? "…" : "Lista"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Near expiry — qty > 0, expiring within 3 days */}
      {nearExpiry.length > 0 && (
        <div className="px-[18px] pt-1 pb-5">
          <Section
            title="Perto do vencimento"
            count={nearExpiry.length}
            kicker="usar ou comprar mais"
            padded={false}
          />
          <div className="mt-3 flex flex-col gap-2 max-h-[180px] overflow-y-auto thin-scrollbar pr-1">
            {nearExpiry.map((ing) => {
              const { amount } = buyQty(ing);
              const isThis = addingId === ing.id;
              return (
                <div
                  key={ing.id}
                  className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-3.5 py-2.5"
                >
                  <FoodTile
                    name={CAT_ICON[ing.cat]}
                    tileSize={36}
                    radius={10}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-ink truncate">
                      {ing.name}
                    </div>
                    <div className="text-[11px] text-red-600 font-semibold">
                      vence em{" "}
                      {ing.expiry === 1 ? "1 dia" : `${ing.expiry} dias`} ·{" "}
                      {ing.qty} {ing.unit} restam
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isThis}
                    onClick={() => handleAddOutOfStock(ing)}
                    className="flex items-center gap-1 text-[12px] font-bold text-accent bg-accent-tint px-2.5 py-1.5 rounded-xl hover:bg-accent hover:text-white transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <IcPlus size={11} />
                    {isThis ? "…" : "Lista"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Low stock — qty > 0 but running low */}
      {lowStock.length > 0 && (
        <div className="px-[18px] pt-1 pb-5">
          <Section
            title="Acabando"
            count={lowStock.length}
            kicker="estoque baixo"
            padded={false}
          />
          <div className="mt-3 flex flex-col gap-2 max-h-[180px] overflow-y-auto thin-scrollbar pr-1">
            {lowStock.map((ing) => {
              const { amount } = buyQty(ing);
              const isThis = addingId === ing.id;
              return (
                <div
                  key={ing.id}
                  className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-3.5 py-2.5"
                >
                  <FoodTile
                    name={CAT_ICON[ing.cat]}
                    tileSize={36}
                    radius={10}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-ink truncate">
                      {ing.name}
                    </div>
                    <div className="text-[11px] text-blue-600 font-semibold">
                      {ing.qty} {ing.unit} restam
                      {ing.monthlyBuy
                        ? ` · meta ${ing.monthlyBuy} ${ing.unit}/mês`
                        : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isThis}
                    onClick={() => handleAddOutOfStock(ing)}
                    className="flex items-center gap-1 text-[12px] font-bold text-accent bg-accent-tint px-2.5 py-1.5 rounded-xl hover:bg-accent hover:text-white transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <IcPlus size={11} />
                    {isThis ? "…" : "Lista"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* To buy */}
      <div className="px-[18px] pt-1">
        <Section title="Para comprar" count={open.length} padded={false} />
        <div className="mt-3 flex flex-col gap-2">
          {isLoading && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[54px] bg-canvas rounded-2xl animate-pulse"
                />
              ))}
            </>
          )}
          {!isLoading && open.length === 0 && (
            <Card className="p-6 text-center">
              <div className="text-[13px] text-muted">
                Nada para comprar. Despensa feliz.
              </div>
            </Card>
          )}
          {open.map((i) => (
            <div key={i.id} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <ShoppingItem item={i} onToggle={() => toggle(i.id)} />
              </div>
              <button
                type="button"
                onClick={() => remove(i.id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-subtle hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <IcX size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Done */}
      {done.length > 0 && (
        <div className="px-[18px] pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <Section title="No carrinho" count={done.length} padded={false} />
            <Button
              variant="soft"
              size="sm"
              icon={<IcX size={12} />}
              onClick={() => clearDone()}
            >
              Limpar
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {done.map((i) => (
              <ShoppingItem key={i.id} item={i} onToggle={() => toggle(i.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Floating checkout button */}
      {done.length > 0 && (
        <div className="fixed bottom-24 left-[18px] right-[18px] z-40 pointer-events-none">
          <button
            type="button"
            onClick={handleOpenCheckout}
            className="pointer-events-auto w-full flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-white transition-transform active:scale-[0.98]"
            style={{ background: "var(--c-accent)" }}
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-[13px]"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              {done.length}
            </div>
            <span className="flex-1 text-left text-[14px] font-bold">
              No carrinho
            </span>
            <span className="text-[13px] font-semibold opacity-90">
              Finalizar →
            </span>
          </button>
        </div>
      )}

      {/* Checkout bottom sheet */}
      {checkoutOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setCheckoutOpen(false)}
        >
          <div
            className="bg-card rounded-t-3xl pb-10 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-canvas" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-4">
              <div>
                <div className="text-[17px] font-extrabold text-ink">
                  Finalizar compra
                </div>
                <div className="text-[12px] text-muted mt-0.5">
                  {linkedCount > 0
                    ? `${linkedCount} item${linkedCount > 1 ? "ns" : ""} vai abastecer a despensa`
                    : "Nenhum item vinculado à despensa"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-subtle hover:bg-canvas transition-colors"
              >
                <IcX size={16} />
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3 pb-5">
              {checkoutItems.map((ci) => (
                <div key={ci.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[14px] font-bold text-ink truncate">{ci.name}</span>
                      <span className="text-[11px] font-semibold text-muted flex-shrink-0">{ci.unit}</span>
                    </div>
                    {ci.monthlyBuy ? (
                      <div className="text-[11px] text-muted mt-0.5">
                        meta mensal: {ci.monthlyBuy} {ci.unit}
                      </div>
                    ) : !ci.ingredientId ? (
                      <div className="text-[11px] text-muted mt-0.5">
                        item manual
                      </div>
                    ) : null}
                  </div>
                  {ci.ingredientId ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => adjustQty(ci.id, -ci.step)}
                        disabled={ci.purchasedQty <= 0}
                        className="w-8 h-8 rounded-xl bg-canvas flex items-center justify-center text-ink font-bold text-lg leading-none hover:bg-accent hover:text-white transition-colors disabled:opacity-30"
                      >
                        −
                      </button>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={ci.rawQty}
                          onChange={(e) =>
                            handleRawQtyChange(ci.id, e.target.value)
                          }
                          onBlur={() => commitRawQty(ci.id)}
                          className="w-14 text-center text-[14px] font-bold text-ink bg-canvas rounded-xl py-1.5 outline-none focus:ring-2 tabular-nums"
                          style={
                            {
                              "--tw-ring-color": "var(--c-accent)",
                            } as React.CSSProperties
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => adjustQty(ci.id, ci.step)}
                        className="w-8 h-8 rounded-xl bg-canvas flex items-center justify-center text-ink font-bold text-lg leading-none hover:bg-accent hover:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="text-[12px] text-muted flex-shrink-0">
                      {ci.purchasedQty > 0
                        ? `${fmtQty(ci.purchasedQty, ci.unit)} ${ci.unit}`
                        : "—"}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Confirm button */}
            <div className="px-5 pt-2">
              <button
                type="button"
                disabled={isCheckingOut}
                onClick={handleConfirmCheckout}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-[15px] font-bold transition-opacity disabled:opacity-60"
                style={{ background: "var(--c-accent)" }}
              >
                <IcCheck size={16} />
                {isCheckingOut
                  ? "Abastecendo…"
                  : linkedCount > 0
                    ? `Confirmar e abastecer ${linkedCount} item${linkedCount > 1 ? "ns" : ""}`
                    : "Confirmar e limpar carrinho"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
