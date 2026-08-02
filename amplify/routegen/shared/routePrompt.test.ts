import { describe, it, expect } from 'vitest';
import { buildRouteRequest } from './routePrompt';

describe('buildRouteRequest', () => {
  it('forces the suggest_route tool and passes the trip theme', () => {
    const body = JSON.parse(buildRouteRequest({ theme: 'Southeast Asia 3 weeks', exclude: [] }));
    expect(body.tool_choice).toEqual({ type: 'tool', name: 'suggest_route' });
    expect(body.messages[0].content).toContain('Southeast Asia 3 weeks');
  });

  it('tells the model to complement existing stops', () => {
    const body = JSON.parse(buildRouteRequest({ theme: 'Asia', exclude: ['Tokyo', 'Bangkok'] }));
    expect(body.system).toContain('Tokyo');
    expect(body.system).toContain('Bangkok');
    expect(body.system).toMatch(/COMPLEMENT/i);
  });

  it('requires place/nights/note on each stop', () => {
    const body = JSON.parse(buildRouteRequest({ theme: 'x', exclude: [] }));
    expect(body.tools[0].input_schema.properties.stops.items.required).toEqual(
      expect.arrayContaining(['place', 'nights', 'note']),
    );
  });
});
