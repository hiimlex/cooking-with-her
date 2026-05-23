// src/pages/AIGeneratePage.tsx
import { useState } from 'react';
import { Button, Chip } from '@/components/atoms';
import { Callout, FieldGroup, Segmented, SubHeader } from '@/components/molecules';
import { TextArea } from '@/components/atoms/Input';
import { IcFridge, IcSparkle } from '@/icons';
import { AI_TAGS } from '@/data/mock';

export interface AIGeneratePageProps {
  onBack?: () => void;
  onGenerate?: () => void;
}

export function AIGeneratePage({ onBack, onGenerate }: AIGeneratePageProps) {
  const [tags, setTags] = useState<Set<string>>(new Set(['usepantry', 'quick']));
  const [time, setTime] = useState<number>(30);
  const [prompt, setPrompt] = useState('');

  const toggle = (id: string) => {
    const n = new Set(tags);
    if (n.has(id)) n.delete(id); else n.add(id);
    setTags(n);
  };

  return (
    <div className="pb-[110px] bg-bg min-h-full">
      <SubHeader
        onBack={onBack}
        title="Ask Nonna ✨"
        sub="She knows your pantry, your utensils, and how lazy we're feeling."
      />

      <div className="px-[18px] pt-2 pb-5 flex flex-col gap-5">
        <FieldGroup label="What are you in the mood for?">
          <TextArea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="something quick with the salmon, not too spicy…"
            rows={3}
            className="min-h-[80px]"
          />
        </FieldGroup>

        <FieldGroup label="How much time do we have?">
          <Segmented<number>
            full
            value={time}
            onChange={setTime}
            options={[
              { value: 15, label: '15 min' },
              { value: 30, label: '30 min' },
              { value: 45, label: '45 min' },
              { value: 60, label: '1 hr+' },
            ]}
          />
        </FieldGroup>

        <FieldGroup label="The vibe" sub="Pick what fits — any number">
          <div className="flex flex-wrap gap-1.5">
            {AI_TAGS.filter((t) => t.group === 'mood').map((t) => (
              <Chip key={t.id} active={tags.has(t.id)} onClick={() => toggle(t.id)}>{t.label}</Chip>
            ))}
          </div>
        </FieldGroup>

        <FieldGroup label="Constraints">
          <div className="flex flex-wrap gap-1.5">
            {AI_TAGS.filter((t) => t.group === 'mode' || t.group === 'flavor').map((t) => (
              <Chip key={t.id} active={tags.has(t.id)} onClick={() => toggle(t.id)}>{t.label}</Chip>
            ))}
          </div>
        </FieldGroup>

        <Callout tone="sponsor" icon={<IcFridge size={16} />} title="14 ingredients in your pantry">
          3 are expiring within 4 days. Nonna will prioritize using them.
        </Callout>

        <Button variant="primary" size="lg" full onClick={onGenerate} icon={<IcSparkle size={14} />}>
          Conjure 3 ideas
        </Button>
      </div>
    </div>
  );
}
