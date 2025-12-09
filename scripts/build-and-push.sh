#!/bin/bash

# ========================================================
# Build and Push Docker Images to AWS ECR
# Usage: ./build-and-push.sh
# ========================================================

set -e

echo "🚀 Starting Build and Push Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get AWS Account ID
echo -e "${YELLOW}📋 Getting AWS Account ID...${NC}"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"

if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ Failed to get AWS Account ID. Check your AWS credentials.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS Account ID: $AWS_ACCOUNT_ID${NC}"

# Login to ECR
echo -e "${YELLOW}🔐 Logging in to AWS ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ ECR login failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Successfully logged in to ECR${NC}"

# Get build tag
BUILD_TAG=$(git rev-parse --short HEAD)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
FULL_TAG="${TIMESTAMP}-${BUILD_TAG}"

echo -e "${YELLOW}🏷️  Build Tag: $FULL_TAG${NC}"

# Build Backend Image
echo -e "${YELLOW}🐳 Building Backend Docker image...${NC}"
docker build \
    -f Dockerfiles/backend.Dockerfile \
    -t shopnow-backend:latest \
    -t shopnow-backend:${FULL_TAG} \
    .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend image build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend image built successfully${NC}"

# Build Frontend Image
echo -e "${YELLOW}🐳 Building Frontend Docker image...${NC}"
docker build \
    -f Dockerfiles/frontend.Dockerfile \
    -t shopnow-frontend:latest \
    -t shopnow-frontend:${FULL_TAG} \
    .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend image build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend image built successfully${NC}"

# Tag images for ECR
echo -e "${YELLOW}🏷️  Tagging images for ECR...${NC}"

# Backend
docker tag shopnow-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/backend:latest
docker tag shopnow-backend:${FULL_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/backend:${FULL_TAG}

# Frontend
docker tag shopnow-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/frontend:latest
docker tag shopnow-frontend:${FULL_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/frontend:${FULL_TAG}

# Push Backend to ECR
echo -e "${YELLOW}📤 Pushing Backend image to ECR...${NC}"
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/backend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/backend:${FULL_TAG}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend push failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend image pushed successfully${NC}"

# Push Frontend to ECR
echo -e "${YELLOW}📤 Pushing Frontend image to ECR...${NC}"
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/frontend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/frontend:${FULL_TAG}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend push failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend image pushed successfully${NC}"

# Display summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Build and Push Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Backend Image:  ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/backend:${FULL_TAG}"
echo -e "Frontend Image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/frontend:${FULL_TAG}"
echo ""
echo -e "${YELLOW}💡 To deploy these images to EKS, run:${NC}"
echo -e "   ./scripts/deploy-to-eks.sh ${FULL_TAG}"
echo ""
