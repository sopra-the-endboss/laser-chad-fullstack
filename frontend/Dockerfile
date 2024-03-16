# Use a specific version of node as the base image for the build stage
FROM node:21.7.1-slim AS build-stage

# Set the working directory in the container
WORKDIR /app

# Execute the curl command to install AWS Amplify CLI
RUN npm install -g @aws-amplify/cli

# copy package.json
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

# Copy the rest of your source code to the container
COPY . .

# Build the app which will create the production build in the /app/build directory
RUN npm run build

# Start a new stage to create a lightweight production image
FROM node:21.7.1-slim

# Set the working directory in the container for the production image
WORKDIR /app

# Install 'serve' - a static server that will serve our React app
RUN npm install -g serve

# Copy the built application from the build-stage to the current stage's working directory
COPY --from=build-stage /app/build /app

# Expose port 3000 for the container
EXPOSE 3000

# Start the serve command to serve the static files on port 3000
CMD ["serve", "-s", ".", "-l", "3000"]
