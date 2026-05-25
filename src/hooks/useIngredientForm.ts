import { useCallback, useState } from 'react';
import type { IngredientCat } from '@/types';

export interface IngredientFormValues {
  name:           string;
  qty:            string;
  unit:           string;
  cat:            IngredientCat;
  expiry:         number;
  monthlyBuy:     string;
  hasMonthly:     boolean;
  alwaysAvailable: boolean;
}

export interface UseIngredientFormReturn {
  name:            string;
  qty:             string;
  unit:            string;
  cat:             IngredientCat;
  expiry:          number;
  monthlyBuy:      string;
  hasMonthly:      boolean;
  alwaysAvailable: boolean;

  setQty:             (v: string) => void;
  setUnit:            (v: string) => void;
  setCat:             (v: IngredientCat) => void;
  setExpiry:          (v: number) => void;
  setMonthlyBuy:      (v: string) => void;
  setHasMonthly:      (v: boolean) => void;
  setAlwaysAvailable: (v: boolean) => void;

  handleNameChange: (v: string) => void;
  reset:            (values: Partial<IngredientFormValues>) => void;
}

const NAME_GUESS: Record<string, IngredientCat> = {
  tomato:   'Produce',
  onion:    'Produce',
  garlic:   'Spice',
  carrot:   'Produce',
  pepper:   'Produce',
  lemon:    'Produce',
  basil:    'Spice',
  mint:     'Spice',
  egg:      'Protein',
  chicken:  'Protein',
  salmon:   'Protein',
  fish:     'Protein',
  cheese:   'Dairy',
  parmesan: 'Dairy',
  milk:     'Dairy',
  cream:    'Dairy',
  rice:     'Pantry',
  pasta:    'Pantry',
  bread:    'Pantry',
};

export function useIngredientForm(initial?: Partial<IngredientFormValues>): UseIngredientFormReturn {
  const [name,            setName]            = useState(initial?.name            ?? '');
  const [qty,             setQty]             = useState(initial?.qty             ?? '');
  const [unit,            setUnit]            = useState(initial?.unit            ?? 'unid');
  const [cat,             setCat]             = useState<IngredientCat>(initial?.cat  ?? 'Produce');
  const [expiry,          setExpiry]          = useState(initial?.expiry          ?? 7);
  const [monthlyBuy,      setMonthlyBuy]      = useState(initial?.monthlyBuy      ?? '');
  const [hasMonthly,      setHasMonthly]      = useState(initial?.hasMonthly      ?? false);
  const [alwaysAvailable, setAlwaysAvailable] = useState(initial?.alwaysAvailable ?? false);

  const handleNameChange = useCallback((v: string) => {
    setName(v);
    const match = Object.keys(NAME_GUESS).find((k) => v.toLowerCase().includes(k));
    if (match) setCat(NAME_GUESS[match]);
  }, []);

  const reset = useCallback((values: Partial<IngredientFormValues>) => {
    if (values.name            !== undefined) setName(values.name);
    if (values.qty             !== undefined) setQty(values.qty);
    if (values.unit            !== undefined) setUnit(values.unit);
    if (values.cat             !== undefined) setCat(values.cat);
    if (values.expiry          !== undefined) setExpiry(values.expiry);
    if (values.monthlyBuy      !== undefined) setMonthlyBuy(values.monthlyBuy);
    if (values.hasMonthly      !== undefined) setHasMonthly(values.hasMonthly);
    if (values.alwaysAvailable !== undefined) setAlwaysAvailable(values.alwaysAvailable);
  }, []);

  return {
    name, qty, unit, cat, expiry, monthlyBuy, hasMonthly, alwaysAvailable,
    setQty, setUnit, setCat, setExpiry, setMonthlyBuy, setHasMonthly, setAlwaysAvailable,
    handleNameChange,
    reset,
  };
}
