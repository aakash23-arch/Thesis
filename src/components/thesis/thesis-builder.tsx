'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, Plus, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { SliderField } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldHint, FieldLabel } from '@/components/ui/field';
import { toast } from '@/components/ui/toast';
import {
  formatMetric,
  getMetric,
  METRIC_KEYS,
  METRICS,
  OPERATORS,
  type MetricKey,
  type Operator,
} from '@/lib/metrics';
import { TEMPLATES, resolveTemplate, type TemplateId } from '@/lib/thesis/templates';
import { draftThesis, submitThesis } from '@/app/(dashboard)/positions/[id]/actions';

interface DraftAssumption {
  metricKey: MetricKey;
  operator: Operator;
  thresholdValue: number;
}

export interface ThesisBuilderProps {
  positionId: string;
  ticker: string;
  sector: string | null;
  /** Latest known metric values, for showing "currently X" beside each slider. */
  currentMetrics: Partial<Record<MetricKey, number>>;
  /** False when no model key is configured; Tier 0 then explains itself. */
  canGenerate: boolean;
  onDone?: () => void;
}

const HORIZONS = [6, 12, 18, 24, 36];

type Mode = 'pick' | 'template' | 'manual';

export function ThesisBuilder({
  positionId,
  ticker,
  sector,
  currentMetrics,
  canGenerate,
  onDone,
}: ThesisBuilderProps) {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>('pick');
  const [templateId, setTemplateId] = React.useState<TemplateId | null>(null);
  const [statement, setStatement] = React.useState('');
  const [assumptions, setAssumptions] = React.useState<DraftAssumption[]>([]);
  const [conviction, setConviction] = React.useState('MEDIUM');
  const [horizon, setHorizon] = React.useState('12');
  const [error, setError] = React.useState<string | null>(null);
  const [generated, setGenerated] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const chooseTemplate = (id: TemplateId) => {
    const template = TEMPLATES.find((t) => t.id === id)!;
    setTemplateId(id);
    setStatement(template.statement);
    setAssumptions(
      resolveTemplate(id, sector).map((a) => ({
        metricKey: a.metricKey,
        operator: a.operator,
        thresholdValue: a.defaultThreshold,
      })),
    );
    setMode('template');
    setGenerated(false);
    setError(null);
  };

  const [drafting, setDrafting] = React.useState(false);

  /** Tier 0: ask the model for a starting point, then drop into the editor. */
  const generate = () => {
    setDrafting(true);
    setError(null);
    void (async () => {
      const result = await draftThesis(positionId);
      setDrafting(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setTemplateId(null);
      setStatement(result.draft.thesisText);
      setAssumptions(
        result.draft.assumptions.map((a) => ({
          metricKey: a.metricKey,
          operator: a.operator,
          thresholdValue: a.thresholdValue,
        })),
      );
      setGenerated(true);
      setMode('manual');
    })();
  };

  const startManual = () => {
    setTemplateId(null);
    setStatement('');
    setAssumptions([{ metricKey: 'revenue_growth_yoy', operator: '>', thresholdValue: 10 }]);
    setMode('manual');
    setGenerated(false);
    setError(null);
  };

  const save = () => {
    if (statement.trim() === '') {
      setError('Write what you believe about this company.');
      return;
    }
    if (assumptions.length === 0) {
      setError('A thesis needs at least one assumption to be checkable.');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await submitThesis(positionId, {
        tier: generated ? 'TIER_0' : mode === 'template' ? 'TIER_1' : 'TIER_2',
        thesisText: statement,
        thesisTemplateId: templateId,
        convictionLevel: conviction as 'LOW' | 'MEDIUM' | 'HIGH',
        timeHorizonMonths: Number(horizon),
        assumptions,
      });

      if (result.ok) {
        toast.success(`Thesis filed for ${ticker}`);
        onDone?.();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  if (mode === 'pick') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="font-sans text-section-head font-semibold text-ink-primary">
            Why do you hold {ticker}?
          </h2>
          <p className="mt-1 text-body text-ink-secondary">
            Start from a common argument, or write your own. Either way it becomes a set of claims
            Thesis can check against the company&apos;s actual numbers.
          </p>
        </div>

        {/* Tier 0: the fastest way past a blank page. */}
        <Card className="flex flex-wrap items-center justify-between gap-4 border-accent bg-accent-light">
          <div className="min-w-0">
            <p className="text-body font-medium text-ink-primary">Draft one for me</p>
            <p className="mt-1 text-caption normal-case tracking-normal text-ink-secondary">
              {canGenerate
                ? `Reads ${ticker}'s reported numbers and drafts the case investors typically make. You edit it before it is filed.`
                : 'Needs GOOGLE_GENERATIVE_AI_API_KEY in .env — free, no card, from aistudio.google.com.'}
            </p>
          </div>
          <Button variant="secondary" onClick={generate} loading={drafting} disabled={!canGenerate}>
            {!drafting && <Sparkles className="h-4 w-4" aria-hidden />}
            Draft a thesis
          </Button>
        </Card>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-card border border-signal-broken bg-signal-broken-light p-3"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal-broken-ink" aria-hidden />
            <p className="text-caption normal-case tracking-normal text-signal-broken-ink">
              {error}
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {TEMPLATES.map((template) => (
            <Card
              key={template.id}
              interactive
              role="button"
              tabIndex={0}
              onClick={() => chooseTemplate(template.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  chooseTemplate(template.id);
                }
              }}
              className="flex flex-col gap-2"
            >
              <span className="text-body font-medium text-ink-primary">{template.name}</span>
              {/* The logic, before the choice. */}
              <span className="text-caption normal-case tracking-normal text-ink-secondary">
                {template.rationale}
              </span>
            </Card>
          ))}
        </div>

        <div>
          <Button variant="secondary" onClick={startManual}>
            Write my own
          </Button>
        </div>
      </div>
    );
  }

  const updateAssumption = (index: number, patch: Partial<DraftAssumption>) =>
    setAssumptions((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-sans text-section-head font-semibold text-ink-primary">
            {mode === 'template'
              ? TEMPLATES.find((t) => t.id === templateId)?.name
              : 'Your own thesis'}
          </h2>
          <p className="mt-1 text-body text-ink-secondary">
            Adjust it until it says what you actually believe.
          </p>
        </div>
        <Button variant="ghost" onClick={() => setMode('pick')} disabled={pending}>
          Start over
        </Button>
      </div>

      {generated && (
        // Required framing: this is a draft to react to, not advice.
        <p className="rounded-card border border-border bg-recessed p-3 text-caption normal-case tracking-normal text-ink-secondary">
          Auto-generated starting point — not personalised advice. Read it, change what you disagree
          with, and only file it once it says what you actually think.
        </p>
      )}

      <Field>
        <FieldLabel required>What you believe</FieldLabel>
        <Textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          maxLength={500}
          showCount
          placeholder="Investors who hold this stock typically believe..."
        />
        <FieldHint>
          Two or three sentences. State what has to stay true for this to remain a good holding.
        </FieldHint>
      </Field>

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="font-sans text-body font-medium text-ink-primary">Assumptions</h3>
          <p className="text-caption normal-case tracking-normal text-ink-secondary">
            The measurable claims behind it. These are what get checked
            {sector
              ? `; defaults are tuned for ${sector} and are starting points, not research`
              : ''}
            .
          </p>
        </div>

        {assumptions.map((assumption, index) => {
          const metric = getMetric(assumption.metricKey);
          const current = currentMetrics[assumption.metricKey];

          return (
            <Card key={index} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[12rem] flex-1">
                  <Field>
                    <FieldLabel>Metric</FieldLabel>
                    <Select
                      value={assumption.metricKey}
                      onValueChange={(v) =>
                        updateAssumption(index, {
                          metricKey: v as MetricKey,
                          thresholdValue: METRICS[v as MetricKey].min,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {METRIC_KEYS.map((key) => (
                          <SelectItem key={key} value={key}>
                            {METRICS[key].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="w-40">
                  <Field>
                    <FieldLabel>Condition</FieldLabel>
                    <Select
                      value={assumption.operator}
                      onValueChange={(v) => updateAssumption(index, { operator: v as Operator })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {OPERATORS.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                {assumptions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove assumption ${index + 1}`}
                    onClick={() => setAssumptions((p) => p.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </Button>
                )}
              </div>

              {/* Slider, not a text box -- the spec is explicit, and a slider
                  makes the plausible range visible. */}
              <SliderField
                label="Threshold"
                value={assumption.thresholdValue}
                onValueChange={(v) => updateAssumption(index, { thresholdValue: v })}
                min={metric.min}
                max={metric.max}
                step={metric.step}
                unit={metric.unit === 'percent' ? '%' : ''}
                showBounds
                hint={
                  current === undefined
                    ? `${metric.description} Not reported for ${ticker}, so this one cannot be checked yet.`
                    : `${metric.description} Currently ${formatMetric(assumption.metricKey, current)}.`
                }
              />
            </Card>
          );
        })}

        <div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setAssumptions((p) => [
                ...p,
                { metricKey: 'trailing_pe', operator: '<', thresholdValue: 25 },
              ])
            }
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add assumption
          </Button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel>Conviction</FieldLabel>
          <Select value={conviction} onValueChange={setConviction}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>Time horizon</FieldLabel>
          <Select value={horizon} onValueChange={setHorizon}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HORIZONS.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m} months
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-card border border-signal-broken bg-signal-broken-light p-3"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-signal-broken-ink" aria-hidden />
          <p className="text-caption normal-case tracking-normal text-signal-broken-ink">{error}</p>
        </div>
      )}

      <div className={cn('flex items-center justify-end gap-3')}>
        {onDone && (
          <Button variant="ghost" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
        )}
        <Button onClick={save} loading={pending}>
          <Check className="h-4 w-4" aria-hidden />
          File this thesis
        </Button>
      </div>
    </div>
  );
}
