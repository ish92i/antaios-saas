import { cronJobs } from "convex/server"
import { internal } from "@cvx/_generated/api"

const crons = cronJobs()

crons.interval("reset stuck extractions", { minutes: 10 }, internal.shipments.resetStuckDocuments)

export default crons
