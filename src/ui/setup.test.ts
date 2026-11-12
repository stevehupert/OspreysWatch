import { describe, expect, it } from 'vitest'
import { defaultSetup, readSetup } from './setup.ts'

describe('readSetup', () => {
  it('reads the hero and seed from the address', () => {
    expect(readSetup('?hero=mage&seed=7')).toEqual({ hero: 'mage', seed: 7 })
  })

  it('uses the defaults when nothing is given', () => {
    expect(readSetup('')).toEqual(defaultSetup)
  })

  it('ignores an unknown hero and a seed that is not a whole number', () => {
    expect(readSetup('?hero=rogue&seed=abc')).toEqual(defaultSetup)
    expect(readSetup('?seed=1.5')).toEqual(defaultSetup)
  })

  it('accepts seed 0', () => {
    expect(readSetup('?seed=0').seed).toBe(0)
  })
})
