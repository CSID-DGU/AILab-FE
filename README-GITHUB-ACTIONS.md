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
2. Access to your Kubernetes cluster (private network at 192.168.2.18:6443)
3. GitHub repository with Actions enabled
4. A machine with kubectl access to your cluster (FARM8)

## Important: Self-Hosted Runner Required

Your Kubernetes cluster runs on a private IP address (192.168.2.18) that's only accessible from within your local network. GitHub's hosted runners cannot reach this cluster, so you must use a **self-hosted runner** on a machine that has network access to your cluster.

The workflow is configured to run on your FARM8 machine using `runs-on: self-hosted`.

## Setup Instructions

### Step 0: Set Up Self-Hosted GitHub Runner on FARM8

This is a **required** step before the workflow can deploy to your cluster.

#### A. Navigate to GitHub Runner Settings

1. Go to your GitHub repository
2. Click **Settings** → **Actions** → **Runners**
3. Click **New self-hosted runner**
4. Select **Linux** as the operating system
5. Select **x64** as the architecture

#### B. Install the Runner on FARM8

SSH into your FARM8 machine and run the commands provided by GitHub:

```bash
# Create a directory for the runner
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download the latest runner package (GitHub will provide the exact URL)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

#### C. Configure the Runner

Run the configuration script with the token provided by GitHub:

```bash
./config.sh --url https://github.com/YOUR_USERNAME/AILab-FE --token YOUR_GITHUB_PROVIDED_TOKEN
```

When prompted:
- **Runner name**: Press Enter for default or type `farm8-runner`
- **Runner group**: Press Enter for default
- **Labels**: Press Enter for default (will use `self-hosted,Linux,X64`)
- **Work folder**: Press Enter for default

#### D. Install as a Service (Recommended)

This ensures the runner starts automatically and runs in the background:

```bash
# Install the service
sudo ./svc.sh install

# Start the service
sudo ./svc.sh start

# Check the status
sudo ./svc.sh status
```

#### E. Verify Installation

1. Go back to GitHub **Settings** → **Actions** → **Runners**
2. You should see your runner listed with a green "Idle" status
3. The runner is now ready to execute workflows!

**Alternative:** Run without service (requires keeping terminal open):
```bash
./run.sh
```

### Runner Troubleshooting

**Runner is offline:**
```bash
sudo ./svc.sh status
sudo ./svc.sh restart
```

**Check runner logs:**
```bash
sudo journalctl -u actions.runner.* -f
```

**Remove and reconfigure:**
```bash
sudo ./svc.sh stop
sudo ./svc.sh uninstall
./config.sh remove --token YOUR_REMOVAL_TOKEN
```

### Step 1: Configure GitHub Secrets

You need to add two secrets to your GitHub repository:

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

**Note:** The `KUBE_CONFIG` secret is NOT needed because the self-hosted runner on FARM8 already has kubectl configured and can access your cluster directly.

### Step 2: Verify Workflow File

The workflow file is already created at [.github/workflows/deploy.yml](.github/workflows/deploy.yml). It contains:

- **Runner**: Uses `runs-on: self-hosted` to run on your FARM8 machine
- **Trigger**: Automatically runs on push to `main` branch, or can be manually triggered
- **Build**: Creates Docker image with caching for faster builds
- **Deploy**: Uses the existing kubectl configuration on FARM8 to apply manifests and restart deployment
- **Verify**: Checks deployment status and shows logs on failure

**Key differences from standard workflows:**
- No kubeconfig setup needed (uses FARM8's existing kubectl configuration)
- Runs directly on your local network with access to the private Kubernetes cluster
- kubectl commands execute with your existing permissions and context

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

### Workflow Fails at "Verify kubectl connection"

**Problem**: kubectl cannot connect to cluster from FARM8

**Solution**:
1. SSH into FARM8 and verify kubectl works:
   ```bash
   kubectl cluster-info
   kubectl get nodes
   ```
2. If kubectl doesn't work on FARM8, check your kubeconfig:
   ```bash
   cat ~/.kube/config
   ```
3. Ensure the runner has permission to use kubectl (usually runs as the user who installed it)

### Workflow Fails at "Deploy to Kubernetes"

**Problem**: Kubernetes permission issues or manifest errors

**Solution**:
1. Check the runner service status:
   ```bash
   sudo systemctl status actions.runner.*
   ```
2. Verify kubectl permissions on FARM8:
   ```bash
   kubectl auth can-i create deployments -n ailab-frontend
   kubectl auth can-i create services -n ailab-frontend
   kubectl auth can-i create ingresses -n ailab-frontend
   ```
3. Check the workflow logs in GitHub Actions for specific error messages

### Runner Goes Offline

**Problem**: Self-hosted runner shows as offline in GitHub

**Solution**:
1. Check runner service on FARM8:
   ```bash
   sudo ./svc.sh status
   ```
2. Restart the service:
   ```bash
   cd ~/actions-runner
   sudo ./svc.sh restart
   ```
3. Check for errors:
   ```bash
   sudo journalctl -u actions.runner.* -n 50
   ```

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
3. **Secure the runner**: The self-hosted runner has full access to your cluster
   - Only trusted collaborators should be able to trigger workflows
   - Consider using [runner labels](https://docs.github.com/en/actions/hosting-your-own-runners/using-labels-with-self-hosted-runners) for additional control
   - Keep the runner updated regularly
4. **Review workflows**: Audit workflow runs regularly for suspicious activity
5. **Branch protection**: Enable branch protection rules to require reviews before merging to main
6. **Limit runner access**: The runner user should have minimal system permissions beyond kubectl access

## Manual Deployment (Fallback)

If GitHub Actions is unavailable, you can still deploy manually following the instructions in [README-DEPLOYMENT.md](README-DEPLOYMENT.md).

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Kubectl Setup Action](https://github.com/azure/setup-kubectl)
- [Original Deployment Guide](README-DEPLOYMENT.md)

## Summary

Once set up, your deployment workflow is:

1. **One-time setup**: Install self-hosted runner on FARM8 (see Step 0)
2. **Configure secrets**: Add Docker Hub credentials to GitHub (see Step 1)
3. **Develop locally**: Make code changes on a feature branch
4. **Create PR**: Open a pull request to `main`
5. **Review & Merge**: After review, merge to `main`
6. **Automatic deployment**: GitHub Actions automatically builds and deploys on FARM8
7. **Verify**: Check the application at http://210.94.179.19:9775

The self-hosted runner on FARM8 provides:
- Direct network access to your private Kubernetes cluster
- No need for kubeconfig secrets or VPN tunneling
- Leverages your existing kubectl configuration
- More secure (runner is on your controlled infrastructure)

No manual Docker or kubectl commands needed after initial setup!
