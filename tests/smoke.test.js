import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createMetricsStore,
  recordMetric,
  metricsSnapshot,
  exportPrometheus,
  sanitizeHeaders,
  statusClassFromCode,
} from '../src/app.js'

test('metrics aggregate totals, classes and route details', () => {
  const metrics = createMetricsStore()
  recordMetric(metrics, { routeKey: 'GET /health', statusCode: 200, durationMs: 12 })
  recordMetric(metrics, { routeKey: 'GET /health', statusCode: 200, durationMs: 18 })
  recordMetric(metrics, { routeKey: 'GET /demo/error', statusCode: 500, durationMs: 5 })

  const snapshot = metricsSnapshot(metrics)
  assert.equal(snapshot.totalRequests, 3)
  assert.equal(snapshot.totalErrors, 1)
  assert.equal(snapshot.byStatusClass['2xx'], 2)
  assert.equal(snapshot.byStatusClass['5xx'], 1)
  assert.equal(snapshot.perRoute['GET /health'].count, 2)
})

test('prometheus export and header redaction work', () => {
  const metrics = createMetricsStore()
  recordMetric(metrics, { routeKey: 'GET /health', statusCode: 200, durationMs: 10 })

  const prom = exportPrometheus(metrics)
  assert.ok(prom.includes('app_requests_total 1'))

  const sanitized = sanitizeHeaders({ authorization: 'Bearer x', accept: 'application/json' })
  assert.equal(sanitized.authorization, '[REDACTED]')
  assert.equal(sanitized.accept, 'application/json')
  assert.equal(statusClassFromCode(404), '4xx')
})