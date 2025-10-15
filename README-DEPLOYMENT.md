# Kubernetes Deployment Guide

## Namespace
The application will be deployed to the `ailab-frontend` namespace.

## Prerequisites

Before deploying, ensure you have the following installed and configured:

1. **Docker** - For building container images
   ```bash
   docker --version
   ```

2. **kubectl** - Configured to access your Kubernetes cluster
   ```bash
   kubectl version --client
   kubectl cluster-info
   ```

3. **Helm** - For installing the Nginx Ingress Controller
   ```bash
   # Check if Helm is installed
   helm version

   # If not installed, install Helm:
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   ```

4. **Docker Registry Access** - Ensure you can push to `dguailab/ailab-frontend` (or configure your own registry)
   ```bash
   docker login
   ```

## Complete Deployment Pipeline

This is a complete end-to-end deployment guide. Each step must be completed in order.

### Step 1: Build and Push Docker Image

**IMPORTANT:** You must rebuild the Docker image every time you make code or configuration changes.

```bash
# Build the Docker image
docker build -t ailab-frontend:latest .

# Tag for your registry (adjust registry name if needed)
docker tag ailab-frontend:latest dguailab/ailab-frontend:latest

# Push to registry
docker push dguailab/ailab-frontend:latest
```

### Step 2: Install Nginx Ingress Controller (One-time setup)

This step only needs to be done once. If you already have the ingress controller installed, skip this step.

```bash
# Add the Nginx Ingress Helm repository
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install dedicated Nginx Ingress Controller for AILab Frontend
helm install nginx-ailab ingress-nginx/ingress-nginx \
  --namespace ailab-frontend \
  --create-namespace \
  --values k8s/ingress-controller-values.yaml

# Wait for the ingress controller to be ready
kubectl wait --namespace ailab-frontend \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Verify installation
kubectl get svc -n ailab-frontend
kubectl get ingressclass
```

You should see:
- Service `nginx-ailab-ingress-nginx-controller` with NodePort 9775
- IngressClass `nginx-ailab`

### Step 3: Deploy Application

```bash
# Create namespace (if not created by helm)
kubectl apply -f k8s/namespace.yaml

# Deploy application, service, and ingress
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Wait for deployment to be ready
kubectl rollout status deployment/ailab-frontend -n ailab-frontend

# Check deployment status
kubectl get pods -n ailab-frontend
kubectl get svc -n ailab-frontend
kubectl get ingress -n ailab-frontend
```

### Step 4: Access the Application

```
http://210.94.179.19:9775
```

**Note:** The application is now exposed via Nginx Ingress Controller instead of kubectl port-forward. This is more reliable and production-ready.

## Update Deployment (After Code Changes)

When you make changes to your code or configuration, follow these steps:

```bash
# 1. Rebuild and push the Docker image
docker build -t ailab-frontend:latest .
docker tag ailab-frontend:latest dguailab/ailab-frontend:latest
docker push dguailab/ailab-frontend:latest

# 2. Restart the deployment to pull the new image
kubectl rollout restart deployment/ailab-frontend -n ailab-frontend

# 3. Wait for and verify the rollout
kubectl rollout status deployment/ailab-frontend -n ailab-frontend
kubectl get pods -n ailab-frontend
```

**Note:** Since the image tag is `latest`, you must restart the deployment to pull the new image. Kubernetes won't automatically detect changes to the `latest` tag.

## Useful Commands

```bash
# View application logs
kubectl logs -f deployment/ailab-frontend -n ailab-frontend

# View ingress controller logs
kubectl logs -f -n ailab-frontend -l app.kubernetes.io/component=controller

# View ingress details
kubectl describe ingress ailab-frontend -n ailab-frontend

# Scale deployment
kubectl scale deployment/ailab-frontend --replicas=3 -n ailab-frontend

# Check all resources
kubectl get all,ingress -n ailab-frontend

# Delete deployment (keeps ingress controller)
kubectl delete -f k8s/ingress.yaml
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/service.yaml

# Delete everything including ingress controller
helm uninstall nginx-ailab -n ailab-frontend
kubectl delete namespace ailab-frontend
```

## Troubleshooting

### 502 Bad Gateway Error

If you see a 502 error, check the following:

1. **Verify pods are running:**
   ```bash
   kubectl get pods -n ailab-frontend
   ```

2. **Check if you rebuilt the Docker image after config changes:**
   ```bash
   # Rebuild and push the image
   docker build -t ailab-frontend:latest .
   docker push dguailab/ailab-frontend:latest
   kubectl rollout restart deployment/ailab-frontend -n ailab-frontend
   ```

3. **Run the debug script:**
   ```bash
   ./debug.sh
   ```

4. **Test direct pod connection:**
   ```bash
   POD_NAME=$(kubectl get pods -n ailab-frontend -l app=ailab-frontend -o jsonpath='{.items[0].metadata.name}')
   kubectl exec -n ailab-frontend "$POD_NAME" -- curl -I http://localhost:80
   ```

### Ingress Controller Not Running

```bash
# Check ingress controller status
kubectl get pods -n ailab-frontend -l app.kubernetes.io/component=controller

# Check helm release
helm list -n ailab-frontend

# Reinstall if needed
helm uninstall nginx-ailab -n ailab-frontend
helm install nginx-ailab ingress-nginx/ingress-nginx \
  --namespace ailab-frontend \
  --create-namespace \
  --values k8s/ingress-controller-values.yaml
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
