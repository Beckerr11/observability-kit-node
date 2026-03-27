import http from 'node:http'
import { createApp, createMetricsStore } from './app.js'

const port = Number(process.env.PORT || 3000)
const app = createApp(createMetricsStore())

http.createServer(app).listen(port, () => {
  console.log(`observability-kit-node running on port ${port}`)
})