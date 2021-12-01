#!/bin/bash

NGINX_ROOT=/usr/share/nginx/html
JS_FILE=$NGINX_ROOT/app.js

sed -i "s|\${API_BASE_URL}|$API_BASE_URL|g" $JS_FILE

exec nginx -g 'daemon off;'