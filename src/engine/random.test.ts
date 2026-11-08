import { describe, expect, it } from 'vitest'
import { createRandom, nextInt, nextRandom, shuffle, type RandomState } from './random.ts'

function sequence(seed: number, count: number): number[] {
  let state: RandomState = createRandom(seed)
  const values: number[] = []
  for (let i = 0; i < count; i++) {
    const result = nextRandom(state)
    values.push(result.value)
    state = result.state
  }
  return values
}

describe('createRandom', () => {
  it('rejects a seed that is not a whole number', () => {
    expect(() => createRandom(1.5)).toThrow()
    expect(() => createRandom(Number.NaN)).toThrow()
  })
})

describe('nextRandom', () => {
  it('gives the same sequence for the same seed', () => {
    expect(sequence(42, 20)).toEqual(sequence(42, 20))
  })

  it('gives different sequences for different seeds', () => {
    expect(sequence(1, 20)).not.toEqual(sequence(2, 20))
  })

  it('returns values in [0, 1)', () => {
    for (const value of sequence(7, 1000)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  it('does not depend on hidden state: the same state gives the same value', () => {
    const state = createRandom(99)
    expect(nextRandom(state)).toEqual(nextRandom(state))
  })
})

describe('nextInt', () => {
  it('returns whole numbers from 0 up to but not including the maximum', () => {
    let state = createRandom(3)
    const seen = new Set<number>()
    for (let i = 0; i < 500; i++) {
      const result = nextInt(state, 6)
      state = result.state
      expect(Number.isInteger(result.value)).toBe(true)
      expect(result.value).toBeGreaterThanOrEqual(0)
      expect(result.value).toBeLessThan(6)
      seen.add(result.value)
    }
    expect(seen.size).toBe(6)
  })

  it('rejects a maximum below 1 or not a whole number', () => {
    const state = createRandom(1)
    expect(() => nextInt(state, 0)).toThrow()
    expect(() => nextInt(state, 2.5)).toThrow()
  })
})

describe('shuffle', () => {
  const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

  it('keeps exactly the same items', () => {
    const result = shuffle(items, createRandom(5))
    expect([...result.items].sort()).toEqual([...items].sort())
  })

  it('is repeatable for the same seed', () => {
    expect(shuffle(items, createRandom(5))).toEqual(shuffle(items, createRandom(5)))
  })

  it('does not change the input list', () => {
    const copy = [...items]
    shuffle(items, createRandom(5))
    expect(items).toEqual(copy)
  })

  it('changes the order for at least some seeds', () => {
    const orders = new Set(
      [1, 2, 3, 4, 5].map((seed) => shuffle(items, createRandom(seed)).items.join('')),
    )
    expect(orders.size).toBeGreaterThan(1)
  })

  it('advances the random state', () => {
    const start = createRandom(5)
    expect(shuffle(items, start).state).not.toBe(start)
  })
})
