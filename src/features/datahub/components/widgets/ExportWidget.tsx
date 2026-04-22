import { Download } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';

export interface ExportWidgetProps {
  filteredCount: number;
}

export function ExportWidget({ filteredCount }: ExportWidgetProps) {
  const handleExport = () => {
    toast.info('Export simulé', {
      description: `${filteredCount} ligne(s) auraient été exportées en CSV.`,
    });
  };

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <Download aria-hidden className="size-5 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              Exporter les données filtrées
            </span>
            <span className="text-xs text-muted-foreground">
              {filteredCount} ligne(s) · format CSV
            </span>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={handleExport}>
          <Download />
          Télécharger CSV
        </Button>
      </CardContent>
    </Card>
  );
}

export default ExportWidget;
