# Step 1: Build the React app
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code and build the app
COPY . .
RUN npm run build

# Step 2: Serve the React app with "serve"
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

# Copy the build output
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/build ./build

# Expose port 3000
EXPOSE 3000

# Serve the build directory
CMD ["serve", "-s", "build", "-l", "3000"]