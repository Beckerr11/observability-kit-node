import { createApp, createMetricsStore } from '../src/app.js'
import { createSentryReporter } from '../src/integrations/sentryReporter.js'

const metrics = globalThis.__observabilityMetrics || (globalThis.__observabilityMetrics = createMetricsStore())
const errorReporter = createSentryReporter({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
})

const app = createApp(metrics, { errorReporter })

export default app
