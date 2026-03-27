import { randomUUID } from 'node:crypto'

const REDACTED_HEADERS = new Set(['authorization', 'cookie', 'x-api-key'])

export function createMetricsStore() {
  return {
    totalRequests: 0,
    totalErrors: 0,
    totalDurationMs: 0,
    byStatusClass: {
      '2xx': 0,
      '3xx': 0,
      '4xx': 0,
      '5xx': 0,
    },
    perRoute: {},
  }
}

export function statusClassFromCode(statusCode) {
  if (statusCode >= 200 && statusCode < 300) return '2xx'
  if (statusCode >= 300 && statusCode < 400) return '3xx'
  if (statusCode >= 400 && statusCode < 500) return '4xx'
  return '5xx'
}

export function sanitizeHeaders(headers = {}) {
  const sanitized = {}
  for (const [key, value] of Object.entries(headers)) {
    if (REDACTED_HEADERS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]'
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

export function recordMetric(metrics, { routeKey, statusCode, durationMs }) {
  metrics.totalRequests += 1
  metrics.totalDurationMs += durationMs

  if (statusCode >= 500) {
    metrics.totalErrors += 1
  }

  const codeClass = statusClassFromCode(statusCode)
  metrics.byStatusClass[codeClass] += 1

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
    byStatusClass: metrics.byStatusClass,
    perRoute: metrics.perRoute,
  }
}

export function exportPrometheus(metrics) {
  return [
    '# HELP app_requests_total Total de requisicoes processadas',
    '# TYPE app_requests_total counter',
    `app_requests_total ${metrics.totalRequests}`,
    '# HELP app_errors_total Total de erros de servidor',
    '# TYPE app_errors_total counter',
    `app_errors_total ${metrics.totalErrors}`,
    '# HELP app_request_duration_ms_total Soma de latencias em ms',
    '# TYPE app_request_duration_ms_total counter',
    `app_request_duration_ms_total ${metrics.totalDurationMs}`,
    '# HELP app_requests_by_status_class Total por classe HTTP',
    '# TYPE app_requests_by_status_class counter',
    `app_requests_by_status_class{class="2xx"} ${metrics.byStatusClass['2xx']}`,
    `app_requests_by_status_class{class="3xx"} ${metrics.byStatusClass['3xx']}`,
    `app_requests_by_status_class{class="4xx"} ${metrics.byStatusClass['4xx']}`,
    `app_requests_by_status_class{class="5xx"} ${metrics.byStatusClass['5xx']}`,
    '',
  ].join('\n')
}

export function toLogLine({ level, message, routeKey, statusCode, durationMs, traceId, headers }) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    service: 'observability-kit-node',
    level,
    message,
    routeKey,
    statusCode,
    durationMs,
    traceId,
    headers: sanitizeHeaders(headers),
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
    const traceId = req.headers['x-trace-id'] || randomUUID()
    res.setHeader('x-trace-id', traceId)
    let statusCode = 200

    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        sendJson(res, 200, { ok: true, service: 'observability-kit-node', traceId })
        return
      }

      if (req.method === 'GET' && url.pathname === '/metrics') {
        sendJson(res, 200, { metrics: metricsSnapshot(metrics), traceId })
        return
      }

      if (req.method === 'GET' && url.pathname === '/metrics/prometheus') {
        const body = exportPrometheus(metrics)
        res.writeHead(200, { 'content-type': 'text/plain; version=0.0.4' })
        res.end(body)
        return
      }

      if (req.method === 'GET' && url.pathname === '/demo/error') {
        throw new Error('erro de demonstracao')
      }

      statusCode = 404
      sendJson(res, statusCode, { error: 'rota nao encontrada', traceId })
    } catch (error) {
      statusCode = 500
      sendJson(res, statusCode, { error: error instanceof Error ? error.message : 'erro interno', traceId })
    } finally {
      const durationMs = Date.now() - started
      recordMetric(metrics, { routeKey, statusCode, durationMs })
      const level = statusCode >= 500 ? 'error' : 'info'
      console.log(
        toLogLine({
          level,
          message: 'request_completed',
          routeKey,
          statusCode,
          durationMs,
          traceId,
          headers: req.headers,
        })
      )
    }
  }
}