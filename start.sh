#!/bin/sh

# Substitute PORT environment variable in nginx config
sed -i "s/listen 8080;/listen ${PORT:-8080};/g" /etc/nginx/nginx.conf

# Start nginx
nginx -g 'daemon off;'
