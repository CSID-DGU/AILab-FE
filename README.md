# DGU AI Lab Frontend

A modern React application built with Vite, React 19, and Tailwind CSS.

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

## Environment Configuration

This project uses environment files to configure API endpoints:

- `.env.production` - Production settings (committed to git, used in Docker builds)
- `.env` - Local development settings (optional, not committed)

The `.env.production` file contains:
```bash
VITE_API_BASE_URL=http://210.94.179.19:9796
VITE_NODE_ENV=production
```

When building for production, Vite automatically loads `.env.production`. This file is included in Docker builds (not in `.dockerignore`) and environment variables are embedded into the built JavaScript files.

For local development with different settings, create a `.env` file (ignored by git and Docker):
```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_NODE_ENV=development
```

## Development

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Create a production build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## Deployment

### Automated Deployment (Recommended)

Set up GitHub Actions for continuous deployment. Every push to `main` automatically builds and deploys your application.

**Usage:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

GitHub Actions will automatically handle the build and deployment process.

### Manual Kubernetes Deployment

Quick manual deployment steps:
```bash
# 1. Build and push Docker image
docker build -t ailab-frontend:latest .
docker tag ailab-frontend:latest dguailab/ailab-frontend:latest
docker push dguailab/ailab-frontend:latest

# 2. Deploy to Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# 3. Verify deployment
kubectl rollout status deployment/ailab-frontend -n ailab-frontend
```

Access the application at: `http://210.94.179.19:30081`

### Plain Deployment

For non-Kubernetes deployment, use Docker or serve the static build:

**Using Docker:**
```bash
# Build Docker image
docker build -t ailab-frontend:latest .

# Run container
docker run -d -p 80:80 ailab-frontend:latest
```

Access at: `http://localhost`

**Using Static Server:**
```bash
# Build the application
npm run build

# Serve with any static file server
npx serve -s dist -p 80
```

Access at: `http://localhost`

## Project Structure

```
├── k8s/             # Kubernetes manifests
├── public/          # Static assets
├── src/
│   ├── components/  # React components
│   ├── pages/       # Page components
│   ├── App.jsx      # Main app with routing
│   └── main.jsx     # Entry point
└── vite.config.js   # Vite configuration
```
