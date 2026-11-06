# ADR 0002: Choosing AWS EKS (Kubernetes) Over AWS ECS

## Status
Accepted

## Context
When architecting container orchestration on AWS, the two primary options are Amazon Elastic Container Service (ECS) and Amazon Elastic Kubernetes Service (EKS). ECS offers lower initial operational complexity but binds workloads to proprietary AWS task definitions.

## Decision
Choose **AWS EKS (Kubernetes v1.30)** for production workload orchestration:
1. Cloud-agnostic standard declarative YAML manifests (`deployment.yaml`, `hpa.yaml`, `pdb.yaml`).
2. Native Horizontal Pod Autoscaler (HPA v2) allowing fine-grained scaling on both CPU and memory metrics.
3. Industry-standard ecosystem tooling: Helm packaging, Prometheus service scraping via annotations, and PodDisruptionBudgets.
4. Richer placement and interview relevance for DevOps, Cloud Engineer, and SRE roles.

## Consequences
- Requires Kubernetes RBAC, Ingress Controller setup, and metrics-server.
- Managed Node Groups configured via Terraform across 3 private subnets for multi-AZ fault tolerance.

