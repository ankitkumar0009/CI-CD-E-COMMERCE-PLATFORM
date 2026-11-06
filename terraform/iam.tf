# ==============================================================================
# AWS IAM: Least-Privilege & GitHub Actions OIDC Integration (Zero Long-Lived Keys)
# ==============================================================================

# GitHub Actions OIDC Identity Provider
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1", "1c587612c255bf01fa7f5140974f70eaee77f70a"]
}

# IAM Role assumed by GitHub Actions CI/CD Workflows
resource "aws_iam_role" "github_actions" {
  name = "${var.project_name}-github-actions-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringLike = {
            "token.actions.githubusercontent.com:sub" : "repo:${var.github_repo}:*"
          }
          StringEquals = {
            "token.actions.githubusercontent.com:aud" : "sts.amazonaws.com"
          }
        }
      }
    ]
  })
}

# ECR Push & Pull Policy for CI/CD
resource "aws_iam_policy" "ci_ecr_policy" {
  name        = "${var.project_name}-ci-ecr-policy"
  description = "Allows GitHub Actions runner to push images to project ECR repositories"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ecr:GetAuthorizationToken"]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:GetRepositoryPolicy",
          "ecr:DescribeRepositories",
          "ecr:ListImages",
          "ecr:DescribeImages",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = [
          aws_ecr_repository.app["frontend"].arn,
          aws_ecr_repository.app["backend"].arn
        ]
      }
    ]
  })
}

# EKS Deployment Policy for CI/CD
resource "aws_iam_policy" "ci_eks_policy" {
  name        = "${var.project_name}-ci-eks-policy"
  description = "Allows GitHub Actions runner to update Kubernetes deployments in EKS"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
          "eks:ListClusters"
        ]
        Resource = aws_eks_cluster.main.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "github_ecr_attach" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.ci_ecr_policy.arn
}

resource "aws_iam_role_policy_attachment" "github_eks_attach" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.ci_eks_policy.arn
}

