#!/bin/bash

npm run build
git add .
read -p "Enter commit message: " commitMessage
git commit -m "$commitMessage"
git push
