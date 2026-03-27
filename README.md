# observability-kit-node

Kit de observabilidade para APIs Node com logs, metricas e tracing.

## Objetivo
Construir uma base profissional para portfolio full stack com foco em simplicidade, clareza e evolucao incremental.

## Stack
Node.js + OpenTelemetry + Sentry + Prometheus

## MVP (v0.1)
- Health endpoint
- Logs estruturados
- Metrica de requests
- Tracing inicial

## Estrutura inicial
- docs/ROADMAP.md: plano de evolucao
- src/: codigo fonte principal
- 	ests/: testes iniciais
- .github/workflows/ci.yml: pipeline minima

## Como executar
Veja as instrucoes no docs/ROADMAP.md e no bloco de setup abaixo.
`ash
npm install
npm test
npm run dev
`
## Status
- [x] Scaffold inicial
- [ ] MVP funcional
- [ ] Deploy publico
- [ ] Observabilidade e seguranca avancada