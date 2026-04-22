import { useMemo, useState, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import type { PerfRow } from '../../seed/demoScenario';

const PAGE_SIZE = 10;

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const eurCompact = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const draftRowStyle: CSSProperties = {
  borderLeftWidth: 3,
  borderLeftStyle: 'solid',
  borderLeftColor: 'var(--datahub-status-draft-border)',
};

export interface HistoryTableWidgetProps {
  rows: ReadonlyArray<PerfRow>;
  includeDrafts?: boolean;
}

export function HistoryTableWidget({
  rows,
  includeDrafts = false,
}: HistoryTableWidgetProps) {
  const [page, setPage] = useState(0);

  const sorted = useMemo(
    () => [...rows].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd)),
    [rows],
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const slice = sorted.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="border-b border-border bg-muted/30 px-5 py-3">
        <CardTitle className="text-base">Historique</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Fonds</TableHead>
                <TableHead className="text-right">NAV</TableHead>
                <TableHead className="text-right">Appelé</TableHead>
                <TableHead className="text-right">Distribué</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Aucune ligne à afficher.
                  </TableCell>
                </TableRow>
              ) : (
                slice.map((row) => {
                  const isDraft =
                    includeDrafts && row.status !== 'published';
                  return (
                    <TableRow
                      key={row.id}
                      style={isDraft ? draftRowStyle : undefined}
                    >
                      <TableCell>{dateFmt.format(new Date(row.periodEnd))}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        {row.fundLabel}
                        {isDraft && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-medium"
                            style={{
                              backgroundColor: 'var(--datahub-status-draft-bg)',
                              color: 'var(--datahub-status-draft-fg)',
                              borderColor: 'var(--datahub-status-draft-border)',
                            }}
                          >
                            Brouillon
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {eurCompact.format(row.nav)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {eurCompact.format(row.called)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {eurCompact.format(row.distributed)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {sorted.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-2 text-xs text-muted-foreground">
            <span>
              {currentPage * PAGE_SIZE + 1}–
              {Math.min((currentPage + 1) * PAGE_SIZE, sorted.length)} sur{' '}
              {sorted.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                aria-label="Page précédente"
              >
                <ChevronLeft />
              </Button>
              <span className="px-2">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                aria-label="Page suivante"
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HistoryTableWidget;
