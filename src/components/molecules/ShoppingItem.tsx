// src/components/molecules/ShoppingItem.tsx
import { Avatar, Card, Label } from '@/components/atoms';
import { IcCheck, IcSparkle, IcX } from '@/icons';
import type { ShoppingEntry } from '@/types';

export interface ShoppingItemProps {
  item: ShoppingEntry;
  onToggle?: () => void;
  onRemove?: () => void;
}

export function ShoppingItem({ item, onToggle, onRemove }: ShoppingItemProps) {
  return (
    <Card
      onClick={onToggle}
      className={[
        'px-3.5 py-3 flex items-center gap-3',
        item.done ? 'opacity-55' : 'opacity-100',
      ].join(' ')}
    >
      <div className={[
        'w-6 h-6 rounded-[8px] flex items-center justify-center flex-shrink-0 text-white transition-colors',
        item.done ? 'bg-accent' : 'bg-canvas',
      ].join(' ')}>
        {item.done && <IcCheck size={14} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={[
          'text-sm font-semibold',
          item.done ? 'text-muted line-through' : 'text-ink',
        ].join(' ')}>{item.name}</div>
        {(item.qty || item.cat) && (
          <div className="text-[11px] text-muted mt-0.5">
            {item.qty}{item.qty && item.cat && ' · '}{item.cat}
          </div>
        )}
      </div>
      {item.by === 'ai'
        ? <Label color="purple"><IcSparkle size={9} /> AI</Label>
        : item.by !== 'other'
          ? <Avatar who={item.by} size={20} />
          : null}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-subtle hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
        >
          <IcX size={12} />
        </button>
      )}
    </Card>
  );
}
