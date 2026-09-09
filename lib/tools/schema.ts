import { z } from 'zod'

/**
 * Request schemas shared by every free tool.
 *
 * The crawl is one route serving all of them — see app/api/tools/crawl — so its
 * schema lives here rather than beside any one tool. Tool-specific schemas stay
 * with their tool (lib/tools/chatbot/schema.ts, lib/tools/llms-txt/schema.ts).
 */

export const crawlSchema = z.object({
  url: z.string().min(1).max(2048),
  /** Set by the "read my site again" button — bypasses the 24h reuse cache. */
  force: z.boolean().optional().default(false),
  /**
   * Which tool asked. Only reaches `createSession`, so the crawl itself is
   * identical for all of them — matches the CHECK constraint in
   * db/migrations/0003_tool_sessions.sql.
   */
  tool: z.enum(['chatbot', 'grader', 'llms-txt']).optional().default('chatbot'),
})

export type CrawlInput = z.infer<typeof crawlSchema>
