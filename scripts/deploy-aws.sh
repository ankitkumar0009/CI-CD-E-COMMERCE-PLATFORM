#!/usr/bin/env bash
# ==============================================================================
# AWS Cloud Deployment Script (Terraform Provisioning & EKS Rollout)
# ==============================================================================

set -e

REGION="us-east-1"
CLUSTER_NAME="ecommerce-eks-cluster"

echo -e "\033[36m==========================================================\033[0m"
echo -e "\033[36m🚀 Starting AWS Infrastructure & Application Deployment\033[0m"
echo -e "\033[36m==========================================================\033[0m"

# 1. Terraform Provisioning
echo -e "\n\033[33m[1/4] Provisioning AWS Infrastructure with Terraform...\033[0m"
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply -auto-approve tfplan

# Extract outputs
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_FRONTEND=$(terraform output -raw ecr_frontend_repository_url)
ECR_BACKEND=$(terraform output -raw ecr_backend_repository_url)
cd ..

# 2. Build & Push Docker Images to ECR
echo -e "\n\033[33m[2/4] Authenticating to Amazon ECR & Pushing Docker Images...\033[0m"
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

TAG=$(git rev-parse --short HEAD || echo "v1.0.0")

# Backend
docker build -t $ECR_BACKEND:$TAG -t $ECR_BACKEND:latest ./backend
docker push $ECR_BACKEND:$TAG
docker push $ECR_BACKEND:latest

# Frontend
docker build -t $ECR_FRONTEND:$TAG -t $ECR_FRONTEND:latest ./frontend
docker push $ECR_FRONTEND:$TAG
docker push $ECR_FRONTEND:latest

# 3. Update EKS Kubeconfig & Deploy Manifests
echo -e "\n\033[33m[3/4] Deploying to AWS EKS Cluster...\033[0m"
aws eks update-kubeconfig --name $CLUSTER_NAME --region $REGION

kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/service.yaml
kubectl apply -f kubernetes/hpa.yaml
kubectl apply -f kubernetes/pdb.yaml

# Update deployment image
kubectl set image deployment/ecommerce-backend backend-api=$ECR_BACKEND:$TAG -n ecommerce-prod
kubectl set image deployment/ecommerce-frontend frontend-ui=$ECR_FRONTEND:$TAG -n ecommerce-prod

# 4. Zero-Downtime Rollout Verification
echo -e "\n\033[33m[4/4] Verifying Zero-Downtime Deployment Rollout...\033[0m"
kubectl rollout status deployment/ecommerce-backend -n ecommerce-prod --timeout=180s
kubectl rollout status deployment/ecommerce-frontend -n ecommerce-prod --timeout=180s

echo -e "\n\033[32m✔ Deployment complete! Application is live on AWS EKS.\033[0m"
kubectl get services,ingress -n ecommerce-prod

