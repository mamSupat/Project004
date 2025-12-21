#!/bin/bash
set -e
cd /var/app/current
npm ci --production
npm run build
