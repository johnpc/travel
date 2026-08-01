import { describe, it, expect } from 'vitest';
import { buildActivityRequest } from './activityPrompt';

describe('buildActivityRequest', () => {
  it('builds a tool-forced body for a destination and count', () => {
    const body = JSON.parse(
      buildActivityRequest({ destinationName: 'Santorini', count: 5, exclude: [] }),
    );
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'suggest_activities' });
    expect(body.system).toContain('exactly 5');
    expect(body.messages[0].content).toContain('Santorini');
  });

  it('names excluded activities so they are not repeated', () => {
    const body = JSON.parse(
      buildActivityRequest({ destinationName: 'x', count: 3, exclude: ['Wine tour'] }),
    );
    expect(body.system).toContain('Wine tour');
  });

  it('omits the exclude line when nothing is excluded', () => {
    const body = JSON.parse(buildActivityRequest({ destinationName: 'x', count: 3, exclude: [] }));
    expect(body.system).not.toContain('already-listed');
  });
});
