import { describe, it, expect } from 'vitest';
import { buildSuggestRequest } from './suggestPrompt';

describe('buildSuggestRequest', () => {
  it('builds a tool-forced body asking for the given count', () => {
    const body = JSON.parse(
      buildSuggestRequest({ tripTitle: 'Greece 2027', count: 5, exclude: [] }),
    );
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'suggest_destinations' });
    expect(body.tools[0].name).toBe('suggest_destinations');
    expect(body.system).toContain('exactly 5');
    expect(body.messages[0].content).toContain('Greece 2027');
  });

  it('names excluded destinations so the model does not repeat them', () => {
    const body = JSON.parse(
      buildSuggestRequest({ tripTitle: 'x', count: 3, exclude: ['Santorini', 'Kyoto'] }),
    );
    expect(body.system).toContain('Santorini, Kyoto');
  });

  it('omits the exclude line when nothing is excluded', () => {
    const body = JSON.parse(buildSuggestRequest({ tripTitle: 'x', count: 3, exclude: [] }));
    expect(body.system).not.toContain('already-listed');
  });

  it('falls back to a generic trip label when the title is blank', () => {
    const body = JSON.parse(buildSuggestRequest({ tripTitle: '', count: 3, exclude: [] }));
    expect(body.messages[0].content).toContain('a group getaway');
  });
});
