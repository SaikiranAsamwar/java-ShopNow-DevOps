# 🚀 ShopNow E-Commerce - Complete AWS DevOps Deployment Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Prerequisites](#prerequisites)
4. [Step 1: Launch Amazon Linux EC2 Instance](#step-1-launch-amazon-linux-ec2-instance)
5. [Step 2: Connect to Your Instance](#step-2-connect-to-your-instance)
6. [Step 3: Update System & Install Basic Tools](#step-3-update-system--install-basic-tools)
7. [Step 4: Install Java 21](#step-4-install-java-21)
8. [Step 5: Install Maven](#step-5-install-maven)
9. [Step 6: Install Docker](#step-6-install-docker)
10. [Step 7: Install Git](#step-7-install-git)
11. [Step 8: Install AWS CLI](#step-8-install-aws-cli)
12. [Step 9: Install kubectl & eksctl](#step-9-install-kubectl--eksctl)
13. [Step 10: Install Jenkins](#step-10-install-jenkins)
14. [Step 11: Install SonarQube](#step-11-install-sonarqube)
15. [Step 12: Install Trivy (Security Scanner)](#step-12-install-trivy-security-scanner)
16. [Step 13: Clone Your Repository](#step-13-clone-your-repository)
17. [Step 14: Test Application Locally](#step-14-test-application-locally)
18. [Step 15: Create AWS ECR Repositories](#step-15-create-aws-ecr-repositories)
19. [Step 16: Build Docker Images](#step-16-build-docker-images)
20. [Step 17: Push Images to ECR](#step-17-push-images-to-ecr)
21. [Step 18: Create EKS Cluster](#step-18-create-eks-cluster)
22. [Step 19: Deploy Application to EKS](#step-19-deploy-application-to-eks)
23. [Step 20: Configure Jenkins Pipeline](#step-20-configure-jenkins-pipeline)
24. [Step 21: Install Prometheus & Grafana](#step-21-install-prometheus--grafana)
25. [Troubleshooting Guide](#troubleshooting-guide)
26. [Security Best Practices](#security-best-practices)

---

## 📌 Project Overview

**ShopNow E-Commerce** is a full-stack Java Spring Boot application featuring:

- **Backend**: Spring Boot 3.3.13 with Java 21 LTS
- **Frontend**: HTML5, CSS3, JavaScript (Static files served via Nginx)
- **Database**: H2 Database (In-memory for demo; can switch to PostgreSQL/MySQL)

**Deployment Architecture includes:**
- **Docker** for containerization
- **AWS ECR** for container registry
- **AWS EKS** for Kubernetes orchestration
- **Jenkins** for automated CI/CD
- **SonarQube** for code quality analysis
- **Trivy** for container security scanning
- **Prometheus & Grafana** for monitoring

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer's Machine                      │
│                    (GitHub Repository)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ git push
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            Amazon EC2 Instance (DevOps Master)              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Jenkins - CI/CD Automation                         │   │
│  │  Docker - Build Images                              │   │
│  │  Maven - Build Java Application                     │   │
│  │  SonarQube - Code Quality Analysis                  │   │
│  │  Trivy - Security Scanning                          │   │
│  │  AWS CLI - Interact with AWS Services              │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────┬──────────────────────────────────┬─────────┘
                 │                                  │
                 │                                  │
         ┌───────▼────────┐              ┌─────────▼────────┐
         │   AWS ECR      │              │    AWS EKS       │
         │ (Container     │              │  (Kubernetes)    │
         │  Registry)     │              │                  │
         │  - backend:tag │◄─────────────│  - Frontend Pod  │
         │  - frontend:tag│              │  - Backend Pod   │
         └────────────────┘              │  - Monitoring    │
                                         └──────────────────┘
```

---

## ✅ Prerequisites

Before starting, ensure you have:

1. **AWS Account** with appropriate IAM permissions
2. **AWS Access Key & Secret Key** for programmatic access
3. **GitHub Account** with repository access
4. **SSH Key Pair** for EC2 connection (`.pem` file)
5. **Internet Connection**
6. **Your GitHub Repository**: `https://github.com/SaikiranAsamwar/java-ShopNow-DevOps.git`

---

## Step 1: Launch Amazon Linux EC2 Instance

### 1.1 Open AWS Console

1. Go to [AWS Management Console](https://console.aws.amazon.com/)
2. Navigate to **EC2 Dashboard**
3. Click **Launch Instances**

### 1.2 Choose Amazon Linux 2023 AMI

1. Select **Amazon Linux 2023** (latest)
2. Choose instance type: **t3.xlarge** (4 vCPU, 16GB RAM - recommended for Jenkins + SonarQube)
3. Click **Next: Configure Instance Details**

### 1.3 Configure Instance

1. **Number of instances**: 1
2. **Network**: Default VPC
3. **Subnet**: Default subnet
4. **Auto-assign Public IP**: Enable
5. Click **Next: Add Storage**

### 1.4 Add Storage

1. **Size**: 50 GB minimum (100 GB recommended)
2. **Volume type**: gp3 (General Purpose SSD)
3. Click **Next: Add Tags**

### 1.5 Add Tags

1. Click **Add Tag**
2. **Key**: `Name`
3. **Value**: `shopnow-devops-master`
4. **Key**: `Project`
5. **Value**: `ShopNow-ECommerce`

### 1.6 Configure Security Group

Create security group `shopnow-sg`:

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS traffic |
| Custom | TCP | 8080 | 0.0.0.0/0 | Jenkins UI |
| Custom | TCP | 9000 | 0.0.0.0/0 | SonarQube UI |
| Custom | TCP | 3000 | 0.0.0.0/0 | Grafana UI |

### 1.7 Review and Launch

1. Review all settings
2. Click **Launch**
3. Select or create a key pair (download `.pem` file)
4. Click **Launch Instances**

### 1.8 Wait for Instance

Wait until **Status Checks** show **2/2 checks passed**

---

## Step 2: Connect to Your Instance

### 2.1 Get Public IP

Copy **Public IPv4 address** from EC2 console

Example: `54.123.45.67`

### 2.2 Connect via SSH (Windows PowerShell)

```powershell
# Set correct permissions
icacls "C:\path\to\your-key.pem" /inheritance:r
icacls "C:\path\to\your-key.pem" /grant:r "%USERNAME%:R"

# Connect
ssh -i "C:\path\to\your-key.pem" ec2-user@54.123.45.67
```

### 2.3 Connect via SSH (Linux/macOS)

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ec2-user@54.123.45.67
```

---

## Step 3: Update System & Install Basic Tools

```bash
# Update all packages
sudo dnf update -y

# Install essential tools
sudo dnf install -y git wget curl unzip jq vim nano tree htop
```

**Verify installations:**

```bash
git --version
curl --version
```

---

## Step 4: Install Java 21

```bash
# Install Amazon Corretto 21 (AWS's OpenJDK distribution)
sudo dnf install -y java-21-amazon-corretto-devel

# Verify installation
java -version
javac -version
```

**Expected output:**

```
openjdk version "21.0.1" 2023-10-17 LTS
OpenJDK Runtime Environment Corretto-21.0.1
```

**Set JAVA_HOME:**

```bash
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-amazon-corretto' >> ~/.bashrc
echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

## Step 5: Install Maven

```bash
# Download Maven 3.9
cd /opt
sudo wget https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz

# Extract
sudo tar -xzf apache-maven-3.9.6-bin.tar.gz
sudo mv apache-maven-3.9.6 maven

# Set environment variables
echo 'export M2_HOME=/opt/maven' >> ~/.bashrc
echo 'export PATH=$M2_HOME/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Verify
mvn -version
```

**Expected output:**

```
Apache Maven 3.9.6
Maven home: /opt/maven
Java version: 21.0.1
```

---

## Step 6: Install Docker

```bash
# Install Docker
sudo dnf install docker -y

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker ec2-user

# Activate group membership
newgrp docker

# Verify
docker --version
docker run hello-world
```

---

## Step 7: Install Git

Git is usually pre-installed. Configure it:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify
git config --list
```

---

## Step 8: Install AWS CLI

```bash
# Download AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscliv2.zip

# Extract and install
unzip awscliv2.zip
sudo ./aws/install

# Clean up
rm -rf aws awscliv2.zip

# Verify
aws --version
```

**Configure AWS credentials:**

```bash
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

**Verify:**

```bash
aws sts get-caller-identity
```

---

## Step 9: Install kubectl & eksctl

### 9.1 Install kubectl

```bash
# Download kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"

# Make executable and move
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Verify
kubectl version --client
```

### 9.2 Install eksctl

```bash
# Download eksctl
curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz"

# Extract and move
tar -xzf eksctl_Linux_amd64.tar.gz
sudo mv eksctl /usr/local/bin/

# Clean up
rm eksctl_Linux_amd64.tar.gz

# Verify
eksctl version
```

---

## Step 10: Install Jenkins

### 10.1 Add Jenkins Repository

```bash
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
```

### 10.2 Install Jenkins

```bash
sudo dnf install jenkins -y
```

### 10.3 Start Jenkins

```bash
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

### 10.4 Get Initial Admin Password

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Copy this password.

### 10.5 Access Jenkins

Open browser: `http://YOUR_EC2_IP:8080`

1. Paste initial admin password
2. Click **Install suggested plugins**
3. Create admin user
4. Click **Save and Continue**

### 10.6 Install Required Jenkins Plugins

Go to **Manage Jenkins → Plugins → Available**

Install:
- Docker Pipeline
- Kubernetes
- Amazon ECR
- SonarQube Scanner
- Git
- Pipeline Maven Integration

---

## Step 11: Install SonarQube

### 11.1 Install PostgreSQL

```bash
# Install PostgreSQL
sudo dnf install postgresql15-server postgresql15 -y

# Initialize database
sudo /usr/bin/postgresql-setup --initdb

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 11.2 Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Run these SQL commands:
CREATE USER sonar WITH ENCRYPTED PASSWORD 'sonar_pass123';
CREATE DATABASE sonarqube OWNER sonar;
GRANT ALL PRIVILEGES ON DATABASE sonarqube TO sonar;
\q
```

### 11.3 Install SonarQube

```bash
# Create directory
sudo mkdir -p /opt/sonarqube
sudo chown ec2-user:ec2-user /opt/sonarqube

# Download SonarQube
cd /opt/sonarqube
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.4.1.88267.zip

# Extract
unzip sonarqube-10.4.1.88267.zip
mv sonarqube-10.4.1.88267 sonarqube
```

### 11.4 Configure SonarQube

```bash
nano /opt/sonarqube/sonarqube/conf/sonar.properties
```

Add/uncomment these lines:

```properties
sonar.jdbc.username=sonar
sonar.jdbc.password=sonar_pass123
sonar.jdbc.url=jdbc:postgresql://localhost/sonarqube
```

### 11.5 Create SonarQube Service

```bash
sudo tee /etc/systemd/system/sonarqube.service > /dev/null <<EOF
[Unit]
Description=SonarQube
After=network.target postgresql.service

[Service]
Type=forking
User=ec2-user
ExecStart=/opt/sonarqube/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/sonarqube/bin/linux-x86-64/sonar.sh stop
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

### 11.6 Start SonarQube

```bash
sudo systemctl daemon-reload
sudo systemctl start sonarqube
sudo systemctl enable sonarqube
```

Wait 60 seconds, then access: `http://YOUR_EC2_IP:9000`

**Default credentials:**
- Username: `admin`
- Password: `admin`

Change password on first login.

---

## Step 12: Install Trivy (Security Scanner)

```bash
# Add Trivy repository
cat << EOF | sudo tee /etc/yum.repos.d/trivy.repo
[trivy]
name=Trivy repository
baseurl=https://aquasecurity.github.io/trivy-repo/rpm/releases/\$basearch/
gpgcheck=1
enabled=1
gpgkey=https://aquasecurity.github.io/trivy-repo/rpm/public.key
EOF

# Install Trivy
sudo dnf install trivy -y

# Verify
trivy --version
```

---

## Step 13: Clone Your Repository

```bash
cd ~
git clone https://github.com/SaikiranAsamwar/java-ShopNow-DevOps.git
cd java-ShopNow-DevOps
```

**Verify directory structure:**

```bash
tree -L 2
```

---

## Step 14: Test Application Locally

### 14.1 Build with Maven

```bash
mvn clean package -DskipTests
```

### 14.2 Run Application

```bash
java -jar target/ecommerce-app-1.0.0.jar
```

Application should start on port 8080.

**Test:**

```bash
curl http://localhost:8080
```

Press `Ctrl+C` to stop.

---

## Step 15: Create AWS ECR Repositories

```bash
# Create backend repository
aws ecr create-repository \
  --repository-name shopnow/backend \
  --region us-east-1

# Create frontend repository
aws ecr create-repository \
  --repository-name shopnow/frontend \
  --region us-east-1

# Verify
aws ecr describe-repositories --region us-east-1
```

---

## Step 16: Build Docker Images

```bash
cd ~/java-ShopNow-DevOps

# Build backend image
docker build -f Dockerfiles/backend.Dockerfile -t shopnow-backend:latest .

# Build frontend image
docker build -f Dockerfiles/frontend.Dockerfile -t shopnow-frontend:latest .

# Verify images
docker images | grep shopnow
```

---

## Step 17: Push Images to ECR

```bash
# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo $AWS_ACCOUNT_ID

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com

# Tag and push backend
docker tag shopnow-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/shopnow/backend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/shopnow/backend:latest

# Tag and push frontend
docker tag shopnow-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/shopnow/frontend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/shopnow/frontend:latest

# Verify
aws ecr list-images --repository-name shopnow/backend --region us-east-1
aws ecr list-images --repository-name shopnow/frontend --region us-east-1
```

---

## Step 18: Create EKS Cluster

```bash
eksctl create cluster \
  --name shopnow-cluster \
  --region us-east-1 \
  --nodegroup-name shopnow-nodes \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed
```

**⏱️ This takes 15-20 minutes.**

**Verify:**

```bash
kubectl get nodes
```

Expected: 3 nodes in `Ready` status

---

## Step 19: Deploy Application to EKS

### 19.1 Update Image URLs

```bash
cd ~/java-ShopNow-DevOps

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Update deployment files
sed -i "s/<AWS_ACCOUNT_ID>/${AWS_ACCOUNT_ID}/g" k8s/backend/backend-deployment.yaml
sed -i "s/<AWS_ACCOUNT_ID>/${AWS_ACCOUNT_ID}/g" k8s/frontend/frontend-deployment.yaml
```

### 19.2 Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMap
kubectl apply -f k8s/configmap.yaml

# Deploy backend
kubectl apply -f k8s/backend/backend-deployment.yaml
kubectl apply -f k8s/backend/backend-service.yaml

# Deploy frontend
kubectl apply -f k8s/frontend/frontend-deployment.yaml
kubectl apply -f k8s/frontend/frontend-service.yaml
```

### 19.3 Verify Deployment

```bash
# Check pods
kubectl get pods -n shopnow-app

# Check services
kubectl get svc -n shopnow-app

# Check HPA
kubectl get hpa -n shopnow-app
```

### 19.4 Get Application URLs

```bash
# Backend URL
kubectl get svc -n shopnow-app shopnow-backend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Frontend URL
kubectl get svc -n shopnow-app shopnow-frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Copy these URLs and access them in your browser.

---

## Step 20: Configure Jenkins Pipeline

### 20.1 Add AWS Credentials to Jenkins

1. Go to **Manage Jenkins → Credentials**
2. Click **Global** → **Add Credentials**
3. **Kind**: Secret text
4. **Secret**: Your AWS Account ID
5. **ID**: `aws-account-id`
6. Click **OK**

### 20.2 Configure SonarQube in Jenkins

1. Go to **Manage Jenkins → System**
2. Scroll to **SonarQube servers**
3. Click **Add SonarQube**
4. **Name**: `SonarQube`
5. **Server URL**: `http://YOUR_EC2_IP:9000`
6. **Server authentication token**: (Generate from SonarQube UI)

### 20.3 Create Pipeline Job

1. Click **New Item**
2. **Name**: `shopnow-pipeline`
3. **Type**: Pipeline
4. Click **OK**
5. Under **Pipeline**, select **Pipeline script from SCM**
6. **SCM**: Git
7. **Repository URL**: `https://github.com/SaikiranAsamwar/java-ShopNow-DevOps.git`
8. **Branch**: `*/main`
9. **Script Path**: `Jenkinsfile`
10. Click **Save**

### 20.4 Run Pipeline

1. Click **Build Now**
2. Watch the pipeline execute all stages
3. Check console output for any errors

---

## Step 21: Install Prometheus & Grafana

```bash
# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus + Grafana stack
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Verify
kubectl get pods -n monitoring
```

### 21.1 Access Grafana

```bash
# Port forward
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
```

Open: `http://YOUR_EC2_IP:3000`

**Default credentials:**
- Username: `admin`
- Password: Get from secret:

```bash
kubectl get secret -n monitoring monitoring-grafana -o jsonpath="{.data.admin-password}" | base64 --decode
```

---

## 🎉 Congratulations!

Your **ShopNow E-Commerce** application is now fully deployed with:

✅ Automated CI/CD with Jenkins
✅ Container images in AWS ECR
✅ Kubernetes deployment on AWS EKS
✅ Code quality analysis with SonarQube
✅ Security scanning with Trivy
✅ Monitoring with Prometheus & Grafana
✅ Auto-scaling with HPA

---

## Troubleshooting Guide

### Issue: Docker images not building

**Solution:**
```bash
# Check Docker service
sudo systemctl status docker

# Restart if needed
sudo systemctl restart docker
```

### Issue: Cannot push to ECR

**Solution:**
```bash
# Re-authenticate
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
```

### Issue: Pods not starting

**Solution:**
```bash
# Check pod logs
kubectl logs -n shopnow-app <pod-name>

# Describe pod
kubectl describe pod -n shopnow-app <pod-name>
```

### Issue: LoadBalancer pending

**Solution:**
Wait 2-3 minutes for AWS to provision the load balancer. Check:

```bash
kubectl get svc -n shopnow-app -w
```

---

## Security Best Practices

1. **Never commit AWS credentials** to Git
2. Use **IAM roles** for EC2 instances instead of access keys
3. Enable **VPC security groups** properly
4. Use **secrets management** (AWS Secrets Manager or Kubernetes Secrets)
5. Regular **security scanning** with Trivy
6. Keep **Docker images updated**
7. Enable **HTTPS** with SSL certificates (use AWS Certificate Manager)
8. Implement **network policies** in Kubernetes
9. Use **least privilege** IAM policies

---

## Useful Commands

```bash
# View all resources in namespace
kubectl get all -n shopnow-app

# Scale deployment
kubectl scale deployment shopnow-backend -n shopnow-app --replicas=3

# Rollback deployment
kubectl rollout undo deployment/shopnow-backend -n shopnow-app

# View logs
kubectl logs -f deployment/shopnow-backend -n shopnow-app

# Delete all resources
kubectl delete namespace shopnow-app

# Delete EKS cluster
eksctl delete cluster --name shopnow-cluster --region us-east-1
```

---

## Cost Optimization Tips

1. Use **t3.medium** for EKS nodes (cheaper than t3.large)
2. Enable **EKS cluster autoscaling**
3. Use **Spot Instances** for non-production workloads
4. Delete **unused ECR images**
5. Stop EC2 instances when not in use
6. Use **AWS Free Tier** where applicable

---

**Need Help?** 
- AWS Documentation: https://docs.aws.amazon.com
- Kubernetes Docs: https://kubernetes.io/docs
- Jenkins Docs: https://www.jenkins.io/doc

**Your deployment is complete! 🚀**
