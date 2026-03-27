export function createMetricsStore() {
  return {
    totalRequests: 0,
    totalErrors: 0,
    totalDurationMs: 0,
    perRoute: {},
  }
}

export function recordMetric(metrics, { routeKey, statusCode, durationMs }) {
  metrics.totalRequests += 1
  metrics.totalDurationMs += durationMs

  if (statusCode >= 500) {
    metrics.totalErrors += 1
  }

  if (!metrics.perRoute[routeKey]) {
    metrics.perRoute[routeKey] = {
      count: 0,
      errors: 0,
      totalDurationMs: 0,
    }
  }

  const item = metrics.perRoute[routeKey]
  item.count += 1
  item.totalDurationMs += durationMs
  if (statusCode >= 500) {
    item.errors += 1
  }
}

export function metricsSnapshot(metrics) {
  const averageDurationMs = metrics.totalRequests ? Math.round(metrics.totalDurationMs / metrics.totalRequests) : 0
  return {
    totalRequests: metrics.totalRequests,
    totalErrors: metrics.totalErrors,
    averageDurationMs,
    perRoute: metrics.perRoute,
  }
}

export function toLogLine({ level, message, routeKey, statusCode, durationMs }) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'observability-kit-node',
    level,
    message,
    routeKey,
    statusCode,
    durationMs,
  })
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json' })
  res.end(JSON.stringify(payload))
}

export function createApp(metrics = createMetricsStore()) {
  return async function app(req, res) {
    const started = Date.now()
    const url = new URL(req.url || '/', 'http://localhost')
    const routeKey = `${req.method} ${url.pathname}`
    let statusCode = 200

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        sendJson(res, 200, { ok: true, service: 'observability-kit-node' })
        return
      }

      if (req.method === 'GET' && url.pathname === '/metrics') {
        sendJson(res, 200, { metrics: metricsSnapshot(metrics) })
        return
      }

      if (req.method === 'GET' && url.pathname === '/demo/error') {
        throw new Error('erro de demonstracao')
      }

      statusCode = 404
      sendJson(res, statusCode, { error: 'rota nao encontrada' })
    } catch (error) {
      statusCode = 500
      sendJson(res, statusCode, { error: error instanceof Error ? error.message : 'erro interno' })
    } finally {
      const durationMs = Date.now() - started
      recordMetric(metrics, { routeKey, statusCode, durationMs })
      const level = statusCode >= 500 ? 'error' : 'info'
      console.log(toLogLine({ level, message: 'request_completed', routeKey, statusCode, durationMs }))
    }
  }
}