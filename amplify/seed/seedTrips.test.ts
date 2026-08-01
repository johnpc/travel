import { describe, it, expect, vi, beforeEach } from 'vitest';

const m = vi.hoisted(() => ({
  tripCreate: vi.fn(),
  memberCreate: vi.fn(),
  destCreate: vi.fn(),
  clearOneModel: vi.fn(),
}));
vi.mock('./seedClient', () => ({
  client: {
    models: {
      Trip: { create: m.tripCreate },
      Member: { create: m.memberCreate },
      Destination: { create: m.destCreate },
    },
  },
  clearOneModel: m.clearOneModel,
  EDITOR_WRITE: { authMode: 'userPool' },
}));

import { seedTripData, clearAll } from './seedTrips';

describe('seedTripData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.tripCreate.mockResolvedValue({ data: { id: 'trip1' }, errors: null });
    m.memberCreate.mockResolvedValue({ errors: null });
    m.destCreate.mockResolvedValue({ errors: null });
  });

  it('creates each fixture trip with its roster and destinations', async () => {
    await seedTripData();
    // 2 fixture trips.
    expect(m.tripCreate).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'greece-2027', title: 'Greece 2027' }),
      { authMode: 'userPool' },
    );
    // greece-2027 has 4 members + demo-trip has 2 = 6 members total.
    expect(m.memberCreate).toHaveBeenCalledTimes(6);
    expect(m.memberCreate).toHaveBeenCalledWith(
      expect.objectContaining({ tripId: 'trip1', name: 'Alex' }),
      { authMode: 'userPool' },
    );
    // greece-2027 seeds 2 destinations; demo-trip seeds 0.
    expect(m.destCreate).toHaveBeenCalledTimes(2);
    expect(m.destCreate).toHaveBeenCalledWith(
      expect.objectContaining({ tripId: 'trip1', name: 'Santorini, Greece', source: 'AI' }),
      { authMode: 'userPool' },
    );
  });

  it('throws when a trip create returns errors', async () => {
    m.tripCreate.mockResolvedValueOnce({ data: null, errors: [{ message: 'denied' }] });
    await expect(seedTripData()).rejects.toThrow(/greece-2027/);
  });
});

describe('clearAll', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears children (members, destinations) then trips', async () => {
    m.clearOneModel.mockResolvedValue(0);
    await clearAll();
    expect(m.clearOneModel).toHaveBeenCalledTimes(3);
  });
});
