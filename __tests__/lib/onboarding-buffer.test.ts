const store = new Map<string, unknown>();
const mockGetItem = jest.fn(async (name: string) => (store.has(name) ? store.get(name) : null));
const mockSetItem = jest.fn(async (name: string, value: unknown) => { store.set(name, value); });
const mockRemoveItem = jest.fn(async (name: string) => { store.delete(name); });
jest.mock('../../lib/storage', () => ({
  getItem: (n: string) => mockGetItem(n), setItem: (n: string, v: unknown) => mockSetItem(n, v), removeItem: (n: string) => mockRemoveItem(n),
}));
jest.mock('../../lib/sentry', () => ({ addBreadcrumb: jest.fn() }));

// --- Supabase mock with full select().eq().maybeSingle() chain ---
const mockMaybeSingle = jest.fn();
const mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockSelect = jest.fn(() => ({ eq: mockEq }));
const mockUpsert = jest.fn();
// mockFrom must return an object that supports BOTH .upsert() and .select()
const mockFrom = jest.fn((_table: string) => ({
  upsert: mockUpsert,
  select: mockSelect,
}));
jest.mock('../../lib/supabase', () => ({ supabase: { from: (t: string) => mockFrom(t) } }));

import { flushOnboardingAnswers } from '../../lib/onboarding-buffer';
const BUFFER_KEY = 'onboarding_answers';

beforeEach(() => {
  store.clear();
  jest.clearAllMocks();
  // Default: upsert succeeds, no existing profile row
  mockUpsert.mockResolvedValue({ error: null });
  mockMaybeSingle.mockResolvedValue({ data: null, error: null });
});

describe('flushOnboardingAnswers', () => {
  it('writes answers into the single onboarding_answers jsonb column (not as top-level columns)', async () => {
    store.set(BUFFER_KEY, { fitnessGoal: 'lose-weight', weeklyTarget: 3 });
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    await flushOnboardingAnswers('user-123');
    expect(mockFrom).toHaveBeenCalledWith('profiles');
    expect(mockUpsert).toHaveBeenCalledWith(
      { id: 'user-123', onboarding_answers: { fitnessGoal: 'lose-weight', weeklyTarget: 3 } }, { onConflict: 'id' });
    const [payload] = mockUpsert.mock.calls[0];
    expect(Object.keys(payload).sort()).toEqual(['id', 'onboarding_answers']);
    expect(payload).not.toHaveProperty('fitnessGoal');
  });

  it('clears the buffer after a successful flush', async () => {
    store.set(BUFFER_KEY, { a: 1 });
    await flushOnboardingAnswers('user-1');
    expect(mockRemoveItem).toHaveBeenCalledWith(BUFFER_KEY);
  });

  it('is a no-op when the buffer is empty (no read, no upsert)', async () => {
    await flushOnboardingAnswers('user-1');
    expect(mockSelect).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  it('preserves the buffer (does not clear) when the upsert returns an error', async () => {
    store.set(BUFFER_KEY, { a: 1 });
    mockUpsert.mockResolvedValue({ error: { message: 'boom' } });
    await flushOnboardingAnswers('user-1');
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  it('MERGES local buffer into existing column — partial re-flush keeps prior keys', async () => {
    // Prior keys already in the DB
    mockMaybeSingle.mockResolvedValue({
      data: { onboarding_answers: { priorKey: 'prior-value', shared: 'old' } },
      error: null,
    });
    // Local buffer has a new key and a colliding key
    store.set(BUFFER_KEY, { newKey: 'new-value', shared: 'new' });
    await flushOnboardingAnswers('user-merge');
    const [payload] = mockUpsert.mock.calls[0];
    expect(payload.onboarding_answers).toEqual({
      priorKey: 'prior-value', // preserved from prior
      shared: 'new',           // local wins on collision
      newKey: 'new-value',     // new key added
    });
  });

  it('local buffer wins on key collision with existing DB value', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { onboarding_answers: { goal: 'old-goal' } },
      error: null,
    });
    store.set(BUFFER_KEY, { goal: 'new-goal' });
    await flushOnboardingAnswers('user-collision');
    const [payload] = mockUpsert.mock.calls[0];
    expect(payload.onboarding_answers.goal).toBe('new-goal');
  });

  it('writes buffer as-is when the profile row does not exist yet (maybeSingle returns null)', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });
    store.set(BUFFER_KEY, { firstKey: 'first-value' });
    await flushOnboardingAnswers('new-user');
    const [payload] = mockUpsert.mock.calls[0];
    expect(payload.onboarding_answers).toEqual({ firstKey: 'first-value' });
  });
});
