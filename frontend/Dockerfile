# Use an official Node.js 23 Alpine image
FROM node:23-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose port 3000 for the frontend
EXPOSE 3000

# Start the application using development server for hot reloading
CMD ["npm", "run", "start"]