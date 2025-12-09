#!/bin/bash

# ========================================================
# Create EKS Cluster
# Usage: ./create-eks-cluster.sh
# ========================================================

set -e

echo "☸️  Creating AWS EKS Cluster..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CLUSTER_NAME="shopnow-cluster"
AWS_REGION="us-east-1"
NODE_TYPE="t3.medium"
MIN_NODES=2
MAX_NODES=4
DESIRED_NODES=3

echo -e "${YELLOW}📋 Cluster Configuration:${NC}"
echo -e "   Name: $CLUSTER_NAME"
echo -e "   Region: $AWS_REGION"
echo -e "   Node Type: $NODE_TYPE"
echo -e "   Nodes: $MIN_NODES - $MAX_NODES (desired: $DESIRED_NODES)"
echo ""

read -p "Do you want to proceed? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}❌ Cluster creation cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}🚀 Creating EKS cluster... This will take 15-20 minutes ☕${NC}"
echo ""

eksctl create cluster \
    --name $CLUSTER_NAME \
    --region $AWS_REGION \
    --nodegroup-name shopnow-nodes \
    --node-type $NODE_TYPE \
    --nodes $DESIRED_NODES \
    --nodes-min $MIN_NODES \
    --nodes-max $MAX_NODES \
    --managed \
    --with-oidc \
    --ssh-access \
    --ssh-public-key ~/.ssh/id_rsa.pub \
    --external-dns-access \
    --full-ecr-access \
    --appmesh-access \
    --alb-ingress-access

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Cluster creation failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ EKS Cluster created successfully!${NC}"
echo ""

# Verify cluster
echo -e "${YELLOW}🔍 Verifying cluster...${NC}"
kubectl get nodes

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Your EKS cluster is ready!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "   1. Run: ./scripts/setup-ecr.sh"
echo -e "   2. Run: ./scripts/build-and-push.sh"
echo -e "   3. Run: ./scripts/deploy-to-eks.sh"
echo ""
