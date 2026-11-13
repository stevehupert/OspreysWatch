import { describe, expect, it } from 'vitest'
import {
  defaultSetup,
  maxSuggestedSeed,
  parseSeed,
  randomSeed,
  readSetup,
  setupQuery,
} from './setup.ts'

describe('readSetup', () => {
  it('reads the hero and seed from the address', () => {
    expect(readSetup('?hero=mage&seed=7')).toEqual({ hero: 'mage', seed: 7 })
  })

  it('asks for the start screen when the address names no game', () => {
    expect(readSetup('')).toBeNull()
    expect(readSetup('?other=1')).toBeNull()
  })

  it('fills in the default for whichever of hero and seed is missing', () => {
    expect(readSetup('?hero=mage')).toEqual({ hero: 'mage', seed: defaultSetup.seed })
    expect(readSetup('?seed=7')).toEqual({ hero: defaultSetup.hero, seed: 7 })
  })

  it('ignores an unknown hero and a seed that is not a whole number', () => {
    expect(readSetup('?hero=rogue&seed=abc')).toEqual(defaultSetup)
    expect(readSetup('?seed=1.5')).toEqual(defaultSetup)
  })

  it('accepts seed 0', () => {
    expect(readSetup('?seed=0')?.seed).toBe(0)
  })

  it('reads back what setupQuery writes', () => {
    const setup = { hero: 'mage', seed: 4321 } as const
    expect(readSetup(setupQuery(setup))).toEqual(setup)
  })
})

describe('parseSeed', () => {
  it('accepts whole numbers, with spaces around them', () => {
    expect(parseSeed('42')).toBe(42)
    expect(parseSeed(' 7 ')).toBe(7)
    expect(parseSeed('0')).toBe(0)
  })

  it('refuses blanks, fractions and words', () => {
    for (const text of ['', '  ', '1.5', 'abc', '1e400']) expect(parseSeed(text)).toBeNull()
  })
})

describe('randomSeed', () => {
  it('stays between 1 and maxSuggestedSeed', () => {
    expect(randomSeed(() => 0)).toBe(1)
    expect(randomSeed(() => 0.999_999_999)).toBe(maxSuggestedSeed)
  })
})
