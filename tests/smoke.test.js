import test from 'node:test'
import assert from 'node:assert/strict'
import { createMetricsStore, recordMetric, metricsSnapshot } from '../src/app.js'

test('metrics aggregate totals and route details', () => {
  const metrics = createMetricsStore()
  recordMetric(metrics, { routeKey: 'GET /health', statusCode: 200, durationMs: 12 })
  recordMetric(metrics, { routeKey: 'GET /health', statusCode: 200, durationMs: 18 })
  recordMetric(metrics, { routeKey: 'GET /demo/error', statusCode: 500, durationMs: 5 })

  const snapshot = metricsSnapshot(metrics)
  assert.equal(snapshot.totalRequests, 3)
  assert.equal(snapshot.totalErrors, 1)
  assert.equal(snapshot.perRoute['GET /health'].count, 2)
})