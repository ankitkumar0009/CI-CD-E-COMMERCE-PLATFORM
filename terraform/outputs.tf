output "aws_region" {
  description = "Deployed AWS Region"
  value       = var.aws_region
}

output "vpc_id" {
  description = "VPC Identifier"
  value       = aws_vpc.main.id
}

output "eks_cluster_name" {
  description = "EKS Cluster Name"
  value       = aws_eks_cluster.main.name
}

output "eks_cluster_endpoint" {
  description = "EKS Control Plane Endpoint"
  value       = aws_eks_cluster.main.endpoint
}

output "ecr_frontend_repository_url" {
  description = "ECR Frontend Repository URL"
  value       = aws_ecr_repository.app["frontend"].repository_url
}

output "ecr_backend_repository_url" {
  description = "ECR Backend Repository URL"
  value       = aws_ecr_repository.app["backend"].repository_url
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS Name"
  value       = aws_lb.main.dns_name
}

output "rds_endpoint" {
  description = "Amazon RDS Database Endpoint"
  value       = aws_db_instance.main.endpoint
}

output "s3_assets_bucket" {
  description = "S3 Static Assets Bucket Name"
  value       = aws_s3_bucket.assets.id
}

output "cloudfront_domain_name" {
  description = "CloudFront CDN Distribution Domain"
  value       = aws_cloudfront_distribution.cdn.domain_name
}

output "github_actions_role_arn" {
  description = "IAM Role ARN for GitHub Actions OIDC Authentication"
  value       = aws_iam_role.github_actions.arn
}

output "secrets_manager_secret_arn" {
  description = "AWS Secrets Manager Secret ARN"
  value       = aws_secretsmanager_secret.app_secrets.arn
}
