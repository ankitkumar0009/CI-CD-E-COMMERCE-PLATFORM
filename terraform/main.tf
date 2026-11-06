terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.30"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  # For remote state management in S3 + DynamoDB locking:
  # backend "s3" {
  #   bucket         = "ecommerce-devops-terraform-state-us-east-1"
  #   key            = "production/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "ecommerce-terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "CloudOps-ECommerce"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Repository  = "https://github.com/ecommerce-platform/cloudops-core"
      Owner       = "DevOps-SRE-Team"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}
