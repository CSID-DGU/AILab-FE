#!/bin/bash

echo "Starting port forwarding for ailab-frontend..."
echo "Access the application at: http://210.94.179.19:9775"
echo "Press Ctrl+C to stop"

kubectl port-forward -n ailab-frontend service/ailab-frontend 9775:9775 --address=0.0.0.0
