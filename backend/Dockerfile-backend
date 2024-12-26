# Use an official Node.js 23 Alpine image
FROM node:23-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend application
COPY . .

# Expose the port the app runs on
EXPOSE 9000

# Start the application
CMD ["npm", "start"]