# Stage 1: Build the Angular application
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies based on lock file
COPY package*.json ./
RUN npm ci

# Copy source and build for production
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve the built app with Nginx
FROM nginx:1.27-alpine

# Copy compiled assets from the build stage
COPY --from=build /app/dist/uvedomlenie/browser /usr/share/nginx/html

# Expose the default Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
