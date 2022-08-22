#!/bin/bash
DIR=`dirname $0`
SCRIPT=`basename $0 | tr abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ`
APPDIR=$DIR/..

echo $SCRIPT: BEGIN `date`
NGINX_FILE=nginx-scv-server.conf
NGINX_CONF=$APPDIR/local/$NGINX_FILE

cat > $NGINX_CONF <<NGINX_HEREDOC
server {
    listen       80;
    server_name  SERVERNAME;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        proxy_pass http://localhost:8080; # scv-server Docker container
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

}
NGINX_HEREDOC

SERVERNAME=$*
if [ "$SERVERNAME" == "" ]; then
  echo $SCRIPT: Configuring $NGINX_FILE
  read -p "$SCRIPT => Enter server_name (localhost): " SERVERNAME
  if [ "$SERVERNAME" == "" ]; then
    SERVERNAME=localhost
  fi
fi
sed -i -e "s/SERVERNAME/$SERVERNAME/" $NGINX_CONF
DST=/etc/nginx/conf.d/$NGINX_FILE
sudo cp $NGINX_CONF $DST

echo $SCRIPT: NGINX reverse-proxy configuration copied to:
echo "$SCRIPT:   $DST"

echo $SCRIPT: END `date`