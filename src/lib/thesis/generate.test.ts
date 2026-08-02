import { afterEach, describe, expect, it, vi } from 'vitest';
import { llmProvider } from '@/lib/llm';
import { generateThesis } from './generate';

// Stub the provider: these tests are about the validation boundary between the
// model and our data, not about the network.
vi.mock('@/lib/llm', () => ({
  llmProvider: { name: 'stub', model: 'stub', generate: vi.fn() },
  isLlmConfigured: true,
}));

const generate = vi.mocked(llmProvider.generate);

const input = {
  ticker: 'BEL',
  company: 'Bharat Electronics',
  sector: 'Defence',
  metrics: { revenue_growth_yoy: 24.9, profit_margin: 21.4 },
};

const VALID = JSON.stringify({
  thesis_text:
    'Investors who hold this stock typically believe the defence order book keeps compounding and that margins hold as the business scales.',
  assumptions: [
    { metric: 'revenue_growth_yoy', operator: '>', threshold: 15 },
    { metric: 'profit_margin', operator: '>', threshold: 15 },
    { metric: 'trailing_pe', operator: '<', threshold: 45 },
  ],
});

afterEach(() => vi.clearAllMocks());

describe('generateThesis', () => {
  it('maps a valid response into a draft', async () => {
    generate.mockResolvedValue(VALID);
    const draft = await generateThesis(input);

    expect(draft.thesisText).toContain('typically believe');
    expect(draft.assumptions).toHaveLength(3);
    expect(draft.assumptions[0]).toEqual({
      metricKey: 'revenue_growth_yoy',
      operator: '>',
      thresholdValue: 15,
    });
  });

  // The central guard: a hallucinated metric would create an assumption that
  // silently never evaluates, quietly inflating the health score.
  it('rejects a response naming a metric outside the registry', async () => {
    generate.mockResolvedValue(
      JSON.stringify({
        thesis_text: 'A'.repeat(60),
        assumptions: [
          { metric: 'ebitda_margin_growth', operator: '>', threshold: 10 },
          { metric: 'profit_margin', operator: '>', threshold: 10 },
        ],
      }),
    );
    await expect(generateThesis(input)).rejects.toThrow(/could not use/i);
  });

  it('rejects output that is not JSON', async () => {
    generate.mockResolvedValue('Here is a thesis for you!');
    await expect(generateThesis(input)).rejects.toThrow(/not JSON/i);
  });

  it.each([
    ['too few assumptions', { thesis_text: 'A'.repeat(60), assumptions: [] }],
    [
      'a missing thesis',
      { assumptions: [{ metric: 'profit_margin', operator: '>', threshold: 5 }] },
    ],
    [
      'an unknown operator',
      {
        thesis_text: 'A'.repeat(60),
        assumptions: [
          { metric: 'profit_margin', operator: '~', threshold: 5 },
          { metric: 'trailing_pe', operator: '<', threshold: 20 },
        ],
      },
    ],
    [
      'a non-numeric threshold',
      {
        thesis_text: 'A'.repeat(60),
        assumptions: [
          { metric: 'profit_margin', operator: '>', threshold: 'high' },
          { metric: 'trailing_pe', operator: '<', threshold: 20 },
        ],
      },
    ],
  ])('rejects %s', async (_label, payload) => {
    generate.mockResolvedValue(JSON.stringify(payload));
    await expect(generateThesis(input)).rejects.toThrow();
  });

  it('passes the reported metrics to the model', async () => {
    generate.mockResolvedValue(VALID);
    await generateThesis(input);

    const call = generate.mock.calls[0]![0] as { system: string; prompt: string };
    expect(call.prompt).toContain('Bharat Electronics');
    expect(call.prompt).toContain('24.9');
    // The compliance framing is not optional.
    expect(call.system).toContain('Never recommend');
  });
});
