pipeline {
    agent any
    
    environment {
        // AWS Configuration
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = credentials('aws-account-id')
        
        // ECR Configuration
        ECR_BACKEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/backend"
        ECR_FRONTEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/shopnow/frontend"
        
        // EKS Configuration
        EKS_CLUSTER_NAME = 'shopnow-cluster'
        K8S_NAMESPACE = 'shopnow-app'
        
        // Build Configuration
        MAVEN_OPTS = '-Xmx1024m -XX:+UseG1GC'
        JAVA_HOME = '/usr/lib/jvm/java-21-amazon-corretto'
    }
    
    tools {
        maven 'Maven-3.9'
        jdk 'JDK-21'
    }
    
    stages {
        
        stage('Checkout Code') {
            steps {
                echo '📥 Checking out source code from GitHub...'
                checkout scm
                
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
                
                echo "Build Tag: ${env.BUILD_TAG}"
            }
        }
        
        stage('Maven Build') {
            steps {
                echo '🔨 Building Java application with Maven...'
                sh '''
                    mvn clean compile -B -DskipTests
                    echo "✅ Compilation successful"
                '''
            }
        }
        
        stage('Run Tests') {
            steps {
                echo '🧪 Running unit tests...'
                sh '''
                    mvn test -B
                    echo "✅ All tests passed"
                '''
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                echo '📊 Running SonarQube static code analysis...'
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        mvn sonar:sonar \\
                          -Dsonar.projectKey=shopnow-ecommerce \\
                          -Dsonar.projectName="ShopNow E-Commerce" \\
                          -Dsonar.java.binaries=target/classes \\
                          -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml
                    '''
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                echo '🚦 Waiting for SonarQube Quality Gate...'
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
                echo '✅ Quality Gate passed'
            }
        }
        
        stage('Package Application') {
            steps {
                echo '📦 Packaging application as JAR...'
                sh '''
                    mvn package -DskipTests -B
                    echo "✅ JAR created: $(ls -lh target/*.jar | awk '{print $9, $5}')"
                '''
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        echo '🐳 Building Backend Docker image...'
                        script {
                            sh """
                                docker build \\
                                  -f Dockerfiles/backend.Dockerfile \\
                                  -t shopnow-backend:${BUILD_TAG} \\
                                  -t shopnow-backend:latest \\
                                  .
                            """
                        }
                        echo '✅ Backend image built successfully'
                    }
                }
                
                stage('Build Frontend Image') {
                    steps {
                        echo '🐳 Building Frontend Docker image...'
                        script {
                            sh """
                                docker build \\
                                  -f Dockerfiles/frontend.Dockerfile \\
                                  -t shopnow-frontend:${BUILD_TAG} \\
                                  -t shopnow-frontend:latest \\
                                  .
                            """
                        }
                        echo '✅ Frontend image built successfully'
                    }
                }
            }
        }
        
        stage('Security Scan - Trivy') {
            parallel {
                stage('Scan Backend Image') {
                    steps {
                        echo '🔒 Scanning Backend image for vulnerabilities...'
                        sh """
                            trivy image --severity HIGH,CRITICAL \\
                              --exit-code 0 \\
                              --no-progress \\
                              shopnow-backend:${BUILD_TAG} || true
                        """
                    }
                }
                
                stage('Scan Frontend Image') {
                    steps {
                        echo '🔒 Scanning Frontend image for vulnerabilities...'
                        sh """
                            trivy image --severity HIGH,CRITICAL \\
                              --exit-code 0 \\
                              --no-progress \\
                              shopnow-frontend:${BUILD_TAG} || true
                        """
                    }
                }
            }
        }
        
        stage('Push to ECR') {
            steps {
                echo '📤 Authenticating with AWS ECR...'
                script {
                    sh """
                        aws ecr get-login-password --region ${AWS_REGION} | \\
                        docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                    """
                    
                    echo '📤 Pushing Backend image to ECR...'
                    sh """
                        docker tag shopnow-backend:${BUILD_TAG} ${ECR_BACKEND}:${BUILD_TAG}
                        docker tag shopnow-backend:${BUILD_TAG} ${ECR_BACKEND}:latest
                        docker push ${ECR_BACKEND}:${BUILD_TAG}
                        docker push ${ECR_BACKEND}:latest
                    """
                    
                    echo '📤 Pushing Frontend image to ECR...'
                    sh """
                        docker tag shopnow-frontend:${BUILD_TAG} ${ECR_FRONTEND}:${BUILD_TAG}
                        docker tag shopnow-frontend:${BUILD_TAG} ${ECR_FRONTEND}:latest
                        docker push ${ECR_FRONTEND}:${BUILD_TAG}
                        docker push ${ECR_FRONTEND}:latest
                    """
                    
                    echo '✅ All images pushed successfully'
                }
            }
        }
        
        stage('Update Kubernetes Config') {
            steps {
                echo '☸️  Configuring kubectl for EKS...'
                sh """
                    aws eks update-kubeconfig \\
                      --name ${EKS_CLUSTER_NAME} \\
                      --region ${AWS_REGION}
                """
            }
        }
        
        stage('Deploy to EKS') {
            steps {
                echo '🚀 Deploying to Kubernetes cluster...'
                
                script {
                    // Update image references in deployment files
                    sh """
                        # Create namespace if not exists
                        kubectl apply -f k8s/namespace.yaml
                        
                        # Apply ConfigMap
                        kubectl apply -f k8s/configmap.yaml
                        
                        # Deploy Backend
                        kubectl -n ${K8S_NAMESPACE} set image deployment/shopnow-backend \\
                          shopnow-backend=${ECR_BACKEND}:${BUILD_TAG}
                        
                        # Deploy Frontend
                        kubectl -n ${K8S_NAMESPACE} set image deployment/shopnow-frontend \\
                          shopnow-frontend=${ECR_FRONTEND}:${BUILD_TAG}
                        
                        # Wait for rollout
                        echo "⏳ Waiting for Backend deployment to complete..."
                        kubectl -n ${K8S_NAMESPACE} rollout status deployment/shopnow-backend --timeout=5m
                        
                        echo "⏳ Waiting for Frontend deployment to complete..."
                        kubectl -n ${K8S_NAMESPACE} rollout status deployment/shopnow-frontend --timeout=5m
                    """
                }
                
                echo '✅ Deployment completed successfully'
            }
        }
        
        stage('Verify Deployment') {
            steps {
                echo '🔍 Verifying deployment status...'
                sh """
                    echo "=== Pods Status ==="
                    kubectl -n ${K8S_NAMESPACE} get pods
                    
                    echo "\\n=== Services Status ==="
                    kubectl -n ${K8S_NAMESPACE} get svc
                    
                    echo "\\n=== Deployment Status ==="
                    kubectl -n ${K8S_NAMESPACE} get deployments
                    
                    echo "\\n=== HPA Status ==="
                    kubectl -n ${K8S_NAMESPACE} get hpa
                """
            }
        }
        
        stage('Get Application URLs') {
            steps {
                script {
                    echo '🌐 Retrieving application URLs...'
                    
                    def backendURL = sh(
                        script: "kubectl -n ${K8S_NAMESPACE} get svc shopnow-backend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'",
                        returnStdout: true
                    ).trim()
                    
                    def frontendURL = sh(
                        script: "kubectl -n ${K8S_NAMESPACE} get svc shopnow-frontend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'",
                        returnStdout: true
                    ).trim()
                    
                    echo """
                    ╔════════════════════════════════════════════════════════════╗
                    ║           🎉 DEPLOYMENT SUCCESSFUL 🎉                      ║
                    ╠════════════════════════════════════════════════════════════╣
                    ║ Build Tag:    ${BUILD_TAG}                                
                    ║ Backend URL:  http://${backendURL}                        
                    ║ Frontend URL: http://${frontendURL}                       
                    ╚════════════════════════════════════════════════════════════╝
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            // Send Slack/Email notification (configure as needed)
        }
        
        failure {
            echo '❌ Pipeline failed!'
            // Send failure notification
        }
        
        always {
            echo '🧹 Cleaning up workspace...'
            cleanWs()
            
            // Clean up Docker images to save space
            sh '''
                docker system prune -f --volumes || true
            '''
        }
    }
}
