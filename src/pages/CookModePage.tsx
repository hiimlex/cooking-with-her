import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Label, Progress } from '@/components/atoms';
import { FOOD_GLYPHS, IcChevLeft, IcChevRight, IcCheck, IcPause, IcPlay, IcX } from '@/icons';
import { RECIPES } from '@/data/mock';

export function CookModePage() {
  const navigate = useNavigate();
  const { id = 'shakshuka' } = useParams<{ id: string }>();
  const r = RECIPES.find((x) => x.id === id);
  const [step, setStep] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (running && timer > 0) {
      intervalRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    } else if (running && timer === 0) {
      setRunning(false);
    }
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, [timer, running]);

  useEffect(() => {
    if (!r) return;
    setTimer((r.steps[step]?.mins || 0) * 60);
    setRunning(false);
  }, [step, r]);

  if (!r) return null;

  const cur = r.steps[step];
  const isLast = step === r.steps.length - 1;
  const total = cur ? cur.mins * 60 : 1;
  const pct = cur ? (1 - timer / total) * 100 : 0;
  const mm = String(Math.floor(timer / 60)).padStart(2, '0');
  const ss = String(timer % 60).padStart(2, '0');
  const accent = FOOD_GLYPHS[r.sprites[0]].color;

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{ background: `linear-gradient(180deg, ${accent}1c 0%, var(--c-bg, #faf8ff) 280px)` }}
    >
      {/* Top */}
      <div className="pt-[54px] px-[18px] pb-1.5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1 as never)}
          className="w-[38px] h-[38px] rounded-full bg-card text-ink flex items-center justify-center"
        >
          <IcX size={15} />
        </button>
        <div className="flex-1 min-w-0 text-center">
          <div className="text-[11px] text-muted font-semibold uppercase tracking-[0.4px]">Cooking</div>
          <div className="text-sm font-bold text-ink truncate">{r.name}</div>
        </div>
        <div className="w-[38px]" />
      </div>

      {/* Step progress */}
      <div className="px-[18px] pt-3">
        <div className="flex justify-between mb-1.5 items-baseline">
          <span className="text-xs text-muted font-semibold">Step {step + 1} of {r.steps.length}</span>
          <span className="text-xs text-muted">
            ~{r.steps.slice(step).reduce((s, x) => s + x.mins, 0)} min left
          </span>
        </div>
        <div className="flex gap-1">
          {r.steps.map((_, i) => (
            <div
              key={i}
              className={[
                'flex-1 h-[5px] rounded-full',
                i <= step ? 'bg-accent' : 'bg-canvas',
                i === step ? 'opacity-70' : 'opacity-100',
              ].join(' ')}
            />
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto no-scrollbar px-[18px] pt-5 pb-4">
        <h1 className="m-0 text-[26px] font-extrabold text-ink tracking-[-0.6px] leading-[1.1]">
          {cur.t}
        </h1>
        <p className="mt-2.5 mb-5 text-[15px] text-ink leading-[1.55]">{cur.d}</p>

        {/* Timer */}
        <Card className="p-5 text-center">
          <div className="text-xs text-muted font-semibold mb-1.5">Timer · {cur.mins} min</div>
          <div className="text-[64px] font-extrabold text-ink tracking-[-2px] leading-none mb-4 tabular-nums">
            {mm}:{ss}
          </div>
          <Progress value={pct} />
          <div className="flex gap-2 mt-4 justify-center">
            <Button variant="soft" onClick={() => setTimer((t) => t + 60)}>+1 min</Button>
            <Button variant="soft" onClick={() => { setTimer(cur.mins * 60); setRunning(false); }}>Reset</Button>
            <Button
              variant="primary"
              onClick={() => setRunning((rr) => !rr)}
              icon={running ? <IcPause size={12} /> : <IcPlay size={12} />}
            >
              {running ? 'Pause' : 'Start'}
            </Button>
          </div>
        </Card>

        {!isLast && (
          <Card soft className="p-3 mt-3 flex items-center gap-2.5">
            <Label color="purple">Up next</Label>
            <span className="text-[13px] text-ink font-semibold flex-1">{r.steps[step + 1].t}</span>
            <span className="text-xs text-muted">{r.steps[step + 1].mins}m</span>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="px-[18px] pt-3 pb-7 bg-bg flex gap-2">
        <Button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          icon={<IcChevLeft size={14} />}
        >Back</Button>
        <div className="flex-1" />
        <Button
          variant="primary"
          onClick={() => (isLast ? navigate(`/cook/${id}/complete`) : setStep((s) => s + 1))}
          icon={isLast ? <IcCheck size={14} /> : undefined}
        >
          {isLast ? 'Finish' : 'Next step'}
          {!isLast && <IcChevRight size={14} />}
        </Button>
      </div>
    </div>
  );
}
