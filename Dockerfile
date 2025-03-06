# Use official Node.js v22.12.0 image
FROM node:22.12.0

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project (including server.js) to the container
COPY . .

# Expose port 5000 (matching Express server)
EXPOSE 8000

# Start the application
CMD ["node", "Start"]
