# ==============================================================================
# AWS Secrets Manager: Centralized Credential & Token Management
# ==============================================================================

resource "random_password" "jwt_secret" {
  length  = 48
  special = false
}

resource "aws_secretsmanager_secret" "app_secrets" {
  name                    = "${var.project_name}-production-secrets"
  description             = "Application secrets including database credentials and JWT secret key"
  recovery_window_in_days = 0 # Immediate deletion upon terraform destroy for demo environments

  tags = {
    Name = "${var.project_name}-secrets"
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets_val" {
  secret_id = aws_secretsmanager_secret.app_secrets.id

  secret_string = jsonencode({
    DB_HOST        = aws_db_instance.main.address
    DB_PORT        = "3306"
    DB_NAME        = var.db_name
    DB_USER        = var.db_username
    DB_PASSWORD    = random_password.db_password.result
    DATABASE_URL   = "mysql://${var.db_username}:${random_password.db_password.result}@${aws_db_instance.main.endpoint}/${var.db_name}"
    JWT_SECRET     = random_password.jwt_secret.result
    ADMIN_EMAIL    = "admin@ecommerce.io"
    ADMIN_PASSWORD = "Admin@123"
  })
}

# Policy allowing EKS Pods (via IRSA) to fetch Secrets Manager keys
resource "aws_iam_policy" "secrets_read_policy" {
  name        = "${var.project_name}-secrets-read-policy"
  description = "Allows backend service to retrieve secrets from AWS Secrets Manager"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"]
        Resource = aws_secretsmanager_secret.app_secrets.arn
      }
    ]
  })
}

