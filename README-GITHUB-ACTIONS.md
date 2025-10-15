# GitHub Actions Automated Deployment Guide

This guide explains how to set up automated deployment using GitHub Actions for the AILab Frontend application.

## Overview

The GitHub Actions workflow automatically:
1. Builds a Docker image when code is pushed to the `main` branch
2. Pushes the image to Docker Hub
3. Deploys the updated application to your Kubernetes cluster
4. Verifies the deployment succeeded

## Prerequisites

Before setting up GitHub Actions, you need:
1. A Docker Hub account
2. Access to your Kubernetes cluster
3. GitHub repository with Actions enabled

## Setup Instructions

### Step 1: Configure GitHub Secrets

You need to add three secrets to your GitHub repository:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following:

#### Required Secrets:

**DOCKER_USERNAME**
- Your Docker Hub username
- Example: `dguailab`

**DOCKER_PASSWORD**
- Your Docker Hub password or access token
- For better security, use a Docker Hub access token instead of your password:
  1. Go to Docker Hub → Account Settings → Security
  2. Click "New Access Token"
  3. Give it a name (e.g., "github-actions")
  4. Copy the token and use it as the secret value

**KUBE_CONFIG**
- Your Kubernetes config file, base64 encoded
- To generate this value:
  ```bash
  # On your local machine or server where kubectl is configured
  cat ~/.kube/config | base64 -w 0
  ```
- Copy the entire output and paste it as the secret value

### Step 2: Verify Workflow File

The workflow file is already created at [.github/workflows/deploy.yml](.github/workflows/deploy.yml). It contains:

- **Trigger**: Automatically runs on push to `main` branch, or can be manually triggered
- **Build**: Creates Docker image with caching for faster builds
- **Deploy**: Applies Kubernetes manifests and restarts deployment
- **Verify**: Checks deployment status and shows logs on failure

### Step 3: Test the Workflow

#### Automatic Deployment (on push to main)
```bash
# Make any change to your code
git add .
git commit -m "Test automated deployment"
git push origin main
```

The workflow will automatically start. You can monitor it at:
```
https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

#### Manual Deployment (via GitHub UI)
1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Build and Deploy to Kubernetes** workflow
4. Click **Run workflow** button
5. Select the `main` branch
6. Click **Run workflow**

### Step 4: Monitor Deployment

1. Go to the **Actions** tab in your GitHub repository
2. Click on the running workflow
3. Watch the real-time logs for each step
4. If successful, you'll see:
   - Docker image built and pushed
   - Kubernetes deployment updated
   - Pods running successfully

### Step 5: Access Your Application

After successful deployment, access your application at:
```
http://210.94.179.19:9775
```

## Workflow Details

### What Happens During Deployment

1. **Checkout code**: Gets the latest code from your repository
2. **Build Docker image**: Creates a production-ready Docker image with your React app
3. **Push to Docker Hub**: Uploads the image to `dguailab/ailab-frontend:latest`
4. **Configure kubectl**: Sets up connection to your Kubernetes cluster
5. **Apply manifests**: Updates Kubernetes resources (deployment, service, ingress)
6. **Restart deployment**: Triggers a rolling update with the new image
7. **Verify**: Waits for deployment to complete and checks status

### Image Tagging Strategy

The workflow creates two tags for each build:
- `latest`: Always points to the most recent build
- `<git-sha>`: Specific version tag (e.g., `abc123def456`)

This allows you to:
- Use `latest` for production (current setup)
- Rollback to specific versions if needed: `kubectl set image deployment/ailab-frontend ailab-frontend=dguailab/ailab-frontend:abc123def456 -n ailab-frontend`

### Build Caching

The workflow uses Docker layer caching to speed up builds:
- First build: ~2-5 minutes
- Subsequent builds: ~1-3 minutes (if dependencies haven't changed)

## Troubleshooting

### Workflow Fails at "Log in to Docker Hub"

**Problem**: Docker credentials are incorrect or missing

**Solution**:
1. Verify `DOCKER_USERNAME` and `DOCKER_PASSWORD` secrets are set correctly
2. Test credentials locally:
   ```bash
   docker login
   # Enter your username and password/token
   ```
3. If using a token, ensure it has "Read, Write, Delete" permissions

### Workflow Fails at "Configure kubectl"

**Problem**: `KUBE_CONFIG` secret is incorrect or malformed

**Solution**:
1. Regenerate the base64-encoded config:
   ```bash
   cat ~/.kube/config | base64 -w 0
   ```
2. Update the `KUBE_CONFIG` secret in GitHub
3. Ensure there are no extra spaces or newlines when pasting

### Workflow Fails at "Deploy to Kubernetes"

**Problem**: Kubernetes connection or permission issues

**Solution**:
1. Check if your Kubernetes cluster is accessible:
   ```bash
   kubectl cluster-info
   ```
2. Verify the service account has proper permissions:
   ```bash
   kubectl auth can-i create deployments -n ailab-frontend
   kubectl auth can-i create services -n ailab-frontend
   kubectl auth can-i create ingresses -n ailab-frontend
   ```
3. Check the "Verify kubectl connection" step in the workflow logs

### Deployment Succeeds but Application Doesn't Work

**Problem**: Application running but not accessible or has errors

**Solution**:
1. Check pod logs:
   ```bash
   kubectl logs -n ailab-frontend -l app=ailab-frontend --tail=100
   ```
2. Check pod status:
   ```bash
   kubectl get pods -n ailab-frontend
   kubectl describe pod <pod-name> -n ailab-frontend
   ```
3. Verify ingress configuration:
   ```bash
   kubectl describe ingress ailab-frontend -n ailab-frontend
   ```
4. Test direct pod access:
   ```bash
   POD_NAME=$(kubectl get pods -n ailab-frontend -l app=ailab-frontend -o jsonpath='{.items[0].metadata.name}')
   kubectl exec -n ailab-frontend "$POD_NAME" -- curl -I http://localhost:80
   ```

### Build is Slow

**Problem**: Docker build takes too long

**Solution**:
1. The workflow already uses caching - first builds are slower
2. Consider using multi-stage build optimization (already in Dockerfile)
3. For very large projects, consider using GitHub Actions cache for node_modules

## Advanced Configuration

### Deploy to Multiple Environments

You can modify the workflow to deploy to different environments (dev, staging, production):

```yaml
on:
  push:
    branches:
      - main      # Production
      - develop   # Staging
      - dev       # Development

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # ... existing steps ...

      - name: Set environment based on branch
        run: |
          if [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "ENVIRONMENT=production" >> $GITHUB_ENV
            echo "K8S_NAMESPACE=ailab-frontend" >> $GITHUB_ENV
          elif [[ "${{ github.ref }}" == "refs/heads/develop" ]]; then
            echo "ENVIRONMENT=staging" >> $GITHUB_ENV
            echo "K8S_NAMESPACE=ailab-frontend-staging" >> $GITHUB_ENV
          fi
```

### Add Slack/Discord Notifications

Add a notification step at the end of the workflow:

```yaml
      - name: Notify on success
        if: success()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"Deployment successful! Application is live at http://210.94.179.19:9775"}'

      - name: Notify on failure
        if: failure()
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
            -H 'Content-Type: application/json' \
            -d '{"text":"Deployment failed! Check GitHub Actions logs for details."}'
```

### Run Tests Before Deployment

Add a test job that must pass before deployment:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test  # If you have tests

  build-and-deploy:
    needs: test  # Only deploy if tests pass
    runs-on: ubuntu-latest
    # ... rest of deployment job ...
```

## Security Best Practices

1. **Never commit secrets**: Always use GitHub Secrets, never hardcode credentials
2. **Use Docker tokens**: Instead of Docker password, use access tokens with limited scope
3. **Limit kubeconfig**: Create a service account with minimal required permissions
4. **Review workflows**: Audit workflow runs regularly for suspicious activity
5. **Branch protection**: Enable branch protection rules to require reviews before merging to main

## Manual Deployment (Fallback)

If GitHub Actions is unavailable, you can still deploy manually following the instructions in [README-DEPLOYMENT.md](README-DEPLOYMENT.md).

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Kubectl Setup Action](https://github.com/azure/setup-kubectl)
- [Original Deployment Guide](README-DEPLOYMENT.md)

## Summary

Once set up, your deployment workflow is:

1. **Develop locally**: Make code changes on a feature branch
2. **Create PR**: Open a pull request to `main`
3. **Review & Merge**: After review, merge to `main`
4. **Automatic deployment**: GitHub Actions automatically builds and deploys
5. **Verify**: Check the application at http://210.94.179.19:9775

No manual Docker or kubectl commands needed!
