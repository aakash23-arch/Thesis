'use client';

import * as React from 'react';
import { FileText, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ThesisGauge } from '@/components/thesis/thesis-gauge';
import { AssumptionsChecklist } from '@/components/thesis/assumptions-checklist';
import { ThesisBuilder } from '@/components/thesis/thesis-builder';
import type { MetricKey } from '@/lib/metrics';
import type { ThesisView } from '@/lib/thesis';

const CONVICTION_LABEL: Record<string, string> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' };

/** "Filed 3 months ago" -- how long this argument has stood without revision. */
function age(from: Date, now: Date): string {
  const days = Math.floor((now.getTime() - from.getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export interface ThesisPanelProps {
  positionId: string;
  ticker: string;
  sector: string | null;
  currentMetrics: Partial<Record<MetricKey, number>>;
  canGenerate: boolean;
  thesis: ThesisView | null;
  /** Passed from the server so render stays pure. */
  now: string;
}

export function ThesisPanel({
  positionId,
  ticker,
  sector,
  currentMetrics,
  canGenerate,
  thesis,
  now,
}: ThesisPanelProps) {
  const [editing, setEditing] = React.useState(false);

  if (editing || !thesis) {
    return (
      <Card>
        {thesis ? (
          <ThesisBuilder
            positionId={positionId}
            ticker={ticker}
            sector={sector}
            currentMetrics={currentMetrics}
            canGenerate={canGenerate}
            onDone={() => setEditing(false)}
          />
        ) : (
          <ThesisBuilder
            positionId={positionId}
            ticker={ticker}
            sector={sector}
            currentMetrics={currentMetrics}
            canGenerate={canGenerate}
          />
        )}
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-start gap-8">
          {/* The signature instrument, finally showing something earned. */}
          {thesis.healthScore === null ? (
            <div className="flex flex-col gap-2">
              <ThesisGauge score={0} label="Not checked" showScoreLabel={false} />
              <p className="max-w-[10rem] text-caption normal-case tracking-normal text-ink-tertiary">
                No assumption could be checked yet.
              </p>
            </div>
          ) : (
            <ThesisGauge
              score={thesis.healthScore}
              previousScore={thesis.previousHealthScore ?? undefined}
              label="Thesis health"
            />
          )}

          <div className="min-w-0 flex-1">
            {/* Thesis text in the display face -- this is the argument itself. */}
            <p className="font-serif text-section-head leading-relaxed text-ink-primary">
              {thesis.thesisText}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Badge variant="outline">
                {CONVICTION_LABEL[thesis.convictionLevel] ?? thesis.convictionLevel} conviction
              </Badge>
              <Badge variant="outline">{thesis.timeHorizonMonths}-month horizon</Badge>
              <span className="text-caption normal-case tracking-normal text-ink-tertiary">
                Filed {age(thesis.createdAt, new Date(now))}
              </span>
            </div>
          </div>

          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" aria-hidden />
            Edit thesis
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assumptions</CardTitle>
          <CardDescription>
            The claims this thesis rests on, checked against the company&apos;s reported numbers.
          </CardDescription>
        </CardHeader>
        {thesis.assumptions.length === 0 ? (
          <EmptyState
            variant="inline"
            icon={FileText}
            title="No assumptions"
            description="Edit the thesis to add something checkable."
          />
        ) : (
          <AssumptionsChecklist assumptions={thesis.assumptions} />
        )}
      </Card>
    </div>
  );
}
