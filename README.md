# DGU AI Lab Frontend

React 19 + Vite + Tailwind frontend for DGU AI Lab.

## Requirements
- Node 16+
- npm

## Environment
- `.env.production` (committed, used in Docker/K8s):
  ```bash
  VITE_API_BASE_URL=http://210.94.179.19:9796
  VITE_NODE_ENV=production
  ```
- `.env` (local override, git-ignored) example:
  ```bash
  VITE_API_BASE_URL=http://localhost:8080
  VITE_NODE_ENV=development
  ```

## Commands
- Install: `npm install`
- Dev server: `npm run dev` → http://localhost:5173
- Build: `npm run build`
- Preview build: `npm run preview`

## Deploy
- Docker: `docker build -t ailab-frontend:latest .` then `docker run -d -p 80:80 ailab-frontend:latest`
- Kubernetes (manual):
  ```bash
  docker build -t ailab-frontend:latest .
  docker tag ailab-frontend:latest dguailab/ailab-frontend:latest
  docker push dguailab/ailab-frontend:latest
  kubectl apply -f k8s/namespace.yaml
  kubectl apply -f k8s/deployment.yaml
  kubectl apply -f k8s/service.yaml
  kubectl apply -f k8s/ingress.yaml
  kubectl rollout status deployment/ailab-frontend -n ailab-frontend
  ```

## Migrate to Another Kubernetes Cluster
1) Switch context: `kubectl config use-context <new-cluster>`; ensure the NGINX ingress class or host matches the new setup (edit `k8s/ingress.yaml` as needed).  
2) Push the image to a registry the new cluster can pull from; update `k8s/deployment.yaml` `image:` (and add an `imagePullSecret` if the registry is private).  
3) Update env values (e.g., `VITE_API_BASE_URL`) to point at the backend reachable from the new cluster, rebuild, and push the image.  
4) Apply manifests: `kubectl apply -f k8s/namespace.yaml && kubectl apply -f k8s`.  
5) Verify: `kubectl rollout status deployment/ailab-frontend -n ailab-frontend` and check ingress/service reachability.
