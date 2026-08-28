#!/bin/bash
while true; do
  echo "[$(date)] Starting localhost.run tunnel..."
  ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=10 -o ServerAliveCountMax=3 -R 80:localhost:3001 nokey@localhost.run
  echo "[$(date)] Tunnel disconnected. Reconnecting in 2 seconds..."
  sleep 2
done
