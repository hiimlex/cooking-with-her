import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, FoodIcon } from '@/components/atoms';
import { FOOD_GLYPHS, IcCalendar, IcCamera, IcChevLeft, IcImage, IcSearch, IcStar, IcX } from '@/icons';
import { finishRecipe, getRecipes } from '@/api/recipes';
import { createMemory, uploadMemoryPhoto } from '@/api/memories';
import type { RecipeDto } from '@/model/recipe';
import type { FoodGlyphId } from '@/types';

function todayLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function localDateToISO(dateStr: string): string {
  // dateStr = "YYYY-MM-DD" — treat as local noon to avoid TZ-shift
  return new Date(`${dateStr}T12:00:00`).toISOString();
}

export function LogPastDinnerPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [date, setDate] = useState(yesterdayLocal());
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDto | null>(null);
  const [mealType, setMealType] = useState<'dinner' | 'free'>('dinner');
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ['recipes', 'picker', debouncedSearch],
    queryFn: () => getRecipes(debouncedSearch ? { search: debouncedSearch } : undefined),
    enabled: searchFocused || debouncedSearch.length > 0,
  });

  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const sprite0 = (selectedRecipe?.sprites[0]?.sprite ?? 'Tomato') as FoodGlyphId;
  const accent = (FOOD_GLYPHS as Record<string, { color: string }>)[sprite0]?.color ?? '#7c3aed';

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRecipe) throw new Error('Nenhuma receita selecionada');
      const cookedAt = localDateToISO(date);

      await finishRecipe(selectedRecipe.id, {
        rating,
        note: note.trim() || undefined,
        mealType,
        cookedAt,
      });

      if (photo) {
        const photoUrl = await uploadMemoryPhoto(photo);
        await createMemory({
          recipeId: selectedRecipe.id,
          date:     cookedAt,
          bg:       accent + '20',
          photoUrl,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['history'] });
      qc.invalidateQueries({ queryKey: ['memories'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      navigate('/us');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (galleryRef.current) galleryRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  const showDropdown = !selectedRecipe && searchFocused;

  const selectRecipe = (r: RecipeDto) => {
    setSelectedRecipe(r);
    setSearch('');
    setSearchFocused(false);
  };

  const formatDateLabel = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

  return (
    <div className="absolute inset-0 bg-bg flex flex-col overflow-auto no-scrollbar">

      {/* Header */}
      <div className="px-[18px] pt-[56px] pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/us')}
          className="w-9 h-9 rounded-2xl bg-canvas flex items-center justify-center text-muted"
        >
          <IcChevLeft size={18} />
        </button>
        <div>
          <h1 className="m-0 text-[20px] font-extrabold text-ink tracking-[-0.5px] leading-none">
            Registrar janta passada
          </h1>
          <p className="m-0 text-[12px] text-muted mt-1">
            Esqueceu de marcar no dia? Sem problema.
          </p>
        </div>
      </div>

      <div className="px-[18px] pb-10 flex flex-col gap-3.5">

        {/* Date */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <IcCalendar size={15} className="text-accent" />
              Quando foi?
            </div>
            <span className="text-[12px] text-muted font-semibold">{formatDateLabel(date)}</span>
          </div>
          <input
            type="date"
            value={date}
            max={todayLocal()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="w-full rounded-2xl bg-canvas px-4 py-2.5 text-sm text-ink border border-transparent focus:outline-none focus:border-accent/40 appearance-none"
          />
        </Card>

        {/* Recipe picker */}
        <Card className="p-4">
          <div className="text-sm font-bold text-ink mb-3">Qual receita?</div>

          {selectedRecipe ? (
            <div
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{ background: accent + '12' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: accent + '22' }}
              >
                <FoodIcon name={sprite0} size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-ink truncate">{selectedRecipe.name}</div>
                <div className="text-[11px] text-muted mt-0.5">{selectedRecipe.time} min · {selectedRecipe.tag}</div>
              </div>
              <button
                type="button"
                onClick={() => { setSelectedRecipe(null); setSearchFocused(true); setTimeout(() => searchRef.current?.focus(), 0); }}
                className="w-7 h-7 rounded-full bg-canvas flex items-center justify-center text-muted"
              >
                <IcX size={12} />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <IcSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  placeholder="Buscar receita…"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-canvas text-sm text-ink placeholder:text-subtle border border-transparent focus:outline-none focus:border-accent/40"
                />
              </div>

              {showDropdown && (
                <div className="mt-2 flex flex-col gap-1">
                  {recipesLoading ? (
                    <div className="flex flex-col gap-0.5">
                      {[72, 55, 88, 60].map((w, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                          <div className="w-8 h-8 rounded-xl bg-canvas animate-pulse flex-shrink-0" />
                          <div className="flex-1 flex flex-col gap-1.5">
                            <div className="h-3 rounded-lg bg-canvas animate-pulse" style={{ width: `${w}%` }} />
                            <div className="h-2.5 rounded-lg bg-canvas animate-pulse" style={{ width: '30%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recipes.length === 0 ? (
                    <div className="text-center text-muted text-[13px] py-4">Nenhuma receita encontrada.</div>
                  ) : (
                    <div className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5 pr-0.5">
                      {recipes.map((r) => {
                        const sp = (r.sprites[0]?.sprite ?? 'Tomato') as FoodGlyphId;
                        const ac = (FOOD_GLYPHS as Record<string, { color: string }>)[sp]?.color ?? '#7c3aed';
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => selectRecipe(r)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-canvas transition-colors text-left"
                          >
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: ac + '20' }}
                            >
                              <FoodIcon name={sp} size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[13px] font-semibold text-ink truncate">{r.name}</div>
                              <div className="text-[11px] text-muted">{r.time} min</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Card>

        {/* Meal type */}
        <Card className="p-4">
          <div className="text-sm font-bold text-ink mb-3">Que refeição foi essa?</div>
          <div className="flex gap-2">
            {([
              { value: 'dinner', emoji: '🍽️', label: 'Janta',  sub: 'Conta no streak' },
              { value: 'free',   emoji: '🥪', label: 'Avulso', sub: 'Só pra registrar' },
            ] as const).map(({ value, emoji, label, sub }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMealType(value)}
                className={[
                  'flex-1 h-[72px] rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all',
                  mealType === value
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-canvas text-muted',
                ].join(' ')}
              >
                <span className="text-[22px] leading-none">{emoji}</span>
                <span className="text-[12px] font-bold mt-1">{label}</span>
                <span className={[
                  'text-[10px] font-medium',
                  mealType === value ? 'text-white/70' : 'text-subtle',
                ].join(' ')}>{sub}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Rating */}
        <Card className="p-4">
          <div className="text-sm font-bold text-ink mb-3">Como ficou?</div>
          <div className="flex gap-2 justify-center mb-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1 transition-all active:scale-110"
              >
                <IcStar
                  size={36}
                  filled={n <= rating}
                  className={n <= rating ? 'text-attention' : 'text-canvas'}
                />
              </button>
            ))}
          </div>
          <div className="text-[11px] text-muted text-center font-semibold">
            {['', 'Não curti', 'Passou', 'Boa!', 'Muito boa!', 'Perfeita!'][rating]}
          </div>
        </Card>

        {/* Note */}
        <Card className="p-4">
          <div className="text-sm font-bold text-ink mb-2.5">Deixe um recado</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Como foi cozinhar juntos? Algum segredo que funcionou?"
            rows={3}
            className={[
              'w-full resize-none rounded-2xl px-3.5 py-2.5',
              'text-sm text-ink placeholder:text-subtle',
              'bg-canvas border border-transparent',
              'focus:outline-none focus:border-accent/40 focus:bg-bg',
              'transition-colors leading-[1.55]',
            ].join(' ')}
          />
        </Card>

        {/* Photo */}
        <Card className="p-4">
          <div className="text-sm font-bold text-ink mb-2.5">Adicionar foto (opcional)</div>

          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={photoPreview}
                alt="Foto da receita"
                className="w-full object-cover max-h-[220px]"
              />
              <button
                type="button"
                onClick={removePhoto}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <IcX size={13} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className={[
                  'h-[80px] rounded-2xl border-2 border-dashed border-canvas',
                  'flex flex-col items-center justify-center gap-1.5',
                  'text-subtle hover:text-accent hover:border-accent/40 transition-colors',
                ].join(' ')}
              >
                <IcCamera size={20} />
                <span className="text-[12px] font-semibold">Câmera</span>
              </button>
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                className={[
                  'h-[80px] rounded-2xl border-2 border-dashed border-canvas',
                  'flex flex-col items-center justify-center gap-1.5',
                  'text-subtle hover:text-accent hover:border-accent/40 transition-colors',
                ].join(' ')}
              >
                <IcImage size={20} />
                <span className="text-[12px] font-semibold">Galeria</span>
              </button>
            </div>
          )}

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </Card>

        {/* Error */}
        {saveMutation.isError && (
          <div className="rounded-2xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600 font-semibold">
            {saveMutation.error instanceof Error
              ? saveMutation.error.message
              : 'Erro ao salvar. Tente de novo.'}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button onClick={() => navigate('/us')} disabled={saveMutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !selectedRecipe}
          >
            {saveMutation.isPending ? 'Salvando…' : 'Salvar registro'}
          </Button>
        </div>
      </div>
    </div>
  );
}
