# 🐳 Docker Implementation Architecture

This directory houses specialized containerization profiles and documentation for the CloudOps Platform.

## 📁 Compose Profiles

| File | Purpose | Ports | Launch Command |
| :--- | :--- | :--- | :--- |
| `docker-compose.yml` (Root) | Local Full Stack (Frontend, Backend, MongoDB, Prometheus, Grafana, Node-Exporter) | 3000, 5000, 9090, 3001, 27017, 9100 | `docker compose up --build` |
| `docker/docker-compose.prod.yml` | Production simulation profile pointing to ECR image repositories | 80, 443, 5000, 27017 | `docker compose -f docker/docker-compose.prod.yml up -d` |
| `docker/docker-compose.monitoring.yml` | Standalone SRE Observability Stack (Prometheus + Grafana + Node-Exporter) | 9090, 3001, 9100 | `docker compose -f docker/docker-compose.monitoring.yml up -d` |

---

## 🔒 Security & Multi-Stage Architecture

1. **Unprivileged Execution**: Both containers drop root privileges (`USER node` on backend, unprivileged Nginx on frontend).
2. **Layer Caching**: `package*.json` is copied and installed prior to copying source code to maximize Docker layer cache hits.
3. **Container Health Checks**: Both containers feature explicit `HEALTHCHECK` commands targeting HTTP endpoints (`/health` on port 5000, `/` on port 80).
4. **Vulnerability Hardening**: Built images are scanned during CI/CD using Aqua Security's Trivy.

