import { defineConfig } from 'vitest/config'

/**
 * Two tests, not a suite — the daily counter and the crawl URL validator.
 * Everything else in this repo is marketing pages where a type error and a
 * design review already catch what matters; these two are the money and
 * security paths. See docs/ai-chatbot-plan.md.
 *
 * Plain node environment: both units are pure logic, and the counter runs its
 * real SQL against node:sqlite (D1 is SQLite).
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**', '.open-next/**'],
  },
})
