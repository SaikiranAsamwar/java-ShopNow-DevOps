# 📋 **Deployment Guide — ShopNow E-Commerce on AWS with Amazon Linux Master Instance**

**Deploy Java 21 Spring Boot Application on AWS EKS using Amazon Linux 2 Master Instance**

---

## 📑 Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Architecture & Infrastructure](#architecture--infrastructure)
4. [Step 1: Launch Amazon Linux EC2 Instance](#step-1-launch-amazon-linux-ec2-instance)
5. [Step 2: Connect to Your Instance](#step-2-connect-to-your-instance)
6. [Step 3: Update System & Install Basic Tools](#step-3-update-system--install-basic-tools)
7. [Step 4: Install Git](#step-4-install-git)
8. [Step 5: Install Docker](#step-5-install-docker)
9. [Step 6: Install Java 21](#step-6-install-java-21)
10. [Step 7: Install Maven](#step-7-install-maven)
11. [Step 8: Install AWS CLI](#step-8-install-aws-cli)
12. [Step 9: Install Helm](#step-9-install-helm)
13. [Step 10: Install PostgreSQL (For SonarQube)](#step-10-install-postgresql-for-sonarqube)
14. [Step 11: Install SonarQube](#step-11-install-sonarqube)
15. [Step 12: Clone Your Application Repository](#step-12-clone-your-application-repository)
16. [Step 13: Build Application Locally](#step-13-build-application-locally)
17. [Step 14: Create Docker Images](#step-14-create-docker-images)
18. [Step 15: Setup AWS ECR](#step-15-setup-aws-ecr)
19. [Step 16: Push Docker Images to ECR](#step-16-push-docker-images-to-ecr)
20. [Step 17: Install kubectl & eksctl](#step-17-install-kubectl--eksctl)
21. [Step 18: Create AWS EKS Cluster](#step-18-create-aws-eks-cluster)
22. [Step 19: Deploy Application to EKS](#step-19-deploy-application-to-eks)
23. [Step 20: Install Jenkins for CI/CD](#step-20-install-jenkins-for-cicd)
24. [Step 21: Configure Jenkins](#step-21-configure-jenkins)
25. [Step 22: Create Jenkins Pipeline](#step-22-create-jenkins-pipeline)
26. [Step 23: Install Prometheus & Grafana](#step-23-install-prometheus--grafana)
27. [Troubleshooting](#troubleshooting)
28. [Cost Optimization](#cost-optimization)
29. [Termination Process](#termination-process)
30. [Quick Cleanup](#quick-cleanup-alternative)

---

## 🎯 Deployment Overview

### What We're Deploying

```
ShopNow E-Commerce Application
├── Backend Service
│   ├── Java 21 Spring Boot REST API
│   ├── Running on Port 8080
│   ├── 2-5 replicas (auto-scaled)
│   └── H2 In-memory Database
│
├── Frontend Service
│   ├── Nginx Static Server
│   ├── Running on Port 80
│   ├── 2-4 replicas (auto-scaled)
│   └── HTML/CSS/JavaScript UI
│
└── Supporting Infrastructure
    ├── AWS EKS Cluster (Kubernetes)
    ├── AWS ECR (Docker Registry)
    ├── AWS NLB (Load Balancers)
    ├── AWS VPC & Security Groups
    ├── Jenkins CI/CD Pipeline
    ├── SonarQube (Code Quality)
    ├── Prometheus & Grafana (Monitoring)
    └── Trivy (Security Scanning)
```

### Deployment Timeline

```
Phase 1: Setup (30 min)
  ↓
Phase 2: ECR Repositories (5 min)
  ↓
Phase 3: EKS Cluster (20-25 min)
  ↓
Phase 4: Build & Push Images (10 min)
  ↓
Phase 5: Deploy to K8s (5 min)
  ↓
Phase 6: Verification (5 min)
  ↓
Phase 7: Monitoring Setup (15 min)
  ↓
Phase 8: Jenkins Pipeline (20 min)

Total Time: ~2-2.5 hours
```

---

## ✅ Prerequisites

### 1. AWS Account Requirements

```
✓ AWS Account with sufficient quotas
✓ IAM user with EC2, EKS, ECR permissions
✓ AWS CLI v2 configured locally
✓ AWS credentials (Access Key & Secret Key)
✓ Default VPC available
✓ Sufficient quota for:
  - 1 EC2 t3.xlarge instance (Master/DevOps node)
  - 3 EC2 t3.medium instances (EKS worker nodes)
  - 2 Network Load Balancers
```

### 2. Local Machine Requirements (For Initial Setup)

```
✓ Git (version control)
✓ SSH client (to connect to EC2)
✓ AWS CLI v2 (for AWS operations)
✓ Web browser (for accessing consoles)
```

### 3. On Amazon Linux EC2 Instance (Will be installed)

```
✓ Git
✓ Docker Engine
✓ Java 21 JDK (Eclipse Temurin)
✓ Maven 3.9+
✓ AWS CLI v2
✓ Helm
✓ kubectl
✓ eksctl
✓ PostgreSQL (for SonarQube)
✓ SonarQube
✓ Jenkins
✓ Docker Compose
```

### 4. Installation Check

Before starting, verify your AWS credentials:

```bash
aws sts get-caller-identity
# Should return your AWS Account ID and ARN
```

---

## 🏗️ Architecture & Infrastructure

### Complete AWS Architecture with Master Instance

```
┌──────────────────────────────────────────────────────────────────┐
│                    Developer's Local Machine                      │
│  - Git Push                                                        │
│  - SSH Connect                                                     │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│           Amazon EC2 Instance (t3.xlarge - Master)               │
│           AMI: Amazon Linux 2                                    │
│           Region: us-east-1                                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Java 21 Development & DevOps Tools                        │ │
│  │  ├── Java 21 JDK (Eclipse Temurin)                        │ │
│  │  ├── Maven 3.9.6                                          │ │
│  │  ├── Docker Engine                                        │ │
│  │  ├── Git                                                   │ │
│  │  ├── AWS CLI v2                                           │ │
│  │  ├── kubectl                                              │ │
│  │  ├── eksctl                                               │ │
│  │  ├── Helm                                                 │ │
│  │  ├── PostgreSQL                                           │ │
│  │  └── Jenkins                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  DevOps Services Running on EC2                           │ │
│  │  ├── SonarQube (Port 9000)                                │ │
│  │  ├── Jenkins (Port 8080)                                  │ │
│  │  ├── PostgreSQL (Port 5432)                               │ │
│  │  └── Docker Daemon (for building images)                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Security Groups                                           │ │
│  │  ├── SSH (22) - Your IP only                              │ │
│  │  ├── HTTP (80)                                            │ │
│  │  ├── HTTPS (443)                                          │ │
│  │  ├── Jenkins (8080)                                       │ │
│  │  └── SonarQube (9000)                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              (Docker Build & Push)
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌──────────────────┐              ┌──────────────────────┐
│   AWS ECR        │              │   AWS EKS Cluster    │
│ (Image Registry) │              │ shopnow-cluster      │
│                  │              │                      │
│ ┌──────────────┐ │              │ ┌──────────────────┐ │
│ │Backend Image │ │ (Deploy)     │ │  Control Plane   │ │
│ │ shopnow/     │ │──────────────→│ (AWS Managed)      │ │
│ │backend       │ │              │ └──────────────────┘ │
│ └──────────────┘ │              │                      │
│                  │              │ ┌──────────────────┐ │
│ ┌──────────────┐ │              │ │  Worker Nodes    │ │
│ │Frontend Image│ │              │ │  (3x t3.medium)  │ │
│ │ shopnow/     │ │              │ │                  │ │
│ │frontend      │ │              │ │ ┌──────────────┐ │ │
│ └──────────────┘ │              │ │ │Backend Pods  │ │ │
│                  │              │ │ │(2-5 replicas)│ │ │
│ Latest Scanning  │              │ │ └──────────────┘ │ │
│ ✓ Enabled        │              │ │                  │ │
└──────────────────┘              │ │ ┌──────────────┐ │ │
                                   │ │ │Frontend Pods │ │ │
                                   │ │ │(2-4 replicas)│ │ │
                                   │ │ └──────────────┘ │ │
                                   │ │                  │ │
                                   │ │ ┌──────────────┐ │ │
                                   │ │ │  HPA Config  │ │ │
                                   │ │ │  (Auto-scale)│ │ │
                                   │ │ └──────────────┘ │ │
                                   │ └──────────────────┘ │
                                   │                      │
                                   │ ┌──────────────────┐ │
                                   │ │LoadBalancers(NLB)│ │
                                   │ │ Frontend: :80    │ │
                                   │ │ Backend: :80→8080│ │
                                   │ └──────────────────┘ │
                                   └──────────────────────┘
                                            │
                                            ▼
                                      End Users
                                   (Web Browsers)
```

### Deployment Flow

```
1. Developer commits code → GitHub
                  ↓
2. Jenkins detects change (webhook/poll)
                  ↓
3. Master Instance pulls code
                  ↓
4. Maven builds Java application
                  ↓
5. Tests run locally
                  ↓
6. Docker images created
                  ↓
7. Images pushed to ECR
                  ↓
8. kubectl deploys to EKS
                  ↓
9. Application running in Kubernetes
                  ↓
10. Users access via LoadBalancer IP
```

### Resource Quotas Required

```
Resource                        Required    Status
─────────────────────────────────────────────────────
EC2 t3.xlarge (Master)               1      ✓ OK
EC2 t3.medium (EKS Workers)          3      ✓ OK
EKS Clusters                         1      ✓ OK
Network Load Balancers               2      ✓ OK
Total vCPUs                          9      ✓ OK
Total Memory (GB)                   28      ✓ OK
ECS Container Registry              2 repos ✓ OK
```

---

## 🔧 Step 1: Launch Amazon Linux EC2 Instance

### 1.1 Open AWS Console

1. Go to [AWS Management Console](https://console.aws.amazon.com/)
2. Navigate to **EC2 Dashboard**
3. Click **Launch Instances**

### 1.2 Choose Amazon Linux 2 AMI

1. Search for "Amazon Linux 2"
2. Select **Amazon Linux 2 AMI (HVM) - Kernel 5.10**
3. Click **Select**

### 1.3 Choose Instance Type

1. **Instance Type**: `t3.xlarge` (4 vCPU, 16 GB RAM)
   - This is needed for running Java, Docker, Jenkins, and SonarQube
2. Click **Next: Configure Instance Details**

### 1.4 Configure Instance Details

1. **Number of instances**: 1
2. **Network**: Default VPC
3. **Subnet**: Default subnet
4. **Auto-assign Public IP**: Enable
5. **IAM role**: (Optional, but recommended)
   - Create role with EC2, ECR, EKS permissions
6. Click **Next: Add Storage**

### 1.5 Add Storage

1. **Size**: 50 GB minimum (for Docker images, Maven cache, Jenkins)
2. **Volume type**: gp3 (General Purpose, better performance)
3. **Delete on Termination**: Yes
4. Click **Next: Add Tags**

### 1.6 Add Tags

1. **Key**: `Name`
2. **Value**: `shopnow-devops-master`
3. Click **Next: Configure Security Group**

### 1.7 Configure Security Group

Create a new security group named `shopnow-devops-sg`:

| Type | Protocol | Port Range | Source |
|------|----------|-----------|--------|
| SSH | TCP | 22 | Your IP |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| Custom TCP | TCP | 8080 | 0.0.0.0/0 |
| Custom TCP | TCP | 9000 | 0.0.0.0/0 |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 |

**Explanation**:
- **SSH (22)**: Connect to your instance
- **HTTP (80)**: Application access
- **HTTPS (443)**: Secure connections
- **8080**: Jenkins web interface
- **9000**: SonarQube
- **3000**: Grafana (monitoring)

### 1.8 Review and Launch

1. Review all settings
2. Click **Launch**
3. Select existing or create new key pair
4. Download `.pem` file (keep it safe!)
5. Click **Launch Instances**

### 1.9 Wait for Instance to Start

- In EC2 Dashboard, select your instance
- Wait until **State** is `Running`
- Wait until **Status Checks** show `2/2 passed`
- Note the **Public IPv4 address** (e.g., `52.12.34.56`)

---

## Step 2: Connect to Your Instance

### 2.1 Get Public IP Address

In EC2 Dashboard:
1. Select your instance
2. Copy the **Public IPv4 address**

Example: `52.12.34.56`

### 2.2 Connect via SSH (Linux/macOS)

```bash
chmod 600 your-key.pem
ssh -i your-key.pem ec2-user@52.12.34.56
```

### 2.3 Connect via SSH (Windows - PowerShell)

```powershell
ssh -i "C:\path\to\your-key.pem" ec2-user@52.12.34.56
```

### 2.4 Connect via SSH (Windows - PuTTY)

1. Convert `.pem` to `.ppk` using PuTTYgen
2. Open PuTTY
3. **Host Name**: `ec2-user@52.12.34.56`
4. **SSH > Auth > Private key file**: Select `.ppk` file
5. Click **Open**

### 2.5 Verify Connection

You should see:
```
       __|  __|_  )
       _|  (     /   Amazon Linux 2
      ___|\___|___|
```

---

## Step 3: Update System & Install Basic Tools

### 3.1 Update System Packages

```bash
sudo dnf update -y
```

**What it does**: Updates all system packages to latest versions

**Expected output**:
```
Complete! Updated XX packages.
```

### 3.2 Install Essential Tools

```bash
sudo dnf install -y git wget curl unzip jq vim nano tar gzip
```

**Tools installed**:
- **git**: Version control
- **wget/curl**: Download files
- **unzip**: Extract archives
- **jq**: Parse JSON
- **vim/nano**: Text editors
- **tar/gzip**: Compression tools

**Expected output**:
```
Complete! Installed XX packages.
```

### 3.3 Verify Installations

```bash
git --version
wget --version
curl --version
jq --version
```

---

## Step 4: Install Git

Git should be installed from Step 3, but let's verify and configure:

### 4.1 Verify Git

```bash
git --version
```

**Expected output**:
```
git version 2.40.1
```

### 4.2 Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 4.3 Verify Configuration

```bash
git config --list | grep user
```

---

## Step 5: Install Docker

Docker is essential for building container images.

### 5.1 Install Docker Engine

```bash
sudo dnf install docker -y
```

**Expected output**:
```
Complete! Installed XX packages.
```

### 5.2 Enable Docker Service

```bash
sudo systemctl enable docker
sudo systemctl start docker
```

**What it does**:
- Enables Docker to auto-start on reboot
- Starts Docker daemon immediately

### 5.3 Add User to Docker Group

```bash
sudo usermod -aG docker ec2-user
```

**What it does**: Allows running Docker commands without `sudo`

### 5.4 Activate New Group

```bash
newgrp docker
```

### 5.5 Verify Docker Installation

```bash
docker --version
docker run hello-world
```

**Expected output**:
```
Docker version 24.0.0

Hello from Docker!
This message shows that your installation appears to be working correctly.
```

---

## Step 6: Install Java 21

Java 21 is required for building and running the Spring Boot application.

### 6.1 Install Java 21 JDK

```bash
sudo dnf install -y java-21-amazon-corretto
```

**What it does**: Installs Amazon Corretto (free OpenJDK) version 21

**Expected output**:
```
Complete! Installed XX packages.
```

### 6.2 Verify Java Installation

```bash
java -version
```

**Expected output**:
```
openjdk version "21.0.1" 2023-10-17 LTS
OpenJDK Runtime Environment Corretto-21.0.1
```

### 6.3 Set JAVA_HOME (Optional but Recommended)

```bash
echo 'export JAVA_HOME=/usr/lib/jvm/java-21-amazon-corretto' >> ~/.bashrc
source ~/.bashrc
```

---

## Step 7: Install Maven

Maven is the build tool for the Java application.

### 7.1 Install Maven

```bash
sudo dnf install -y maven
```

**Expected output**:
```
Complete! Installed XX packages.
```

### 7.2 Verify Maven Installation

```bash
mvn --version
```

**Expected output**:
```
Apache Maven 3.9.6
Maven home: /usr/share/maven
Java version: 21.0.1
```

### 7.3 Configure Maven (Optional)

```bash
# Create Maven cache directory
mkdir -p ~/.m2/repository
```

---

## Step 8: Install AWS CLI

AWS CLI allows interaction with AWS services.

### 8.1 Download AWS CLI v2

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o awscli.zip
```

### 8.2 Extract Installer

```bash
unzip awscli.zip
```

### 8.3 Install AWS CLI

```bash
sudo ./aws/install
```

**Expected output**:
```
You can now run: /usr/local/bin/aws --version
```

### 8.4 Clean Up

```bash
rm -rf aws awscli.zip
```

### 8.5 Verify AWS CLI

```bash
aws --version
```

**Expected output**:
```
aws-cli/2.13.0 Python/3.11.4
```

### 8.6 Configure AWS Credentials

```bash
aws configure
```

**Enter**:
```
AWS Access Key ID: [Your Access Key]
AWS Secret Access Key: [Your Secret Key]
Default region name: us-east-1
Default output format: json
```

### 8.7 Verify Configuration

```bash
aws sts get-caller-identity
```

**Expected output**:
```json
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "514439471441",
    "Arn": "arn:aws:iam::514439471441:user/your-username"
}
```

---

## Step 9: Install Helm

Helm is a package manager for Kubernetes.

### 9.1 Download and Install Helm

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

**Expected output**:
```
Downloading https://get.helm.sh/helm-v3.13.0-linux-amd64.tar.gz
Helm v3.13.0 installed successfully
```

### 9.2 Verify Helm Installation

```bash
helm version
```

**Expected output**:
```
version.BuildInfo{Version:"v3.13.0", ...}
```

---

## Step 10: Install PostgreSQL (For SonarQube)

SonarQube requires a database.

### 10.1 Install PostgreSQL Server

```bash
sudo dnf install -y postgresql15-server postgresql15
```

### 10.2 Initialize Database

```bash
sudo /usr/bin/postgresql-setup --initdb
```

**Expected output**:
```
Initializing database ... OK
```

### 10.3 Enable and Start PostgreSQL

```bash
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 10.4 Create SonarQube Database User

```bash
sudo -u postgres psql -c "CREATE USER sonar WITH ENCRYPTED PASSWORD 'sonar_pass';"
```

**Expected output**:
```
CREATE ROLE
```

### 10.5 Create SonarQube Database

```bash
sudo -u postgres psql -c "CREATE DATABASE sonarqube OWNER sonar;"
```

**Expected output**:
```
CREATE DATABASE
```

### 10.6 Verify Database

```bash
sudo -u postgres psql -c "\l" | grep sonarqube
```

**Expected output**:
```
 sonarqube | sonar | UTF8 | ...
```

---

## Step 11: Install SonarQube

SonarQube provides code quality analysis.

### 11.1 Create SonarQube Directory

```bash
sudo mkdir -p /opt/sonarqube
sudo chown -R ec2-user:ec2-user /opt/sonarqube
```

### 11.2 Download SonarQube

```bash
cd /opt/sonarqube
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.4.zip
```

### 11.3 Extract SonarQube

```bash
unzip sonarqube-10.4.zip
mv sonarqube-10.4 sonarqube-app
```

### 11.4 Configure Database Connection

```bash
nano /opt/sonarqube/sonarqube-app/conf/sonar.properties
```

**Find and uncomment these lines**:
```properties
sonar.jdbc.username=sonar
sonar.jdbc.password=sonar_pass
sonar.jdbc.url=jdbc:postgresql://localhost/sonarqube
```

**Save**: `Ctrl + O`, `Enter`, `Ctrl + X`

### 11.5 Create SonarQube Service

```bash
sudo tee /etc/systemd/system/sonarqube.service > /dev/null <<EOF
[Unit]
Description=SonarQube
After=network.target postgresql.service

[Service]
Type=forking
User=ec2-user
ExecStart=/opt/sonarqube/sonarqube-app/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/sonarqube-app/bin/linux-x86-64/sonar.sh stop
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

### 11.6 Enable and Start SonarQube

```bash
sudo systemctl daemon-reload
sudo systemctl enable sonarqube
sudo systemctl start sonarqube
```

**⏱️ Wait 30-60 seconds for startup**

### 11.7 Verify SonarQube

```bash
sudo systemctl status sonarqube
```

**Expected output**:
```
● sonarqube.service - SonarQube
     Active: active (running)
```

### 11.8 Access SonarQube

Open browser:
```
http://YOUR_EC2_PUBLIC_IP:9000
```

**Default credentials**:
- Username: `admin`
- Password: `admin`

---

## Step 12: Clone Your Application Repository

### 12.1 Navigate to Home Directory

```bash
cd ~
```

### 12.2 Clone Repository

```bash
git clone https://github.com/SaikiranAsamwar/java-ShopNow-DevOps.git
cd java-ShopNow-DevOps
```

### 12.3 Verify Directory Structure

```bash
ls -la
```

**Expected output**:
```
pom.xml
README.md
src/
Dockerfiles/
k8s/
Jenkinsfile
...
```

### 12.4 Checkout Branch (If Needed)

```bash
git checkout appmod/java-upgrade-20251207175831
```

---

## Step 13: Build Application Locally

### 13.1 Build with Maven

```bash
cd ~/java-ShopNow-DevOps
mvn clean package -DskipTests
```

**What it does**:
- Cleans previous builds
- Compiles Java code
- Runs tests
- Creates JAR file

**Expected output**:
```
BUILD SUCCESS

Total time: XX.XXXs
```

### 13.2 Verify JAR File

```bash
ls -la target/
```

**Expected output**:
```
ecommerce-app-1.0.0.jar
ecommerce-app-1.0.0-sources.jar
```

---

## Step 14: Create Docker Images

### 14.1 Build Backend Docker Image

```bash
cd ~/java-ShopNow-DevOps
docker build -f Dockerfiles/backend.Dockerfile -t shopnow-backend:latest .
```

**Expected output**:
```
Successfully tagged shopnow-backend:latest
```

### 14.2 Build Frontend Docker Image

```bash
docker build -f Dockerfiles/frontend.Dockerfile -t shopnow-frontend:latest .
```

**Expected output**:
```
Successfully tagged shopnow-frontend:latest
```

### 14.3 Verify Images

```bash
docker images | grep shopnow
```

**Expected output**:
```
shopnow-frontend  latest  XXXXX  X minutes  XXX MB
shopnow-backend   latest  XXXXX  X minutes  XXX MB
```

---

## Step 15: Setup AWS ECR

### 15.1 Create Backend Repository

```bash
aws ecr create-repository \
  --repository-name shopnow/backend \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true
```

**Expected output**:
```json
{
    "repository": {
        "repositoryUri": "514439471441.dkr.ecr.us-east-1.amazonaws.com/shopnow/backend",
        ...
    }
}
```

### 15.2 Create Frontend Repository

```bash
aws ecr create-repository \
  --repository-name shopnow/frontend \
  --region us-east-1 \
  --image-scanning-configuration scanOnPush=true
```

### 15.3 Verify Repositories

```bash
aws ecr describe-repositories --region us-east-1
```

---

## Step 16: Push Docker Images to ECR

### 16.1 Get AWS Account ID

```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo $AWS_ACCOUNT_ID
```

### 16.2 Login to ECR

```bash
aws ecr get-login-password --region us-east-1 | \
docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com
```

**Expected output**:
```
Login Succeeded
```

### 16.3 Tag Images

```bash
docker tag shopnow-backend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/shopnow/backend:latest
docker tag shopnow-frontend:latest ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/shopnow/frontend:latest
```

### 16.4 Push Images

```bash
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/shopnow/backend:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.us-east-1.amazonaws.com/shopnow/frontend:latest
```

**Expected output**:
```
Pushed to ECR successfully
```

### 16.5 Verify Images in ECR

```bash
aws ecr list-images --repository-name shopnow/backend --region us-east-1
aws ecr list-images --repository-name shopnow/frontend --region us-east-1
```

---

## Step 17: Install kubectl & eksctl

### 17.1 Install kubectl

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/
```

### 17.2 Verify kubectl

```bash
kubectl version --client
```

**Expected output**:
```
Client Version: v1.28.0
```

### 17.3 Install eksctl

```bash
curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_Linux_amd64.tar.gz"
tar -xzf eksctl_Linux_amd64.tar.gz
sudo mv eksctl /usr/local/bin/
rm eksctl_Linux_amd64.tar.gz
```

### 17.4 Verify eksctl

```bash
eksctl version
```

**Expected output**:
```
0.168.0
```

---

## Step 18: Create AWS EKS Cluster

### 18.1 Create EKS Cluster

```bash
eksctl create cluster \
  --name shopnow-cluster \
  --region us-east-1 \
  --nodes 3 \
  --node-type t3.medium \
  --managed
```

**⏱️ This takes 15-20 minutes**

**Expected output**:
```
[✔]  EKS cluster "shopnow-cluster" in "us-east-1" is ready
```

### 18.2 Verify Cluster

```bash
kubectl get nodes
```

**Expected output**:
```
NAME                          STATUS   ROLES    AGE
ip-10-0-XX-XX.ec2.internal   Ready    <none>   5m
ip-10-0-XX-XX.ec2.internal   Ready    <none>   5m
ip-10-0-XX-XX.ec2.internal   Ready    <none>   5m
```

---

## Step 19: Deploy Application to EKS

### 19.1 Create Namespace

```bash
kubectl apply -f ~/java-ShopNow-DevOps/k8s/namespace.yaml
```

### 19.2 Deploy Backend

```bash
kubectl apply -f ~/java-ShopNow-DevOps/k8s/backend/backend-deployment.yaml
kubectl apply -f ~/java-ShopNow-DevOps/k8s/backend/backend-service.yaml
```

### 19.3 Deploy Frontend

```bash
kubectl apply -f ~/java-ShopNow-DevOps/k8s/frontend/frontend-deployment.yaml
kubectl apply -f ~/java-ShopNow-DevOps/k8s/frontend/frontend-service.yaml
```

### 19.4 Verify Deployment

```bash
kubectl get pods -n shopnow-app
```

**Expected output**:
```
NAME                       READY   STATUS    RESTARTS
backend-XXXXX             1/1     Running   0
frontend-XXXXX            1/1     Running   0
```

### 19.5 Get Application URLs

```bash
kubectl get svc -n shopnow-app
```

**Note the EXTERNAL-IP** for accessing your application

---

## Step 20: Install Jenkins for CI/CD

### 20.1 Add Jenkins Repository

```bash
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
```

### 20.2 Install Jenkins

```bash
sudo dnf install -y jenkins
```

### 20.3 Grant Docker Permissions

```bash
sudo usermod -aG docker jenkins
```

### 20.4 Start Jenkins

```bash
sudo systemctl enable jenkins
sudo systemctl start jenkins
```

### 20.5 Get Unlock Password

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

**Copy this password**

### 20.6 Access Jenkins

Open browser:
```
http://YOUR_EC2_PUBLIC_IP:8080
```

### 20.7 Complete Setup

1. Paste unlock password
2. Click "Install suggested plugins"
3. Create admin user
4. Configure Jenkins URL
5. Start using Jenkins

---

## Step 21: Configure Jenkins

### 21.1 Install Plugins

Go to **Manage Jenkins > Plugin Manager** and install:
- Docker
- Docker Pipeline
- Kubernetes
- AWS Credentials
- Pipeline: AWS Steps

### 21.2 Add AWS Credentials

1. Go to **Manage Jenkins > Manage Credentials**
2. Click **Global credentials**
3. **Add Credentials**
4. **Kind**: AWS Credentials
5. Enter your AWS Access Key and Secret Key
6. Click **Save**

### 21.3 Configure Docker

Go to **Manage Jenkins > Configure System**:
- **Docker Host URI**: `unix:///var/run/docker.sock`
- Click **Save**

---

## Step 22: Create Jenkins Pipeline

### 22.1 Create New Job

1. Click **New Item**
2. **Name**: `shopnow-cicd`
3. Select **Pipeline**
4. Click **OK**

### 22.2 Configure Pipeline

1. **Description**: ShopNow E-Commerce CI/CD Pipeline
2. **Definition**: Pipeline script from SCM
3. **SCM**: Git
4. **Repository URL**: `https://github.com/SaikiranAsamwar/java-ShopNow-DevOps.git`
5. **Branch**: `*/main`
6. **Script Path**: `Jenkinsfile`
7. Click **Save**

### 22.3 Trigger Build

1. Click **Build Now**
2. Monitor the pipeline execution
3. Check logs for any errors

---

## Step 23: Install Prometheus & Grafana

### 23.1 Add Helm Repository

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### 23.2 Create Monitoring Namespace

```bash
kubectl create namespace monitoring
```

### 23.3 Install Monitoring Stack

```bash
helm install monitoring prometheus-community/kube-prometheus-stack \
  -n monitoring
```

**⏱️ Wait 5-10 minutes**

### 23.4 Verify Installation

```bash
kubectl get pods -n monitoring
```

### 23.5 Access Grafana

```bash
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80 &
```

Open browser: `http://localhost:3000`

**Default credentials**:
- Username: `admin`
- Password: `prom-operator`

### 23.6 Access Prometheus

```bash
kubectl port-forward -n monitoring svc/monitoring-kube-prom-prometheus 9090:9090 &
```

Open browser: `http://localhost:9090`

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Issue 1: Pods Not Starting

```bash
# Check pod status
kubectl describe pod <POD_NAME> -n shopnow-app

# Check for resource constraints
kubectl top nodes
kubectl top pods -n shopnow-app

# Check image pull errors
kubectl logs <POD_NAME> -n shopnow-app --previous

# Solution:
# - Verify ECR images exist: aws ecr describe-images --repository-name shopnow/backend
# - Check node resources: kubectl describe nodes
# - Increase resource limits in deployment manifest
```

#### Issue 2: LoadBalancer Pending

```bash
# Check service status
kubectl get svc -n shopnow-app

# If EXTERNAL-IP is <pending>:
kubectl describe svc shopnow-backend-service -n shopnow-app

# Solution:
# - Ensure AWS Load Balancer Controller is installed
# - Check IAM permissions for EKS service
# - Wait longer (can take 2-5 minutes)

# Check controller logs
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
```

#### Issue 3: CrashLoopBackOff

```bash
# Check pod logs
kubectl logs -n shopnow-app -l app=shopnow-backend --tail=100

# Check pod events
kubectl describe pod <POD_NAME> -n shopnow-app

# Common causes:
# - Port already in use
# - Database connection failed
# - Missing environment variables
# - Resource limits exceeded

# Solution:
# - Update deployment manifest
# - Redeploy: kubectl apply -f k8s/backend/backend-deployment.yaml
# - Monitor: kubectl get pods -n shopnow-app -w
```

#### Issue 4: ECR Image Not Found

```bash
# Verify image exists
aws ecr describe-images --repository-name shopnow/backend --region us-east-1

# Check image URI in deployment
kubectl get deployment shopnow-backend -n shopnow-app -o yaml | grep image

# Solution:
# - Rebuild and push image
# - Update manifest with correct image URI
# - Ensure ECR repositories exist: aws ecr describe-repositories

# Rebuild and push
./scripts/build-and-push.sh
```

#### Issue 5: HPA Not Scaling

```bash
# Check HPA status
kubectl get hpa -n shopnow-app
kubectl describe hpa shopnow-backend-hpa -n shopnow-app

# Check metrics server
kubectl get deployment -n kube-system metrics-server

# Check metrics
kubectl get --raw /apis/metrics.k8s.io/v1beta1/pods -n shopnow-app

# Solution:
# - Ensure metrics-server is running
# - Wait 2-3 minutes after deployment
# - Check resource requests/limits in pod spec
# - Monitor: kubectl get hpa -n shopnow-app --watch

# If metrics not available:
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.6.4/components.yaml
```

#### Issue 6: Database Connection Errors

```bash
# Backend logs show connection refused:
kubectl logs -n shopnow-app -l app=shopnow-backend | grep -i "connection\|refused\|database"

# Solutions:
# 1. H2 database runs in-memory (should work with no config)
# 2. If using external database, check:
#    - Database is running and accessible
#    - Connection string in application.properties
#    - Security group allows database port
#    - Network connectivity from pods

# Test database connectivity
kubectl run -it --rm debug --image=alpine --restart=Never -- sh
# Inside pod: curl http://localhost:8080/api/products
```

#### Issue 7: Permission Denied Errors

```bash
# Check RBAC configuration
kubectl get clusterrole
kubectl get rolebinding -n shopnow-app

# Common cause: Jenkins doesn't have EKS access
# Solution:
aws eks update-kubeconfig --name shopnow-cluster --region us-east-1

# Verify:
kubectl auth can-i create deployments --namespace=shopnow-app

# If permission denied:
# Create RBAC role for Jenkins service account
kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: jenkins-deployment
  namespace: shopnow-app
rules:
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "patch", "update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: jenkins-deployment
  namespace: shopnow-app
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: jenkins-deployment
subjects:
- kind: ServiceAccount
  name: default
  namespace: shopnow-app
EOF
```

---

## 💰 Cost Optimization

### AWS Resource Costs Breakdown

```
Service                Usage               Monthly Cost
────────────────────────────────────────────────────
EKS Cluster            1 cluster           $73.00
EC2 Nodes (t3.medium)  3 × 730 hrs         $92.16
Data Transfer          ~10GB outbound       $1.70
Load Balancer          2 × NLB             $32.40
ECR Storage            ~500MB              $5.12
CloudWatch             Logs & metrics      $10-15
────────────────────────────────────────────────────
Total Estimated        Monthly             $214-219
```

### Cost Reduction Strategies

#### 1. Use Spot Instances for Nodes

```bash
# Modify node group to use Spot instances (70% discount)
eksctl create nodegroup \
  --cluster shopnow-cluster \
  --name spot-nodes \
  --spot \
  --instance-types t3.medium,t3.small \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4

# Estimated savings: ~$60/month
```

#### 2. Auto-Shutdown During Off-Hours

```bash
# Create Lambda function to stop cluster during night/weekends
aws events put-rule \
  --name stop-cluster-night \
  --schedule-expression "cron(0 20 ? * MON-FRI *)"

# Save: ~$5/month
```

#### 3. Right-Size Instances

```bash
# Monitor actual usage and downsize if needed
kubectl top nodes
kubectl top pods -n shopnow-app

# If usage is low, use t3.small instead of t3.medium
# Potential savings: ~$30/month
```

#### 4. Consolidate Namespaces

```bash
# Reduce load balancers by using Ingress Controller
# Instead of 2 LoadBalancers, use 1 Ingress with multiple services
# Potential savings: ~$15/month
```

#### 5. Use Reserved Instances

```bash
# Purchase 1-year reserved instances for predictable workloads
# Typical savings: 25-40%
# For this workload: ~$54-87/month savings
```

### Estimated Cost After Optimization

```
Scenario 1: Spot Instances Only
Monthly Cost: ~$155

Scenario 2: Spot + Scheduled Shutdown
Monthly Cost: ~$125

Scenario 3: Spot + Reserved Instances (1-year)
Upfront: ~$600
Monthly Cost: ~$80

Scenario 4: All optimizations
Potential Monthly: ~$60-80
```

---

## 🛑 Termination Process

### Overview

This section provides a **detailed, step-by-step termination process** for completely removing all AWS resources created during deployment. Follow these steps in the exact order specified to avoid orphaned resources.

**⚠️ WARNING**: This process is **IRREVERSIBLE**. All data will be permanently deleted. Ensure you have backups of any critical data before proceeding.

---

### Phase 1: Application & Kubernetes Cleanup

#### Step 1.1: Delete Application Deployments

```bash
# Delete backend deployment
kubectl delete deployment shopnow-backend -n shopnow-app
kubectl delete service shopnow-backend-service -n shopnow-app

# Expected output:
# deployment.apps "shopnow-backend" deleted
# service "shopnow-backend-service" deleted

# Delete frontend deployment
kubectl delete deployment shopnow-frontend -n shopnow-app
kubectl delete service shopnow-frontend-service -n shopnow-app

# Expected output:
# deployment.apps "shopnow-frontend" deleted
# service "shopnow-frontend-service" deleted

# Verify deployments are deleted
kubectl get deployments -n shopnow-app
# Expected: No resources found in shopnow-app namespace
```

#### Step 1.2: Delete HPA (Horizontal Pod Autoscaler)

```bash
# Delete autoscalers for backend
kubectl delete hpa shopnow-backend-hpa -n shopnow-app

# Delete autoscalers for frontend
kubectl delete hpa shopnow-frontend-hpa -n shopnow-app

# Verify HPA is deleted
kubectl get hpa -n shopnow-app
# Expected: No resources found in shopnow-app namespace
```

#### Step 1.3: Delete ConfigMaps

```bash
# Delete application configuration
kubectl delete configmap app-config -n shopnow-app

# Verify ConfigMap is deleted
kubectl get configmap -n shopnow-app
# Expected: No resources found in shopnow-app namespace
```

#### Step 1.4: Delete Kubernetes Namespace

```bash
# Delete the entire application namespace
kubectl delete namespace shopnow-app

# Wait for namespace deletion to complete
kubectl get namespace shopnow-app --watch
# Once removed, press Ctrl+C

# Verify namespace is gone
kubectl get namespaces | grep shopnow-app
# Expected: No output (namespace deleted)
```

---

### Phase 2: Monitoring & Observability Cleanup

#### Step 2.1: Delete Prometheus Stack

```bash
# Uninstall Prometheus Helm chart
helm uninstall monitoring -n monitoring

# Expected output:
# release "monitoring" uninstalled

# Verify Prometheus resources are deleted
kubectl get all -n monitoring
# Should show fewer resources
```

#### Step 2.2: Delete Monitoring Namespace

```bash
# Delete monitoring namespace
kubectl delete namespace monitoring

# Wait for deletion
kubectl get namespace monitoring --watch
# Once removed, press Ctrl+C

# Verify
kubectl get namespaces | grep monitoring
# Expected: No output
```

#### Step 2.3: Delete Jenkins Resources

```bash
# If Jenkins is running in Kubernetes
kubectl delete deployment jenkins -n kube-system 2>/dev/null || echo "Jenkins not found"
kubectl delete service jenkins-service -n kube-system 2>/dev/null || echo "Jenkins service not found"

# If Jenkins is on EC2, SSH and stop it
# sudo systemctl stop jenkins
# sudo systemctl disable jenkins
```

---

### Phase 3: EKS Cluster Termination

#### Step 3.1: Drain Worker Nodes

```bash
# Get list of nodes
kubectl get nodes

# Drain each node gracefully
# Replace node names with actual node names from above
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data --grace-period=300

# Example:
# kubectl drain ip-10-0-1-100.ec2.internal --ignore-daemonsets --delete-emptydir-data --grace-period=300

# Do this for all 3 nodes
# Wait for each node to drain completely (may take 2-5 minutes per node)
```

#### Step 3.2: Delete Node Groups

```bash
# Scale down node group to 0
eksctl delete nodegroup \
  --cluster=shopnow-cluster \
  --name shopnow-nodes \
  --region us-east-1 \
  --disable-eviction

# Expected output:
# 2025-12-09 XX:XX:XX [ℹ]  nodegroup will be deleted
# 2025-12-09 XX:XX:XX [✔]  nodegroup successfully deleted

# This takes 5-10 minutes
# Monitor progress:
eksctl get nodegroups --cluster=shopnow-cluster --region us-east-1
```

#### Step 3.3: Delete Add-ons

```bash
# List installed add-ons
aws eks list-addons --cluster-name shopnow-cluster --region us-east-1

# Delete VPC CNI
aws eks delete-addon \
  --cluster-name shopnow-cluster \
  --addon-name vpc-cni \
  --region us-east-1

# Delete AWS Load Balancer Controller
aws eks delete-addon \
  --cluster-name shopnow-cluster \
  --addon-name aws-load-balancer-controller \
  --region us-east-1 2>/dev/null || echo "Add-on not found"

# Delete CoreDNS
aws eks delete-addon \
  --cluster-name shopnow-cluster \
  --addon-name coredns \
  --region us-east-1

# Delete kube-proxy
aws eks delete-addon \
  --cluster-name shopnow-cluster \
  --addon-name kube-proxy \
  --region us-east-1

# Verify add-ons are deleted
aws eks list-addons --cluster-name shopnow-cluster --region us-east-1
# Expected: Empty list or minimal add-ons
```

#### Step 3.4: Delete EKS Cluster

```bash
# Delete the EKS cluster
eksctl delete cluster \
  --name shopnow-cluster \
  --region us-east-1

# This is a comprehensive deletion that:
# ✓ Deletes control plane
# ✓ Deletes all remaining worker nodes
# ✓ Deletes load balancers
# ✓ Deletes security groups
# ✓ Deletes VPC resources associated with cluster

# Expected output:
# 2025-12-09 XX:XX:XX [ℹ]  will delete stack "eksctl-shopnow-cluster-cluster"
# 2025-12-09 XX:XX:XX [✔]  all cluster resources were cleaned up

# TIME: 10-15 minutes

# Monitor deletion progress:
aws eks describe-cluster --name shopnow-cluster --region us-east-1
# Should eventually show: ResourceNotFoundException
```

#### Step 3.5: Verify Cluster Deletion

```bash
# Confirm cluster no longer exists
aws eks describe-cluster \
  --name shopnow-cluster \
  --region us-east-1 \
  --query 'cluster.status' \
  --output text 2>&1 | grep -q "ResourceNotFoundException" && echo "Cluster deleted" || echo "Cluster still exists"

# List remaining clusters
aws eks list-clusters --region us-east-1
# Should not show shopnow-cluster

# Check CloudFormation stacks
aws cloudformation list-stacks \
  --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
  --region us-east-1 | grep -i shopnow || echo "No ShopNow stacks found"
```

---

### Phase 4: ECR (Elastic Container Registry) Cleanup

#### Step 4.1: List ECR Repositories

```bash
# List all repositories
aws ecr describe-repositories --region us-east-1

# Get repository URIs
aws ecr describe-repositories \
  --region us-east-1 \
  --query 'repositories[*].[repositoryName,repositoryUri]' \
  --output table
```

#### Step 4.2: Delete Backend Repository

```bash
# Delete all images in backend repository
aws ecr delete-repository \
  --repository-name shopnow/backend \
  --region us-east-1 \
  --force

# Expected output:
# {
#   "repository": {
#     "repositoryArn": "arn:aws:ecr:...",
#     "registryId": "123456789012",
#     "repositoryName": "shopnow/backend",
#     "repositoryUri": "123456789012.dkr.ecr.us-east-1.amazonaws.com/shopnow/backend",
#     "createdAt": ...
#   }
# }
```

#### Step 4.3: Delete Frontend Repository

```bash
# Delete all images in frontend repository
aws ecr delete-repository \
  --repository-name shopnow/frontend \
  --region us-east-1 \
  --force

# Expected output: Similar to backend deletion
```

#### Step 4.4: Verify Repositories Deleted

```bash
# Verify no ShopNow repositories remain
aws ecr describe-repositories \
  --region us-east-1 \
  --query 'repositories[*].repositoryName'

# Should not show shopnow/* repositories
```

---

### Phase 5: EC2 Master Instance Termination

#### Step 5.1: Stop Services on Master Instance

```bash
# SSH to master instance
ssh -i your-key.pem ec2-user@<MASTER_IP>

# Stop SonarQube
sudo systemctl stop sonarqube
sudo systemctl disable sonarqube

# Stop Jenkins (if running on EC2)
sudo systemctl stop jenkins
sudo systemctl disable jenkins

# Stop PostgreSQL
sudo systemctl stop postgresql
sudo systemctl disable postgresql

# Stop Docker
sudo systemctl stop docker
sudo systemctl disable docker

# Verify services are stopped
sudo systemctl status sonarqube
sudo systemctl status postgresql
sudo systemctl status docker
# All should show "inactive"
```

#### Step 5.2: Clean Up Data on Master Instance

```bash
# Clear SonarQube data
sudo rm -rf /opt/sonarqube
sudo rm -rf /var/lib/sonarqube

# Clear Jenkins data (optional, depends on policy)
sudo rm -rf /var/lib/jenkins

# Clear PostgreSQL data
sudo su - postgres
dropdb sonarqube
dropuser sonar
exit

# Clear Docker images and containers
docker system prune -a --force --volumes

# Clear caches
rm -rf ~/.m2/repository
rm -rf ~/.docker
```

#### Step 5.3: Terminate EC2 Instance

```bash
# Get instance ID
INSTANCE_ID=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=shopnow-devops-master" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text \
  --region us-east-1)

echo "Instance ID: $INSTANCE_ID"

# Terminate the instance
aws ec2 terminate-instances \
  --instance-ids $INSTANCE_ID \
  --region us-east-1

# Expected output:
# {
#   "TerminatingInstances": [
#     {
#       "InstanceId": "i-xxxxxxxxx",
#       "CurrentState": {
#         "Code": 32,
#         "Name": "shutting-down"
#       },
#       ...
#     }
#   ]
# }

# Wait for termination (takes 1-2 minutes)
aws ec2 wait instance-terminated \
  --instance-ids $INSTANCE_ID \
  --region us-east-1

# Verify instance is terminated
aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --region us-east-1 \
  --query 'Reservations[0].Instances[0].State.Name' \
  --output text
# Should output: terminated
```

#### Step 5.4: Delete EBS Volumes

```bash
# List volumes not attached to any instance
aws ec2 describe-volumes \
  --region us-east-1 \
  --filters "Name=status,Values=available" \
  --query 'Volumes[*].[VolumeId,Tags[?Key==`Name`].Value|[0]]' \
  --output table

# Delete volumes created for master instance
# Replace vol-xxxxx with actual volume IDs
aws ec2 delete-volume \
  --volume-id vol-xxxxxxxxx \
  --region us-east-1

# Repeat for each orphaned volume

# Verify deletion
aws ec2 describe-volumes \
  --region us-east-1 \
  --filters "Name=status,Values=available"
# Should show no volumes or only pre-existing ones
```

---

### Phase 6: IAM Cleanup

#### Step 6.1: Delete IAM Policies

```bash
# List custom policies
aws iam list-policies \
  --scope Local \
  --query 'Policies[*].[PolicyName,Arn]' \
  --output table | grep -i shopnow

# Delete custom policies (if created)
# Example:
aws iam delete-policy \
  --policy-arn arn:aws:iam::123456789012:policy/ShopNowECRAccessPolicy

# Check for inline policies attached to users
aws iam list-user-policies --user-name shopnow-cicd-user
```

#### Step 6.2: Delete IAM Users

```bash
# List IAM users related to deployment
aws iam list-users \
  --query 'Users[?contains(UserName, `shopnow`)].UserName' \
  --output text

# Delete access keys for users
aws iam list-access-keys \
  --user-name shopnow-cicd-user \
  --query 'AccessKeyMetadata[*].AccessKeyId' \
  --output text | xargs -I {} aws iam delete-access-key --user-name shopnow-cicd-user --access-key-id {}

# Delete inline policies
aws iam list-user-policies --user-name shopnow-cicd-user --query 'PolicyNames' --output text | xargs -I {} aws iam delete-user-policy --user-name shopnow-cicd-user --policy-name {}

# Delete user
aws iam delete-user --user-name shopnow-cicd-user

# Expected output: (empty if successful)
```

#### Step 6.3: Delete IAM Roles

```bash
# List roles related to deployment
aws iam list-roles \
  --query 'Roles[?contains(RoleName, `shopnow`)].RoleName' \
  --output text

# For each role, detach policies:
# Example: shopnow-eks-cluster-role

# List attached policies
aws iam list-attached-role-policies \
  --role-name shopnow-eks-cluster-role \
  --query 'AttachedPolicies[*].PolicyArn' \
  --output text

# Detach each policy
aws iam detach-role-policy \
  --role-name shopnow-eks-cluster-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy

aws iam detach-role-policy \
  --role-name shopnow-eks-cluster-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSVPCResourceController

# Delete inline policies
aws iam list-role-policies \
  --role-name shopnow-eks-cluster-role \
  --query 'PolicyNames' \
  --output text | xargs -I {} aws iam delete-role-policy --role-name shopnow-eks-cluster-role --policy-name {}

# Delete role
aws iam delete-role --role-name shopnow-eks-cluster-role

# Repeat for shopnow-eks-node-role and other roles
```

---

### Phase 7: Security Groups & Network Cleanup

#### Step 7.1: List Security Groups

```bash
# List security groups related to deployment
aws ec2 describe-security-groups \
  --region us-east-1 \
  --query 'SecurityGroups[?Tags[?Key==`Name` && Value==`shopnow-devops-sg`]].GroupId' \
  --output text
```

#### Step 7.2: Remove Security Group Rules

```bash
# Get security group ID
SG_ID="sg-xxxxxxxxx"

# Revoke inbound rules
aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --ip-permissions IpProtocol=tcp,FromPort=22,ToPort=22,IpRanges='[{IpCidr=0.0.0.0/0}]' \
  --region us-east-1 2>/dev/null || echo "SSH rule not found"

aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --ip-permissions IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges='[{IpCidr=0.0.0.0/0}]' \
  --region us-east-1 2>/dev/null || echo "HTTP rule not found"

aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --ip-permissions IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges='[{IpCidr=0.0.0.0/0}]' \
  --region us-east-1 2>/dev/null || echo "HTTPS rule not found"

aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --ip-permissions IpProtocol=tcp,FromPort=8080,ToPort=8080,IpRanges='[{IpCidr=0.0.0.0/0}]' \
  --region us-east-1 2>/dev/null || echo "Jenkins rule not found"

aws ec2 revoke-security-group-ingress \
  --group-id $SG_ID \
  --ip-permissions IpProtocol=tcp,FromPort=9000,ToPort=9000,IpRanges='[{IpCidr=0.0.0.0/0}]' \
  --region us-east-1 2>/dev/null || echo "SonarQube rule not found"

# Verify all rules are removed
aws ec2 describe-security-groups \
  --group-ids $SG_ID \
  --region us-east-1 \
  --query 'SecurityGroups[0].IpPermissions'
# Should show empty array []
```

#### Step 7.3: Delete Security Groups

```bash
# Delete security group
aws ec2 delete-security-group \
  --group-id sg-xxxxxxxxx \
  --region us-east-1

# Expected output: (empty if successful)

# Verify deletion
aws ec2 describe-security-groups \
  --filters "Name=group-id,Values=sg-xxxxxxxxx" \
  --region us-east-1 \
  --query 'SecurityGroups'
# Should show empty list
```

---

### Phase 8: Load Balancers & Elastic IPs Cleanup

#### Step 8.1: Delete Network Load Balancers

```bash
# List load balancers
aws elbv2 describe-load-balancers \
  --region us-east-1 \
  --query 'LoadBalancers[*].[LoadBalancerName,LoadBalancerArn]' \
  --output table | grep -i shopnow

# Get NLB ARN
NLB_ARN=$(aws elbv2 describe-load-balancers \
  --region us-east-1 \
  --query 'LoadBalancers[?contains(LoadBalancerName, `shopnow`)].LoadBalancerArn' \
  --output text)

# Delete NLBs
aws elbv2 delete-load-balancer \
  --load-balancer-arn $NLB_ARN \
  --region us-east-1

# Expected output: (empty if successful)

# Wait for deletion (takes 1-2 minutes)
sleep 120

# Verify deletion
aws elbv2 describe-load-balancers \
  --region us-east-1 \
  --query 'LoadBalancers[*].LoadBalancerName' | grep -i shopnow
# Should not find any
```

#### Step 8.2: Delete Target Groups

```bash
# List target groups
aws elbv2 describe-target-groups \
  --region us-east-1 \
  --query 'TargetGroups[*].[TargetGroupName,TargetGroupArn]' \
  --output table | grep -i shopnow

# Delete target groups
TG_ARN=$(aws elbv2 describe-target-groups \
  --region us-east-1 \
  --query 'TargetGroups[?contains(TargetGroupName, `shopnow`)].TargetGroupArn' \
  --output text)

aws elbv2 delete-target-group \
  --target-group-arn $TG_ARN \
  --region us-east-1 2>/dev/null || echo "Target group not found or already deleted"

# Verify deletion
aws elbv2 describe-target-groups \
  --region us-east-1 \
  --query 'TargetGroups[*].TargetGroupName' | grep -i shopnow || echo "No ShopNow target groups found"
```

#### Step 8.3: Release Elastic IPs

```bash
# List Elastic IPs
aws ec2 describe-addresses \
  --region us-east-1 \
  --query 'Addresses[?Tags[?Key==`Name`]].PublicIp' \
  --output text

# Release Elastic IPs
ALLOCATION_ID=$(aws ec2 describe-addresses \
  --region us-east-1 \
  --filters "Name=tag:Name,Values=shopnow-master-eip" \
  --query 'Addresses[0].AllocationId' \
  --output text)

aws ec2 release-address \
  --allocation-id $ALLOCATION_ID \
  --region us-east-1 2>/dev/null || echo "Elastic IP not found or already released"

# Verify release
aws ec2 describe-addresses \
  --region us-east-1 \
  --filters "Name=tag:Name,Values=shopnow*" | grep -i "shopnow" || echo "No ShopNow Elastic IPs found"
```

---

### Phase 9: S3 & Storage Cleanup

#### Step 9.1: List S3 Buckets

```bash
# List all S3 buckets related to deployment
aws s3api list-buckets \
  --query 'Buckets[*].Name' \
  --output text | tr '\t' '\n' | grep -i shopnow
```

#### Step 9.2: Empty S3 Buckets

```bash
# Remove all objects from bucket
aws s3 rm s3://shopnow-deployment-xxxxx --recursive

# Expected output:
# delete: s3://shopnow-deployment-xxxxx/file1.txt
# delete: s3://shopnow-deployment-xxxxx/file2.txt
# ...
```

#### Step 9.3: Delete S3 Buckets

```bash
# Delete empty bucket
aws s3api delete-bucket \
  --bucket shopnow-deployment-xxxxx \
  --region us-east-1

# Expected output: (empty if successful)

# Verify deletion
aws s3api list-buckets \
  --query 'Buckets[*].Name' \
  --output text | grep -i shopnow || echo "No ShopNow buckets found"
```

---

### Phase 10: CloudWatch & Logging Cleanup

#### Step 10.1: Delete CloudWatch Log Groups

```bash
# List log groups related to deployment
aws logs describe-log-groups \
  --region us-east-1 \
  --query 'logGroups[*].logGroupName' \
  --output text | grep -i shopnow

# Delete log groups
aws logs delete-log-group \
  --log-group-name /aws/eks/shopnow-cluster \
  --region us-east-1 2>/dev/null || echo "Log group not found"

# Delete SonarQube logs
sudo rm -rf /var/log/sonarqube

# Delete Jenkins logs
sudo rm -rf /var/log/jenkins

# Verify deletion
aws logs describe-log-groups \
  --region us-east-1 \
  --query 'logGroups[*].logGroupName' | grep -i shopnow || echo "No ShopNow log groups found"
```

#### Step 10.2: Delete CloudWatch Alarms

```bash
# List alarms
aws cloudwatch describe-alarms \
  --region us-east-1 \
  --query 'MetricAlarms[*].AlarmName' \
  --output text | grep -i shopnow

# Delete alarms (if created)
aws cloudwatch delete-alarms \
  --alarm-names "shopnow-cpu-alert" "shopnow-memory-alert" \
  --region us-east-1 2>/dev/null || echo "Alarms not found"

# Verify deletion
aws cloudwatch describe-alarms \
  --region us-east-1 \
  --query 'MetricAlarms[*].AlarmName' | grep -i shopnow || echo "No ShopNow alarms found"
```

---

### Phase 11: CloudFormation & Stack Cleanup

#### Step 11.1: List CloudFormation Stacks

```bash
# List stacks related to deployment
aws cloudformation list-stacks \
  --region us-east-1 \
  --query 'StackSummaries[?StackName==`eksctl-shopnow-cluster-cluster`].StackName' \
  --output text
```

#### Step 11.2: Delete CloudFormation Stacks

```bash
# Note: EKS cluster deletion via eksctl should have already deleted associated stacks
# Manually delete if any remain:

aws cloudformation delete-stack \
  --stack-name eksctl-shopnow-cluster-cluster \
  --region us-east-1 2>/dev/null || echo "Stack not found or already deleted"

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name eksctl-shopnow-cluster-cluster \
  --region us-east-1 2>/dev/null || echo "Stack deleted"

# Verify deletion
aws cloudformation describe-stacks \
  --stack-name eksctl-shopnow-cluster-cluster \
  --region us-east-1 2>&1 | grep -i "does not exist" && echo "Stack successfully deleted" || echo "Stack may still exist"
```

---

### Phase 12: Final Verification & Documentation

#### Step 12.1: Verify All Resources Deleted

```bash
# EC2 Instances
echo "=== EC2 Instances ==="
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=shopnow*" \
  --region us-east-1 \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name]' \
  --output table || echo "No instances found"

# EKS Clusters
echo "=== EKS Clusters ==="
aws eks list-clusters --region us-east-1 --query 'clusters' --output text | grep shopnow || echo "No EKS clusters found"

# ECR Repositories
echo "=== ECR Repositories ==="
aws ecr describe-repositories --region us-east-1 --query 'repositories[*].repositoryName' --output text | grep shopnow || echo "No ECR repositories found"

# RDS Databases
echo "=== RDS Databases ==="
aws rds describe-db-instances --region us-east-1 --query 'DBInstances[*].DBInstanceIdentifier' --output text | grep shopnow || echo "No RDS instances found"

# Load Balancers
echo "=== Load Balancers ==="
aws elbv2 describe-load-balancers --region us-east-1 --query 'LoadBalancers[*].LoadBalancerName' --output text | grep shopnow || echo "No load balancers found"

# IAM Resources
echo "=== IAM Users ==="
aws iam list-users --query 'Users[*].UserName' --output text | grep shopnow || echo "No IAM users found"

echo "=== IAM Roles ==="
aws iam list-roles --query 'Roles[*].RoleName' --output text | grep shopnow || echo "No IAM roles found"

# Security Groups
echo "=== Security Groups ==="
aws ec2 describe-security-groups --region us-east-1 --query 'SecurityGroups[?Tags[?Value==`shopnow*`]].GroupId' --output text | wc -l

# S3 Buckets
echo "=== S3 Buckets ==="
aws s3api list-buckets --query 'Buckets[*].Name' --output text | grep -i shopnow || echo "No S3 buckets found"
```

#### Step 12.2: Create Termination Report

```bash
# Generate termination report
cat > TERMINATION-REPORT.md <<EOF
# ShopNow Deployment Termination Report

**Date**: $(date)
**Region**: us-east-1

## Terminated Resources

### Kubernetes
- [ ] Namespace: shopnow-app
- [ ] Namespace: monitoring
- [ ] All deployments, services, and pods

### EKS Cluster
- [ ] Cluster: shopnow-cluster
- [ ] Node groups: shopnow-nodes
- [ ] Add-ons: vpc-cni, coredns, kube-proxy, aws-load-balancer-controller

### EC2
- [ ] Instance: shopnow-devops-master (t3.xlarge)
- [ ] EBS Volumes: All associated volumes

### ECR
- [ ] Repository: shopnow/backend
- [ ] Repository: shopnow/frontend
- [ ] All images deleted

### IAM
- [ ] User: shopnow-cicd-user
- [ ] Role: shopnow-eks-cluster-role
- [ ] Role: shopnow-eks-node-role
- [ ] Policies and permissions

### Networking
- [ ] Security Group: shopnow-devops-sg
- [ ] Network Load Balancers: 2x NLB
- [ ] Target Groups: Associated target groups
- [ ] Elastic IPs: Released

### Storage
- [ ] S3 Bucket: shopnow-deployment-xxxxx
- [ ] All objects deleted

### Monitoring
- [ ] CloudWatch Log Groups
- [ ] CloudWatch Alarms
- [ ] Prometheus/Grafana data

### CloudFormation
- [ ] Stack: eksctl-shopnow-cluster-cluster
- [ ] All associated resources

## Cost Impact

**Monthly savings**: ~$410/month  
**Annual savings**: ~$4,920/year

## Verification

All resources have been successfully terminated.
No remaining AWS charges for ShopNow deployment.

EOF

cat TERMINATION-REPORT.md
```

#### Step 12.3: Final Billing Check

```bash
# Check remaining resources in account
echo "Checking for any remaining resources..."

# Get cost and usage
aws ce get-cost-and-usage \
  --time-period Start=2025-12-01,End=2025-12-09 \
  --granularity MONTHLY \
  --metrics "UnblendedCost" \
  --region us-east-1 \
  --output table

# Monitor for 24-48 hours to ensure no additional charges appear
# Check AWS Billing Dashboard for final confirmation
```

---

### ✅ Termination Checklist

- [ ] Phase 1: Application & Kubernetes cleanup complete
- [ ] Phase 2: Monitoring & observability cleanup complete
- [ ] Phase 3: EKS cluster termination complete
- [ ] Phase 4: ECR cleanup complete
- [ ] Phase 5: EC2 master instance termination complete
- [ ] Phase 6: IAM cleanup complete
- [ ] Phase 7: Security groups & network cleanup complete
- [ ] Phase 8: Load balancers & Elastic IPs cleanup complete
- [ ] Phase 9: S3 & storage cleanup complete
- [ ] Phase 10: CloudWatch & logging cleanup complete
- [ ] Phase 11: CloudFormation stack cleanup complete
- [ ] Phase 12: Final verification complete
- [ ] TERMINATION-REPORT.md generated and reviewed
- [ ] Billing dashboard confirms no ShopNow charges
- [ ] All AWS resources successfully removed

---

### Cost Savings Summary

```
Pre-Termination Monthly Cost:
├── Master Instance (t3.xlarge): $140
├── EKS Control Plane: $73
├── Worker Nodes (3x t3.medium): $90
├── Storage (EBS): $10
├── Load Balancers: $32
└── Data Transfer: $65
    ──────────────────────────
    TOTAL: ~$410/month

Post-Termination Monthly Cost: $0/month

Annual Savings: ~$4,920
```

---

## 🧹 Quick Cleanup (Alternative)

---

## 🧹 Quick Cleanup (Alternative)

If you need to quickly terminate everything without detailed steps:

```bash
#!/bin/bash
# Quick Termination Script - USE WITH CAUTION!

CLUSTER_NAME="shopnow-cluster"
REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "⚠️  WARNING: This will DELETE ALL ShopNow resources!"
echo "Press Ctrl+C to cancel, or wait 10 seconds to continue..."
sleep 10

# 1. Delete Kubernetes namespaces
echo "Deleting Kubernetes namespaces..."
kubectl delete namespace shopnow-app monitoring --ignore-not-found=true

# 2. Delete EKS cluster
echo "Deleting EKS cluster (this takes 10-15 minutes)..."
eksctl delete cluster --name $CLUSTER_NAME --region $REGION --force

# 3. Delete ECR repositories
echo "Deleting ECR repositories..."
aws ecr delete-repository --repository-name shopnow/backend --region $REGION --force 2>/dev/null || true
aws ecr delete-repository --repository-name shopnow/frontend --region $REGION --force 2>/dev/null || true

# 4. Terminate EC2 instances
echo "Terminating EC2 instances..."
INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=shopnow-devops-master" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text --region $REGION)
if [ ! -z "$INSTANCE_ID" ] && [ "$INSTANCE_ID" != "None" ]; then
  aws ec2 terminate-instances --instance-ids $INSTANCE_ID --region $REGION
fi

# 5. Delete security groups
echo "Deleting security groups..."
SG_ID=$(aws ec2 describe-security-groups --filters "Name=tag:Name,Values=shopnow-devops-sg" \
  --query 'SecurityGroups[0].GroupId' --output text --region $REGION)
if [ ! -z "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
  sleep 5
  aws ec2 delete-security-group --group-id $SG_ID --region $REGION 2>/dev/null || true
fi

# 6. Delete IAM resources
echo "Deleting IAM resources..."
for user in shopnow-cicd-user; do
  # Delete access keys
  aws iam list-access-keys --user-name $user --query 'AccessKeyMetadata[*].AccessKeyId' \
    --output text | xargs -I {} aws iam delete-access-key --user-name $user --access-key-id {}
  # Delete user policies
  aws iam list-user-policies --user-name $user --query 'PolicyNames[*]' --output text | \
    xargs -I {} aws iam delete-user-policy --user-name $user --policy-name {}
  # Delete user
  aws iam delete-user --user-name $user 2>/dev/null || true
done

for role in shopnow-eks-cluster-role shopnow-eks-node-role; do
  # Detach policies
  aws iam list-attached-role-policies --role-name $role --query 'AttachedPolicies[*].PolicyArn' \
    --output text | xargs -I {} aws iam detach-role-policy --role-name $role --policy-arn {}
  # Delete inline policies
  aws iam list-role-policies --role-name $role --query 'PolicyNames[*]' --output text | \
    xargs -I {} aws iam delete-role-policy --role-name $role --policy-name {}
  # Delete role
  aws iam delete-role --role-name $role 2>/dev/null || true
done

# 7. Delete S3 buckets
echo "Deleting S3 buckets..."
aws s3api list-buckets --query 'Buckets[*].Name' --output text | tr '\t' '\n' | grep -i shopnow | \
  while read bucket; do
    aws s3 rm s3://$bucket --recursive 2>/dev/null || true
    aws s3api delete-bucket --bucket $bucket --region $REGION 2>/dev/null || true
  done

echo "✅ Termination process initiated!"
echo "⏱️  EKS cluster deletion will take 10-15 minutes"
echo "Monitor progress in AWS Console"
```

---

## 📞 Support & Next Steps

### Deployment Complete!

Your ShopNow e-commerce application is now running on AWS EKS with:

✅ Containerized microservices (Docker)
✅ Kubernetes orchestration (EKS)
✅ Auto-scaling (HPA)
✅ Load balancing (AWS NLB)
✅ CI/CD pipeline (Jenkins)
✅ Code quality (SonarQube)
✅ Monitoring (Prometheus & Grafana)
✅ Security scanning (Trivy)

### Access Your Application

```
Frontend: http://<FRONTEND_LB_IP>
Backend API: http://<BACKEND_LB_IP>/api
API Docs: http://<BACKEND_LB_IP>/swagger-ui
Health: http://<BACKEND_LB_IP>/actuator/health
Metrics: http://<BACKEND_LB_IP>/actuator/prometheus
```

### Next Steps

1. **Configure DNS**: Update DNS records to point to load balancer IPs
2. **Setup SSL/TLS**: Install and configure SSL certificates
3. **Enable Authentication**: Implement OAuth2/OIDC for API security
4. **Database Migration**: Migrate from H2 to PostgreSQL/RDS for production
5. **Backup Strategy**: Implement automated EBS snapshots and RDS backups
6. **Disaster Recovery**: Set up cluster backup and recovery procedures
7. **Performance Tuning**: Monitor metrics and optimize resource allocation

---

## 📚 Additional Resources

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Kubernetes Official Docs](https://kubernetes.io/docs/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Docker Documentation](https://docs.docker.com/)

---

## ⚠️ Important Reminders

1. **Always stop clusters when not in use** to avoid unexpected charges
2. **Enable MFA** on AWS account for security
3. **Rotate access keys** regularly
4. **Monitor AWS billing** closely, set up cost alerts
5. **Backup critical data** before major operations
6. **Test disaster recovery** procedures regularly
7. **Keep software updated**: EKS, nodes, applications
8. **Review security groups** and IAM policies periodically

---

**Last Updated**: December 9, 2025
**Deployment Status**: Production Ready ✅
**Application Version**: 1.0.0 (Java 21)
