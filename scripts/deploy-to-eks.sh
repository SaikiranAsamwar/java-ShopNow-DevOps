#!/bin/bash

# ========================================================
# Deploy Application to AWS EKS
# Usage: ./deploy-to-eks.sh [optional-tag]
# ========================================================

set -e

echo "☸️  Starting EKS Deployment..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
CLUSTER_NAME="shopnow-cluster"
NAMESPACE="shopnow-app"
AWS_REGION="us-east-1"

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ Failed to get AWS Account ID${NC}"
    exit 1
fi

# Use provided tag or default to latest
IMAGE_TAG=${1:-latest}
echo -e "${YELLOW}🏷️  Using image tag: $IMAGE_TAG${NC}"

# Update kubeconfig
echo -e "${YELLOW}🔧 Updating kubeconfig for EKS cluster...${NC}"
aws eks update-kubeconfig --name $CLUSTER_NAME --region $AWS_REGION

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to update kubeconfig${NC}"
    exit 1
fi

# Create namespace if not exists
echo -e "${YELLOW}📦 Creating namespace...${NC}"
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMap
echo -e "${YELLOW}⚙️  Applying ConfigMap...${NC}"
kubectl apply -f k8s/configmap.yaml

# Deploy Backend
echo -e "${YELLOW}🚀 Deploying Backend...${NC}"
kubectl apply -f k8s/backend/backend-deployment.yaml
kubectl apply -f k8s/backend/backend-service.yaml

# Update backend image
kubectl set image deployment/shopnow-backend \
    -n $NAMESPACE \
    shopnow-backend=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/backend:${IMAGE_TAG}

# Deploy Frontend
echo -e "${YELLOW}🚀 Deploying Frontend...${NC}"
kubectl apply -f k8s/frontend/frontend-deployment.yaml
kubectl apply -f k8s/frontend/frontend-service.yaml

# Update frontend image
kubectl set image deployment/shopnow-frontend \
    -n $NAMESPACE \
    shopnow-frontend=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/frontend:${IMAGE_TAG}

# Wait for rollout
echo -e "${YELLOW}⏳ Waiting for Backend rollout...${NC}"
kubectl rollout status deployment/shopnow-backend -n $NAMESPACE --timeout=5m

echo -e "${YELLOW}⏳ Waiting for Frontend rollout...${NC}"
kubectl rollout status deployment/shopnow-frontend -n $NAMESPACE --timeout=5m

# Get pod status
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📊 Pod Status:${NC}"
kubectl get pods -n $NAMESPACE

echo ""
echo -e "${YELLOW}🌐 Services:${NC}"
kubectl get svc -n $NAMESPACE

echo ""
echo -e "${YELLOW}📈 HPA Status:${NC}"
kubectl get hpa -n $NAMESPACE

echo ""
echo -e "${YELLOW}🔗 Application URLs:${NC}"

# Get Load Balancer URLs
BACKEND_URL=$(kubectl get svc -n $NAMESPACE shopnow-backend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "Pending...")
FRONTEND_URL=$(kubectl get svc -n $NAMESPACE shopnow-frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "Pending...")

echo -e "Backend:  http://$BACKEND_URL"
echo -e "Frontend: http://$FRONTEND_URL"

echo ""
echo -e "${YELLOW}💡 Note: LoadBalancer URLs may take 2-3 minutes to become available${NC}"
echo ""
