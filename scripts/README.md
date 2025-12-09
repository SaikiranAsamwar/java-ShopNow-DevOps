# ShopNow E-Commerce - Quick Start Scripts

This directory contains helper scripts for deploying your Java Spring Boot application to AWS.

## 📜 Available Scripts

### 1. `setup-ecr.sh`
Creates AWS ECR repositories for storing Docker images.

**Usage:**
```bash
chmod +x scripts/setup-ecr.sh
./scripts/setup-ecr.sh
```

**What it does:**
- Creates `shopnow/backend` repository
- Creates `shopnow/frontend` repository
- Enables image scanning on push
- Sets lifecycle policy to keep last 10 images

---

### 2. `create-eks-cluster.sh`
Creates an AWS EKS cluster with managed node groups.

**Usage:**
```bash
chmod +x scripts/create-eks-cluster.sh
./scripts/create-eks-cluster.sh
```

**What it does:**
- Creates EKS cluster named `shopnow-cluster`
- Provisions 3 t3.medium worker nodes
- Configures autoscaling (min: 2, max: 4)
- Sets up kubectl configuration
- Takes 15-20 minutes

---

### 3. `build-and-push.sh`
Builds Docker images and pushes them to ECR.

**Usage:**
```bash
chmod +x scripts/build-and-push.sh
./scripts/build-and-push.sh
```

**What it does:**
- Builds backend Docker image
- Builds frontend Docker image
- Tags images with timestamp + git commit hash
- Pushes to AWS ECR
- Displays image URIs

---

### 4. `deploy-to-eks.sh`
Deploys application to EKS cluster.

**Usage:**
```bash
chmod +x scripts/deploy-to-eks.sh
./scripts/deploy-to-eks.sh [optional-image-tag]
```

**Examples:**
```bash
# Deploy latest images
./scripts/deploy-to-eks.sh

# Deploy specific tag
./scripts/deploy-to-eks.sh 20231207-abc123
```

**What it does:**
- Updates kubectl config
- Creates namespace
- Applies ConfigMaps
- Deploys backend and frontend
- Sets up LoadBalancers
- Displays application URLs

---

### 5. `cleanup.sh`
Deletes all AWS resources (⚠️ USE WITH CAUTION!)

**Usage:**
```bash
chmod +x scripts/cleanup.sh
./scripts/cleanup.sh
```

**What it does:**
- Deletes Kubernetes namespace
- Deletes EKS cluster
- Deletes ECR repositories
- Removes local Docker images
- You must type `DELETE` to confirm

---

## 🚀 Complete Deployment Workflow

### First Time Setup

```bash
# 1. Make all scripts executable
chmod +x scripts/*.sh

# 2. Setup ECR repositories
./scripts/setup-ecr.sh

# 3. Create EKS cluster (takes 15-20 minutes)
./scripts/create-eks-cluster.sh

# 4. Build and push images
./scripts/build-and-push.sh

# 5. Deploy to EKS
./scripts/deploy-to-eks.sh
```

### Subsequent Deployments

After making code changes:

```bash
# 1. Build and push new images
./scripts/build-and-push.sh

# 2. Deploy to EKS
./scripts/deploy-to-eks.sh
```

---

## 📋 Prerequisites

Before running these scripts, ensure you have:

- [x] AWS CLI configured (`aws configure`)
- [x] Docker installed and running
- [x] kubectl installed
- [x] eksctl installed
- [x] Git installed
- [x] Proper IAM permissions for EKS, ECR, EC2

---

## 🔍 Monitoring Your Deployment

### Check pod status
```bash
kubectl get pods -n shopnow-app
```

### Check services
```bash
kubectl get svc -n shopnow-app
```

### Check deployments
```bash
kubectl get deployments -n shopnow-app
```

### View logs
```bash
# Backend logs
kubectl logs -f deployment/shopnow-backend -n shopnow-app

# Frontend logs
kubectl logs -f deployment/shopnow-frontend -n shopnow-app
```

### Get application URLs
```bash
# Backend URL
kubectl get svc -n shopnow-app shopnow-backend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Frontend URL
kubectl get svc -n shopnow-app shopnow-frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

---

## 🛠️ Troubleshooting

### ECR Login Issues
```bash
# Re-authenticate
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.us-east-1.amazonaws.com
```

### kubectl Not Connecting to Cluster
```bash
# Update kubeconfig
aws eks update-kubeconfig --name shopnow-cluster --region us-east-1
```

### Pods Not Starting
```bash
# Check pod details
kubectl describe pod <pod-name> -n shopnow-app

# Check events
kubectl get events -n shopnow-app --sort-by='.lastTimestamp'
```

### LoadBalancer Pending
Wait 2-3 minutes for AWS to provision. Check status:
```bash
kubectl get svc -n shopnow-app -w
```

---

## 💰 Cost Estimation

**Monthly AWS Costs (approximate):**
- EKS Cluster: $72/month
- EC2 Nodes (3 x t3.medium): ~$100/month
- Load Balancers: ~$20/month
- ECR Storage: ~$1/month (for small images)
- **Total: ~$193/month**

**💡 Cost Saving Tips:**
- Use Spot Instances for worker nodes
- Scale down to 2 nodes during off-hours
- Delete resources when not in use (run `cleanup.sh`)

---

## 🔒 Security Notes

- Never commit AWS credentials to Git
- Use IAM roles for EC2 instances
- Enable ECR image scanning (already configured)
- Regularly update Docker base images
- Review security groups and network policies

---

## 📚 Additional Resources

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Spring Boot on Kubernetes](https://spring.io/guides/gs/spring-boot-kubernetes/)

---

**Need help?** Check the main deployment guide: `AWS-Deployment-Guide.md`
