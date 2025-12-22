#!/bin/bash

set -e

REGISTRY="dguailab"
IMAGE_NAME="ailab-frontend"
TAG="latest"

echo "=========================================="
echo "AILab Frontend Deployment Script"
echo "=========================================="
echo ""

echo "Step 1: Building Docker image..."
docker build -t ${IMAGE_NAME}:${TAG} .

echo ""
echo "Step 2: Tagging image for registry..."
docker tag ${IMAGE_NAME}:${TAG} ${REGISTRY}/${IMAGE_NAME}:${TAG}

echo ""
echo "Step 3: Pushing image to registry..."
docker push ${REGISTRY}/${IMAGE_NAME}:${TAG}

echo ""
echo "Step 4: Creating namespace..."
kubectl apply -f k8s/namespace.yaml

echo ""
echo "Step 5: Deploying to Kubernetes..."
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

echo ""
echo "Step 6: Waiting for deployment to be ready..."
kubectl rollout status deployment/ailab-frontend -n ailab-frontend

echo ""
echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
echo "Access the application at: http://210.94.179.19:30081"
echo ""
echo "Note: Ensure Nginx Ingress Controller is installed:"
echo "  helm install nginx-ailab ingress-nginx/ingress-nginx \\"
echo "    --namespace ailab-frontend \\"
echo "    --create-namespace \\"
echo "    --values k8s/ingress-controller-values.yaml"
