# Kubernetes Deployment Guide

## Namespace
The application will be deployed to the `ailab-frontend` namespace.

## Manual Deployment

### Prerequisites
- Docker installed on FARM8 server (210.94.179.19)
- kubectl configured to access the Kubernetes cluster
- **Nginx Ingress Controller** installed in the cluster and configured to listen on port 9775

### Deploy Steps

1. Build and deploy:
```bash
chmod +x deploy.sh
./deploy.sh
```

Or manually:

```bash
# Build Docker image
docker build -t ailab-frontend:latest .

# Apply Kubernetes manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Check deployment status
kubectl get pods -n ailab-frontend
kubectl get svc -n ailab-frontend
kubectl get ingress -n ailab-frontend
```

2. Access the application:
```
http://210.94.179.19:9775
```

**Note:** The application is now exposed via Nginx Ingress Controller instead of kubectl port-forward. This is more reliable and production-ready.

## Update Deployment

```bash
# Rebuild image
docker build -t ailab-frontend:latest .

# Restart deployment
kubectl rollout restart deployment/ailab-frontend -n ailab-frontend
kubectl rollout status deployment/ailab-frontend -n ailab-frontend
```

## Useful Commands

```bash
# View logs
kubectl logs -f deployment/ailab-frontend -n ailab-frontend

# View ingress details
kubectl describe ingress ailab-frontend -n ailab-frontend

# Scale deployment
kubectl scale deployment/ailab-frontend --replicas=3 -n ailab-frontend

# Delete deployment
kubectl delete -f k8s/ingress.yaml
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/service.yaml
kubectl delete namespace ailab-frontend
```

## Future: GitHub Actions Automation

To enable automated deployment:

1. Rename `.github/workflows/deploy.yaml.template` to `.github/workflows/deploy.yaml`
2. Add GitHub secrets:
   - `SERVER_HOST`: FARM8 server address
   - `SERVER_USER`: SSH username
   - `SSH_PRIVATE_KEY`: SSH private key for authentication
3. Update the deployment script path in the workflow file

## Nginx Ingress Controller Setup

If you don't have Nginx Ingress Controller installed yet, install it using Helm:

```bash
# Add the Nginx Ingress Helm repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install Nginx Ingress Controller with NodePort on 9775
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=NodePort \
  --set controller.service.nodePorts.http=9775

# Wait for the ingress controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Verify installation
kubectl get svc -n ingress-nginx
```

To upgrade the ingress controller configuration:
```bash
helm upgrade ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --set controller.service.type=NodePort \
  --set controller.service.nodePorts.http=9775
```

## Architecture

- **Nginx container**: Listens on port 80 (standard HTTP)
- **Kubernetes Service**: ClusterIP type exposing port 80 internally
- **Nginx Ingress Controller**: Routes external traffic from port 9775 to the service
- **External access**: http://210.94.179.19:9775
- **Benefits**:
  - No need for kubectl port-forward
  - More reliable and production-ready
  - Easier to scale and manage
  - Better separation of concerns (ingress vs. service)

## Notes

- 2 replicas for high availability
- Resource limits: 256Mi memory, 200m CPU
- Ingress routing eliminates the need for manual port forwarding
- Nginx Ingress Controller managed via Helm for easy updates and configuration
