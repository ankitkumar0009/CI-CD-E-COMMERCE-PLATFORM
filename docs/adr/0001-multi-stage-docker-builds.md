# ADR 0001: Multi-Stage Docker Builds for Frontend and Backend

## Status
Accepted

## Context
Standard single-stage Docker builds package build-time tooling, package managers, development dependencies, compilers, and test suites into the production image. In our backend, a single-stage image exceeds 800MB and contains development tools that increase vulnerability surfaces. In the frontend, Node.js is unnecessary in production when static HTML/JS/CSS can be served with an unprivileged Nginx server.

## Decision
Implement multi-stage Docker builds across both microservices:
1. **Backend**:
   - Stage 1 (`builder`): Installs dependencies, runs automated tests (`npm test`) as a build gate, and prunes devDependencies.
   - Stage 2 (`runner`): Copies only production code onto `node:20-alpine`, runs as non-root user `USER node`, and sets up container health checks.
2. **Frontend**:
   - Stage 1 (`builder`): Compiles Vite SPA bundle.
   - Stage 2 (`runner`): Uses `nginx:1.25-alpine` to serve static assets with gzip compression, reverse proxying `/api` and `/health` requests.

## Consequences
- Image sizes reduced drastically (~38MB for frontend, ~84MB for backend).
- Vulnerability scanning with Trivy returns zero Critical/High CVEs.
- Reduced cold start and deployment rollout times in AWS EKS.

