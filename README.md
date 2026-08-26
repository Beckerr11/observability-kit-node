# Observability Kit Node

![CI](https://github.com/Beckerr11/observability-kit-node/actions/workflows/ci.yml/badge.svg)

Referência mínima de observabilidade para serviços Node.js, construída para mostrar como **traces, logs estruturados, métricas e error reporting** se conectam dentro do ciclo de uma requisição.

A implementação usa somente APIs do Node no núcleo e mantém métricas em memória para que o comportamento seja reproduzível sem infraestrutura externa.

## Comportamentos verificáveis

- gera ou propaga `x-trace-id` por requisição;
- mede duração e classe de status HTTP;
- agrega contagem, erros e latência por rota;
- expõe snapshot JSON em `/metrics`;
- exporta métricas em formato Prometheus em `/metrics/prometheus`;
- produz logs JSON estruturados;
- remove valores de `Authorization`, `Cookie` e `X-API-Key` dos logs;
- possui um reporter de erro injetável com fallback noop;
- inclui `/demo/error` para validar o caminho de erro e telemetria;
- oferece health check.

## Fluxo

```text
HTTP request
   ↓
trace id
   ↓
route execution
   ↓
status + duration
   ├── in-memory metrics
   ├── structured JSON log
   └── error reporter (when needed)
   ↓
HTTP response with x-trace-id
```

## Endpoints

```text
GET /                     landing de demonstração
GET /health               health check
GET /metrics              snapshot JSON
GET /metrics/prometheus   exposição Prometheus text format
GET /demo/error           erro intencional para validar o pipeline
```

## Executando

```bash
npm ci
npm test
npm run dev
```

Depois, por exemplo:

```bash
curl -H "x-trace-id: demo-123" http://localhost:3000/health
curl http://localhost:3000/metrics
curl http://localhost:3000/metrics/prometheus
```

## Segurança de logs

O sanitizador cobre os headers sensíveis definidos no projeto (`authorization`, `cookie` e `x-api-key`). Isso demonstra o princípio, mas produção exigiria uma política de redaction mais abrangente para query strings, bodies, PII e campos de domínio.

## Limites atuais

Este projeto não pretende substituir OpenTelemetry, Prometheus, Grafana ou Sentry.

- métricas vivem apenas na memória do processo;
- não há histograma real de latência nem quantis;
- não há agregação multi-instância;
- não existe backend de logs;
- o reporter padrão não envia eventos para Sentry;
- métricas são perdidas ao reiniciar o processo.

O objetivo é tornar o pipeline observável e testável antes de conectar ferramentas externas.

## Evolução natural

- OpenTelemetry traces/metrics;
- histogramas e labels controladas;
- Prometheus/Grafana;
- reporter Sentry real;
- correlação de trace com logs distribuídos;
- política centralizada de redaction/PII;
- métricas de processo e runtime;
- dashboards e alertas.

## Qualidade

- testes automatizados com o runner nativo do Node;
- GitHub Actions CI;
- Dependabot;
- documentação de deploy, segurança e checklist de produção.

## Autor

**Douglas Silva**  
[GitHub](https://github.com/Beckerr11) · [Portfólio](https://douglasdev.tech)
