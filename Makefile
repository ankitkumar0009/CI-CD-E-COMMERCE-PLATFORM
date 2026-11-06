# ==============================================================================
# CloudOps E-Commerce Platform - Developer & SRE Automation Makefile
# ==============================================================================

.PHONY: help install test build smoke dev-backend dev-frontend docker-up docker-down tf-init tf-plan k8s-apply k8s-status

help: ## Display available commands
	@echo "=========================================================="
	@echo "CloudOps E-Commerce Platform - Automation Commands"
	@echo "=========================================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'

# --- Local Development ---
install: ## Install dependencies for both backend and frontend
	cd backend && npm install
	cd frontend && npm install

dev-backend: ## Start Backend API with nodemon
	cd backend && npm run dev

dev-frontend: ## Start Frontend SPA with Vite
	cd frontend && npm run dev

test: ## Execute Backend Jest unit and integration tests
	cd backend && npm test

build: ## Compile Frontend Vite production distribution
	cd frontend && npm run build

smoke: ## Execute synthetic post-deployment smoke tests
	node tests/smoke-test.js

# --- Docker & Local Microservices ---
docker-up: ## Start full container stack with Docker Compose
	docker compose up --build -d

docker-down: ## Stop and remove all Docker Compose containers
	docker compose down -v

docker-logs: ## View live tail of container logs
	docker compose logs -f

# --- Terraform Infrastructure as Code ---
tf-init: ## Initialize Terraform providers and state
	cd terraform && terraform init

tf-plan: ## Generate and review Terraform execution plan
	cd terraform && terraform plan

tf-fmt: ## Format Terraform HCL files
	cd terraform && terraform fmt

# --- Kubernetes (AWS EKS) ---
k8s-apply: ## Deploy all Kubernetes manifests using Kustomize
	kubectl apply -k kubernetes/

k8s-status: ## Check status of pods, services, and HPA in ecommerce-prod
	kubectl get pods,svc,hpa,ingress -n ecommerce-prod -o wide

k8s-rollback: ## Rollback backend deployment to previous revision
	kubectl rollout undo deployment/ecommerce-backend -n ecommerce-prod

