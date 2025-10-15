#!/bin/bash

set -e

echo "Building Docker image..."
docker build -t ailab-frontend:latest .

echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

echo "Deploying to Kubernetes..."
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

echo "Waiting for deployment to be ready..."
kubectl rollout status deployment/ailab-frontend -n ailab-frontend

echo "Deployment complete!"
echo "Access the application at: http://210.94.179.19:9775"
echo ""
echo "Note: Ensure Nginx Ingress Controller is installed and configured to listen on port 9775"
