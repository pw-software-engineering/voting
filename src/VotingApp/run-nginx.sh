#!/bin/sh

NGINX_ROOT=/usr/share/nginx/html
JS_FILE=$NGINX_ROOT/app.js
echo "seeding ${API_BASE_URL}"
sed -i "s|\${API_BASE_URL}|$API_BASE_URL|g" $JS_FILE
cat $JS_FILE
exec nginx -g 'daemon off;'