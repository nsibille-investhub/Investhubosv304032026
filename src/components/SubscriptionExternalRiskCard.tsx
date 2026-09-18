import { useState } from 'react';
import { Globe, Play, RefreshCw, Users } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { WIDGET_SUBTITLE_CLASS, WIDGET_TITLE_CLASS } from './ui/utils';
import { useTranslation } from '../utils/languageContext';
import type { RiskTone } from '../utils/subscriptionRiskMockData';

const TONE_BADGES: Record<RiskTone, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

const KEY = 'subscriptions.detail.externalRisk';

interface ExternalRiskLine {
  id: 'country' | 'counterparty';
  labelKey: string;
  icon: typeof Globe;
  detailKey: string;
  tone: RiskTone;
  toneLabelKey: string;
}

const LINES: ExternalRiskLine[] = [
  {
    id: 'country',
    labelKey: `${KEY}.country`,
    icon: Globe,
    detailKey: `${KEY}.countryDetail`,
    tone: 'medium',
    toneLabelKey: `${KEY}.levels.medium`,
  },
  {
    id: 'counterparty',
    labelKey: `${KEY}.counterparty`,
    icon: Users,
    detailKey: `${KEY}.counterpartyDetail`,
    tone: 'high',
    toneLabelKey: `${KEY}.levels.high`,
  },
];

/**
 * Analyse de risque externe : panneau distinct du moteur interne, affiche
 * seulement quand le controle externe est active pour le client.
 */
export function SubscriptionExternalRiskCard({ locked }: { locked: boolean }) {
  const { t } = useTranslation();
  const [ranAt, setRanAt] = useState<string | null>('19/05/2026 16:08');
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    if (running) return;
    setRunning(true);
    window.setTimeout(() => {
      const date = new Date();
      const at = `${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
      setRanAt(at);
      setRunning(false);
      toast.success(t(`${KEY}.toast.done`), { description: at });
    }, 900);
  };

  return (
    <Card className="shadow-sm overflow-hidden p-0 gap-0">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className={WIDGET_TITLE_CLASS}>{t(`${KEY}.title`)}</h3>
          <p className={WIDGET_SUBTITLE_CLASS}>
            {ranAt ? t(`${KEY}.lastRun`, { date: ranAt }) : t(`${KEY}.neverRun`)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0 gap-1.5 text-xs"
          disabled={locked || running}
          title={locked ? t(`${KEY}.lockedHint`) : undefined}
          onClick={handleRun}
        >
          {ranAt ? (
            <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          {t(ranAt ? `${KEY}.relaunch` : `${KEY}.launch`)}
        </Button>
      </div>

      <ul className="divide-y">
        {LINES.map(line => {
          const Icon = line.icon;
          return (
            <li key={line.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <span className="flex min-w-0 items-center gap-2">
                <Icon className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{t(line.labelKey)}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {t(line.detailKey)}
                  </span>
                </span>
              </span>
              <Badge className={`${TONE_BADGES[line.tone]} shrink-0 text-xs`}>
                {t(line.toneLabelKey)}
              </Badge>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
