import type { RecipeDto } from '@/model/recipe';

/**
 * ok          — all required ingredients are in stock with enough quantity.
 * low         — can make it once, but at least one required ingredient will leave
 *               very little remaining (< 30 % of what the recipe uses, or < 20 % of stock).
 * unavailable — cannot make it: at least one required ingredient has qty = 0 or qty < needed.
 */
export type CookStatus = 'ok' | 'low' | 'unavailable';

export function recipeCookability(dto: RecipeDto): CookStatus {
  let status: CookStatus = 'ok';

  for (const ri of dto.ingredients) {
    // Opcionais e sempres-disponíveis não bloqueiam
    if (ri.optional)                    continue;
    if (ri.ingredient.alwaysAvailable)  continue;

    const stock  = ri.ingredient.qty ?? 0;
    const needed = ri.qty;

    // Unidades diferentes — não conseguimos comparar, ignorar
    if (ri.unit !== ri.ingredient.unit) continue;

    if (needed <= 0) continue;

    if (stock <= 0)       return 'unavailable'; // sem estoque
    if (stock < needed)   return 'unavailable'; // estoque insuficiente

    // Tem o suficiente, mas vai sobrar pouco: menos de 30 % do necessário
    if ((stock - needed) < needed * 0.3) {
      status = 'low';
    }
  }

  return status;
}

export const COOK_STATUS_LABEL: Record<CookStatus, string> = {
  ok:          '',
  low:         'Estoque baixo',
  unavailable: 'Falta ingrediente',
};
