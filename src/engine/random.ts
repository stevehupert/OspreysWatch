// Seedable random number generator (mulberry32).
//
// The generator's whole state is one 32-bit number. Every function takes the
// current state and returns the next one, so the engine never hides randomness
// inside an object. Saving that number is enough to replay a game exactly.

export type RandomState = number

/** Start a generator from a whole-number seed. */
export function createRandom(seed: number): RandomState {
  if (!Number.isInteger(seed)) {
    throw new Error(`Random seed must be a whole number, got ${seed}`)
  }
  return seed >>> 0
}

/** Returns a number in [0, 1) and the next state. */
export function nextRandom(state: RandomState): { value: number; state: RandomState } {
  const nextState = (state + 0x6d2b79f5) >>> 0
  let t = nextState
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296
  return { value, state: nextState }
}

/** Returns a whole number from 0 up to (but not including) maxExclusive, and the next state. */
export function nextInt(
  state: RandomState,
  maxExclusive: number,
): { value: number; state: RandomState } {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1) {
    throw new Error(`maxExclusive must be a whole number of at least 1, got ${maxExclusive}`)
  }
  const result = nextRandom(state)
  return { value: Math.floor(result.value * maxExclusive), state: result.state }
}

/** Returns a shuffled copy of items (Fisher-Yates) and the next state. The input is not changed. */
export function shuffle<T>(
  items: readonly T[],
  state: RandomState,
): { items: T[]; state: RandomState } {
  const result = [...items]
  let current = state
  for (let i = result.length - 1; i > 0; i--) {
    const pick = nextInt(current, i + 1)
    current = pick.state
    ;[result[i], result[pick.value]] = [result[pick.value], result[i]]
  }
  return { items: result, state: current }
}
