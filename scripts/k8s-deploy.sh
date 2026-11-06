#!/usr/bin/env bash
# ==============================================================================
# Kubernetes Cluster Rollout & Probing Script
# ==============================================================================

set -e

NAMESPACE="ecommerce-prod"

echo "Applying Kubernetes manifests to namespace: $NAMESPACE..."

kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/ingress.yaml
kubectl apply -f kubernetes/hpa.yaml
kubectl apply -f kubernetes/pdb.yaml
kubectl apply -f kubernetes/network-policy.yaml

echo "Waiting for deployments to roll out..."
kubectl rollout status deployment/ecommerce-backend -n $NAMESPACE --timeout=120s
kubectl rollout status deployment/ecommerce-frontend -n $NAMESPACE --timeout=120s

echo "All pods are running:"
kubectl get pods -n $NAMESPACE -o wide

