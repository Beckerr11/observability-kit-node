# observability-kit-node

![CI](https://github.com/Beckerr11/observability-kit-node/actions/workflows/ci.yml/badge.svg)

Observability kit para Node.

## Objetivo
Este repositorio faz parte de uma trilha de portfolio profissional full stack, com foco em simplicidade, clareza e boas praticas.

## Stack
Node.js, logs estruturados, metricas Prometheus, reporter Sentry-ready

## Funcionalidades implementadas
- Snapshot de metricas por rota e status class
- Export em formato Prometheus
- Redacao de headers sensiveis nos logs
- Reporter de erro com fallback noop

## Como executar
~~~bash
npm ci
npm test
npm run dev
~~~

## Scripts uteis
- npm run dev, npm test

## Qualidade
- CI em .github/workflows/ci.yml
- Dependabot em .github/dependabot.yml
- Testes locais obrigatorios antes de merge

## Documentacao
- [Roadmap](docs/ROADMAP.md)
- [Checklist de producao](docs/PRODUCTION-CHECKLIST.md)
- [Contribuicao](CONTRIBUTING.md)
- [Seguranca](SECURITY.md)

## Status
- [x] Scaffold inicial
- [x] Base funcional com testes
- [ ] Deploy publico com observabilidade completa
- [ ] Versao 1.0.0 com demo publica
