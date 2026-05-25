import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/atoms';
import { SubHeader } from '@/components/molecules';
import { IcCheck, IcSun, IcMoon } from '@/icons';
import { useTheme, ACCENT_PRESETS } from '@/hooks/useTheme';

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, accent, changeTheme, changeAccent } = useTheme();

  return (
    <div className="pb-[100px] bg-bg min-h-full">
      <SubHeader
        onBack={() => navigate(-1 as never)}
        title="Configurações"
        sub="Personalize o seu app"
      />

      <div className="px-[18px] pt-2 flex flex-col gap-5">
        {/* Theme */}
        <div>
          <div className="text-[11px] font-bold text-muted uppercase tracking-[0.5px] mb-2.5 px-1">
            Tema
          </div>
          <Card className="p-1 flex gap-1">
            {([
              { value: 'light' as const, label: 'Claro',  Icon: IcSun  },
              { value: 'dark'  as const, label: 'Escuro', Icon: IcMoon },
            ]).map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => changeTheme(value)}
                className={[
                  'flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2',
                  theme === value
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted',
                ].join(' ')}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </Card>
        </div>

        {/* Accent color */}
        <div>
          <div className="text-[11px] font-bold text-muted uppercase tracking-[0.5px] mb-2.5 px-1">
            Cor principal
          </div>
          <Card className="p-4">
            <div className="flex gap-3 flex-wrap">
              {ACCENT_PRESETS.map((p) => {
                const selected = accent === p.value;
                return (
                  <button
                    key={p.value}
                    onClick={() => changeAccent(p)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={[
                        'w-11 h-11 rounded-2xl transition-all flex items-center justify-center',
                        selected ? 'scale-110 shadow-lg' : 'opacity-70',
                      ].join(' ')}
                      style={{ background: p.value }}
                    >
                      {selected && <IcCheck size={16} className="text-white" />}
                    </div>
                    <span className={[
                      'text-[10px] font-semibold',
                      selected ? 'text-ink' : 'text-muted',
                    ].join(' ')}>
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <div className="text-[11px] font-bold text-muted uppercase tracking-[0.5px] mb-2.5 px-1">
            Pré-visualização
          </div>
          <Card className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold"
                style={{ background: accent }}
              >
                A
              </div>
              <div>
                <div className="text-sm font-bold text-ink">Alex &amp; Yuka</div>
                <div className="text-xs text-muted">Cooking With Her</div>
              </div>
            </div>
            <div className="flex gap-2">
              <div
                className="flex-1 py-2 rounded-xl text-center text-xs font-bold text-white"
                style={{ background: accent }}
              >
                Primário
              </div>
              <div className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-canvas text-ink">
                Fundo
              </div>
              <div className="flex-1 py-2 rounded-xl text-center text-xs font-bold bg-card text-muted border border-canvas">
                Cartão
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
