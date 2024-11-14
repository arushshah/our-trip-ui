# Step 1: Build the Vite app using Node.js
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock if you are using Yarn)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the Vite app for production (this creates a 'dist' folder with static assets)
RUN npm run build

# Step 2: Serve the built app using Nginx
FROM nginx:alpine

# Copy the build output from the previous stage into the Nginx server's root directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (default HTTP port)
EXPOSE 80

# Start Nginx in the foreground (so the container keeps running)
CMD ["nginx", "-g", "daemon off;"]