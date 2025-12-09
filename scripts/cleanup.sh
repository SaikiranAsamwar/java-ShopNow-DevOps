#!/bin/bash

# ========================================================
# Cleanup AWS Resources
# Usage: ./cleanup.sh
# WARNING: This will delete all resources!
# ========================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

CLUSTER_NAME="shopnow-cluster"
AWS_REGION="us-east-1"
NAMESPACE="shopnow-app"

echo -e "${RED}⚠️  WARNING: This will delete ALL resources!${NC}"
echo -e "${YELLOW}Resources to be deleted:${NC}"
echo -e "   - EKS Cluster: $CLUSTER_NAME"
echo -e "   - ECR Repositories"
echo -e "   - All deployed applications"
echo ""

read -p "Are you ABSOLUTELY sure? Type 'DELETE' to confirm: " CONFIRM

if [ "$CONFIRM" != "DELETE" ]; then
    echo -e "${GREEN}✅ Cleanup cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🗑️  Starting cleanup process...${NC}"

# Delete Kubernetes resources
echo -e "${YELLOW}📦 Deleting Kubernetes resources...${NC}"
kubectl delete namespace $NAMESPACE --ignore-not-found=true || true

# Delete EKS cluster
echo -e "${YELLOW}☸️  Deleting EKS cluster... This may take 10-15 minutes${NC}"
eksctl delete cluster --name $CLUSTER_NAME --region $AWS_REGION --wait

# Delete ECR repositories
echo -e "${YELLOW}🗂️  Deleting ECR repositories...${NC}"
aws ecr delete-repository \
    --repository-name shopnow/backend \
    --region $AWS_REGION \
    --force \
    2>/dev/null || true

aws ecr delete-repository \
    --repository-name shopnow/frontend \
    --region $AWS_REGION \
    --force \
    2>/dev/null || true

# Clean up local Docker images
echo -e "${YELLOW}🐳 Cleaning up local Docker images...${NC}"
docker rmi $(docker images 'shopnow*' -q) 2>/dev/null || true
docker system prune -f

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Cleanup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}All AWS resources have been deleted.${NC}"
echo ""
