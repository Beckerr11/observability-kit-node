export function createNoopErrorReporter() {
  return async function noopReporter() {
    return { delivered: false, reason: 'disabled' }
  }
}

export function createSentryReporter(options = {}) {
  const dsn = String(options.dsn || '').trim()
  const environment = String(options.environment || 'development')

  if (!dsn) {
    return createNoopErrorReporter()
  }

  return async function sentryReporter(event) {
    const payload = {
      timestamp: new Date().toISOString(),
      environment,
      traceId: event.traceId,
      routeKey: event.routeKey,
      error: {
        name: event.error?.name || 'Error',
        message: event.error?.message || 'unexpected error',
      },
      headers: event.headers,
    }

    try {
      await fetch(dsn, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      return { delivered: true }
    } catch {
      return { delivered: false, reason: 'network_error' }
    }
  }
}