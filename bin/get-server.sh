#!/usr/bin/env sh

set -e

VERSION=0.29.0

# URL=https://github.com/redhat-developer/vscode-xml/releases/download/0.29.0/lemminx-osx-aarch_64.zip

# URL=https://github.com/redhat-developer/vscode-xml/releases/download/0.29.0/lemminx-osx-x86_64.zip

DIR=`dirname $0`/../XML.novaextension/bin

mkdir -p temp $DIR

echo "Fetching arm64 binary …"
curl -sfL "https://github.com/redhat-developer/vscode-xml/releases/download/$VERSION/lemminx-osx-aarch_64.zip" > temp/aarch64.zip
unzip  -d temp temp/aarch64.zip

echo "Fetching amd64 binary …"
curl -sfL "https://github.com/redhat-developer/vscode-xml/releases/download/$VERSION/lemminx-osx-x86_64.zip" > temp/amd64.zip
unzip -d temp temp/amd64.zip

echo "Merging …"
lipo -create temp/lemminx-osx-x86_64 temp/lemminx-osx-aarch_64 -output XML.novaextension/bin/lemminx-universal

echo "Cleaning…"
rm -r temp 
