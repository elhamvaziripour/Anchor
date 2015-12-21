#!/bin/sh
set -e
# install mitmproxy and requirements 
clear
[ "$(whoami)" != "root" ] && exec su - root -- "$0" "$@"
#sudo yum update
sudo yum install python-pip
echo "step#1: system updated and pip installed!"
sudo yum install -y python-devel libffi-devel libxml2-devel libxslt1-devel 
sudo pip install simplejson 
#sudo pip install libssl-devel
sudo pip install netlib
pip install construct 
sudo pip install mitmproxy
sudo -c "yum install nss-tools"
echo "step#2: mitmproxy and its requirements have been installed!"
certutil -d sql:$HOME/.pki/nssdb -A -t "CT,c,c" -n "mitmproxy - mitmproxy" -i ~/.mitmproxy/mitmproxy-ca.pem
echo "step#3 Cert has been imported and authorized"
DIR="$( cd "$( dirname "$0" )" && pwd )"
TARGET_DIR="/etc/opt/chrome/native-messaging-hosts"
HOST_NAME=com.anchor
echo "step#4 Host has been located"
# Create directory to store native messaging host.
mkdir -p "$TARGET_DIR"
# Copy native messaging host manifest.
cp "$DIR/$HOST_NAME.json" "$TARGET_DIR"
cp -r "$DIR/keys" "$TARGET_DIR"
cp "serversigned.php" "/var/www/html/"
echo "step#5 The test sever located"
# Update host path in the manifest.
HOST_PATH=$DIR/native-messaging-example-host
ESCAPED_HOST_PATH=${HOST_PATH////\\/}
sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$TARGET_DIR/$HOST_NAME.json"
# Set permissions for the manifest so that all users can read it.
chmod o+r "$TARGET_DIR/$HOST_NAME.json"
echo "Native messaging host $HOST_NAME has been installed."
echo "For some eason unfortunately you need to run Google-chrom as root"
printf '''exec -a "$0" "$HERE/chrome"  "$PROFILE_DIRECTORY_FLAG" \
  "$@" --user-data-dir "/root/.config/google-chrome"
\n''' >> /usr/bin/google-chrome
echo "step#6 Google-chrome can be run as root now! Next step: Add the app to googl chrome extension packages"


