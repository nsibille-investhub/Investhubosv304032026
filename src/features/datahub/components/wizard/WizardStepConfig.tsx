import type { IngestionMode } from '../../types';
import { ConfigApiPull } from './config/ConfigApiPull';
import { ConfigApiPush } from './config/ConfigApiPush';
import { ConfigFile } from './config/ConfigFile';
import { ConfigManual } from './config/ConfigManual';
import { ConfigMcp } from './config/ConfigMcp';

export interface WizardStepConfigProps {
  mode: IngestionMode | undefined;
  modeConfig: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}

export function WizardStepConfig({
  mode,
  modeConfig,
  onChange,
}: WizardStepConfigProps) {
  if (!mode) {
    return (
      <p className="text-sm text-muted-foreground">
        Sélectionnez un mode à l'étape précédente pour configurer la source.
      </p>
    );
  }

  switch (mode) {
    case 'manual':
      return <ConfigManual />;
    case 'file':
      return <ConfigFile value={modeConfig as never} onChange={onChange} />;
    case 'api-pull':
      return <ConfigApiPull value={modeConfig as never} onChange={onChange} />;
    case 'api-push':
      return <ConfigApiPush value={modeConfig as never} onChange={onChange} />;
    case 'mcp':
      return <ConfigMcp value={modeConfig as never} onChange={onChange} />;
    default:
      return null;
  }
}

export default WizardStepConfig;
