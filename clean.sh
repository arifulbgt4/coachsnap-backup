 
#!/bin/bash

# !!! WARNING!!!
# removes all of these folders recursively
# use with caution
# use from only this directory
# run with "bash clean.sh"

declare -a StringArray=("build" "node_modules" "dist" ".cache")

for folderName in ${StringArray[@]}; do
  find . -name $folderName -type d -prune -exec rm -rf '{}' +
done