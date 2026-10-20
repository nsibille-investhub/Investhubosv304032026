import type { ReactNode } from 'react';
import { FlaskConical } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { toneSurface } from './tone';

interface DemoScenarioBarProps<V extends string> {
  label: string;
  value: V;
  options: { value: V; label: string }[];
  onChange: (value: V) => void;
  /** Action de démonstration à droite du sélecteur. */
  action?: ReactNode;
}

/** Bandeau de la maquette : choix d'un scénario de démonstration, au-dessus de l'en-tête de page. */
export function DemoScenarioBar<V extends string>({ label, value, options, onChange, action }: DemoScenarioBarProps<V>) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-b border-border px-6 py-2" style={toneSurface('info')}>
      <span className="inline-flex items-center gap-2 text-xs font-medium">
        <FlaskConical className="w-3.5 h-3.5" aria-hidden />
        {label}
      </span>
      <Select value={value} onValueChange={next => onChange(next as V)}>
        <SelectTrigger size="sm" className="w-72 border-border bg-card" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {action}
    </div>
  );
}
