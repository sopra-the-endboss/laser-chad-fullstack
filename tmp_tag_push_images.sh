#!/bin/bash

# This script can be used to tag and push images built locally
# You have to be logged in with docker login
# In order to work, the images must first be built locally, from a directory called "laser-chad-fullstack"
# If have to adjust USER= to the currently logged in user

# Define the tag you want to use for all images
USER="darnol"
TAG="deliverable2.0"

# List of your Docker images
IMAGES=(
    "laser-chad-fullstack-frontend" 
    "laser-chad-fullstack-apig-main" 
    "laser-chad-fullstack-apig-id-share" 
    "laser-chad-fullstack-options_lambda_function"
    "laser-chad-fullstack-cart" 
    "laser-chad-fullstack-cart-debugger"
    "laser-chad-fullstack-product-microservice"
    "laser-chad-fullstack-product-microservice-debugger"
)  

# Loop through each image, tag it, and push it
for image in "${IMAGES[@]}"; do
    image_new="${image/"-fullstack"}"
    echo $image_new
    # docker tag $image $USER/$image_new:$TAG
    # docker push $USER/$image_new:$TAG
done