import { describe, it, expect, vi, beforeEach } from 'vitest';

const h = vi.hoisted(() => ({
  isNativePlatform: vi.fn(),
  impact: vi.fn().mockResolvedValue(undefined),
  notification: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: h.isNativePlatform } }));
vi.mock('@capacitor/haptics', () => ({
  Haptics: { impact: h.impact, notification: h.notification },
  ImpactStyle: { Light: 'LIGHT' },
  NotificationType: { Success: 'SUCCESS' },
}));

import { tapLight, tapSuccess } from './haptics';

describe('haptics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does nothing on the web (non-native) so no noisy warnings', () => {
    h.isNativePlatform.mockReturnValue(false);
    tapLight();
    tapSuccess();
    expect(h.impact).not.toHaveBeenCalled();
    expect(h.notification).not.toHaveBeenCalled();
  });

  it('fires a light impact and a success notification on native', () => {
    h.isNativePlatform.mockReturnValue(true);
    tapLight();
    expect(h.impact).toHaveBeenCalledWith({ style: 'LIGHT' });
    tapSuccess();
    expect(h.notification).toHaveBeenCalledWith({ type: 'SUCCESS' });
  });
});
