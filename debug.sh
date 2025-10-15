#!/bin/bash

echo "=========================================="
echo "Debugging AILab Frontend 502 Error"
echo "=========================================="
echo ""

echo "1. Checking pods in ailab-frontend namespace:"
kubectl get pods -n ailab-frontend -o wide
echo ""

echo "2. Checking pod logs:"
kubectl logs -n ailab-frontend -l app=ailab-frontend --tail=20
echo ""

echo "3. Checking service:"
kubectl get svc -n ailab-frontend
echo ""

echo "4. Checking service endpoints:"
kubectl get endpoints -n ailab-frontend
echo ""

echo "5. Checking ingress:"
kubectl get ingress -n ailab-frontend
kubectl describe ingress ailab-frontend -n ailab-frontend
echo ""

echo "6. Checking ingress controller:"
kubectl get pods -n ailab-frontend -l app.kubernetes.io/component=controller
echo ""

echo "7. Checking ingress controller logs (last 30 lines):"
kubectl logs -n ailab-frontend -l app.kubernetes.io/component=controller --tail=30
echo ""

echo "8. Testing direct connection to pod (if possible):"
POD_NAME=$(kubectl get pods -n ailab-frontend -l app=ailab-frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
if [ -n "$POD_NAME" ]; then
    echo "Testing connection to pod $POD_NAME on port 80:"
    kubectl exec -n ailab-frontend "$POD_NAME" -- curl -s -o /dev/null -w "%{http_code}" http://localhost:80 || echo "Failed to connect"
else
    echo "No pods found"
fi
echo ""

echo "=========================================="
echo "Debug complete!"
echo "=========================================="
