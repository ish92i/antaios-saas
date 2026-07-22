import { cronJobs } from "convex/server"
import { internal } from "@cvx/_generated/api"

const crons = cronJobs()

crons.interval("reset stuck extractions", { minutes: 10 }, internal.shipments.resetStuckDocuments)

crons.interval("cleanup rate limits", { hours: 1 }, internal.rateLimit.cleanupRateLimits)

crons.interval("cleanup expired translations", { hours: 24 }, internal.translationCache.cleanupExpiredTranslations)

export default crons
