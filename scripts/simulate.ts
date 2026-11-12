// Command-line balance check: play the bot through Scenario 1 and print win rates.
//
//   node scripts/simulate.ts <warrior|mage> [firstSeed] [lastSeed] [step|interact] [workers]
//
// Example: node scripts/simulate.ts mage 1001 2000 step 2
// Seeds are whole numbers; the same seed always plays the same game.

import { isMainThread, parentPort, Worker, workerData } from 'node:worker_threads'
import { createContext } from '../src/engine/gameState.ts'
import { playBotGame, summarise, type GameSummary } from '../src/engine/simulate.ts'
import type { HeroId } from '../src/engine/data/heroes.ts'

interface Job {
  hero: HeroId
  seeds: number[]
  doorOpensBy: 'step' | 'interact'
}

if (!isMainThread) {
  const job = workerData as Job
  const context = createContext({ rules: { doorOpensBy: job.doorOpensBy } })
  const results = job.seeds.map((seed) => playBotGame(context, job.hero, seed))
  parentPort?.postMessage(results)
} else {
  const [heroArg, first = '1001', last = '1100', door = 'step', workers = '2'] =
    process.argv.slice(2)
  if ((heroArg !== 'warrior' && heroArg !== 'mage') || (door !== 'step' && door !== 'interact')) {
    console.error(
      'usage: node scripts/simulate.ts <warrior|mage> [firstSeed] [lastSeed] [step|interact] [workers]',
    )
    process.exit(1)
  }
  const seeds: number[] = []
  for (let seed = Number(first); seed <= Number(last); seed++) seeds.push(seed)
  const count = Math.max(1, Number(workers))
  const started = Date.now()

  const parts = Array.from({ length: count }, (_, i) =>
    seeds.filter((_, index) => index % count === i),
  )
  const all = await Promise.all(
    parts.map(
      (part) =>
        new Promise<GameSummary[]>((resolve, reject) => {
          const worker = new Worker(new URL(import.meta.url), {
            workerData: { hero: heroArg, seeds: part, doorOpensBy: door } satisfies Job,
          })
          worker.once('message', resolve)
          worker.once('error', reject)
        }),
    ),
  )
  const summary = summarise(all.flat())
  const pct = (n: number) => `${((100 * n) / summary.games).toFixed(1)}%`
  console.log(`${heroArg}, door opens by ${door}, seeds ${first}-${last} (${summary.games} games)`)
  console.log(
    `  wins ${pct(summary.outcomes.victory)} (±${(100 * summary.winRateMargin).toFixed(1)})`,
  )
  console.log(`  lost to health ${pct(summary.outcomes['defeat-health'])}`)
  console.log(`  lost to exhaustion ${pct(summary.outcomes['defeat-exhausted'])}`)
  console.log(`  timeouts ${pct(summary.outcomes.timeout)}`)
  console.log(`  average round of a win ${summary.averageWinRounds.toFixed(1)}`)
  console.log(`  took ${((Date.now() - started) / 1000).toFixed(1)}s`)
}
