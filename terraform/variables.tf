variable "aws_region" {
  description = "AWS deployment region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (e.g., production, staging, dev)"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name prefix used for resource naming"
  type        = string
  default     = "ecommerce-platform"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "cluster_name" {
  description = "Name of the AWS EKS Cluster"
  type        = string
  default     = "ecommerce-eks-cluster"
}

variable "eks_version" {
  description = "Kubernetes version for AWS EKS"
  type        = string
  default     = "1.30"
}

variable "node_instance_types" {
  description = "EC2 instance types for EKS managed node group"
  type        = list(string)
  default     = ["t3.medium", "t3.large"]
}

variable "db_instance_class" {
  description = "RDS Database instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "ecommerce_prod"
}

variable "db_username" {
  description = "Master username for RDS MySQL database"
  type        = string
  default     = "cloudops_admin"
}

variable "github_repo" {
  description = "GitHub repository (owner/repo) for OIDC IAM Role trust policy"
  type        = string
  default     = "your-username/ecommerce-devops-platform"
}

