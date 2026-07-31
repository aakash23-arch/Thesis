'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Modal, ModalTrigger, ModalContent, ModalTitle, ModalDescription } from '@/components/ui/modal';
import { toast } from '@/components/ui/toast';
import { ThesisGauge } from '@/components/thesis/thesis-gauge';

const SAMPLE_POSITIONS = [
  { ticker: 'INFY', sector: 'IT Services', qty: 40, avgPrice: 1512.5, ltp: 1584.2, health: 84 },
  { ticker: 'HDFCBANK', sector: 'Banking', qty: 25, avgPrice: 1620.0, ltp: 1598.75, health: 61 },
  { ticker: 'TATAMOTORS', sector: 'Auto', qty: 60, avgPrice: 812.3, ltp: 742.1, health: 38 },
];

export default function DashboardShowcasePage() {
  const [sliderValue, setSliderValue] = useState([65]);

  return (
    <div className="flex flex-col gap-12">
      <PageHeader
        title="Design System Showcase"
        description="Session 1 visual QA surface -- every primitive, one page, against the token spec."
      />

      {/* ThesisGauge */}
      <section>
        <h2 className="mb-4 text-section-head font-semibold text-ink-primary">Thesis Gauge</h2>
        <Card>
          <CardContent className="flex flex-wrap items-end gap-12">
            <ThesisGauge score={84} previousScore={76} />
            <ThesisGauge score={61} previousScore={70} />
            <ThesisGauge score={32} previousScore={45} />
            <div className="flex items-center gap-6">
              <span className="text-caption uppercase tracking-[0.04em] text-ink-secondary">
                Mini variant
              </span>
              <ThesisGauge score={84} size="mini" />
              <ThesisGauge score={61} size="mini" />
              <ThesisGauge score={32} size="mini" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="mb-4 text-section-head font-semibold text-ink-primary">Buttons</h2>
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Cards */}
      <section>
        <h2 className="mb-4 text-section-head font-semibold text-ink-primary">Cards</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Thesis Rigor</CardTitle>
              <CardDescription>Cohort-relative, Track A</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="font-mono text-data-figure text-ink-primary">72</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Value</CardTitle>
              <CardDescription>As of today</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="font-mono text-data-figure text-ink-primary">18,42,600</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Exit Discipline</CardTitle>
              <CardDescription>Rule-following rate</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="font-mono text-data-figure text-ink-primary">58%</span>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="mb-4 text-section-head font-semibold text-ink-primary">Badges</h2>
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Badge variant="healthy">Healthy</Badge>
            <Badge variant="caution">Caution</Badge>
            <Badge variant="broken">Broken</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="default">Default</Badge>
          </CardContent>
        </Card>
      </section>

      {/* Inputs */}
      <section>
        <h2 className="mb-4 text-section-head font-semibold text-ink-primary">Inputs</h2>
        <Card>
          <CardContent className="grid max-w-lg gap-4">
            <Input placeholder="Search ticker..." />
            <Input numeric placeholder="0.00" defaultValue="1584.20" />
            <Select defaultValue="growth">
              <SelectTrigger>
                <SelectValue placeholder="Thesis template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="growth">Growth case</SelectItem>
                <SelectItem value="value">Value case</SelectItem>
                <SelectItem value="turnaround">Turnaround</SelectItem>
                <SelectItem value="momentum">Momentum</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-4">
              <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
              <span className="w-10 text-right font-mono text-data-small text-ink-primary">
                {sliderValue[0]}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Table */}
      <section>
        <h2 className="mb-4 text-section-head font-semibold text-ink-primary">Table</h2>
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticker</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Avg Price</TableHead>
                <TableHead className="text-right">LTP</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_POSITIONS.map((p) => (
                <TableRow key={p.ticker}>
                  <TableCell className="font-medium">{p.ticker}</TableCell>
                  <TableCell>{p.sector}</TableCell>
                  <TableCell numeric>{p.qty}</TableCell>
                  <TableCell numeric>{p.avgPrice.toFixed(2)}</TableCell>
                  <TableCell numeric>{p.ltp.toFixed(2)}</TableCell>
                  <TableCell>
                    <ThesisGauge score={p.health} size="mini" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      {/* Modal + Toast */}
      <section>
        <h2 className="mb-4 text-section-head font-semibold text-ink-primary">Modal &amp; Toast</h2>
        <Card>
          <CardContent className="flex flex-wrap gap-3">
            <Modal>
              <ModalTrigger asChild>
                <Button variant="secondary">Open modal</Button>
              </ModalTrigger>
              <ModalContent>
                <ModalTitle>Suggest exit rules</ModalTitle>
                <ModalDescription>
                  Generate 3-4 exit rules based on this position&apos;s thesis.
                </ModalDescription>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="ghost">Cancel</Button>
                  <Button variant="primary">Generate</Button>
                </div>
              </ModalContent>
            </Modal>
            <Button
              variant="secondary"
              onClick={() =>
                toast('Thesis health recalculated', {
                  description: 'INFY assumption "revenue_growth_yoy" now passing.',
                })
              }
            >
              Trigger toast
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
