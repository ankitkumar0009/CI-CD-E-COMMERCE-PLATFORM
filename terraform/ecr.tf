# ==============================================================================
# Amazon Elastic Container Registry (ECR)
# ==============================================================================

locals {
  repositories = ["frontend", "backend"]
}

resource "aws_ecr_repository" "app" {
  for_each             = toset(locals.repositories)
  name                 = "${var.project_name}-${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Name = "${var.project_name}-${each.key}-ecr"
    Tier = each.key
  }
}

# Lifecycle Policy: Retain last 15 production images & clean up untagged images
resource "aws_ecr_lifecycle_policy" "cleanup" {
  for_each   = toset(locals.repositories)
  repository = aws_ecr_repository.app[each.key].name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire untagged images older than 7 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = {
          type = "expire"
        }
      },
      {
        rulePriority = 2
        description  = "Keep last 15 tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v", "release", "build"]
          countType     = "imageCountMoreThan"
          countNumber   = 15
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

