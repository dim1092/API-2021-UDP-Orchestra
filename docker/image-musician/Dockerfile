# Get latest node image
FROM node:latest

# Set workiing directory
WORKDIR /opt/app

# Copy our source file o the docker image
COPY src ./

# Install Node modules
RUN npm install

# Start our musician script
ENRYPOINT ["node", "musician.js"]