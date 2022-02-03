# Get latest node image
FROM node:latest

# Set workiing directory
WORKDIR /opt/app/

# Copy our source file o the docker image
COPY src ./

# Start our musician script
ENTRYPOINT ["node", "auditor.js"]