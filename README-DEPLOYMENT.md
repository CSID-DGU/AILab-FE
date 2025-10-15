# Kubernetes Deployment Guide

## Namespace
The application will be deployed to the `ailab-frontend` namespace.

## Manual Deployment

### Prerequisites
- Docker installed on FARM8 server (210.94.179.19)
- kubectl configured to access the Kubernetes cluster
- Port 9775 forwarded from 210.94.179.19 to FARM8 machine

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

# Check deployment status
kubectl get pods -n ailab-frontend
kubectl get svc -n ailab-frontend
```

2. Start port forwarding:
```bash
chmod +x port-forward.sh
./port-forward.sh
```

Or manually:
```bash
kubectl port-forward -n ailab-frontend service/ailab-frontend 9775:9775 --address=0.0.0.0
```

3. Access the application:
```
http://210.94.179.19:9775
```

**Note:** Keep the port-forward command running in a terminal or use a process manager like `systemd` or `screen` to run it in the background.

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

# Scale deployment
kubectl scale deployment/ailab-frontend --replicas=3 -n ailab-frontend

# Delete deployment
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

## Port Forwarding as a Service (Optional)

To keep port-forward running permanently, create a systemd service:

```bash
sudo tee /etc/systemd/system/ailab-frontend-portforward.service > /dev/null <<EOF
[Unit]
Description=AILab Frontend Port Forward
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/bin/kubectl port-forward -n ailab-frontend service/ailab-frontend 9775:9775 --address=0.0.0.0
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ailab-frontend-portforward
sudo systemctl start ailab-frontend-portforward
```

## Notes

- The application runs on port 9775 inside the container
- Service type: ClusterIP (default)
- Exposed via kubectl port-forward on port 9775
- External access: http://210.94.179.19:9775
- 2 replicas for high availability
- Resource limits: 256Mi memory, 200m CPU
- The nginx.conf includes a proxy pass to `/api` endpoint (update as needed)
