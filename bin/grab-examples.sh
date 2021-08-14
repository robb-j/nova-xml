#!/usr/bin/env bash

#
# A bit of a hack, but useful to test XML schemas, this script:
# - looks for syntax and completion XML files from inside nova.app
# - copies them into folders inside the examples directory
# - adds xmlns attributes to <syntax> and <completions> elements
#

mkdir -p examples/syntaxes
mkdir -p examples/completions

cp /Applications/Nova.app/Contents/SharedSupport/Extensions/*.novaextension/Syntaxes/*.xml examples/syntaxes
cp /Applications/Nova.app/Contents/SharedSupport/Extensions/*.novaextension/Completions/*.xml examples/completions

# for FILE in examples/syntaxes/*.xml
# do
#   sed -i '' -E 's/<syntax(.*)>/<syntax\1 xmlns="https:\/\/www.nova.app\/syntax">/' $FILE
# done

# Add a the syntax namespace to syntax files
sed -i '' -E 's/<syntax(.*)>/<syntax\1 xmlns="https:\/\/www.nova.app\/syntax">/' examples/syntaxes/*.xml

# Add a the completions namespace to completions files
sed -i '' -E 's/<completions(.*)>/<completions\1 xmlns="https:\/\/www.nova.app\/completions">/' examples/completions/*.xml
