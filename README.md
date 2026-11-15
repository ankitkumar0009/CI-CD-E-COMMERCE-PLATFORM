# 🛒 Production E-Commerce Product & Order Management API

> **A Cloud-Native, High-Reliability Backend & DevOps Showcase for Hackathons and Internship Assessments**  
> Built with **FastAPI**, **SQLAlchemy 2.0**, **PostgreSQL 16**, **Docker Compose**, **GitHub Actions CI**, and **Alembic**.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16--alpine-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-v2+-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![CI Pipeline](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)](#7-ci-pipeline-github-actions)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20Bcrypt%20%2B%20Trivy-E0234E?style=flat-square&logo=trivy&logoColor=white)](#8-security--observability)

---

## 📋 Table of Contents
1. [Project Overview & Key Highlights](#1-project-overview--key-highlights)
2. [Architectural Diagrams](#2-architectural-diagrams)
   - [System Architecture](#system-architecture)
   - [Database Entity-Relationship (ER) Diagram](#database-entity-relationship-er-diagram)
   - [Order Idempotency & Stock Row-Locking Flow](#order-idempotency--stock-row-locking-flow)
   - [GitHub Actions CI Pipeline Workflow](#github-actions-ci-pipeline-workflow)
3. [Technology Stack & Decisions](#3-technology-stack--decisions)
4. [Prerequisites & Quickstart](#4-prerequisites--quickstart)
5. [Interactive API Documentation (Swagger & OpenAPI)](#5-interactive-api-documentation-swagger--openapi)
6. [API Endpoints Reference & Examples](#6-api-endpoints-reference--examples)
7. [Automated Testing Suite (Pytest)](#7-automated-testing-suite-pytest)
8. [Idempotency & Concurrent Order Safety Guide](#8-idempotency--concurrent-order-safety-guide)
9. [DevOps Operations Runbook](#9-devops-operations-runbook)
   - [Database Backup (Linux & Windows PowerShell)](#database-backup)
   - [Database Restore & Verification](#database-restore--verification)
   - [Alembic Schema Rollback & Health Probe](#alembic-schema-rollback--health-probe)
10. [Security, Audit Logging & Prometheus Metrics](#10-security-audit-logging--prometheus-metrics)

---

## 1. Project Overview & Key Highlights

This application is an enterprise-grade backend service designed to manage product catalogs and process customer orders with **zero duplicate transactions**, **strict inventory atomicity**, and **production operational capabilities**.

### ✨ Highlights
- **100% Local Containerized Execution**: Runs entirely on Windows / Linux via Docker Desktop without requiring local PostgreSQL installation or cloud dependencies (AWS, Azure, GCP).
- **Hardened Order Idempotency**: Guarantees that network retries or double clicks using the `Idempotency-Key` HTTP header never result in duplicate orders or double billing.
- **Pessimistic Row Locking (`SELECT ... FOR UPDATE`)**: Eliminates race conditions and guarantees stock count cannot fall below zero during concurrent checkouts.
- **Role-Based Access Control (RBAC)**: Secure admin endpoints guarded by JWT authentication (HS256) with bcrypt password hashing.
- **Audit Logging**: Structured JSON logs and dedicated database audit trails for all sensitive administrator actions.
- **Zero-Downtime Operations**: Automated database backups, one-command schema restores, and Alembic rollback scripts for both Windows PowerShell and Linux Bash.
- **Continuous Integration (CI)**: GitHub Actions workflow running Ruff linting, Pytest test suites, Docker image builds, and Trivy security scanning.

---

## 2. Architectural Diagrams

### System Architecture
```
+-----------------------------------------------------------------------------------+
|                                 CLIENT APPLICATIONS                               |
|              (Browser / Swagger UI / Mobile / Postman / cURL CLI)                  |
+-----------------------------------------------------------------------------------+
                                         |
                                         | HTTP / REST (Port 8000)
                                         v
+-----------------------------------------------------------------------------------+
|                           DOCKER COMPOSE NETWORK BRIDGE                           |
|                               (ecommerce-network)                                 |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                     FastAPI Application Container                           |  |
|  |                           (ecommerce-api)                                   |  |
|  |                                                                             |  |
|  |  +-------------------------+      +--------------------------------------+  |  |
|  |  | Request Logging &       |      | Security / RBAC Middleware           |  |  |
|  |  | Correlation ID (UUID)   | ---> | (JWT Bearer Token Validation)        |  |  |
|  |  +-------------------------+      +--------------------------------------+  |  |
|  |               |                                      |                      |  |
|  |               v                                      v                      |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  |                          Routers & Endpoints                          |  |  |
|  |  |  * /health & /ready probes       * /api/products (Public Catalog)     |  |  |
|  |  |  * /metrics (Prometheus)         * /api/orders (Idempotent Checkout)  |  |  |
|  |  |  * /api/admin/* (Protected)      * /api/admin/audit-logs              |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |                                      |                                      |  |
|  |                                      v                                      |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  |                        Domain Services & Repositories                 |  |  |
|  |  |   OrderService (Locking, Idempotency) | ProductService (Validation)   |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |                                      |                                      |  |
|  |                                      v                                      |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  |                  SQLAlchemy 2.0 ORM + Alembic Migrations              |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  +--------------------------------------|--------------------------------------+  |
|                                         |                                         |
|                                         | TCP / PostgreSQL Protocol (Port 5432)   |
|                                         v                                         |
|  +-----------------------------------------------------------------------------+  |
|  |                     PostgreSQL Database Container                           |  |
|  |                        (postgres:16-alpine)                                 |  |
|  |                                                                             |  |
|  |   [ecommerce_db]                                                            |  |
|  |   * products                * orders               * order_items            |  |
|  |   * idempotency_records     * admin_users          * audit_logs             |  |
|  +-----------------------------------------------------------------------------+  |
|                                         |                                         |
|                                         v                                         |
|                        +---------------------------------+                        |
|                        | Persistent Docker Named Volume  |                        |
|                        |     (ecommerce_postgres_data)   |                        |
|                        +---------------------------------+                        |
+-----------------------------------------------------------------------------------+
```

---

### Database Entity-Relationship (ER) Diagram
```
  +--------------------------------+                  +--------------------------------+
  |            products            |                  |             orders             |
  +--------------------------------+                  +--------------------------------+
  | PK  id           INT           | 1              * | PK  id               INT       |
  |     sku          VARCHAR(64)   |<----+            |     order_number     VARCHAR   |
  |     name         VARCHAR(255)  |     |            |     idempotency_key  VARCHAR   |
  |     description  TEXT          |     |            |     customer_name    VARCHAR   |
  |     price        NUMERIC(12,2) |     |            |     customer_email   VARCHAR   |
  |     stock        INT (>= 0)    |     |            |     shipping_address TEXT      |
  |     category     VARCHAR(100)  |     |            |     total_amount     NUMERIC   |
  |     is_active    BOOLEAN       |     |            |     status           VARCHAR   |
  |     created_at   TIMESTAMPTZ   |     |            |     created_at       TIMESTAMPTZ|
  +--------------------------------+     |            +--------------------------------+
                                         |                             | 1
                                         |                             |
                                         |                             v *
                                         |            +--------------------------------+
                                         |            |          order_items           |
                                         |            +--------------------------------+
                                         +------------| FK  product_id   INT           |
                                                      | FK  order_id     INT           |
                                                      |     product_name VARCHAR(255)  |
                                                      |     unit_price   NUMERIC(12,2) |
                                                      |     quantity     INT (>= 1)    |
                                                      |     subtotal     NUMERIC(12,2) |
                                                      +--------------------------------+

  +--------------------------------+                  +--------------------------------+
  |          admin_users           |                  |      idempotency_records       |
  +--------------------------------+                  +--------------------------------+
  | PK  id           INT           |                  | PK  id             INT         |
  |     username     VARCHAR(64)   |                  |     key            VARCHAR(255)|
  |     email        VARCHAR(255)  |                  |     request_hash   VARCHAR(64) |
  |     password_hash VARCHAR(255) |                  |     response_code  INT         |
  |     full_name    VARCHAR(255)  |                  |     response_body  JSONB/TEXT  |
  |     is_active    BOOLEAN       |                  |     created_at     TIMESTAMPTZ |
  |     created_at   TIMESTAMPTZ   |                  +--------------------------------+
  +--------------------------------+
                 | 1
                 v *
  +--------------------------------+
  |           audit_logs           |
  +--------------------------------+
  | PK  id           INT           |
  | FK  actor_id     INT           |
  |     actor_name   VARCHAR(100)  |
  |     action       VARCHAR(100)  |
  |     resource     VARCHAR(100)  |
  |     details      JSONB/TEXT    |
  |     created_at   TIMESTAMPTZ   |
  +--------------------------------+
```

---

### Order Idempotency & Stock Row-Locking Flow
```
 Client POST /api/orders with Header "Idempotency-Key: ecom-key-1234"
                 |
                 v
   Has Idempotency-Key been recorded?
        /                  \
      YES                  NO
      /                      \
  Compare Request Hash       Begin DB Transaction & Lock
  with stored SHA-256        `SELECT ... FOR UPDATE` on each Product
    /             \                     |
  MATCH       MISMATCH       Check if (stock >= requested_qty)
   /                 \                  |
Return Cached     Return 409          YES ----> NO: Raise 400 Insufficient Stock
Response (201)    Conflict Error        |
(Zero Stock (Key reused with      Deduct Stock: stock = stock - qty
 Deduction)   diff payload)       Insert Order & OrderItems Snapshot
                                  Save Idempotency Record & Cache Payload
                                  Commit Transaction
                                  Return 201 Created Order
```

---

### GitHub Actions CI Pipeline Workflow
```
Developer Push / Pull Request to main
                 |
                 v
+--------------------------------------------------------------------------------+
|                        STAGE 1: CODE QUALITY & TESTING                         |
|                                                                                |
|  1. Checkout Repo & Cache Python 3.12                                          |
|  2. Install dependencies: pip install -r requirements.txt                      |
|  3. Ruff Linting: ruff check app tests scripts                                 |
|  4. Ruff Formatting Check: ruff format --check app tests scripts              |
|  5. Pytest Execution: pytest tests -v                                          |
|     (Health, Products, Orders, Idempotency Replay & Conflict, Admin, Audit)    |
+--------------------------------------------------------------------------------+
                 |
                 | (Only on Green Status)
                 v
+--------------------------------------------------------------------------------+
|                    STAGE 2: CONTAINER BUILD & SECURITY SCAN                    |
|                                                                                |
|  1. Multi-Stage Docker Build: docker build -t ecommerce-api:${{ sha }} .       |
|  2. Trivy Container Image Scan (Critical & High CVEs)                          |
|  3. Trivy Filesystem Scan (Misconfigurations & Hardcoded Secrets)              |
|  4. Publish CI Step Summary to GitHub PR / Commit                              |
+--------------------------------------------------------------------------------+
```

---

## 3. Technology Stack & Decisions

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | FastAPI 0.111+ | High throughput async ASGI framework with automatic OpenAPI 3.0 schema generation |
| **ORM** | SQLAlchemy 2.0 | Explicit 2.0 typing style, connection pooling, and pessimistic locking (`with_for_update`) |
| **Database** | PostgreSQL 16 Alpine | ACID compliance, check constraints, sub-second relational operations |
| **Migrations** | Alembic 1.13+ | Version-controlled, deterministic database schema evolution and rollbacks |
| **Authentication** | JWT (HS256) + Passlib/Bcrypt | Stateless token authentication with salted hashing for administrators |
| **Testing** | Pytest + SQLite StaticPool | Isolated, ultra-fast in-memory test runner without external dependencies |
| **Containerization**| Docker + Docker Compose | Non-root security user, multi-stage builds, and self-healing healthchecks |
| **Quality & Security**| Ruff + Trivy | Lightning-fast Python linting and container vulnerability vulnerability scanning |

---

## 4. Prerequisites & Quickstart

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running on Windows or Linux with Compose v2 enabled)
- (Optional for host testing) Python 3.12+

### 🚀 One-Command Launch

1. **Clone and navigate to repository**:
   ```bash
   cd "Cloud Deployment & CICD – E-Commerce Platform"
   ```

2. **Launch PostgreSQL and FastAPI services**:
   ```bash
   docker compose up --build -d
   ```

3. **Verify running containers**:
   ```bash
   docker compose ps
   ```
   *Expected Output:*
   ```text
   NAME                 IMAGE                COMMAND                  SERVICE    STATUS
   ecommerce-api        ecommerce-api:latest "/app/docker-entrypo…"   api        running (healthy)
   ecommerce-postgres   postgres:16-alpine   "docker-entrypoint.s…"   postgres   running (healthy)
   ```

4. **Verify application logs**:
   ```bash
   docker logs ecommerce-api
   ```

5. **Stop stack safely**:
   ```bash
   docker compose down
   ```

---

## 5. Interactive API Documentation (Swagger & OpenAPI)

Once the container stack is running:
- **Swagger UI Interactive Explorer**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Technical Specification**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI 3.1 JSON Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 6. API Endpoints Reference & Examples

The application exposes 14 production REST endpoints across 4 domains:

### 1. Observability & Health Probes
| Method | Path | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Container liveness probe | Public |
| `GET` | `/ready` | Database readiness check & ping | Public |
| `GET` | `/metrics` | Prometheus metrics scrape target | Public |

### 2. Public Product Catalog
| Method | Path | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | List active products with pagination | `page`, `page_size`, `category`, `search`, `min_price`, `max_price` |
| `GET` | `/api/products/{id}` | Retrieve product details by ID | None |

### 3. Idempotent Order Management
| Method | Path | Description | Headers |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Create customer order with stock deduction | `Idempotency-Key` (Optional/Recommended) |
| `GET` | `/api/orders/{id}` | Fetch order details, snapshot & items | None |

### 4. Admin Management (RBAC Guarded)
| Method | Path | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Authenticate admin & receive JWT | Public |
| `POST` | `/api/admin/products` | Create new catalog product | Bearer Token |
| `PUT` | `/api/admin/products/{id}` | Update product information | Bearer Token |
| `PATCH`| `/api/admin/products/{id}/stock`| Adjust inventory (`add`, `subtract`, `set`) | Bearer Token |
| `GET` | `/api/admin/audit-logs` | Query administrative audit trail | Bearer Token |

---

## 7. Automated Testing Suite (Pytest)

The test suite contains exhaustive test coverage implemented using an isolated SQLite in-memory engine with `StaticPool`.

### Running Tests Locally
```bash
# If Python 3.12 is installed locally
pytest tests -v
```

### Running Tests Inside Docker
```bash
docker exec -it ecommerce-api pytest tests -v
```

### Test Coverage Summary:
- ✅ `tests/test_health.py`: Liveness, database ping, Prometheus metrics, and root greeting.
- ✅ `tests/test_products.py`: Catalog listing, case-insensitive search, price filters, category filters, and 404 validation.
- ✅ `tests/test_orders.py`: Single and multi-item order checkout, price calculation from DB, insufficient inventory rejection (400), invalid product ID (404), invalid quantity (<= 0).
- ✅ `tests/test_idempotency.py`: Replay with identical key returns cached response and never deducts stock twice; key reuse with mismatched payload returns 409 Conflict.
- ✅ `tests/test_admin.py`: Login credentials verification, unauthorized route protection (401), product creation, updating, stock manipulation (`add`, `subtract`, `set`), and negative stock prevention.
- ✅ `tests/test_audit_logs.py`: Records created on admin login, product creation, stock updates, filtering by action, and unauthorized access prevention.

---

## 8. Idempotency & Concurrent Order Safety Guide

### How Idempotency Works

1. **Submit Order with Idempotency Key**:
   ```bash
   curl -X POST "http://localhost:8000/api/orders" \
     -H "Content-Type: application/json" \
     -H "Idempotency-Key: idempotency-demo-key-1001" \
     -d '{
       "customer_name": "Alice Johnson",
       "customer_email": "alice@example.com",
       "shipping_address": "452 Silicon Ave, Tech District, Bengaluru",
       "items": [
         {"product_id": 1, "quantity": 2}
       ]
     }'
   ```
   *Response (HTTP 201 Created)*:
   ```json
   {
     "id": 1,
     "order_number": "ORD-20261115-A1B2C3D4",
     "total_amount": "49998.00",
     "status": "CONFIRMED",
     "items": [
       {
         "product_id": 1,
         "product_name": "Sony WH-1000XM5 Wireless Headphones",
         "unit_price_snapshot": "24999.00",
         "quantity": 2,
         "subtotal": "49998.00"
       }
     ]
   }
   ```
   *Product 1 stock decreases from 10 to 8.*

2. **Re-submit the Exact Same Request (Network Retry Simulation)**:
   ```bash
   curl -X POST "http://localhost:8000/api/orders" \
     -H "Content-Type: application/json" \
     -H "Idempotency-Key: idempotency-demo-key-1001" \
     -d '{
       "customer_name": "Alice Johnson",
       "customer_email": "alice@example.com",
       "shipping_address": "452 Silicon Ave, Tech District, Bengaluru",
       "items": [
         {"product_id": 1, "quantity": 2}
       ]
     }'
   ```
   *Response (HTTP 201 Replay)*: Returns the exact identical order output.
   **Crucial Verification**: Product 1 stock **remains 8**! Inventory is not deducted twice.

3. **Re-use Key with Different Payload (Fraud / Collision Simulation)**:
   ```bash
   curl -X POST "http://localhost:8000/api/orders" \
     -H "Content-Type: application/json" \
     -H "Idempotency-Key: idempotency-demo-key-1001" \
     -d '{
       "customer_name": "Alice Johnson",
       "customer_email": "alice@example.com",
       "shipping_address": "Different Address",
       "items": [
         {"product_id": 1, "quantity": 5}
       ]
     }'
   ```
   *Response (HTTP 409 Conflict)*:
   ```json
   {
     "detail": "Idempotency key 'idempotency-demo-key-1001' has already been used with a different request payload."
   }
   ```

---

## 9. DevOps Operations Runbook

Production-tested automation scripts are provided in `scripts/` for both Linux/macOS Bash and Windows PowerShell.

### Database Backup
Generates a timestamped `.sql` dump from the active container without interrupting service.

- **Windows PowerShell**:
  ```powershell
  .\scripts\backup.ps1
  ```
- **Linux / Git Bash**:
  ```bash
  chmod +x scripts/backup.sh
  ./scripts/backup.sh
  ```
*Output stored in: `backups/backup_ecommerce_db_YYYYMMDD_HHMMSS.sql`*

---

### Database Restore & Verification
Restores the database schema and data from a backup and validates table counts.

- **Windows PowerShell**:
  ```powershell
  # Restore the latest backup automatically
  .\scripts\restore.ps1

  # Or restore a specific backup file
  .\scripts\restore.ps1 -BackupFilePath "backups\backup_ecommerce_db_20261115_120000.sql"
  ```
- **Linux / Git Bash**:
  ```bash
  chmod +x scripts/restore.sh
  ./scripts/restore.sh backups/backup_ecommerce_db_20261115_120000.sql
  ```

---

### Alembic Schema Rollback & Health Probe
Rolls back database migrations via Alembic inside the running container, restarts the application service, and probes `/health` and `/ready` with automatic retries.

- **Windows PowerShell**:
  ```powershell
  # Roll back 1 migration step
  .\scripts\rollback.ps1 -TargetRevision "-1"
  ```
- **Linux / Git Bash**:
  ```bash
  chmod +x scripts/rollback.sh
  ./scripts/rollback.sh -1
  ```

---

## 10. Security, Audit Logging & Prometheus Metrics

### Security & Sanitization
- Passwords hashed using standard `bcrypt` with salt rounds.
- Non-root container user (`appuser:appgroup`, UID 1001).
- JSON logging middleware masks sensitive headers and keys (`password`, `authorization`, `token`, `secret`).
- Correlation tracking using `X-Request-ID` across every HTTP request and log entry.

### Structured JSON Log Example
```json
{
  "timestamp": "2026-11-15T19:55:00.123456Z",
  "level": "INFO",
  "logger": "app.middleware.logging",
  "request_id": "4b619420-a7d1-4be0-8677-7681f21db591",
  "method": "POST",
  "path": "/api/orders",
  "status_code": 201,
  "duration_ms": 14.82,
  "client_ip": "172.20.0.1"
}
```

### Prometheus Metrics Scrape Target
Metrics are scraped at `GET /metrics`. Key metrics tracked:
- `http_requests_total{method="POST", path="/api/orders", status="201"}`
- `http_request_duration_seconds_bucket{le="0.1"}`
- `orders_created_total`
- `inventory_deductions_total`

---

## 👨‍💻 Hackathon & Assessment Submission Notes
- **Local Isolation**: Designed specifically to run on local Windows workstations without installing PostgreSQL or Python directly on the host system.
- **Enterprise Standards**: Follows clean architecture (Separation of Concerns: Models, Schemas, Repositories, Services, Routers, and Middleware).
- **Zero Cloud Costs**: All features, databases, migrations, and tests run 100% locally on Docker Desktop and GitHub Actions.
