#!/bin/bash

# ========================================================
# Setup AWS ECR Repositories
# Usage: ./setup-ecr.sh
# ========================================================

set -e

echo "🗂️  Setting up AWS ECR Repositories..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

AWS_REGION="us-east-1"

# Create Backend Repository
echo -e "${YELLOW}📦 Creating backend repository...${NC}"
aws ecr create-repository \
    --repository-name shopnow/backend \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    2>/dev/null || echo "Repository already exists"

# Create Frontend Repository
echo -e "${YELLOW}📦 Creating frontend repository...${NC}"
aws ecr create-repository \
    --repository-name shopnow/frontend \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    2>/dev/null || echo "Repository already exists"

# Set lifecycle policy for backend (keep last 10 images)
echo -e "${YELLOW}⚙️  Setting lifecycle policy for backend...${NC}"
aws ecr put-lifecycle-policy \
    --repository-name shopnow/backend \
    --region $AWS_REGION \
    --lifecycle-policy-text '{
        "rules": [{
            "rulePriority": 1,
            "description": "Keep last 10 images",
            "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 10
            },
            "action": {
                "type": "expire"
            }
        }]
    }' >/dev/null

# Set lifecycle policy for frontend
echo -e "${YELLOW}⚙️  Setting lifecycle policy for frontend...${NC}"
aws ecr put-lifecycle-policy \
    --repository-name shopnow/frontend \
    --region $AWS_REGION \
    --lifecycle-policy-text '{
        "rules": [{
            "rulePriority": 1,
            "description": "Keep last 10 images",
            "selection": {
                "tagStatus": "any",
                "countType": "imageCountMoreThan",
                "countNumber": 10
            },
            "action": {
                "type": "expire"
            }
        }]
    }' >/dev/null

echo ""
echo -e "${GREEN}✅ ECR repositories created successfully!${NC}"
echo ""

# List repositories
echo -e "${YELLOW}📋 Your ECR repositories:${NC}"
aws ecr describe-repositories --region $AWS_REGION --query 'repositories[?starts_with(repositoryName, `shopnow`)].repositoryUri' --output table

echo ""
