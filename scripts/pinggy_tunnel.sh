#!/bin/bash
while true; do
  echo "[$(date)] Starting Pinggy tunnel..."
  ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -p 443 -R0:localhost:3001 a.pinggy.io
  echo "[$(date)] Pinggy disconnected. Reconnecting in 2s..."
  sleep 2
done
