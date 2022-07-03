#!/usr/bin/env sh

set -e

OS=osx-x86_64
VERSION=0.21.0
URL=https://github.com/redhat-developer/vscode-xml/releases/download/$VERSION/lemminx-$OS.zip

DIR=`dirname $0`/../XML.novaextension/bin

echo "Fetching server..."
curl -sfL $URL > $DIR/lemminx.zip

echo "Unzipping..."
unzip $DIR/lemminx.zip -d $DIR

echo "Cleaning..."
rm $DIR/lemminx.zip
