import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Chip } from '@/components/atoms';
import { Callout, FieldGroup, Segmented, SubHeader } from '@/components/molecules';
import { TextArea } from '@/components/atoms/Input';
import { AILoading } from '@/components/organisms';
import { IcFridge, IcSparkle } from '@/icons';
import { AI_TAGS } from '@/data/mock';
import { getPantry } from '@/api/pantry';
import { useAIGenerate } from '@/hooks/useAIGenerate';
import type { AIResult } from '@/api/ai';
import type { Ingredient } from '@/types';

export function AIGeneratePage() {
  const navigate = useNavigate();
  const [tags, setTags]     = useState<Set<string>>(new Set(['usepantry']));
  const [time, setTime]     = useState<number>(30);
  const [prompt, setPrompt] = useState('');

  const { generate, isLoading, error } = useAIGenerate();

  const { data: pantryItems = [] } = useQuery<Ingredient[]>({
    queryKey: ['pantry'],
    queryFn:  () => getPantry(),
  });

  const expiringCount = pantryItems.filter((i) => i.expiry <= 4).length;

  const toggle = (id: string) => {
    const next = new Set(tags);
    if (next.has(id)) next.delete(id); else next.add(id);
    setTags(next);
  };

  const handleGenerate = async () => {
    const result: AIResult | null = await generate({
      prompt,
      timeMinutes:    time,
      tags:           Array.from(tags),
      useWhatWeHave:  tags.has('usepantry'),
    });

    if (result) {
      navigate('/ai/results', { state: { result } });
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-full" style={{ minHeight: '100dvh' }}>
        <AILoading />
      </div>
    );
  }

  return (
    <div className="pb-[110px] bg-bg min-h-full">
      <SubHeader
        onBack={() => navigate(-1 as never)}
        title="Ask Nonna"
        sub="Ela conhece sua despensa e sabe o que precisam usar."
      />

      <div className="px-[18px] pt-2 pb-5 flex flex-col gap-5">
        <FieldGroup
          label="O que vocês têm vontade de comer?"
          sub={'Pode ser específico ("bolo de chocolate") ou vago ("algo leve e rápido")'}
        >
          <TextArea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="ex: macarrão carbonara, bolo de cenoura, algo com frango…"
            rows={3}
            className="min-h-[80px]"
          />
        </FieldGroup>

        <FieldGroup label="Quanto tempo temos?">
          <Segmented<number>
            full
            value={time}
            onChange={setTime}
            options={[
              { value: 15, label: '15 min' },
              { value: 30, label: '30 min' },
              { value: 45, label: '45 min' },
              { value: 60, label: '1h+' },
            ]}
          />
        </FieldGroup>

        <FieldGroup label="O clima" sub="Escolha quantos quiser">
          <div className="flex flex-wrap gap-1.5">
            {AI_TAGS.filter((t) => t.group === 'mood').map((t) => (
              <Chip key={t.id} active={tags.has(t.id)} onClick={() => toggle(t.id)}>
                {t.label}
              </Chip>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Restrições">
          <div className="flex flex-wrap gap-1.5">
            {AI_TAGS.filter((t) => t.group === 'mode' || t.group === 'flavor').map((t) => (
              <Chip key={t.id} active={tags.has(t.id)} onClick={() => toggle(t.id)}>
                {t.label}
              </Chip>
            ))}
          </div>
        </FieldGroup>

        {pantryItems.length > 0 && (
          <Callout tone="sponsor" icon={<IcFridge size={16} />} title={`${pantryItems.length} ingredientes na despensa`}>
            {expiringCount > 0
              ? `${expiringCount} vencendo em 4 dias. Nonna vai priorizar usá-los.`
              : 'Despensa abastecida. Nonna vai escolher o melhor.'}
          </Callout>
        )}

        {error && (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          full
          onClick={handleGenerate}
          disabled={isLoading}
          icon={<IcSparkle size={14} />}
        >
          Pedir à Nonna
        </Button>
      </div>
    </div>
  );
}
