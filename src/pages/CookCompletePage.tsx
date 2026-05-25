import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, FoodIcon } from '@/components/atoms';
import { FOOD_GLYPHS, IcCheck, IcImage, IcStar, IcX } from '@/icons';
import { useRecipeDetail } from '@/hooks/useRecipeDetail';
import { finishRecipe } from '@/api/recipes';
import { createMemory } from '@/api/memories';
import type { FoodGlyphId } from '@/types';

function resizeImage(file: File, maxPx = 900, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width  * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function CookCompletePage() {
  const navigate    = useNavigate();
  const { id = '' } = useParams<{ id: string }>();
  const qc          = useQueryClient();

  const { recipe, isLoading } = useRecipeDetail(id);

  const [rating,       setRating]       = useState(5);
  const [note,         setNote]         = useState('');
  const [photo,        setPhoto]        = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sprite0 = (recipe?.sprites[0]?.sprite ?? 'Tomato') as FoodGlyphId;
  const accent  = (FOOD_GLYPHS as Record<string, { color: string }>)[sprite0]?.color ?? '#7c3aed';

  const saveMutation = useMutation({
    mutationFn: async () => {
      await finishRecipe(id, { rating, note: note.trim() || undefined });

      if (photo) {
        const photoUrl = await resizeImage(photo);
        await createMemory({
          recipeId: id,
          date:     new Date().toISOString(),
          bg:       accent + '20',
          photoUrl,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pantry'] });
      qc.invalidateQueries({ queryKey: ['history'] });
      qc.invalidateQueries({ queryKey: ['memories'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      navigate('/home');
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
    if (fileRef.current) fileRef.current.value = '';
  };

  if (isLoading || !recipe) {
    return (
      <div className="absolute inset-0 bg-bg flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-canvas animate-pulse" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-bg flex flex-col overflow-auto no-scrollbar">

      {/* Confetti */}
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-sm"
            style={{
              left:       `${(i * 37 + 5) % 100}%`,
              top:        -12,
              background: ['#7c3aed', '#ff7eb9', '#22c55e', '#f59e0b', '#a78bfa', '#38bdf8'][i % 6],
              animation:  `fall ${2.5 + (i % 5) * 0.6}s linear ${i * 0.12}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Hero */}
      <div className="px-6 pt-[64px] pb-2 text-center relative z-[1]">
        <div
          className="w-[88px] h-[88px] rounded-[28px] mx-auto mb-4 flex items-center justify-center shadow-lg"
          style={{ background: accent + '20', boxShadow: `0 8px 32px ${accent}30` }}
        >
          <FoodIcon name={sprite0} size={52} />
        </div>
        <div className="text-xs font-bold text-accent uppercase tracking-[0.7px] mb-1">
          arrasaram!
        </div>
        <h1 className="m-0 text-[26px] font-extrabold text-ink tracking-[-0.6px] leading-[1.1]">
          {recipe.name}
        </h1>
        <p className="m-0 mt-1.5 text-[13px] text-muted">
          {recipe.time} min · {recipe.ingredients.length} ingredientes
        </p>
      </div>

      <div className="px-[18px] pt-4 pb-8 flex flex-col gap-3.5 relative z-[1]">

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
          <div className="text-sm font-bold text-ink mb-2.5">Registrar memória</div>

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
              <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-[11px] text-white/90 font-semibold">Foto selecionada</p>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={[
                'w-full h-[110px] rounded-2xl border-2 border-dashed border-canvas',
                'flex flex-col items-center justify-center gap-2',
                'text-subtle hover:text-accent hover:border-accent/40 transition-colors',
              ].join(' ')}
            >
              <IcImage size={26} />
              <span className="text-[13px] font-semibold">Adicionar foto</span>
              <span className="text-[11px]">Toque para escolher da galeria</span>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </Card>

        {/* Error */}
        {saveMutation.isError && (
          <div className="rounded-2xl bg-red-50 px-3.5 py-2.5 text-sm text-red-600 font-semibold">
            Erro ao salvar. Tente de novo.
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            onClick={() => navigate('/home')}
            disabled={saveMutation.isPending}
          >
            Pular
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            icon={saveMutation.isPending ? undefined : <IcCheck size={14} />}
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Salvando…' : 'Salvar memória'}
          </Button>
        </div>
      </div>
    </div>
  );
}
