import http from 'node:http'
import { createApp, createMetricsStore } from './app.js'
import { createSentryReporter } from './integrations/sentryReporter.js'

const port = Number(process.env.PORT || 3000)
const errorReporter = createSentryReporter({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT,
})
const app = createApp(createMetricsStore(), { errorReporter })

http.createServer(app).listen(port, () => {
  console.log(`observability-kit-node running on port ${port}`)
})
