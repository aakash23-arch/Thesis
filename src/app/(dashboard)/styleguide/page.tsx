'use client';

import { useState } from 'react';
import { AlertTriangle, FileQuestion, Info, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldError, FieldHint, FieldLabel, useField } from '@/components/ui/field';
import { Slider, SliderField } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  type SortDirection,
} from '@/components/ui/table';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { StatTile } from '@/components/ui/stat-tile';
import { Avatar, AvatarFallback, initialsOf } from '@/components/ui/avatar';
import { SimpleTooltip } from '@/components/ui/tooltip';
import { Disclaimer } from '@/components/ui/disclaimer';
import { ThesisGauge } from '@/components/thesis/thesis-gauge';
import { formatINR, formatSignedPercent } from '@/lib/format';
import { contrastRatio } from '@/lib/contrast';

const SAMPLE_POSITIONS = [
  { ticker: 'INFY', sector: 'IT Services', qty: 40, avgPrice: 1512.5, ltp: 1584.2, health: 84 },
  { ticker: 'HDFCBANK', sector: 'Banking', qty: 25, avgPrice: 1620.0, ltp: 1598.75, health: 61 },
  { ticker: 'TATAMOTORS', sector: 'Auto', qty: 60, avgPrice: 812.3, ltp: 742.1, health: 38 },
];

/**
 * Pairs the design system actually ships. Every one must clear 4.5:1 -- the
 * strip below computes it live rather than trusting a comment.
 */
const CONTRAST_PAIRS: { name: string; fg: string; bg: string }[] = [
  { name: 'ink-primary on surface', fg: '#0F1419', bg: '#FFFFFF' },
  { name: 'ink-secondary on surface', fg: '#5C6670', bg: '#FFFFFF' },
  { name: 'accent on surface', fg: '#1A6B4A', bg: '#FFFFFF' },
  { name: 'healthy-ink on healthy-light', fg: '#1A6B4A', bg: '#E8F5EE' },
  { name: 'caution-ink on caution-light', fg: '#8A6318', bg: '#FAF2E1' },
  { name: 'broken-ink on broken-light', fg: '#B83A2E', bg: '#FBEBE9' },
  { name: 'neutral-ink on neutral-light', fg: '#2F6099', bg: '#EAF1F9' },
  { name: 'white/70 on sidebar', fg: '#B3B5B7', bg: '#0F1419' },
];

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-sans text-section-head font-semibold text-ink-primary">{title}</h2>
      {note && <p className="mb-4 mt-1 text-body text-ink-secondary">{note}</p>}
      <div className={note ? '' : 'mt-4'}>{children}</div>
    </section>
  );
}

/**
 * Controls read their id / aria-describedby / error flag from the surrounding
 * Field via useField(). Because that is a hook, the control lives in its own
 * component -- which is also how react-hook-form inputs will be structured.
 */
function DemoPriceInput() {
  return <Input {...useField()} numeric prefix="₹" placeholder="0.00" />;
}

function DemoAllocationInput() {
  return <Input {...useField()} numeric suffix="%" defaultValue="140" />;
}

function DemoThesisTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const { id, 'aria-describedby': describedBy } = useField();
  return (
    <Textarea
      id={id}
      aria-describedby={describedBy}
      maxLength={500}
      showCount
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Investors who hold this stock typically believe..."
    />
  );
}

export default function StyleguidePage() {
  const [sliderValue, setSliderValue] = useState([65]);
  const [threshold, setThreshold] = useState(12);
  const [sort, setSort] = useState<SortDirection>('desc');
  const [thesisText, setThesisText] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        eyebrow="Internal"
        title="Design System"
        description="Visual QA surface. Every primitive on one page, checked against the token spec."
      />

      <Section
        title="Thesis Gauge"
        note="The signature instrument. Vertical is the default; horizontal is the mobile variant. The etched tick marks the previous reading."
      >
        <Card>
          <CardContent className="flex flex-wrap items-end gap-12">
            <ThesisGauge score={84} previousScore={76} label="Healthy" />
            <ThesisGauge score={61} previousScore={70} label="Caution" />
            <ThesisGauge score={32} previousScore={45} label="Broken" />
            <div className="flex items-center gap-6">
              <span className="text-caption uppercase tracking-[0.04em] text-ink-secondary">
                Mini
              </span>
              <ThesisGauge score={84} size="mini" previousScore={76} />
              <ThesisGauge score={61} size="mini" previousScore={70} />
              <ThesisGauge score={32} size="mini" previousScore={45} />
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-caption uppercase tracking-[0.04em] text-ink-secondary">
                Horizontal
              </span>
              <ThesisGauge
                score={84}
                previousScore={76}
                orientation="horizontal"
                showScoreLabel={false}
              />
              <ThesisGauge
                score={61}
                previousScore={70}
                orientation="horizontal"
                showScoreLabel={false}
              />
              <ThesisGauge
                score={32}
                previousScore={45}
                orientation="horizontal"
                showScoreLabel={false}
              />
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Contrast audit"
        note="Computed at render. Anything under 4.5:1 fails WCAG AA for body and caption text."
      >
        <Card padded={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pair</TableHead>
                <TableHead>Sample</TableHead>
                <TableHead numeric>Ratio</TableHead>
                <TableHead>AA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CONTRAST_PAIRS.map((pair) => {
                const ratio = contrastRatio(pair.fg, pair.bg);
                const passes = ratio >= 4.5;
                return (
                  <TableRow key={pair.name}>
                    <TableCell className="font-mono text-data-small">{pair.name}</TableCell>
                    <TableCell>
                      <span
                        className="rounded px-2 py-1 text-caption font-medium uppercase tracking-[0.04em]"
                        style={{ color: pair.fg, backgroundColor: pair.bg }}
                      >
                        Thesis 18,42,600
                      </span>
                    </TableCell>
                    <TableCell numeric>{ratio.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={passes ? 'healthy' : 'broken'} dot>
                        {passes ? 'Pass' : 'Fail'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </Section>

      <Section
        title="Typography"
        note="Page titles and hero figures use the display serif. Everything else is Inter; figures are IBM Plex Mono."
      >
        <Card>
          <CardContent className="flex flex-col gap-4">
            <p className="font-serif text-hero leading-none text-ink-primary">84</p>
            <p className="font-serif text-page-title text-ink-primary">
              Page title, Instrument Serif
            </p>
            <p className="font-sans text-section-head font-semibold text-ink-primary">
              Section head, Inter 600
            </p>
            <p className="text-body text-ink-primary">
              Body copy, Inter 400 at 15px. The product reads like a document, not a dashboard.
            </p>
            <p className="text-caption uppercase tracking-[0.04em] text-ink-secondary">
              Caption / label, Inter 500 uppercase
            </p>
            <p className="font-mono text-data-figure tabular-nums text-ink-primary">
              {formatINR(1842600)}
            </p>
            <p className="font-mono text-data-small tabular-nums text-ink-secondary">
              {formatINR(1584.2, { decimals: true })} &middot; {formatSignedPercent(4.74)}
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section title="Stat tiles">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Portfolio value"
            value={formatINR(1842600)}
            delta={{ value: formatSignedPercent(1.8), direction: 'up' }}
            hint="As of close today"
          />
          <StatTile
            label="Day change"
            value={formatINR(-12400)}
            delta={{ value: formatSignedPercent(-0.67), direction: 'down' }}
          />
          <StatTile
            label="Annual fees"
            value={formatINR(21500)}
            delta={{ value: formatSignedPercent(3.1), direction: 'up', intent: 'negative' }}
            hint="Up is bad -- intent overrides direction"
          />
          <StatTile label="Overlap score" value="—" loading />
        </div>
      </Section>

      <Section title="Buttons">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
            <Button
              variant="primary"
              loading={loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 1600);
              }}
            >
              {loading ? 'Generating' : 'Click to load'}
            </Button>
            <Button size="sm" variant="secondary">
              Small
            </Button>
            <Button size="xs" variant="secondary">
              Extra small
            </Button>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Cards"
        note="1px border, 8px radius, 24px padding, no elevation. The interactive variant firms the border instead of lifting."
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Thesis Rigor</CardTitle>
              <CardDescription>Cohort-relative, Track A</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <span className="font-mono text-data-figure tabular-nums text-ink-primary">72</span>
              <Progress value={72} tone="accent" label="Thesis rigor" />
            </CardContent>
          </Card>
          <Card interactive tabIndex={0} role="button">
            <CardHeader>
              <CardTitle>Interactive card</CardTitle>
              <CardDescription>Hover or focus me</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="font-mono text-data-figure tabular-nums text-ink-primary">
                {formatINR(1842600)}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Loading</CardTitle>
              <CardDescription>Skeleton shapes</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton variant="figure" />
              <SkeletonText lines={2} />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Badges" note="Tint plus darkened ink. Colour appears only to carry a signal.">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Badge variant="healthy" dot>
              Healthy
            </Badge>
            <Badge variant="caution" dot>
              Caution
            </Badge>
            <Badge variant="broken" dot>
              Broken
            </Badge>
            <Badge variant="neutral" dot>
              Neutral
            </Badge>
            <Badge variant="default">Default</Badge>
            <Badge variant="outline">Outline</Badge>
          </CardContent>
        </Card>
      </Section>

      <Section title="Forms">
        <Card>
          <CardContent className="grid max-w-lg gap-6">
            <Field>
              <FieldLabel required>Average buy price</FieldLabel>
              <DemoPriceInput />
              <FieldHint>Per share, excluding brokerage.</FieldHint>
            </Field>

            <Field>
              <FieldLabel>Target allocation</FieldLabel>
              <DemoAllocationInput />
              <FieldError>Allocation cannot exceed 100%.</FieldError>
            </Field>

            <Field>
              <FieldLabel>Thesis statement</FieldLabel>
              <DemoThesisTextarea value={thesisText} onChange={setThesisText} />
              <FieldHint>Two or three sentences. State what has to stay true.</FieldHint>
            </Field>

            <Field>
              <FieldLabel>Thesis template</FieldLabel>
              <Select defaultValue="growth">
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Directional</SelectLabel>
                    <SelectItem value="growth">Growth case</SelectItem>
                    <SelectItem value="momentum">Momentum</SelectItem>
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Mean reversion</SelectLabel>
                    <SelectItem value="value">Value case</SelectItem>
                    <SelectItem value="turnaround">Turnaround</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <SliderField
              label="Revenue growth threshold"
              value={threshold}
              onValueChange={setThreshold}
              min={0}
              max={40}
              unit="%"
              showBounds
              hint="The assumption breaks below this."
            />

            <div className="flex items-center gap-4">
              <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
              <span className="w-10 text-right font-mono text-data-small tabular-nums text-ink-primary">
                {sliderValue[0]}
              </span>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Table"
        note="48px rows, alternating surfaces, thin bottom borders, monospace numerics."
      >
        <Card padded={false}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  sortable
                  sortDirection={sort}
                  onSort={() => setSort(sort === 'asc' ? 'desc' : 'asc')}
                >
                  Ticker
                </TableHead>
                <TableHead>Sector</TableHead>
                <TableHead numeric>Qty</TableHead>
                <TableHead numeric>Avg Price</TableHead>
                <TableHead numeric>LTP</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_POSITIONS.map((p) => (
                <TableRow key={p.ticker} interactive tabIndex={0}>
                  <TableCell className="font-medium">{p.ticker}</TableCell>
                  <TableCell>{p.sector}</TableCell>
                  <TableCell numeric>{p.qty}</TableCell>
                  <TableCell numeric>{p.avgPrice.toFixed(2)}</TableCell>
                  <TableCell numeric>{p.ltp.toFixed(2)}</TableCell>
                  <TableCell>
                    <ThesisGauge score={p.health} size="mini" orientation="horizontal" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Section>

      <Section title="Empty states" note="Invitations to act, not sad faces.">
        <div className="flex flex-col gap-6">
          <EmptyState
            icon={Wallet}
            title="No positions yet"
            description="Add your first stock to see what your thesis health looks like."
            action={<Button variant="secondary">Add a position</Button>}
          />
          <Card padded={false}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead numeric>Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableEmpty colSpan={3}>
                  <EmptyState
                    variant="inline"
                    icon={FileQuestion}
                    title="No matches"
                    description="Nothing in this portfolio matches that filter."
                  />
                </TableEmpty>
              </TableBody>
            </Table>
          </Card>
        </div>
      </Section>

      <Section title="Overlays &amp; feedback">
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Modal>
              <ModalTrigger asChild>
                <Button variant="secondary">Open modal</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalTitle>Suggest exit rules</ModalTitle>
                <ModalDescription>
                  Generate 3-4 exit rules based on this position&apos;s thesis.
                </ModalDescription>
                <ModalBody>
                  <p className="mt-4 text-body text-ink-secondary">
                    Rules are saved with the exact wording you approve, so any future alert can echo
                    your own words back rather than phrasing a next step for you.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="ghost">Cancel</Button>
                  <Button variant="primary">Generate</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Button
              variant="secondary"
              onClick={() =>
                toast.success('Thesis health recalculated', {
                  description: 'INFY assumption "revenue_growth_yoy" now passing.',
                })
              }
            >
              Success toast
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.warning('Assumption under stress', {
                  description: 'HDFCBANK NIM is within 0.2pp of your threshold.',
                })
              }
            >
              Caution toast
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.error('Thesis breaker met', {
                  description: 'TATAMOTORS crossed the drawdown limit you set.',
                })
              }
            >
              Broken toast
            </Button>

            <SimpleTooltip content="Sourced from the BSE filing dated 14 May">
              <span className="inline-flex items-center gap-1.5 rounded-card border border-border px-2.5 py-1 text-caption text-ink-secondary">
                <Info className="h-3.5 w-3.5" aria-hidden />
                Hover for a tooltip
              </span>
            </SimpleTooltip>

            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{initialsOf('Aakash Kudesh')}</AvatarFallback>
              </Avatar>
              <span className="text-caption text-ink-secondary">Avatar fallback</span>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section
        title="Progress"
        note="Horizontal meters for sub-scores. Deliberately plain so they never compete with the gauge."
      >
        <Card>
          <CardContent className="grid max-w-lg gap-4">
            {[
              { label: 'Thesis rigor', value: 82, tone: 'healthy' as const },
              { label: 'Portfolio construction', value: 64, tone: 'caution' as const },
              { label: 'Exit discipline', value: 38, tone: 'broken' as const },
              { label: 'Learning & adaptation', value: 50, tone: 'neutral' as const },
            ].map((row) => (
              <div key={row.label} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-caption uppercase tracking-[0.04em] text-ink-secondary">
                    {row.label}
                  </span>
                  <span className="font-mono text-data-small tabular-nums text-ink-primary">
                    {row.value}
                  </span>
                </div>
                <Progress value={row.value} tone={row.tone} label={row.label} />
              </div>
            ))}
          </CardContent>
        </Card>
      </Section>

      <Section title="Compliance copy">
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-2 rounded-card border border-border bg-recessed p-4">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-signal-caution-ink"
                aria-hidden
              />
              <p className="text-body text-ink-secondary">
                Alerts echo the user&apos;s own rule text verbatim. The product never phrases a next
                step.
              </p>
            </div>
            <Disclaimer />
          </CardContent>
        </Card>
      </Section>
    </div>
  );
}
