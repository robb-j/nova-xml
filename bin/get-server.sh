#!/usr/bin/env sh

set -e

# URL=https://github.com/redhat-developer/vscode-xml/releases/download/0.29.0/lemminx-osx-aarch_64.zip
URL=https://github.com/redhat-developer/vscode-xml/releases/download/0.29.0/lemminx-osx-x86_64.zip

DIR=`dirname $0`/../XML.novaextension/bin

echo "Fetching server..."
curl -sfL $URL > $DIR/lemminx.zip

echo "Unzipping..."
unzip $DIR/lemminx.zip -d $DIR

echo "Cleaning..."
rm $DIR/lemminx.zip
