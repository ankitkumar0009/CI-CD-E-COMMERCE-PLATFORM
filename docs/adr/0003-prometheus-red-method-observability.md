# ADR 0003: Implementing the RED Method with Prometheus and Grafana

## Status
Accepted

## Context
Production web services require robust metrics to maintain high reliability and detect regressions before users are impacted. Traditional CPU/RAM host monitoring does not indicate whether users are experiencing errors or slow page loads.

## Decision
Adopt Tom Wilkie's **RED Method** (Rate, Errors, Duration) for request-driven architecture:
1. **Rate**: Count of HTTP requests instrumented with `http_requests_total` counter labeled by method, route, and status code.
2. **Errors**: Count and ratio of HTTP 5xx responses against total volume. Configured critical alert if error rate exceeds 5%.
3. **Duration**: Histogram tracking request latency distribution in seconds (`http_request_duration_seconds`) with buckets capturing p50, p90, and p95 latencies.
4. Export metrics via non-blocking `prom-client` on `/metrics` scraped every 5 seconds.

## Consequences
- Provides clear Golden Signal observability in Grafana without polling overhead.
- Alert rules in `alert.rules.yml` immediately flag service degradation.

