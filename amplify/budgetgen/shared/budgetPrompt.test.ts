import { describe, it, expect } from 'vitest';
import { buildBudgetRequest } from './budgetPrompt';

describe('buildBudgetRequest', () => {
  it('forces the estimate_budget tool and names the destination', () => {
    const body = JSON.parse(buildBudgetRequest({ destinationName: 'Kyoto', homeAirport: 'DTW' }));
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'estimate_budget' });
    expect(body.tools[0].name).toBe('estimate_budget');
    expect(body.messages[0].content).toContain('Kyoto');
  });

  it('puts the home airport in the system prompt (origin for the flight)', () => {
    const body = JSON.parse(buildBudgetRequest({ destinationName: 'Lisbon', homeAirport: 'DTW' }));
    expect(body.system).toContain('DTW');
  });

  it('requires all four estimate fields in the tool schema', () => {
    const body = JSON.parse(buildBudgetRequest({ destinationName: 'Bali', homeAirport: 'DTW' }));
    expect(body.tools[0].input_schema.required).toEqual(
      expect.arrayContaining(['flightPerPerson', 'lodgingPerNight', 'nights', 'seasonNote']),
    );
  });
});
